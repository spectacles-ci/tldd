import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { Summarizer, SummarizerFormState } from "../types";
import { SummarizerWebhook } from "../components/SummarizerWebhook";
import { SummarizerForm } from "../components/SummarizerForm";

export default function EditSummarizerForm({ summarizer }: { summarizer: Summarizer }) {
    const form = useForm<SummarizerFormState>({
        defaultValues: summarizer,
    });

    return (
        <>
            <SummarizerWebhook summarizerId={summarizer.id} />
            <SummarizerForm form={form} summarizerId={summarizer.id} actionText="Update" />
        </>
    );
}
