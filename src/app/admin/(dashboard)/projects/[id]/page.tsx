import { AdminProjectEditor } from "@/components/admin/admin-project-editor";

export default function AdminProjectEditPage({
  params
}: {
  params: { id: string };
}) {
  return <AdminProjectEditor projectId={Number(params.id)} />;
}
