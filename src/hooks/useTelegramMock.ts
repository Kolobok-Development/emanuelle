import { isTMA, mockTelegramEnv  } from "@telegram-apps/sdk-react"
import { useClientOnce } from "./useClientOnce"
import { useState } from "react"

export function useTelegramMock(): boolean {
    const [envReady, setEnvReady] = useState(false)
    useClientOnce(() => {
      const MOCK_KEY = '____mocked'

      if (process.env.NODE_ENV !== 'development') {
        setEnvReady(true)
        return
      }

      isTMA('complete')
        .then((isTelegram) => {
          const shouldMock = isTelegram ? !!sessionStorage.getItem(MOCK_KEY) : true
          if (!shouldMock) {
            setEnvReady(true)
            return
          }

          const initDataRaw = new URLSearchParams([
            [
              'user',
              JSON.stringify({
                id: 99281932,
                first_name: 'Arthur',
                last_name: 'Mocked',
                username: 'arthurmocked',
                language_code: 'en',
                is_premium: true,
                allows_write_to_pm: true,
                photoUrl:
                  'https://t.me/i/userpic/320/haNXSpRmeucJyo-oXFbNrifxZ-Au0PjvhpJ2l6h4ozcTbTT8yvNKIZABSCLpjtIp.svg',
              }),
            ],
            ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
            ['auth_date', '1716922846'],
            ['start_param', 'debug'],
            ['chat_type', 'sender'],
            ['chat_instance', '8428209589180549439'],
          ]).toString()

          mockTelegramEnv({
            launchParams:
              "tgWebAppData=user%3D%257B%2522id%2522%253A279058397%252C%2522first_name%2522%253A%2522Vladislav%2522%252C%2522last_name%2522%253A%2522Kibenko%2522%252C%2522username%2522%253A%2522vdkfrost%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522is_premium%2522%253Atrue%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%2522%257D%26chat_instance%3D-9019086117643313246%26chat_type%3Dsender%26auth_date%3D1736409902%26signature%3DFNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA%26hash%3D4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90&tgWebAppVersion=8.0&tgWebAppPlatform=tdesktop&tgWebAppThemeParams=%7B%22accent_text_color%22%3A%22%236ab3f2%22%2C%22bg_color%22%3A%22%2317212b%22%2C%22bottom_bar_bg_color%22%3A%22%2317212b%22%2C%22button_color%22%3A%22%235289c1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22destructive_text_color%22%3A%22%23ec3942%22%2C%22header_bg_color%22%3A%22%2317212b%22%2C%22hint_color%22%3A%22%23708599%22%2C%22link_color%22%3A%22%236ab3f3%22%2C%22secondary_bg_color%22%3A%22%23232e3c%22%2C%22section_bg_color%22%3A%22%2317212b%22%2C%22section_header_text_color%22%3A%22%236ab3f3%22%2C%22section_separator_color%22%3A%22%23111921%22%2C%22subtitle_text_color%22%3A%22%23708599%22%2C%22text_color%22%3A%22%23f5f5f5%22%7D",
          })

          sessionStorage.setItem(MOCK_KEY, '1')
          setEnvReady(true)
        })
        .catch(() => {
          setEnvReady(true)
        })
    })
    return envReady
   }