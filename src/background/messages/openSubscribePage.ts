import type { PlasmoMessaging } from "@plasmohq/messaging"
 
const handler: PlasmoMessaging.MessageHandler<void> = async (req, res) => {
    try {
        chrome.tabs.create({ url: `chrome-extension://${process.env.PLASMO_PUBLIC_EXTENSION_ID}/tabs/subscribe.html` });
        res.send({
            code:1,
        })
    } catch (error) {
        console.error(error)
        res.send({
            code:0,
            data:error
        })
    }

}
 
export default handler