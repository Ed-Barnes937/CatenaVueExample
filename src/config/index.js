let config = {
  // config option for the parse-domain module - to be used in any parse-domain(<domain>) call to ensure 'privateTlds' are parsed correctly too
  // (without this option test.com.de and www.com.de will be parsed as sub 'test', domain 'com', tld 'de'. WITH this option domain 'test and tld 'com.de'!)
  parseDomain: {
    privateTlds: true
  },
  // until will have the data flowing from the backend ...
  portfolios: [
    { label: 'Tower', path: 'tower', show: true },
    { label: 'DomainVault', path: 'domainvault', show: true },
    { label: 'Pyramid', path: 'pyramid', show: true, keepLSUnfiltered: true, catchAllTld: 'guru' },
    { label: 'ProductZombies', path: 'productzombies', show: false, catchAllTld: 'se' },
    { label: 'Horizon', path: 'horizon', show: false, catchAllTld: 'info' },
    { label: 'NewCasinos', path: 'newcasinos', show: false, catchAllTld: 'info' },
    { label: 'Dreamworx', path: 'dreamworx', show: false, catchAllTld: 'info' },
    { label: 'VerticalReality', path: 'verticalreality', show: false, catchAllTld: 'info' }
  ]
}

module.exports = config
