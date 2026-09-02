"use client";

import { copy } from "@/app/content";
import { useT } from "@/app/lib/i18n";

export function SkipLink() {
  const t = useT();
  return (
    <a className="skip-link" href="#work">
      {t(copy.skipToContent)}
    </a>
  );
}
