import { NextRequest, NextResponse } from 'next/server';
import { getKakaoUsers } from '@/lib/kakao-api';
import { UserService } from '@/services/userService';

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인 (필요시 추가)
    // const { user } = await getServerSession(authOptions);
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getKakaoUsers(limit, offset);
    
    // Firebase에서 모든 사용자 정보 가져오기
    const firebaseUsers = await UserService.getAllUsers({ limit: 1000 });
    
    // 카카오 사용자 ID와 Firebase 사용자 매칭
    const enrichedUsers = result.users.map(kakaoUser => {
      const firebaseUser = firebaseUsers.users.find(fbUser => fbUser.id === kakaoUser.id.toString());
      
      return {
        ...kakaoUser,
        firebase_data: firebaseUser ? {
          email: firebaseUser.email,
          nickname: firebaseUser.nickname,
          profileImage: firebaseUser.profileImage,
          createdAt: firebaseUser.createdAt,
          lastLoginAt: firebaseUser.lastLoginAt,
          isActive: firebaseUser.isActive,
          career_stage: firebaseUser.career_stage,
          interests: firebaseUser.interests,
          usage_purpose: firebaseUser.usage_purpose
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      total_count: result.total_count,
      limit,
      offset
    });
  } catch (error) {
    console.error('카카오 사용자 조회 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '카카오 사용자 정보를 가져올 수 없습니다.',
      users: [],
      total_count: 0
    }, { status: 500 });
  }
}
