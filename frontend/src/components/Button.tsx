import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  enabled = true,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  enabled?: boolean;
}) {
  const resolvedVariant = enabled ? variant : "disabled";
  const baseStyles =
    "rounded px-3 py-2 text-base font-semibold shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-interactive",
    secondary: "bg-white text-gray-700 hover:bg-gray-50 ring-gray-200",
    disabled: "bg-gray-100 text-gray-300 ring-gray-200 cursor-not-allowed",
  };
  const styles = clsx(baseStyles, variantStyles[resolvedVariant]);

  return (
    <button type="button" className={styles} disabled={!enabled}>
      {children}
    </button>
  );
}
