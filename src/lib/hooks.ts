import { useEffect, useState } from "react";
import { BASIC_SIZE_LIMIT, Message, fetchInBatches, getAuthorization, getFetchDetails, getRemainDownloadCount } from "./helper";

interface IPartialFetchOption{
    autoRetry?:boolean,
    progress?:(percentage:number) => void,
    check?:(size:number) => Promise<boolean>
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
            progress: () => {},
            check:undefined
        }) => {

        const {autoRetry,progress,check} = options;


        try {
            setIsLoading(true);
            setHasTried(true);

            if(url.startsWith('blob:')){
                setError(false)
                return url;
            }

            const {segmentCount,segmentSize,contentSize,contentType} = await getFetchDetails(url);

            if(check){
                const checkResult = await check(contentSize)
                if(!checkResult){
                    return '';
                }
            }
        
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
        
            const blob = new Blob(bufferArray,{
                type:contentType || 'application/octet-stream'
            })
            setError(false);

            
        
            // Create a URL representing the Blob
            return URL.createObjectURL(blob)
        } catch (error) {
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
        partialFetch,
        setError,
    }

}



export function useUserPlan(){

    const imageCheck = async () => {
        const {remainCount,reason} = await getRemainDownloadCount();
        if(remainCount <= 0 ){
            if (reason === "Not Login") {
                window.postMessage(new Message("OpenLoginPage"), "*")
                return false
              }
              if (reason === "Online Count Limit") {
                window.postMessage(new Message('OpenLoginPage'),'*')
                // notification
                return false
              }
              if( reason === 'No Valid Subscription'){
                window.postMessage(new Message('OpenSubscriptionPage'),'*')
                return false;
              }
        } 
        return true;

    }

    const videoCheck = async (size) => {
        const {remainCount,reason} = await getRemainDownloadCount();
        if(remainCount <= 0 ){
            if (reason === "Not Login") {
                window.postMessage(new Message("OpenLoginPage"), "*")
                return false
              }
              if (reason === "Online Count Limit") {
                window.postMessage(new Message('OpenLoginPage'),'*')
                // notification
                return false
              }
              if( reason === 'No Valid Subscription'){
                window.postMessage(new Message('OpenSubscriptionPage'),'*')
                return false;
              }
        } 
        return true;
    }

    const audioCheck = async () => {
        const {remainCount,reason} = await getRemainDownloadCount();
        if(remainCount <= 0 ){
            if (reason === "Not Login") {
                window.postMessage(new Message("OpenLoginPage"), "*")
                return false
              }
              if (reason === "Online Count Limit") {
                window.postMessage(new Message('OpenLoginPage'),'*')
                // notification
                return false
              }
              if( reason === 'No Valid Subscription'){
                window.postMessage(new Message('OpenSubscriptionPage'),'*')
                return false;
              }
        } 
        return true;
    }


    return {
        videoCheck,
        audioCheck,
        imageCheck,
    }
}