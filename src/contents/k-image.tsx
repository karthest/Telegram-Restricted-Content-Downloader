import cssText from "data-text:./video-image.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { useEffect, useState, type FC, type MouseEventHandler } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import {
  DownloadFailMessage,
  DownloadInProgressMessage,
  DownloadSuccessMessage,
  Message,
  reportError
} from "~lib/helper"
import { useUserPlan } from "~lib/hooks"

export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/k/*"]
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(
    `
    div.attachment img.media-photo,
    div.attachment > img.media-sticker,
    div.album-item-media img.media-photo,

    div.media-viewer-aspecter img.thumbnail
    `
  )

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const CustomButton: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [hasTried, setHasTried] = useState(false)

  const { imageCheck } = useUserPlan()

  const showHint =
    anchor.element.className.includes("media-photo") &&
    // many videos in one messageand not auto-play
    (Array.from(anchor.element.parentElement.children).findIndex((element) =>
      element.matches("button.video-play")
    ) > -1 ||
      // single video in one message and not auto-play
      Array.from(anchor.element.parentElement.parentElement.children).findIndex(
        (element) => element.matches("button.video-play")
      ) > -1)

  const shouldNotRender =
    (!showHint &&
      anchor.element.className.includes("media-photo") &&
      (Array.from(anchor.element.parentElement.children).findIndex((element) =>
        element.matches("span.video-time")
      ) > -1 ||
        Array.from(
          anchor.element.parentElement.parentElement.children
        ).findIndex((element) => element.matches("span.can-autoplay")) > -1 ||
        Array.from(anchor.element.parentElement.children).findIndex((element) =>
          element.matches("span.can-autoplay")
        ) > -1 ||
        Array.from(
          anchor.element.parentElement.parentElement.children
        ).findIndex((element) => element.matches("span.video-time")) > -1)) ||
    Array.from(anchor.element.parentElement.children).findIndex((element) =>
      element.matches("div.media-round")
    ) > -1

  const download: MouseEventHandler<HTMLDivElement> = async (e) => {
    const imageElement = anchor.element as HTMLImageElement
    const downloadURL = imageElement.src
    setHasTried(true)
    setIsLoading(true)

    e.stopPropagation()
    e.preventDefault()

    const sourceName = downloadURL.split("/").slice(-1)[0] || "default.png"
    try {
      sendToBackground({
        name: "badge",
        body: new Message("IncrementBadge")
      })
      const isAllowed = await imageCheck()
      console.log(
        "🚀 ~ constdownload:MouseEventHandler<HTMLDivElement>= ~ isAllowed:",
        isAllowed
      )
      if (!isAllowed) {
        //notification
        throw new Error("Not Authorized")
      }
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

      const downloadLink = document.createElement("a")
      downloadLink.href = downloadURL
      downloadLink.download = sourceName
      downloadLink.click()
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
      reportError(error)
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

  const openVideo: MouseEventHandler<HTMLDivElement> = (e) => {
    const targetElement = anchor.element as HTMLImageElement
    targetElement.click()
  }

  if (shouldNotRender) {
    return <></>
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
  } else {
    if (showHint) {
      return (
        <div
          className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-white hover:text-base"
          onClick={openVideo}>
          Open
        </div>
      )
    } else {
      return (
        <div
          className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-white hover:text-base"
          onClick={download}>
          Download
        </div>
      )
    }
  }
}

export default CustomButton
