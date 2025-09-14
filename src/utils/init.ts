import {
  backButton,
  expandViewport,
  init as initSDK,
  initData,
  miniApp,
  swipeBehavior,
  themeParams,
  viewport,
 } from '@telegram-apps/sdk-react'
 import { setDebug } from '@telegram-apps/bridge';
  

  export function telegramSDKInit(debug: boolean): void  {

    setDebug(debug)

    initSDK()
    expandViewport()

    if (backButton.isSupported()) {
      backButton.mount()
    }

    swipeBehavior.mount()
    initData.restore()

    void viewport
      .mount()
      .then(() => {
        viewport.bindCssVars()
        miniApp.bindCssVars()
        themeParams.bindCssVars()
        viewport.requestFullscreen()
        swipeBehavior.disableVertical()
   })
   .catch((e: unknown) => {
     console.error('Something went wrong mounting the viewport', e)
   })

  }