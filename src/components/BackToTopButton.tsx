'use client';

import { ReactNode } from 'react';

interface BackToTopButtonProps {
  children: ReactNode;
  className?: string;
}

export default function BackToTopButton({
  children,
  className,
}: BackToTopButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      aria-label="返回顶部"
    >
      {children}
    </button>
  );
}
