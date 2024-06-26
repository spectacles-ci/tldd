import React from "react";
import { UseFormRegister } from "react-hook-form";
import { SummarizerFormState } from "../types";

export default function TextArea({
    id,
    label,
    register,
}: {
    id: keyof SummarizerFormState;
    label: string;
    register: UseFormRegister<SummarizerFormState>;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold leading-6 text-gray-700">
                {label}
            </label>
            <div className="mt-2">
                <textarea
                    rows={4}
                    id={id}
                    {...register(id)}
                    className="block w-full rounded-md border-0 py-1.5 text-sm text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary"
                />
            </div>
        </div>
    );
}
