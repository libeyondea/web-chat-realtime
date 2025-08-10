import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
  Timestamp,
  type Unsubscribe,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { Message, Room, TypingState, UserProfile } from '@/types'
import { db } from './firebase'

export const usersCol = collection(db, 'users')
export const roomsCol = collection(db, 'rooms')

/** Lấy hồ sơ người dùng theo UID */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const ref = doc(usersCol, uid)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as unknown as UserProfile) : null
}

/** Tạo/cập nhật hồ sơ người dùng */
export const upsertUserProfile = async (profile: UserProfile): Promise<void> => {
  const ref = doc(usersCol, profile.uid)
  await setDoc(ref, { ...profile }, { merge: true })
}

/** Tạo phòng chat mới */
export const createRoom = async (name: string, createdBy: string): Promise<string> => {
  const ref = await addDoc(roomsCol, {
    name,
    createdBy,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

const toMillis = (value: unknown): number => {
  if (!value) return Date.now()
  if (typeof value === 'number') return value
  if (value instanceof Timestamp) return value.toMillis()
  // @ts-expect-error dynamic check for Timestamp-like
  if (typeof value.toMillis === 'function') return value.toMillis()
  return Date.now()
}

const mapRoom = (d: QueryDocumentSnapshot<DocumentData>): Room => {
  const data = d.data()
  return {
    id: d.id,
    name: String(data.name ?? 'Room'),
    createdBy: String(data.createdBy ?? ''),
    createdAt: toMillis(data.createdAt),
  }
}

/** Liệt kê tất cả phòng chat */
export const listRooms = async (): Promise<Room[]> => {
  const qs = await getDocs(query(roomsCol, orderBy('createdAt', 'asc')))
  return qs.docs.map((d) => mapRoom(d))
}

export const messagesCol = (roomId: string) => collection(db, `rooms/${roomId}/messages`)
export const typingCol = (roomId: string) => collection(db, `rooms/${roomId}/typing`)

export type MessagesPage = {
  docs: QueryDocumentSnapshot<DocumentData>[]
  lastVisible: QueryDocumentSnapshot<DocumentData> | null
  items: Message[]
}

const mapMessage = (d: QueryDocumentSnapshot<DocumentData>): Message => {
  const data = d.data()
  return {
    id: d.id,
    roomId: String(data.roomId ?? ''),
    userId: String(data.userId ?? ''),
    text: data.text ? String(data.text) : undefined,
    imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
    createdAt: toMillis(data.createdAt),
  }
}

/** Tải một trang tin nhắn theo thứ tự mới nhất trước */
export const fetchMessagesPage = async (
  roomId: string,
  pageSize: number,
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<MessagesPage> => {
  const base = query(messagesCol(roomId), orderBy('createdAt', 'desc'), limit(pageSize))
  const q = cursor ? query(base, startAfter(cursor)) : base
  const qs = await getDocs(q)
  const items = qs.docs.map((d) => mapMessage(d))
  const lastVisible = qs.docs.length
    ? (qs.docs[qs.docs.length - 1] as QueryDocumentSnapshot<DocumentData>)
    : null
  return { docs: qs.docs, lastVisible, items }
}

/** Lắng nghe realtime các tin nhắn gần đây */
export const subscribeLatestMessages = (
  roomId: string,
  onChange: (messages: Message[]) => void,
  pageSize = 50
): Unsubscribe => {
  const qy = query(messagesCol(roomId), orderBy('createdAt', 'asc'), limit(pageSize))
  return onSnapshot(qy, (snap) => {
    const items = snap.docs.map((d) => mapMessage(d))
    onChange(items)
  })
}

/** Gửi tin nhắn văn bản */
export const sendTextMessage = async (
  roomId: string,
  userId: string,
  text: string
): Promise<void> => {
  await addDoc(messagesCol(roomId), {
    userId,
    text,
    createdAt: serverTimestamp(),
    roomId,
  })
}

/** Gửi tin nhắn ảnh (đã upload) */
export const sendImageMessage = async (
  roomId: string,
  userId: string,
  imageUrl: string
): Promise<void> => {
  await addDoc(messagesCol(roomId), {
    userId,
    imageUrl,
    createdAt: serverTimestamp(),
    roomId,
  })
}

/** Cập nhật trạng thái đang gõ của người dùng */
export const setTyping = async (
  roomId: string,
  userId: string,
  isTyping: boolean
): Promise<void> => {
  const ref = doc(typingCol(roomId), userId)
  await setDoc(
    ref,
    {
      userId,
      roomId,
      isTyping,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  )
}

const mapTyping = (d: QueryDocumentSnapshot<DocumentData>): TypingState => {
  const data = d.data()
  return {
    userId: String(data.userId ?? ''),
    roomId: String(data.roomId ?? ''),
    isTyping: Boolean(data.isTyping),
    updatedAt: toMillis(data.updatedAt),
  }
}

/** Lắng nghe danh sách người dùng đang gõ trong phòng */
export const subscribeTyping = (
  roomId: string,
  onChange: (states: TypingState[]) => void
): Unsubscribe => {
  const qy = query(typingCol(roomId), where('isTyping', '==', true))
  return onSnapshot(qy, (snap) => {
    const items = snap.docs.map((d) => mapTyping(d))
    onChange(items)
  })
}

/** Cập nhật thời điểm hoạt động gần nhất (presence) */
export const updateLastActive = async (uid: string): Promise<void> => {
  const ref = doc(usersCol, uid)
  await setDoc(
    ref,
    {
      lastActive: Date.now(),
    },
    { merge: true }
  )
}
