import cssText from "data-text:./video-image.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { useState, type FC, type MouseEventHandler } from "react"

import { downloadFile } from "~lib/helper"
import { usePartialFetch } from "~lib/hooks"

export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/k/*"],
  world: "MAIN"
}

// section.bubbles-date-group video ---> preview
// div.media-viewer-aspecter video ---> detail
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(
    `
    section.bubbles-date-group video.media-video,
    div.media-viewer-aspecter video
    `
  )

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const CustomButton: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const { isLoading, hasTried, error, partialFetch, percentage } =
    usePartialFetch()

  const download: MouseEventHandler<HTMLDivElement> = async (e) => {
    const videoElement = anchor.element as HTMLVideoElement

    e.stopPropagation()
    e.preventDefault()

    const downloadURL = videoElement.src

    const sourceName = "default.mp4"

    const videoURL = await partialFetch(downloadURL)

    downloadFile(videoURL, sourceName)
  }

  if (isLoading) {
    return (
      <div className=" plasmo-text-xs plasmo-cursor-pointer plasmo-bg-black/35 plasmo-rounded-xl plasmo-px-2 plasmo-text-white">
        {`${(percentage * 100).toFixed(2)}%`}
      </div>
    )
  } else if (hasTried) {
    if (!error) {
      return (
        <div className=" plasmo-text-xs plasmo-cursor-pointer plasmo-bg-black/35 plasmo-rounded-xl plasmo-px-2 plasmo-text-green-500">
          Saved!
        </div>
      )
    } else {
      return (
        <div
          className=" plasmo-text-xs plasmo-cursor-pointer plasmo-bg-black/35 plasmo-rounded-xl plasmo-px-2 plasmo-text-red-500 hover:plasmo-text-base"
          onClick={download}>
          Retry
        </div>
      )
    }
  } else {
    return (
      <div
        className=" plasmo-text-xs plasmo-cursor-pointer plasmo-bg-black/35 plasmo-rounded-xl plasmo-px-2 plasmo-text-white hover:plasmo-text-base"
        onClick={download}>
        Download
      </div>
    )
  }
}

export default CustomButton
