import React from "react";

export default function Checkbox({
    label,
    id,
    name,
    description,
    ...props
}: {
    label: string;
    id: string;
    name: string;
    description: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="relative flex items-start">
            <div className="flex h-6 items-center">
                <input
                    id={id}
                    aria-describedby={`${id}-description`}
                    name={name}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-200 text-primary focus:ring-primary"
                    {...props}
                    defaultChecked
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
