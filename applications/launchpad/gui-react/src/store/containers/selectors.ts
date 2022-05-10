import { RootState } from '../'

import { ServiceStatus, Container, SystemEventAction } from './types'

export const selectState = (rootState: RootState) => rootState.containers

const selectContainerByType = (c: Container) => (r: RootState) => {
  const [containerId, containerStatus] =
    Object.entries(r.containers.containers).filter(
      ([, value]) => value.type === c,
    )[0] || []

  return { containerId, containerStatus }
}

type ContainerStatusSelector = (s: Container) => (r: RootState) => ServiceStatus
export const selectContainerStatus: ContainerStatusSelector =
  containerType => rootState => {
    const { containerId, containerStatus } =
      selectContainerByType(containerType)(rootState)

    const pending = rootState.containers.pending.includes(containerType)

    if (!containerId) {
      return {
        id: '',
        running: false,
        pending,
        stats: {
          cpu: 0,
          memory: 0,
          unsubscribe: () => undefined,
        },
      }
    }

    return {
      ...containerStatus,
      pending:
        pending ||
        (containerStatus.lastAction !== SystemEventAction.Start &&
          containerStatus.lastAction !== SystemEventAction.Destroy),
      running: true,
    }
  }

export const selectRunningContainers = (rootState: RootState): Container[] =>
  Object.entries(rootState.containers.containers)
    .map(([, containerStatus]) =>
      selectContainerStatus(containerStatus.type as Container)(rootState),
    )
    .filter(status => status.running)
    .map(status => rootState.containers.containers[status.id].type as Container)

export const selectContainersStatuses = (rootState: RootState) =>
  Object.values(Container).map(type => ({
    service: type,
    status: selectContainerStatus(type as Container)(rootState),
  }))
