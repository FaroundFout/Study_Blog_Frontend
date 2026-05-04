import type { UploadedFilePayload } from "@/types";

import { mockNow } from "@/lib/mock/site";

export const mockUploadedFiles: UploadedFilePayload[] = [
  {
    id: 1,
    originalName: "study-garden-cover.png",
    storedName: "study-garden-cover-20260414.png",
    filePath: "uploads/2026/04/study-garden-cover-20260414.png",
    fileUrl: "/images/project-garden.svg",
    fileSize: 184032,
    contentType: "image/svg+xml",
    createdAt: mockNow
  },
  {
    id: 2,
    originalName: "resource-atlas.png",
    storedName: "resource-atlas-20260413.png",
    filePath: "uploads/2026/04/resource-atlas-20260413.png",
    fileUrl: "/images/resource-atlas.svg",
    fileSize: 92318,
    contentType: "image/svg+xml",
    createdAt: mockNow
  },
  {
    id: 3,
    originalName: "avatar-main.png",
    storedName: "avatar-main-20260412.png",
    filePath: "uploads/2026/04/avatar-main-20260412.png",
    fileUrl: "/images/avatar-main.svg",
    fileSize: 45672,
    contentType: "image/svg+xml",
    createdAt: mockNow
  },
  {
    id: 4,
    originalName: "article-pattern.png",
    storedName: "article-pattern-20260411.png",
    filePath: "uploads/2026/04/article-pattern-20260411.png",
    fileUrl: "/images/article-pattern.svg",
    fileSize: 104288,
    contentType: "image/svg+xml",
    createdAt: mockNow
  }
];
