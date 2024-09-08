import type { PlasmoMessaging } from "@plasmohq/messaging";

import { IN_PROGRESS_TASKS, reportError, storage } from "~lib/helper";

const handler: PlasmoMessaging.MessageHandler<void> = async (req, res) => {
    try {
        await storage.set(IN_PROGRESS_TASKS, []),
            res.send({
                code: 1
            });
    } catch (error) {
        reportError(error);
        res.send({
            code: 0,
            data: error
        });
    }
};

export default handler;
