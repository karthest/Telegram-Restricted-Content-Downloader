import cssText from "data-text:./video-image.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { useState, type FC, type MouseEventHandler } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/k/*"],
  world: "MAIN"
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

  const download: MouseEventHandler<HTMLDivElement> = (e) => {
    try {
      setHasTried(true)
      setIsLoading(true)
      const imageElement = anchor.element as HTMLImageElement

      e.stopPropagation()
      e.preventDefault()
      const downloadURL = imageElement.src

      const sourceName = downloadURL.split("/").slice(-1)[0] || "default.png"

      const downloadLink = document.createElement("a")
      downloadLink.href = downloadURL
      downloadLink.download = sourceName
      downloadLink.click()
      setSuccess(true)
    } catch (error) {
      setSuccess(false)
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
  } else {
    if (showHint) {
      return (
        <div
          className=" plasmo-text-xs plasmo-cursor-pointer plasmo-bg-black/35 plasmo-rounded-xl plasmo-px-2 plasmo-text-white hover:plasmo-text-base"
          onClick={openVideo}>
          Open
        </div>
      )
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
}

export default CustomButton
