import { Loader2 } from "lucide-react"
import React from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { Button } from "~components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "~components/ui/card"

import "~style.css"

import useSWR from "swr"

import { Badge } from "~components/ui/badge"
import {
  cn,
  OpenPaymentChoosePageMessage,
  type MessageRes,
  type SubscriptionInfo
} from "~lib/helper"

const subscriptionPlans = [
  {
    name: "Basic",
    price: "Free",
    planID: "Basic",
    features: {
      basic: [
        "Download images and videos from any channel and chats 3 times per day",
        "Free feature updates",
        "Human support"
      ],
      advance: []
    }
  },
  {
    name: "Monthly",
    price: "$9.99/monthly",
    planID:
      process.env.NODE_ENV === "production"
        ? "prod_e1a81ddf760c4f1e"
        : "prod_90d4aa08cec243c4",
    features: {
      basic: [
        "Download images and videos from any channel and chats",
        "Free feature updates"
      ],
      advance: ["With No Limit", "High priority human support"]
    }
  },
  {
    name: "Quarterly",
    price: "$19.99/quarterly",
    planID:
      process.env.NODE_ENV === "production"
        ? "prod_cc21a5daa74d4ee0"
        : "prod_ea185d63f0074258",
    features: {
      basic: [
        "Download images and videos from any channel and chats",
        "Free feature updates"
      ],
      advance: ["With No Limit", "High priority human support"]
    }
  },
  {
    name: "Lifetime",
    price: "$99.99/Lifetime",
    planID:
      process.env.NODE_ENV === "production"
        ? "prod_06095792323d4f62"
        : "prod_ffde3e5ca6314c79",
    features: {
      basic: [
        "Download images and videos from any channel and chats",
        "Free feature updates"
      ],
      advance: ["With No Limit", "High priority human support"]
    }
  }
]

const SubscriptionPage: React.FC = () => {
  const { data, error, isLoading } = useSWR("getValidSubscription", (name) =>
    sendToBackground<void, MessageRes<Array<SubscriptionInfo>>>({
      name
    })
  )

  const currentPlanID =
    (!error &&
      !isLoading &&
      data.code === 1 &&
      data.data.length > 0 &&
      data.data[0].prod_code) ||
    "Basic"

  const openPaymentChoosePage = async (planID: string) => {
    try {
      await sendToBackground({
        name: "openPaymentChoosePage",
        body: new OpenPaymentChoosePageMessage(planID, "usd")
      })
    } catch (error) {
      console.error(error)
      //TODO notification
    }
  }

  return (
    <div className="container h-screen flex flex-col mx-auto px-4 py-8 pt-52">
      <h1 className="text-4xl font-semibold mb-12 text-center">
        Subscription Plans
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subscriptionPlans.map((plan) => (
          <Card
            key={plan.planID}
            className={cn(
              " flex flex-col",
              plan.planID === "prod_ea185d63f0074258" ? " border-primary" : ""
            )}>
            <CardHeader className=" flex-grow-0">
              {plan.name === "Quarterly" ? (
                <CardTitle>
                  {plan.name}
                  <Badge variant="secondary">Recommend</Badge>
                </CardTitle>
              ) : (
                <CardTitle>{plan.name}</CardTitle>
              )}
              <CardDescription>{plan.price}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {plan.features.basic.map((feature, index) => (
                <div
                  key={index}
                  className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {feature}
                    </p>
                  </div>
                </div>
              ))}
              {plan.features.advance.map((feature, index) => (
                <div
                  key={index}
                  className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <p className=" text-base font-medium leading-none">
                      {`PLUS: ${feature}`}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-center flex-grow-0">
              {isLoading ? (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : plan.planID === currentPlanID ? (
                <Button disabled className="w-full">
                  Your plan
                </Button>
              ) : plan.name === "Basic" ? (
                <Button variant="outline" className="w-full">
                  Free
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => openPaymentChoosePage(plan.planID)}>
                  Subscribe
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SubscriptionPage
