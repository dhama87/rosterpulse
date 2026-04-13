import Link from "next/link";
import { SearchBar } from "./SearchBar";

interface TopBarProps {
  lastVerified: string;
}

function formatVerified(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function TopBar({ lastVerified }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <Link href="/" className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight text-text-primary">
          RosterPulse
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-status-green-bg px-2 py-0.5 text-[10px] font-semibold text-status-green">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-green" />
          LIVE
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <SearchBar />
        <span className="font-mono text-[11px] text-text-muted">
          Verified {formatVerified(lastVerified)}
        </span>
      </div>
    </header>
  );
}
