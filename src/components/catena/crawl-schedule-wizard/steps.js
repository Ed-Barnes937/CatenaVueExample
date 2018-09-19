import lang from './lang'

const steps = [{
  label: lang.crawlProfile,
  done: false,
  controls: [{
    type: 'text',
    label: lang.crawlCustomName
  }, {
    type: 'select',
    event: 'crawl-scheduler:input',
    label: lang.selectCrawlProfile,
    name: 'profile',
    multiple: false,
    items: [{
      text: lang.domainVault,
      value: 'domain-vault'
    }, {
      text: lang.goLink,
      value: 'go-link'
    }, {
      text: lang.customDomainsList,
      value: 'custom-domains-list'
    }]
  }]
}, {
  label: lang.configuration,
  done: false,
  controls: []
}, {
  label: lang.schedule,
  done: false
}, {
  label: lang.ready,
  done: false
}]

export default steps
