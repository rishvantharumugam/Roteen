import { fetchDashboardStats } from "@/controller/DashboardPageController";
import { DashboardPageClientView } from "@/store/dashboardpage/DashboardPageClientView";

export default async function DashboardPageUI() {
  const { ongoingCourses, initialExploreSubjects } = await fetchDashboardStats();

  return (
    <DashboardPageClientView
      ongoingCourses={ongoingCourses}
      initialExploreSubjects={initialExploreSubjects}
    />
  );
}
