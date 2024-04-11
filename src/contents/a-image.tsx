import cssText from "data-text:./video-image.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { useState, type FC, type MouseEventHandler } from "react"

import { downloadFile } from "~lib/helper"

export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/a/*"],
  world: "MAIN"
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

  const download: MouseEventHandler<HTMLDivElement> = (e) => {
    try {
      setHasTried(true)
      setIsLoading(true)
      e.stopPropagation()
      e.preventDefault()
      const mediaElement = anchor.element as HTMLImageElement

      const downloadURL = mediaElement.src

      const sourceName = downloadURL.split("/").slice(-1)[0] || "default.png"

      downloadFile(downloadURL, sourceName)

      setSuccess(true)
    } catch (error) {
      console.error(
        "Error downloading video from Telegram Media Downloader Extension:",
        error
      )
      setSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className=" plasmo-text-xs plasmo-cursor-pointer plasmo-bg-black/35 plasmo-rounded-xl plasmo-px-2 plasmo-text-white">
        Downloading...
      </div>
    )
  } else if (hasTried) {
    if (success) {
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
  } else
    return (
      <div
        className=" plasmo-text-xs plasmo-cursor-pointer plasmo-bg-black/35 plasmo-rounded-xl plasmo-px-2 plasmo-text-white hover:plasmo-text-base"
        onClick={download}>
        Download
      </div>
    )
}

export default CustomButton
