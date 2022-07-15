import { invoke, os } from '@tauri-apps/api'

/**
 * Check the Docker version on the host machine
 * @returns {Promise<string>}
 */
export const checkDocker = async () => {
  try {
    const res: string = await invoke('check_docker')
    return res
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error: invoke(check_error)', err)
    return
  }
}

/**
 * Check if Docker is installed on the host machine
 * @returns {Promise<boolean>}
 */
export const isDockerInstalled = async (): Promise<boolean> => {
  const dockerVerCmd = await checkDocker()
  return Boolean(dockerVerCmd)
}

/**
 * Open the Terminal
 */
export const openTerminalCmd = async () => {
  try {
    const detectedPlatform = await os.type()

    if (
      !['linux', 'windows_nt', 'darwin'].includes(
        detectedPlatform.toLowerCase(),
      )
    ) {
      return
    }

    const platform = detectedPlatform.toLowerCase() as
      | 'linux'
      | 'windows_nt'
      | 'darwin'

    invoke('open_terminal', {
      platform: platform,
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return
  }
}
