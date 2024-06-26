import React from "react";
import { UseFormRegister } from "react-hook-form";

import { SummarizerFormState } from "../types";

export default function Input({
    id,
    label,
    type,
    placeholder,
    register,
    ...props
}: {
    id: keyof SummarizerFormState;
    label: string;
    type: string;
    placeholder: string;
    register: UseFormRegister<SummarizerFormState>;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold leading-6 text-gray-700">
                {label}
            </label>
            <div className="mt-2">
                <input
                    id={id}
                    {...register(id)}
                    type={type}
                    placeholder={placeholder}
                    className="max-w-md text-sm block w-full rounded border-0 py-1.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary"
                    {...props}
                />
            </div>
        </div>
    );
}
