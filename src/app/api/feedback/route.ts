import {
  handleFeedbackGetRequest,
  handleFeedbackPostRequest,
} from "@/features/feedback/actions/feedbackController";

export const GET = handleFeedbackGetRequest;
export const POST = handleFeedbackPostRequest;
