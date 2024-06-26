import React, { useCallback, useState } from "react";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { useHistory } from "react-router-dom";

import { useApiUrl } from "../context/ApiContext";
import { Summarizer, SummarizerFormState } from "../types";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Input from "./Input";
import TestSummaryButton from "./TestSummaryButton";
import TextArea from "./TextArea";
import { X } from "./icons";

export function SummarizerForm({
    form,
    summarizerId,
    actions,
}: {
    form: UseFormReturn<SummarizerFormState>;
    summarizerId: string;
    actions: {
        text: string;
        onClick?: () => void;
        href?: string;
        type?: "button" | "submit";
        variant: "primary" | "secondary" | "danger";
    }[];
}) {
    const history = useHistory();
    const apiUrl = useApiUrl();

    const [isLoading, setLoading] = useState(false);
    const [testSummary, setTestSummary] = useState<string | null>(null);

    const { register, handleSubmit, watch, setValue, setError, getValues } = form;
    const recipients = watch("recipients");
    const handleKeyPress = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter" || event.key === "Tab") {
                const inputValue = (event.target as HTMLInputElement).value;
                if (inputValue) {
                    setValue("recipients", [...recipients, inputValue]);
                    (event.target as HTMLInputElement).value = ""; // Clear the input field
                }
            }
        },
        [recipients, setValue],
    );

    const onSubmit: SubmitHandler<SummarizerFormState> = async (data) => {
        setLoading(true);
        const { recipient, ...postData } = data;
        const postDataSnakeCase = Object.keys(postData).reduce<Record<string, Summarizer[keyof Summarizer]>>(
            (acc, key) => {
                const newKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
                acc[newKey] = postData[key as keyof Omit<Summarizer, "recipient">];
                return acc;
            },
            {},
        );
        await fetch(`${apiUrl}/summarizer/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postDataSnakeCase),
        })
            .then(() => {
                history.push("/");
            })
            .catch((error) => {
                console.error("Error:", error);
                setError("name", { type: "manual", message: "Failed to create summarizer" });
            });
        setLoading(false);
    };

    return (
        <form className="flex flex-col gap-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input id="name" type="text" label="Name" placeholder="Summarizer name" register={register} />
            <div className="flex flex-col gap-y-3">
                <Input
                    id="recipient"
                    type="email"
                    label="Recipients"
                    placeholder="Enter an email address"
                    register={register}
                    onKeyDown={handleKeyPress}
                    onChange={undefined}
                />
                <div className="flex flex-wrap gap-2 items-center">
                    {recipients?.map((recipient, index) => (
                        <button
                            className="flex items-center bg-gray-50 px-1.5 py-1 border border-gray-200 hover:bg-gray-100 rounded-md shadow-sm"
                            onClick={() =>
                                setValue(
                                    "recipients",
                                    recipients.filter((_, i) => i !== index),
                                )
                            }
                            key={`${recipient}-${index}`}
                            type="button"
                        >
                            <span className="text-sm text-gray-500">{recipient}</span>
                            <X className="text-gray-600 size-4 ml-0.5" />
                        </button>
                    ))}
                </div>
            </div>
            <Checkbox
                id="usePriorReports"
                label="Use prior reports"
                description="Use prior reports as context to inform the summarizer."
                register={register}
            />
            <Checkbox
                id="attachPdf"
                label="Attach original report"
                description="Attach the original report PDF to the email to recipients."
                register={register}
            />
            <TextArea id="customInstructions" label="Custom Instructions" register={register} />
            <TestSummaryButton summarizerId={summarizerId} getSummarizer={getValues} setTestSummary={setTestSummary} />
            {testSummary && (
                <div className="p-4 leading-7 text-gray-800 whitespace-pre-line bg-white rounded border border-gray-400 shadow-sm">
                    {testSummary}
                </div>
            )}
            <div className="flex justify-end gap-x-4">
                {actions.map((action, index) => (
                    <Button
                        key={index}
                        onClick={action.onClick}
                        href={action.href}
                        variant={action.variant}
                        type={action.type}
                        enabled={!isLoading}
                    >
                        {action.text}
                    </Button>
                ))}
            </div>
        </form>
    );
}
