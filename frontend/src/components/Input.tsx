import React from "react";

export default function Input({
  id,
  label,
  type,
  placeholder,
  ...props
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold leading-6 text-gray-700"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...props}
          className="max-w-md block w-full rounded border-0 py-1.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary"
        />
      </div>
    </div>
  );
}
