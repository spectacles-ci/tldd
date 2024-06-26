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
        <div className="container mt-8 mx-auto px-4 mb-8">
            <div className="max-w-3xl flex flex-col gap-y-6">
                <h1 className="text-xl text-gray-950">Create a Summarizer</h1>
                <SummarizerWebhook summarizerId={summarizer.id} />
                <SummarizerForm form={form} summarizerId={summarizer.id} actionText="Update" />
            </div>
        </div>
    );
}
