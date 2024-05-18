import type { PlasmoMessaging } from "@plasmohq/messaging"
import { kodepayClient } from "~background";
import type { OpenPaymentChoosePageMessage } from "~lib/helper";
 
const handler: PlasmoMessaging.MessageHandler<OpenPaymentChoosePageMessage> = async (req, res) => {
    try {
        const {planID,currency} = req.body
        await kodepayClient.openPaymentChoosePage({
            plan_id:planID,
            currency
        })
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