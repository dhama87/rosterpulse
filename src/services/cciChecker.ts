import { CCIEdit } from "@/types";

export function checkCCIEdits(
  edits: CCIEdit[],
  code1: string,
  code2: string
): CCIEdit | null {
  for (const edit of edits) {
    const match =
      (edit.column1Code === code1 && edit.column2Code === code2) ||
      (edit.column1Code === code2 && edit.column2Code === code1);
    if (match) return edit;
  }
  return null;
}
