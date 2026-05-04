import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  action: string;
  placeholder: string;
  defaultValue?: string;
  hiddenFields?: Record<string, string | number | undefined>;
  inputName?: string;
}

export function SearchBar({
  action,
  placeholder,
  defaultValue,
  hiddenFields,
  inputName = "keyword"
}: SearchBarProps) {
  return (
    <form
      action={action}
      className="relative flex w-full flex-col gap-3.5 sm:flex-row sm:items-center"
    >
      <Search className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-muted-foreground sm:top-[1.02rem]" />
      <Input
        name={inputName}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-12 rounded-[1.2rem] border-border/60 bg-background/88 pl-11 text-[0.95rem] leading-none shadow-none placeholder:text-muted-foreground/90"
      />
      <Button
        type="submit"
        variant="secondary"
        className="page-button-text h-12 shrink-0 rounded-[1.08rem] px-5"
      >
        搜索
      </Button>
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
