import { sendToBackground } from "@plasmohq/messaging"
import type { PlasmoCSConfig } from "plasmo";
import { Message } from "~lib/helper";
export const config: PlasmoCSConfig = {
    matches: ["https://web.telegram.org/*"],
}
console.log('TRCD bridge is working')

window.addEventListener('message', function(event:MessageEvent<Message>) {
    
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
        default:
            break;
    }
});
export {}