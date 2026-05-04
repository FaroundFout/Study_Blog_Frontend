import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildQueryString } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pathname: string;
  query: Record<string, string | number | undefined>;
}

export function Pagination({
  page,
  pageSize,
  total,
  pathname,
  query
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const createHref = (nextPage: number) =>
    `${pathname}${buildQueryString({ ...query, page: nextPage })}`;

  return (
    <div className="page-panel flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="page-support-text">
        第 {page} / {totalPages} 页，共 {total} 条内容
      </p>
      <div className="flex items-center gap-2">
        {page <= 1 ? (
          <Button variant="secondary" size="sm" className="page-button-text" disabled>
            上一页
          </Button>
        ) : (
          <Link href={createHref(page - 1)}>
            <Button variant="secondary" size="sm" className="page-button-text">
              上一页
            </Button>
          </Link>
        )}
        {page >= totalPages ? (
          <Button variant="secondary" size="sm" className="page-button-text" disabled>
            下一页
          </Button>
        ) : (
          <Link href={createHref(page + 1)}>
            <Button variant="secondary" size="sm" className="page-button-text">
              下一页
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
