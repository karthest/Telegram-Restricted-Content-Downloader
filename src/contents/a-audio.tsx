import cssText from "data-text:./audio.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { type FC, type MouseEventHandler } from "react"

import { downloadFile } from "~lib/helper"
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

    const audioURL = await partialFetch(downloadURL)

    const fileName =
      mediaElement.querySelector("p.title")?.textContent || "default.mp3"

    downloadFile(audioURL, fileName)
  }

  if (isLoading) {
    return (
      <div className=" plasmo-text-xs plasmo-cursor-pointer plasmo-rounded-xl plasmo-px-2 plasmo-text-white">
        {`${(percentage * 100).toFixed(2)}%`}
      </div>
    )
  } else if (hasTried) {
    if (!error) {
      return (
        <div className=" plasmo-text-xs plasmo-cursor-pointer  plasmo-rounded-xl plasmo-px-2 plasmo-text-green-500">
          Saved!
        </div>
      )
    } else {
      return (
        <div
          className=" plasmo-text-xs plasmo-cursor-pointer  plasmo-rounded-xl plasmo-px-2 plasmo-text-red-500 "
          onClick={download}>
          Retry
        </div>
      )
    }
  } else
    return (
      <div
        className=" plasmo-text-xs plasmo-cursor-pointer  plasmo-rounded-xl plasmo-px-2 plasmo-text-white"
        onClick={download}>
        Download
      </div>
    )
}

export default CustomButton
