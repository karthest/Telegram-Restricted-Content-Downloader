// service_worker
import { Kodepay } from 'kodepay'
//You can find the application_id in the event callback settings page
//You can find the extension_id in the extension page
const kodepayClient = Kodepay.kodepay({
    application_id: process.env.PLASMO_PUBLIC_APPLICATION_ID, 
    "client_id":process.env.PLASMO_PUBLIC_CLIENT_ID, 
    mode: process.env.NODE_ENV
});


chrome.runtime.onInstalled.addListener(() => {
    // survey
    chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/e/1FAIpQLSfn1DEFXCUWxqpU_iG_wOeK0yytaCiqmgWnBJAUT0_K_fJw2A/viewform?usp=sf_link');
});

export {
    kodepayClient
}

/* Note if you're building for firefox or mv2 in general, chrome.action will be undefined so you have to do something like this:

@see https://stackoverflow.com/questions/70216500/chrome-action-is-undefined-migrating-to-v3-manifest

const handleClick = (tab) => {
  console.log("clicked", tab.id);
  if (!tab.id) throw new Error("tab id not found");
  chrome.tabs.sendMessage(tab.id, {
    name: "show-dialog"
  });
};

if (chrome.action != undefined) {
  chrome.action.onClicked.addListener(handleClick);
} else {
  chrome.browserAction.onClicked.addListener(handleClick);
}
*/