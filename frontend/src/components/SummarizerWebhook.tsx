import React, { useContext, useEffect, useState } from "react";

import { ExtensionContext } from "@looker/extension-sdk-react";
import clsx from "clsx";

import { Clipboard } from "./icons";

export function SummarizerWebhook() {
    const [webhookUrl, setWebhookUrl] = useState<string>("https://aed42f-summarize.run.app/a294cd29dfa322");
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [userAttribute, setUserAttribute] = useState<string>("");

    const lookerExtension = useContext(ExtensionContext);

    useEffect(() => {
        const getAttribute = async () => {
            const attribute = await lookerExtension.extensionSDK.userAttributeGetItem("tldd_api");
            setUserAttribute(attribute ?? "");
        };
        getAttribute();
    }, [lookerExtension]);

    const copyToClipboard = async () => {
        await lookerExtension.extensionSDK.clipboardWrite(webhookUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-gray-50 gap-y-2 flex flex-col border border-gray-200 rounded p-4 text-xs shadow-sm">
            <p className="text-sm font-semibold text-gray-700">Webhook URL</p>
            <p className="text-xs text-gray-500">
                Create a schedule in Looker with the <span className="font-medium">Webhook</span> destination and
                provide the URL below.
            </p>
            <div className="flex items-center">
                <button
                    className={clsx(
                        "bg-white border transition-colors duration-300 hover:bg-gray-50  text-gray-400 rounded shadow-sm text-sm px-2 py-1.5 flex items-center gap-x-1.5",
                        {
                            "border-primary": isCopied,
                            "border-gray-200": !isCopied,
                        }
                    )}
                    onClick={copyToClipboard}
                >
                    <span>{webhookUrl}</span>
                    <Clipboard className="size-4 text-primary" />
                </button>
                <span className="ml-2 text-xs text-gray-400">
                    {isCopied ? "Copied to clipboard!" : "Click to copy"}
                </span>
            </div>
        </div>
    );
}
