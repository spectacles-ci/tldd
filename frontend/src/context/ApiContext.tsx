import { ExtensionContext } from "@looker/extension-sdk-react";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

import useVerifyContext from "../hooks/useVerifyContext";

const ApiContext = createContext<string | undefined>("");

export const ApiProvider = ({ children }: { children: ReactNode }) => {
    const [apiUrl, setApiUrl] = useState("");

    const lookerExtension = useContext(ExtensionContext);

    useEffect(() => {
        const getAttribute = async () => {
            const attribute = await lookerExtension.extensionSDK.userAttributeGetItem("tldd_api");
            setApiUrl(attribute ?? "");
        };

        getAttribute();
    }, [lookerExtension]);

    return <ApiContext.Provider value={apiUrl}>{children}</ApiContext.Provider>;
};

export const useApiUrl = () => {
    const apiUrl = useVerifyContext(ApiContext, "useApiUrl must be used within an ApiProvider");

    return apiUrl;
};
