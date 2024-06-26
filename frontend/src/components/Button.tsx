import React from "react";
import clsx from "clsx";
import { useHistory } from "react-router-dom";

export default function Button({
    children,
    onClick,
    href,
    variant = "primary",
    enabled = true,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "secondary";
    enabled?: boolean;
}) {
    const history = useHistory();
    const resolvedVariant = enabled ? variant : "disabled";
    const baseStyles =
        "rounded px-3 py-2 text-base font-semibold shadow whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
    const variantStyles = {
        primary: "bg-primary text-white hover:bg-primary-interactive",
        secondary: "bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-200",
        disabled: "bg-gray-100 text-gray-400 ring-1 ring-inset ring-gray-200 cursor-not-allowed",
    };
    const styles = clsx(baseStyles, variantStyles[resolvedVariant]);

    return (
        <button
            type="button"
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
