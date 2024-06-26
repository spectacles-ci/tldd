import React, { useState, useContext, useEffect } from "react";
import { ExtensionContext } from "@looker/extension-sdk-react";

import { Input, Button, TextArea, Checkbox, TestSummaryButton } from "../components";
import clsx from "clsx";
import { Clipboard, X } from "../components/icons";
import type { Summarizer } from "../types";
import { SubmitHandler, useForm } from "react-hook-form";

export default function CreateSummarizer() {
    const [webhookUrl, setWebhookUrl] = useState<string>("https://aed42f-summarize.run.app/a294cd29dfa322");
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [userAttribute, setUserAttribute] = useState<string>("");

    const lookerExtension = useContext(ExtensionContext);

    useEffect(() => {
        const getAttribute = async () => {
            const attribute = await lookerExtension.extensionSDK.userAttributeGetItem("first_name");
            setUserAttribute(attribute ?? "");
        };
        getAttribute();
    }, [lookerExtension]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(webhookUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
    } = useForm<Summarizer>({
        defaultValues: {
            id: "",
            name: "",
            recipients: [],
            usePriorReports: true,
            attachOriginal: true,
            customInstructions: null,
        },
    });

    const recipients = watch("recipients");

    const onSubmit: SubmitHandler<Summarizer> = (data) => {
        console.log(data);
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
                <form className="flex flex-col gap-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <Input id="name" type="text" label="Name" placeholder="Summarizer name" {...register("name")} />
                    <div className="flex flex-col gap-y-3">
                        <Input
                            id="recipients"
                            type="email"
                            label="Recipients"
                            placeholder="Enter an email address"
                            {...register("recipients")}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            {recipients?.map((recipient, index) => (
                                <button
                                    className="flex items-center bg-gray-50 px-1.5 py-1 border border-gray-200 hover:bg-gray-100 rounded-md shadow-sm"
                                    onClick={() =>
                                        setValue(
                                            "recipients",
                                            recipients.filter((_, i) => i !== index)
                                        )
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
                        label="Use prior reports"
                        description="Use prior reports as context to inform the summarizer."
                        {...register("usePriorReports")}
                    />
                    <Checkbox
                        id="attach_original"
                        label="Attach original report"
                        description="Attach the original report PDF to the email to recipients."
                        {...register("attachOriginal")}
                    />
                    <TextArea id="custom" label="Custom Instructions" {...register("customInstructions")} />
                    <TestSummaryButton />
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
