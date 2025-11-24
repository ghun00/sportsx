'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import AppBar from '@/components/AppBar';
import Toast from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { JobItem, JobType } from '@/types';
import {
  trackJobsViewed,
  trackJobsSortChanged,
  trackJobCardClicked,
  trackJobSavedClicked,
  trackLoginPromptShown,
  trackSaveSuccess,
  trackSavedDrawerOpened,
} from '@/lib/analytics';
import { ArrowUpRight, Bookmark, BookmarkCheck, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobsLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => Promise<void>;
  isLoading: boolean;
}

function JobsLoginModal({ open, onClose, onLogin, isLoading }: JobsLoginModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => setIsContentVisible(true), 100);
    } else {
      setIsContentVisible(false);
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [open]);

  if (!open && !isVisible) return null;

  const handleBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'w-full max-w-md rounded-3xl border border-[#1B3042] bg-[#091926] shadow-2xl transition-all duration-300 transform overflow-hidden',
          isContentVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091926]"
          aria-label="로그인 모달 닫기"
        >
          ✕
        </button>

        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <Image
              src="https://github.com/ghun00/sportsx/blob/main/public/tiger.png?raw=true"
              alt="스포츠엑스 마스코트"
              width={180}
              height={180}
              className={cn(
                'transition-all duration-500',
                isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              )}
            />
          </div>

          <div className="text-center space-y-3 mb-8">
            <h2
              className={cn(
                'text-2xl sm:text-3xl font-bold tracking-tight text-white',
                isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              )}
            >
              로그인하면 마감 전 알림을 드려요!
            </h2>
            <p
              className={cn(
                'text-sm sm:text-base leading-6 text-white/70',
                isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              )}
            >
              저장한 공고는 커리어 비서가 D-3에 챙겨드립니다.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091926]',
                isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
                isLoading ? 'cursor-not-allowed opacity-80' : 'hover:scale-[1.02]'
              )}
              style={{
                backgroundColor: '#FEE500',
                color: '#111827',
                padding: '16px 14px',
                fontSize: '16px',
              }}
            >
              <Image
                src="https://github.com/ghun00/sportsx/blob/main/public/kakao.png?raw=true"
                alt="카카오"
                width={18}
                height={18}
                className="object-contain"
              />
              {isLoading ? '로그인 중...' : '카카오 로그인'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className={cn(
                'w-full rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091926]',
                isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              )}
            >
              다음에 할게요
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type SortOption = 'latest' | 'deadline' | 'views';

const ITEMS_PER_PAGE = 8;
const THEME = {
  pageBg: 'var(--bg)',
  cardBg: 'var(--panel)',
  cardHover: 'var(--panel-hover)',
  cardBorder: 'var(--border)',
  textPrimary: 'var(--text)',
  textSecondary: 'var(--text)',
  accent: 'var(--blue)',
  warn: 'var(--warn)',
  alert: 'var(--alert)',
  neutral: 'var(--neutral)',
};

const MOCK_JOBS: JobItem[] = [
  {
    id: 'job-001',
    type: 'job',
    org_name: 'FC 바르셀로나',
    title: '글로벌 마케팅 매니저',
    thumbnail_url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600',
    deadline_date: '2025-11-12T09:00:00.000Z',
    d_day: 4,
    is_active: true,
    created_at: '2025-11-04T02:30:00.000Z',
    views: 1290,
    saved: false,
    external_url: 'https://example.com/jobs/job-001',
    reward_label: '합격보상금 100만원',
    location: '스페인 바르셀로나',
    experience_range: '경력 5년 이상',
  },
  {
    id: 'job-002',
    type: 'job',
    org_name: '뉴욕 닉스',
    title: '선수 데이터 분석가',
    thumbnail_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600',
    deadline_date: '2025-11-08T09:00:00.000Z',
    d_day: 0,
    is_active: true,
    created_at: '2025-11-02T09:10:00.000Z',
    views: 860,
    saved: false,
    external_url: 'https://example.com/jobs/job-002',
    reward_label: '합격보상금 100만원',
    location: '미국 뉴욕',
    experience_range: '경력 1년 이상',
  },
  {
    id: 'job-003',
    type: 'job',
    org_name: '토트넘 홋스퍼',
    title: '아카데미 운영 코디네이터',
    thumbnail_url: null,
    deadline_date: '2025-11-15T09:00:00.000Z',
    d_day: 7,
    is_active: true,
    created_at: '2025-11-05T07:40:00.000Z',
    views: 540,
    saved: false,
    external_url: 'https://example.com/jobs/job-003',
    reward_label: '합격보상금 80만원',
    location: '영국 런던',
    experience_range: '경력 2년 이상',
  },
  {
    id: 'job-004',
    type: 'activity',
    org_name: '국제올림픽위원회',
    title: '청년 스포츠 서밋 2025',
    thumbnail_url: 'https://images.unsplash.com/photo-1530549387789-4c1017266639?q=80&w=600',
    deadline_date: '2025-11-20T09:00:00.000Z',
    d_day: 12,
    is_active: true,
    created_at: '2025-11-01T14:00:00.000Z',
    views: 1630,
    saved: false,
    external_url: 'https://example.com/jobs/job-004',
    reward_label: '참가비 전액 지원',
    location: '스위스 로잔',
    experience_range: '대학생 · 취준생',
  },
  {
    id: 'job-005',
    type: 'activity',
    org_name: '대한축구협회',
    title: '스포츠 비즈니스 챌린지 7기',
    thumbnail_url: null,
    deadline_date: '2025-11-10T09:00:00.000Z',
    d_day: 2,
    is_active: true,
    created_at: '2025-11-03T05:10:00.000Z',
    views: 720,
    saved: false,
    external_url: 'https://example.com/jobs/job-005',
    reward_label: '우수팀 포상 50만원',
    location: '대한민국 서울',
    experience_range: '대학생 · 취준생',
  },
  {
    id: 'job-006',
    type: 'job',
    org_name: '라리가 사무국',
    title: '파트너십 매니저',
    thumbnail_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600',
    deadline_date: '2025-11-07T09:00:00.000Z',
    d_day: -1,
    is_active: false,
    created_at: '2025-10-25T11:15:00.000Z',
    views: 980,
    saved: false,
    external_url: 'https://example.com/jobs/job-006',
    reward_label: '합격보상금 100만원',
    location: '스페인 마드리드',
    experience_range: '경력 3년 이상',
  },
  {
    id: 'job-007',
    type: 'activity',
    org_name: 'NBA',
    title: '글로벌 캡틴 인턴십',
    thumbnail_url: 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?q=80&w=600',
    deadline_date: '2025-12-01T09:00:00.000Z',
    d_day: 23,
    is_active: true,
    created_at: '2025-10-30T19:15:00.000Z',
    views: 2010,
    saved: false,
    external_url: 'https://example.com/jobs/job-007',
    reward_label: '글로벌 장학금 제공',
    location: '미국 뉴욕',
    experience_range: '대학생 · 취준생',
  },
  {
    id: 'job-008',
    type: 'job',
    org_name: 'AC 밀란',
    title: '디지털 콘텐츠 프로듀서',
    thumbnail_url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=600',
    deadline_date: '2025-11-18T09:00:00.000Z',
    d_day: 10,
    is_active: true,
    created_at: '2025-11-04T13:55:00.000Z',
    views: 640,
    saved: false,
    external_url: 'https://example.com/jobs/job-008',
    reward_label: '합격보상금 80만원',
    location: '이탈리아 밀라노',
    experience_range: '경력 3년 이상',
  },
  {
    id: 'job-009',
    type: 'job',
    org_name: '부산 아이파크',
    title: '스카우트 어시스턴트',
    thumbnail_url: null,
    deadline_date: '2025-11-09T09:00:00.000Z',
    d_day: 1,
    is_active: true,
    created_at: '2025-11-01T08:00:00.000Z',
    views: 430,
    saved: false,
    external_url: 'https://example.com/jobs/job-009',
    reward_label: '합격보상금 60만원',
    location: '대한민국 부산',
    experience_range: '경력 2년 이상',
  },
  {
    id: 'job-010',
    type: 'activity',
    org_name: '프리미어리그',
    title: 'NextGen 스포츠 해커톤',
    thumbnail_url: 'https://images.unsplash.com/photo-1587280501635-68c4e5f52f77?q=80&w=600',
    deadline_date: '2025-11-25T09:00:00.000Z',
    d_day: 17,
    is_active: true,
    created_at: '2025-11-02T07:45:00.000Z',
    views: 1180,
    saved: false,
    external_url: 'https://example.com/jobs/job-010',
    reward_label: '최우수상 200만원',
    location: '영국 런던',
    experience_range: '대학생 · 취준생',
  },
  {
    id: 'job-011',
    type: 'activity',
    org_name: 'FIFA',
    title: '여성 축구 글로벌 포럼',
    thumbnail_url: null,
    deadline_date: '2025-11-06T09:00:00.000Z',
    d_day: -2,
    is_active: false,
    created_at: '2025-10-20T16:20:00.000Z',
    views: 910,
    saved: false,
    external_url: 'https://example.com/jobs/job-011',
    reward_label: '글로벌 패스 제공',
    location: '카타르 도하',
    experience_range: '경력 3년 이상',
  },
  {
    id: 'job-012',
    type: 'job',
    org_name: '도쿄 올림픽 조직위',
    title: '지속가능성 프로젝트 오피서',
    thumbnail_url: 'https://images.unsplash.com/photo-1529429617124-aee007643004?q=80&w=600',
    deadline_date: '2025-11-28T09:00:00.000Z',
    d_day: 20,
    is_active: true,
    created_at: '2025-11-03T22:00:00.000Z',
    views: 510,
    saved: false,
    external_url: 'https://example.com/jobs/job-012',
    reward_label: '합격보상금 120만원',
    location: '일본 도쿄',
    experience_range: '경력 4년 이상',
  },
];

const sortJobs = (jobs: JobItem[], sort: SortOption) => {
  return [...jobs].sort((a, b) => {
    if (sort === 'latest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sort === 'deadline') {
      return new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime();
    }
    return b.views - a.views;
  });
};

type BadgeTone = 'warning' | 'urgent' | 'neutral' | 'default';

const formatBadge = (days: number | null) => {
  if (days === null) {
    return null;
  }

  if (days < 0) {
    return { label: '마감', tone: 'neutral' as const };
  }
  if (days === 0) {
    return { label: '오늘 마감', tone: 'urgent' as const };
  }
  return { label: `D-${days}`, tone: (days <= 3 ? 'warning' : 'default') as BadgeTone };
};

const getBadgeStyles = (tone: BadgeTone) => {
  switch (tone) {
    case 'warning':
      return { backgroundColor: '#F3B500', color: '#0D0F12' };
    case 'urgent':
      return { backgroundColor: '#FF4D4F', color: '#0D0F12' };
    case 'neutral':
      return { backgroundColor: '#7C838C', color: '#0D0F12' };
    default:
      return { backgroundColor: '#2F7BFF', color: '#0D0F12' };
  }
};

const BadgePill = ({ tone, label, className }: { tone: BadgeTone; label: string; className?: string }) => {
  const styles = getBadgeStyles(tone);
  return (
    <div
      className={cn('inline-flex w-fit items-center rounded-full px-3.5 py-1.5 text-sm font-bold uppercase tracking-tight', className)}
      style={styles}
    >
      {label}
    </div>
  );
};

const getDaysRemaining = (deadline: string) => {
  const today = new Date();
  const target = new Date(deadline);
  const diffTime =
    target.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function JobsPage() {
  const { isLoggedIn, user, login, isLoading } = useAuth();

  const [category, setCategory] = useState<JobType>('job');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [displayedJobs, setDisplayedJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [isSortSheetMounted, setIsSortSheetMounted] = useState(false);
  const [showJobsLoginModal, setShowJobsLoginModal] = useState(false);

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'latest', label: '최신순' },
    { value: 'deadline', label: '마감 임박순' },
    { value: 'views', label: '조회순' },
  ];

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortOption)?.label ?? '정렬';

  const jobsWithSaved = useMemo(() => {
    return MOCK_JOBS.filter((job) => job.is_active).map<JobItem>((job) => ({
      ...job,
      saved: savedIds.includes(job.id),
      d_day: getDaysRemaining(job.deadline_date),
    }));
  }, [savedIds]);

  useEffect(() => {
    if (isLoggedIn && user) {
      const stored = localStorage.getItem(`jobs_saved_${user.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as string[];
          setSavedIds(parsed);
        } catch (err) {
          console.error('저장한 공고 정보 파싱 실패:', err);
          setSavedIds([]);
        }
      } else {
        setSavedIds([]);
      }
    } else {
      setSavedIds([]);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (isLoggedIn && user) {
      localStorage.setItem(`jobs_saved_${user.id}`, JSON.stringify(savedIds));
    }
  }, [savedIds, isLoggedIn, user]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop || !isSortSheetMounted) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDesktop, isSortSheetMounted]);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const pendingId = localStorage.getItem('jobs_pending_save');
    if (pendingId) {
      localStorage.removeItem('jobs_pending_save');
      setSavedIds((prev) =>
        prev.includes(pendingId) ? prev : [...prev, pendingId],
      );
      setToastMessage('커리어 비서가 공고 마감 3일 전에 알려드릴게요.');
      setToastVisible(true);
      trackSaveSuccess(pendingId);
      console.log('알림 예약 생성:', pendingId);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDisplayedJobs([]);
    setPage(1);

    const timer = setTimeout(() => {
      if (cancelled) return;

      try {
        const filtered = jobsWithSaved.filter(
          (job) => job.type === category && job.is_active,
        );
        const sorted = sortJobs(filtered, sortOption);
        setDisplayedJobs(sorted.slice(0, ITEMS_PER_PAGE));
        setHasMore(sorted.length > ITEMS_PER_PAGE);
        setLoading(false);
        if (sorted.length) {
          trackJobsViewed(category);
        }
      } catch (err) {
        console.error('추천 공고 로드 실패:', err);
        setError('failed');
        setLoading(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, sortOption, jobsWithSaved, refreshKey]);

  const handleRetry = () => {
    setError(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCategoryClick = (nextCategory: JobType) => {
    if (category === nextCategory) return;
    setCategory(nextCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeSortSheet = () => {
    setIsSortSheetOpen(false);
    setTimeout(() => {
      setIsSortSheetMounted(false);
    }, 280);
  };

  const openSortSheet = () => {
    setIsSortSheetMounted(true);
    setTimeout(() => {
      setIsSortSheetOpen(true);
    }, 20);
  };

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    trackJobsSortChanged(value);
    closeSortSheet();
  };

  const handleLoadMore = () => {
    setIsFetchingMore(true);
    setTimeout(() => {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        const filtered = sortJobs(
          jobsWithSaved.filter(
            (job) => job.type === category && job.is_active,
          ),
          sortOption,
        );
        const slice = filtered.slice(0, nextPage * ITEMS_PER_PAGE);
        setHasMore(slice.length < filtered.length);
        setDisplayedJobs(slice);
        return nextPage;
      });
      setIsFetchingMore(false);
    }, 600);
  };

  const handleCardClick = (job: JobItem) => {
    trackJobCardClicked(job.id);
    if (job.external_url) {
      window.open(job.external_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, job: JobItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick(job);
    }
  };

  const handleToggleSave = (event: React.MouseEvent<HTMLButtonElement>, job: JobItem) => {
    event.stopPropagation();
    trackJobSavedClicked(job.id, isLoggedIn);

    if (!isLoggedIn) {
      localStorage.setItem('jobs_pending_save', job.id);
      trackLoginPromptShown('jobs_save');
      setShowJobsLoginModal(true);
      return;
    }

    setSavedIds((prev) => {
      if (prev.includes(job.id)) {
        return prev.filter((id) => id !== job.id);
      }
      const next = [...prev, job.id];
      setToastMessage('커리어 비서가 공고 마감 3일 전에 알려드릴게요.');
      setToastVisible(true);
      trackSaveSuccess(job.id);
      console.log('알림 예약 생성:', job.deadline_date);
      return next;
    });
  };

  const handleToastClose = () => setToastVisible(false);

  const handleJobsModalClose = () => setShowJobsLoginModal(false);

  const handleJobsLogin = async () => {
    try {
      await login();
      setShowJobsLoginModal(false);
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    <div
      className="min-h-screen pb-32"
      style={{ backgroundColor: THEME.pageBg, color: THEME.textPrimary }}
    >
      <AppBar />

      <main>
        <div className="container mx-auto px-6 lg:px-8">
          <section className="pt-8 pb-8 sm:pt-16 sm:pb-12">
            <div className="flex flex-col gap-6 sm:gap-10">
              <div className="flex flex-col gap-5 sm:gap-8 md:flex-row md:items-end md:justify-between">
                <div className="flex items-center gap-3 text-[24px] font-bold tracking-tight sm:text-4xl">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick('job')}
                    className={cn(
                      'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                      category === 'job'
                        ? 'text-[var(--text)]'
                        : 'text-[#9AA4AF] hover:text-[var(--text)]'
                    )}
                    aria-current={category === 'job' ? 'page' : undefined}
                  >
                    스포츠 채용
                  </button>
                  <span className="text-[24px] font-light text-[#9AA4AF] sm:text-3xl">|</span>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick('activity')}
                    className={cn(
                      'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                      category === 'activity'
                        ? 'text-[var(--text)]'
                        : 'text-[#9AA4AF] hover:text-[var(--text)]'
                    )}
                    aria-current={category === 'activity' ? 'page' : undefined}
                  >
                    스포츠 대외활동
                  </button>
                </div>
                {isDesktop && (
                  <div className="flex items-center gap-2">
                    {sortOptions.map((option) => {
                      const isActive = option.value === sortOption;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSortChange(option.value)}
                          className={cn(
                            'rounded-full border px-5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                            isActive
                              ? 'border-[var(--blue)] bg-[var(--blue)] text-white shadow-lg'
                              : 'border-[var(--border)] text-[#9AA4AF] hover:text-[var(--text)]'
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="w-full rounded-2xl bg-[var(--panel)] px-4 py-3 text-sm font-medium text-[var(--text)]">
                <span className="mr-2 text-base">🗓</span>
                월·목 오전 10시에 신규 공고가 업데이트돼요.
              </div>
              {!isDesktop && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text)]">
                    총 {displayedJobs.length}개
                  </span>
                  <button
                    type="button"
                    onClick={openSortSheet}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#9AA4AF] transition-colors hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    aria-haspopup="dialog"
                    aria-expanded={isSortSheetOpen}
                  >
                    {currentSortLabel}
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </section>

          <section aria-live="polite" className="pb-10 sm:pb-16">
            {loading && (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-[var(--panel)]"
                  >
                    <div className="h-32 animate-pulse rounded-t-2xl" style={{ backgroundColor: 'var(--panel-hover)' }} />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded" style={{ backgroundColor: 'var(--panel-hover)' }} />
                      <div className="h-3 w-1/2 animate-pulse rounded" style={{ backgroundColor: 'var(--panel-hover)' }} />
                      <div className="h-3 w-2/3 animate-pulse rounded" style={{ backgroundColor: 'var(--panel-hover)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl bg-[var(--panel)] p-10 text-center">
                <p className="mb-3 text-lg font-semibold text-[var(--text)]">잠시 후 다시 시도해주세요.</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                >
                  다시 불러오기
                </button>
              </div>
            )}

            {!loading && !error && displayedJobs.length === 0 && (
              <div className="rounded-2xl bg-[var(--panel)] p-12 text-center">
                <p className="mb-2 text-lg font-semibold text-[var(--text)]">등록된 공고가 없습니다.</p>
                <p className="text-sm text-[var(--text)]">
                  월·목 오전 10시에 신규 공고가 업데이트됩니다.
                </p>
              </div>
            )}

            {!loading && !error && displayedJobs.length > 0 && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {displayedJobs.map((job) => {
                    const badge = formatBadge(job.d_day);
                    return (
                      <div
                        key={job.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleCardClick(job)}
                        onKeyDown={(event) => handleCardKeyDown(event, job)}
                        className="group relative flex h-full flex-col overflow-hidden rounded-none bg-transparent transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                        aria-label={`${job.org_name} ${job.title} 상세보기`}
                      >
                        <div className="relative overflow-hidden rounded-none">
                          <div className="relative aspect-[4/3] w-full">
                            {job.thumbnail_url ? (
                              <Image
                                src={job.thumbnail_url}
                                alt={`${job.org_name} 채용 이미지`}
                                fill
                                className="rounded-3xl object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                                sizes="(max-width: 768px) 50vw, 25vw"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-white/70">
                                이미지 준비 중
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            aria-label={job.saved ? '저장 취소' : '공고 저장'}
                            aria-pressed={job.saved}
                            onClick={(event) => handleToggleSave(event, job)}
                            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--panel-hover)]/80 text-[var(--text)] shadow-sm backdrop-blur transition-colors hover:bg-[var(--panel-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
                          >
                            {job.saved ? (
                              <BookmarkCheck className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <Bookmark className="h-5 w-5" aria-hidden="true" />
                            )}
                          </button>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 pt-6">
                          <div className="space-y-2">
                            <h2 className="text-base sm:text-xl font-semibold leading-6 text-[var(--text)] transition-colors group-hover:text-[var(--text)]/85">
                              {job.title}
                            </h2>
                            <p className="text-sm font-medium text-white/80">
                              {job.org_name}
                            </p>
                          </div>

                          {badge && (
                            <BadgePill tone={badge.tone} label={badge.label} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={isFetchingMore}
                      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-70"
                      style={{
                        backgroundColor: THEME.accent,
                        boxShadow: '0 16px 34px rgba(47, 123, 255, 0.28)',
                      }}
                    >
                      {isFetchingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          불러오는 중...
                        </>
                      ) : (
                        '더 보기'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <button
        type="button"
        onClick={() => {
          if (!isLoggedIn) {
            trackLoginPromptShown('jobs_save');
            setShowJobsLoginModal(true);
            return;
          }

          trackSavedDrawerOpened();
          window.location.href = '/liked';
        }}
        className="fixed inset-x-0 bottom-6 mx-auto flex w-auto max-w-fit items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] sm:bottom-8 sm:px-6 sm:py-3.5 sm:text-base"
        style={{
          backgroundColor: THEME.accent,
          boxShadow: '0 18px 40px rgba(47, 123, 255, 0.35)',
        }}
      >
        커리어 저장함
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </button>

      <Toast
        message={toastMessage}
        type="success"
        isVisible={toastVisible}
        onClose={handleToastClose}
        duration={3200}
      />

      <JobsLoginModal
        open={showJobsLoginModal}
        onClose={handleJobsModalClose}
        onLogin={handleJobsLogin}
        isLoading={isLoading}
      />

      {!isDesktop && isSortSheetMounted && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
          <button
            type="button"
            className="flex-1"
            aria-label="정렬 시트 닫기"
            onClick={closeSortSheet}
          />
          <div
            className={`rounded-t-3xl bg-[var(--panel)] px-0 pb-6 pt-5 shadow-2xl transform transition-transform duration-300 ${isSortSheetOpen ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[var(--border)]" />
            <p className="mb-4 px-5 text-base font-semibold text-[var(--text)]">정렬 기준</p>
            <div className="flex flex-col">
              {sortOptions.map((option) => {
                const isActive = option.value === sortOption;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSortChange(option.value)}
                    className={cn(
                      'flex w-full items-center justify-between px-5 py-3 text-left text-sm font-medium transition-colors text-[var(--text)]',
                      !isActive && 'text-white/70 hover:text-[var(--text)]'
                    )}
                  >
                    {option.label}
                    {isActive && <span className="text-base text-[var(--blue)]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

