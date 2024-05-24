import type { PlasmoMessaging } from "@plasmohq/messaging"
import { kodepayClient } from "~background";
 
const handler: PlasmoMessaging.MessageHandler<void> = async (req, res) => {
    try {
        
        await kodepayClient.doLogout()
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