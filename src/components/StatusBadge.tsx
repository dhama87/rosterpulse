import { InjuryStatus } from "@/types";

const statusConfig: Record<
  InjuryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  Active: {
    label: "ACTIVE",
    bg: "bg-status-green-bg",
    text: "text-status-green",
    border: "border-status-green",
  },
  Questionable: {
    label: "QUESTIONABLE",
    bg: "bg-status-amber-bg",
    text: "text-status-amber",
    border: "border-status-amber",
  },
  Doubtful: {
    label: "DOUBTFUL",
    bg: "bg-status-amber-bg",
    text: "text-status-amber",
    border: "border-status-amber",
  },
  Out: {
    label: "OUT",
    bg: "bg-status-red-bg",
    text: "text-status-red",
    border: "border-status-red",
  },
  IR: {
    label: "IR",
    bg: "bg-status-red-bg",
    text: "text-status-red",
    border: "border-status-red",
  },
  Suspended: {
    label: "SUSPENDED",
    bg: "bg-status-red-bg",
    text: "text-status-red",
    border: "border-status-red",
  },
  Holdout: {
    label: "HOLDOUT",
    bg: "bg-status-amber-bg",
    text: "text-status-amber",
    border: "border-status-amber",
  },
};

interface StatusBadgeProps {
  status: InjuryStatus;
  showOnlyIfNotActive?: boolean;
}

export function StatusBadge({
  status,
  showOnlyIfNotActive = false,
}: StatusBadgeProps) {
  if (showOnlyIfNotActive && status === "Active") return null;

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
