import React, { useCallback } from "react";
import { useForm } from "react-hook-form";

import { Summarizer, SummarizerFormState } from "../types";
import { SummarizerWebhook } from "../components/SummarizerWebhook";
import { SummarizerForm } from "../components/SummarizerForm";
import { useApiUrl } from "../context/ApiContext";
import { useHistory } from "react-router-dom";

export default function EditSummarizerForm({ summarizer }: { summarizer: Summarizer }) {
    const history = useHistory();
    const apiUrl = useApiUrl();
    const form = useForm<SummarizerFormState>({
        defaultValues: summarizer,
    });

    const handleDelete = useCallback(async () => {
        try {
            const response = await fetch(`${apiUrl}/summarizer/${summarizer.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("Failed to delete summarizer");
            }

            history.push("/");
        } catch (error) {
            console.error("Error deleting summarizer:", error);
        }
    }, [summarizer.id]);

    return (
        <>
            <SummarizerWebhook summarizerId={summarizer.id} />
            <SummarizerForm
                form={form}
                summarizerId={summarizer.id}
                actions={[
                    {
                        text: "Cancel",
                        variant: "secondary",
                        href: "/",
                    },
                    {
                        text: "Delete",
                        onClick: handleDelete,
                        variant: "danger",
                    },
                    {
                        text: "Update",
                        variant: "primary",
                        type: "submit",
                    },
                ]}
            />
        </>
    );
}
