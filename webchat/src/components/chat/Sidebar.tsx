import Link from 'next/link'
import { useRooms } from '@/hooks/useRooms'
import { useOnlineUsers } from '@/hooks/useOnlineUsers'
import { useAuthContext } from '@/context/AuthContext'

/**
 * Sidebar
 * - Danh sách phòng và người dùng online
 */
export const Sidebar = () => {
  const { data: rooms } = useRooms()
  const { users, onlineUserIds } = useOnlineUsers()
  const { logout } = useAuthContext()

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <span className="font-bold text-lg">Rooms</span>
        <button className="btn btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="p-2 overflow-y-auto flex-1">
        <ul className="menu menu-lg">
          {(rooms || []).map((r) => (
            <li key={r.id}>
              <Link href={`/?room=${r.id}`}>{r.name}</Link>
            </li>
          ))}
        </ul>
        <div className="divider">Online</div>
        <ul className="menu">
          {users.map((u) => (
            <li key={u.uid}>
              <span className="flex items-center gap-2">
                <span
                  className={`badge badge-xs ${onlineUserIds.has(u.uid) ? 'badge-success' : 'badge-ghost'}`}
                ></span>
                {u.displayName}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
