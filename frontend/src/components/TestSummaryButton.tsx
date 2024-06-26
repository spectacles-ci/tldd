import React, { useEffect, useState } from "react";
import type { UseFormGetValues } from "react-hook-form";

import { intlFormatDistance } from "date-fns";

import { useApiUrl } from "../context/ApiContext";
import type { Receipt, SummarizerFormState, SummaryRequest } from "../types";
import { toSummarizerData } from "../utils";
import Button from "./Button";
import { CheckCircle } from "./icons";
import { useQuery } from "@tanstack/react-query";

export default function TestSummaryButton({
    summarizerId,
    getSummarizer,
    setTestSummary,
}: {
    summarizerId: string;
    getSummarizer: UseFormGetValues<SummarizerFormState>;
    setTestSummary: (summary: string | null) => void;
}) {
    const apiUrl = useApiUrl();

    const [lastReceipt, setLastReceipt] = useState<Receipt | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Warming up the GPUs...");

    useEffect(() => {
        if (isLoading) {
            const messages = [
                "Crunching numbers... and a few snacks.",
                "AI is in a staring contest with the data... and winning.",
                "Teaching the AI to read between the lines...",
                "Spinning up some clever words... almost there!",
            ];
            let index = 0;
            const interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    useQuery(
        ["pollingData", apiUrl],
        async () => {
            const response = await fetch(`${apiUrl}/summarizer/${summarizerId}/receipt`);
            if (response.status === 404) {
                return null;
            } else if (response.status >= 400 && response.status < 600) {
                throw new Error(`Error fetching data: ${response.status}`);
            } else if (response.status === 200) {
                return response.json();
            }
        },
        {
            enabled: !!apiUrl,
            refetchInterval: (data) => (data ? 60000 : 3000),
            onSuccess: (data) => {
                if (data) {
                    console.log(`Received data: ${data}`);
                    setLastReceipt(data as Receipt);
                }
            },
            onError: (error) => {
                console.error(error);
            },
        },
    );

    async function generateTestSummary() {
        if (!lastReceipt) {
            console.error("No receipt available to generate summary.");
            return;
        }
        setTestSummary(null);
        setIsLoading(true);
        const summaryRequest: SummaryRequest = {
            summarizer: toSummarizerData(getSummarizer()),
            receipt: lastReceipt,
        };
        const response = await fetch(`${apiUrl}/summarizer/${summarizerId}/summarize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(summaryRequest),
        });
        const data = await response.json();
        setIsLoading(false);
        setTestSummary(data.body);
    }

    return (
        <>
            <div className="flex items-center">
                <Button variant="secondary" enabled={!!lastReceipt} onClick={generateTestSummary}>
                    Test Summary
                </Button>
                {lastReceipt ? (
                    <div className="flex items-center ml-4 text-xs text-gray-500">
                        <CheckCircle className="text-success size-5" />
                        <p className="ml-1.5">
                            Ready to test. Last received{" "}
                            {intlFormatDistance(new Date(lastReceipt.timestamp), new Date())}.
                        </p>
                    </div>
                ) : (
                    <div className="ml-4 text-xs text-gray-500">
                        <p>In Looker, find the webhook schedule you created, and click "Test Now."</p>
                        <p>Once sent, return here to generate a test summary.</p>
                    </div>
                )}
            </div>
            {isLoading && (
                <div className="flex items-center text-sm text-gray-500">
                    <svg
                        className="mr-3 w-5 h-5 text-blue-500 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    {loadingMessage}
                </div>
            )}
        </>
    );
}
