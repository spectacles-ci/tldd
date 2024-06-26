import React, { useState } from "react";

import type { Summarizer } from "../types";
import { SubmitHandler, useForm } from "react-hook-form";
import { SummarizerForm } from "../components/SummarizerForm";
import { SummarizerWebhook } from "../components/SummarizerWebhook";

const API_URL = "https://vertex-dashboards-2w54ohrt4q-uc.a.run.app/";

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
    const [webhookUrl, setWebhookUrl] = useState<string>("");
    const [isLoading, setLoading] = useState<boolean>(false);

    const form = useForm<Summarizer>({
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

    const { watch, setError } = form;

    const summarizerId = watch("id");

    const onSubmit: SubmitHandler<Summarizer> = async (data) => {
        setLoading(true);
        const { recipient, ...postData } = data;
        const postDataSnakeCase = Object.keys(postData).reduce<Record<string, Summarizer[keyof Summarizer]>>(
            (acc, key) => {
                const newKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
                acc[newKey] = postData[key as keyof Omit<Summarizer, "recipient">];
                return acc;
            },
            {}
        );
        await fetch(`${API_URL}/summarizer/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postDataSnakeCase),
        }).catch((error) => {
            console.error("Error:", error);
            setError("name", { type: "manual", message: "Failed to create summarizer" });
        });
        setLoading(false);
    };

    return (
        <div className="container mt-8 mx-auto px-4 mb-8">
            <div className="max-w-3xl flex flex-col gap-y-6">
                <h1 className="text-xl text-gray-950">Create a Summarizer</h1>
                <SummarizerWebhook webhookUrl={webhookUrl} setWebhookUrl={setWebhookUrl} summarizerId={summarizerId} />
                <SummarizerForm form={form} isLoading={isLoading} onSubmit={onSubmit} summarizerId={summarizerId} />
            </div>
        </div>
    );
}
