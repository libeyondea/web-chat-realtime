import { useAuthContext } from '@/context/AuthContext'
import { uploadFile } from '@/lib/storage'
import { upsertUserProfile } from '@/lib/firestore'
import Image from 'next/image'
import { useState } from 'react'

/**
 * Trang hồ sơ
 * - Upload avatar lên Firebase Storage
 */
export default function ProfilePage() {
  const { user } = useAuthContext()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  if (!user) return <div className="p-8">Please login</div>

  const onUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      const url = await uploadFile(`avatars/${user.uid}.jpg`, file)
      await upsertUserProfile({
        uid: user.uid,
        displayName: user.displayName || user.email || 'User',
        email: user.email || '',
        photoURL: url,
        createdAt: Date.now(),
        lastActive: Date.now(),
      })
    } finally {
      setLoading(false)
      setFile(null)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="flex items-center gap-4">
        {user.photoURL && (
          <Image src={user.photoURL} alt="avatar" width={64} height={64} className="rounded-full" />
        )}
        <div>
          <div className="font-semibold">{user.displayName || user.email}</div>
          <div className="text-sm opacity-70">{user.email}</div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          className="file-input file-input-bordered"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button className="btn btn-primary" onClick={onUpload} disabled={!file || loading}>
          {loading ? 'Uploading...' : 'Upload avatar'}
        </button>
      </div>
    </div>
  )
}
