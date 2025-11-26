import mongoose, { Document, Schema } from 'mongoose';

// ChatLog 인터페이스 정의
export interface ChatLog extends Document {
  user_id: string;
  session_id: string;
  turn_number: number;
  input_text: string;
  input_metadata?: any; // Mixed type
  input_type?: string;
  model_response?: string;
  response_type?: string;
  model_version?: string;
  latency?: number;
  is_successful?: boolean;
  error_message?: string;
  feedback?: string;
  tags?: string[];
  tokens_input?: number;
  tokens_output?: number;
  buildAt?: Date;
}

// ChatLog 스키마 정의
const ChatLogSchema: Schema = new Schema({
  user_id: {
    type: String,
    required: true,
    trim: true
  },
  session_id: {
    type: String,
    required: true,
    trim: true
  },
  turn_number: {
    type: Number,
    required: true,
    min: 1
  },
  input_text: {
    type: String,
    required: true
  },
  input_metadata: {
    type: Schema.Types.Mixed,
    default: null
  },
  input_type: {
    type: String,
    trim: true
  },
  model_response: {
    type: String
  },
  response_type: {
    type: String,
    trim: true
  },
  model_version: {
    type: String,
    trim: true
  },
  latency: {
    type: Number,
    min: 0
  },
  is_successful: {
    type: Boolean,
    default: true
  },
  error_message: {
    type: String
  },
  feedback: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  },
  tokens_input: {
    type: Number,
    min: 0
  },
  tokens_output: {
    type: Number,
    min: 0
  },
  buildAt: {
    type: Date
  }
}, {
  timestamps: true, // createdAt, updatedAt 자동 추가
  strict: false     // 나중에 새 필드 추가를 허용
});

// 인덱스 설정 (성능 최적화)
ChatLogSchema.index({ user_id: 1 });
ChatLogSchema.index({ session_id: 1 });
ChatLogSchema.index({ createdAt: -1 }); // 최신순 정렬용
ChatLogSchema.index({ user_id: 1, session_id: 1 }); // 복합 인덱스
ChatLogSchema.index({ user_id: 1, buildAt: 1 }); // Delta build 쿼리 최적화용

// 모델 생성 (이미 존재하면 기존 모델 사용)
export default mongoose.models.ChatLog || mongoose.model<ChatLog>('ChatLog', ChatLogSchema);