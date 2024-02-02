import cssText from "data-text:./downloader.css"
import type {
  PlasmoCreateShadowRoot,
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList,
  PlasmoGetOverlayAnchorList
} from "plasmo"
import { useState, type FC, type MouseEventHandler } from "react"

console.log("Telegram Media Downloader is helping you.")
export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/k/*"],
  world: "MAIN"
}
// div.bubbles
// div.media-container video预览视频
// img.media-photo 为预览图
// img.thumbnail 为详情图
// div.media-viewer-aspecter video为详情视频
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(
    "div.bubbles div.media-container video, div.bubbles img.media-photo, div.bubbles img.thumbnail, div.bubbles div.media-viewer-aspecter video"
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

  const downloadImage = (imageElement: HTMLImageElement) => {
    try {
      setHasTried(true)
      setIsLoading(true)
      const downloadURL = imageElement.src
      console.log("🚀 ~ downloadURL:", downloadURL)

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

  const downloadVideo = async (videoElement: HTMLVideoElement) => {
    try {
      setHasTried(true)
      setIsLoading(true)

      const concatenateArrayBuffers = (arrayBuffers) => {
        // Calculate the total length of all array buffers
        const totalLength = arrayBuffers.reduce(
          (length, buffer) => length + buffer.byteLength,
          0
        )

        // Create a new Uint8Array with the total length
        const resultArray = new Uint8Array(totalLength)

        // Use the set method to concatenate the array buffers
        let offset = 0
        for (const buffer of arrayBuffers) {
          const sourceArray = new Uint8Array(buffer)
          resultArray.set(sourceArray, offset)
          offset += sourceArray.length
        }

        // Create a new ArrayBuffer from the concatenated Uint8Array
        const concatenatedBuffer = resultArray.buffer

        return concatenatedBuffer
      }
      const downloadURL = videoElement.src
      console.log("🚀 ~ downloadVideo ~ downloadURL:", downloadURL)

      const sourceName = downloadURL.split("/").slice(-1)[0] || "default.mp4"
      console.log("🚀 ~ downloadVideo ~ sourceName:", sourceName)

      const requestHeaders: HeadersInit = {
        Range: `bytes=0-`
      }
      const response = await fetch(downloadURL, {
        headers: requestHeaders
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const contentSize = parseInt(
        response.headers.get("Content-Range").split("/")[1],
        10
      )
      console.log("🚀 ~ downloadVideo ~ contentSize:", contentSize)
      const segmentSize = parseInt(response.headers.get("Content-Length"), 10)
      const contentType = response.headers.get("Content-Type")
      console.log("🚀 ~ downloadVideo ~ contentType:", contentType)

      // Check if the server supports partial content
      const acceptRanges = response.headers.get("Accept-Ranges")
      if (acceptRanges !== "bytes") {
        throw new Error("Server does not support partial content (byte ranges)")
      }

      const segmentCount = Math.ceil(contentSize / segmentSize)

      const fetchPromises = new Array(segmentCount)
        .fill(0)
        .map((value, index) => index * segmentSize)
        .map((startByte) => {
          const endByte = Math.min(startByte + segmentSize - 1, contentSize - 1)

          const headers: HeadersInit = {
            Range: `bytes=${startByte}-${endByte}`
          }

          return fetch(downloadURL, {
            headers
          })
        })
      const rawResArray = await Promise.all(fetchPromises)
      const bufferArray = await Promise.all(
        rawResArray.map((res) => res.arrayBuffer())
      )

      const videoBuffer = concatenateArrayBuffers(bufferArray)

      // Create a Blob from the ArrayBuffer
      const videoBlob = new Blob([videoBuffer], { type: contentType })

      // Create a URL representing the Blob
      const videoURL = URL.createObjectURL(videoBlob)
      console.log("🚀 ~ downloadVideo ~ videoUrl:", videoURL)

      const downloadLink = document.createElement("a")
      // Set the download link's href to the video source
      downloadLink.href = videoURL

      // Set the download attribute with a suggested filename
      downloadLink.download = sourceName

      downloadLink.click()

      setSuccess(true)
    } catch (error) {
      setSuccess(false)
      console.error(
        "Error downloading video from Telegram Media Downloader Extension:",
        error
      )
    } finally {
      setIsLoading(false)
    }
  }

  const download: MouseEventHandler<HTMLDivElement> = (e) => {
    const mediaElement = anchor.element
    const mediaType = mediaElement.tagName

    e.stopPropagation()
    e.preventDefault()

    switch (mediaType) {
      case "IMG": {
        downloadImage(mediaElement as HTMLImageElement)
        break
      }
      case "VIDEO": {
        downloadVideo(mediaElement as HTMLVideoElement)
        break
      }
    }
  }

  const openVideo: MouseEventHandler<HTMLDivElement> = (e) => {
    const targetElement = anchor.element as HTMLImageElement
    targetElement.click()
  }

  if (shouldNotRender) {
    console.log("🚀 ~ shouldNotRender:", shouldNotRender)
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
