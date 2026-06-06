import {
  TermsServiceError,
  termsService,
  type TermsPageData,
} from "@/features/terms/services/termsService";

export interface TermsControllerSuccess<T> {
  ok: true;
  message: string;
  data: T;
}

export interface TermsControllerFailure {
  ok: false;
  message: string;
}

export type TermsControllerResponse<T> =
  | TermsControllerSuccess<T>
  | TermsControllerFailure;

function createFailureResponse(error: unknown): TermsControllerFailure {
  if (error instanceof TermsServiceError) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: false,
    message: "Something unexpected happened while loading terms.",
  };
}

export async function requestTermsPage(): Promise<
  TermsControllerResponse<TermsPageData>
> {
  try {
    const response = await termsService.fetchTermsPage();

    return {
      ok: true,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    return createFailureResponse(error);
  }
}

export async function requestTermsAcceptance(
  accepted: boolean,
): Promise<TermsControllerResponse<{ accepted: true }>> {
  try {
    const response = await termsService.acceptTerms(accepted);

    return {
      ok: true,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    return createFailureResponse(error);
  }
}

