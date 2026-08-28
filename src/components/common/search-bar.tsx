import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  action: string;
  placeholder: string;
  defaultValue?: string;
  hiddenFields?: Record<string, string | number | undefined>;
  inputName?: string;
  label?: string;
  showButton?: boolean;
}

export function SearchBar({
  action,
  placeholder,
  defaultValue,
  hiddenFields,
  inputName = "keyword",
  label = "搜索关键词",
  showButton = true
}: SearchBarProps) {
  return (
    <form
      action={action}
      className="relative flex w-full flex-col gap-3.5 sm:flex-row sm:items-center"
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-4 h-4 w-4 stroke-[1.75] text-[var(--catalog-ink-soft)] sm:top-[1.02rem]"
      />
      <Input
        name={inputName}
        aria-label={label}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-12 rounded-[0.15rem] border-[color:var(--catalog-line-strong)] bg-[var(--catalog-card)] pl-11 text-[0.95rem] leading-none shadow-none placeholder:text-[var(--catalog-ink-soft)] focus:border-[var(--catalog-cobalt)] focus:ring-[3px] focus:ring-[rgba(24,61,168,0.14)]"
      />
      {showButton ? (
        <Button
          type="submit"
          variant="secondary"
          className="page-button-text h-12 shrink-0 rounded-[0.15rem] border-[color:var(--catalog-line-strong)] px-6 shadow-[3px_3px_0_rgba(21,56,47,0.13)] hover:border-[var(--catalog-cobalt)] hover:text-[var(--catalog-cobalt)]"
        >
          搜索
        </Button>
      ) : null}
      {hiddenFields
        ? Object.entries(hiddenFields).map(([key, value]) =>
            value === undefined ? null : (
              <input key={key} type="hidden" name={key} value={value} />
            ),
          )
        : null}
    </form>
  );
}
