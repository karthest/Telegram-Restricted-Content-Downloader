import cssText from "data-text:./video-image.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { useEffect, type FC, type MouseEventHandler } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/k/*"]
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(
    `
    div.message.spoilers-container
    `
  )

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const CustomButton: FC<PlasmoCSUIProps> = ({ anchor }) => {
  useEffect(() => {
    // copy text is not allowed in k version, enable it here
    if (anchor.element instanceof HTMLElement) {
      anchor.element.style.userSelect = "text"
    }
  }, [])

  return <></>
}

export default CustomButton
