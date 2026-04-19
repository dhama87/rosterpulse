export interface RuleChange {
  title: string;
  description: string;
}

export const ruleChanges: RuleChange[] = [
  // Updated once per year when NFL announces rule changes.
  // Leave empty to hide the "Rule Changes" link in the footer.
  //
  // Example:
  // {
  //   title: "Dynamic Kickoff",
  //   description: "New kickoff format with aligned teams, designed to increase return rates and reduce injuries.",
  // },
];
