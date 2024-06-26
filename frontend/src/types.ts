type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
    ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
    : S;

export type Summarizer = {
    id: string;
    name: string;
    recipients: string[];
    usePriorReports: boolean;
    attachPdf: boolean;
    customInstructions: string | null;
};

export type ApiSummarizer = {
    [K in keyof Summarizer as CamelToSnakeCase<K>]: Summarizer[K];
};

export type SummarizerFormState = Summarizer & {
    recipient: string;
};

export type Receipt = {
    timestamp: string;
    summarizer_id: string;
    report_location: string;
};

export type SummarizerRow = {
    id: string;
    name: string;
    last_receipt_timestamp?: string;
    recipients: string[];
};

export type SummaryRequest = {
    summarizer: Summarizer;
    receipt: Receipt;
};
