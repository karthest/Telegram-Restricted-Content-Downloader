import type { PlasmoMessaging } from "@plasmohq/messaging"
import { FAIL_TASKS, IN_PROGRESS_TASKS, storage, type DownloadFailMessage, type DownloadInProgressMessage } from "~lib/helper"
 
const handler: PlasmoMessaging.MessageHandler<DownloadFailMessage> = async (req, res) => {
    try {
            const [prevInProgressValue,prevFailValue] = await Promise.all([
                storage.get(IN_PROGRESS_TASKS) as Promise<Array<DownloadInProgressMessage>>,
                storage.get(FAIL_TASKS) as Promise<Array<DownloadFailMessage>>
            ])
            const prevInProgressValueRes = prevInProgressValue || []
            const prevFailValueRes = prevFailValue || []

            const newInProgressValue = prevInProgressValueRes;
        
            const newFailValue = prevFailValueRes;
        
            const currentTask = req.body;
        
            // detele task in downloading queue
            const { url } = currentTask
            const inProgressIndex = prevInProgressValueRes.findIndex((task) => task.url === url)
            if (inProgressIndex !== -1) {
                newInProgressValue.splice(inProgressIndex, 1)
            }

            if(prevFailValueRes.findIndex ((task) => task.url === url) === -1){
                // add message to fail tasks
                newFailValue.unshift(currentTask)
            }

            await Promise.all([
                storage.set(IN_PROGRESS_TASKS,newInProgressValue),
                storage.set(FAIL_TASKS,newFailValue)
            ])

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