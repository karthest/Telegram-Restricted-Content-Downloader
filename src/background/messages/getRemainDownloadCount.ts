import type { PlasmoMessaging } from "@plasmohq/messaging"
import { kodepayClient } from "~background"
import { REMAIN_DOWNLOAD_COUNT, storage } from "~lib/helper"
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    try {
        const [count,subscriptions] = await Promise.all([
            storage.get(REMAIN_DOWNLOAD_COUNT()),
            kodepayClient.getValidSubscriptions()
        ])
        const resCount = count ?? 5

        // not login
        if(subscriptions.code === 100011 || subscriptions.code === 401  || !subscriptions){
            res.send({
                code:1,
                data:resCount
            })
            return ;
        }

        res.send({
            code:1,
            data:999
        })
    } catch (error) {
        console.error(error)
        res.send({
            code:0,
            data:error.message
        })
    }

}
 
export default handler