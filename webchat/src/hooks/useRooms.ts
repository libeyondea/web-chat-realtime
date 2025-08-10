import { useQuery } from '@tanstack/react-query'
import { listRooms } from '@/lib/firestore'
import type { Room } from '@/types'

/**
 * useRooms
 * - Tải danh sách phòng bằng React Query
 */
export const useRooms = () => {
  return useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: () => listRooms(),
    staleTime: 1000 * 60,
  })
}
