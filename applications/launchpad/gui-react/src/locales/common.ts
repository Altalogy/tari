import { Container } from '../store/containers/types'

const translations: { [key: string]: { [key: string]: string } } = {
  verbs: {
    accept: 'Accept',
    cancel: 'Cancel',
    stop: 'Stop',
    start: 'Start',
    pause: 'Pause',
    continue: 'Continue',
    close: 'Close',
  },
  nouns: {
    expertView: 'Expert view',
    baseNode: 'Base Node',
    mining: 'Mining',
    problem: 'Problem',
    settings: 'Settings',
    wallet: 'Wallet',
    performance: 'Performance',
    containers: 'Containers',
    logs: 'Logs',
    cpu: 'CPU',
    memory: 'Memory',
    error: 'Error',
  },
  dayCapitals: {
    sunday: 'S',
    monday: 'M',
    tuesday: 'T',
    wednesday: 'W',
    thursday: 'T',
    friday: 'F',
    saturday: 'S',
  },
  adjectives: {
    running: 'Running',
    unhealthy: 'Unhealthy',
    paused: 'Paused',
    copied: 'Copied',
  },
  conjunctions: {
    or: 'or',
  },
  phrases: {
    actionRequired: 'Action required',
    startHere: 'Start here',
  },
  containers: {
    [Container.Tor]: 'Tor',
    [Container.BaseNode]: 'Base Node',
    [Container.Wallet]: 'Wallet',
    [Container.SHA3Miner]: 'SHA3 miner',
    [Container.MMProxy]: 'Merge miner proxy',
    [Container.XMrig]: 'xmrig',
    [Container.Monerod]: 'monerod',
    [Container.Frontail]: 'frontail',
  },
<<<<<<< HEAD
  miningType: {
    tari: 'Tari Mining',
    merged: 'Merged Mining',
  },
=======
>>>>>>> launchpad_such_wow
}

export default translations
