import { useEffect } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "~/components/ui/accordion"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { Button } from "~components/ui/button"
import {
  BADGE_COUNT,
  DownloadFailMessage,
  DownloadInProgressMessage,
  DownloadSuccessMessage,
  FAIL_TASKS,
  IN_PROGRESS_TASKS,
  Message,
  storage,
  SUCCESS_TASKS
} from "~lib/helper"

import "~style.css"

import { sendToBackground } from "@plasmohq/messaging"

function IndexPopUp() {
  const [inProgressTasks] = useStorage<Array<DownloadInProgressMessage>>(
    {
      key: IN_PROGRESS_TASKS,
      instance: storage
    },
    (v) => (v === undefined ? [] : v)
  )

  const [successTasks] = useStorage<Array<DownloadSuccessMessage>>(
    {
      key: SUCCESS_TASKS,
      instance: storage
    },
    (v) => (v === undefined ? [] : v)
  )

  const [failTasks] = useStorage<Array<DownloadFailMessage>>(
    { key: FAIL_TASKS, instance: storage },
    (v) => (v === undefined ? [] : v)
  )

  useEffect(() => {
    sendToBackground({
      name: "badge",
      body: new Message("ResetBadge")
    })
  }, [])

  const openFeedBackWindow = () => {
    window.open("https://t.me/+pHaZ8oHR-rZiZDI1")
  }
  return (
    <div className=" px-1 py-1 flex flex-col w-80">
      <Accordion type="multiple" defaultValue={["downloading"]}>
        <AccordionItem value="downloading">
          <AccordionTrigger>
            <span className=" text-lg">
              Downloading({inProgressTasks.length}):
            </span>
          </AccordionTrigger>
          {inProgressTasks.map((task) => (
            <AccordionContent key={task.url}>
              <div className=" w-full h-8 flex flex-col justify-center ">
                <div className=" flex">
                  <span className=" w-3/4 flex-grow-0 flex-shrink overflow-hidden whitespace-nowrap text-ellipsis">
                    {task.name}
                  </span>
                  <Badge variant="outline">{task.contentType}</Badge>
                </div>
                <Progress value={task.progress * 100}></Progress>
              </div>
            </AccordionContent>
          ))}
        </AccordionItem>
        <AccordionItem value="fail">
          <AccordionTrigger>
            <span className=" text-lg">Fail({failTasks.length}):</span>
          </AccordionTrigger>
          {failTasks.map((task) => (
            <AccordionContent key={task.url}>
              <div className=" w-full h-8 flex flex-col justify-center ">
                <div className=" flex">
                  <span className=" w-3/4 flex-grow-0 flex-shrink overflow-hidden whitespace-nowrap text-ellipsis">
                    {task.name}
                  </span>
                  <Badge variant="outline">{task.contentType}</Badge>
                </div>
              </div>
            </AccordionContent>
          ))}
        </AccordionItem>
        <AccordionItem value="success">
          <AccordionTrigger>
            <span className=" text-lg">Success({successTasks.length}):</span>
          </AccordionTrigger>
          {successTasks.map((task) => (
            <AccordionContent key={task.url}>
              <div className=" w-full h-8 flex flex-col justify-center ">
                <div className=" flex">
                  <span className=" w-3/4 flex-grow-0 flex-shrink overflow-hidden whitespace-nowrap text-ellipsis">
                    {task.name}
                  </span>
                  <Badge variant="outline">{task.contentType}</Badge>
                </div>
              </div>
            </AccordionContent>
          ))}
        </AccordionItem>
      </Accordion>

      <Button onClick={openFeedBackWindow}>Feedback</Button>
    </div>
  )
}

export default IndexPopUp
