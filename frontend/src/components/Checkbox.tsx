import React from "react";
import { UseFormRegister } from "react-hook-form";
import { SummarizerFormState } from "../types";

export default function Checkbox({
    label,
    id,
    description,
    register,
}: {
    label: string;
    id: keyof SummarizerFormState;
    description: string;
    register: UseFormRegister<SummarizerFormState>;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="relative flex items-start">
            <div className="flex h-6 items-center">
                <input
                    id={id}
                    {...register(id)}
                    aria-describedby={`${id}-description`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-200 text-primary focus:ring-primary cursor-pointer"
                />
            </div>
            <div className="ml-3 text-sm leading-6">
                <label htmlFor={id} className="font-medium text-gray-700">
                    {label}
                </label>
                <p id={`${id}-description`} className="text-gray-500">
                    {description}
                </p>
            </div>
        </div>
    );
}
