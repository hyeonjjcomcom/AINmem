// pages/api/users/route.ts
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/users';

export async function POST(request: Request) {
  // 1. DB 연결
  await connectDB();
  
  const { user_address, email, nickname } = await request.json();
  
  try {
    // 2. 모델을 사용해 데이터 생성
    const user = await User.create({
      user_address,
      email,
      nickname
    });
    
    return Response.json({ 
      success: true, 
      user: {
        id: user._id,
        user_address: user.user_address,
        email: user.email,
        nickname: user.nickname
      }
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return Response.json({ 
        error: '이미 존재하는 사용자입니다' 
      }, { status: 400 });
    }
    
    return Response.json({ 
      error: '사용자 생성 실패' 
    }, { status: 500 });
  }
}

// GET 메소드 추가
export async function GET() {
  await connectDB();
  
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return Response.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    return Response.json({ 
      error: '사용자 목록 조회 실패' 
    }, { status: 500 });
  }
}