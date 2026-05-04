import { AdminResourceItemEditor } from "@/components/admin/admin-resource-item-editor";

export default function AdminResourceItemEditPage({
  params
}: {
  params: { id: string };
}) {
  return <AdminResourceItemEditor itemId={Number(params.id)} />;
}
