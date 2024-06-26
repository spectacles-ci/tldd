export type Summarizer = {
  id: string;
  name: string;
  recipients: string[];
  usePriorReports: boolean;
  attachOriginal: boolean;
  customInstructions: string | null;
};

export type SummarizerRow = {
  id: string;
  name: string;
  last_receipt_timestamp?: string;
  recipients: string[];
};
