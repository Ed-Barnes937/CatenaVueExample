<template>
  <v-container grid-list-lg>
    <v-layout row wrap>
      <v-flex v-for="(value, key) in charts.summaryCharts" :key="key">
        <v-card>
          <v-card-title>
            <h4 :class="headline">{{ key.replace('nr', '') | camelCaseToTitle }}</h4>
          </v-card-title>
          <v-card-text>
            <p :class="['chart-description']" v-html="getLangKey('chartDescriptions')[key]" />
            <div :class="['chart-placeholder']" :id="key"  />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import c3 from 'c3'
import filters from '../helpers/filters'
import methods from '../helpers/methods'

export default {
  name: 'LinkMaps',
  mixins: [methods],
  data () {
    return {
      title: 'Linkmaps',
      headline: this.$store.state.cssClasses.headline,
      linksTranslations: this.getLangKey('linksTranslations'),
      charts: {
        summaryData: {},
        summaryCharts: {
          nrDomains: [],
          nrLinkSites: [],
          nrMoneySites: []
        }
      }
    }
  },
  mounted () {
    this.setPageSubTitle(this.title)
    this.getSummaryData()
  },
  methods: {
    /**
     * @param {Object} data
     * @return void
     * */
    setChartsSummaryData (data) {
      this.charts.summaryData = data
    },
    /**
     * @param {String} key
     * @param {Object} data
     * @return void
     * */
    setDomainsAndMoneySites (key, data) {
      this.charts.summaryCharts[key] = data
    },
    /**
     * Get the summary data for the initial charts
     * @method getSummaryData
     * @return void
     */
    getSummaryData () {
      const data = this.$globalData.data.domainsSummary
      const nrDomains = []
      const nrLinkSites = []
      const nrMoneySites = []
      this.setChartsSummaryData(data)

      for (let tld in data.tlds) {
        nrDomains.push([tld, data.tlds[tld].nrDomains])
        nrLinkSites.push([tld, data.tlds[tld].nrLinkSites])
        nrMoneySites.push([tld, data.tlds[tld].nrMoneySites])
        this.setDomainsAndMoneySites('nrDomains', nrDomains)
        this.setDomainsAndMoneySites('nrLinkSites', nrLinkSites)
        this.setDomainsAndMoneySites('nrMoneySites', nrMoneySites)
      }
      this.getSummaryCharts()
    },
    /**
     * Get the summary charts from the local data
     * @method getSummaryCharts
     * @return void
     */
    getSummaryCharts () {
      for (let summaryChart in this.charts.summaryCharts) {
        this.renderSummaryChart(summaryChart)
      }
    },
    /**
     * @using ../../filters
     */
    camelCaseToTitle () {
      return filters.camelCaseToTitle()
    },
    /**
     * Render a summary chart
     * @method renderSummaryChart
     * @param {String} chartName
     * @return void
     */
    renderSummaryChart (chartName) {
      const summaryData = this.charts.summaryData
      const chartSize = document.querySelector('main').offsetWidth / 4
      const linksTranslations = this.linksTranslations
      const router = this.$router
      this.charts.summaryCharts[chartName] = this.charts.summaryCharts[chartName].filter(a => a[1] > 0)
      this.charts.summaryCharts[chartName] = this.charts.summaryCharts[chartName].sort((a, b) => a[1] - b[1])
      c3.generate({
        bindto: `#${chartName}`,
        size: {
          width: chartSize,
          height: chartSize
        },
        donut: {
          label: {
            format: function (value, ratio, id) {
              return `.${id}`
            }
          }
        },
        tooltip: {
          contents (data) {
            data = data[0] || {}
            const id = data.id
            const percentage = parseFloat((data.ratio * 100).toFixed(1))
            const domainData = summaryData.tlds[id]
            const links = domainData.links
            const nrDomains = domainData.nrDomains
            const nrLinkSites = domainData.nrLinkSites
            const nrMoneySites = domainData.nrMoneySites
            const linksHtml = []

            for (let link in links) {
              if (typeof links[link] === 'number') {
                linksHtml.push(`<li>${linksTranslations[link]}: ${links[link]}</li>`)
              }
            }

            return `<h6>${id} (${percentage}%)</h6>
                    <ul>
                      <li>Domains: ${nrDomains}</li>
                      <li>Money sites: ${nrMoneySites}</li>
                      <li>Link sites: ${nrLinkSites}</li>
                      <li>Links:
                      <ul>${linksHtml.join('')}</ul>
                      </li>
                    </ul>`
          }
        },
        data: {
          columns: this.charts.summaryCharts[chartName],
          type: 'donut',
          onclick (data, i) {
            router.push({
              path: `/linkmaps/${data.id}`
            })
          }
        },
        color: {
          pattern: this.getConfig().chartColorPatterns
        }
      })
      this.ajax(false)
    }
  }
}
</script>
