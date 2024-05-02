export async function noop(ms:number) {
    return new Promise((res,rej) => {
        setTimeout(() => {
            res(null);
        }, ms);
    })
}


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


export function waitForElement(selector:string) {
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


export async function fetchInBatches<T>(promises: Array<() => Promise<T>>, maxCount: number,autoRetry:boolean) {
    const results: T[] = [];
    let currentIndex = 0;
    
    while (currentIndex < promises.length) {
        const currentBatch = promises.slice(currentIndex, currentIndex + maxCount).map(partialFetch => partialFetch());
        try {
            const responses = await Promise.all(currentBatch);
            results.push(...responses)
            currentIndex += maxCount;
        } catch (error) {
            if(error instanceof Error){
                if(autoRetry && error.message === 'Flood Error'){
                    const {index} = error.cause as {index:number}
                    currentIndex = index;
                    noop(1000)
                }

            }
            else{
                throw error
            }
        }
    }

    return results;
}


export async function fetchBeginWith(range:string,) {
    
}


export async function getFetchDetails(url:string){
    const requestHeaders: HeadersInit = {
        Range: `bytes=0-`
    }
    const response = await fetch(url, {
        headers: requestHeaders
    })

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const contentSize = parseInt(
        response.headers.get("Content-Range").split("/")[1],
        10
    )

    const segmentSize = parseInt(response.headers.get("Content-Length"), 10)
    const contentType = response.headers.get("Content-Type")


    // Check if the server supports partial content
    const acceptRanges = response.headers.get("Accept-Ranges")
    if (acceptRanges !== "bytes") {
        throw new Error("Server does not support partial content (byte ranges)");
    }

    const segmentCount = Math.ceil(contentSize / segmentSize)


    return {
        contentType,segmentCount,contentSize,segmentSize
    }
}