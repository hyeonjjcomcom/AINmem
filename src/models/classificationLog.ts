import mongoose, { Document, Schema } from 'mongoose';

// 개별 시도 정보
export interface ClassificationAttempt {
  attemptNumber: number;
  llmRequest: {
    model: string;
    prompt: string;
    maxTokens: number;
  };
  llmResponse?: any; // LLM의 전체 응답 (raw)
  extractedCategory?: string; // LLM이 반환한 카테고리 문자열
  isValid: boolean; // 유효한 카테고리인지 여부
  error?: string; // 에러 발생 시
  timestamp: Date;
}

// ClassificationLog 인터페이스 정의
export interface ClassificationLog extends Document {
  documentId: string; // 분류 대상 ChatLog의 _id
  inputText: string; // 분류할 입력 텍스트
  attempts: ClassificationAttempt[]; // 시도 내역 (최대 2회)
  finalCategory?: string; // 최종 분류된 카테고리
  status: 'success' | 'failed' | 'partial'; // 전체 처리 상태
  createdAt: Date;
  updatedAt: Date;
}

// ClassificationLog 스키마 정의
const ClassificationLogSchema: Schema = new Schema({
  documentId: {
    type: String,
    required: true,
    index: true
  },
  inputText: {
    type: String,
    required: true
  },
  attempts: [{
    attemptNumber: {
      type: Number,
      required: true
    },
    llmRequest: {
      model: String,
      prompt: String,
      maxTokens: Number
    },
    llmResponse: {
      type: Schema.Types.Mixed
    },
    extractedCategory: {
      type: String
    },
    isValid: {
      type: Boolean,
      required: true
    },
    error: {
      type: String
    },
    timestamp: {
      type: Date,
      required: true
    }
  }],
  finalCategory: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    required: true
  }
}, {
  timestamps: true
});

// 인덱스 설정
ClassificationLogSchema.index({ documentId: 1 });
ClassificationLogSchema.index({ status: 1 });
ClassificationLogSchema.index({ createdAt: -1 });

// 모델 생성
export default mongoose.models.ClassificationLog ||
  mongoose.model<ClassificationLog>('ClassificationLog', ClassificationLogSchema);
