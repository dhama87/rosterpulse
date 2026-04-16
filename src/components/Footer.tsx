export function Footer() {
  return (
    <footer className="border-t border-border px-4 sm:px-6 py-3 text-[11px] text-text-muted flex items-center justify-between">
      <span>Data via ESPN. Not affiliated with the NFL.</span>
      <span className="font-mono">RosterPulse &copy; {new Date().getFullYear()}</span>
    </footer>
  );
}
