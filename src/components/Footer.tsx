'use client';

export default function Footer() {
  return (
    <footer className="w-full bg-[#14171B] border-t border-[#2A2F36] py-8 sm:py-16 px-4 sm:px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 sm:gap-0">
          {/* 왼쪽: 회사 정보 */}
          <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-[#9AA4AF]">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span>프라이데이랩 (대표: 한지훈)</span>
              <span className="text-[#7C838C]">|</span>
              <a
                href="https://sportsx.channel.io/home"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#F5F7FA] transition-colors"
              >
                문의하기
              </a>
              <span className="text-[#7C838C]">|</span>
              <span className="cursor-pointer hover:text-[#F5F7FA] transition-colors">
                이용약관
              </span>
              <span className="text-[#7C838C]">|</span>
              <span className="cursor-pointer hover:text-[#F5F7FA] transition-colors">
                개인정보보호방침
              </span>
            </div>
            <div className="text-xs sm:text-sm text-[#9AA4AF]">
              사업자등록번호 481-11-03110
            </div>
          </div>

          {/* 오른쪽: 저작권 */}
          <div className="text-xs sm:text-sm text-[#9AA4AF] sm:text-right whitespace-nowrap">
            © 프라이데이랩. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
