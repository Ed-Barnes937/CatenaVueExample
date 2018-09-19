import './catena.css'
import * as components from './components'

function Catena (Vue) {
  const Catena = components.Catena

  Vue.use(Catena, {
    components
  })
}

export default Catena
