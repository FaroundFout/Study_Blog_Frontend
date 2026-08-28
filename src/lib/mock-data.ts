import type { HomeData, PageResponse } from "@/types";

import { mockArticles } from "@/lib/mock/articles";
import { mockDiaries } from "@/lib/mock/diaries";
import { mockHomeMusic } from "@/lib/mock/music";
import { mockProjects } from "@/lib/mock/projects";
import { mockResourceCollections } from "@/lib/mock/resources";
import {
  createHomeData,
  mockAdminUser,
  mockCategories,
  mockSiteInfo,
  mockTags
} from "@/lib/mock/site";
import { mockUploadedFiles } from "@/lib/mock/uploads";

export * from "@/lib/mock/articles";
export * from "@/lib/mock/diaries";
export * from "@/lib/mock/music";
export * from "@/lib/mock/projects";
export * from "@/lib/mock/resources";
export * from "@/lib/mock/site";
export * from "@/lib/mock/uploads";

export const mockHomeData: HomeData = createHomeData({
  latestArticles: mockArticles.slice(0, 6),
  latestDiaries: mockDiaries.slice(0, 5),
  featuredProjects: mockProjects.filter((item) => item.isFeatured === 1).slice(0, 4),
  resourceCollections: mockResourceCollections
});

export function paginate<T>(items: T[], pageNum = 1, pageSize = 10): PageResponse<T> {
  const startIndex = (pageNum - 1) * pageSize;
  const sliced = items.slice(startIndex, startIndex + pageSize);

  return {
    total: items.length,
    pageNum,
    pageSize,
    list: sliced
  };
}

void mockSiteInfo;
void mockCategories;
void mockTags;
void mockAdminUser;
void mockUploadedFiles;
void mockHomeMusic;
