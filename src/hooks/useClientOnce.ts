'use client'
import { useEffect, useRef, useState } from "react"

export function useClientOnce(callback: () => void, dependency?: boolean): void {
    const [isClient, setIsClient] = useState(false)
    const hasRun = useRef(false)

    useEffect(() => {
        if ( typeof window !== 'undefined'){
          setIsClient(true)
        }
    }, [])
  
    useEffect(() => {
      // Проверяем, что мы на клиенте и функция еще не выполнялась
      // Если dependency передан, ждем пока он станет true
      if (isClient && !hasRun.current && (dependency === undefined || dependency)) {
        hasRun.current = true
        callback()
      }
    }, [callback, isClient, dependency])
  }