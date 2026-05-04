import { AdminDiaryEditor } from "@/components/admin/admin-diary-editor";

export default function AdminDiaryEditPage({
  params
}: {
  params: { id: string };
}) {
  return <AdminDiaryEditor diaryId={Number(params.id)} />;
}
