'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface CategoryIconProps {
  icon: string | null;
  name: string;
  size?: number;
  color?: string;
}

export default function CategoryIcon({
  icon,
  name,
  size = 16,
  color,
}: CategoryIconProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);

  // 重置加载状态，确保每次图标变化时重新显示loading
  useEffect(() => {
    if (icon) {
      setIsLoading(true);
      setError(false);
    }
  }, [icon]);

  // 确保loading样式可见
  useEffect(() => {
    if (loadingRef.current && isLoading) {
      loadingRef.current.style.display = 'flex';
    }
  }, [isLoading]);

  if (!icon) return null;

  // 如果是SVG且需要设置颜色
  if (icon.endsWith('.svg') && color) {
    return (
      <div
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {/* 加载中显示loading样式 */}
        <div
          ref={loadingRef}
          className={`absolute inset-0 flex items-center justify-center bg-gray-200 rounded z-20 ${isLoading ? 'block' : 'hidden'}`}
          style={{ opacity: isLoading ? 1 : 0 }}
        >
          <div className="w-5 h-5 border-2 border-brand-50 border-t-brand-100 rounded-full animate-spin"></div>
        </div>

        <Image
          src={icon}
          alt={name}
          fill
          className={`object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={{ filter: `brightness(0) invert(1)` }}
          onLoad={() => {
            // 延迟一点点再隐藏loading，确保图片已经完全渲染
            setTimeout(() => setIsLoading(false), 100);
          }}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
          unoptimized
          priority
        />

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded z-20">
            <span className="text-xs font-bold">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 普通图标
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {/* 加载中显示loading样式 */}
      <div
        ref={loadingRef}
        className={`absolute inset-0 flex items-center justify-centerrounded z-20 ${isLoading ? 'block' : 'hidden'}`}
        style={{ opacity: isLoading ? 1 : 0 }}
      >
        <div className="w-5 h-5 border-2 border-brand-50 border-t-brand-100 rounded-full animate-spin"></div>
      </div>

      <Image
        src={icon}
        alt={name}
        fill
        className={`object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => {
          // 延迟一点点再隐藏loading，确保图片已经完全渲染
          setTimeout(() => setIsLoading(false), 100);
        }}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        unoptimized={icon.endsWith('.svg')}
        priority
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-100 rounded z-20">
          <span className="text-xs font-bold">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
