import React, { useContext } from "react";
import { ExtensionContext } from "@looker/extension-sdk-react";
import { Button, SummarizerTable } from "./components";
import { useQuery } from "@tanstack/react-query";

export const HelloWorld: React.FC = () => {
  const { core40SDK } = useContext(ExtensionContext);
  const query = useQuery({
    queryKey: ["summarizers"],
    queryFn: () => {
      return [
        {
          id: "1",
          name: "Marketing Weekly",
          lastReceived: "2024-06-24T12:00:00Z",
          recipients: ["sherry@petgourmet.com", "john@doe.com", "jane@doe.com"],
        },
        {
          id: "2",
          name: "Financial Health QBR",
          lastReceived: "2024-03-07T12:00:00Z",
          recipients: ["juan.mendoza@petgourmet.com", "john@doe.com"],
        },
      ];
    },
  });

  return (
    <div className="container mt-8 mx-auto px-4">
      <div className="flex mb-4 justify-between items-center">
        <h1 className="text-xl mb-4 text-gray-950">Summarizers</h1>
        <Button>Create Summarizer</Button>
      </div>
      <SummarizerTable summarizers={query.data || []} />
    </div>
  );
};
