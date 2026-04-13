export interface ScrapedItem {
  type: "player" | "news";
  sourceAdapter: string;
  source: string;
  sourceUrl: string;
  confidence: "reported" | "official";
  rawData: Record<string, unknown>;
  fetchedAt: string;
}

export interface AdapterResult {
  adapter: string;
  status: "success" | "error";
  items: ScrapedItem[];
  itemsFound: number;
  errorMessage?: string;
  startedAt: string;
  completedAt: string;
}

export interface SourceAdapter {
  name: string;
  fetch(): Promise<ScrapedItem[]>;
}
