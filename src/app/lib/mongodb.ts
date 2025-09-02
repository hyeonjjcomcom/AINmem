import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI 환경변수를 설정해주세요');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Next.js 개발 모드에서 연결 재사용을 위한 캐싱
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // 이미 연결되어 있으면 기존 연결 사용
  if (cached!.conn) {
    return cached!.conn;
  }

  // 연결 중이면 대기
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached!.conn = await cached!.promise;
    console.log('MongoDB 연결 성공');
    return cached!.conn;
  } catch (e) {
    cached!.promise = null;
    console.error('MongoDB 연결 실패:', e);
    throw e;
  }
}

export default connectDB;