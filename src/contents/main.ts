import { sendToBackground } from "@plasmohq/messaging"
import type { PlasmoCSConfig } from "plasmo";
import { Message } from "~lib/helper";
export const config: PlasmoCSConfig = {
    matches: ["https://web.telegram.org/*"],
    world:'MAIN'
}
console.log('TRCD main is working')

window.addEventListener('beforeunload', (e) => {
    window.postMessage(new Message('Flush'),'*')
})
export {}