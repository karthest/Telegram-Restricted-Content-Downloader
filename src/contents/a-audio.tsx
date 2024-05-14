import cssText from "data-text:./audio.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { type FC, type MouseEventHandler } from "react"

import {
  DownloadFailMessage,
  downloadFile,
  DownloadInProgressMessage,
  DownloadSuccessMessage,
  Message
} from "~lib/helper"
import { usePartialFetch } from "~lib/hooks"

export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/a/*"],
  world: "MAIN"
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll("div.Audio.inline")

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const CustomButton: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const { isLoading, hasTried, error, partialFetch, percentage } =
    usePartialFetch()

  const download: MouseEventHandler<HTMLDivElement> = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    const mediaElement = anchor.element as HTMLDivElement

    const chatIDElements = document.querySelectorAll(
      "div.MiddleHeader div.Avatar"
    )
    const chatID =
      chatIDElements[chatIDElements.length - 1].getAttribute("data-peer-id")

    const getMessageId = (anchor: PlasmoCSUIAnchor) => {
      let messageIdElement = anchor.element
      while (messageIdElement.getAttribute("data-message-id") === null) {
        messageIdElement = messageIdElement.parentElement
      }
      return messageIdElement.getAttribute("data-message-id")
    }

    const messageID = getMessageId(anchor)

    const downloadURL = `./progressive/msg${chatID}-${messageID}`

    const fileName =
      mediaElement.querySelector("p.title")?.textContent || "default.mp3"
    try {
      window.postMessage(new Message("IncrementBadge"), "*")
      const audioURL = await partialFetch(downloadURL, {
        progress: (percentage) => {
          // send in progress message to background
          window.postMessage(
            new DownloadInProgressMessage({
              contentType: "AUDIO",
              progress: percentage,
              size: null,
              url: downloadURL,
              name: fileName
            }),
            "*"
          )
        }
      })

      downloadFile(audioURL, fileName)
      // send success message to background
      window.postMessage(
        new DownloadSuccessMessage({
          contentType: "AUDIO",
          url: downloadURL,
          name: fileName
        }),
        "*"
      )
    } catch (error) {
      console.error(error)
      // send fail message to background
      window.postMessage(
        new DownloadFailMessage({
          contentType: "AUDIO",
          url: downloadURL,
          name: fileName
        }),
        "*"
      )
    }
  }

  if (isLoading) {
    return (
      <div className=" text-xs cursor-pointer rounded-xl px-2 text-white">
        {`${(percentage * 100).toFixed(2)}%`}
      </div>
    )
  } else if (hasTried) {
    if (!error) {
      return (
        <div className=" text-xs cursor-pointer  rounded-xl px-2 text-green-500">
          Saved!
        </div>
      )
    } else {
      return (
        <div
          className=" text-xs cursor-pointer  rounded-xl px-2 text-red-500 "
          onClick={download}>
          Retry
        </div>
      )
    }
  } else
    return (
      <div
        className=" text-xs cursor-pointer  rounded-xl px-2 text-white"
        onClick={download}>
        Download
      </div>
    )
}

export default CustomButton
