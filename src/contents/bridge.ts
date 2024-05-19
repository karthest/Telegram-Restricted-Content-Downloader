import { sendToBackground } from "@plasmohq/messaging"
import type { PlasmoCSConfig } from "plasmo";
import { AuthorizationResultMessage, Message, RemainDownloadCountResultMessage } from "~lib/helper";
export const config: PlasmoCSConfig = {
    matches: ["https://web.telegram.org/*"],
}
console.log('TRCD bridge is working')

window.addEventListener('message', async (event:MessageEvent<Message>) => {
    
    if (event.source !== window || !event.data || event.data.source !== 'TRCD') {
        return;
    }
    const data = event.data;
    switch (data.type) {
        case 'Inprogress' :{
            sendToBackground({
                name:'progress',
                body:data
            });
            break;
        }
        case 'Success':{
            sendToBackground({
                name:'success',
                body:data
            });
            break;
        }
        case 'Fail':{
            sendToBackground({
                name: 'fail',
                body:data
            });
            break;
        }
        case 'Flush':{
            sendToBackground({
                name:'flush',
                body:data
            })
            break;
        }
        case 'IncrementBadge':{
            sendToBackground({
                name:"badge",
                body:data
            })
            break;
        }
        case 'GetAuthorization':{
            const res = await sendToBackground({
                name:'getValidSubscription'
            });
            window.postMessage(new AuthorizationResultMessage(res.code === 1,res.data),'*')
            break;
        }
        case 'OpenLoginPage':{
            sendToBackground({
                name:'openLoginPage'
            })
            break;
        }
        case 'GetRemainDownloadCount':{
            const res = await sendToBackground({
                name:'getRemainDownloadCount'
            });
            window.postMessage(new RemainDownloadCountResultMessage(res.code === 1 ? res.data :1),'*')
            break;
        }
        case 'OpenSubscriptionPage':{
            sendToBackground({
                name:'openSubscribePage'
            })
            break;
        }
        default:
            break;
    }
});
export {}