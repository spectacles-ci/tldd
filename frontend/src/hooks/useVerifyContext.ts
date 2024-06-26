import { Context, useContext } from "react";

const useVerifyContext = <T>(contextComponent: Context<T>, message: string) => {
    const context = useContext(contextComponent);
    if (context === undefined || context === null) {
        throw new Error(message);
    }
    return context;
};

export default useVerifyContext;
