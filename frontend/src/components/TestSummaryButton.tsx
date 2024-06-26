import React, { useContext, useEffect, useState } from "react";

import { intlFormatDistance } from "date-fns";

import Button from "./Button";
import { CheckCircle } from "./icons";
import { ExtensionContext } from "@looker/extension-sdk-react";
import { useQuery } from "@tanstack/react-query";

export default function TestSummaryButton({ summarizerId }: { summarizerId: string }) {
    const [apiUrl, setApiUrl] = useState<string>("");
    const [lastReceived, setLastReceived] = useState<string | null>(null);

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
                    setLastReceived(intlFormatDistance(new Date(data.timestamp), new Date()));
                }
            },
            onError: (error) => {
                console.error(error);
            },
        },
    );

    return (
        <div className="flex items-center">
            <Button variant="secondary" enabled={!!lastReceived}>
                Test Summary
            </Button>
            {lastReceived ? (
                <div className="ml-4 text-xs text-gray-500 flex items-center">
                    <CheckCircle className="text-success size-5" />
                    <p className="ml-1.5">Ready to test. Last received {lastReceived}.</p>
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
