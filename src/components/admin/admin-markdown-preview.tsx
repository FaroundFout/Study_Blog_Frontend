"use client";

import ReactMarkdown from "react-markdown";

import {
  markdownProseClassName,
  markdownRehypePlugins,
  markdownRemarkPlugins
} from "@/components/common/markdown-config";
import { cn } from "@/lib/utils";

export function AdminMarkdownPreview({
  content,
  className
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        markdownProseClassName,
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={markdownRemarkPlugins} rehypePlugins={markdownRehypePlugins}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
