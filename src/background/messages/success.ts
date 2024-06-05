import type { PlasmoMessaging } from "@plasmohq/messaging"
import { BASIC_PLAN_DOWNLOAD_LIMIT, DownloadInProgressMessage, IN_PROGRESS_TASKS, REMAIN_DOWNLOAD_COUNT, SUCCESS_TASKS, storage, type DownloadSuccessMessage } from "~lib/helper"
 
const handler: PlasmoMessaging.MessageHandler<DownloadSuccessMessage> = async (req, res) => {
    try {
        const [prevInProgressValue,prevSuccessValue,count] = await Promise.all([
            storage.get(IN_PROGRESS_TASKS) as Promise<Array<DownloadInProgressMessage>>,
            storage.get(SUCCESS_TASKS) as Promise<Array<DownloadSuccessMessage>>,
            storage.get(REMAIN_DOWNLOAD_COUNT()) as Promise<number>
        ])

        const prevInProgressValueRes = prevInProgressValue || []
        const prevSuccessValueRes = prevSuccessValue || []
        const countRes = count ?? BASIC_PLAN_DOWNLOAD_LIMIT

        const newInProgressValue = prevInProgressValueRes;
    
        const newSuccessValue = prevSuccessValueRes;
    
        const currentTask = req.body;
    
        // detele task in downloading queue
        const { url } = currentTask
        const inProgressIndex = prevInProgressValueRes.findIndex((task) => task.url === url)
        if (inProgressIndex !== -1) {
            newInProgressValue.splice(inProgressIndex, 1)
        }
        if(prevSuccessValueRes.findIndex((task) => task.url === url) === -1){
            // add message to fail tasks
            newSuccessValue.unshift(currentTask)

        }

        await Promise.all([
            storage.set(IN_PROGRESS_TASKS,newInProgressValue),
            storage.set(SUCCESS_TASKS,newSuccessValue),
            storage.set(REMAIN_DOWNLOAD_COUNT(), countRes-1)
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