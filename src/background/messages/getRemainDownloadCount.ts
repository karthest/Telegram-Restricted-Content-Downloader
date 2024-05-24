import type { PlasmoMessaging } from "@plasmohq/messaging"
import { kodepayClient } from "~background"
import { REMAIN_DOWNLOAD_COUNT, storage } from "~lib/helper"
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    try {
        const [count,subscriptions] = await Promise.all([
            storage.get(REMAIN_DOWNLOAD_COUNT()),
            kodepayClient.getValidSubscriptions()
        ])
        const resCount = count ?? 3

        if(subscriptions.code === 100011){
            res.send({
                code:1,
                data:{
                    resCount,
                    reason:'Not Login'
                }
            })
            return ;
        }
        if(subscriptions.code === 401){
            res.send({
                code:1,
                data:{
                    resCount,
                    reason:'Online Count Limit'
                }
            })
            return ;
        }
        if(subscriptions.length === 0){
            res.send({
                code:1,
                data:{
                    resCount,
                    reason:'No Valid Subscription'
                }
            })
            return ;
        }

        res.send({
            code:1,
            data:{
                resCount,
            }
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