"use server";

import { revalidatePath } from "next/cache";

function normalizeSlugs(slugs: string[]) {
  return Array.from(new Set(slugs.map((slug) => slug.trim()).filter(Boolean)));
}

export async function revalidateArticlePublicContent(slugs: string[] = []) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/articles/[slug]", "page");
  revalidatePath("/archives");
  revalidatePath("/search");

  normalizeSlugs(slugs).forEach((slug) => {
    revalidatePath(`/articles/${slug}`);
  });
}
