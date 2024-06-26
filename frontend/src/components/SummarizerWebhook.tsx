import { ExtensionContext } from "@looker/extension-sdk-react";
import clsx from "clsx";
import React, { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";

import { useApiUrl } from "../context/ApiContext";
import { Clipboard } from "./icons";

export function SummarizerWebhook({ summarizerId }: { summarizerId: string }) {
    const [webhookUrl, setWebhookUrl] = useState<string>("");
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const apiUrl = useApiUrl();

    const extensionContext = useContext(ExtensionContext);
    const { extensionSDK } = extensionContext;

    const getAttribute = useCallback(async () => {
        const attribute = await extensionSDK.userAttributeGetItem("tldd_api");
        const apiUrl = attribute ?? "";
        setWebhookUrl(`${apiUrl}/webhook/${summarizerId}`);
    }, [apiUrl, summarizerId, extensionSDK]);

    useEffect(() => {
        getAttribute();
    }, [getAttribute]);

    const copyToClipboard = async () => {
        await extensionSDK.clipboardWrite(webhookUrl);
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
                {webhookUrl ? (
                    <>
                        <button
                            className={clsx(
                                "bg-white border transition-colors duration-300 hover:bg-gray-50  text-gray-400 rounded shadow-sm text-sm px-2 py-1.5 flex items-center gap-x-1.5",
                                {
                                    "border-primary": isCopied,
                                    "border-gray-200": !isCopied,
                                },
                            )}
                            onClick={copyToClipboard}
                        >
                            <span>{webhookUrl}</span>
                            <Clipboard className="size-4 text-primary" />
                        </button>
                        <span className="ml-2 text-xs text-gray-400">
                            {isCopied ? "Copied to clipboard!" : "Click to copy"}
                        </span>
                    </>
                ) : (
                    <span className="bg-white border transition-colors duration-300 hover:bg-gray-50 w-[516px] h-[34px] text-gray-400 rounded shadow-sm text-sm px-2 py-1.5 flex items-center gap-x-1.5 border-gray-200" />
                )}
            </div>
        </div>
    );
}
