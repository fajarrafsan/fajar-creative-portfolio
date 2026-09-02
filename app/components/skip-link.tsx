"use client";

import { copy } from "./content";
import { useT } from "./i18n";

export function SkipLink() {
  const t = useT();
  return (
    <a className="skip-link" href="#work">
      {t(copy.skipToContent)}
    </a>
  );
}
