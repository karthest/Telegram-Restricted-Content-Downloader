import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Storage } from "@plasmohq/storage"

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

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function decodeKVersionURL(kurl:string){
    try {
        const messageInfo = kurl.startsWith('https://web.telegram.org/k/stream/') ? kurl.slice("https://web.telegram.org/k/stream/".length) : kurl.slice("stream/".length);
        const res = JSON.parse(decodeURIComponent(messageInfo)) as KVersionMediaInfo
        console.log("🚀 ~ decodeKVersionURL ~ res:", res)
        return res;
    } catch (error) {
        return {
            dcId:0,
            location:{
                "_":'',
                id:'',
                "access_hash":"",
                "file_reference":[],
                size:0,
                mimeType:"",
                fileName:""
            },
            fileName:'',
            size:0,
            mimeType:''
        } as KVersionMediaInfo
    }
}


export const storage = new Storage({
    area:'local'
});
export const IN_PROGRESS_TASKS = 'InProgress';
export const SUCCESS_TASKS = 'Success';
export const FAIL_TASKS = 'Fail';
export const BADGE_COUNT = "Badge";

export type KVersionMediaInfo = {
    dcId:number,
    location:{
        "_":string,
        id:string,
        "access_hash":string,
        "file_reference":Array<number>,
        size:number,
        mimeType:string,
        fileName:string
    }
    size:number,
    mimeType:string,
    fileName:string
}


export class Message{
    public source = 'TRCD'
    public type:'Success' | 'Inprogress' | 'Fail' | 'Flush' | 'IncrementBadge' | 'resetBadge'
    constructor(type:'Success' | 'Inprogress' | 'Fail' | 'Flush' | 'IncrementBadge' | 'resetBadge'){
        this.type = type
    }
}


export class DownloadSuccessMessage extends Message{
    public contentType:"IMAGE" | "AUDIO" |"VIDEO"
    public url:string
    public name:string

    constructor({
        contentType,
        url,
        name
    }:{
        contentType:"IMAGE" | "AUDIO" |"VIDEO"
        url:string
        name:string
    }){
        super('Success')
        this.contentType = contentType
        this.url = url
        this.name = name
    }
}

export class DownloadInProgressMessage extends Message{
    public contentType:"IMAGE" | "AUDIO" |"VIDEO"
    public progress:number
    public size:number | null // bytes
    public url:string
    public name:string

    constructor({
        contentType,
        progress,
        size, // bytes
        url,
        name
    }:{
        contentType:"IMAGE" | "AUDIO" |"VIDEO"
        progress:number
        size:number | null // bytes
        url:string
        name:string
    }){
        super('Inprogress')
        this.contentType = contentType
        this.progress = progress
        this.size = size
        this.url = url
        this.name = name
    }
}

export class DownloadFailMessage extends Message{
    public contentType:"IMAGE" | "AUDIO" |"VIDEO"
    public url:string
    public name:string

    constructor({
        contentType,
        url,
        name
    }:{
        contentType:"IMAGE" | "AUDIO" |"VIDEO"
        url:string
        name:string
    }){
        super('Fail')
        this.contentType = contentType
        this.url = url
        this.name = name
    }
}

