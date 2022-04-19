import {useEffect, useState} from 'react'
import {invoke} from '@tauri-apps/api/tauri'
import {listen} from '@tauri-apps/api/event'

import logo from './logo.svg'
import './App.css'

function App() {
  const [images, setImages] = useState<string[]>([])
  useEffect(() => {
    const getFromBackend = async () => {
      const imagesFromBackend = await invoke<string[]>('image_list')
      setImages(imagesFromBackend)
    }

    invoke('events')

    getFromBackend()
  }, [])

  useEffect(() => {
    let unsubscribe

    const listenToSystemEvents = async () => {
      unsubscribe = await listen('tari://docker-system-event', (event) => {
        console.log('System event: ', event.payload)
      })
    }

    listenToSystemEvents()

    return unsubscribe
  }, [])

  const tryLaunchDockers = async () => {
    try {
      const result = await invoke('launch_docker', {
        name: 'workspaceName',
        config: {
          root_folder: '/tmp',
          tari_network: 'dibbler',
          has_base_node: true,
          has_wallet: false,
          has_sha3_miner: false,
          has_mm_proxy: false,
          has_xmrig: false,
          wait_for_tor: 5,
          wallet_password: null,
          sha3_mining_threads: null,
          monerod_url: null,
          monero_username: null,
          monero_password: null,
          monero_use_auth: null,
          monero_mining_address: null,
          docker_registry: null,
          docker_tag: null,
        }
      })

      console.log({result})
    } catch(error) {
      console.log('error launching dockers')
      console.log(error)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <button onClick={tryLaunchDockers}>test</button>

        <p>available docker images:<br/>
          {images.map(img => <em key={img}>{img}{', '}</em>)}
        </p>
      </header>
    </div>
  )
}

export default App
