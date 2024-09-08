import type { PlasmoMessaging } from "@plasmohq/messaging";

import { kodepayClient } from "~background";
import { reportError } from "~lib/helper";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    try {
        await kodepayClient.openUserManagementPage();
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
