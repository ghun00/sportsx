# 스포츠엑스 (SportsX)

해외 스포츠 산업의 흐름을 한국어로 읽다. 스포츠 커리어를 위한 지식 허브.

## 🚀 시작하기

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── _data/             # 정적 데이터
│   │   └── articles.json  # 아티클 목업 데이터
│   ├── articles/[id]/     # 아티클 상세 페이지
│   ├── login/             # 로그인 페이지
│   ├── me/                # 마이페이지
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   └── not-found.tsx      # 404 페이지
├── components/            # 재사용 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── AppBar.tsx        # 앱바
│   ├── ArticleCard.tsx   # 아티클 카드
│   ├── CategoryChips.tsx # 카테고리 칩
│   ├── Hero.tsx          # 히어로 섹션
│   └── LikeButton.tsx    # 좋아요 버튼
└── lib/                  # 유틸리티 함수
    ├── articles.ts       # 아티클 관련 함수
    ├── likes.ts          # 좋아요 관련 함수
    └── utils.ts          # 공통 유틸리티
```

## 🎨 디자인 시스템

### 컬러 토큰
- `--bg`: #0A1A2F (다크 배경)
- `--panel`: #0E223D (패널 배경)
- `--text`: #E0E0E0 (본문 텍스트)
- `--muted`: #9AA4AF (보조 텍스트)
- `--blue`: #2F80ED (프리미엄 블루)
- `--border`: #1F3147 (테두리)

### 반응형 그리드
- Mobile: 1열
- Tablet: 2열
- Desktop: 3열
- Wide: 4열

## ✨ 주요 기능

### 완료된 기능
- ✅ 다크 테마 기본 적용
- ✅ 프리미엄 블루 포인트 컬러 시스템
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)
- ✅ 카드형 아티클 아카이브
- ✅ 아티클 상세 페이지
- ✅ 카테고리 필터링 (클라이언트 사이드)
- ✅ 좋아요 UI (로컬 상태, localStorage)
- ✅ 원문 링크 버튼 (새 탭 열기)
- ✅ 로그인 페이지 (카카오 버튼 UI)
- ✅ 마이페이지 (좋아요한 글 목록)
- ✅ 접근성 고려 (alt 텍스트, aria-label 등)

### 데이터 구조
- 정적 목업 데이터 (`app/_data/articles.json`)
- localStorage 기반 좋아요 관리
- 카테고리별 필터링
- 출판일 기준 정렬

## 🔧 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript
- **Package Manager**: npm

## 📱 반응형 스크린샷

### Mobile (390px)
- 1열 그리드 레이아웃
- 터치 친화적 버튼 크기
- 스와이프 가능한 카테고리 칩

### Tablet (768px)
- 2열 그리드 레이아웃
- 사이드바 없는 깔끔한 레이아웃

### Desktop (1280px)
- 3열 그리드 레이아웃
- 최적화된 읽기 경험

### Wide (1920px)
- 4열 그리드 레이아웃
- 넓은 화면 활용

## 🚧 향후 작업 (TODO)

### 우선순위 높음
- [ ] 카카오 SDK 연동 → `/login`
- [ ] Firebase 연동으로 좋아요 저장을 사용자 기반으로 전환
- [ ] SEO 개선 (OG 이미지 생성, 메타데이터 최적화)
- [ ] 카테고리 라우팅 (`/category/[name]`)

### 우선순위 중간
- [ ] 에디터/어드민 업로드 시스템
- [ ] 검색 기능
- [ ] 무한 스크롤 또는 페이지네이션
- [ ] 댓글 시스템
- [ ] 구독 기능

### 우선순위 낮음
- [ ] 다국어 지원
- [ ] PWA 기능
- [ ] 오프라인 지원
- [ ] 푸시 알림

## 🔍 접근성

- Lighthouse 접근성 점수 90+ 목표
- 대체 텍스트 (alt) 제공
- 적절한 명도 대비
- 키보드 네비게이션 지원
- 스크린 리더 호환성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**스포츠엑스** - 해외 스포츠 산업의 흐름을 한국어로 읽다