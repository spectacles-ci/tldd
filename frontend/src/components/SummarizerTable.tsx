import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "./Button";
import type { SummarizerRow } from "../types";
import { intlFormatDistance } from "date-fns";

export default function SummarizerTable({ summarizers }: { summarizers: SummarizerRow[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const history = useHistory();

    // Sort summarizers by name before pagination
    const sortedSummarizers = summarizers.sort((a, b) => a.name.localeCompare(b.name));
    const totalPages = Math.ceil(sortedSummarizers.length / itemsPerPage);

    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const formatDistance = (date: Date) => {
        const distance = intlFormatDistance(date, new Date());
        return distance.charAt(0).toUpperCase() + distance.slice(1);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = sortedSummarizers.slice(startIndex, startIndex + itemsPerPage);

    const handleRowClick = (id: string) => {
        history.push(`/edit/${id}`);
    };

    return (
        <table className="w-full rounded shadow border-separate border-spacing-0 outline outline-gray-200">
            <thead className="text-sm font-semibold text-left text-gray-700 bg-gray-100 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-3 w-full">Name</th>
                    <th className="px-6 py-3 whitespace-nowrap">Last Received</th>
                    <th className="px-6 py-3 whitespace-nowrap">Recipients</th>
                </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
                {currentItems.map((summarizer) => (
                    <tr
                        className="h-16 cursor-pointer hover:bg-blue-50"
                        key={summarizer.id}
                        onClick={() => handleRowClick(summarizer.id)}
                    >
                        <td className="px-6 w-full border-b border-gray-200 text-gray-950">{summarizer.name}</td>
                        <td className="px-6 whitespace-nowrap border-b border-gray-200">
                            <div className="flex flex-col gap-y-1">
                                <p>
                                    {summarizer.last_receipt_timestamp
                                        ? formatDistance(new Date(summarizer.last_receipt_timestamp))
                                        : "Never received"}
                                </p>
                                {summarizer.last_receipt_timestamp && (
                                    <p className="text-xs text-gray-500">
                                        {new Date(summarizer.last_receipt_timestamp).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                )}
                            </div>
                        </td>
                        <td className="px-6 whitespace-nowrap border-b border-gray-200">
                            <div className="flex flex-col gap-y-1">
                                <p>{summarizer.recipients[0]}</p>
                                {summarizer.recipients.length > 1 && (
                                    <p className="text-xs text-gray-500">
                                        and {summarizer.recipients.length - 1}{" "}
                                        {summarizer.recipients.length - 1 === 1 ? "other" : "others"}
                                    </p>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={3} className="px-6 py-3 bg-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedSummarizers.length)} of{" "}
                                {sortedSummarizers.length} results
                            </span>
                            <div className="flex gap-x-4">
                                <Button variant="secondary" onClick={handlePreviousPage} enabled={currentPage !== 1}>
                                    Previous
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleNextPage}
                                    enabled={currentPage !== totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
    );
}
