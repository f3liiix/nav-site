'use client';

import { useEffect } from 'react';

export default function SmoothScrollScript() {
  useEffect(() => {
    // 为所有锚点链接添加平滑滚动效果
    const anchors = document.querySelectorAll('a[href^="#"]');

    // 获取导航栏高度的函数
    const getNavbarHeight = () => {
      const navbar = document.querySelector('header');
      return navbar ? navbar.getBoundingClientRect().height : 72; // 默认值为72px
    };

    const handleClick = (e: Event) => {
      e.preventDefault();
      const anchor = e.currentTarget as HTMLAnchorElement;
      const targetId = anchor.getAttribute('href');

      // 如果是返回顶部的链接 (#)，直接滚动到顶部
      if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // 清除所有高亮状态
        clearAllActiveStates();
        return;
      }

      // 处理其他锚点链接
      if (targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          // 获取当前导航栏高度
          const navbarHeight = getNavbarHeight();

          // 获取目标元素的位置
          const elementPosition = targetElement.getBoundingClientRect().top;
          // 当前滚动位置
          const offsetPosition =
            elementPosition + window.scrollY - navbarHeight - 30;

          // 先立即更新活动状态，不等待滚动事件
          clearAllActiveStates();
          updateActiveCategory(targetId.substring(1));

          // 滚动到目标位置，考虑导航栏高度
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          // 防止滚动事件覆盖我们设置的高亮状态
          const clickedTargetId = targetId;

          // 临时禁用滚动事件处理
          const disableScrollHandler = () => {};
          window.removeEventListener('scroll', handleScroll);
          window.addEventListener('scroll', disableScrollHandler);

          // 一段时间后恢复滚动事件处理
          setTimeout(() => {
            window.removeEventListener('scroll', disableScrollHandler);
            window.addEventListener('scroll', handleScroll);

            // 再次确保正确的分类被高亮
            updateActiveCategory(clickedTargetId.substring(1));
          }, 1000); // 给足够的时间完成滚动
        }
      }
    };

    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleClick);
    });

    // 清除所有高亮状态
    const clearAllActiveStates = () => {
      const desktopNavLinks = document.querySelectorAll('.category-nav-link');
      const mobileNavLinks = document.querySelectorAll(
        '.xl\\:hidden .category-nav-link'
      );

      desktopNavLinks.forEach(link => {
        link.classList.remove('active-category');
        link.classList.remove('border-brand-100');
        link.classList.add('border-transparent');
        link.classList.remove('font-medium');
      });

      mobileNavLinks.forEach(link => {
        link.classList.remove('bg-brand-50');
        link.classList.remove('border-brand-300');
        link.classList.remove('font-medium');
      });
    };

    // 更新活动分类的函数
    const updateActiveCategory = (activeSectionId: string) => {
      // 移除所有导航链接的活动状态
      clearAllActiveStates();

      // 添加活动状态到对应的导航链接
      const activeDesktopLink = document.querySelector(
        `.hidden.xl\\:block .category-nav-link[href="#${activeSectionId}"]`
      );
      if (activeDesktopLink) {
        activeDesktopLink.classList.add('active-category');
        activeDesktopLink.classList.add('border-brand-100');
        activeDesktopLink.classList.remove('border-transparent');
        activeDesktopLink.classList.add('font-medium');

        // 确保只有当前分类被高亮显示
        const allDesktopLinks = document.querySelectorAll(
          '.hidden.xl\\:block .category-nav-link'
        );
        allDesktopLinks.forEach(link => {
          if (link !== activeDesktopLink) {
            link.classList.remove('active-category');
            link.classList.remove('border-brand-100');
            link.classList.add('border-transparent');
            link.classList.remove('font-medium');
          }
        });
      }

      // 添加活动状态到移动端导航链接
      const activeMobileLink = document.querySelector(
        `.xl\\:hidden .category-nav-link[href="#${activeSectionId}"]`
      );
      if (activeMobileLink) {
        activeMobileLink.classList.add('bg-brand-50');
        activeMobileLink.classList.add('border-brand-300');
        activeMobileLink.classList.add('font-medium');

        // 确保只有当前分类被高亮显示
        const allMobileLinks = document.querySelectorAll(
          '.xl\\:hidden .category-nav-link'
        );
        allMobileLinks.forEach(link => {
          if (link !== activeMobileLink) {
            link.classList.remove('bg-brand-50');
            link.classList.remove('border-brand-300');
            link.classList.remove('font-medium');
          }
        });
      }
    };

    // 监听滚动事件，高亮当前可见的分类
    const handleScroll = () => {
      // 获取当前导航栏高度
      const navbarHeight = getNavbarHeight();

      // 获取所有分类区块
      const sections = Array.from(
        document.querySelectorAll('section[id^="category-"]')
      );

      // 如果没有分类区块，直接返回
      if (sections.length === 0) return;

      // 检查是否在页面顶部
      const isAtTop = window.scrollY < navbarHeight;

      // 如果在页面顶部，清除所有高亮状态
      if (isAtTop && sections[0].getBoundingClientRect().top > navbarHeight) {
        clearAllActiveStates();
        return;
      }

      // 检查是否滚动到页面底部
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 20;

      // 如果滚动到页面底部，高亮最后一个分类
      if (isAtBottom && sections.length > 0) {
        updateActiveCategory(sections[sections.length - 1].id);
        return;
      }

      // 找到当前在视口中的分类
      let foundVisibleSection = false;
      let lastVisibleSection = null;

      // 先清除所有高亮状态，确保只有一个分类被高亮
      clearAllActiveStates();

      for (const section of sections) {
        const rect = section.getBoundingClientRect();

        // 考虑导航栏高度和滚动偏移量，调整判断条件
        // 使用与滚动目标位置计算相同的偏移量(navbarHeight + 30)
        if (rect.top <= navbarHeight + 30 && rect.bottom >= navbarHeight) {
          // 更新活动分类
          updateActiveCategory(section.id);
          foundVisibleSection = true;

          // 找到第一个可见的区块后就退出循环
          break;
        }

        // 记录最后一个已经滚过的分类
        if (rect.top <= navbarHeight + 30) {
          lastVisibleSection = section;
        }
      }

      // 如果没有找到可见的分类，但不在页面顶部
      if (!foundVisibleSection && !isAtTop) {
        // 如果有最后滚过的分类，高亮它
        if (lastVisibleSection) {
          updateActiveCategory(lastVisibleSection.id);
        } else if (sections.length > 0) {
          // 否则高亮第一个分类
          updateActiveCategory(sections[0].id);
        }
      }
    };

    // 初始执行一次，设置初始状态
    setTimeout(handleScroll, 500); // 延迟执行，确保DOM已完全加载

    // 添加滚动事件监听
    window.addEventListener('scroll', handleScroll);

    // 监听窗口大小变化，重新计算
    window.addEventListener('resize', handleScroll);

    // 监听返回顶部按钮的点击事件
    const backToTopButtons = document.querySelectorAll(
      'button[aria-label="返回顶部"]'
    );
    backToTopButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 清除所有高亮状态
        clearAllActiveStates();
      });
    });

    // 清理事件监听器
    return () => {
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleClick);
      });
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      backToTopButtons.forEach(button => {
        button.removeEventListener('click', clearAllActiveStates);
      });
    };
  }, []);

  // 这个组件不渲染任何内容
  return null;
}
