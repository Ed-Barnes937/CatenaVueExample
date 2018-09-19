/**
 * Global data object, available application-wide
 * **/
// import lang from '../data/lang'
import config from '../data/config'

const globalData = {
  appPathRoot: '',
  // lang: lang,
  config: config,
  grids: {},
  events: {},
  dataFiles: {},
  data: {
    tlds: {}
  },
  portfolios: require('../config').portfolios
    .filter(p => p.show)
    .map(p => { return { text: p.label, value: p.path, catchAllTld: p.catchAllTld } })
}

if (!globalData.config.experimentalAPI) {
  config.dataRoot = '/static/data/'
}

globalData.config.dataRoot = `${globalData.appPathRoot}${config.dataRoot}`
globalData.config.dataArrayRoot = `${globalData.appPathRoot}${config.dataArrayRoot}`

export default globalData
