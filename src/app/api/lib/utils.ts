// app/api/lib/utils.ts

import mongoose from 'mongoose';
import { MongoDbFolStore } from 'fol-sdk';

// ✅ 메모리 저장소 (실제로는 Redis 사용 권장)
export const nonces: { [key: string]: string } = {};

// ✅ 올바른 전역 변수 사용
declare global {
  var folStoreInstance: MongoDbFolStore | undefined;
}

export function getFolStore(): MongoDbFolStore {
  if (!global.folStoreInstance) {
    // 🔧 개발 환경에서 기존 Mongoose 모델들 정리
    if (process.env.NODE_ENV === 'development') {
      try {
        // 기존 모델들 삭제
        if (mongoose.models.Constant) {
          delete mongoose.models.Constant;
        }
        if (mongoose.models.Fact) {
          delete mongoose.models.Fact;
        }
        if (mongoose.models.Predicate) {
          delete mongoose.models.Predicate;
        }
        
        console.log('🧹 Cleared existing Mongoose models for development');
      } catch (error) {
        console.log('⚠️ Error clearing models (this is usually fine):', error);
      }
    }
    
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';
    global.folStoreInstance = new MongoDbFolStore(mongoUrl);
  }
  return global.folStoreInstance;
}