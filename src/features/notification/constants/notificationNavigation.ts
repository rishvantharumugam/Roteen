import { notificationsRoutePath } from "@/features/notification/types/notifications";

export interface NotificationsRouter {
  push: (href: string) => void;
  replace?: (href: string) => void;
}

export interface NotificationsNavigationTarget {
  notificationId?: string | number | null;
  replace?: boolean;
}

export function createNotificationsHref(
  target: NotificationsNavigationTarget = {},
) {
  if (!target.notificationId) {
    return notificationsRoutePath;
  }

  return `${notificationsRoutePath}#${encodeURIComponent(String(target.notificationId))}`;
}

export function navigateToNotifications(
  router: NotificationsRouter,
  target: NotificationsNavigationTarget = {},
) {
  const href = createNotificationsHref(target);

  if (target.replace && router.replace) {
    router.replace(href);
    return;
  }

  router.push(href);
}


