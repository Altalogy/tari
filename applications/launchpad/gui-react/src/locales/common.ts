import { Container } from '../store/containers/types'

const translations: { [key: string]: { [key: string]: string } } = {
  verbs: {
    accept: 'Accept',
    cancel: 'Cancel',
    tryAgain: 'Try again',
    stop: 'Stop',
    start: 'Start',
    save: 'Save',
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
    today: 'Today',
  },
  weekdayCapitals: {
    sunday: 'S',
    monday: 'M',
    tuesday: 'T',
    wednesday: 'W',
    thursday: 'T',
    friday: 'F',
    saturday: 'S',
  },
  weekdayShort: {
    sunday: 'Sun',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
  },
  adjectives: {
    running: 'Running',
    paused: 'Paused',
    copied: 'Copied',
  },
  conjunctions: {
    or: 'or',
  },
  phrases: {
    actionRequired: 'Action required',
    bestChoice: 'Best choice',
    startHere: 'Start here',
    readyToGo: 'Ready to go',
    readyToSet: 'Ready to set',
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
  miningType: {
    tari: 'Tari Mining',
    merged: 'Merged Mining',
  },
}

export default translations
