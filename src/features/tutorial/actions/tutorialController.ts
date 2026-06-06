import { NextResponse } from "next/server";
import {
  TutorialServiceError,
  tutorialService,
  type TutorialPageData,
} from "@/features/tutorial/services/tutorialService";

export interface TutorialControllerSuccess<T> {
  ok: true;
  message: string;
  data: T;
}

export interface TutorialControllerFailure {
  ok: false;
  message: string;
}

export type TutorialControllerResponse<T> =
  | TutorialControllerSuccess<T>
  | TutorialControllerFailure;

function createFailureResponse(error: unknown): TutorialControllerFailure {
  if (error instanceof TutorialServiceError) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: false,
    message: "Something unexpected happened while loading tutorials.",
  };
}

export async function requestTutorialPage(): Promise<
  TutorialControllerResponse<TutorialPageData>
> {
  try {
    const response = await tutorialService.fetchTutorialPage();

    return {
      ok: true,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    return createFailureResponse(error);
  }
}

export async function handleTutorialsGetRequest() {
  try {
    const response = await tutorialService.fetchTutorialPageFromSupabase();

    return NextResponse.json({
      success: true,
      count: response.data.lessons.length,
      data: response.data,
    });
  } catch (error) {
    const statusCode =
      error instanceof TutorialServiceError ? error.statusCode : 500;
    const message =
      error instanceof Error
        ? error.message
        : "Something unexpected happened while loading tutorials.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: statusCode },
    );
  }
}

