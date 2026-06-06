import { NextRequest, NextResponse } from "next/server";
import { feedbackApiPath } from "@/features/feedback/types/feedback";
import {
  FeedbackServiceError,
  feedbackService,
  validateFeedbackInput,
  type FeedbackFormInput,
  type FeedbackPageData,
  type FeedbackSubmissionResult,
} from "@/features/feedback/services/feedbackService";

export interface FeedbackControllerSuccess<T> {
  ok: true;
  message: string;
  data: T;
}

export interface FeedbackControllerFailure {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof FeedbackFormInput, string>>;
}

export type FeedbackControllerResponse<T> =
  | FeedbackControllerSuccess<T>
  | FeedbackControllerFailure;

interface FeedbackApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

interface FeedbackApiFailure {
  success?: false;
  message?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof FeedbackFormInput, string>>;
}

function createFailureResponse(error: unknown): FeedbackControllerFailure {
  if (error instanceof FeedbackServiceError) {
    return {
      ok: false,
      message: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  return {
    ok: false,
    message: "Something unexpected happened while handling feedback.",
  };
}

function createRouteErrorResponse(error: unknown) {
  const statusCode =
    error instanceof FeedbackServiceError ? error.statusCode : 500;
  const message =
    error instanceof Error
      ? error.message
      : "Something unexpected happened while handling feedback.";
  const fieldErrors =
    error instanceof FeedbackServiceError ? error.fieldErrors : undefined;

  return NextResponse.json(
    {
      success: false,
      message,
      fieldErrors,
    },
    { status: statusCode },
  );
}

async function readApiFailure(response: Response, fallbackMessage: string) {
  try {
    const payload = (await response.json()) as FeedbackApiFailure;
    return {
      message: payload.message || payload.error || fallbackMessage,
      fieldErrors: payload.fieldErrors,
    };
  } catch {
    return {
      message: fallbackMessage,
      fieldErrors: undefined,
    };
  }
}

function parseFeedbackPayload(payload: unknown): FeedbackFormInput {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new FeedbackServiceError("A valid feedback payload is required.", 400);
  }

  const candidate = payload as Partial<FeedbackFormInput>;

  return validateFeedbackInput({
    name: typeof candidate.name === "string" ? candidate.name : "",
    email: typeof candidate.email === "string" ? candidate.email : "",
    rating: typeof candidate.rating === "number" ? candidate.rating : 0,
    category:
      typeof candidate.category === "string"
        ? candidate.category
        : "Product Experience",
    comment: typeof candidate.comment === "string" ? candidate.comment : "",
  } as FeedbackFormInput);
}

export async function requestFeedbackPage(): Promise<
  FeedbackControllerResponse<FeedbackPageData>
> {
  try {
    const response = await fetch(feedbackApiPath, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const failure = await readApiFailure(
        response,
        "We could not load feedback.",
      );

      return {
        ok: false,
        message: failure.message,
        fieldErrors: failure.fieldErrors,
      };
    }

    const payload = (await response.json()) as FeedbackApiSuccess<FeedbackPageData>;

    return {
      ok: true,
      message: payload.message,
      data: payload.data,
    };
  } catch (error) {
    return createFailureResponse(error);
  }
}

export async function requestFeedbackSubmission(
  input: FeedbackFormInput,
): Promise<FeedbackControllerResponse<FeedbackSubmissionResult>> {
  try {
    const payload = parseFeedbackPayload(input);
    const response = await fetch(feedbackApiPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const failure = await readApiFailure(
        response,
        "We could not submit feedback.",
      );

      return {
        ok: false,
        message: failure.message,
        fieldErrors: failure.fieldErrors,
      };
    }

    const result = (await response.json()) as FeedbackApiSuccess<FeedbackSubmissionResult>;

    return {
      ok: true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    return createFailureResponse(error);
  }
}

export async function handleFeedbackGetRequest() {
  try {
    const response = await feedbackService.fetchFeedbackPageFromSupabase();

    return NextResponse.json({
      success: true,
      message: response.message,
      count: response.data.feedback.length,
      data: response.data,
    });
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}

export async function handleFeedbackPostRequest(request: NextRequest) {
  try {
    const payload = parseFeedbackPayload(await request.json());
    const response = await feedbackService.submitFeedbackToSupabase(payload);

    return NextResponse.json(
      {
        success: true,
        message: response.message,
        data: response.data,
      },
      { status: 201 },
    );
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}
