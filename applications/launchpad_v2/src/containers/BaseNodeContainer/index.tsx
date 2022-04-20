import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

const BaseNodeContainer = () => {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    const getFromBackend = async () => {
      const imagesFromBackend = await invoke<string[]>('image_list')
      setImages(imagesFromBackend)
    }

    getFromBackend()
  }, [])

  return (
    <div>
      <h2>Base Node</h2>
      <p>
        available docker images:
        <br />
        {images.map(img => (
          <em key={img}>
            {img}
            {', '}
          </em>
        ))}
      </p>
    </div>
  )
}

export default BaseNodeContainer
