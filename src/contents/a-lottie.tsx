import { resolveObjectURL } from "buffer";
import cssText from "data-text:./video-image.css";
import type {
    PlasmoCSConfig,
    PlasmoCSUIProps,
    PlasmoGetInlineAnchorList
} from "plasmo";
import { useEffect, useState, type FC, type MouseEventHandler } from "react";

import { sendToBackground } from "@plasmohq/messaging";

import {
    DownloadFailMessage,
    downloadFile,
    DownloadInProgressMessage,
    DownloadSuccessMessage,
    fetchCanvasMedia,
    getRandomName,
    Message,
    reportError
} from "~lib/helper";
import { useUserPlan } from "~lib/hooks";

export const config: PlasmoCSConfig = {
    matches: ["https://web.telegram.org/a/*"]
};

// div.Sticker canvas ---> preview
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
    document.querySelectorAll(
        `
    div.Sticker canvas
    `
    );

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = cssText;
    return style;
};

const CustomButton: FC<PlasmoCSUIProps> = ({ anchor }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [hasTried, setHasTried] = useState(false);

    const { imageCheck } = useUserPlan();

    const download: MouseEventHandler<HTMLDivElement> = async (e) => {
        let url;
        const sourceName = `${getRandomName()}.webm`;

        try {
            const canvasElement = anchor.element as HTMLCanvasElement;

            setHasTried(true);
            setIsLoading(true);

            e.stopPropagation();
            e.preventDefault();
            url = await fetchCanvasMedia(canvasElement);
            try {
                sendToBackground({
                    name: "badge",
                    body: new Message("IncrementBadge")
                });
                const isAllowed = await imageCheck();
                if (!isAllowed) {
                    //notification
                    throw new Error("Not Authorized");
                }
                // send in progress message to background
                sendToBackground({
                    name: "progress",
                    body: new DownloadInProgressMessage({
                        contentType: "VIDEO",
                        progress: 0,
                        size: null,
                        url,
                        name: sourceName
                    })
                });
                downloadFile(url, sourceName);
                URL.revokeObjectURL(url);
                setSuccess(true);

                // send success message to background
                sendToBackground({
                    name: "success",
                    body: new DownloadSuccessMessage({
                        contentType: "VIDEO",
                        url,
                        name: sourceName
                    })
                });
            } catch (error) {
                throw error;
            }
        } catch (error) {
            reportError(error);
            setSuccess(false);
            // send fail message to background
            sendToBackground({
                name: "fail",
                body: new DownloadFailMessage({
                    contentType: "VIDEO",
                    url,
                    name: sourceName
                })
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-white">
                Downloading...
            </div>
        );
    } else if (hasTried) {
        if (success) {
            return (
                <div className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-green-500">
                    Saved!
                </div>
            );
        } else {
            return (
                <div
                    className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-red-500 hover:text-base"
                    onClick={download}>
                    Retry
                </div>
            );
        }
    } else {
        return (
            <div
                className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-white hover:text-base"
                onClick={download}>
                Download
            </div>
        );
    }
};

export default CustomButton;
