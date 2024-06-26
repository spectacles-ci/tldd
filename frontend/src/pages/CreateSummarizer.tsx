import React, { useState } from "react";

import type { Summarizer } from "../types";
import { SubmitHandler, useForm } from "react-hook-form";
import { SummarizerForm } from "../components/SummarizerForm";
import { SummarizerWebhook } from "../components/SummarizerWebhook";

const API_URL = "https://vertex-dashboards-2w54ohrt4q-uc.a.run.app/";

export default function CreateSummarizer() {
    const [isLoading, setLoading] = useState<boolean>(false);

    const form = useForm<Summarizer>({
        defaultValues: {
            id: "",
            name: "",
            recipient: "",
            recipients: [],
            usePriorReports: true,
            attachPdf: true,
            customInstructions: null,
        },
    });

    const { setError } = form;

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
                <SummarizerWebhook />
                <SummarizerForm form={form} isLoading={isLoading} onSubmit={onSubmit} />
            </div>
        </div>
    );
}
