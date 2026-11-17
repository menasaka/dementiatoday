"use client";

import { usePathname } from "next/navigation";

/** Renders its children except on the listed paths. */
export function HideOn({ paths, children }: { paths: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const p = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return paths.includes(p) ? null : <>{children}</>;
}
