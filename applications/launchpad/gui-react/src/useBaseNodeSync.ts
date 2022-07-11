import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

export type SyncType = 'Header' | 'Block'

export type BaseNodeSyncProgress = {
  elapsed_time_sec: number
  max_estimated_time_sec: number
  min_estimated_time_sec: number
  starting_items_index: number
  sync_type: SyncType
  synced_items: number
  total_items: number
}

export type SyncProgress = {
  syncType?: SyncType
  progress?: number
  remainingTime?: number
  finished?: boolean
}

const wait = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let isAlreadyInvoked = false

/**
 * Listen to the Base Node sync progress
 */
export const useBaseNodeSync = (started: boolean) => {
  const [progress, setProgress] = useState<SyncProgress>({
    progress: undefined,
    remainingTime: undefined,
    syncType: undefined,
  })

  useEffect(() => {
    if (isAlreadyInvoked) {
      return
    }

    let unsubscribe

    const listenToEvents = async () => {
      await wait(2000)
      unsubscribe = await listen(
        'tari://onboarding_progress',
        async ({
          event: _,
          payload,
        }: {
          event: string
          payload: BaseNodeSyncProgress
        }) => {
          try {
            setProgress({
              progress: Math.round(
                (payload.synced_items / payload.total_items) * 100,
              ),
              remainingTime: Math.round(
                (payload.max_estimated_time_sec +
                  payload.min_estimated_time_sec) /
                  2,
              ),
              syncType: payload.sync_type,
              finished: payload.synced_items >= payload.total_items,
            })
          } catch (_) {
            setProgress({
              progress: undefined,
              remainingTime: undefined,
              syncType: undefined,
              finished: undefined,
            })
          }
        },
      )

      isAlreadyInvoked = true
    }

    if (started) {
      listenToEvents()

      invoke('base_node_sync_progress')
    }

    return unsubscribe
  }, [started])

  return progress
}
