// 카카오 REST API 관련 유틸리티

interface KakaoUser {
  id: number;
  connected_at: string;
  properties: {
    nickname: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account: {
    email?: string;
    email_verified?: boolean;
    name?: string;
    phone_number?: string;
    phone_number_verified?: boolean;
    profile?: {
      nickname: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
}

interface KakaoUserListResponse {
  users: KakaoUser[];
  total_count: number;
}

// 카카오 Admin 키 (환경변수에서 가져오기)
const KAKAO_ADMIN_KEY = process.env.KAKAO_ADMIN_KEY;

if (!KAKAO_ADMIN_KEY) {
  console.warn('⚠️ KAKAO_ADMIN_KEY가 설정되지 않았습니다.');
}

/**
 * 카카오 REST API를 통해 앱에 가입한 사용자 목록 조회
 */
export async function getKakaoUsers(limit: number = 100, offset: number = 0): Promise<KakaoUserListResponse> {
  if (!KAKAO_ADMIN_KEY) {
    throw new Error('KAKAO_ADMIN_KEY가 설정되지 않았습니다.');
  }

  try {
    const response = await fetch('https://kapi.kakao.com/v1/user/ids', {
      method: 'GET',
      headers: {
        'Authorization': `KakaoAK ${KAKAO_ADMIN_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('카카오 API 응답 오류:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`카카오 API 요청 실패: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const apiResponse = await response.json();
    console.log('카카오 API 응답:', apiResponse);
    
    // 카카오 API 응답에서 elements 속성 사용
    const userIds = apiResponse.elements || [];
    console.log('사용자 ID 목록:', userIds);
    console.log('사용자 수:', userIds.length);
    
    if (!userIds || userIds.length === 0) {
      console.log('사용자 ID가 없습니다.');
      return { users: [], total_count: 0 };
    }

    // 사용자 ID 목록을 기본 정보로 변환
    const users = userIds
      .slice(offset, offset + limit)
      .map((id: number) => ({
        id: id,
        connected_at: new Date().toISOString(), // 정확한 가입일은 개별 조회 필요
        properties: {
          nickname: `사용자_${id}`,
          profile_image: undefined,
          thumbnail_image: undefined
        },
        kakao_account: {
          email: undefined,
          email_verified: false,
          name: undefined,
          phone_number: undefined,
          phone_number_verified: false,
          profile: {
            nickname: `사용자_${id}`,
            profile_image_url: undefined,
            thumbnail_image_url: undefined
          }
        }
      }));
    
    console.log('생성된 사용자 데이터:', users);
    console.log('반환할 사용자 수:', users.length);
    
    return {
      users: users,
      total_count: userIds.length
    };
  } catch (error) {
    console.error('카카오 사용자 목록 조회 실패:', error);
    throw new Error('카카오 사용자 목록을 가져올 수 없습니다.');
  }
}


export type { KakaoUser, KakaoUserListResponse };
