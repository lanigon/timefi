'use client'
import { DynamicEmbeddedWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAccount } from "wagmi";
import { useTelegramLogin } from "@dynamic-labs/sdk-react-core";
import { useEffect } from "react";

export default function Dynamic() {
  const { telegramSignIn, isAuthWithTelegram } = useTelegramLogin();
  const { sdkHasLoaded, user } = useDynamicContext();
  useEffect(() => {
    if (!sdkHasLoaded) {
      return;
    }

    const signIn = async () => {
      if (!user) {
        await telegramSignIn({ forceCreateUser: true });
      }
      
    };

    signIn();
    }, [sdkHasLoaded, user]);
    
  const checkTelegramConnection = async () => {
    const isLinkedWithTelegram = await isAuthWithTelegram();
  
    if (isLinkedWithTelegram) {
      // Auto login if Telegram is connected
      console.log("good")
      await telegramSignIn();
    } else {
      // Show modal splash page
    }
  };
  
  return(
    <div className="w-full max-w-md">
    <DynamicEmbeddedWidget
      background="with-border" />
    </div>
  )
}