import cssText from "data-text:./video-image.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { useState, type FC, type MouseEventHandler } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import {
  DownloadFailMessage,
  downloadFile,
  DownloadInProgressMessage,
  DownloadSuccessMessage,
  Message
} from "~lib/helper"
import { useUserPlan } from "~lib/hooks"

export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/a/*"]
}

// img.full-media ---> preview
// div.MediaViewerContent img ---> detail
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(
    `
    img.full-media,
    div.MediaViewerContent img
    `
  )

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const CustomButton: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [success, setSuccess] = useState(false)
  const [hasTried, setHasTried] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { imageCheck } = useUserPlan()

  const download: MouseEventHandler<HTMLDivElement> = async (e) => {
    setHasTried(true)
    setIsLoading(true)
    e.stopPropagation()
    e.preventDefault()
    const mediaElement = anchor.element as HTMLImageElement

    const downloadURL = mediaElement.src

    const sourceName = downloadURL.split("/").slice(-1)[0] || "default.png"
    try {
      const isAllowed = await imageCheck()
      if (!isAllowed) {
        //TODO notification
        throw Error("Not Authorized")
      }
      sendToBackground({
        name: "badge",
        body: new Message("IncrementBadge")
      })
      // send in progress message to background
      sendToBackground({
        name: "progress",
        body: new DownloadInProgressMessage({
          contentType: "IMAGE",
          progress: 0,
          size: null,
          url: downloadURL,
          name: sourceName
        })
      })

      downloadFile(downloadURL, sourceName)

      setSuccess(true)
      // send success message to background
      sendToBackground({
        name: "success",
        body: new DownloadSuccessMessage({
          contentType: "IMAGE",
          url: downloadURL,
          name: sourceName
        })
      })
    } catch (error) {
      console.error(
        "Error downloading video from Telegram Media Downloader Extension:",
        error
      )
      setSuccess(false)
      // send fail message to background
      sendToBackground({
        name: "fail",
        body: new DownloadFailMessage({
          contentType: "IMAGE",
          url: downloadURL,
          name: sourceName
        })
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-white">
        Downloading...
      </div>
    )
  } else if (hasTried) {
    if (success) {
      return (
        <div className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-green-500">
          Saved!
        </div>
      )
    } else {
      return (
        <div
          className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-red-500 hover:text-base"
          onClick={download}>
          Retry
        </div>
      )
    }
  } else
    return (
      <div
        className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-white hover:text-base"
        onClick={download}>
        Download
      </div>
    )
}

export default CustomButton
