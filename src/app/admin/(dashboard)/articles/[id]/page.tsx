import { redirect } from "next/navigation";

export default function AdminEditArticleRoute({
  params
}: {
  params: {
    id: string;
  };
}) {
  const articleId = Number(params.id);

  if (!Number.isFinite(articleId) || articleId <= 0) {
    redirect("/admin/articles");
  }

  redirect(`/write/${articleId}`);
}
