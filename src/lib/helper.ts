export function concatenateArrayBuffers(arrayBuffers:ArrayBuffer[]){
    // Calculate the total length of all array buffers
    const totalLength = arrayBuffers.reduce(
      (length, buffer) => length + buffer.byteLength,
      0
    )

    // Create a new Uint8Array with the total length
    const resultArray = new Uint8Array(totalLength)

    // Use the set method to concatenate the array buffers
    let offset = 0
    for (const buffer of arrayBuffers) {
      const sourceArray = new Uint8Array(buffer)
      resultArray.set(sourceArray, offset)
      offset += sourceArray.length
    }

    // Create a new ArrayBuffer from the concatenated Uint8Array
    const concatenatedBuffer = resultArray.buffer

    return concatenatedBuffer
}

export function downloadFile(url:string,fileName:string,fileType?:string){
    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = fileName
    downloadLink.click()
}


export function waitForElement(selector) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
  
      if (element) {
        resolve(element);
        return;
      }
  
      const observer = new MutationObserver(mutations => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
  
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }