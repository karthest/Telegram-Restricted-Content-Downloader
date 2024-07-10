import type { PlasmoMessaging } from "@plasmohq/messaging"
import { kodepayClient } from "~background";
import  { type MessageRes, type SubscriptionInfo } from "~lib/helper"
 
const handler: PlasmoMessaging.MessageHandler<void,MessageRes<Array<SubscriptionInfo>>> = async (req, res) => {
    try {
        const subscriptions = await kodepayClient.getValidSubscriptions()
        console.log("🚀 ~ consthandler:PlasmoMessaging.MessageHandler<void,MessageRes<Array<SubscriptionInfo>>>= ~ subscriptions:", subscriptions)
        if(subscriptions.code === 100011){
            throw new Error('Not Login')
        }
        if(subscriptions.code === 401){
            throw new Error('Online Count Limit')
        }
        if(subscriptions.length === 0){
            throw new Error('No Valid Subscription')
        }
        res.send({
            code:1,
            data:subscriptions
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