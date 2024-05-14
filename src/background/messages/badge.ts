import type { PlasmoMessaging } from "@plasmohq/messaging"
import { BADGE_COUNT, storage, type Message } from "~lib/helper"
 
const handler: PlasmoMessaging.MessageHandler<Message> = async (req, res) => {
    try {
        const {body } = req;
        switch (body.type) {
            case "IncrementBadge":{
                const badgeCount = (await storage.get(BADGE_COUNT) || 0) as number
                await storage.set(BADGE_COUNT,badgeCount + 1)
                chrome.action.setBadgeText({ text: (badgeCount + 1).toString()});
                break;
            }
            case "resetBadge":{
                await storage.set(BADGE_COUNT, 0)
                chrome.action.setBadgeText({ text: ""});
                break;
            }
        }
        res.send({
            code:1
        })
    } catch (error) {
        console.error(error)
        res.send({
            code:0,
            reason:error
        })
    }

}
 
export default handler