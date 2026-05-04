import { redirect } from "next/navigation";

import { ArticleWriteStudio } from "@/components/editor/article-write-studio";

export default function EditWriteArticlePage({
  params
}: {
  params: {
    id: string;
  };
}) {
  const articleId = Number(params.id);

  if (!Number.isFinite(articleId) || articleId <= 0) {
    redirect("/write");
  }

  return <ArticleWriteStudio articleId={articleId} />;
}
