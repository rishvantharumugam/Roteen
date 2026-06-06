import { NextResponse } from "next/server";
import {
  NotificationsServiceError,
  notificationsService,
  type NotificationsPageData,
} from "@/features/notification/services/notificationService";

export interface NotificationsControllerSuccess<T> {
  ok: true;
  message: string;
  data: T;
}

export interface NotificationsControllerFailure {
  ok: false;
  message: string;
}

export type NotificationsControllerResponse<T> =
  | NotificationsControllerSuccess<T>
  | NotificationsControllerFailure;

function createFailureResponse(error: unknown): NotificationsControllerFailure {
  if (error instanceof NotificationsServiceError) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: false,
    message: "Something unexpected happened while loading notifications.",
  };
}

function createRouteErrorResponse(error: unknown) {
  const statusCode =
    error instanceof NotificationsServiceError ? error.statusCode : 500;
  const message =
    error instanceof Error
      ? error.message
      : "Something unexpected happened while loading notifications.";

  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: statusCode },
  );
}

export function notificationErrorHandler(error: unknown) {
  return createFailureResponse(error);
}

export function validateNotificationResponse(data: NotificationsPageData) {
  if (!Array.isArray(data.notifications)) {
    throw new NotificationsServiceError("Invalid notification response.", 502);
  }

  return data;
}

export async function getNotificationsController(): Promise<
  NotificationsControllerResponse<NotificationsPageData>
> {
  try {
    const response = await notificationsService.fetchNotificationsPage();

    return {
      ok: true,
      message: response.message,
      data: validateNotificationResponse(response.data),
    };
  } catch (error) {
    return notificationErrorHandler(error);
  }
}

export async function handleNotificationsGetRequest(userId?: string) {
  try {
    if (!userId) {
      throw new NotificationsServiceError(
        "Logged-in notification user id is missing.",
        401,
      );
    }

    const response = await notificationsService.fetchNotificationsPageFromSupabase(
      userId,
    );

    return NextResponse.json({
      success: true,
      message: response.message,
      count: response.data.notifications.length,
      data: validateNotificationResponse(response.data),
    });
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}


