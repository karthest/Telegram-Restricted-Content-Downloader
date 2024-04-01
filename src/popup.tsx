import { useEffect } from "react"

import "~style.css"

export default function IndexPopup() {
  const openFeedBackWindow = () => {
    window.open("https://t.me/+pHaZ8oHR-rZiZDI1")
  }
  return (
    <div className=" plasmo-px-2 plasmo-py-2">
      <button
        className=" plasmo-w-40 plasmo-rounded-lg plasmo-bg-green-400"
        onClick={openFeedBackWindow}>
        <span className=" plasmo-font-bold plasmo-text-lg plasmo-text-green-100 plasmo-leading-8">
          Feedback
        </span>
      </button>
    </div>
  )
}
