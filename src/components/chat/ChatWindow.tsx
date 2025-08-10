import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthContext } from '@/context/AuthContext'
import { useInfiniteMessages } from '@/hooks/useInfiniteMessages'
import { sendImageMessage, sendTextMessage } from '@/lib/firestore'
import { uploadFile } from '@/lib/storage'
import { useTyping, useTypingSubscribers } from '@/hooks/useTyping'
import type { TypingState } from '@/types'
import { formatDistanceToNow } from 'date-fns'

/**
 * ChatWindow
 * - Khung chat chính: danh sách tin nhắn, input, preview ảnh, typing indicator
 */
export const ChatWindow = () => {
  const { query } = useRouter()
  const roomId = (query.room as string) || 'general'
  const { user } = useAuthContext()
  const { messages, loadMore, hasMore } = useInfiniteMessages(roomId)
  const { startTyping } = useTyping(roomId, user?.uid)
  const [typingUsers, setTypingUsers] = useState<TypingState[]>([])
  const [image, setImage] = useState<File | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useTypingSubscribers(roomId, setTypingUsers)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages.length])

  const onSend = async (text: string) => {
    if (!user) return
    if (image) {
      const url = await uploadFile(`rooms/${roomId}/${user.uid}_${Date.now()}.jpg`, image)
      await sendImageMessage(roomId, user.uid, url)
      setImage(null)
    }
    if (text.trim()) {
      await sendTextMessage(roomId, user.uid, text.trim())
    }
  }

  const typingText = useMemo(() => {
    const others = typingUsers.filter((t) => t.userId !== user?.uid)
    if (!others.length) return ''
    return `${others.length === 1 ? 'Someone is' : 'People are'} typing...`
  }, [typingUsers, user?.uid])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Room: {roomId}</h2>
          {typingText && <div className="text-xs opacity-70">{typingText}</div>}
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        onScroll={(e) => {
          const el = e.currentTarget
          if (el.scrollTop === 0 && hasMore) {
            const prevHeight = el.scrollHeight
            loadMore().then(() => {
              requestAnimationFrame(() => {
                const newHeight = el.scrollHeight
                el.scrollTop = newHeight - prevHeight
              })
            })
          }
        }}
      >
        {messages.map((m) => (
          <div key={m.id} className={`chat ${m.userId === user?.uid ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-header text-xs opacity-60">
              <span>{m.userId === user?.uid ? 'You' : m.userId}</span>
              <time className="ml-2">
                {formatDistanceToNow(new Date(m.createdAt || Date.now()), { addSuffix: true })}
              </time>
            </div>
            {m.text && <div className="chat-bubble whitespace-pre-wrap">{m.text}</div>}
            {m.imageUrl && (
              <div className="chat-bubble p-0">
                <img src={m.imageUrl} alt="image" className="max-w-xs rounded" />
              </div>
            )}
          </div>
        ))}
      </div>

      <MessageInput
        onTyping={startTyping}
        onSend={onSend}
        onImageSelected={setImage}
        image={image}
        onClearImage={() => setImage(null)}
      />
    </div>
  )
}

const MessageInput = ({
  onSend,
  onTyping,
  onImageSelected,
  image,
  onClearImage,
}: {
  onSend: (text: string) => void | Promise<void>
  onTyping: () => void
  onImageSelected: (f: File | null) => void
  image: File | null
  onClearImage: () => void
}) => {
  const [text, setText] = useState('')
  return (
    <div className="p-3 border-t">
      {image && (
        <div className="mb-2 flex items-center gap-3">
          <img
            src={URL.createObjectURL(image)}
            alt="preview"
            className="w-20 h-20 object-cover rounded border"
          />
          <button className="btn btn-sm" onClick={onClearImage}>
            Remove
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          className="file-input file-input-bordered file-input-sm"
          accept="image/*"
          onChange={(e) => onImageSelected(e.target.files?.[0] || null)}
        />
        <input
          className="input input-bordered flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            onTyping()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend(text)
              setText('')
            }
          }}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            onSend(text)
            setText('')
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
