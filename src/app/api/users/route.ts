// pages/api/users/route.ts
import connectDB from '@/lib/mongodb';
import User from '@/models/users';

export async function POST(request: Request) {
  // 1. DB 연결
  await connectDB();

  const { user_address, email, nickname } = await request.json();

  try {
    // 2. upsert: 있으면 업데이트, 없으면 생성
    const user = await User.findOneAndUpdate(
      { user_address }, // 검색 조건
      {
        user_address,
        ...(email !== null && { email }),
        ...(nickname !== null && { nickname })
      },
      {
        upsert: true, // 없으면 생성
        new: true, // 업데이트된 문서 반환
        setDefaultsOnInsert: true // insert 시 기본값 설정
      }
    );

    return Response.json({
      success: true,
      user: {
        user_address: user.user_address,
        email: user.email,
        nickname: user.nickname
      }
    });
  } catch (error: any) {
    console.error('❌ POST /api/users error:', error);
    console.error('❌ error.message:', error?.message);
    console.error('❌ error.stack:', error?.stack);
    return Response.json({
      error: '사용자 처리 실패'
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