import { handleTutorialsGetRequest } from "@/features/tutorial/actions/tutorialController";

export const runtime = 'edge';

export const GET = handleTutorialsGetRequest;
