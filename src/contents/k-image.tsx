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
  DownloadInProgressMessage,
  DownloadSuccessMessage,
  Message
} from "~lib/helper"
import { useUserPlan } from "~lib/hooks"

export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/k/*"]
}

// section.bubbles-date-group img.media-photo ---> preview
// div.media-viewer-aspecter img.thumbnail ---> detail
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(
    `
    section.bubbles-date-group img.media-photo,
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
    (Array.from(anchor.element.parentElement.children).findIndex(
      (element) =>
        element.tagName === "BUTTON" && element.className.includes("video-play")
    ) > -1 ||
      // single video in one message and not auto-play
      Array.from(anchor.element.parentElement.parentElement.children).findIndex(
        (element) =>
          element.tagName === "BUTTON" &&
          element.className.includes("video-play")
      ) > -1)

  // When the message is a single video and the sibling dom or parents' sibling dom has span.can-autoplay, which means the video can be played once the page loaded, so img download button should not be displayed.
  const shouldNotRender =
    anchor.element.className.includes("media-photo") &&
    (Array.from(anchor.element.parentElement.parentElement.children).findIndex(
      (element) => element.matches("span.can-autoplay")
    ) > -1 ||
      Array.from(anchor.element.parentElement.children).findIndex((element) =>
        element.matches("span.can-autoplay")
      ) > -1)

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
      console.log("🚀 ~ error:", error)
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

  const login: MouseEventHandler<HTMLDivElement> = () => {
    window.postMessage(new Message("OpenLoginPage"), "*")
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
