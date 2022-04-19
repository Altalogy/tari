import { useDispatch } from 'react-redux'

import { setTheme } from '../../store/app'

const MiningContainer = () => {
  const dispatch = useDispatch()
  return (
    <div>
      <h2>Mining</h2>
      <button onClick={() => dispatch(setTheme('light'))}>
        Set light theme
      </button>
      <button onClick={() => dispatch(setTheme('dark'))}>Set dark theme</button>
    </div>
  )
}

export default MiningContainer
