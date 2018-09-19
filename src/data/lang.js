/**
 * Language file, available application-wide
 * **/
const lang = {
  appTitle: 'Catena Flamingo',
  domains: 'Domains',
  links: 'Links',
  dashboard: 'Dashboard',
  moneySites: 'Money Sites',
  linkSites: 'Link Sites',
  networkMap: 'Network Maps',
  openSite: 'Open URL',
  downloadCsv: 'Download crawl .csv',
  download: 'Download',
  ipAddressesTitle: 'IP Addresses',
  search: 'Search',
  nameServers: 'Nameservers',
  googleIndex: 'Google Index',
  whois: 'Whois',
  records: 'Records',
  view: 'View',
  na: 'n/a',
  choosePortfolioDialogTitle: 'Set Portfolio',
  choosePortfolioDialogText: 'You need to select a portfolio before using Flamingo. Choose one from the list below.',
  linksTranslations: {
    internal: 'Internal',
    external: 'External',
    toMS: 'To Money Sites',
    toLS: 'To Link Sites'
  },
  chartLabels: {
    nrMoneySites: 'Money Sites',
    nrLinkSites: 'Link Sites'
  },
  anchorText: 'anchor text',
  networkDiagramsTitles: {
    nrMoneySites: (selectedTld) => {
      return `Money Sites | ${selectedTld}`
    },
    nrLinkSites: (selectedTld) => {
      return `Link Sites | ${selectedTld}`
    },
    moneySite: (selectedDomain) => {
      return `Money Site | ${selectedDomain}`
    },
    linkSite: (selectedDomain) => {
      return `Link Site | ${selectedDomain}`
    },
    links: (selectedDomain) => {
      return `Links | ${selectedDomain}`
    }
  },
  networkMapLegend: {
    nodeColor: {
      moneySite: 'Money Site',
      linkSite: 'Link Site',
      externalSite: 'External'
    },
    linkColor: {
      ms2ms: 'MS to MS',
      ms2ls: 'MS to LS',
      ms2ext: 'MS to Ext',
      ms2int: 'MS Internal',
      ls2ms: 'LS to MS',
      ls2ls: 'LS to LS',
      ls2ext: 'LS to Ext',
      ls2int: 'LS Internal',
      ext2ms: 'Ext to MS',
      ext2ls: 'Ext to LS',
      ext2ext: 'Ext to Ext'
    }
  },
  close: 'Close',
  filtersAndToolsTitle: 'Filters and Tools',
  noDataForDomainTitle: 'No Data for this Domain',
  domainDetailsTitle: 'Domain Details',
  noDataForDomainText: 'Bummer... No data is currently available for this domain. Hit the "Close" button and select another domain.',
  chartDescriptions: {
    domains: (tld) => `Money Sites vs Link Sites in top-level domain ".${tld}". Click the Money Sites to expore links to the .${tld} Money Sites. Click the Link Sites to explore links from .${tld} Link Sites.`,
    links: (tld) => `Types of links in all domains in top-level domain ".${tld}".`,
    moneySites: (tld) => `Money Sites in top-level domain ".${tld}", sized by number of links to it. Click any Money Site to explore the links to and from it.`,
    linkSites: (tld) => `Link Sites in top-level domain ".${tld}", sized  by number of links to Money Sites from it.`,
    nrDomains: `Top-level domains sized by number of domains.`,
    nrLinks: 'Links summary ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    nrMoneySites: `Top-level domains sized by number of money sites.`,
    nrLinkSites: 'Link sites'
  }
}

export default lang
