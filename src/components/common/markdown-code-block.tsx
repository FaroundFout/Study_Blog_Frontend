"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

interface MarkdownCodeBlockProps {
  code: string;
  language?: string;
}

type TokenKind =
  | "annotation"
  | "attr"
  | "comment"
  | "keyword"
  | "number"
  | "plain"
  | "property"
  | "punctuation"
  | "string"
  | "tag"
  | "type";

interface SyntaxToken {
  kind: TokenKind;
  text: string;
}

const JAVA_KEYWORDS = new Set([
  "abstract",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "default",
  "double",
  "else",
  "enum",
  "extends",
  "final",
  "finally",
  "float",
  "for",
  "if",
  "implements",
  "import",
  "instanceof",
  "int",
  "interface",
  "long",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "throws",
  "true",
  "try",
  "void",
  "while"
]);

const SQL_KEYWORDS = new Set([
  "ALTER",
  "AND",
  "ASC",
  "CREATE",
  "DELETE",
  "DESC",
  "DROP",
  "FROM",
  "GROUP",
  "INDEX",
  "INSERT",
  "INTO",
  "JOIN",
  "KEY",
  "LIMIT",
  "NOT",
  "NULL",
  "ORDER",
  "PRIMARY",
  "SELECT",
  "SET",
  "TABLE",
  "UPDATE",
  "VALUES",
  "WHERE"
]);

const LANGUAGE_LABELS: Record<string, string> = {
  bash: "Bash",
  css: "CSS",
  html: "HTML",
  java: "Java",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  shell: "Shell",
  sh: "Shell",
  sql: "SQL",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  xml: "XML",
  yaml: "YAML",
  yml: "YAML"
};

export function MarkdownCodeBlock({ code, language }: MarkdownCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const normalizedLanguage = useMemo(() => normalizeLanguage(language, code), [code, language]);
  const tokens = useMemo(
    () => tokenizeCode(code, normalizedLanguage),
    [code, normalizedLanguage],
  );
  const languageLabel = LANGUAGE_LABELS[normalizedLanguage] ?? normalizedLanguage.toUpperCase();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <figure className="markdown-code-frame not-prose" data-language={normalizedLanguage}>
      <figcaption className="markdown-code-toolbar">
        <span className="markdown-code-language">{languageLabel}</span>
        <button
          type="button"
          className="markdown-code-copy"
          onClick={copyCode}
          aria-label={copied ? "代码已复制" : "复制代码"}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "已复制" : "复制"}</span>
        </button>
      </figcaption>
      <div className="markdown-code-scroll">
        <pre className="markdown-code-pre">
          <code className="markdown-code-code">
            {tokens.map((token, index) => (
              <span key={`${token.kind}-${index}`} className={`syntax-token syntax-${token.kind}`}>
                {token.text}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}

function normalizeLanguage(language: string | undefined, code: string) {
  const explicitLanguage = language?.trim().toLowerCase();

  if (explicitLanguage) {
    return explicitLanguage;
  }

  const trimmed = code.trim();

  if (/^(package\s+[\w.]+;|import\s+[\w.]+;|@\w+|public\s+(class|interface|enum)\s+)/m.test(trimmed)) {
    return "java";
  }

  if (/^<\?xml|^<\/?[a-z][\w:.-]*(\s|>|\/>)/i.test(trimmed)) {
    return "xml";
  }

  if (/^[\[{]/.test(trimmed)) {
    return "json";
  }

  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE|DROP\s+TABLE)\b/i.test(trimmed)) {
    return "sql";
  }

  if (/\b(import|export|const|let|function|interface|type)\b/.test(trimmed)) {
    return "ts";
  }

  if (/^(\$|npm|pnpm|yarn|mvn|git|cd|mkdir|curl)\b/m.test(trimmed)) {
    return "bash";
  }

  return "text";
}

function tokenizeCode(code: string, language: string): SyntaxToken[] {
  if (language === "text" || language === "plain") {
    return [{ kind: "plain", text: code }];
  }

  if (language === "xml" || language === "html") {
    return tokenizeWithMatcher(
      code,
      /(<!--[\s\S]*?-->|<\/?[A-Za-z][\w:.-]*(?=[\s>/])|\/?>|[A-Za-z_:][\w:.-]*(?==)|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
      classifyXmlToken,
    );
  }

  if (language === "json") {
    return tokenizeWithMatcher(
      code,
      /("(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|true|false|null|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|[{}\[\]:,])/g,
      classifyJsonToken,
    );
  }

  if (language === "sql") {
    return tokenizeWithMatcher(
      code,
      /(--[^\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|"(?:\\"|[^"])*"|\b[A-Z_]+\b|\b\d+(?:\.\d+)?\b|[(),.;=*<>])/gi,
      classifySqlToken,
    );
  }

  if (language === "bash" || language === "sh" || language === "shell") {
    return tokenizeWithMatcher(
      code,
      /(#.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:cd|curl|echo|export|git|mkdir|mvn|npm|pnpm|rm|source|yarn)\b|--?[A-Za-z][\w-]*|\b\d+\b|[|&;])/g,
      classifyShellToken,
    );
  }

  if (language === "java") {
    return tokenizeWithMatcher(
      code,
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|@[A-Za-z_$][\w$]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b[A-Za-z_$][\w$]*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,;=:+\-*/<>])/g,
      classifyJavaToken,
    );
  }

  return tokenizeWithMatcher(
    code,
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b[A-Za-z_$][\w$]*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,;=:+\-*/<>])/g,
    classifyGenericToken,
  );
}

function tokenizeWithMatcher(
  code: string,
  matcher: RegExp,
  classify: (token: string) => TokenKind,
) {
  const tokens: SyntaxToken[] = [];
  let cursor = 0;

  for (const match of code.matchAll(matcher)) {
    const index = match.index ?? 0;
    const text = match[0];

    if (index > cursor) {
      tokens.push({ kind: "plain", text: code.slice(cursor, index) });
    }

    tokens.push({ kind: classify(text), text });
    cursor = index + text.length;
  }

  if (cursor < code.length) {
    tokens.push({ kind: "plain", text: code.slice(cursor) });
  }

  return tokens;
}

function classifyJavaToken(token: string): TokenKind {
  if (token.startsWith("//") || token.startsWith("/*")) {
    return "comment";
  }

  if (token.startsWith("@")) {
    return "annotation";
  }

  if (/^["']/.test(token)) {
    return "string";
  }

  if (/^\d/.test(token)) {
    return "number";
  }

  if (JAVA_KEYWORDS.has(token)) {
    return "keyword";
  }

  if (/^[A-Z]/.test(token)) {
    return "type";
  }

  if (/^[{}()[\].,;=:+\-*/<>]$/.test(token)) {
    return "punctuation";
  }

  return "plain";
}

function classifyXmlToken(token: string): TokenKind {
  if (token.startsWith("<!--")) {
    return "comment";
  }

  if (/^<\/?/.test(token)) {
    return "tag";
  }

  if (token === ">" || token === "/>") {
    return "punctuation";
  }

  if (/^["']/.test(token)) {
    return "string";
  }

  return "attr";
}

function classifyJsonToken(token: string): TokenKind {
  if (/^"/.test(token)) {
    return token.endsWith(":") ? "property" : "string";
  }

  if (/^(true|false|null)$/.test(token)) {
    return "keyword";
  }

  if (/^-?\d/.test(token)) {
    return "number";
  }

  return "punctuation";
}

function classifySqlToken(token: string): TokenKind {
  if (token.startsWith("--") || token.startsWith("/*")) {
    return "comment";
  }

  if (/^["']/.test(token)) {
    return "string";
  }

  if (/^\d/.test(token)) {
    return "number";
  }

  if (SQL_KEYWORDS.has(token.toUpperCase())) {
    return "keyword";
  }

  if (/^[(),.;=*<>]$/.test(token)) {
    return "punctuation";
  }

  return "plain";
}

function classifyShellToken(token: string): TokenKind {
  if (token.startsWith("#")) {
    return "comment";
  }

  if (/^["']/.test(token)) {
    return "string";
  }

  if (token.startsWith("-")) {
    return "attr";
  }

  if (/^\d/.test(token)) {
    return "number";
  }

  if (/^[|&;]$/.test(token)) {
    return "punctuation";
  }

  return "keyword";
}

function classifyGenericToken(token: string): TokenKind {
  if (token.startsWith("//") || token.startsWith("/*")) {
    return "comment";
  }

  if (/^["']/.test(token)) {
    return "string";
  }

  if (/^\d/.test(token)) {
    return "number";
  }

  if (/^(const|export|function|import|interface|let|return|type)$/.test(token)) {
    return "keyword";
  }

  if (/^[A-Z]/.test(token)) {
    return "type";
  }

  if (/^[{}()[\].,;=:+\-*/<>]$/.test(token)) {
    return "punctuation";
  }

  return "plain";
}
