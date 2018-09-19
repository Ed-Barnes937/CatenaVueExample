/**
 * Language strings
 * */

const lang = {
  statuses: 'Statues',
  portfolios: 'Portfolios',
  includeReferringDomains: 'Include referring domains',
  addDomain: 'Type domain and hit enter',
  types: 'Types',
  noConfigOptions: 'The "Go-link" crawl profile does not have any configuration options. Proceed to the next step.',
  crawlProfile: 'Crawl Profile',
  domainVault: 'Domain Vault',
  goLink: 'Go-link',
  domain: 'Domain',
  customDomainsList: 'Custom Domains List',
  uploadCsv: 'Upload CSV File',
  unsupportedFileType: 'The file you have tried to upload is not supported. Make sure you upload CSV files only.',
  previous: 'Previous',
  next: 'Next',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  configuration: 'Configuration',
  start: 'Start Crawl',
  selectCrawlProfile: 'Select crawl profile',
  schedule: 'Schedule',
  ready: 'Ready',
  reset: 'Reset',
  minute: 'Minute',
  hour: 'Hour',
  dayOfTheMonth: 'Day of the Month',
  month: 'Month',
  filterDomains: 'Filter domains...',
  clearList: 'Clear List',
  dayOfTheWeek: 'Day of the Week',
  crawlCustomName: 'Crawl name',
  readyToStart: (profileName, cronString) => {
    return `You are now ready to start a "${profileName}" crawl profile that will run ${cronString}. To proceed, hit the "Start Crawl" button.`
  },
  'go-link': 'Go-Link',
  'domain-vault': 'Domain Vault',
  'portfolio': 'Portfolio',
  'custom-domains-list': 'Custom Domains List'
}

export default lang
