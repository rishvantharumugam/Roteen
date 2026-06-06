import { redirect } from "next/navigation";
import { appRoutes } from "@/constants/AppRoutes";

export default function LoginPage() {
  redirect(`${appRoutes.home}?auth=signIn`);
}

