import React from "react";
import Button from "./Button";
import { useState } from "react";
import { CheckCircle } from "./icons";
import { useQuery } from "@tanstack/react-query";

export default function TestSummaryButton() {
  const query = useQuery({
    queryKey: ["ready"],
    queryFn: () => {
      return true;
    },
  });
  const [ready, setReady] = useState(true);

  return (
    <div className="flex items-center">
      <Button variant="secondary" enabled={ready}>
        Test Summary
      </Button>
      {ready ? (
        <div className="ml-4 text-xs text-gray-500 flex items-center">
          <CheckCircle className="text-success size-5" />
          <p className="ml-1.5">Ready to test. Last received 1 week ago.</p>
        </div>
      ) : (
        <div className="ml-4 text-xs text-gray-500">
          <p>
            In Looker, find the webhook schedule you created, and click “Test
            Now.”
          </p>
          <p>Once sent, return here to generate a test summary.</p>
        </div>
      )}
    </div>
  );
}
