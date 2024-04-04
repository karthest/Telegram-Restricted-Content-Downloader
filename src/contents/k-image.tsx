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

// section.bubbles-date-group img.media-photo 为预览图
// img.thumbnail 为详情图
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(
    `
    section.bubbles-date-group img.media-photo,
    img.thumbnail
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

  // 当anchor为img.media-photo时，若anchor兄弟节点存在button.video-play，则下载的是视频的缩略图，需要提示用户。
  const showHint =
    anchor.element.tagName === "IMG" &&
    anchor.element.className.includes("media-photo") &&
    Array.from(anchor.element.parentElement.children).findIndex(
      (element) =>
        element.tagName === "BUTTON" && element.className.includes("video-play")
    ) > -1

  // 当消息为单条视频时，页面结构为img+video，此时不展示img的下载按钮。
  const shouldNotRender =
    anchor.element.tagName === "IMG" &&
    anchor.element.className.includes("media-photo") &&
    Array.from(anchor.element.parentElement.children).findIndex(
      (element) =>
        element.tagName === "SPAN" && element.className.includes("can-autoplay")
    ) > -1

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
