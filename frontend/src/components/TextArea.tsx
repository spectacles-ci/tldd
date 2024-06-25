import React from "react";

export default function TextArea({ id, label }: { id: string; label: string }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold leading-6 text-gray-700"
      >
        {label}
      </label>
      <div className="mt-2">
        <textarea
          rows={4}
          id={id}
          className="block w-full rounded-md border-0 py-1.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary"
          defaultValue={""}
        />
      </div>
    </div>
  );
}
