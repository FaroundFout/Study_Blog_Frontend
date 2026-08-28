import type { Metadata } from "next";
import { CalendarDays, ExternalLink, Globe2, LibraryBig } from "lucide-react";
import { notFound } from "next/navigation";

import { ArchiveDossier } from "@/components/reader/archive-dossier";
import { getResources } from "@/lib/api";
import { extractHeadings, formatDate, splitCommaText } from "@/lib/utils";
import type { ResourceCollection, ResourceItem } from "@/types";

interface ResourceDetailPageProps {
  params: {
    id: string;
  };
}

interface ResourceRecord {
  item: ResourceItem;
  collection: ResourceCollection;
  collectionIndex: number;
  itemIndex: number;
}

export async function generateMetadata({ params }: ResourceDetailPageProps): Promise<Metadata> {
  const record = await getResourceRecord(Number(params.id));

  return {
    title: record?.item.title || "资源不存在",
    description: record?.item.summary
  };
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const id = Number(params.id);
  const records = await getResourceRecords();
  const currentIndex = records.findIndex((record) => record.item.id === id);

  if (currentIndex < 0) {
    notFound();
  }

  const record = records[currentIndex];
  const { item, collection, collectionIndex, itemIndex } = record;
  const hostname = getHostname(item.linkUrl);
  const tags = splitCommaText(item.tagsText);
  const content = buildResourceNotes(item, collection, hostname, tags);
  const recordNumber = `R-${String(collectionIndex + 1).padStart(2, "0")}.${String(itemIndex + 1).padStart(2, "0")}`;
  const previous = records[currentIndex - 1];
  const next = records[currentIndex + 1];

  return (
    <ArchiveDossier
      kind="resource"
      sectionNumber="04"
      recordNumber={recordNumber}
      dossierLabel="Resource dossier"
      breadcrumbs={[
        { label: "资源", href: "/resources" },
        { label: collection.name, href: `/resources#${collection.slug}` }
      ]}
      kickerLabel="Resource record"
      kickerValue={collection.name}
      kickerIcon={LibraryBig}
      title={item.title}
      summary={item.summary}
      facts={[
        { label: "Source", value: item.sourceName || "External reference", icon: LibraryBig },
        { label: "Added", value: item.createdAt ? formatDate(item.createdAt, "YYYY.MM.DD") : "未记录", icon: CalendarDays },
        { label: "Website", value: hostname, icon: Globe2 }
      ]}
      tags={tags.map((tag) => ({ label: tag }))}
      actions={[
        { label: "访问原始资源", href: item.linkUrl, icon: ExternalLink, external: true }
      ]}
      coverImage={item.coverImage}
      coverAlt={`${item.title} 资源封面`}
      coverCaption="资源封面 / Resource reference"
      content={content}
      contentLabel="Reference file / 资源详情"
      headings={extractHeadings(content)}
      backHref="/resources"
      backLabel="返回资源索引"
      indexLabel="Resource index"
      previous={previous ? { label: previous.item.title, href: `/resources/${previous.item.id}` } : null}
      next={next ? { label: next.item.title, href: `/resources/${next.item.id}` } : null}
      previousLabel="上一条资源"
      nextLabel="下一条资源"
    />
  );
}

async function getResourceRecord(id: number) {
  const records = await getResourceRecords();
  return records.find((record) => record.item.id === id) ?? null;
}

async function getResourceRecords(): Promise<ResourceRecord[]> {
  const collections = await getResources();

  return collections.flatMap((collection, collectionIndex) =>
    (collection.items ?? []).map((item, itemIndex) => ({
      item,
      collection,
      collectionIndex,
      itemIndex
    }))
  );
}

function buildResourceNotes(
  item: ResourceItem,
  collection: ResourceCollection,
  hostname: string,
  tags: string[]
) {
  const lines = [
    "## 资源说明",
    "",
    escapeMarkdown(item.summary || "这条资源暂时没有补充说明。"),
    "",
    "## 收录信息",
    "",
    `- **所属合集：** ${escapeMarkdown(collection.name)}`,
    `- **来源：** ${escapeMarkdown(item.sourceName || "External reference")}`,
    `- **站点：** ${escapeMarkdown(hostname)}`,
    `- **收录日期：** ${item.createdAt ? formatDate(item.createdAt, "YYYY.MM.DD") : "未记录"}`
  ];

  if (tags.length) {
    lines.push(`- **关键词：** ${tags.map((tag) => escapeMarkdown(tag)).join("、")}`);
  }

  lines.push(
    "",
    "## 使用提示",
    "",
    "> 本页保存的是资源索引与简要说明。具体内容、版权与更新状态以原始站点为准，请通过页面上方按钮访问来源。"
  );

  return lines.join("\n");
}

function getHostname(linkUrl: string) {
  try {
    return new URL(linkUrl).hostname.replace(/^www\./, "");
  } catch {
    return "external-resource";
  }
}

function escapeMarkdown(value: string) {
  return value.replace(/([\\`*_[\]{}()#+.!|>-])/g, "\\$1");
}
