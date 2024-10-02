// import * as Sentry from "@sentry/react";
import type { PlasmoCSConfig } from "plasmo";

import { Message, reportError } from "~lib/helper";

export const config: PlasmoCSConfig = {
    matches: ["https://web.telegram.org/*"],
    world: "MAIN"
};
console.log("TRCD main is working");

// Sentry.init({
//     dsn: process.env.PLASMO_PUBLIC_SENTRY_ID,
//     environment: process.env.NODE_ENV,
//     beforeSend(event) {
//         if (event?.tags?.manually) {
//             return event;
//         }
//         return null;
//     }
// });

window.addEventListener("beforeunload", (e) => {
    window.postMessage(new Message("Flush"), "*");
});
export {};
