import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { SeasonCountdown } from "./SeasonCountdown";

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
    <header className="flex items-center border-b border-border">
      {/* Left section — fills remaining space */}
      <div className="flex flex-1 items-center justify-between px-4 sm:px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-text-primary">
            RosterPulse
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-status-green-bg px-2 py-0.5 text-[10px] font-semibold text-status-green">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-green" />
            LIVE
          </span>
        </Link>
        <Link
          href="/injuries"
          className="hidden sm:inline text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Injuries
        </Link>
        <Link
          href="/schedule"
          className="hidden sm:inline text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Schedule
        </Link>
        <Link
          href="/draft"
          className="hidden sm:inline text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Draft
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:block"><SeasonCountdown /></span>
          <span className="hidden sm:inline font-mono text-[11px] text-text-muted">
            Verified {formatVerified(lastVerified)}
          </span>
        </div>
      </div>
      {/* Right section — matches news sidebar width */}
      <div className="hidden lg:flex w-[380px] items-center border-l border-border px-4 py-3">
        <SearchBar />
      </div>
      {/* Mobile search */}
      <div className="lg:hidden px-4 py-3">
        <SearchBar />
      </div>
    </header>
  );
}
