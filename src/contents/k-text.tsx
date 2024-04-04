import cssText from "data-text:./video-image.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { useEffect, type FC, type MouseEventHandler } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://web.telegram.org/k/*"],
  world: "MAIN"
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
    // k版本不支持文字的复制，在这里提供解锁功能
    if (anchor.element instanceof HTMLElement) {
      anchor.element.style.userSelect = "text"
    }
  }, [])

  return <></>
}

export default CustomButton
