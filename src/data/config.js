const config = {
  // list of portfolios, retrieved from the API {text: String, value: String}
  portfolios: [],
  dataRoot: '/static/data/', // root url for the data files
  lang: 'en', // default language
  dateFormat: 'DD/MM/YYYY', // default date format used in helpers/methods.js
  tableElevation: [
    'elevation-1',
    'striped-table'
  ],
  inputColor: 'grey',
  // rowsPerPage: [10, 20, 30, 40, 50, 100, 300, 500], // rows selector for the data grids
  // domainStatusesMap: { // map for the domain statuses chips in the /whois grid
  // // root url for the data files
  // dataRoot: '/api/data/',
  // root v2 url for the data files
  dataArrayRoot: '/api/data/array/',
  // // default language
  // lang: 'en',
  // // default date format used in helpers/methods.js
  // dateFormat: 'DD/MM/YYYY',
  // rows selector for the data grids
  rowsPerPageItems: [10, 20, 30, 40, 50, 100, 300, 500],
  // // page size for the data grid
  rowsPerPage: 30,
  // // map for the domain statuses chips in the /whois grid
  domainStatusesMap: {
    'connect': 'pink',
    'active': 'teal',
    'ACTIVE': 'teal',
    'ok': 'indigo',
    'NOT AVAILABLE': 'grey',
    'clientTransferProhibited': 'orange',
    'ok / challenged': 'amber darken-4',
    'ok / autoRenewPeriod': 'blue-grey'
  },
  chartColorPatterns: ['#bdbdbd', '#9ecae1', '#a1d99b', '#fdae6b', '#e6550d', '#636363', '#dadaeb', '#756bb1', '#74c476', '#c7e9c0', '#3182bd', '#fdd0a2', '#6baed6', '#31a354', '#fd8d3c', '#969696', '#9e9ac8', '#d9d9d9', '#bcbddc', '#c6dbef'], // color patterns used for the charts
  formattableDates: [ // JSON date keys that need be formatted via the formatDate method in helpers/methods.js
    'createdDate',
    'updatedDate',
    'expiresDate',
    'domain_databaseUpdatedDate',
    'databaseUpdatedDate',
    'adminContact_updatedDate',
    'zoneContact_updatedDate',
    'techContact_updatedDate',
    'domain_createdDate',
    'domain_updatedDate',
    'domain_expiresDate'
  ],
  selectedColumns: [ // default selected columns for the /thois grid
    'domain_name',
    'registrar_name',
    'domain_status',
    'expiresDate',
    'techContact_email',
    'registrant_email',
    'adminContact_email',
    'zoneContact_email'
  ],
  emailFields: [ // formattable email fields
    'registrar_email',
    'registrant_email',
    'adminContact_email',
    'techContact_email',
    'zoneContact_email'
  ],
  apiEndpoint: 'http://localhost:6085/api/', // http://10.20.21.170:8080/
  apiResources: {
    portfolios: 'portfoliosrecords'
  },
  // Enabling the experimental APIs such as /api/portfolios
  experimentalAPI: false,
  useAuthentication: true,
  afterLoginRoute: '/dashboard'
}

export default config
