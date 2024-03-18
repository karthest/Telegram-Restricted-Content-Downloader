import cssText from "data-text:./downloader.css"
import type {
  PlasmoCreateShadowRoot,
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList,
  PlasmoGetOverlayAnchorList
} from "plasmo"
import { useEffect, useState, type FC, type MouseEventHandler } from "react"

console.log("Telegram Media Downloader is helping you.")
export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/a/*"],
  world: "MAIN"
}

// img.full-media 为预览图
// video.full-media 为预览视频
// div.MediaViewerContent img 为详情图
// div.VideoPlayer video 为详情视频
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(
    "img.full-media,video.full-media,div.MediaViewerContent img,div.VideoPlayer video"
  )

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// a 版本本身支持文字复制，故不再重复处理
const allowTextCopy = () => {
  const textElements: NodeListOf<HTMLDivElement> =
    document.querySelectorAll("text-content")
  textElements.forEach((div) => (div.style.userSelect = "text"))
  console.log(textElements)
}

const CustomButton: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [hasTried, setHasTried] = useState(false)

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
