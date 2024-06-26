import React, { useState } from "react";
import {
  Input,
  Button,
  TextArea,
  Checkbox,
  TestSummaryButton,
} from "../components";
import clsx from "clsx";
import { Clipboard, X } from "../components/icons";

export default function CreateSummarizer() {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>(
    "https://aed42f-summarize.run.app/a294cd29dfa322"
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Tab") {
      const inputValue = (event.target as HTMLInputElement).value;
      if (inputValue) {
        setRecipients([...recipients, inputValue]);
        (event.target as HTMLInputElement).value = ""; // Clear the input field
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="container mt-8 mx-auto px-4 mb-8">
      <div className="max-w-3xl flex flex-col gap-y-6">
        <h1 className="text-xl text-gray-950">Create a Summarizer</h1>
        <div className="bg-gray-50 gap-y-2 flex flex-col border border-gray-200 rounded p-4 text-xs">
          <p className="text-sm font-semibold text-gray-700">Webhook URL</p>
          <p className="text-xs text-gray-500">
            Create a schedule in Looker with the{" "}
            <span className="font-medium">Webhook</span> destination and provide
            the URL below.
          </p>
          <div className="flex items-center">
            <button
              className={clsx(
                "bg-white border transition-colors duration-300 hover:bg-gray-50  text-gray-400 rounded shadow-sm text-sm px-2 py-1.5 flex items-center gap-x-1.5",
                {
                  "border-primary": isCopied,
                  "border-gray-200": !isCopied,
                }
              )}
              onClick={copyToClipboard}
            >
              <span>{webhookUrl}</span>
              <Clipboard className="size-4 text-primary" />
            </button>
            <span className="ml-2 text-xs text-gray-400">
              {isCopied ? "Copied to clipboard!" : "Click to copy"}
            </span>
          </div>
        </div>
        <Input
          id="name"
          type="text"
          label="Name"
          placeholder="Summarizer name"
        />
        <div className="flex flex-col gap-y-3">
          <Input
            id="recipients"
            type="email"
            label="Recipients"
            placeholder="Enter an email address"
            onKeyDown={handleKeyPress}
          />
          <div className="flex flex-wrap items-center gap-x-2">
            {recipients.map((recipient, index) => (
              <button
                className="flex items-center bg-white px-1.5 py-1 border border-gray-200 hover:bg-gray-50 rounded shadow"
                onClick={() =>
                  setRecipients(recipients.filter((_, i) => i !== index))
                }
              >
                <span key={index} className="text-gray-500 text-sm">
                  {recipient}
                </span>
                <X className="text-gray-600 size-4 ml-0.5" />
              </button>
            ))}
          </div>
        </div>
        <Checkbox
          id="prior_reports"
          name="prior_reports"
          label="Use prior reports"
          description="Use prior reports as context to inform the summarizer."
        />
        <Checkbox
          id="attach_original"
          name="attach_original"
          label="Attach original report"
          description="Attach the original report PDF to the email to recipients."
        />
        <TextArea id="custom" label="Custom Instructions" />
        <TestSummaryButton />
        <div className="flex justify-end gap-x-4">
          <Button href="/" variant="secondary">
            Cancel
          </Button>
          <Button>Create</Button>
        </div>
      </div>
    </div>
  );
}
