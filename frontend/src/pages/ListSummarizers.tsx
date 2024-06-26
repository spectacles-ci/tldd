import React from "react";
import { Button, SummarizerTable } from "../components";
import { useQuery } from "@tanstack/react-query";

export default function ListSummarizers() {
  const query = useQuery({
    queryKey: ["summarizers"],
    queryFn: async () => {
      const response = await fetch("https://vertex-dashboards-2w54ohrt4q-uc.a.run.app/summarizer");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
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
