import { useState } from "react";
import { concatenateArrayBuffers, fetchInBatches, getFetchDetails } from "./helper";

interface IPartialFetchOption{
    autoRetry?:boolean,
    progress?:(percentage:number) => void
}

// max request once , total size is 20 * 1MB
const MAX_FETCH_BATCH = 20


export function usePartialFetch(){
    const [isLoading,setIsLoading] = useState(false);
    const [hasTried, setHasTried] = useState(false);
    const [error,setError] = useState(null);
    const [percentage,setPercentage] = useState(0);


    const partialFetch = async (
        url:string,
        options:IPartialFetchOption = {
            autoRetry:true,
            progress: () => {}
        }) => {

        const {autoRetry,progress} = options;


        try {
            setIsLoading(true);
            setHasTried(true);

            const {segmentCount,segmentSize,contentSize,contentType} = await getFetchDetails(url);
        
            const fetchPromises = new Array(segmentCount)
                .fill(0)
                .map((value, index) => index * segmentSize)
                .map((startByte,index) => {
                const endByte = Math.min(startByte + segmentSize - 1, contentSize - 1)
        
                const headers: HeadersInit = {
                    Range: `bytes=${startByte}-${endByte}`
                }
    
                return () => fetch(url, {
                    headers
                }).then(res => {
                    if(res.status === 408){
                        throw new Error('Flood Error',{
                            cause:{
                                range:`bytes=${startByte}-${endByte}`,
                                index,
                                response:res
                            }
                        })
                    }
                    setPercentage((prev) => {
                        const newProgress = prev +  1/segmentCount
                        progress(newProgress)
                        return newProgress
                    })
                    return res.arrayBuffer()
                })
                })
            const bufferArray = await fetchInBatches(fetchPromises,MAX_FETCH_BATCH,autoRetry)
        
            const buffer = concatenateArrayBuffers(bufferArray)
        
            // Create a Blob from the ArrayBuffer
            const blob = new Blob([buffer], { type: contentType })
        
            // Create a URL representing the Blob
            return URL.createObjectURL(blob)
        } catch (error) {
            console.log("🚀 ~ partialFetch ~ error:", error)
            setError(error)
            throw error
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