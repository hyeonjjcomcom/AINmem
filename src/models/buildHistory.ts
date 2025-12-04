import mongoose, { Document, Schema } from 'mongoose';

// BuildHistory 인터페이스 정의
export interface BuildHistory extends Document {
  user_id: string;
  chunk_index: number;
  document: string; // 입력 document (input_text들을 join한 것)
  memory_ids: mongoose.Types.ObjectId[]; // 이 청크에 포함된 메모리 _id 배열
  token_count: number; // 청크의 토큰 수
  message_count: number; // 청크에 포함된 메시지 수
  build_type: 'incremental' | 'full'; // 빌드 타입
  status: 'success' | 'failed'; // 빌드 상태
  error_message?: string; // 실패 시 에러 메시지
  generated_constants_count: number; // 생성된 constant 개수
  generated_facts_count: number; // 생성된 fact 개수
  generated_predicates_count: number; // 생성된 predicate 개수
  generated_constant_ids: mongoose.Types.ObjectId[]; // 생성된 constant ID 배열
  generated_fact_ids: mongoose.Types.ObjectId[]; // 생성된 fact ID 배열
  generated_predicate_ids: mongoose.Types.ObjectId[]; // 생성된 predicate ID 배열
  build_duration_ms?: number; // 빌드 소요 시간 (밀리초)
  createdAt?: Date;
  updatedAt?: Date;
}

// BuildHistory 스키마 정의
const BuildHistorySchema: Schema = new Schema({
  user_id: {
    type: String,
    required: true,
    trim: true
  },
  chunk_index: {
    type: Number,
    required: true,
    min: 1
  },
  document: {
    type: String,
    required: true
  },
  memory_ids: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: []
  },
  token_count: {
    type: Number,
    required: true,
    min: 0
  },
  message_count: {
    type: Number,
    required: true,
    min: 1
  },
  build_type: {
    type: String,
    enum: ['incremental', 'full'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  error_message: {
    type: String
  },
  generated_constants_count: {
    type: Number,
    default: 0,
    min: 0
  },
  generated_facts_count: {
    type: Number,
    default: 0,
    min: 0
  },
  generated_predicates_count: {
    type: Number,
    default: 0,
    min: 0
  },
  generated_constant_ids: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  generated_fact_ids: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  generated_predicate_ids: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  build_duration_ms: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true, // createdAt, updatedAt 자동 추가
  strict: true
});

// 인덱스 설정 (성능 최적화)
BuildHistorySchema.index({ user_id: 1 });
BuildHistorySchema.index({ user_id: 1, createdAt: -1 }); // 최신순 정렬용
BuildHistorySchema.index({ user_id: 1, build_type: 1 });
BuildHistorySchema.index({ status: 1 });

// 모델 생성 (이미 존재하면 기존 모델 사용)
export default mongoose.models.BuildHistory || mongoose.model<BuildHistory>('BuildHistory', BuildHistorySchema);
