import React from "react";
import { Input, Button, TextArea } from "../components";
import { Clipboard } from "../components/icons";

export default function CreateSummarizer() {
  return (
    <div className="container mt-8 mx-auto px-4">
      <div className="max-w-3xl flex flex-col gap-y-4">
        <h1 className="text-xl mb-4 text-gray-950">Create a Summarizer</h1>
        <div className="bg-gray-50 gap-y-2 flex flex-col border border-gray-200 rounded p-4 text-xs">
          <p className="text-sm font-semibold text-gray-700">Webhook URL</p>
          <p className="text-xs text-gray-500">
            Create a schedule in Looker with the{" "}
            <span className="font-medium">Webhook</span> destination and provide
            the URL below.
          </p>
          <div className="flex items-center">
            <button className="bg-white hover:bg-gray-50 rounded text-gray-400 border border-gray-200 shadow-sm text-sm px-2 py-1.5 flex items-center gap-x-1.5">
              <span>https://aed42f-summarize.run.app/a294cd29dfa322</span>
              <Clipboard className="size-4 text-primary" />
            </button>
            <span className="ml-2 text-xs text-gray-400">Click to copy</span>
          </div>
        </div>
        <Input
          id="name"
          type="text"
          label="Name"
          placeholder="Summarizer name"
        />
        <Input
          id="recipients"
          type="email"
          label="Recipients"
          placeholder="Enter an email address"
        />
        <TextArea id="custom" label="Custom Instructions" />
        <div className="flex justify-end">
          <Button>Create</Button>
        </div>
      </div>
    </div>
  );
}
