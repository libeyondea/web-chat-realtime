import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { upsertUserProfile } from '@/lib/firestore'
import { isMock } from '@/lib/firebase'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * AuthProvider
 * - Quản lý trạng thái xác thực Firebase và cung cấp các hành động đăng nhập/đăng xuất
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMock) {
      // Provide a mock user for local/demo without Firebase
      const fake = {
        uid: 'mock-user',
        displayName: 'Mock User',
        email: 'mock@example.com',
        photoURL: undefined,
      } as unknown as User
      setUser(fake)
      setLoading(false)
      void upsertUserProfile({
        uid: fake.uid,
        displayName: fake.displayName || 'Mock User',
        email: fake.email || 'mock@example.com',
        photoURL: undefined,
        createdAt: Date.now(),
        lastActive: Date.now(),
      })
      return
    }
    const unsub = onAuthStateChanged(auth!, async (u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        await upsertUserProfile({
          uid: u.uid,
          displayName: u.displayName || u.email?.split('@')[0] || 'User',
          email: u.email || '',
          photoURL: u.photoURL || undefined,
          createdAt: Date.now(),
          lastActive: Date.now(),
        })
      }
    })
    return () => unsub()
  }, [])

  // Update presence periodically
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      import('@/lib/firestore').then((m) => m.updateLastActive(user.uid))
    }, 30_000)
    return () => clearInterval(interval)
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithGoogle: async () => {
        if (isMock) return
        await signInWithPopup(auth!, googleProvider)
      },
      signInWithEmail: async (email: string, password: string) => {
        if (isMock) return
        await signInWithEmailAndPassword(auth!, email, password)
      },
      signUpWithEmail: async (email: string, password: string, displayName: string) => {
        if (isMock) return
        const cred = await createUserWithEmailAndPassword(auth!, email, password)
        if (cred.user) {
          await updateProfile(cred.user, { displayName })
        }
      },
      logout: async () => {
        if (isMock) return
        await signOut(auth!)
      },
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
