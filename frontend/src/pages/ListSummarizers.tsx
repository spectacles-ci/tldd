import React, { useState, useContext, useEffect } from "react";
import { ExtensionContext } from "@looker/extension-sdk-react";
import { Button, SummarizerTable } from "../components";
import { useQuery } from "@tanstack/react-query";

export default function ListSummarizers() {
    const [apiUrl, setApiUrl] = useState<string>("");

    const lookerExtension = useContext(ExtensionContext);

    const getAttribute = async () => {
        const attribute = await lookerExtension.extensionSDK.userAttributeGetItem("tldd_api");
        setApiUrl(attribute ?? "");
    };

    useEffect(() => {
        getAttribute();
    }, [lookerExtension]);

    const query = useQuery({
        queryKey: ["summarizers"],
        queryFn: async () => {
            const response = await fetch(`${apiUrl}/summarizer`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        },
        enabled: !!apiUrl, // Only run the query if apiUrl is not empty
        onError: (error) => {
            console.error("Error fetching summarizers:", error);
        },
    });

    return (
        <div className="container mt-8 mx-auto px-4">
            <div className="flex mb-4 justify-between items-center">
                <h1 className="text-xl mb-4 text-gray-950">Summarizers</h1>
                <Button href="/create">Create Summarizer</Button>
            </div>
            <SummarizerTable summarizers={query.data || []} />
        </div>
    );
}
