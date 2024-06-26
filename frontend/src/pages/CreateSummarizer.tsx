import React, { useState, useContext, useEffect } from "react";
import { ExtensionContext } from "@looker/extension-sdk-react";
import { Input, Button, TextArea, Checkbox, TestSummaryButton } from "../components";
import clsx from "clsx";
import { Clipboard, X } from "../components/icons";
import type { Summarizer } from "../types";

function generateShortUUID(): string {
    const numberOfChars = 8;
    const characters = "0123456789abcdefghijklmnopqrstuvwxyz";
    const base = characters.length;
    let number = Math.floor(Math.random() * Math.pow(base, numberOfChars)); // Generates a number between 0 and base^8 - 1
    let shortUUID = "";

    while (number > 0) {
        shortUUID = characters[number % base] + shortUUID;
        number = Math.floor(number / base);
    }

    // Ensure the length is consistent
    while (shortUUID.length < numberOfChars) {
        shortUUID = "0" + shortUUID;
    }

    return shortUUID;
}

export default function CreateSummarizer() {
    const extensionContext = useContext(ExtensionContext);
    const { extensionSDK } = extensionContext;
    const [apiUrl, setApiUrl] = useState<string>("");

    const getAttribute = async () => {
        const attribute = await extensionSDK.userAttributeGetItem("tldd_api");
        const apiUrl = attribute ?? "";
        setApiUrl(apiUrl);
        setWebhookUrl(`${apiUrl}/webhook/${summarizerId}`);
    };

    useEffect(() => {
        getAttribute();
    }, [extensionSDK]);

    const [summarizerId, setSummarizerId] = useState<string>(generateShortUUID());
    const [formData, setFormData] = useState<Summarizer>({
        id: "",
        name: "",
        recipients: [],
        usePriorReports: true,
        attachOriginal: true,
        customInstructions: null,
    });
    const [recipients, setRecipients] = useState<string[]>([]);
    const [webhookUrl, setWebhookUrl] = useState<string>("");
    const [isCopied, setIsCopied] = useState<boolean>(false);

    function handleChange(event: React.ChangeEvent<HTMLElement>) {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        console.log("Submitting");
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "Tab") {
            const inputValue = (event.target as HTMLInputElement).value;
            if (inputValue) {
                setRecipients([...recipients, inputValue]);
                (event.target as HTMLInputElement).value = ""; // Clear the input field
            }
        }
    };

    const copyToClipboard = async () => {
        await extensionSDK.clipboardWrite(webhookUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="container mt-8 mx-auto px-4 mb-8">
            <div className="max-w-3xl flex flex-col gap-y-6">
                <h1 className="text-xl text-gray-950">Create a Summarizer</h1>
                <div className="bg-gray-50 gap-y-2 flex flex-col border border-gray-200 rounded p-4 text-xs shadow-sm">
                    <p className="text-sm font-semibold text-gray-700">Webhook URL</p>
                    <p className="text-xs text-gray-500">
                        Create a schedule in Looker with the <span className="font-medium">Webhook</span> destination
                        and provide the URL below.
                    </p>
                    <div className="flex items-center">
                        <button
                            className={clsx(
                                "bg-white border transition-colors duration-300 hover:bg-gray-50  text-gray-400 rounded shadow-sm text-sm px-2 py-1.5 flex items-center gap-x-1.5",
                                {
                                    "border-primary": isCopied,
                                    "border-gray-200": !isCopied,
                                },
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
                <form className="flex flex-col gap-y-6">
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        label="Name"
                        placeholder="Summarizer name"
                        onChange={handleChange}
                    />
                    <div className="flex flex-col gap-y-3">
                        <Input
                            id="recipients"
                            name="recipients"
                            type="email"
                            label="Recipients"
                            placeholder="Enter an email address"
                            onChange={handleChange}
                            onKeyDown={handleKeyPress}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            {recipients.map((recipient, index) => (
                                <button
                                    className="flex items-center bg-gray-50 px-1.5 py-1 border border-gray-200 hover:bg-gray-100 rounded-md shadow-sm"
                                    onClick={() => setRecipients(recipients.filter((_, i) => i !== index))}
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
                        name="usePriorReports"
                        label="Use prior reports"
                        description="Use prior reports as context to inform the summarizer."
                        onChange={handleChange}
                    />
                    <Checkbox
                        id="attach_original"
                        name="attachOriginal"
                        label="Attach original report"
                        description="Attach the original report PDF to the email to recipients."
                        onChange={handleChange}
                    />
                    <TextArea
                        id="custom"
                        name="customInstructions"
                        label="Custom Instructions"
                        onChange={handleChange}
                    />
                    <TestSummaryButton summarizerId={summarizerId} />
                    <div className="flex justify-end gap-x-4">
                        <Button href="/" variant="secondary">
                            Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
