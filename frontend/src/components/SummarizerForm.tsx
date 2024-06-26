import React, { useCallback } from "react";

import { UseFormReturn } from "react-hook-form";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Input from "./Input";
import TestSummaryButton from "./TestSummaryButton";
import TextArea from "./TextArea";
import { Summarizer } from "../types";
import { X } from "./icons";

export function SummarizerForm({
    form,
    onSubmit,
    isLoading,
    summarizerId,
}: {
    form: UseFormReturn<Summarizer>;
    onSubmit: (data: Summarizer) => void;
    isLoading: boolean;
    summarizerId: string;
}) {
    const { register, handleSubmit, watch, setValue } = form;
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
                <div className="flex flex-wrap items-center gap-2">
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
                        >
                            <span className="text-gray-500 text-sm">{recipient}</span>
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
            <TestSummaryButton summarizerId={summarizerId} />
            <div className="flex justify-end gap-x-4">
                <Button href="/" variant="secondary" enabled={!isLoading}>
                    Cancel
                </Button>
                <Button type="submit" enabled={!isLoading}>
                    Create
                </Button>
            </div>
        </form>
    );
}
