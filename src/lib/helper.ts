// import * as Sentry from "@sentry/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Storage } from "@plasmohq/storage";

export async function noop(ms: number) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(null);
        }, ms);
    });
}

export function downloadFile(url: string, fileName: string, fileType?: string) {
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.click();
}

export function waitForElement(selector: string) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);

        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver((mutations) => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

export async function fetchInBatches<T>(
    promises: Array<() => Promise<T>>,
    maxCount: number,
    autoRetry: boolean
) {
    const results: T[] = [];
    let currentIndex = 0;

    while (currentIndex < promises.length) {
        const currentBatch = promises
            .slice(currentIndex, currentIndex + maxCount)
            .map((partialFetch) => partialFetch());
        try {
            const responses = await Promise.all(currentBatch);
            results.push(...responses);
            currentIndex += maxCount;
        } catch (error) {
            if (error instanceof Error) {
                if (autoRetry && error.message === "Flood Error") {
                    const { index } = error.cause as { index: number };
                    currentIndex = index;
                    noop(1000);
                }
            } else {
                throw error;
            }
        }
    }

    return results;
}

export async function getFetchDetails(url: string) {
    const requestHeaders: HeadersInit = {
        Range: `bytes=0-`
    };
    const response = await fetch(url, {
        headers: requestHeaders
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentSize = parseInt(
        response.headers.get("Content-Range").split("/")[1],
        10
    );

    const segmentSize = parseInt(response.headers.get("Content-Length"), 10);
    const contentType = response.headers.get("Content-Type");

    // Check if the server supports partial content
    const acceptRanges = response.headers.get("Accept-Ranges");
    if (acceptRanges !== "bytes") {
        throw new Error(
            "Server does not support partial content (byte ranges)"
        );
    }

    const segmentCount = Math.ceil(contentSize / segmentSize);

    return {
        contentType,
        segmentCount,
        contentSize,
        segmentSize
    };
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function decodeKVersionURL(kurl: string) {
    try {
        const messageInfo = kurl.startsWith(
            "https://web.telegram.org/k/stream/"
        )
            ? kurl.slice("https://web.telegram.org/k/stream/".length)
            : kurl.slice("stream/".length);
        const res = JSON.parse(
            decodeURIComponent(messageInfo)
        ) as KVersionMediaInfo;
        return res;
    } catch (error) {
        return {
            dcId: 0,
            location: {
                _: "",
                id: "",
                access_hash: "",
                file_reference: [],
                size: 0,
                mimeType: "",
                fileName: ""
            },
            fileName: "",
            size: 0,
            mimeType: ""
        } as KVersionMediaInfo;
    }
}

export function getRandomName() {
    return Math.random().toFixed(20).slice(2);
}

export const storage = new Storage({
    area: "local"
});
export const IN_PROGRESS_TASKS = "InProgress";
export const SUCCESS_TASKS = "Success";
export const FAIL_TASKS = "Fail";
export const BADGE_COUNT = "Badge";
export const BASIC_PLAN_DOWNLOAD_LIMIT = 3;
export const REMAIN_DOWNLOAD_COUNT = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
};

export type KVersionMediaInfo = {
    dcId: number;
    location: {
        _: string;
        id: string;
        access_hash: string;
        file_reference: Array<number>;
        size: number;
        mimeType: string;
        fileName: string;
    };
    size: number;
    mimeType: string;
    fileName: string;
};

export type MessageType =
    | "Success"
    | "Inprogress"
    | "Fail"
    | "Flush"
    | "IncrementBadge"
    | "ResetBadge"
    | "FetchProgress"
    | "OpenPaymentChoosePage"
    | "GetAuthorization"
    | "AuthorizationResult"
    | "OpenLoginPage"
    | "GetRemainDownloadCount"
    | "RemainDownloadCountResult"
    | "OpenSubscriptionPage";

export class Message {
    public source: "TRCD" | "Service";
    public type: MessageType;
    constructor(type: MessageType, source?: "TRCD" | "Service") {
        this.type = type;
        this.source = source || "TRCD";
    }
}

export class DownloadSuccessMessage extends Message {
    public contentType: "IMAGE" | "AUDIO" | "VIDEO";
    public url: string;
    public name: string;

    constructor({
        contentType,
        url,
        name
    }: {
        contentType: "IMAGE" | "AUDIO" | "VIDEO";
        url: string;
        name: string;
    }) {
        super("Success");
        this.contentType = contentType;
        this.url = url;
        this.name = name;
    }
}

export class DownloadInProgressMessage extends Message {
    public contentType: "IMAGE" | "AUDIO" | "VIDEO";
    public progress: number;
    public size: number | null; // bytes
    public url: string;
    public name: string;

    constructor({
        contentType,
        progress,
        size, // bytes
        url,
        name
    }: {
        contentType: "IMAGE" | "AUDIO" | "VIDEO";
        progress: number;
        size: number | null; // bytes
        url: string;
        name: string;
    }) {
        super("Inprogress");
        this.contentType = contentType;
        this.progress = progress;
        this.size = size;
        this.url = url;
        this.name = name;
    }
}

export class DownloadFailMessage extends Message {
    public contentType: "IMAGE" | "AUDIO" | "VIDEO";
    public url: string;
    public name: string;

    constructor({
        contentType,
        url,
        name
    }: {
        contentType: "IMAGE" | "AUDIO" | "VIDEO";
        url: string;
        name: string;
    }) {
        super("Fail");
        this.contentType = contentType;
        this.url = url;
        this.name = name;
    }
}

export class AuthorizationResultMessage extends Message {
    constructor(
        public authorization: boolean,
        public reason: "Not Login" | "Online Count Limit"
    ) {
        super("AuthorizationResult", "Service");
    }
}

export class RemainDownloadCountResultMessage extends Message {
    constructor(
        public remainCount: number,
        public reason:
            | "Not Login"
            | "Online Count Limit"
            | "No Valid Subscription"
    ) {
        super("RemainDownloadCountResult", "Service");
    }
}

export class OpenPaymentChoosePageMessage extends Message {
    constructor(
        public planID: string,
        public currency: "usd" | "cny"
    ) {
        super("OpenPaymentChoosePage");
    }
}

export interface MessageRes<T> {
    code: 0 | 1;
    data: T;
}

export interface SubscriptionInfo {
    transaction_id: string;
    plan_type: "recurring" | "one_time";
    order_status:
        | null
        | "created"
        | "updated"
        | "canceling"
        | "canceled"
        | "pastdue"
        | "invalid";
    pay_status: "created" | "succeed" | "failed" | "refunded";
    plan_start: number;
    plan_end: number;
    currency: "usd" | "cny";
    plan_price: number;
    plan_id: number;
    plan_name: string;
    channel: "stripe" | "alipay" | "wechat" | "paypal";
    pay_time: number;
    prod_code: string;
    created_at: string;
    updated_at: string;
}

export function getAuthorization() {
    window.postMessage(new Message("GetAuthorization"), "*");
    return new Promise<
        "OK" | "Not Login" | "Online Count Limit" | "No Valid Subscription"
    >((res, rej) => {
        const listener = async (event: MessageEvent<Message>) => {
            if (
                event.source !== window ||
                !event.data ||
                event.data.source !== "Service"
            ) {
                return;
            }
            const data = event.data;
            switch (data.type) {
                case "AuthorizationResult": {
                    const authorizationResult =
                        data as AuthorizationResultMessage;
                    if (authorizationResult.authorization) {
                        res("OK");
                    } else if (authorizationResult.reason === "Not Login") {
                        res("Not Login");
                    } else if (
                        authorizationResult.reason === "Online Count Limit"
                    ) {
                        res("Online Count Limit");
                    } else if (
                        authorizationResult.reason === "No Valid Subscription"
                    ) {
                        res("No Valid Subscription");
                    }
                    break;
                }
                default: {
                    rej("unknown");
                    break;
                }
            }
            window.removeEventListener("message", listener);
        };
        window.addEventListener("message", listener);
    });
}

export function getRemainDownloadCount() {
    window.postMessage(new Message("GetRemainDownloadCount"), "*");
    return new Promise<{
        remainCount: number;
        reason: string;
    }>((res, rej) => {
        const listener = async (event: MessageEvent<Message>) => {
            if (
                event.source !== window ||
                !event.data ||
                event.data.source !== "Service"
            ) {
                return;
            }
            const data = event.data;
            switch (data.type) {
                case "RemainDownloadCountResult": {
                    const { remainCount, reason } =
                        data as RemainDownloadCountResultMessage;
                    res({
                        remainCount,
                        reason
                    });
                    break;
                }
                default: {
                    rej("unknown");
                    break;
                }
            }
            window.removeEventListener("message", listener);
        };
        window.addEventListener("message", listener);
    });
}

export async function fetchCanvasMedia(canvasElement: HTMLCanvasElement) {
    return new Promise<string>((res, rej) => {
        const chunks = [];
        const mediaStream = canvasElement.captureStream();

        const mediaRecorder = new MediaRecorder(mediaStream, {
            mimeType: "video/webm"
        });
        mediaRecorder.addEventListener("start", () => {
            console.log(`mediaRecorder start`);
        });

        mediaRecorder.addEventListener("error", (event) => {
            rej("error");
        });
        mediaRecorder.addEventListener("dataavailable", (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        });
        mediaRecorder.addEventListener("stop", () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            res(URL.createObjectURL(blob));
        });
        mediaRecorder.start(300);
        setTimeout(() => {
            mediaRecorder.stop();
        }, 2000);
    });
}

export function reportError(error) {
    // return Sentry.captureException(error, {
    //     tags: {
    //         manually: true
    //     }
    // });
}

export const BASIC_SIZE_LIMIT = 1024 * 1024 * 100;
