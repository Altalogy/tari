import { Container } from '../store/containers/types'

const translations: { [key: string]: { [key: string]: string } } = {
  verbs: {
    accept: 'Accept',
    apply: 'Apply',
    cancel: 'Cancel',
    tryAgain: 'Try again',
    stop: 'Stop',
    start: 'Start',
    save: 'Save',
    submit: 'Submit',
    pause: 'Pause',
    continue: 'Continue',
    close: 'Close',
    connect: 'Connect',
  },
  nouns: {
    expert: 'Expert',
    docker: 'Docker',
    expertView: 'Expert view',
    baseNode: 'Base Node',
    tariWallet: 'Tari Wallet',
    moneroWallet: 'Monero Wallet',
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
    results: 'Results',
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
    recommended: 'Recommended',
    remaining: 'Remaining',
    processing: 'Processing',
    cancelled: 'Cancelled',
  },
  conjunctions: {
    or: 'or',
    of: 'of',
  },
  phrases: {
    actionRequired: 'Action required',
    bestChoice: 'Best choice',
    keepEditing: 'Keep editing',
    saveChanges: 'Save changes',
    startHere: 'Start here',
    readyToGo: 'Ready to go',
    readyToSet: 'Ready to set',
    gotIt: 'Got it',
    pleaseWait: 'Please wait',
    yourJobIsDoneHere: 'Your job is done here',
    calculatingTheRemainingTime:
      'Calculating remaining time (this may take a few minutes)',
  },
  containers: {
    [Container.Tor]: 'Tor',
    [Container.BaseNode]: 'Base Node',
    [Container.Wallet]: 'Wallet',
    [Container.SHA3Miner]: 'SHA3 miner',
    [Container.MMProxy]: 'Merge miner proxy',
    [Container.XMrig]: 'xmrig',
    [Container.Monerod]: 'monerod',
    [Container.Loki]: 'loki',
    [Container.Promtail]: 'promtail',
    [Container.Grafana]: 'grafana',
  },
  miningType: {
    tari: 'Tari Mining',
    merged: 'Merged Mining',
  },
  units: {
    mib: 'MiB',
  },
}

export default translations
