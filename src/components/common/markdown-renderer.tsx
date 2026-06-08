import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";

import { MarkdownCodeBlock } from "@/components/common/markdown-code-block";
import {
  markdownProseClassName,
  markdownRehypePlugins,
  markdownRemarkPlugins
} from "@/components/common/markdown-config";
import { cn } from "@/lib/utils";

const markdownComponents: Components = {
  pre({ children }) {
    return <>{children}</>;
  },
  code({ className, children }) {
    const code = getNodeText(children).replace(/\n$/, "");
    const language = className?.match(/language-([\w-]+)/)?.[1];
    const isBlock = Boolean(language) || code.includes("\n");

    if (!isBlock) {
      return <code className={className}>{children}</code>;
    }

    return <MarkdownCodeBlock code={code} language={language} />;
  }
};

export function MarkdownRenderer({
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
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function getNodeText(value: ReactNode): string {
  if (Array.isArray(value)) {
    return value.map(getNodeText).join("");
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}
