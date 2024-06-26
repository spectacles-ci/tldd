import React from "react";

import { Button, SummarizerTable } from "../components";
import { useApiUrl } from "../context/ApiContext";
import { useQuery } from "@tanstack/react-query";

export default function ListSummarizers() {
    const apiUrl = useApiUrl();

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
        <div className="container px-4 mx-auto mt-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="mb-4 text-xl text-gray-950">Summarizers</h1>
                <Button href="/create">Create Summarizer</Button>
            </div>
            <SummarizerTable summarizers={query.data || []} />
        </div>
    );
}
