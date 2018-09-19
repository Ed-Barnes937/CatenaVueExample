<template>
  <v-container grid-list-lg>
    <v-layout>
      <v-navigation-drawer v-model="expanded">
        <h1 :class="['drawer-header']">
          <v-icon @click="toggleSidebar" :class="['click-target']" title="Toggle sidebar">mdi-filter-outline</v-icon> Filters
        </h1>
        <v-expansion-panel>
          <v-expansion-panel-content :value="true">
            <div slot="header" :class="['expansion-header']">
              <v-icon>language</v-icon>
              <span>Domains</span>
            </div>
            <v-card>
              <v-card-text :class="['pa-2']">
                <v-select :items="domainTypes" disabled dense placeholder="Type of domain" />
                <v-divider />
                <h2 :class="['label-md']">Domain Name Labels</h2>
                <div :class="['cm-switcher-row']">
                  <div>
                    <div :class="['label-sm']">Products</div>
                    <div>
                      <v-switch color="pink" v-model="ms" hide-details />
                    </div>
                  </div>
                  <div>
                    <div :class="['label-sm']">Network sites</div>
                    <div>
                      <v-switch color="pink" v-model="ls" hide-details />
                    </div>
                  </div>
                  <div>
                    <div :class="['label-sm']">External</div>
                    <div>
                      <v-switch color="pink" v-model="ext" hide-details />
                    </div>
                  </div>
                </div>
                <v-divider />
                <h2 :class="['label-md']">Show</h2>
                <div :class="['cm-switcher-row']">
                  <div>
                    <v-select :items="isGIndexItems" v-model="isGIndex" />
                    </div>
                  </div>
                  <div>
                    <div :class="['label-sm']">Multi-linking</div>
                    <div>
                      <v-switch color="pink" v-model="ml" hide-details />
                    </div>
                </div>
                <v-divider />
                <h2 :class="['label-md']">Domain Ratings ({{domainRatings[0]}}, {{ domainRatings[1] }})</h2>
                <vue-slider disabled :width="260" v-model="domainRatings" :tooltip="false" :min="0" :max="domainRatingsMax" />
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-content :value="false">
            <div slot="header" :class="['expansion-header']">
              <v-icon>language</v-icon>
              <span>Simulation</span>
            </div>
            <v-card>
              <v-card-text :class="['pa-2']">
                <a href="https://github.com/d3/d3-force#simulation_alpha" target="_blank">Alpha</a>
                <v-slider :width="260" v-model="simAlpha" :thumb-label="true" :tooltip="true" :min="0" :max="1000" :step="1"/>
                <a href="https://github.com/d3/d3-force#simulation_alphaDecay" target="_blank">Alpha Decay</a>
                <v-slider :width="260" v-model="simAlphaDecay" :thumb-label="true" :tooltip="true" :min="0" :max="1000" :step="1"/>
                <a href="https://github.com/d3/d3-force#simulation_alphaMin" target="_blank">Alpha Min</a>
                <v-slider :width="260" v-model="simAlphaMin" :thumb-label="true" :tooltip="true" :min="0" :max="1000" :step="1"/>
                <a href="https://github.com/d3/d3-force#simulation_alphaTarget" target="_blank">Alpha Target</a>
                <v-slider :width="260" v-model="simAlphaTarget" :thumb-label="true" :tooltip="true" :min="1" :max="900" :step="1"/>
                <a href="https://github.com/d3/d3-force#simulation_velocityDecay" target="_blank">Velocity Decay</a>
                <v-slider :width="260" v-model="simVelocityDecay" :thumb-label="true" :tooltip="true" :min="1" :max="900" :step="1"/>
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
          <v-expansion-panel-content :value="false">
            <div slot="header" :class="['expansion-header']">
              <v-icon>language</v-icon>
              <span>Force: Charge</span>
            </div>
            <v-card>
              <v-card-text :class="['pa-2']">
                Charge Strength
                <v-slider :width="260" v-model="simForceChargeStrength" :thumb-label="true" :tooltip="true" :min="-100" :max="100" :step="5"/>
                Charge Distance
                <vue-slider :width="260" v-model="simForceChargeDistance" :lazy="false" :show="true" tooltip="always" :min="1" :max="3500" :interval="1"/>
              </v-card-text>
            </v-card>            
          </v-expansion-panel-content>
          <v-expansion-panel-content :value="false">
            <div slot="header" :class="['expansion-header']">
              <v-icon>language</v-icon>
              <span>Force: Collide</span>
            </div>
            <v-card>
              <v-card-text :class="['pa-2']">
                Collide Radius
                <v-slider :width="260" v-model="simForceCollideRadius" :thumb-label="true" :tooltip="true" :min="1" :max="10" :step="1"/>
                Collide Strength
                <v-slider :width="260" v-model="simForceCollideStrength" :thumb-label="true" :tooltip="true" :min="0" :max="10" :step="1"/>
                Collide Iterations
                <v-slider :width="260" v-model="simForceCollideIterations" :thumb-label="true" :tooltip="true" :min="1" :max="15" :step="1"/>
              </v-card-text>
            </v-card>            
          </v-expansion-panel-content>
          <v-expansion-panel-content :value="false">
            <div slot="header" :class="['expansion-header']">
              <v-icon>language</v-icon>
              <span>Force: Link</span>
            </div>
            <v-card>
              <v-card-text :class="['pa-2']">
                Link Distance
                <v-slider :width="260" v-model="simForceLinkDistance" :thumb-label="true" :tooltip="true" :min="0" :max="10" :step="1"/>
                Link Strength
                <v-slider :width="260" v-model="simForceLinkStrength" :thumb-label="true" :tooltip="true" :min="1" :max="10" :step="1"/>
              </v-card-text>
            </v-card>            
          </v-expansion-panel-content>
          <v-expansion-panel-content :value="false">
            <div slot="header" :class="['expansion-header']">
              <v-icon>language</v-icon>
              <span>Force: Radial</span>
            </div>
            <v-card>
              <v-card-text :class="['pa-2']">
                Radius
                <v-slider :width="260" v-model="simForceRadialRadius" :thumb-label="true" :tooltip="true" :min="1" :max="10" :step="1"/>
                Radial Strength
                <v-slider :width="260" v-model="simForceRadialStrength" :thumb-label="true" :tooltip="true" :min="0" :max="10" :step="1"/>
              </v-card-text>
            </v-card>            
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-navigation-drawer>
      <div :class="[linkmapContainer, expanded ? `${linkmapContainer}-expanded` :  null]">
        <catena-linkmap
          @input:dn="onInputDomainNames"
          @input:ms="onInputMoneySites"
          @input:isgindex="onInputGoogleIndexed"
          @input:ls="onInputNetworkSites"
          @input:ml="onInputMultiLinking"
          @input:ext="onInputExternal"
          v-resize="onLinkmapResize"
          id="linkmap-1"
          :data="mapData"
          :is-g-index="isGIndex"
          :dn="dn"
          :ms="ms"
          :ml="ml"
          :ext="ext"
          :ls="ls"
          :width="width"
          :height="height"
          :sim-alpha="simAlpha"
          :sim-alpha-decay="simAlphaDecay"
          :sim-alpha-min="simAlphaMin"
          :sim-alpha-velocity="simAlphaVelocity"
          :sim-velocity-decay="simVelocityDecay"
          :sim-force-charge-strength="simForceChargeStrength"
          :sim-force-charge-distance="simForceChargeDistance"
          :sim-force-collide-radius="simForceCollideRadius"
          :sim-force-collide-strength="simForceCollideStrength"
          :sim-force-collide-iterations="simForceCollideIterations"
          :sim-force-link-distance="simForceLinkDistance"
          :sim-force-link-strength="simForceLinkStrength"
          :sim-force-radial-radius="simForceRadialRadius"
          :sim-force-radial-strength="simForceRadialStrength" />
      </div>
    </v-layout>
  </v-container>
</template>
<script>
import CatenaLinkmap from '../components/catena/linkmap/index.vue'
import vueSlider from 'vue-slider-component'
import parseDomain from 'parse-domain'

export default {
  name: 'App',
  components: {
    CatenaLinkmap,
    vueSlider
  },
  watch: {
    url () {
      this.getData()
    }
  },
  props: {
  },
  data () {
    return {
      url: '',
      mapData: null,
      expanded: true, // expanded state of the filters sidebar
      linkmapContainer: 'linkmap-container',
      width: 1600,  // FV HACK
      height: this.setLinkmapHeight(), // linkmap resize handler
      sidebarSectionTitle: [
        'subheading',
        'pa-2'
      ],
      domainTypes: [],
      domainRatings: [0, 100],
      domainRatingsMax: 100,
      dnsModel: ['IP', 'Nameserver'],
      dns: [
        'IP',
        'Nameserver'
      ],
      whoisModel: [
        'admin email',
        'registrar'
      ],
      whois: [
        'admin email',
        'registrar'
      ],
      ms: true, // switch for Products domain names
      ls: false, // switch for Network sites domain names
      dn: true, // switch
      isGIndex: 'google-both',
      isGIndexItems: [{
        text: 'Indexed',
        value: 'google-indexed'
      }, {
        value: 'google-not-indexed',
        text: 'Not Indexed'
      }, {
        value: 'google-both',
        text: 'Indexed and Not Indexed'
      }],
      ml: true, // switch
      ext: false, // switch,
      linkmapSidebarEvent: this.$store.state.events.linkmapSidebarEvent,
      simForceRadialRadius: 1,
      simForceRadialStrength: 1,
      simForceLinkDistance: 3,
      simForceLinkStrength: 1,
      simForceChargeStrength: 0,
      simForceChargeDistance: [1, 350],
      simForceCollideRadius: 3,
      simForceCollideStrength: 7,
      simForceCollideIterations: 1,
      simAlpha: 1000,
      simAlphaMin: 0.001,
      simAlphaTarget: 0,
      simAlphaDecay: 800,
      simAlphaVelocity: 1,
      simVelocityDecay: 0.4
    }
  },
  mounted () {
    this.getData()
  },
  beforeDestroy () {
    this.emitSidebarToggleEvent(true)
  },
  created () {
    this.$root.$on(this.linkmapSidebarEvent, (data) => {
      if (data) {
        this.expanded = true
      }
    })
  },
  methods: {
    /**
     * Handler for the v-resize directive of the linkmap component
     * @method onLinkmapResize
     * @return void
     */
    onLinkmapResize () {
      this.height = this.setLinkmapHeight()
    },
    /**
     * Get the linkmap height
     * @method setLinkmapHeight
     * @return {Number}
     */
    setLinkmapHeight () {
      return document.documentElement.clientHeight - 120
    },
    /**
     * Emit the linkmap:sidebar event to the application $root
     * @method emitSidebarToggleEvent
     * @param {Boolean} state
     * @return void
     */
    emitSidebarToggleEvent (state) {
      this.$root.$emit(this.linkmapSidebarEvent, state)
    },
    /**
     * Toggle the sidebar and reflect the changes to the app's sidebar
     * @method toggleSidebar
     * @return void
     */
    toggleSidebar () {
      this.expanded = !this.expanded
      if (!this.expanded) {
        this.emitSidebarToggleEvent(false)
      }
    },
    /**
     * Linkmap event listener
     * @return void
     */
    onInputDomainNames ($event) {
      console.log('@input:dn', $event)
    },
    /**
     * Linkmap event listener
     * @return void
     */
    onInputGoogleIndexed ($event) {
      console.log('@input:googleindexed', $event)
    },
    /**
     * Linkmap event listener
     * @return void
     */
    onInputNetworkSites ($event) {
      console.log('@input:ls', $event)
    },
    /**
     * Linkmap event listener
     * @return void
     */
    onInputMultiLinking ($event) {
      console.log('@input:ml', $event)
    },
    /**
     * Linkmap event listener
     * @return void
     */
    onInputExternal ($event) {
      console.log('@input:ext', $event)
    },
    /**
     * Linkmap event listener
     * @return void
     */
    onInputMoneySites ($event) {
      console.log('@input:ms', $event)
    },
    changeSubdomainLinksToRootDomain (rootDomain, mapData) {
      // console.log('rootDomain', rootDomain)
      let rootDomainName = rootDomain.id
      let rootDomainIndex = rootDomain.index

      var subDomains = mapData.nodes.filter(n => {
        var domain = parseDomain(n.id, {privateTlds: true})
        // if (!domain) console.error('error reading domain', n)
        return domain && domain.domain.concat('.').concat(domain.tld) === rootDomainName && domain.subdomain !== ''
      })
      // if (subDomains.length) console.log('nr subs for ' + rootDomainName, subDomains.length)
      subDomains.forEach(sub => {
        // console.log('checking for links with source or target ' + sub.id)
        mapData.links = mapData.links.map(l => {
          if (l.source === sub.id) {
            // console.log('changing source [' + l.source + ' ] to ' + rootDomainName, l)
            l.source = rootDomainName
            l.sourceId = rootDomainIndex
            // console.log('changed source', l)
          }
          if (l.target === sub.id) {
            // console.log('changing target [' + l.target + ' ] to ' + rootDomainName, l)
            l.target = rootDomainName
            l.targetId = rootDomainIndex
            // console.log('changed target', l)
          }
          return l
        })
        mapData.nodes = mapData.nodes.filter(n => n.id !== sub.id)
        // console.log('removed ' + sub.id, mapData.nodes.length)
      })
    },
    uniteSubdomainsWithDomains (mapData) {
      var rootNodes = mapData.nodes.filter(node => {
        var nodeDomain = parseDomain(node.id, {privateTlds: true})
        return (nodeDomain && !nodeDomain.subdomain)
      })
      rootNodes.forEach(rootNode => this.changeSubdomainLinksToRootDomain(rootNode, mapData))
    },
    /**
     * This is a temporary method for loading static data
     * @method getData
     * @erturn void
     */
    getData () {
      /* MARTIN - is this 'this.$route.params.overview' the right way of getting the selected portfolio? */
      let url = '/api/linkmap'
      if (this.$route.params.selection === 'portfolioassetproductrecords') {
        url += '/product/'
      } else {
        url += '/portfolio/'
      }
      url += this.$route.params.overview
      console.log('linkmap.vue getData url', url)
      this.$http(url)
      .then(response => {
        console.time('linkmap.vue_getData_responseHandling')
        const portfolioNodes = this.$store.getters.linkmapNodes
        this.mapData = {
          links: response.data.links,
          nodes: response.data.nodes,
          portfolioNodes
        }
        this.mapData.nodes.forEach(node => {
          let matchedNode = portfolioNodes.find(n => n.id === node.id)
          if (!matchedNode) {
            matchedNode = portfolioNodes.find(n => n.id === 'www.' + node.id)
          }
          if (matchedNode) {
            node.type = matchedNode.type
            node.isGIndex = matchedNode.isGIndex
          } else {
            node.type = 'ext'
          }
          node.name = node.id
        })
        console.log('linkmap.vue getData responseHandling took')
        console.timeEnd('linkmap.vue_getData_responseHandling')
      })
      .catch(err => {
        console.error('error loading from ' + url, err)
      })
    },
    /**
     * Apply the filters form the sidebar
     * @method applyFilters
     * @erturn void
     */
    applyFilters () {
      const payload = {
      }
      this.$http.post('/path/to/resource', {
        body: payload
      })
    }
  }
}
</script>
<style>
.drawer-header
{
  font-size: 20px;
  background: #F13D66;
  line-height: 64px;
  color: #fff;
  margin: 0;
  font-weight: 500;
}

.drawer-header .icon
{
  color: #fff;
  font-size: 32px;
  margin: 0 10px 0 18px;
}

.expansion-panel__container.expansion-panel__container--active .expansion-panel__header
{
  background: #383B40;
  font-weight: bold;
}

.expansion-panel__container.expansion-panel__container--active .material-icons.icon,
.expansion-panel__container.expansion-panel__container--active .expansion-panel__header
{
  color: #fff;
}

.expansion-panel__header
{
  cursor: pointer;
  transition: background .2s ease-in-out;
}

.cm-switcher-row
{
  display: table;
  width: 100%;
}

.cm-switcher-row > *
{
  display: table-row;
}

.cm-switcher-row > * > *
{
  display: table-cell;
  vertical-align: middle;
}

.cm-switcher-row > * > *:nth-child(2)
{
  width: 36px;
  text-align: right;
}

.label-sm,
.label-md
{
  font-size: 13px;
  color: rgba(1, 1, 1, .54);
}

.label-md
{
  color: #010101;
  margin: 12px 0;
}

.expansion-header *
{
  display: inline-block;
  vertical-align: middle;
}

.expansion-header span
{
  margin-left: 16px;
}

.square-chips .chip
{
  border-radius: 0;
  font-size: 11px;
}

.square-chips .chip .icon
{
  font-size: 16px;
}

.linkmap-container
{
  transition: all .25s ease-in-out;
  width: 100%;
}

.linkmap-container-expanded
{
  margin-left: 246px;
}
</style>