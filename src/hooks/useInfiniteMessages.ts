import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchMessagesPage, subscribeLatestMessages, type MessagesPage } from '@/lib/firestore'
import type { Message } from '@/types'

const PAGE_SIZE = 30

/**
 * useInfiniteMessages
 * - Phân trang vô hạn tin nhắn theo phòng
 * - Tự động merge với realtime snapshot để luôn có bản mới
 */
export const useInfiniteMessages = (roomId: string) => {
  const [pages, setPages] = useState<MessagesPage[]>([])
  const [items, setItems] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const liveUnsub = useRef<null | (() => void)>(null)

  useEffect(() => {
    setPages([])
    setItems([])
    setHasMore(true)

    liveUnsub.current?.()
    liveUnsub.current = subscribeLatestMessages(
      roomId,
      (latest) => {
        setItems((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]))
          latest.forEach((m) => map.set(m.id, m))
          return Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt)
        })
      },
      PAGE_SIZE
    )

    return () => liveUnsub.current?.()
  }, [roomId])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const last = pages[pages.length - 1]?.lastVisible
    const page = await fetchMessagesPage(roomId, PAGE_SIZE, last ?? undefined)
    setPages((prev) => [...prev, page])
    setItems((prev) => {
      const merged = [...page.items, ...prev]
      const map = new Map(merged.map((m) => [m.id, m]))
      return Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt)
    })
    if (!page.items.length) setHasMore(false)
    setLoading(false)
  }, [roomId, pages, loading, hasMore])

  return { messages: items, loadMore, hasMore, loading }
}
