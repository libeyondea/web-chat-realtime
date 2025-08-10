import { useAuthContext } from '@/context/AuthContext'
import { ChatLayout } from '@/components/Layout/ChatLayout'
import { ChatWindow } from '@/components/chat/ChatWindow'
import Link from 'next/link'

/**
 * Trang chủ
 * - Nếu chưa đăng nhập: hiển thị CTA Login/Register
 * - Nếu đã đăng nhập: hiển thị giao diện chat
 */
export default function HomePage() {
  const { user, loading } = useAuthContext()

  if (loading) return <div className="p-8">Loading...</div>

  if (!user)
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="card w-full max-w-md bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title">Welcome to WebChat</h2>
            <p>Please login or register to continue.</p>
            <div className="card-actions justify-end">
              <Link className="btn" href="/login">
                Login
              </Link>
              <Link className="btn btn-ghost" href="/register">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    )

  return (
    <ChatLayout>
      <ChatWindow />
    </ChatLayout>
  )
}
