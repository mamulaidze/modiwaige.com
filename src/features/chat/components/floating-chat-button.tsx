import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { fetchMyPosts, fetchReservedItems } from '@/features/account/api/profile-api';
import { useAuth } from '@/features/auth/context/use-auth';
import { fetchUnreadChatNotificationCount } from '@/features/notifications/api/notifications-api';
import { useI18n } from '@/shared/i18n/i18n';

import { buildChatInboxRows } from '../utils/chat-inbox';

const EDGE_INSET = 12;
const TOP_INSET = 72;
const MOBILE_BOTTOM_INSET = 112;
const DESKTOP_BOTTOM_INSET = 24;

function getViewportSize() {
  return {
    height:
      window.visualViewport?.height ??
      document.documentElement.clientHeight ??
      window.innerHeight,
    width:
      window.visualViewport?.width ??
      document.documentElement.clientWidth ??
      window.innerWidth,
  };
}

function getBottomInset(viewportWidth: number) {
  return viewportWidth >= 1024 ? DESKTOP_BOTTOM_INSET : MOBILE_BOTTOM_INSET;
}

export function FloatingChatButton() {
  const { isAuthenticated, user } = useAuth();
  const { localizedPath, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStateRef = useRef({
    didDrag: false,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
  });
  const [position, setPosition] = useState({ x: 16, y: 120 });
  const positionRef = useRef(position);
  const shouldHide = /\/chat(s)?(\/|$)/.test(location.pathname);

  const reservedItemsQuery = useQuery({
    queryKey: ['reserved-items', user?.id],
    queryFn: () => fetchReservedItems(user?.id ?? ''),
    enabled: isAuthenticated && Boolean(user?.id) && !shouldHide,
    staleTime: 20_000,
  });

  const myPostsQuery = useQuery({
    queryKey: ['my-posts', user?.id],
    queryFn: () => fetchMyPosts(user?.id ?? ''),
    enabled: isAuthenticated && Boolean(user?.id) && !shouldHide,
    staleTime: 20_000,
  });

  const unreadChatQuery = useQuery({
    queryKey: ['unread-chat-notifications', user?.id],
    queryFn: () => fetchUnreadChatNotificationCount(user?.id),
    enabled: isAuthenticated && Boolean(user?.id) && !shouldHide,
    staleTime: 10_000,
  });

  useEffect(() => {
    const width = buttonRef.current?.offsetWidth ?? 48;
    const height = buttonRef.current?.offsetHeight ?? 48;
    const viewport = getViewportSize();
    const bottomInset = getBottomInset(viewport.width);
    const nextPosition = {
      x: Math.max(EDGE_INSET, viewport.width - width - EDGE_INSET),
      y: Math.max(TOP_INSET, viewport.height - height - bottomInset),
    };

    positionRef.current = nextPosition;
    setPosition(nextPosition);
  }, [
    isAuthenticated,
    myPostsQuery.dataUpdatedAt,
    reservedItemsQuery.dataUpdatedAt,
    shouldHide,
  ]);

  useEffect(() => {
    if (!isAuthenticated || shouldHide) {
      return;
    }

    function handleResize() {
      updatePosition(clampPosition(positionRef.current.x, positionRef.current.y));
    }

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [isAuthenticated, shouldHide]);

  const chats = buildChatInboxRows(
    reservedItemsQuery.data ?? [],
    myPostsQuery.data ?? [],
  );
  const unreadChatCount = Number(unreadChatQuery.data ?? 0);

  if (!isAuthenticated || shouldHide) {
    return null;
  }

  if (chats.length === 0) {
    return null;
  }

  function updatePosition(nextPosition: { x: number; y: number }) {
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  }

  function clampPosition(nextX: number, nextY: number) {
    const width = buttonRef.current?.offsetWidth ?? 48;
    const height = buttonRef.current?.offsetHeight ?? 48;
    const viewport = getViewportSize();
    const bottomInset = getBottomInset(viewport.width);
    const minX = EDGE_INSET;
    const maxX = Math.max(minX, viewport.width - width - EDGE_INSET);
    const minY = TOP_INSET;
    const maxY = Math.max(minY, viewport.height - height - bottomInset);

    return {
      x: Math.min(Math.max(nextX, minX), maxX),
      y: Math.min(Math.max(nextY, minY), maxY),
    };
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    dragStateRef.current = {
      didDrag: false,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    const dragDistance = Math.hypot(
      event.clientX - dragStateRef.current.startX,
      event.clientY - dragStateRef.current.startY,
    );

    if (dragDistance > 4) {
      dragStateRef.current.didDrag = true;
    }

    if (!dragStateRef.current.didDrag) {
      return;
    }

    updatePosition(
      clampPosition(
        event.clientX - dragStateRef.current.offsetX,
        event.clientY - dragStateRef.current.offsetY,
      ),
    );
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!dragStateRef.current.didDrag) {
      navigate(localizedPath('/chats'));
      return;
    }

    const width = buttonRef.current?.offsetWidth ?? 48;
    const height = buttonRef.current?.offsetHeight ?? 48;
    const currentPosition = positionRef.current;
    const centerX = currentPosition.x + width / 2;
    const centerY = currentPosition.y + height / 2;
    const viewport = getViewportSize();
    const bottomInset = getBottomInset(viewport.width);
    const snapX =
      centerX < viewport.width / 2
        ? EDGE_INSET
        : viewport.width - width - EDGE_INSET;
    const snapY =
      centerY < viewport.height / 2
        ? TOP_INSET
        : viewport.height - height - bottomInset;

    updatePosition(clampPosition(snapX, snapY));
  }

  return (
    <button
      aria-label={t('Chats')}
      className="bg-primary text-primary-foreground fixed z-50 flex size-12 touch-none items-center justify-center rounded-full shadow-xl transition-[box-shadow] hover:shadow-2xl sm:size-[52px] lg:size-12"
      ref={buttonRef}
      style={{
        left: position.x,
        top: position.y,
      }}
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <MessageCircle className="size-[22px] sm:size-6 lg:size-[22px]" aria-hidden="true" />
      {unreadChatCount > 0 ? (
        <span className="bg-destructive text-primary-foreground absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] leading-5 font-bold ring-2 ring-background sm:min-w-[22px] sm:text-[11px] sm:leading-[22px]">
          {unreadChatCount > 9 ? '9+' : unreadChatCount}
        </span>
      ) : null}
    </button>
  );
}
