"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
  ArrowLeft,
  CalendarClock,
  Copy,
  Eye,
  FileDown,
  FileUp,
  ImagePlus,
  Loader2,
  PenSquare,
  RefreshCw,
  Save,
  SendHorizonal,
  Sparkles,
  Upload
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { revalidateArticlePublicContent } from "@/app/actions/revalidate-public-content";
import { AdminArticleStatusBadge } from "@/components/admin/admin-article-status-badge";
import { AdminMarkdownPreview } from "@/components/admin/admin-markdown-preview";
import {
  AdminModal,
  AdminNotice,
  adminFieldLabelClassName,
  adminSelectClassName,
  looksLikeImage
} from "@/components/admin/admin-page-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import {
  createAdminArticle,
  getAdminArticleById,
  getAdminCategories,
  getAdminTags,
  getAdminUploadedFiles,
  updateAdminArticle,
  uploadAdminFile
} from "@/lib/api";
import { excerpt, formatDate, cn } from "@/lib/utils";
import type {
  AdminArticleSavePayload,
  ArticleDetail,
  ArticleStatus,
  Category,
  Tag,
  UploadedFilePayload
} from "@/types";

const ARTICLE_COVER_DIRECTORY = "articles/covers";
const ARTICLE_IMAGE_DIRECTORY = "articles/content";

interface EditorFormState {
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  contentMd: string;
  categoryId: string;
  status: ArticleStatus;
  isTop: boolean;
  sort: string;
  publishTime: string;
  tagIds: number[];
}

interface EditorAssetItem {
  key: string;
  name: string;
  url: string;
  contentType?: string;
  uploadedId?: number;
  createdAt?: string;
}

const emptyFormState: EditorFormState = {
  title: "",
  slug: "",
  summary: "",
  coverImage: "",
  contentMd: "",
  categoryId: "",
  status: "draft",
  isTop: false,
  sort: "0",
  publishTime: "",
  tagIds: []
};

function buildSlugFromTitle(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+=<>{}[\]|\\:;"'?,./\s]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || `article-${dayjs().format("YYYYMMDDHHmmss")}`;
}

function toDateTimeInputValue(value?: string | null) {
  return value ? dayjs(value).format("YYYY-MM-DDTHH:mm") : "";
}

function toApiDateTimeValue(value?: string) {
  if (!value) {
    return null;
  }

  return value.length === 16 ? `${value}:00` : value;
}

function estimateWordCount(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[>#*`\-\[\]()!]/g, " ")
    .replace(/\s+/g, "")
    .trim().length;
}

function mapArticleToForm(article: ArticleDetail): EditorFormState {
  return {
    title: article.title,
    slug: article.slug,
    summary: article.summary || "",
    coverImage: article.coverImage || "",
    contentMd: article.contentMd,
    categoryId: article.categoryId ? String(article.categoryId) : "",
    status:
      article.status === "published" || article.status === "private"
        ? article.status
        : "draft",
    isTop: article.isTop === 1,
    sort: String(article.sort ?? 0),
    publishTime: toDateTimeInputValue(article.publishTime),
    tagIds: article.tags.map((tag) => tag.id)
  };
}

function toEditorAsset(file: UploadedFilePayload): EditorAssetItem {
  return {
    key: `uploaded-${file.id}`,
    name: file.originalName,
    url: file.fileUrl,
    contentType: file.contentType,
    uploadedId: file.id,
    createdAt: file.createdAt
  };
}

function mergeAssets(current: EditorAssetItem[], incoming: EditorAssetItem[]) {
  const next = [...incoming];
  const seen = new Set(next.map((item) => item.url));

  current.forEach((item) => {
    if (!seen.has(item.url)) {
      next.push(item);
      seen.add(item.url);
    }
  });

  return next;
}

function inferImportedTitle(markdown: string, fileName: string) {
  const headingMatch = markdown.match(/^#\s+(.+)$/m);
  if (headingMatch?.[1]?.trim()) {
    return headingMatch[1].trim();
  }

  return fileName.replace(/\.[^.]+$/, "").trim() || "新文章";
}

function buildImageMarkdown(url: string, title?: string) {
  return `![${title?.trim() || "image"}](${url})`;
}

const markdownImagePattern =
  /!\[[^\]]*]\((<[^>]+>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]+\)))?\)/g;

function stripMarkdownImageDestination(rawValue: string) {
  return rawValue.trim().replace(/^<|>$/g, "");
}

function isMarkdownImportFile(file: File) {
  return (
    file.name.toLowerCase().endsWith(".md") ||
    file.type === "text/markdown" ||
    file.type === "text/plain"
  );
}

function normalizeImportPath(value: string) {
  const normalized = stripMarkdownImageDestination(value)
    .replace(/\\/g, "/")
    .replace(/[?#].*$/, "")
    .trim();

  if (!normalized) {
    return "";
  }

  const segments: string[] = [];
  normalized.split("/").forEach((segment) => {
    if (!segment || segment === ".") {
      return;
    }

    if (segment === "..") {
      if (segments.length && segments[segments.length - 1] !== "..") {
        segments.pop();
      } else {
        segments.push(segment);
      }
      return;
    }

    segments.push(segment);
  });

  return segments.join("/");
}

function isExternalMarkdownAsset(value: string) {
  const normalized = stripMarkdownImageDestination(value);
  return /^(?:[a-z][a-z\d+\-.]*:|\/\/|\/|#)/i.test(normalized);
}

function splitImportPath(value: string) {
  return normalizeImportPath(value)
    .split("/")
    .filter(Boolean);
}

function getImportDirectory(value: string) {
  const segments = splitImportPath(value);
  return segments.slice(0, -1).join("/");
}

function getRelativeImportPath(fromDirectory: string, targetPath: string) {
  const fromSegments = splitImportPath(fromDirectory);
  const targetSegments = splitImportPath(targetPath);
  let shared = 0;

  while (
    shared < fromSegments.length &&
    shared < targetSegments.length &&
    fromSegments[shared] === targetSegments[shared]
  ) {
    shared += 1;
  }

  const upward = fromSegments.slice(shared).map(() => "..");
  const downward = targetSegments.slice(shared);
  return [...upward, ...downward].join("/");
}

function createImportAssetLookup(markdownFile: File, files: File[]) {
  const markdownDirectory = getImportDirectory(markdownFile.webkitRelativePath || markdownFile.name);
  const lookup = new Map<
    string,
    {
      file: File;
      fileKey: string;
    }
  >();
  const basenameLookup = new Map<
    string,
    | {
        file: File;
        fileKey: string;
      }
    | null
  >();

  files.forEach((file) => {
    if (file === markdownFile || !looksLikeImage(file.name, file.type)) {
      return;
    }

    const normalizedPath = normalizeImportPath(file.webkitRelativePath || file.name);
    const normalizedBasename = normalizeImportPath(file.name);
    const fileKey = `${normalizedPath || normalizedBasename}:${file.size}:${file.lastModified}`;
    const entry = { file, fileKey };

    if (normalizedPath) {
      lookup.set(normalizedPath, entry);
    }

    if (markdownDirectory && normalizedPath) {
      const relativePath = normalizeImportPath(
        getRelativeImportPath(markdownDirectory, normalizedPath),
      );
      if (relativePath) {
        lookup.set(relativePath, entry);
      }
    }

    if (normalizedBasename) {
      if (!basenameLookup.has(normalizedBasename)) {
        basenameLookup.set(normalizedBasename, entry);
      } else if (basenameLookup.get(normalizedBasename)?.fileKey !== fileKey) {
        basenameLookup.set(normalizedBasename, null);
      }
    }
  });

  basenameLookup.forEach((entry, key) => {
    if (entry) {
      lookup.set(key, entry);
    }
  });

  return lookup;
}

function extractLocalMarkdownImageReferences(markdown: string) {
  const references = new Set<string>();

  for (const match of markdown.matchAll(markdownImagePattern)) {
    const rawDestination = match[1];
    if (!rawDestination || isExternalMarkdownAsset(rawDestination)) {
      continue;
    }

    const normalized = normalizeImportPath(rawDestination);
    if (normalized) {
      references.add(normalized);
    }
  }

  return [...references];
}

function replaceLocalMarkdownImages(
  markdown: string,
  resolver: (normalizedPath: string) => string | undefined,
) {
  return markdown.replace(markdownImagePattern, (match, rawDestination: string) => {
    if (!rawDestination || isExternalMarkdownAsset(rawDestination)) {
      return match;
    }

    const normalized = normalizeImportPath(rawDestination);
    if (!normalized) {
      return match;
    }

    const uploadedUrl = resolver(normalized);
    return uploadedUrl ? match.replace(rawDestination, uploadedUrl) : match;
  });
}

function clampSelectionRange(
  range: { start: number; end: number },
  contentLength: number,
) {
  const start = Math.max(0, Math.min(range.start, contentLength));
  const end = Math.max(start, Math.min(range.end, contentLength));
  return { start, end };
}

function StudioSkeleton() {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 px-4 md:px-6 xl:px-8">
      <div className="mx-auto max-w-[1460px] space-y-6">
        <Card className="animate-pulse space-y-5 p-6 dark:border-white/8 dark:bg-[#0e1628]/94">
          <div className="h-5 w-32 rounded-full bg-accent/80" />
          <div className="h-12 w-80 rounded-[1rem] bg-accent/80" />
        </Card>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <Card className="animate-pulse space-y-4 p-6 dark:border-white/8 dark:bg-[#0e1628]/94">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
              <div className="h-14 rounded-[1rem] bg-accent/80" />
              <div className="h-14 rounded-[1rem] bg-accent/80" />
            </div>
            <div className="h-[620px] rounded-[1.6rem] bg-accent/70" />
          </Card>
          <div className="space-y-6">
            <Card className="animate-pulse h-[260px] p-6 dark:border-white/8 dark:bg-[#0e1628]/94" />
            <Card className="animate-pulse h-[320px] p-6 dark:border-white/8 dark:bg-[#0e1628]/94" />
            <Card className="animate-pulse h-[320px] p-6 dark:border-white/8 dark:bg-[#0e1628]/94" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticleWriteStudio({
  articleId
}: {
  articleId?: number;
}) {
  const router = useRouter();
  const { token, ready } = useRequireAdmin();
  const [form, setForm] = useState<EditorFormState>(emptyFormState);
  const [originalSlug, setOriginalSlug] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [assetItems, setAssetItems] = useState<EditorAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [savingState, setSavingState] = useState<ArticleStatus | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [assetUploading, setAssetUploading] = useState(false);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(articleId));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [externalImageUrl, setExternalImageUrl] = useState("");
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const assetInputRef = useRef<HTMLInputElement | null>(null);
  const contentSelectionRef = useRef<{ start: number; end: number } | null>(null);

  const isEditing = articleId !== undefined;

  useEffect(() => {
    if (!ready || !token) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      getAdminCategories(token),
      getAdminTags(token),
      articleId ? getAdminArticleById(token, articleId) : Promise.resolve(null)
    ])
      .then(([categoryItems, tagItems, article]) => {
        if (cancelled) {
          return;
        }

        setCategories(categoryItems);
        setTags(tagItems);

        if (article) {
          setForm(mapArticleToForm(article));
          setOriginalSlug(article.slug);
          setSlugEdited(true);
        } else {
          setForm(emptyFormState);
          setOriginalSlug("");
          setSlugEdited(false);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setNotice({
          tone: "error",
          text: error instanceof Error ? error.message : "文章编辑器加载失败。"
        });
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [articleId, ready, token]);

  const loadAssets = useCallback(async (silent = false) => {
    if (!token) {
      return;
    }

    if (!silent) {
      setAssetsLoading(true);
    }

    try {
      const payload = await getAdminUploadedFiles(token, {
        pageNum: 1,
        pageSize: 18
      });
      const imageAssets = payload.list
        .filter((item) => looksLikeImage(item.fileUrl, item.contentType))
        .map(toEditorAsset);

      setAssetItems((current) => mergeAssets(current, imageAssets));
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "图片资源加载失败。"
      });
    } finally {
      setAssetsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!ready || !token) {
      return;
    }

    void loadAssets();
  }, [loadAssets, ready, token]);

  const previewContent = useMemo(
    () => form.contentMd.trim() || "# 开始写作\n\n这里会实时显示文章的 Markdown 预览。",
    [form.contentMd],
  );

  const selectedCategoryName = useMemo(
    () =>
      categories.find((item) => String(item.id) === form.categoryId)?.name || "未分类",
    [categories, form.categoryId],
  );

  const selectedTags = useMemo(
    () => tags.filter((tag) => form.tagIds.includes(tag.id)),
    [form.tagIds, tags],
  );

  const wordCount = useMemo(() => estimateWordCount(form.contentMd), [form.contentMd]);

  const handleTitleChange = (value: string) => {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugEdited ? current.slug : buildSlugFromTitle(value)
    }));
  };

  const handleContentChange = (value: string) => {
    setForm((current) => ({
      ...current,
      contentMd: value
    }));
  };

  const toggleTag = (tagId: number) => {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((item) => item !== tagId)
        : [...current.tagIds, tagId]
    }));
  };

  const rememberContentSelection = useCallback(() => {
    const textarea = contentRef.current;
    if (!textarea) {
      return;
    }

    contentSelectionRef.current = {
      start: textarea.selectionStart ?? textarea.value.length,
      end: textarea.selectionEnd ?? textarea.selectionStart ?? textarea.value.length
    };
  }, []);

  const insertIntoMarkdown = useCallback((snippet: string) => {
    setForm((current) => {
      const textarea = contentRef.current;
      const storedSelection = contentSelectionRef.current;

      if (!textarea && !storedSelection) {
        const prefix = current.contentMd.trim() ? `${current.contentMd}\n\n` : "";
        return {
          ...current,
          contentMd: `${prefix}${snippet}`
        };
      }

      const liveSelection = textarea && document.activeElement === textarea
        ? {
            start: textarea.selectionStart ?? current.contentMd.length,
            end: textarea.selectionEnd ?? textarea.selectionStart ?? current.contentMd.length
          }
        : null;
      const selection = clampSelectionRange(
        liveSelection || storedSelection || {
          start: current.contentMd.length,
          end: current.contentMd.length
        },
        current.contentMd.length,
      );
      const nextValue =
        current.contentMd.slice(0, selection.start)
        + snippet
        + current.contentMd.slice(selection.end);
      const cursor = selection.start + snippet.length;

      contentSelectionRef.current = {
        start: cursor,
        end: cursor
      };

      window.requestAnimationFrame(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursor, cursor);
        }
      });

      return {
        ...current,
        contentMd: nextValue
      };
    });
  }, []);

  const prependAsset = (asset: EditorAssetItem) => {
    setAssetItems((current) => {
      const next = current.filter((item) => item.url !== asset.url);
      return [asset, ...next];
    });
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) {
      return;
    }

    setCoverUploading(true);
    setNotice({ tone: "info", text: `正在上传封面 ${file.name}...` });

    try {
      const payload = await uploadAdminFile(token, file, {
        directory: ARTICLE_COVER_DIRECTORY
      });
      setForm((current) => ({
        ...current,
        coverImage: payload.fileUrl
      }));
      prependAsset(toEditorAsset(payload));
      setNotice({ tone: "success", text: `${payload.originalName} 已设置为封面。` });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "封面上传失败。"
      });
    } finally {
      setCoverUploading(false);
      event.target.value = "";
    }
  };

  const handleAssetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) {
      return;
    }

    setAssetUploading(true);
    setNotice({ tone: "info", text: `正在上传图片 ${file.name}...` });

    try {
      const payload = await uploadAdminFile(token, file, {
        directory: ARTICLE_IMAGE_DIRECTORY
      });
      const asset = toEditorAsset(payload);
      prependAsset(asset);
      insertIntoMarkdown(`${buildImageMarkdown(payload.fileUrl, payload.originalName)}\n`);
      setNotice({ tone: "success", text: `${payload.originalName} 已上传并插入正文。` });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "图片上传失败。"
      });
    } finally {
      setAssetUploading(false);
      event.target.value = "";
    }
  };

  const handleMarkdownBundleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const markdownFiles = selectedFiles.filter(isMarkdownImportFile);
    if (!markdownFiles.length) {
      return;
    }

    try {
      if (markdownFiles.length > 1) {
        throw new Error("一次只能导入一个 Markdown 主文件，请保留一个 .md 文件后重试。");
      }

      const markdownFile = markdownFiles[0];
      const imageFiles = selectedFiles.filter(
        (file) => file !== markdownFile && looksLikeImage(file.name, file.type),
      );

      setNotice({
        tone: "info",
        text: imageFiles.length
          ? `正在导入 ${markdownFile.name}，并处理 ${imageFiles.length} 张配套图片...`
          : `正在导入 ${markdownFile.name}...`
      });

      const markdown = await markdownFile.text();
      const importedTitle = inferImportedTitle(markdown, markdownFile.name);
      const localImageReferences = extractLocalMarkdownImageReferences(markdown);
      let nextMarkdown = markdown;
      let uploadedCount = 0;
      let missingReferences: string[] = [];

      if (localImageReferences.length && imageFiles.length && token) {
        const assetLookup = createImportAssetLookup(markdownFile, imageFiles);
        const uploadUrlByFileKey = new Map<string, string>();
        const resolvedReferenceMap = new Map<string, string>();
        const uploadedAssets: EditorAssetItem[] = [];

        for (const reference of localImageReferences) {
          const matchedAsset = assetLookup.get(reference);
          if (!matchedAsset) {
            missingReferences.push(reference);
            continue;
          }

          let uploadedUrl = uploadUrlByFileKey.get(matchedAsset.fileKey);
          if (!uploadedUrl) {
            const payload = await uploadAdminFile(token, matchedAsset.file, {
              directory: ARTICLE_IMAGE_DIRECTORY
            });
            uploadedUrl = payload.fileUrl;
            uploadUrlByFileKey.set(matchedAsset.fileKey, uploadedUrl);
            uploadedAssets.push(toEditorAsset(payload));
          }

          resolvedReferenceMap.set(reference, uploadedUrl);
        }

        if (uploadedAssets.length) {
          uploadedCount = uploadedAssets.length;
          setAssetItems((current) => mergeAssets(current, uploadedAssets));
        }

        nextMarkdown = replaceLocalMarkdownImages(
          markdown,
          (normalizedPath) => resolvedReferenceMap.get(normalizedPath),
        );
      } else if (localImageReferences.length) {
        missingReferences = localImageReferences;
      }

      setForm((current) => ({
        ...current,
        title: current.title || importedTitle,
        slug: current.slug || buildSlugFromTitle(importedTitle),
        summary: current.summary || excerpt(nextMarkdown, 160),
        contentMd: nextMarkdown
      }));

      const noticeParts = [`${markdownFile.name} 已导入编辑器。`];
      if (uploadedCount) {
        noticeParts.push(`已同步上传 ${uploadedCount} 张正文图片。`);
      }
      if (missingReferences.length) {
        noticeParts.push(
          `仍有 ${missingReferences.length} 个本地图片引用未匹配，请补选对应图片或手动替换链接。`,
        );
      }

      setNotice({
        tone: missingReferences.length ? "info" : "success",
        text: noticeParts.join(" ")
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Markdown 导入失败，请检查所选文件后重试。"
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleImportMarkdown = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const markdown = await file.text();
      const importedTitle = inferImportedTitle(markdown, file.name);

      setForm((current) => ({
        ...current,
        title: current.title || importedTitle,
        slug: current.slug || buildSlugFromTitle(importedTitle),
        summary: current.summary || excerpt(markdown, 160),
        contentMd: markdown
      }));
      setNotice({ tone: "success", text: `${file.name} 已导入编辑器。` });
    } catch {
      setNotice({ tone: "error", text: "Markdown 文件导入失败，请重试。" });
    } finally {
      event.target.value = "";
    }
  };

  const handleCopy = async (value: string, label = "图片地址") => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice({ tone: "success", text: `${label}已复制到剪贴板。` });
    } catch {
      setNotice({ tone: "error", text: `${label}复制失败，请手动复制。` });
    }
  };

  const handleAddExternalImage = () => {
    const nextUrl = externalImageUrl.trim();
    if (!nextUrl) {
      return;
    }

    prependAsset({
      key: `manual-${Date.now()}`,
      name: nextUrl.split("/").pop() || "external-image",
      url: nextUrl
    });
    setExternalImageUrl("");
    setNotice({ tone: "success", text: "外部图片地址已加入图片管理区。" });
  };

  const buildPayload = (nextStatus: ArticleStatus): AdminArticleSavePayload => ({
    title: form.title.trim(),
    slug: form.slug.trim(),
    summary: form.summary.trim() || undefined,
    coverImage: form.coverImage.trim() || undefined,
    contentMd: form.contentMd.trim(),
    categoryId: form.categoryId ? Number(form.categoryId) : undefined,
    status: nextStatus,
    isTop: form.isTop ? 1 : 0,
    sort: Number(form.sort || "0"),
    publishTime: toApiDateTimeValue(
      nextStatus === "published"
        ? form.publishTime || dayjs().format("YYYY-MM-DDTHH:mm")
        : form.publishTime,
    ),
    tagIds: form.tagIds
  });

  const handleSave = async (nextStatus: ArticleStatus) => {
    if (!token) {
      return;
    }

    if (!form.title.trim()) {
      setNotice({ tone: "error", text: "请先填写文章标题。" });
      return;
    }

    if (!form.slug.trim()) {
      setNotice({ tone: "error", text: "请先填写 slug。" });
      return;
    }

    if (!form.contentMd.trim()) {
      setNotice({ tone: "error", text: "正文内容不能为空。" });
      return;
    }

    setSavingState(nextStatus);
    setNotice({
      tone: "info",
      text: nextStatus === "published" ? "正在发布文章..." : "正在保存草稿..."
    });

    try {
      const payload = buildPayload(nextStatus);

      if (isEditing && articleId) {
        await updateAdminArticle(token, articleId, payload);
        try {
          await revalidateArticlePublicContent([originalSlug, payload.slug]);
        } catch (revalidateError) {
          console.error("Failed to revalidate article pages after update.", revalidateError);
        }
        setForm((current) => ({
          ...current,
          status: nextStatus,
          publishTime:
            nextStatus === "published" && !current.publishTime
              ? dayjs().format("YYYY-MM-DDTHH:mm")
              : current.publishTime
        }));
        setOriginalSlug(payload.slug);
        setNotice({
          tone: "success",
          text: nextStatus === "published" ? "文章已更新并发布。" : "草稿已更新。"
        });
      } else {
        const createdId = await createAdminArticle(token, payload);
        try {
          await revalidateArticlePublicContent([payload.slug]);
        } catch (revalidateError) {
          console.error("Failed to revalidate article pages after creation.", revalidateError);
        }
        setNotice({
          tone: "success",
          text: nextStatus === "published" ? "文章已创建并发布。" : "草稿已创建。"
        });
        router.replace(`/write/${createdId}`);
      }
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "保存失败，请稍后重试。"
      });
    } finally {
      setSavingState(null);
    }
  };

  if (!ready || loading) {
    return <StudioSkeleton />;
  }

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 px-4 pb-8 md:px-6 xl:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_14%_20%,rgba(115,221,209,0.16),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(249,218,122,0.14),transparent_28%),radial-gradient(circle_at_52%_72%,rgba(86,140,240,0.1),transparent_28%)] dark:bg-[radial-gradient(circle_at_14%_20%,rgba(52,211,196,0.14),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(245,158,11,0.08),transparent_28%),radial-gradient(circle_at_52%_72%,rgba(56,189,248,0.07),transparent_28%)]" />

      <div className="mx-auto max-w-[1460px] space-y-6">
        <Card className="overflow-hidden border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,245,238,0.92))] p-5 shadow-[0_24px_54px_-40px_rgba(58,67,92,0.32)] dark:border-white/8 dark:bg-[linear-gradient(135deg,rgba(11,18,32,0.97),rgba(15,24,39,0.94))] dark:shadow-[0_34px_72px_-42px_rgba(2,6,23,0.92)] md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <Link
                href="/admin/articles"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                返回文章管理
              </Link>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/72 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-muted-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-[#4dcfc4]" />
                  article studio
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-[2.7rem]">
                    {isEditing ? "编辑文章" : "写文章"}
                  </h1>
                  <AdminArticleStatusBadge status={form.status} />
                  {form.isTop ? <Badge variant="secondary">置顶</Badge> : null}
                </div>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
                  所有写文章入口现在统一进入这套独立创作界面，登录后即可继续新建或编辑文章。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={importInputRef}
                type="file"
                accept=".md,text/markdown,text/plain,image/*"
                multiple
                className="hidden"
                onChange={handleMarkdownBundleImport || handleImportMarkdown}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => importInputRef.current?.click()}
              >
                <FileDown className="h-4 w-4" />
                导入 MD
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="h-4 w-4" />
                预览
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={savingState !== null}
                onClick={() => handleSave("draft")}
              >
                {savingState === "draft" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                保存草稿
              </Button>
              <Button
                type="button"
                disabled={savingState !== null}
                onClick={() => handleSave("published")}
              >
                {savingState === "published" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
                发布文章
              </Button>
            </div>
          </div>
          {notice ? <AdminNotice tone={notice.tone} className="mt-5">{notice.text}</AdminNotice> : null}
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <div className="min-w-0 space-y-6">
            <Card className="overflow-hidden border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,247,242,0.82))] shadow-[0_22px_46px_-38px_rgba(58,67,92,0.26)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(10,17,31,0.96),rgba(11,19,33,0.93))] dark:shadow-[0_28px_60px_-38px_rgba(2,6,23,0.88)]">
              <div className="space-y-5 p-5 md:p-6">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="space-y-2">
                    <p className={adminFieldLabelClassName}>标题</p>
                    <Input
                      value={form.title}
                      onChange={(event) => handleTitleChange(event.target.value)}
                      placeholder="例如：把博客后台写作流整理成一套真正可发布的创作台"
                      className="h-14 rounded-[1rem] text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className={adminFieldLabelClassName}>Slug</p>
                    <Input
                      value={form.slug}
                      onChange={(event) => {
                        setSlugEdited(true);
                        setForm((current) => ({
                          ...current,
                          slug: event.target.value
                        }));
                      }}
                      placeholder="article-writing-studio"
                      className="h-14 rounded-[1rem] text-base"
                    />
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-border/65 bg-background/56 p-3 dark:border-white/8 dark:bg-white/[0.03]">
                  <Textarea
                    ref={contentRef}
                    value={form.contentMd}
                    onChange={(event) => handleContentChange(event.target.value)}
                    onBlur={rememberContentSelection}
                    onClick={rememberContentSelection}
                    onFocus={rememberContentSelection}
                    onKeyUp={rememberContentSelection}
                    onSelect={rememberContentSelection}
                    placeholder="在这里写 Markdown 正文。上传到右侧图片区的图片可以一键插入正文。"
                    className="min-h-[720px] rounded-[1.35rem] border-0 bg-transparent px-4 py-4 font-mono text-[14px] leading-8 shadow-none focus:ring-0 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/65 bg-background/70 px-3 py-1.5 dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300">
                    <PenSquare className="h-3.5 w-3.5" />
                    {wordCount} 字
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/65 bg-background/70 px-3 py-1.5 dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300">
                    分类：{selectedCategoryName}
                  </span>
                  {form.publishTime ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/65 bg-background/70 px-3 py-1.5 dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300">
                      发布时间：{formatDate(form.publishTime, "YYYY/MM/DD HH:mm")}
                    </span>
                  ) : null}
                </div>
              </div>
            </Card>
          </div>
          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Card className="space-y-4 border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,247,242,0.84))] p-5 shadow-[0_20px_40px_-34px_rgba(58,67,92,0.22)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,18,31,0.96),rgba(10,17,30,0.92))] dark:shadow-[0_24px_48px_-36px_rgba(2,6,23,0.86)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">封面</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    上传为主，也可以手动粘贴图片链接。
                  </p>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={coverUploading}
                >
                  {coverUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  上传
                </Button>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-border/65 bg-background/70 dark:border-white/8 dark:bg-white/[0.04]">
                <div className="flex h-56 items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(242,247,244,0.92))] dark:bg-[linear-gradient(135deg,rgba(18,29,48,0.88),rgba(10,18,31,0.94))]">
                  {form.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.coverImage} alt="文章封面" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                      <ImagePlus className="h-8 w-8" />
                      还没有设置封面
                    </div>
                  )}
                </div>
                <div className="space-y-3 border-t border-border/60 px-4 py-4 dark:border-white/8">
                  <Input
                    value={form.coverImage}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        coverImage: event.target.value
                      }))
                    }
                    placeholder="https://example.com/article-cover.png"
                  />
                  <div className="flex flex-wrap gap-2">
                    {form.coverImage ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(form.coverImage, "封面地址")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          复制
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              coverImage: ""
                            }))
                          }
                        >
                          清空
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-5 border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,247,242,0.84))] p-5 shadow-[0_20px_40px_-34px_rgba(58,67,92,0.22)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,18,31,0.96),rgba(10,17,30,0.92))] dark:shadow-[0_24px_48px_-36px_rgba(2,6,23,0.86)]">
              <div>
                <p className="text-sm font-semibold text-foreground">元信息</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  摘要、标签、分类和发布时间都会在这里统一维护。
                </p>
              </div>

              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>摘要 / 简介</p>
                <Textarea
                  value={form.summary}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      summary: event.target.value
                    }))
                  }
                  placeholder="给文章写一段简短摘要，用于列表卡片和页面导语。"
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>分类</p>
                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      categoryId: event.target.value
                    }))
                  }
                  className={adminSelectClassName}
                >
                  <option value="">未分类</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>发布时间</p>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="datetime-local"
                    value={form.publishTime}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        publishTime: event.target.value
                      }))
                    }
                    className="pl-11"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className={adminFieldLabelClassName}>排序</p>
                  <Input
                    type="number"
                    value={form.sort}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sort: event.target.value
                      }))
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      isTop: !current.isTop
                    }))
                  }
                  className={cn(
                    "flex min-h-[76px] items-center justify-between rounded-[1.2rem] border px-4 text-left transition-all",
                    form.isTop
                      ? "border-[#63d4cb]/45 bg-[#eefaf7] text-[#247c76] dark:border-[#2dd4bf]/20 dark:bg-[#0d2d33]/84 dark:text-[#98efe6]"
                      : "border-border/70 bg-background/60 text-muted-foreground hover:text-foreground dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-slate-100",
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">首页置顶</p>
                    <p className="mt-1 text-xs opacity-80">开启后更适合出现在首页重点位置。</p>
                  </div>
                  <span className="text-sm">{form.isTop ? "已开启" : "未开启"}</span>
                </button>
              </div>

              <div className="space-y-3">
                <p className={adminFieldLabelClassName}>标签</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const active = form.tagIds.includes(tag.id);

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          "rounded-full border px-3 py-2 text-sm transition-all",
                          active
                            ? "border-[#62d4cb]/45 bg-[#eefaf7] text-[#247c76] dark:border-[#2dd4bf]/20 dark:bg-[#0d2d33]/84 dark:text-[#98efe6]"
                            : "border-border/70 bg-background/60 text-muted-foreground hover:text-foreground dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-slate-100",
                        )}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
                {!selectedTags.length ? (
                  <p className="text-sm text-muted-foreground">还没有选中标签。</p>
                ) : null}
              </div>
            </Card>

            <Card className="space-y-5 border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,247,242,0.84))] p-5 shadow-[0_20px_40px_-34px_rgba(58,67,92,0.22)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,18,31,0.96),rgba(10,17,30,0.92))] dark:shadow-[0_24px_48px_-36px_rgba(2,6,23,0.86)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">图片管理</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    直接上传到阿里云 OSS，成功后可插入正文、复制链接或设置为封面。
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={assetInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAssetUpload}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => assetInputRef.current?.click()}
                    disabled={assetUploading}
                  >
                    {assetUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileUp className="h-3.5 w-3.5" />
                    )}
                    上传
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => void loadAssets(true)}
                    disabled={assetsLoading}
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", assetsLoading && "animate-spin")} />
                    刷新
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={externalImageUrl}
                  onChange={(event) => setExternalImageUrl(event.target.value)}
                  placeholder="粘贴外部图片链接，作为补充素材"
                />
                <Button type="button" variant="secondary" onClick={handleAddExternalImage}>
                  添加
                </Button>
              </div>

              {assetsLoading ? (
                <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-background/56 px-4 py-10 text-center text-sm text-muted-foreground dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300">
                  正在读取 OSS 图片...
                </div>
              ) : assetItems.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {assetItems.map((asset) => (
                    <div
                      key={asset.key}
                      className="overflow-hidden rounded-[1.35rem] border border-border/65 bg-background/72 dark:border-white/8 dark:bg-white/[0.04]"
                    >
                      <div className="flex h-32 items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(243,247,244,0.92))] dark:bg-[linear-gradient(135deg,rgba(18,29,48,0.88),rgba(10,18,31,0.94))]">
                        {looksLikeImage(asset.url, asset.contentType) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlus className="h-7 w-7 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-3 px-3 py-3">
                        <div>
                          <p className="line-clamp-1 text-sm font-medium text-foreground">{asset.name}</p>
                          {asset.createdAt ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(asset.createdAt, "YYYY/MM/DD HH:mm")}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => insertIntoMarkdown(`${buildImageMarkdown(asset.url, asset.name)}\n`)}
                          >
                            插入
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(asset.url)}
                          >
                            复制
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                coverImage: asset.url
                              }))
                            }
                          >
                            设为封面
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-background/56 px-4 py-10 text-center text-sm text-muted-foreground dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300">
                  还没有图片素材，先上传一张图试试。
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <AdminModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={form.title || "文章预览"}
        description="这里会尽量贴近前台文章页的阅读效果。"
        className="max-w-[1120px]"
      >
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{selectedCategoryName}</Badge>
              {selectedTags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  #{tag.name}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-[3rem]">
              {form.title || "这里会显示文章标题"}
            </h1>
            <p className="max-w-3xl text-sm leading-8 text-muted-foreground md:text-base">
              {form.summary || "这里会显示文章摘要。"}
            </p>
          </div>
          {form.coverImage ? (
            <div className="overflow-hidden rounded-[1.6rem] border border-border/60 bg-background/70 dark:border-white/8 dark:bg-white/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.coverImage} alt="预览封面" className="h-[280px] w-full object-cover" />
            </div>
          ) : null}
          <div className="rounded-[1.6rem] border border-border/60 bg-background/72 p-5 dark:border-white/8 dark:bg-white/[0.04] md:p-6">
            <AdminMarkdownPreview content={previewContent} />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
