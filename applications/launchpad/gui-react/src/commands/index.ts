import { ChildProcess, Command } from '@tauri-apps/api/shell'

export const dockerVersionCmd = async (): Promise<ChildProcess> => {
  const command = new Command('docker', ['-v'])
  return command.execute()
}

export const isDockerInstalled = async (): Promise<boolean> => {
  const dockerVerCmd = await dockerVersionCmd()
  console.log('Docker ver:', dockerVerCmd)
  return dockerVerCmd.stdout.includes('Docker version')
  // Or check for ie/ command not found
}
