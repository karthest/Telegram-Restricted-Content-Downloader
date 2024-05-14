import type { PlasmoMessaging } from "@plasmohq/messaging"
import { DownloadInProgressMessage, IN_PROGRESS_TASKS, SUCCESS_TASKS, storage, type DownloadSuccessMessage } from "~lib/helper"
 
const handler: PlasmoMessaging.MessageHandler<DownloadSuccessMessage> = async (req, res) => {
    try {
        const [prevInProgressValue,prevSuccessValue] = await Promise.all([
            (await storage.get(IN_PROGRESS_TASKS) || []) as Array<DownloadInProgressMessage>,
            (await storage.get(SUCCESS_TASKS) || []) as Array<DownloadSuccessMessage>
        ])

        const newInProgressValue = prevInProgressValue;
    
        const newSuccessValue = prevSuccessValue;
    
        const currentTask = req.body;
    
        // detele task in downloading queue
        const { url } = currentTask
        const inProgressIndex = prevInProgressValue.findIndex((task) => task.url === url)
        if (inProgressIndex !== -1) {
            newInProgressValue.splice(inProgressIndex, 1)
        }
        if(prevSuccessValue.findIndex((task) => task.url === url) === -1){
            // add message to fail tasks
            newSuccessValue.unshift(currentTask)

        }

        await Promise.all([
            storage.set(IN_PROGRESS_TASKS,newInProgressValue),
            storage.set(SUCCESS_TASKS,newSuccessValue)
        ])


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