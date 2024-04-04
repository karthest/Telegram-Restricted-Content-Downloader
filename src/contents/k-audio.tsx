import cssText from "data-text:./audio.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { type FC, type MouseEventHandler } from "react"

import { downloadFile, waitForElement } from "~lib/helper"
import { usePartialFetch } from "~lib/hooks"

export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/k/*"],
  world: "MAIN"
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll("audio-element")

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
    const togglePlayElement = mediaElement.querySelector(
      "div.audio-toggle"
    ) as HTMLDivElement
    togglePlayElement.click()

    const fileName =
      mediaElement.querySelector("middle-ellipsis-element")?.textContent ||
      "default.mp3"

    const selector = `audio[src*="${encodeURIComponent(fileName)}"]`

    const audioElement = (await waitForElement(selector)) as HTMLAudioElement

    const downloadURL = audioElement.src
    const audioURL = await partialFetch(downloadURL)
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
