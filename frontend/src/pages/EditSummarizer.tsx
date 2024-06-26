import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import EditSummarizerForm from "../components/EditSummarizerForm";
import { useApiUrl } from "../context/ApiContext";
import { Summarizer, SummarizerData } from "../types";

export default function EditSummarizer() {
    const { id } = useParams<{ id: string }>();
    const [summarizer, setSummarizer] = useState<Summarizer | null>(null);

    const apiUrl = useApiUrl();

    useEffect(() => {
        const fetchSummarizer = async () => {
            const response = await fetch(`${apiUrl}/summarizer/${id}`);
            const data = (await response.json()) as SummarizerData;
            const transformedData = Object.keys(data).reduce((acc, key) => {
                const newKey = key.replace(/_(\w)/g, (match, p1) => p1.toUpperCase());
                // @ts-ignore
                acc[newKey] = data[key];
                return acc;
            }, {});
            setSummarizer(transformedData as Summarizer);
        };
        fetchSummarizer();
    }, [apiUrl, id]);

    if (!summarizer) return null;

    return (
        <div className="container px-4 mx-auto mt-8 mb-8">
            <div className="flex flex-col gap-y-6 max-w-3xl">
                <h1 className="text-xl text-gray-950">Edit a Summarizer</h1>
                <EditSummarizerForm summarizer={summarizer} />
            </div>
        </div>
    );
}
