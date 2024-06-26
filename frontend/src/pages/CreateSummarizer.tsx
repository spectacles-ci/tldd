import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

import type { SummarizerFormState } from "../types";
import { SummarizerForm } from "../components/SummarizerForm";
import { SummarizerWebhook } from "../components/SummarizerWebhook";

function generateShortUUID(): string {
    const numberOfChars = 8;
    const characters = "0123456789abcdefghijklmnopqrstuvwxyz";
    const base = characters.length;
    let number = Math.floor(Math.random() * Math.pow(base, numberOfChars)); // Generates a number between 0 and base^8 - 1
    let shortUUID = "";

    while (number > 0) {
        shortUUID = characters[number % base] + shortUUID;
        number = Math.floor(number / base);
    }

    // Ensure the length is consistent
    while (shortUUID.length < numberOfChars) {
        shortUUID = "0" + shortUUID;
    }

    return shortUUID;
}

export default function CreateSummarizer() {
    const form = useForm<SummarizerFormState>({
        defaultValues: {
            id: generateShortUUID(),
            name: "",
            recipient: "",
            recipients: [],
            usePriorReports: true,
            attachPdf: true,
            customInstructions: null,
        },
    });

    const { watch } = form;

    const summarizerId = watch("id");

    return (
        <div className="container mt-8 mx-auto px-4 mb-8">
            <div className="max-w-3xl flex flex-col gap-y-6">
                <h1 className="text-xl text-gray-950">Create a Summarizer</h1>
                <SummarizerWebhook summarizerId={summarizerId} />
                <SummarizerForm
                    form={form}
                    summarizerId={summarizerId}
                    actions={[
                        {
                            text: "Cancel",
                            href: "/",
                            variant: "secondary",
                        },
                        {
                            text: "Create",
                            variant: "primary",
                            type: "submit",
                        },
                    ]}
                />
            </div>
        </div>
    );
}
