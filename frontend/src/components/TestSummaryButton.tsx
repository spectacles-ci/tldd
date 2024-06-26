import React, { useState, useContext, useEffect } from "react";
import Button from "./Button";
import { ExtensionContext } from "@looker/extension-sdk-react";
import { CheckCircle } from "./icons";
import { useQuery } from "@tanstack/react-query";
import { intlFormatDistance } from "date-fns";
import type { Receipt, SummaryRequest } from "../types";

export default function TestSummaryButton({ summarizerId }: { summarizerId: string }) {
    const [apiUrl, setApiUrl] = useState<string>("");
    const [lastReceipt, setLastReceipt] = useState<Receipt | null>(null);

    const extensionContext = useContext(ExtensionContext);
    const { extensionSDK } = extensionContext;

    const getAttribute = async () => {
        const attribute = await extensionSDK.userAttributeGetItem("tldd_api");
        setApiUrl(attribute ?? "");
    };

    useEffect(() => {
        getAttribute();
    }, [extensionSDK]);

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
            refetchInterval: (data) => (data ? 60000 : 5000),
            onSuccess: (data) => {
                if (data) {
                    console.log(`Received data: ${data}`);
                    setLastReceipt(data as Receipt);
                }
            },
            onError: (error) => {
                console.error(error);
            },
        }
    );

    function generateTestSummary() {
        const summaryRequest: SummaryRequest = {
            summarizer: {
                id: summarizerId,
                name: "Test Summarizer",
                recipients: [],
                use_prior_reports: false,
                attach_original: false,
                custom_instructions: null,
            },
            receipt: lastReceipt,
        };
        fetch(`${apiUrl}/webhook/${summarizerId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(summaryRequest),
        });
    }

    return (
        <div className="flex items-center">
            <Button variant="secondary" enabled={!!lastReceipt}>
                Test Summary
            </Button>
            {lastReceipt ? (
                <div className="flex items-center ml-4 text-xs text-gray-500">
                    <CheckCircle className="text-success size-5" />
                    <p className="ml-1.5">
                        Ready to test. Last received {intlFormatDistance(new Date(lastReceipt.timestamp), new Date())}.
                    </p>
                </div>
            ) : (
                <div className="ml-4 text-xs text-gray-500">
                    <p>In Looker, find the webhook schedule you created, and click "Test Now."</p>
                    <p>Once sent, return here to generate a test summary.</p>
                </div>
            )}
        </div>
    );
}
