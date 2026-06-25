import { PYQPageClient } from "./PYQPageClient";

export const runtime = 'edge';

export const metadata = {
  title: "PYQs | Roteen",
  description: "Previous Year Question papers for boards and exams.",
};

export default function PYQPageRoute() {
  return <PYQPageClient />;
}
