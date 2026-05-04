import { AdminFriendLinkEditor } from "@/components/admin/admin-friend-link-editor";

export default function AdminFriendLinkEditPage({
  params
}: {
  params: { id: string };
}) {
  return <AdminFriendLinkEditor friendLinkId={Number(params.id)} />;
}
