import type { UnlistenFn } from '@tauri-apps/api/event'

export type ContainerId = string

export enum Container {
  Tor = 'tor',
  BaseNode = 'base_node',
  Wallet = 'wallet',
  SHA3Miner = 'sha3_miner',
  MMProxy = 'mm_proxy',
  XMrig = 'xmrig',
  Monerod = 'monerod',
  Frontail = 'frontail',
}

export enum SystemEventAction {
  Destroy = 'destroy',
  Create = 'create',
  Start = 'start',
  Die = 'die',
}

export type ServiceDescriptor = {
  id: ContainerId
  logEventsName: string
  statsEventsName: string
  name: string
}

export type ContainerStatus = {
  status: SystemEventAction
  timestamp: number
  type?: Container
  error?: string
  stats: {
    cpu: number
    memory: number
    unsubscribe: UnlistenFn
  }
}

export type ContainerStatusDto = {
  id: ContainerId
  running: boolean
  pending: boolean
  stats: {
    cpu: number
    memory: number
    unsubscribe: UnlistenFn
  }
}

export type ServicesState = {
  pending: Array<Container | ContainerId>
  containers: Record<ContainerId, ContainerStatus>
}

export interface StatsEventPayload {
  precpu_stats: {
    cpu_usage: {
      total_usage: number
    }
    system_cpu_usage: number
  }
  cpu_stats: {
    cpu_usage: {
      total_usage: number
    }
    system_cpu_usage: number
    online_cpus: number
  }
  memory_stats: {
    usage: number
    stats: {
      cache?: number
    }
  }
}
