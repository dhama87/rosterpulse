import { RuleChangesModal } from "./RuleChangesModal";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 sm:px-6 py-3 text-[11px] text-text-muted flex items-center justify-between">
      <span>Data via ESPN. Not affiliated with the NFL.</span>
      <div className="flex items-center gap-3">
        <RuleChangesModal />
        <span className="font-mono">RosterPulse &copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
