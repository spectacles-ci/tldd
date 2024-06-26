import { SummarizerFormState, SummarizerData } from "./types";

export function toSummarizerData(formState: SummarizerFormState): SummarizerData {
    return {
        id: formState.id,
        name: formState.name,
        recipients: formState.recipients,
        use_prior_reports: formState.usePriorReports,
        attach_pdf: formState.attachPdf,
        custom_instructions: formState.customInstructions,
    };
}
