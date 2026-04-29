import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "../features/dashboard/dashboardPage"

export default function Home() {
  return (
    <AppShell>
      <DashboardPage />
    </AppShell>
  );
}