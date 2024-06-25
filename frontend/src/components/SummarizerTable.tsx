import React from "react";
import Button from "./Button";
import type { SummarizerRow } from "../types";
import { intlFormatDistance } from "date-fns";

export default function SummarizerTable({
  summarizers,
}: {
  summarizers: SummarizerRow[];
}) {
  function formatDistance(date: Date) {
    const distance = intlFormatDistance(date, new Date());
    return distance.charAt(0).toUpperCase() + distance.slice(1);
  }

  return (
    <table className="w-full rounded border-separate border-spacing-0 border border-gray-200">
      <thead className="bg-gray-100 text-left text-gray-700 text-sm font-semibold border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 w-full">Name</th>
          <th className="px-6 py-3 whitespace-nowrap">Last Received</th>
          <th className="px-6 py-3 whitespace-nowrap">Recipients</th>
        </tr>
      </thead>
      <tbody className="text-sm text-gray-700">
        {summarizers.map((summarizer) => (
          <tr>
            <td className="px-6 py-4 w-full text-gray-950 border-b border-gray-200">
              {summarizer.name}
            </td>
            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
              <div className="flex flex-col gap-y-1">
                <p>{formatDistance(new Date(summarizer.lastReceived))}</p>
                <p className="text-xs text-gray-500">
                  {new Date(summarizer.lastReceived).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </td>
            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
              <div className="flex flex-col gap-y-1">
                <p>{summarizer.recipients[0]}</p>
                <p className="text-xs text-gray-500">
                  and {summarizer.recipients.length - 1} others
                </p>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="px-6 py-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Showing 1 to 10 of 34 results
              </span>
              <div className="flex gap-x-4">
                <Button variant="secondary">Previous</Button>
                <Button variant="secondary">Next</Button>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
