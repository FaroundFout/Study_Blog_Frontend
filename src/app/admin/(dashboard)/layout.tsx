import { AdminDashboardShell } from "@/components/admin/admin-dashboard-shell";
import { getSiteInfo } from "@/lib/api";

export default async function AdminDashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteInfo = await getSiteInfo();

  return <AdminDashboardShell siteInfo={siteInfo}>{children}</AdminDashboardShell>;
}
