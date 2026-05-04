import { AdminResourceCollectionEditor } from "@/components/admin/admin-resource-collection-editor";

export default function AdminResourceCollectionEditPage({
  params
}: {
  params: { id: string };
}) {
  return <AdminResourceCollectionEditor collectionId={Number(params.id)} />;
}
