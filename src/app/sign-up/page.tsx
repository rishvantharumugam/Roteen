import { redirect } from "next/navigation";
import { appRoutes } from "@/navigation/AppRoutes";

type SignUpRouteProps = {
  searchParams?: Promise<{
    verified?: string;
  }>;
};

export default async function SignUpRoute({ searchParams }: SignUpRouteProps) {
  const resolvedSearchParams = await searchParams;
  const redirectTarget =
    resolvedSearchParams?.verified === "1"
      ? `${appRoutes.home}?auth=signUp&step=3`
      : `${appRoutes.home}?auth=signUp`;

  redirect(redirectTarget);
}

