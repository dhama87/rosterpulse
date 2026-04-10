export function SourceCitation() {
  return (
    <footer className="border-t border-border-light bg-bg-warm px-6 py-4 text-center text-xs text-text-muted">
      <p>
        ICD-10-CM codes maintained by{" "}
        <a href="https://www.cms.gov/medicare/coding-billing" className="underline hover:text-text-secondary" target="_blank" rel="noopener noreferrer">CMS</a>
        . HCPCS codes maintained by{" "}
        <a href="https://www.cms.gov/medicare/coding-billing/hcpcs-release-code-sets" className="underline hover:text-text-secondary" target="_blank" rel="noopener noreferrer">CMS</a>
        . Fee schedule data from the{" "}
        <a href="https://www.cms.gov/medicare/payment/physician-fee-schedule" className="underline hover:text-text-secondary" target="_blank" rel="noopener noreferrer">Medicare Physician Fee Schedule</a>
        . CARC/RARC codes from{" "}
        <a href="https://x12.org/codes" className="underline hover:text-text-secondary" target="_blank" rel="noopener noreferrer">X12</a>.
      </p>
      <p className="mt-1">
        This tool is for reference only and does not constitute medical or billing advice.
      </p>
    </footer>
  );
}
