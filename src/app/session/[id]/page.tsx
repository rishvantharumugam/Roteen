import { SessionVideoPage } from "@/features/session/components/SessionVideoPage";

export const runtime = 'edge';

type SessionVideoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SessionVideoPageRoute({ params }: SessionVideoPageProps) {
  const { id } = await params;
  return <SessionVideoPage sessionId={id} />;
}
