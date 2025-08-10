import { useEffect, useRef } from 'react'
import { setTyping, subscribeTyping } from '@/lib/firestore'
import type { TypingState } from '@/types'

/**
 * useTyping
 * - Đặt trạng thái đang gõ với debounce 2s
 */
export const useTyping = (roomId: string, userId?: string) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startTyping = async () => {
    if (!userId) return
    await setTyping(roomId, userId, true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setTyping(roomId, userId, false), 2000)
  }

  return { startTyping }
}

export const useTypingSubscribers = (roomId: string, onChange: (states: TypingState[]) => void) => {
  useEffect(() => {
    const unsub = subscribeTyping(roomId, onChange)
    return () => unsub()
  }, [roomId, onChange])
}
