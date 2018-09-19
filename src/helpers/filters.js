import Vue from 'vue'
import moment from 'moment'
import S from 'string'
import config from '../data/config'

/**
 * Format a date string to human-readable string
 * @filter formatDate
 * @param {DateString} date
 * @return {String}
 */
Vue.filter('formatDate', function (date) {
  if (date) {
    return moment(String(date)).format(config.dateFormat)
  }
})

/**
 * Convert programmatic case to human-readable string
 * @filter camelCaseToTitle
 * @param {String} string
 * @return {String}
 */
Vue.filter('camelCaseToTitle', function (string) {
  if (string) {
    return S(string).humanize().s
  }
})

/**
 * Format a string to lower case
 * @filter lower
 * @param {String} value
 * @return {String}
 */
Vue.filter('lower', function (string) {
  if (string) {
    return string.toLowerCase()
  }
})

export default Vue.filter
