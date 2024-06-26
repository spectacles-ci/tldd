import React from "react";
import { useHistory } from "react-router-dom";

import clsx from "clsx";

export default function Button({
    children,
    onClick,
    href,
    variant = "primary",
    enabled = true,
    type = "button",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "secondary" | "danger";
    enabled?: boolean;
    type?: "button" | "submit";
}) {
    const history = useHistory();
    const resolvedVariant = enabled ? variant : "disabled";
    const baseStyles =
        "rounded px-3 py-2 text-base font-semibold shadow whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
    const variantStyles = {
        primary: "bg-primary text-white hover:bg-primary-interactive",
        secondary: "bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-200",
        disabled: "bg-gray-100 text-gray-400 ring-1 ring-inset ring-gray-200 cursor-not-allowed",
        danger: "bg-red-500 text-white hover:bg-red-600",
    };
    const styles = clsx(baseStyles, variantStyles[resolvedVariant]);

    return (
        <button
            type={type}
            onClick={() => {
                if (href) {
                    history.push(href); // Ensure history.push is used correctly
                }
                if (onClick) {
                    onClick();
                }
            }}
            className={styles}
            disabled={!enabled}
        >
            {children}
        </button>
    );
}
