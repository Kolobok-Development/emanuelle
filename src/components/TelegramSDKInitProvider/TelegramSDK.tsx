"use client"
import { useClientOnce } from "@/hooks/useClientOnce";
import { useTelegramMock } from "@/hooks/useTelegramMock";
import { telegramSDKInit } from "@/utils/init";
import { PropsWithChildren } from "react";

export default function TelegramSDKInitProvider({ children }: PropsWithChildren) {
    const envReady = useTelegramMock()

    useClientOnce( () => {
        telegramSDKInit(true);
    }, envReady)


    return children;
}