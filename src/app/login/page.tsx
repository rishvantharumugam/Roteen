import { redirect } from "next/navigation";
import { appRoutes } from "@/navigation/AppRoutes";

export default function LoginPage() {
  redirect(`${appRoutes.home}?auth=signIn`);
}

