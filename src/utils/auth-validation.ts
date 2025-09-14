import { ValidatedData, ValidationResult, TelegramUser } from '@/types/auth'
import crypto from 'crypto'



export function validateTelegramWebAppData(telegramInitData: string): ValidationResult {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_KEY

    console.log('HERE !!!!');
  
    let validatedData: ValidatedData | null = null
    let user: TelegramUser | null = null
    let message = ''
  
    if (!BOT_TOKEN) {
      return { message: 'BOT_TOKEN is not set', validatedData: null, user: null }
    }
  
    const initData = new URLSearchParams(telegramInitData)
    const hash = initData.get('hash')
  
    if (!hash) {
      return { message: 'Hash is missing from initData', validatedData: null, user: null }
    }
  
    initData.delete('hash')
  
    const authDate = initData.get('auth_date')
    
    if (!authDate) {
      return { message: 'auth_date is missing from initData', validatedData: null, user: null}
    }
  
    const authTimestamp = parseInt(authDate, 10)
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const timeDifference = currentTimestamp - authTimestamp
    const fiveMinutesInSeconds = 5 * 60
  
    if (timeDifference > fiveMinutesInSeconds) {
      return { message: 'Telegram data is older than 5 minutes', validatedData: null, user: null }
    }
  
    const dataCheckString = Array.from(initData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
  
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest()
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  
    if (calculatedHash === hash) {
      validatedData = Object.fromEntries(initData.entries())
      message = 'Validation successful'
      const userString = validatedData['user']
      if (userString) {
        try {
          // user field can be URL-encoded JSON string
          const decoded = decodeURIComponent(userString)
          user = JSON.parse(decoded)
        } catch (error) {
          console.error('Error parsing user data:', error)
          message = 'Error parsing user data'
          validatedData = null
        }
      } else {
        message = 'User data is missing'
        validatedData = null
      }
    } else {
      message = 'Hash validation failed'
    }
  
    return { validatedData, user, message }
  }