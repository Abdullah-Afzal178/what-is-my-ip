import { POWERED_BY_URL } from "@/lib/constants";

type PoweredByBadgeProps = {
  compact?: boolean;
  className?: string;
};

export function PoweredByBadge({
  compact = false,
  className,
}: PoweredByBadgeProps) {
  return (
    <footer
      className={[
        compact ? "py-2" : "border-t border-slate-200 py-6",
        className ?? "",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
        <a
          href={POWERED_BY_URL}
          target="_blank"
          rel="noreferrer"
          className={[
            "inline-flex items-center font-medium transition hover:text-slate-950",
            compact
              ? "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-slate-400"
              : "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:border-slate-400",
          ].join(" ")}
        >
          Powered by ipgeolocation.io
        </a>
      </div>
    </footer>
  );
}
