import { useState } from "react";
import { concatenateArrayBuffers } from "./helper";

export function usePartialFetch(){
    const [isLoading,setIsLoading] = useState(false);
    const [hasTried, setHasTried] = useState(false);
    const [error,setError] = useState(null);
    const [percentage,setPercentage] = useState(0);



    const partialFetch = async (url:string) => {
        try {
            setIsLoading(true);
            setHasTried(true);

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
        
            const fetchPromises = new Array(segmentCount)
                .fill(0)
                .map((value, index) => index * segmentSize)
                .map((startByte) => {
                const endByte = Math.min(startByte + segmentSize - 1, contentSize - 1)
        
                const headers: HeadersInit = {
                    Range: `bytes=${startByte}-${endByte}`
                }
        
                return fetch(url, {
                    headers
                }).then(res => {
                    setPercentage((prev) => prev +  1/segmentCount)
                    return res.arrayBuffer()
                })
                })
            const bufferArray = await Promise.all(fetchPromises)
        
            const buffer = concatenateArrayBuffers(bufferArray)
        
            // Create a Blob from the ArrayBuffer
            const blob = new Blob([buffer], { type: contentType })
        
            // Create a URL representing the Blob
            return URL.createObjectURL(blob)
        } catch (error) {
            setError(error)
        }
        finally{
            setIsLoading(false);
        }
    }


    return {
        isLoading,
        hasTried,
        error,
        percentage,
        partialFetch
    }

}