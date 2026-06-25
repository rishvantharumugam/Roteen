export const runtime = 'edge';

type AuthCodeErrorPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function AuthCodeErrorPage({ searchParams }: AuthCodeErrorPageProps) {
  const params = await searchParams;
  const message = params.message ?? "We could not complete your Google sign-in.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white px-6 py-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <h1 className="font-heading text-3xl font-semibold text-slate-950">Sign-in could not be completed</h1>
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {message}
        </p>
      </div>
    </main>
  );
}

