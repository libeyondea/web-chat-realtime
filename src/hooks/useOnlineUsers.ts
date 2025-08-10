import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db, isMock } from '@/lib/firebase'
import type { UserProfile } from '@/types'

const ONLINE_WINDOW_MS = 60 * 1000

/**
 * useOnlineUsers
 * - Lắng nghe danh sách users và tính trạng thái online theo lastActive
 */
export const useOnlineUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    if (isMock || !db) {
      // Provide empty/mock list in mock mode
      setUsers([
        {
          uid: 'mock-user',
          displayName: 'Mock User',
          email: 'mock@example.com',
          photoURL: undefined,
          createdAt: Date.now(),
          lastActive: Date.now(),
        },
      ])
      return
    }
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const items = snap.docs.map((d) => d.data() as unknown as UserProfile)
      setUsers(
        items
          .map((u) => ({ ...u, lastActive: u.lastActive }))
          .sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0))
      )
    })
    return () => unsub()
  }, [])

  const onlineUserIds = new Set(
    users.filter((u) => nowMinus(users, ONLINE_WINDOW_MS).has(u.uid)).map((u) => u.uid)
  )

  return { users, onlineUserIds }
}

function nowMinus(users: UserProfile[], windowMs: number): Set<string> {
  const now = Date.now()
  return new Set(users.filter((u) => now - (u.lastActive || 0) < windowMs).map((u) => u.uid))
}
