import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { PluggableList } from "unified";

export const markdownProseClassName =
  "page-prose markdown-prose prose prose-stone max-w-none text-foreground dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-[15px] prose-p:leading-8 prose-li:leading-8 prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 prose-strong:text-foreground prose-img:rounded-[1.4rem] prose-img:border prose-img:border-border/60 prose-blockquote:rounded-r-2xl prose-blockquote:border-primary/35 prose-blockquote:bg-accent/28 prose-blockquote:py-1 prose-blockquote:pr-5";

export const markdownRemarkPlugins: PluggableList = [remarkGfm];

export const markdownRehypePlugins: PluggableList = [
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: "append" }]
];
