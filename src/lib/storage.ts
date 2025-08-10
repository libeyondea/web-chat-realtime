import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'

export const uploadFile = async (path: string, file: File | Blob): Promise<string> => {
  const fileRef = ref(storage, path)
  const res = await uploadBytes(fileRef, file)
  return await getDownloadURL(res.ref)
}
