import { useAuthContext } from '@/context/AuthContext'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Trang đăng ký
 * - Tạo tài khoản bằng Email/Password và Display name
 */
export default function RegisterPage() {
  const { signUpWithEmail } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onRegister = async () => {
    setLoading(true)
    setError(null)
    try {
      await signUpWithEmail(email, password, displayName)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-8">
      <div className="card w-full max-w-md bg-base-200 shadow">
        <div className="card-body">
          <h2 className="card-title">Register</h2>
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <input
            className="input input-bordered w-full"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            className="input input-bordered w-full"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input input-bordered w-full"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary w-full" onClick={onRegister} disabled={loading}>
            {loading ? 'Loading...' : 'Create account'}
          </button>
          <div className="text-sm opacity-70">
            Already have an account?{' '}
            <Link className="link" href="/login">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
