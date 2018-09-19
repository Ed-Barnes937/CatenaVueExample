<template>
  <v-app id="app">
    <catena-loading-overlay />
    <v-navigation-drawer v-model="drawer" width="56" persistent enable-resize-watcher app :class="['elevation-8']">
      <v-list :class="['catena']">
        <!-- this one is showing when the linkmap sidebar is collapsed -->
        <v-list-tile v-if="linkmapSidebarOff" ripple>
          <v-list-tile-action>
            <v-tooltip right>
              <v-icon @click="toggleLinkmapSidebar" color="pink" slot="activator" :class="['click-target']">mdi-filter-outline</v-icon>
              <span>Linkmap filters</span>
            </v-tooltip>
          </v-list-tile-action>
        </v-list-tile>
        <!-- this one is showing when the linkmap sidebar is collapsed -->
        <v-list-tile :to="item.path" v-for="(item, index) in sidebar" :key="index" ripple router>
          <v-list-tile-action>
            <v-tooltip right>
              <v-icon slot="activator">{{ item.icon }}</v-icon>
              <span v-html="item.label" />
            </v-tooltip>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar v-if="toolbar" :class="['catena']" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-html="pageTitle" />
      <v-spacer />
      <v-icon @click="$router.push({path: '/dashboard'})" :class="['click-target']" color="white">dashboard</v-icon>
      <span v-if="$store.getters.selectedRole" v-html="$store.getters.selectedRole.label" />
      <nav-avatar />
    </v-toolbar>
    <main>
      <v-content>
        <v-container>
          <router-view />
        </v-container>
      </v-content>
    </main>
  </v-app>
</template>
<script>
import Vue from 'vue'
import axios from 'axios'
import methods from './helpers/methods'
import LoadingOverlay from './components/LoadingOverlay.vue'
import NavAvatar from '@/components/NavAvatar'

export default {
  name: 'app',
  mixins: [methods],
  components: {
    LoadingOverlay,
    NavAvatar
  },
  data () {
    return {
      pageTitle: null,
      firstRun: false,
      drawer: true,
      linkmapSidebarOff: false,
      toolbar: true,
      footer: true,
      navigationItems: this.$router.options.routes,
      title: this.getAppTitle(),
      year: new Date().getFullYear(),
      portfolioName: this.getStoredPortfolio(),
      linkmapSidebarEvent: this.$store.state.events.linkmapSidebarEvent
    }
  },
  watch: {
    '$route.path' () {
      this.toogleSpace()
    }
  },
  computed: {
    portfolios () {
      return this.$store.getters.portfolios
    },
    sidebar () {
      return this.$router.options.routes.filter(route => route.render)
    }
  },
  created () {
    this.log('[APP.vue] created', null)
    const cssClasses = this.$store.state.cssClasses
    this.darkGreyButton = cssClasses.darkGreyButton
    this.whiteText = cssClasses.whiteText
    document.title = this.getAppTitle()
    this.$root.$on('setPageSubTitle', (text) => {
      this.pageTitle = text
    })
    this.$root.$on(this.linkmapSidebarEvent, (data) => {
      if (!data) {
        this.linkmapSidebarOff = true
        return
      }
      this.linkmapSidebarOff = false
    })
    this.ajax(false)
    let storedPortfolion = this.getStoredPortfolio()
    if ((storedPortfolion && storedPortfolion.firstRun) || !storedPortfolion) {
      this.firstRun = true
    }
  },
  beforeUpdate () {
    this.log('[APP.vue] beforeUpdate', null, '#ff9800')
  },
  updated () {
    this.log('[APP.vue] updated', null, '#9c27b0')
  },
  mounted () {
    this.$root.$on('ready', () => {
      this.init()
    })
  },
  methods: {
    toggleLinkmapSidebar () {
      this.$root.$emit(this.linkmapSidebarEvent, true)
    },
    init () {
      this.$http('/api/portfoliorecords').then(response => {
        this.$store.commit('setPortfolios', response.data)
        if (this.jsonUrls) {
          const jsonUrls = this.jsonUrls
          const promises = []
          const dataKeys = Object.keys(jsonUrls)
          // console.log('bootstraop dataKeys', dataKeys)
          dataKeys.forEach((url) => {
            console.log('pushing jsonUrl ' + url, jsonUrls[url])
            promises.push(Vue.axios.get(jsonUrls[url]))
          })
          console.info(`Bootstrapping Flamingo for "${this.getStoredPortfolio().text}". Portfolio data:`, this.$store.getters.data)
          Vue.axios
            .all(promises)
            .then(axios.spread((...response) => {
              response.forEach((item, index) => {
                this.setData({
                  name: dataKeys[index],
                  data: item.data
                })
                // @todo remove $globalData
                this.$globalData.data[dataKeys[index]] = item.data
              })
              this.filterMSLS()
              this.getGridData('googleidx', 'googleIndex', this.getNameServersData)
            }))
        }
      })
    },
    toogleSpace () {
      if (this.$route.path === '/dashboard/domains/linkmap') { // does this route path actually exist in the UI - can't seem to get to if (FV 22/06/18)
        this.drawer = false
        this.toolbar = false
        this.footer = false
        return
      }
      this.drawer = true
      this.toolbar = true
      this.footer = true
    },
    /**
     * Store the selected user role in Vuex
     * @method setRole
     * @param {Object} role
     * {
     *  type: String,
     *  label: String
     * }
     * @return void
     * **/
    setRole (role) {
      this.$store.commit('setRole', role)
    }
  }
}
</script>
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
.portfolio-list {
  width: 100%;
}
</style>
