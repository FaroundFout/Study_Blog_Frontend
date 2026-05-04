import { AdminDashboardShell } from "@/components/admin/admin-dashboard-shell";

export default function AdminDashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
