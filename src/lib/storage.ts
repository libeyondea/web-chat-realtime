import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage, isMock } from './firebase'

export const uploadFile = async (path: string, file: File | Blob): Promise<string> => {
  if (isMock) {
    // return a fake blob URL for preview in mock mode
    if (file instanceof File) return URL.createObjectURL(file)
    return `data:application/octet-stream;base64,` // minimal placeholder
  }
  const fileRef = ref(storage!, path)
  const res = await uploadBytes(fileRef, file)
  return await getDownloadURL(res.ref)
}
