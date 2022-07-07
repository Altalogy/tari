import { Dictionary, ContainerName } from '../types/general'
import { SerializableContainerStats } from '../store/containers/types'
import { db } from './db'

export interface StatsEntry {
  timestamp: string
  network: string
  service: ContainerName
  cpu: number | null
  memory: number | null
  upload: number | null
  download: number | null
}

export interface StatsRepository {
  add: (
    network: string,
    container: ContainerName,
    secondTimestamp: string,
    stats: SerializableContainerStats,
  ) => Promise<void>
  getGroupedByContainer: (network: string, since: Date) => Promise<StatsEntry[]>
}

const repositoryFactory: () => StatsRepository = () => {
  return {
    add: async (network, container, secondTimestamp, stats) => {
      console.time('insert')
      await db.execute(
        `INSERT INTO stats(timestamp, network, service, cpu, memory, upload, download) VALUES($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT(timestamp, network, service)
           DO UPDATE SET
            "insertsPerTimestamp"="insertsPerTimestamp"+1,
            cpu=(cpu+$4)/("insertsPerTimestamp"+1),
            memory=(memory+$5)/("insertsPerTimestamp"+1),
            upload=(upload+$6)/("insertsPerTimestamp"+1),
            download=(download+$7)/("insertsPerTimestamp"+1)`,
        [
          secondTimestamp,
          network,
          container,
          stats.cpu,
          stats.memory,
          stats.network.upload,
          stats.network.download,
        ],
      )
      console.timeEnd('insert')
    },
    getGroupedByContainer: async (network, since) => {
      console.time('select')
      const results: StatsEntry[] = await db.select(
        'SELECT timestamp, service, cpu, memory, upload, download FROM stats WHERE network = $1 AND "timestamp" > $2 ORDER BY "timestamp"',
        [network, since.toISOString()],
      )
      console.timeEnd('select')
      console.debug(`selected ${results.length}`)

      return results
    },
  }
}

export default repositoryFactory
