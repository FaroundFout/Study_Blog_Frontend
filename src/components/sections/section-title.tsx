import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  href,
  hrefLabel
}: SectionTitleProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2.5">
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[1.85rem] font-semibold leading-tight text-foreground md:text-[2.2rem]">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-7 text-muted-foreground md:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {href && hrefLabel ? (
        <Link href={href} className="subtle-link">
          {hrefLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
