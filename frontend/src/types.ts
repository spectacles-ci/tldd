export type Summarizer = {
    id: string;
    name: string;
    recipients: string[];
    usePriorReports: boolean;
    attachPdf: boolean;
    customInstructions: string | null;
    recipient: string;
};

export type SummarizerRow = {
    id: string;
    name: string;
    last_receipt_timestamp?: string;
    recipients: string[];
};
