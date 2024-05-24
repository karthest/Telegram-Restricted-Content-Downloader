import cssText from "data-text:./audio.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { type FC, type MouseEventHandler } from "react"

import {
  decodeKVersionURL,
  DownloadFailMessage,
  downloadFile,
  DownloadInProgressMessage,
  DownloadSuccessMessage,
  Message,
  waitForElement
} from "~lib/helper"
import { usePartialFetch, useUserPlan } from "~lib/hooks"

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
  const { isLoading, hasTried, error, partialFetch, percentage, setError } =
    usePartialFetch()

  const { audioCheck } = useUserPlan()

  const download: MouseEventHandler<HTMLDivElement> = async (e) => {
    e.stopPropagation()
    e.preventDefault()

    const mediaElement = anchor.element as HTMLDivElement
    const togglePlayElement = mediaElement.querySelector(
      "div.audio-toggle"
    ) as HTMLDivElement
    togglePlayElement.click()
    const htmlFileName = mediaElement
      .querySelector("middle-ellipsis-element")
      ?.textContent?.split("…")?.[0]
    if (htmlFileName === undefined) {
      // can't find the audio
      return
    }
    const selector = `audio[src*="${encodeURIComponent(htmlFileName)}"]`

    const audioElement = (await waitForElement(selector)) as HTMLAudioElement

    const downloadURL = audioElement.src

    const mediaInfo = decodeKVersionURL(downloadURL)

    const fileName =
      mediaInfo.location.fileName || mediaInfo.fileName || mediaInfo.location.id

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
        },
        check: audioCheck
      })

      if (audioURL === "") {
        setError(true)
        //TODO notification
        return
      }

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
      <div className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-white">
        {`${(percentage * 100).toFixed(2)}%`}
      </div>
    )
  } else if (hasTried) {
    if (!error) {
      return (
        <div className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-green-500">
          Saved!
        </div>
      )
    } else {
      return (
        <div
          className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-red-500 "
          onClick={download}>
          Retry
        </div>
      )
    }
  } else
    return (
      <div
        className=" text-xs cursor-pointer bg-black/35 rounded-xl px-2 text-white hover:text-base"
        onClick={download}>
        Download
      </div>
    )
}

export default CustomButton
