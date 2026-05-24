import { SessionVideoPage } from "@/ui/session/SessionVideoPage";

type SessionVideoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SessionVideoPageRoute({ params }: SessionVideoPageProps) {
  const { id } = await params;
  return <SessionVideoPage sessionId={id} />;
}
