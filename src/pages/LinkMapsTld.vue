<template>
  <div>
    <v-container grid-list-lg>
      <v-layout row wrap>
        <v-flex lg6>
          <v-card>
            <v-card-title>
              <h4 :class="headline" v-html="getLangKey('domains')" />
            </v-card-title>
            <v-card-text>
              <p :class="['chart-description']" v-html="getLangKey('chartDescriptions').domains(tld)" />
              <div id="domains" :class="['chart-placeholder']" />
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex lg6>
          <v-card>
            <v-card-title>
              <h4 :class="headline" v-html="getLangKey('links')" />
            </v-card-title>
            <v-card-text>
              <p :class="['chart-description']" v-html="getLangKey('chartDescriptions').links(tld)" />
              <div id="links" :class="['chart-placeholder']" />
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex lg12>
          <v-card>
            <v-card-title>
              <h4 :class="headline" v-html="getLangKey('moneySites')" />
            </v-card-title>
            <v-card-text>
              <p :class="['chart-description']" v-html="getLangKey('chartDescriptions').moneySites(tld)" />
              <div id="money-sites" :class="['chart-placeholder']" />
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex lg12>
          <v-card>
            <v-card-title>
              <h4 :class="headline" v-html="getLangKey('linkSites')" />
            </v-card-title>
            <v-card-text>
              <p :class="['chart-description']" v-html="getLangKey('chartDescriptions').linkSites(tld)" />
              <div id="link-sites" :class="['chart-placeholder']" />
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <network-map :tld="charts" />
  </div>
</template>

<script>
  import c3 from 'c3'
  import methods from '../helpers/methods'
  import NetworkMap from '../components/NetworkMap.vue'

  export default {
    name: 'LinkMapsTld',
    mixins: [methods],
    components: {
      NetworkMap
    },
    data () {
      return {
        headline: this.$store.state.cssClasses.headline,
        error: false,
        links: [],
        domains: [],
        moneySites: [],
        linkSites: [],
        charts: {
          tlds: {}
        },
        route: this.$route,
        router: this.$router,
        tld: this.$route.params.tld,
        events: this.$store.getters.events,
        domainsFilter: Object.keys(this.getLangKey('chartLabels')),
        linksFilter: Object.keys(this.getLangKey('linksTranslations')),
        title () {
          return `Linkmaps for ".${this.tld}" Top Level Domains`
        },
        summaryUrl (tld) {
          var theTld = tld
          if (theTld.indexOf('.') !== -1) {
            var tmpArray = theTld.split('.')
            theTld = tmpArray.reverse().join('.')
          }
          return `${this.getDataRoot()}linkmap/${theTld}/summary.json?${theTld}`
        }
      }
    },
    mounted () {
      this.setPageSubTitle(this.title())
      this.getTldSummaryData()
    },
    methods: {
      /**
       * @method getTldSummaryData
       * **/
      getTldSummaryData () {
        const tld = this.route.params.tld
        const uri = this.summaryUrl(tld)
        const cachedTld = this.getCachedTld(tld)
        // check if the current tld is already cached and serve from the cache
        if (cachedTld) {
          return this.getOtherTlds(
            cachedTld,
            this.initCharts(cachedTld)
          )
        }
        this.ajax(true)
        this.$http.get(uri).then((response) => {
          response = response.data
          this.$globalData.data.tlds[tld] = response // cache the tld data // @todo remove $globalData
          this.setTldData({
            name: tld,
            data: response
          })
          this.getOtherTlds(response, this.initCharts(response)) // proceed with loading of the charts
        }).catch(error => {
          console.log('Flamingo error', error)
          this.error = true
          this.ajax(false)
        })
      },
      /**
       * Check and get cached tld from the global data
       * @method getCachedTld
       * @param {String} tld
       * @return {Object|undefined}
       * **/
      getCachedTld (tld) {
        // return this.$globalData.data.tlds[tld] // @todo remove $globalData
        return this.$store.getters.tld(tld)
      },
      /**
       * @method getMoneySiteLinkCountTo - given the domainName moneysite, counts links to it, from accross all tlds
       * @param {Object} domainName (moneysite)
       * @return Number
       */
      getMoneySiteLinkCountTo (domainName) {
        let count = 0
        let tldData = this.$globalData.data.domainsSummary.tlds
        for (let tldKey in tldData) {
          count += tldData[tldKey].links.toMoneySites[domainName] || 0
        }
        return count
      },
      /**
       * @method getMoneySiteLinkCountTo - given the domainName linksite, gets number of links to moneysites accross all tlds
       * @param {Object} domainName (linksite)
       * @return Number
       */
      getMoneySiteLinksFrom (domainName) {
        return this.$globalData.data.tlds[this.tld].domains[domainName].links.toMS
      },
      /**
       * @method setTldSummaryData
       * @return void
       * **/
      setTldSummaryData () {
        const data = this.getChartsTld(this.tld)
        const domainsFilter = this.domainsFilter
        const linksFilter = this.linksFilter
        // prepare the data for the "Domains" chart
        for (let item in data) {
          if (domainsFilter.indexOf(item) > -1) {
            this.domains.push([item, data[item]])
          }
        }
        this.renderChart('domains', this.domains, 'donut', 'domains')
        // prepare the data for the "Links" chart
        for (let item in data.links) {
          if (linksFilter.indexOf(item) > -1) {
            this.links.push([item, data.links[item]])
          }
        }
        this.renderChart('links', this.links, 'donut', 'links')
        // prepare the data for the "Money Sites" chart
        for (let domainName in data.domains) {
          let domain = data.domains[domainName]
          if (domain.isMoneySite) this.moneySites.push([domainName, this.getMoneySiteLinkCountTo(domainName)])
        }
        /* OLD - not removed yet to illustrate to ourselves to be careful - wrong place to pick up moneySites. the toMoneySites is a list of all links from domains in the tld to all (accross tlds) moneysites
        for (let item in data.toMoneySites) { this.moneySites.push([item, data.toMoneySites[item]]) } */
        this.renderChart('money-sites', this.sortArraysInArray(this.moneySites, 1), 'donut', 'moneySite')
        // prepare the data for the "Link Sites" chart
        for (let domainName in data.domains) {
          let domain = data.domains[domainName]
          if (domain.isLinkSite) this.linkSites.push([domainName, this.getMoneySiteLinksFrom(domainName)])
        }
        /* OLD - not removed yet to illustrate to ourselves to be careful -  wrong place to pick up linksites.
        for (let item in data.toLinkSites) { this.linkSites.push([item, data.toLinkSites[item]]) } */
        this.renderChart('link-sites', this.sortArraysInArray(this.linkSites, 1), 'donut', 'linkSite')
      },
      /**
       * @method setTldSummaryData
       * @param {HTMLDomNode} element
       * @param {Array} data
       * @param {String} type
       * @param {String} lookupType
       * **/
      renderChart (element, data, type, lookupType) {
        const tld = this.tld
        const legend = {}
        const root = this.$root
        const showNetworkMap = this.events.showNetworkMap
        const chartConfig = {
          bindto: `#${element}`,
          axis: {
            rotated: type === 'bar',
            x: { show: false }
          },
          color: {
            pattern: this.getConfig().chartColorPatterns
          },
          data: {
            columns: data || [],
            type: type || 'donut',
            onclick (data) {
              const eventData = {
                tld: tld,
                domains: [data.id].join(','),
                lookUpType: [lookupType].join(',')
              }
              eventData.lookUpType === 'domains' ? eventData.lookUpType = data.id : [lookupType].join(',')
              root.$emit(showNetworkMap, eventData)
            }
          }
        }
        switch (lookupType) {
          case 'domains':
            data.forEach((item) => {
              const _item = item[0]
              legend[_item] = this.getLangKey('chartLabels')[_item]
            })
            break
          case 'links':
            data.forEach((item) => {
              const _item = item[0]
              legend[_item] = this.getLangKey('linksTranslations')[_item]
            })
            break
          case 'moneySite':
            // trial by showing smallest MS first
            data = data.sort((a, b) => a[1] - b[1])
            const chartSize = document.querySelector('main').offsetWidth
            chartConfig.size = {
              width: chartSize / 1.2,
              height: chartSize / 2.1
            }
            console.log('LinkMapsTld moneySite chartConfig', chartConfig)
            break
          case 'linkSite':
            data = data.sort((a, b) => b[1] - a[1])
            const chartSize2 = document.querySelector('main').offsetWidth
            chartConfig.size = {
              width: chartSize2 / 1.2,
              height: chartSize2 / 2.1
            }
            break
        }
        chartConfig.data.names = legend
        const chart = c3.generate(chartConfig)
        chart.internal.isWithinBar = function (that) {
          let mouse = this.d3.mouse(that)
          let box = that.getBoundingClientRect()
          let seg0 = that.pathSegList.getItem(0)
          let seg1 = that.pathSegList.getItem(1)
          let x = Math.min(seg0.x, seg1.x)
          let y = Math.min(seg0.y, seg1.y)
          let w = box.width
          let h = box.height
          let offset = -1
          let sx = x - offset
          let ex = x + w + offset
          let sy = y + h + offset
          let ey = y - offset
          return sx < mouse[0] && mouse[0] < ex && ey < mouse[1] && mouse[1] < sy
        }
      },
      /**
       * Get other tlds, found in the datasets of the currently selected tld
       * @method getOtherTlds
       * @param {Object} data
       * @param {Function} callback [optional]
       * @return void
       * **/
      getOtherTlds (data, callback) {
        // console.log('getOtherTlds', data)
        // const currentTld = this.route.params.tld
        const alreadyLoadedTlds = Object.getOwnPropertyNames(this.getGlobalData().data.tlds)
        // const checkUps = ['toLinkSites', 'toMoneySites']
        let otherTdls = Object.getOwnPropertyNames(this.getGlobalData().data.domainsSummary.tlds)
        otherTdls = otherTdls.filter(tld => tld !== '__ob__' && !alreadyLoadedTlds.includes(tld))
        // ['at', 'at.co', 'be', 'biz', 'co', 'com', 'de', 'eu', 'fr', 'it', 'nl']
        // console.log('otherTlds is now', otherTdls)
        const promises = []
        /**
         * Extract the tlds
         * @method extractTlds
         * @private
         * @param {Object} item
         * **/
        otherTdls.forEach((url) => {
          promises.push(this.$http.get(this.summaryUrl(url)))
        })
        this.$http
          .all(promises)
          .then(this.$http.spread((...response) => {
            response.forEach((tldData) => {
              tldData = tldData.data
              this.$globalData.data.tlds[tldData.tld] = tldData // @todo remove $globalData
              this.setTldData({
                name: tldData.tld,
                data: tldData
              })
            })
            if (callback && typeof callback === 'function') {
              callback.call(this, data)
            }
            console.log('cached tlds', this.$store.getters.tlds)
          }))
      },
      /**
       * Initialize all charts
       * @method initCharts
       * @param {Object} data
       * **/
      initCharts (data) {
        const tld = this.route.params.tld
        this.setChartTld(tld, data)
        this.setTldSummaryData()
        this.ajax(false)
      },
      /**
       * Set a new key to charts.tlds[tld]
       * @smethod setChartTld
       * @param {String} tld
       * @param {Object} data
       * */
      setChartTld (tld, data) {
        this.charts.tlds[tld] = data
      },
      /**
       * @method getChartsTlds
       * @return {Object} charts.tlds
       * */
      getChartsTlds () {
        return this.charts.tlds
      },
      /**
       * @method getChartsTld
       * @param {String} tld
       * @return {Object} charts.tlds[tld]
       * */
      getChartsTld (tld) {
        return this.charts.tlds[tld]
      }
    }
  }
</script>
