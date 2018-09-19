import config from '../data/config'
import lang from '../data/lang'

const FlamingoStore = {
  profile: null,
  // the currently available user roles
  userRoles: [{
    type: 'SPEC',
    label: 'SEO Specialist',
    emails: ['martin.ivanov@catenamedia.com']
  }, {
    type: 'PO',
    label: 'Product Owner',
    emails: ['martin.ivanov@catenamedia.com']
  }, {
    type: 'HOP',
    label: 'Head of Department',
    emails: ['martin.ivanov@catenamedia.com']
  }, {
    type: 'CIO',
    label: 'CIO',
    emails: ['martin.ivanov@catenamedia.com']
  }, {
    type: 'CEO',
    label: 'CEO',
    emails: ['martin.ivanov@catenamedia.com']
  }, {
    type: 'DEVOPS',
    label: 'DevOPS',
    emails: ['clinton.cutajar@catenamedia.com']
  }, {
    type: 'FLAM',
    label: 'Flamingo',
    emails: ['martin.ivanov@catenamedia.com']
  }],
  // the currently selected user role
  selectedRole: null,
  // configuration options
  config: config,
  // localization strings
  lang: lang,
  // global CSS classes
  cssClasses: {
    primaryButton: ['primary'],
    headline: ['headline', 'grey--text', 'text--darken-1', 'mb-0'],
    cardActions: ['text-lg-right', 'block'],
    darkGreyButton: ['grey', 'darken-4'].join(' '),
    whiteText: 'white--text',
    inputColor: 'pink'
  },
  // custom events
  events: {
    showNetworkMap: 'showNetworkMap',
    hideNode: 'hideNode',
    renderLegend: 'renderLegend',
    showTabularDataPopup: 'showTabularDataPopup',
    openSite: 'openSite',
    downloadSiteCsv: 'downloadSiteCsv',
    linkmapSidebarEvent: 'linkmap:sidebar'
  },
  // raw csv resources
  dataFiles: {
    whois: 'whois.csv',
    googleIndex: 'googleidx.csv',
    ipAddresses: 'dnsany-A.csv',
    nameServers: 'dnsany-NS.csv'
  },
  // json resources
  jsonFiles: {
    linkSite: 'linkmap/linksite-domains.json',
    moneySite: 'linkmap/moneysite-domains.json',
    domainsSummary: 'linkmap/summary.json?all',
    allMSLinks: 'linkmap/all-ms-links.json',
    allLSLinks: 'linkmap/all-ls-links.json'
  },
  data: {
    tlds: {}
  },
  // row data from the new dashboard
  rowData: {},
  // current linkmap nodes array
  linkmapNodes: []
}

export default FlamingoStore
