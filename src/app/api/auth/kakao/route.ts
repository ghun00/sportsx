import { NextRequest, NextResponse } from 'next/server';

const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

// 카카오 인증 URL 생성
export async function GET() {
  try {
    if (!KAKAO_CLIENT_ID || !REDIRECT_URI) {
      return NextResponse.json(
        { error: '카카오 설정이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=profile_nickname,account_email`;
    
    return NextResponse.json({ 
      authUrl: kakaoAuthUrl 
    });
  } catch (error) {
    console.error('카카오 인증 URL 생성 실패:', error);
    return NextResponse.json(
      { error: '인증 URL 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 카카오 인증 코드를 토큰으로 교환
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: '인증 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🔍 환경 변수 확인...');
    console.log('🔍 KAKAO_CLIENT_ID:', KAKAO_CLIENT_ID ? '설정됨' : '없음');
    console.log('🔍 KAKAO_CLIENT_SECRET:', KAKAO_CLIENT_SECRET ? '설정됨' : '없음');
    console.log('🔍 REDIRECT_URI:', REDIRECT_URI);

    if (!KAKAO_CLIENT_ID || !KAKAO_CLIENT_SECRET || !REDIRECT_URI) {
      console.error('❌ 환경 변수 누락');
      return NextResponse.json(
        { error: '카카오 설정이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    // 1. 인증 코드로 액세스 토큰 요청
    console.log('🔍 토큰 요청 시작...');
    console.log('🔍 Client ID:', KAKAO_CLIENT_ID);
    console.log('🔍 Redirect URI:', REDIRECT_URI);
    console.log('🔍 Code:', code.substring(0, 10) + '...');
    
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        client_secret: KAKAO_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    });

    console.log('🔍 토큰 응답 상태:', tokenResponse.status);
    console.log('🔍 토큰 응답 헤더:', Object.fromEntries(tokenResponse.headers.entries()));

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ 토큰 요청 실패:', errorData);
      return NextResponse.json(
        { error: `토큰 요청에 실패했습니다: ${errorData}` },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // 2. 액세스 토큰으로 사용자 정보 요청
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('사용자 정보 요청 실패');
      return NextResponse.json(
        { error: '사용자 정보 요청에 실패했습니다.' },
        { status: 400 }
      );
    }

    const userData = await userResponse.json();
    console.log('🔍 카카오 사용자 정보:', userData);

    // 3. 사용자 정보 정리
    const userInfo = {
      id: userData.id,
      nickname: userData.kakao_account?.profile?.nickname || '익명',
      email: userData.kakao_account?.email || null, // 이메일 동의하지 않은 경우 null
      profileImage: userData.kakao_account?.profile?.profile_image_url || null,
      accessToken: access_token,
    };
    
    console.log('🔍 정리된 사용자 정보:', userInfo);
    console.log('🔍 이메일 정보:', userInfo.email ? '있음' : '없음');

    return NextResponse.json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    console.error('카카오 로그인 처리 실패:', error);
    return NextResponse.json(
      { error: '로그인 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
