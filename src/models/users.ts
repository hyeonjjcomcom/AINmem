import mongoose, { Document, Schema } from 'mongoose';

// 사용자 인터페이스 정의
export interface User extends Document {
  user_address: string;
  email: string | null;
  nickname: string | null;
  // 나중에 추가될 필드들을 위한 확장 가능한 구조
  createdAt?: Date;
  updatedAt?: Date;
}

// 사용자 스키마 정의
const UserSchema: Schema = new Schema({
  user_address: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  nickname: {
    type: String,
    trim: true
  }
}, {
  timestamps: true, // createdAt, updatedAt 자동 추가
  strict: false     // 나중에 새 필드 추가를 허용
});

// 인덱스 설정 (성능 최적화)
UserSchema.index({ user_address: 1 });

// 모델 생성 (이미 존재하면 기존 모델 사용)
export default mongoose.models.User || mongoose.model<User>('User', UserSchema);