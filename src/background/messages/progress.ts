import type { PlasmoMessaging } from "@plasmohq/messaging"
import { IN_PROGRESS_TASKS, storage, type DownloadInProgressMessage } from "~lib/helper"
 
const handler: PlasmoMessaging.MessageHandler<DownloadInProgressMessage> = async (req, res) => {
    try {
            const prevValue = (await storage.get(IN_PROGRESS_TASKS) || []) as Array<DownloadInProgressMessage>;
            const newValue = prevValue;
            const currentTask = req.body;

            if(currentTask.progress === 0){
                newValue.unshift(currentTask)
            }
            else{
                // update download progress
            const targetTaskIndex = prevValue.findIndex(
                (task) => task.url === currentTask.url
            )
            if (targetTaskIndex === -1) {
                console.warn(
                `FROM TRCD EXTENSION: ${currentTask.url} begin message is missing`
                )
                newValue.unshift(currentTask)
            } else {
                newValue.splice(targetTaskIndex, 1, currentTask)
            }
            }
            await storage.set(IN_PROGRESS_TASKS,newValue)

            res.send({
                code:1
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