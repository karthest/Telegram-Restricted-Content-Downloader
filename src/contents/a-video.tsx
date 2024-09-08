import cssText from "data-text:./video-image.css";
import type {
    PlasmoCSConfig,
    PlasmoCSUIProps,
    PlasmoGetInlineAnchorList
} from "plasmo";
import { type FC, type MouseEventHandler } from "react";

import {
    DownloadFailMessage,
    downloadFile,
    DownloadInProgressMessage,
    DownloadSuccessMessage,
    Message,
    reportError
} from "~lib/helper";
import { usePartialFetch, useUserPlan } from "~lib/hooks";

export const config: PlasmoCSConfig = {
    matches: ["https://web.telegram.org/a/*"],
    world: "MAIN"
};

// video.full-media ---> preview
// div.VideoPlayer video ---> detail
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
    document.querySelectorAll(
        `
    video.full-media,
    div.VideoPlayer video
    `
    );

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = cssText;
    return style;
};

const CustomButton: FC<PlasmoCSUIProps> = ({ anchor }) => {
    const { isLoading, hasTried, error, partialFetch, percentage, setError } =
        usePartialFetch();

    const { videoCheck } = useUserPlan();

    const download: MouseEventHandler<HTMLDivElement> = async (e) => {
        const videoElement = anchor.element as HTMLVideoElement;

        e.stopPropagation();
        e.preventDefault();

        const downloadURL = videoElement.src;

        const sourceName = downloadURL.split("/").slice(-1)[0] || "default.mp4";
        try {
            window.postMessage(new Message("IncrementBadge"), "*");
            const videoURL = await partialFetch(downloadURL, {
                progress: (percentage) => {
                    // send in progress message to background
                    window.postMessage(
                        new DownloadInProgressMessage({
                            contentType: "VIDEO",
                            progress: percentage,
                            size: null,
                            url: downloadURL,
                            name: sourceName
                        }),
                        "*"
                    );
                },
                check: videoCheck
            });
            if (videoURL === "") {
                setError(true);
                //TODO notification
                throw Error("Not Authorized");
            }
            downloadFile(videoURL, sourceName);
            // send success message to background
            window.postMessage(
                new DownloadSuccessMessage({
                    contentType: "VIDEO",
                    url: downloadURL,
                    name: sourceName
                }),
                "*"
            );
        } catch (error) {
            reportError(error);
            // send fail message to background
            window.postMessage(
                new DownloadFailMessage({
                    contentType: "VIDEO",
                    url: downloadURL,
                    name: sourceName
                }),
                "*"
            );
        }
    };

    if (isLoading) {
        return (
            <div className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-white">
                {`${(percentage * 100).toFixed(2)}%`}
            </div>
        );
    } else if (hasTried) {
        if (!error) {
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
    } else
        return (
            <div
                className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-white hover:text-base"
                onClick={download}>
                Download
            </div>
        );
};

export default CustomButton;
