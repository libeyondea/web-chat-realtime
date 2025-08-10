import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Sidebar } from '@/components/chat/Sidebar'
import { useAuthContext } from '@/context/AuthContext'
import Head from 'next/head'

export const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext()
  return (
    <div className="h-screen w-full">
      <Head>
        <title>WebChat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex h-full">
        {user && (
          <aside className="hidden md:block w-80 border-r bg-base-200">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
      <div className="fixed right-4 bottom-4 z-50">
        <ThemeToggle />
      </div>
    </div>
  )
}
