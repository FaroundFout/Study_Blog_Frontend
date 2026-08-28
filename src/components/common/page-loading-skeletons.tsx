import { LoadingSkeleton } from "@/components/common/loading-skeleton";

function LoadingRegion({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-busy="true" aria-label={label} className="space-y-6">
      {children}
    </section>
  );
}

function PaperPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.6rem] border border-border/70 bg-card/72 p-5 shadow-[0_18px_40px_-34px_rgba(51,43,31,0.3)] md:p-7 dark:bg-card/62">
      {children}
    </div>
  );
}

export function HomeLoadingSkeleton() {
  return (
    <LoadingRegion label="首页内容加载中">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.7fr)]">
        <PaperPanel>
          <LoadingSkeleton className="h-4 w-28 rounded-full" />
          <LoadingSkeleton className="mt-5 h-16 w-4/5 rounded-[1.1rem] md:h-20" />
          <LoadingSkeleton className="mt-5 h-5 w-full max-w-2xl rounded-full" />
          <LoadingSkeleton className="mt-3 h-5 w-3/4 rounded-full" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-24 rounded-[1.2rem]" />
            ))}
          </div>
        </PaperPanel>
        <PaperPanel>
          <LoadingSkeleton circle className="mx-auto h-28 w-28" />
          <LoadingSkeleton className="mx-auto mt-5 h-7 w-2/3 rounded-full" />
          <LoadingSkeleton className="mx-auto mt-3 h-4 w-4/5 rounded-full" />
          <LoadingSkeleton className="mt-7 h-24 rounded-[1.3rem]" />
        </PaperPanel>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <PaperPanel key={index}>
            <LoadingSkeleton className="h-44 rounded-[1.25rem]" />
            <LoadingSkeleton className="mt-5 h-7 w-4/5 rounded-full" />
            <LoadingSkeleton className="mt-3 h-4 w-full rounded-full" />
            <LoadingSkeleton className="mt-2 h-4 w-2/3 rounded-full" />
          </PaperPanel>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function CatalogLoadingSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <LoadingRegion label="目录内容加载中">
      <PaperPanel>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <LoadingSkeleton className="h-4 w-24 rounded-full" />
            <LoadingSkeleton className="mt-5 h-14 w-3/4 rounded-[1rem] md:h-16" />
            <LoadingSkeleton className="mt-4 h-5 w-full max-w-2xl rounded-full" />
          </div>
          <LoadingSkeleton className="h-24 rounded-[1.25rem]" />
        </div>
      </PaperPanel>
      <PaperPanel>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_repeat(2,160px)]">
          <LoadingSkeleton className="h-11 rounded-full" />
          <LoadingSkeleton className="h-11 rounded-full" />
          <LoadingSkeleton className="h-11 rounded-full" />
        </div>
      </PaperPanel>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <PaperPanel key={index}>
            <LoadingSkeleton className="h-40 rounded-[1.2rem]" />
            <LoadingSkeleton className="mt-5 h-4 w-24 rounded-full" />
            <LoadingSkeleton className="mt-3 h-8 w-4/5 rounded-full" />
            <LoadingSkeleton className="mt-4 h-4 w-full rounded-full" />
            <LoadingSkeleton className="mt-2 h-4 w-3/4 rounded-full" />
          </PaperPanel>
        ))}
      </div>
      <LoadingSkeleton className="mx-auto h-11 w-72 max-w-full rounded-full" />
    </LoadingRegion>
  );
}

export function DetailLoadingSkeleton() {
  return (
    <LoadingRegion label="详情内容加载中">
      <PaperPanel>
        <LoadingSkeleton className="h-4 w-28 rounded-full" />
        <LoadingSkeleton className="mt-5 h-16 w-4/5 rounded-[1rem] md:h-20" />
        <div className="mt-6 flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <LoadingSkeleton className="mt-8 h-[clamp(220px,42vw,520px)] rounded-[1.5rem]" />
      </PaperPanel>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <PaperPanel>
          <LoadingSkeleton count={12} className="mb-3 h-5 rounded-full" />
        </PaperPanel>
        <div className="space-y-6">
          <PaperPanel>
            <LoadingSkeleton className="h-6 w-2/3 rounded-full" />
            <LoadingSkeleton count={5} className="mt-4 h-4 rounded-full" />
          </PaperPanel>
          <PaperPanel>
            <LoadingSkeleton className="h-28 rounded-[1.2rem]" />
          </PaperPanel>
        </div>
      </div>
    </LoadingRegion>
  );
}

export function DossierDetailLoadingSkeleton({ label = "档案详情加载中" }: { label?: string }) {
  return (
    <LoadingRegion label={label}>
      <div className="border-y border-[color:var(--catalog-line-strong)] py-3">
        <div className="flex items-center justify-between gap-4">
          <LoadingSkeleton className="h-3 w-44 rounded-none" />
          <LoadingSkeleton className="h-3 w-16 rounded-none" />
        </div>
      </div>

      <div className="max-w-[70rem] py-3 md:py-5">
        <LoadingSkeleton className="h-3 w-36 rounded-none" />
        <LoadingSkeleton className="mt-4 h-16 w-4/5 rounded-none md:h-20" />
        <LoadingSkeleton className="mt-5 h-4 w-full max-w-3xl rounded-none" />
        <LoadingSkeleton className="mt-2.5 h-4 w-2/3 rounded-none" />
        <div className="mt-6 flex flex-wrap gap-3">
          <LoadingSkeleton className="h-11 w-28 rounded-none" />
          <LoadingSkeleton className="h-11 w-32 rounded-none" />
        </div>
        <div className="mt-7 grid border-y border-[color:var(--catalog-line-strong)] sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border-[color:var(--catalog-line)] px-3 py-4 sm:[&:not(:first-child)]:border-l">
              <LoadingSkeleton className="h-3 w-16 rounded-none" />
              <LoadingSkeleton className="mt-2 h-5 w-4/5 rounded-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid justify-center gap-7 pt-7 lg:grid-cols-[12rem_minmax(0,64rem)] xl:gap-12">
        <aside className="hidden space-y-5 lg:block">
          <LoadingSkeleton className="h-11 rounded-none" />
          <LoadingSkeleton count={5} className="mb-2 h-4 rounded-none" />
        </aside>
        <div className="border border-[color:var(--catalog-line-strong)] bg-card/80 shadow-[8px_10px_0_rgba(21,56,47,0.08)]">
          <div className="flex items-center justify-between border-b border-[color:var(--catalog-line-strong)] px-6 py-3">
            <LoadingSkeleton className="h-3 w-36 rounded-none" />
            <LoadingSkeleton className="h-3 w-14 rounded-none" />
          </div>
          <div className="px-6 py-10 md:px-16">
            <LoadingSkeleton className="h-10 w-3/5 rounded-none" />
            <LoadingSkeleton count={9} className="mb-3 mt-5 h-4 rounded-none" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}

export function ProjectDetailLoadingSkeleton() {
  return <DossierDetailLoadingSkeleton label="项目档案加载中" />;
}

export function NarrativeLoadingSkeleton() {
  return (
    <LoadingRegion label="页面内容加载中">
      <PaperPanel>
        <LoadingSkeleton className="h-4 w-24 rounded-full" />
        <LoadingSkeleton className="mt-5 h-16 w-2/3 rounded-[1rem]" />
        <LoadingSkeleton className="mt-5 h-5 w-full rounded-full" />
        <LoadingSkeleton className="mt-3 h-5 w-4/5 rounded-full" />
      </PaperPanel>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <PaperPanel>
          <LoadingSkeleton count={10} className="mb-3 h-5 rounded-full" />
        </PaperPanel>
        <PaperPanel>
          <LoadingSkeleton circle className="mx-auto h-32 w-32" />
          <LoadingSkeleton className="mx-auto mt-5 h-7 w-2/3 rounded-full" />
          <LoadingSkeleton count={4} className="mt-4 h-4 rounded-full" />
        </PaperPanel>
      </div>
    </LoadingRegion>
  );
}
