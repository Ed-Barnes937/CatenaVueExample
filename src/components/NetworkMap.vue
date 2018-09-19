<template>
  <v-dialog v-model="open" :class="['linkmaps-viewer-dialog']" fullscreen transition="dialog-bottom-transition" :overlay="false">
    <v-navigation-drawer right temporary v-model="details">
      <v-toolbar dark color="catena">
        <v-btn icon dark @click.native="details = !details">
          <v-icon>chevron_right</v-icon>
        </v-btn>
        <v-toolbar-title v-html="this.getLangKey('domainDetailsTitle')" />
        <v-spacer />
      </v-toolbar>
      <v-list :class="['domain-details-list']">
        <v-list-tile v-for="(value, key) in domainData.whois" :key="key">
          <h6>{{ key | camelCaseToTitle }}:</h6>
          <p v-html="value" />
        </v-list-tile>
        <v-list-tile>
          <h6>Google Index:</h6>
          <p class="label-green" :class="{'label-red': !domainData.googleIndex}">{{ domainData.googleIndex ? 'indexed' : 'not indexed' }}</p>
        </v-list-tile>
        <v-list-tile>
          <h6>IP Addresses:</h6>
          <p>{{ domainData.ipAddresses.join(', ') }}</p>
        </v-list-tile>
        <v-list-tile>
          <h6>Nameservers:</h6>
          <p>{{ domainData.nameServers.join(', ') }}</p>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer width="340" persistent :class="['elevation-12']" enable-resize-watchernetwork-map v-model="drawer">
      <v-toolbar dark color="catena">
        <v-toolbar-title v-html="this.getLangKey('filtersAndToolsTitle')" />
        <v-spacer />
        <v-btn icon dark @click.native="drawer = !drawer">
          <v-icon>chevron_left</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list :class="['network-map-filters-list']">
        <v-list-tile hidden>
          <v-select
            disabled
            style="z-index: 300"
            label="Top Level Domain"
            :items="topLevelDomains"
            :color="inputColor"
            v-model="selectedTld"
            autocomplete />
        </v-list-tile>
        <v-list-tile hidden>
          <v-select
            disabled
            style="z-index: 300"
            @input="renderDomainsDropdown"
            label="Site Type"
            :color="inputColor"
            :items="lookUpTypes"
            v-model="selectedLookupType"
            autocomplete />
        </v-list-tile>
        <v-list-tile hidden>
          <v-select
            style="z-index: 300"
            :color="inputColor"
            disabled
            label="Domain(s)"
            :items="domains"
            v-model="selectedDomains[0]"
            @input="generateDiagram"
            autocomplete />
        </v-list-tile>
        <v-list-tile>
          <v-btn @click="saveDiagram('.svg-viewer', 'linkmap-' + title + '-' + new Date() +'.png', 1)">
            <v-icon>collections</v-icon>
          </v-btn>
          <v-btn @click="exportToCsv()">
            <v-icon>grid_on</v-icon>
          </v-btn>
        </v-list-tile>
      </v-list>
      <v-list :class="['network-map-filters-list']">
        <v-list-tile v-if="graphType === 'network'">
          <v-checkbox :color="inputColor" label="Straight Lines" v-model="straightGraphs" light />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'network'">
          <v-checkbox :color="inputColor" label="Show Domain Names" v-model="nodeShowDomainNames" light />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'network' && graphData.nodes.find(n => n.type === 'ms')">
          <v-checkbox :color="inputColor" label="Money Sites" v-model="nodeShowDomainNamesMoney" light />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'network' && graphData.nodes.find(n => n.type === 'ls')">
          <v-checkbox :color="inputColor" label="Link Sites" v-model="nodeShowDomainNamesLink" light />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'network' && graphData.nodes.find(n => n.type === 'ext')">
          <v-checkbox :color="inputColor" label="External Domains" v-model="nodeShowDomainNamesExternal" light />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'network' && $globalData.data.googleIndex.items.length">
          <v-checkbox :color="inputColor" label="Mark Indexed" v-model="nodeShowGindex" light />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'network'">
          <v-checkbox :color="inputColor" label="Mark Multi-Linking LS" v-model="nodeShowMultiLinkingLS" light />
        </v-list-tile>
        <v-list-tile v-if="toggleDomainsDropdownData.length">
          <v-select
            style="z-index: 300"
            :class="['domains-filter']"
            :color="inputColor"
            :items="toggleDomainsDropdownData"
            v-model="toggledDomainsForDomainsDropdown"
            multiple
            multiLine
            max-height="400"
            @input="filterDomains"
            label="Domains Filter"
            autocomplete />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'network'">
          <v-slider
            label="Node Repel Force"
            :class="['force-slider']"
            :color="inputColor"
            thumb-label
            min="1"
            step="0.5"
            max="100"
            ticks="true"
            v-model="force" />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'network'">
          <v-slider
            label="Node Radius"
            :class="['force-slider']"
            :color="inputColor"
            thumb-label
            min="1"
            step="1"
            max="10"
            ticks="true"
            v-model="radius" />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'network'">
          <v-slider
            label="Network Radial"
            :class="['force-slider']"
            :color="inputColor"
            thumb-label
            min="0"
            step="1"
            max="10"
            ticks="true"
            v-model="radial" />
        </v-list-tile>
        <v-list-tile>
          <v-slider
            label="Rotate"
            :class="['force-slider']"
            :color="inputColor"
            thumb-label
            min="0"
            step="1"
            max="360"
            ticks="true"
            v-model="svgRotation" />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'chord'">
          <v-slider
            label="Radius"
            :class="['force-slider']"
            :color="inputColor"
            thumb-label
            min="-200"
            step="10"
            max="200"
            ticks="true"
            v-model="chordRadius" />
        </v-list-tile>
        <v-list-tile v-if="graphType === 'chord'">
          <v-btn-toggle v-model="chordSpreadMoneySites">
            <v-btn value="SpreadEvenly">Spread Money Sites</v-btn>
            <v-btn value="SortLinksAsc"  v-if="chordSpreadMoneySites !== 'SortLinkAsc'">Sort by # Links</v-btn>
          </v-btn-toggle>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-card>
      <v-toolbar dark color="catena" fixed network-map>
        <v-toolbar-side-icon @click.stop="drawer = !drawer">
          <v-icon>settings</v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title>Linkmaps | {{ title }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click.native="closePopup">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-content :class="['linkmaps-viewer']">
        <svg :class="['svg-viewer']"></svg>
        <network-map-legend :map="graphData" />
        <catena-context-menu :items="nodeContextMenuItems" ref="context-menu" />
      </v-content>
    </v-card>
    <v-dialog v-model="noData">
      <v-card>
        <v-card-title :class="['headline', 'text-xs-left']" v-html="getLangKey('noDataForDomainTitle')" />
        <v-card-text :class="['text-xs-left']" v-html="getLangKey('noDataForDomainText')" />
        <v-card-actions>
          <v-spacer />
          <v-btn raised @click.native="noData = false" v-html="getLangKey('close')" />
        </v-card-actions>
      </v-card>
    </v-dialog>
    <tabular-data-popup />
  </v-dialog>
</template>
<script>
import methods from '../helpers/methods'
// temp out of use to test deployment
import 'd3-selection-multi'
import * as sankey from 'd3-sankey'
import * as d3ScaleChromatic from 'd3-scale-chromatic'
import * as pathArrows from 'd3-path-arrows'
// import * as sankey from '../helpers/d3/sankey'
import filters from '../helpers/filters'
import styling from '../helpers/networkStyling'
import NetworkMapLegend from '../components/NetworkMapLegend.vue'
import TabularDataPopup from '../components/TabularDataPopup.vue'
import url from 'url'
import parseDomain from 'parse-domain'
import punycode from 'punycode'

var __originalGraphData = {}

export default {
  name: 'NetworkMap',
  props: ['tld'],
  mixins: [
    methods
  ],
  components: {
    NetworkMapLegend,
    TabularDataPopup
  },
  data () {
    return {
      inputColor: this.$store.state.cssClasses.inputColor,
      graphData: {nodes: [], links: []},
      linkForceConfig: [
        { source: 'ms', target: 'ms', distance: 80, strength: 0.9 },
        { source: 'ms', target: 'ls', distance: 120, strength: 0.8 },
        { source: 'ms', target: 'ext', distance: 140, strength: 0.5 },
        { source: 'ls', target: 'ms', distance: 80, strength: 0.8 },
        { source: 'ls', target: 'ls', distance: 140, strength: 0.7 },
        { source: 'ls', target: 'ext', distance: 180, strength: 0.5 },
        { source: 'ext', target: 'ms', distance: 120, strength: 0.7 },
        { source: 'ext', target: 'ls', distance: 140, strength: 0.5 },
        { source: 'ext', target: 'ext', distance: 160, strength: 0.4 } ],
      opacityDefault: 0.67,
      chordRotation: 0,
      chordRadius: 140,
      chordSpreadMoneySites: 'SortLinksAsc',
      defaultLinksSiteColour: 'black',
      svgRotation: 0,
      nodeContextMenuItems: [{
        title: this.getLangKey('openSite'),
        event: this.$store.getters.events.openSite
      }, {
        title: this.getLangKey('downloadCsv'),
        event: this.$store.getters.events.downloadSiteCsv
      }],
      toggleDomainsDropdownData: [],
      toggledDomainsForDomainsDropdown: [],
      nodeSizeScale: this.$d3.scaleLog(),
      linkWidthScale: this.$d3.scaleLog(),
      linkStrengthScale: this.$d3.scaleLog(),
      linkDistanceScale: this.$d3.scaleLog(),
      topLevelDomains: [],
      noData: false,
      details: false,
      // popup title
      title: '',
      // toggle the popup
      open: false,
      // toggle the popup "filters" drawer
      drawer: true,
      events: this.$store.getters.events,
      // lookup types for the "type" drop-down in the "filters" drawer
      lookUpTypes: [{
        value: 'moneySite',
        text: 'Money site'
      }, {
        value: 'linkSite',
        text: 'Link site'
      }],
      // the currently selected "type" in the "filters" drawer
      selectedLookupType: '',
      // the currently selected top level domain in the "filters" drawer
      selectedTld: '',
      // the currently selected domains in the "filters" drawer
      selectedDomains: [],
      // data for the "select domain" drop-down, filtered via the selectedLookupType prop
      domains: [],
      // map for the "types" extracted from the ajax calls
      types: {},
      // map for the available top level domains extracted from the ajax calls
      tlds: [],
      graphTypes: [ 'network' /* , 'sankey' */, 'chord' ],
      graphType: 'network', // 'network', 'sankey', 'chord'
      hiddenNodes: [],
      // default diagram size ("force")
      force: 25, // 30,
      forceCollide: 2,
      nodeSizeFactor: 7.5,
      radial: 2, // 1, // 7,
      radius: 2, // 5,
      straightGraphs: true,
      nodeShowOnline: true,
      nodeShowGindex: false,
      nodeShowMultiLinkingLS: false,
      nodeShowDomainNames: true,
      nodeShowDomainNamesMoney: true,
      nodeShowDomainNamesLink: true,
      nodeShowDomainNamesExternal: true,
      showAllDomainNames: true,
      showMSNames: true,
      showLSNames: true,
      showExtNames: true,
      domainData: {
        ipAddresses: [],
        nameServers: []
      },
      nodeMsStyle: 'background-color: ' + styling.nodeColor.moneySite,
      linkMsToMsStyle: 'background-color:' + styling.linkColor.ms2ms,
      linkMsToLsStyle: 'background-color:' + styling.linkColor.ms2ls,
      linkMsToExtStyle: 'background-color:' + styling.linkColor.ms2ext,
      linkMsIntStyle: 'background-color:' + styling.linkColor.ms2int,
      nodeLsStyle: 'background-color: ' + styling.nodeColor.linkSite,
      linkLsToMsStyle: 'background-color:' + styling.linkColor.ls2ms,
      linkLsToLsStyle: 'background-color:' + styling.linkColor.ls2ls,
      linkLsToExtStyle: 'background-color:' + styling.linkColor.ls2ext,
      linkLsIntStyle: 'background-color:' + styling.linkColor.ls2int
    }
  },
  computed: {
    options () {
      return {
      }
    }
  },
  created () {
    this.$d3.scaleChromatic = d3ScaleChromatic
    this.$d3.sankey = sankey
    this.$root.$on(this.events.showNetworkMap, (data) => {
      const globalData = this.$globalData.data
      this.open = true
      this.topLevelDomains = Object.keys(globalData.domainsSummary.tlds).sort()
      this.selectedTld = data.tld
      this.selectedLookupType = data.lookUpType
      this.selectedDomains = data.domains.split(',')
    })
  },
  mounted () {
    if (!this.createdGraph) {
      __originalGraphData = Object.assign({}, this.graphData)
      this.createdGraph = true
      this.createGraph()
    }
  },
  watch: {
    straightGraphs () {
      this.simSetupForces()
    },
    nodeShowDomainNames () {
      this.nodeShowDomainNamesMoney = this.nodeShowDomainNames
      this.nodeShowDomainNamesLink = this.nodeShowDomainNames
      this.nodeShowDomainNamesExternal = this.nodeShowDomainNames
    },
    nodeShowDomainNamesMoney () {
      this.toggleLabelVisibility('ms', !this.nodeShowDomainNamesMoney)
    },
    nodeShowDomainNamesLink () {
      this.toggleLabelVisibility('ls', !this.nodeShowDomainNamesLink)
    },
    nodeShowDomainNamesExternal () {
      this.toggleLabelVisibility('ext', !this.nodeShowDomainNamesExternal)
    },
    nodeShowOnline () {
      this.__nodes.classed('online', d => this.nodeShowOnline && d.isOnline)
      this.__nodes.classed('offline', d => this.nodeShowOnline && !d.isOnline)
    },
    nodeShowGindex () {
      this.updateNodeGIndex()
    },
    nodeShowMultiLinkingLS () {
      this.updateMultiLinkingLS()
    },
    graphType () {
      if (this.__prevGraphType === 'network' && this.simulation) this.simulation.stop()
      this.$d3.select('svg').selectAll('g').data([]).exit().remove()
      this.graphData = Object.assign({}, __originalGraphData)
      this.createGraph()
      this.updateGraph()
    },
    chordSpreadMoneySites () {
      this.repaintGraphChord()
    },
    chordRadius () {
      this.repaintGraphChord()
    },
    svgRotation () {
      let me = this
      this.__lastRotation = ` rotate(${this.svgRotation})`
      var transform = ''
      if (this.__lastTransform) {
        transform = `translate(${this.__lastTransform.x}, ${this.__lastTransform.y}) scale(${this.__lastTransform.k})`
      }
      this.__svg.select('g').attr('transform', transform + me.__lastRotation)
      this.__labels.attr('transform', d => `translate(${d.x}, ${d.y}) rotate(-${me.svgRotation})`)
      this.__nodes.attr('transform', d => `translate(${d.x}, ${d.y}) rotate(-${me.svgRotation})`)
    },
    force () {
      this.simSetupForces()
    },
    radial () {
      this.simSetupForces()
    },
    radius () {
      this.simSetupForces()
    },
    domainData () {
      setTimeout(() => {
        this.details = true
      }, 0)
    }
  },
  methods: {
    toggleLabelVisibility (type, value) {
      this.__labels.filter(l => l.type === type && !l.hiding).classed('hiding', value)
    },
    updateMultiLinkingLS () {
      let me = this
      let conf = [ { min: 2, to: 'ms', from: 'ls' } ]
      if (me.nodeShowMultiLinkingLS) {
        conf.forEach(c => {
          const nodes = me.__svg.selectAll('g.nodes g.node')._groups[0]
          nodes.forEach((node) => {
            let selector = '.link[_type="' + c.from + '-' + c.to + '"]'
            let selection = me.__svg.selectAll(selector)
            .filter(l => { return l.source.id === node.id })
            if (selection.size() >= c.min) {
              selection.attr('data-isMultilink', true)
              selection.style('stroke-dasharray', '3px 3px 3px')
              selection.style('stroke', me.$d3.color(selection.style('stroke')).darker())
            }
          })
        })
      } else {
        me.__svg.selectAll('.link[data-isMultiLink=true]')
          .attr('data-isMultilink', false)
          .style('stroke-dasharray', 'none')
          .style('stroke', (d, i, nodes) => me.$d3.color(me.$d3.select(nodes[i]).style('stroke')).brighter())
      }
    },
    updateNodeGIndex () {
      this.$d3.selectAll('image.gindex').style('visibility', d => d.hiding ? null : (this.nodeShowGindex ? 'visible' : 'hidden'))
      this.renderLegend()
    },
    renderLegend () {
      let me = this
      me.graphData.showDecorations = me.nodeShowGindex ? ['googleindex'] : []
      setTimeout(function () { me.$root.$emit(me.events.renderLegend, me.graphData) }, 300)
    },
    /**
     * Open a domain from the context menu
     * @method openSite
     * @param {Object} node
     * @return void
     * **/
    renderTabularDataPopup (node) {
      const nodeData = node.data
      const columns = []
      const items = []
      let domains
      let searchIn
      nodeData.name = node.name
      nodeData.type = node.type
      nodeData.tld = node.tld
      switch (nodeData.type) {
        case 'ls':
          domains = this.$globalData.data.allLSLinks[node.name]
          searchIn = 'text'
          if (!domains) {
            alert('Oops! This type of lookup is not implemented yet... Try a money site or a link site with from links.')
            return
          }
          Object.keys(domains).forEach((domain) => {
            const domainsLinks = domains[domain].links
            Object.keys(domainsLinks).forEach(linkEntries => {
              domainsLinks[linkEntries].forEach(entry => {
                items.push({
                  from: `${domain}${entry.f}`,
                  to: `${node.name}${linkEntries}`,
                  text: entry.t
                })
              })
            })
          })
          break
        case 'ms':
          domains = this.$globalData.data.tlds[nodeData.tld].domains
          Object.keys(domains).forEach((domain) => {
            const links = domains[domain].links
            const match = links.toMoneySites[node.name]
            searchIn = 'text'
            if (match) {
              const pages = links.p
              Object.keys(pages).forEach(page => {
                if (pages[page].l.ms.length) {
                  pages[page].l.ms.forEach((l) => {
                    if (l.to.includes(node.name)) {
                      items.push(l)
                    }
                  })
                }
              })
            }
          })
          break
      }
      if (!items.length) {
        return
      }
      Object.keys(items[0]).forEach(key => {
        columns.push({
          text: key === 'text' ? this.getLangKey('anchorText') : key,
          value: key,
          align: 'left'
        })
      })
      this.$root.$emit(this.events.showTabularDataPopup, {
        items,
        columns,
        domain: node.name,
        searchIn
      })
    },
    simSetupForces () {
      var sim = this.simulation
      if (sim && this.networkDataSet) {
        sim.stop()
        let d3 = this.$d3
        let [width, height] = this.getSvgSize()
        sim.force('center', null)
        sim.force('center', d3.forceCenter(width / 2, height / 2))
        sim.force('charge', null)
        sim.force('charge', d3.forceManyBody()
          .strength(this.simForceChargeStrength)
          .distanceMin(1) // 1 is default
          .distanceMax(350)) // infinity is default
          // .theta(0.633))
        sim.force('radial', null)
        if (this.radial > 0) {
          sim.force('radial', d3.forceRadial()
            .radius(d => (d.type === 'ms' ? 15 : (d.type === 'ls' ? 35 : 50)) * this.radial)
            .strength(this.radial / 10))
        }
        sim.force('link', null)
        sim.force('link', d3.forceLink()
          .id(d => d.id)
          .distance(this.simForceLinkDistance)
          .strength(this.simForceLinkStrength))
        sim.force('collide', null)
        sim.force('collide', d3.forceCollide()
          .strength(0.7) // default 0.7
          .radius(this.simForceCollideRadius))
        sim.force('link').links(this.graphData.links)
        sim.alpha(0.3).restart()
      }
    },
    simForceCollideRadius (d) {
      var radiusStrength = this.radius * d._size
      return radiusStrength
    },
    simForceLinkDistance (d) {
      let linkDistance = 222
      let config = this.linkForceConfig.find(c => c.source === d.source.type && c.target === d.target.type)
      if (config) {
        linkDistance = config.distance
      }
      return linkDistance
    },
    simForceLinkStrength (d) {
      let strength = 1
      let config = this.linkForceConfig.find(c => c.source === d.source.type && c.target === d.target.type)
      if (config) {
        strength = config.strength
      }
      return strength
    },
    simForceChargeStrength (d) {
      let chargeStrength = -this.force * d._force
      if (d.type === 'ms') {
        chargeStrength *= d._size * 4 // * d._size
      } else if (d.type === 'ls') {
        chargeStrength *= d._size * 3
      } else { /* ext site */
        chargeStrength *= d._size * 2
      }
      return chargeStrength
    },
    updateGraphNetwork () {
      var me = this
      var d3 = this.$d3
      var simulation = me.simulation
      if (!me.simulation) return // bye for now
      simulation.stop()
      me.__links = me.__links.data(this.graphData.links)
      me.__links.exit().remove()
      me.__links = me.__links.enter().append('path')
          .attr('stroke', linkColor)
          .attr('id', d => d.source + ':::' + d.target)
          .attr('_type', d => d._type)
          .attr('stroke-width', d => Math.max(0.75, d.width))
          .attr('class', function (d) { return 'link marker' })
          .attr('marker-end', function (d) { return 'url(#marker)' })
          .on('mouseover', mouseOverLink)
          .on('mouseout', mouseOutLink)
          .merge(this.__links)
      me.__links.append('title').text(d => d.value + ' from ' + d.source + ' to ' + d.target) // + '\n' + JSON.stringify(d))

      me.__nodes = me.__nodes.data(this.graphData.nodes, d => d.id)
      me.__nodes.exit().remove()
      var enterSelection = me.__nodes.enter()
      me.__nodes = enterSelection
            .append('g')
              .attr('class', 'node')
              .attr('id', d => d.id)
              .attr('class', nodeClass)

      function nodeShapeSymbolType (d) {
        return d.type === 'ms' ? d3.symbolStar : (d.type === 'ls' ? d3.symbolSquare : d3.symbolCircle)
      }
      function nodeShapeSymbolSize (d) {
        return (d.type === 'ms' ? d._size * d._size : Math.PI * d._size * d._size) // (d.type === 'ls' ? d3.symbolSquare : d3.symbolStar)
      }
      me.__nodes.append('path')
            .attr('id', d => d.id)
            .attr('class', nodeClass)
            .attr('d', d3.symbol()
              .type(d => nodeShapeSymbolType(d))
              .size(d => nodeShapeSymbolSize(d)))
            .attr('fill', nodeColor)
            .on('click', click)
            .on('dblclick', doubleClick)
            .on('mouseover', mouseOverNode)
            .on('mouseout', mouseOutNode)
            .on('contextmenu', this.contextMenu)
            .call(d3.drag()
              .on('start', dragstarted)
              .on('drag', dragged)
              .on('end', dragended))
      me.__nodes.insert('svg:image')
            .attr('class', 'gindex')
            .attr('href', d => d.isGIndex ? this.$globalData.appPathRoot + '/static/icons/google.png' : this.$globalData.appPathRoot + '/static/icons/nogoogle.png')
      me.__nodes.insert('title').text(d => d.id) // { let e = Object.assign({}, d); delete e.data; return JSON.stringify(e, null, 2) })

      me.__labels = me.__labels.data(this.graphData.nodes, d => d.id)
      me.__labels.exit().remove()
      let labelEnter = me.__labels.enter()
      me.__labels = labelEnter.append('g')
          .attr('class', 'label')
      me.__labels.append('text')
          .attr('class', 'label')
          .attr('dx', 12)
          .attr('dy', '.35em')
          .text(d => punycode.toUnicode(d.name))
          .merge(me.__labels)

      simulation
        .nodes(this.graphData.nodes)
        .on('tick', ticked)
      this.simSetupForces()  // sets the forces and links on the sim
      this.renderLegend()
      this.updateNodeGIndex()
      this.updateMultiLinkingLS()
      this.networkDataSet = true

      function linkColor (d) {
        let color = me._colorLink(d.source, d.target)
        d._color = color // so legend can pick up
        return color
      }
      function nodeColor (d) {
        let color = me._colorNode(d.id)
        d._color = color // so legend can pick up
        return color
      }
      function nodeClass (d) {
        let classNames = 'node ' + (d.type || 'domain')
        return classNames
      }
      function drawLink (d, straightGraphs) {
        var source = d.source
        var target = d.target
        var sourceX = source.x
        var sourceY = source.y
        var targetX = target.x
        var targetY = target.y

        var theta = Math.atan((targetX - sourceX) / (targetY - sourceY))
        var phi = Math.atan((targetY - sourceY) / (targetX - sourceX))
        var sinTheta = source._size * Math.sin(theta)
        var cosTheta = source._size * Math.cos(theta)
        var sinPhi = target._size * Math.sin(phi)
        var cosPhi = target._size * Math.cos(phi)
        if (target.y > source.y) {
          sourceX = sourceX + sinTheta
          sourceY = sourceY + cosTheta
        } else {
          sourceX = sourceX - sinTheta
          sourceY = sourceY - cosTheta
        }
        if (source.x > target.x) {
          targetX = targetX + cosPhi
          targetY = targetY + sinPhi
        } else {
          targetX = targetX - cosPhi
          targetY = targetY - sinPhi
        }
        if (straightGraphs) {
          return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY
        } else {
        // Draw an arc between the two calculated points
          var dx = targetX - sourceX
          var dy = targetY - sourceY
          var dr = Math.sqrt(dx * dx + dy * dy)
          var s = 'M' + sourceX + ',' + sourceY + 'A' + dr + ',' + dr + ' 0 0,1 ' + targetX + ',' + targetY
          // if (s.indexOf('NaN') !== -1) debugger
          return s
        }
      }
      function mouseOverLink (link) {
        let nodes = []
        d3.selectAll('g.links path').styles({
          stroke: d => {
            if (d.index === link.index) {
              nodes.push(d.target.id)
              nodes.push(d.source.id)
            }
            return (d.index === link.index) ? d._color : 'grey'
          },
          opacity: d => (d.index === link.index) ? 1 : 0.2
        })
        nodes = [...new Set(nodes)]
        d3.selectAll('g.nodes g').styles({opacity: d => nodes.includes(d.id) ? 1 : 0.2})
        d3.selectAll('g.labels text').styles({opacity: d => nodes.includes(d.id) ? 1 : 0.2})
      }
      function mouseOverNode (node) {
        let nodes = [ node.id ]
        d3.selectAll('g.links path').styles({
          stroke: function (d) {
            if (d.source.id === node.id) {
              nodes.push(d.target.id)
            } else if (d.target.id === node.id) {
              nodes.push(d.source.id)
            }
            return (d.source === node || d.target === node) ? d._color : 'grey'
          },
          opacity: d => (d && (d.source.id === node.id || d.target.id === node.id)) ? 1 : 0.2
        })
        nodes = [...new Set(nodes)]
        d3.selectAll('g.nodes g').styles({opacity: d => nodes.includes(d.id) ? 1 : 0.2})
        d3.selectAll('g.labels text').styles({opacity: d => nodes.includes(d.id) ? 1 : 0.2})
      }
      function mouseOutLink (link) {
        d3.selectAll('g.links path').styles({
          stroke: d => d._color,
          opacity: me.opacityDefault
        })
        d3.selectAll('g.nodes g').styles({ opacity: 1 })
        d3.selectAll('g.labels text').styles({ opacity: 1 })
      }
      function mouseOutNode (node) {
        d3.selectAll('g.links path').styles({
          stroke: d => d ? d._color : 'black',
          opacity: d => me.opacityDefault
        })
        d3.selectAll('g.nodes g').styles({ opacity: 1 })
        d3.selectAll('g.labels text').styles({ opacity: 1 })
      }
      function click (node) {
        d3.select(this).transition()
        .duration(500)
        .attr('r', 1.3 * (node._size || 10))
        .style('fill', 'lightsteelblue').transition()
        .duration(500)
        .attr('r', node._size || 10)
        .style('fill', node._color)
        node.pinned = !node.pinned
        d3.select(this).classed('pinned', node.pinned)
        const nodeData = node.data
        if (nodeData) {
          const type = nodeData.type
          // we will keep using a switch until we realize is it needed or now
          switch (type) {
            case 'moneySite':
            case 'linkSite':
            case 'allLSLinks':
            case 'allMSLinks':
            case 'nested-node':
              me.getDomainWhoisData(node)
              break
          }
        }
      }
      function doubleClick (node) {
        d3.event.stopPropagation()
        me.renderTabularDataPopup(node)
      }
      function ticked () {
        let straightGraphs = me.straightGraphs
        me.__links.attr('d', d => drawLink(d, straightGraphs))
        me.__nodes.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ') rotate(' + -me.svgRotation + ')' })
        me.__labels.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ') rotate(' + -me.svgRotation + ')' })
      }
      function dragstarted (d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      }
      function dragged (d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
      }
      function dragended (d) {
        if (!d3.event.active) simulation.alphaTarget(0)
        if (!d.pinned) {
          d.fx = null
          d.fy = null
        }
      }
    },
    getSvgSize () {
      let modWidth = document.documentElement.clientWidth // * 3
      let modHeight = (document.documentElement.clientHeight - 64 - 8) // * 5
      let result = [ modWidth, modHeight ]
      return result
    },
    createGraph () {
      this.svgRotation = 0
      this._createSVG()
      switch (this.graphType) {
        case 'sankey': this.createGraphSankey(); break
        case 'chord': this.createGraphChord(); break
        case 'network': this.createGraphNetwork(); break
        default: alert('Thats a no no, visualization ' + this.graphType)
      }
      this.__prevGraphType = this.graphType
    },
    updateGraph () {
      switch (this.graphType) {
        case 'sankey': this.updateGraphSankey(); break
        case 'chord': this.updateGraphChord(); break
        default: this.updateGraphNetwork()
      }
      this.__prevGraphType = this.graphType
    },
    _createRootGroupTransform (svg, zoomScaleExtent, rootGroup, initialTransform) {
      if (zoomScaleExtent === null) zoomScaleExtent = [0.1, 10]
      let me = this
      let d3 = this.$d3
      svg.call(
        this.$d3.zoom()
          .scaleExtent(zoomScaleExtent)
          .on('zoom', function () {
            rootGroup.attr('transform', d3.event.transform /* + (me.__lastTranslate || '') */ + (me.__lastRotation || ''))
            me.__lastTransform = d3.event.transform
          })
      )
      if (initialTransform) {
        rootGroup.attr('transform', initialTransform)
      }
    },
    _createSVG () {
      let [width, height] = this.getSvgSize()
      this.__svg = this.$d3.select('svg').attrs({width, height})
    },
    createGraphChord () {
      this.__rootGroup = this.__svg.append('g').attr('transform', this.__lastTranslate)
      this.__group = this.__rootGroup.append('g').attr('class', 'groups')
      this.__ribbons = this.__rootGroup.append('g').attr('class', 'ribbons')
      this._createRootGroupTransform(this.__svg, null, this.__rootGroup, this.$globalData.svgIntialTransform) // 2nd arg null = use default zoomExtent
    },
    buildMatrix (data) {
      data.nodes.forEach(n => {
        if (!n) return
        n.children = []
        const randomNumberOfPages = Math.floor(Math.random() * 5)
        for (var i = 0; i < randomNumberOfPages; i++) {
          var randomUrlLength = Math.floor(Math.random() * 3)
          var url = '/someUrl/' + i
          for (var j = 0; j < randomUrlLength; j++) {
            url += '/someUrl/' + i
          }
          n.children.push({ id: url })
        }
      })
      // reposition moneysites
      if (this.chordSpreadMoneySites === 'SpreadEvenly') {
        if (!this.__originalNodes) this.__originalNodes = data.nodes.slice(0) // clones array
        if (!this.__originalLinks) this.__originalLinks = data.links.slice(0) // clones array
        var lss = data.nodes.filter(n => n && n.type !== 'ms')
        var mss = data.nodes.filter(n => n && n.type === 'ms')
        var dataNodesIds = data.nodes.map(n => n && n.id)
        mss.forEach(ms => { var index = dataNodesIds.indexOf(ms.id); console.log('removing ' + ms.id + ' on index ' + index); data.nodes.splice(index, 1); dataNodesIds = data.nodes.map(n => n && n.id) })
        var period = Math.floor(lss.length / mss.length)
        mss.forEach((ms, i) => { console.log('inserting ' + mss[i].id + ' on index ' + (i * period)); data.nodes.splice(i * period, 0, mss[i]) })
      } else {
        if (this.__originalNodes) data.nodes = this.__originalNodes.slice(0)
        if (this.__originalLinks) data.links = this.__originalLinks.slice(0)
      }

      var matrix = []
      data.nodes.forEach(function (sourceNode) {
        var row = []
        data.nodes.forEach(function (targetNode) {
          var cell = 0
          if (sourceNode === null || targetNode === null) {

          } else {
            var links = data.links.filter(l => l && l.source === sourceNode.id && l.target === targetNode.id)
            // console.log('find ' + links.length + ' links from ' + sourceNode.id + ' to ' + targetNode.id)
            links.forEach(function (link) {
              cell += link.value
            })
          }
          row.push(cell)
        })
        matrix.push(row)
      })
      console.log('returning matrix', matrix)
      return matrix
    },
    __getPageLevelData (d, i) {
      if (this._prePageLevelData) {
        this.graphData = Object.assign({}, this._prePageLevelData)
        this._prePageLevelData = null
        return
      } else {
        this._prePageLevelData = Object.assign({}, this.graphData)
      }
      let cNodes = this.graphData.nodes // current nodes
      let node = cNodes[i]
      let nNodes = [ node ] // new nodes
      let cLinks = this.graphData.links // current links
      let nLinks = [] // new nodes
      console.log('__getPageLevelData', {d, i, node})
      let linksFromAndToSelectedNode = cLinks.filter(l =>
        (l.source.id ? l.source.id === node.id : l.source === node.id) ||
        (l.target.id ? l.target.id === node.id : l.target === node.id))
      let newDomainNodes = []
      linksFromAndToSelectedNode.forEach(l => {
        var sourceNode = cNodes.find(n => n.id === l.source)
        if (!newDomainNodes.find(n => n.id === sourceNode.id)) newDomainNodes.push(sourceNode)
        var targetNode = cNodes.find(n => n.id === l.target)
        if (!newDomainNodes.find(n => n.id === targetNode.id)) newDomainNodes.push(targetNode)
      })
      var tlds = this.tld.tlds
      newDomainNodes.forEach(domain => {
        var tld = tlds[domain.tld]
        if (!tld) {
          console.error('did not find data for tld', domain.tld)
          return
        }
        var linkSourceDomainData = tld.domains[domain.name]
        var linksToTargetPages = _findTargetPages(linkSourceDomainData, node)
        console.log('linksToTargetPages for ' + domain.id, linksToTargetPages)
        var pages = {}
        linksToTargetPages.forEach(link => {
          var linkTo = link.to
          var linkToPage = null
          var doubleSlashIdx = linkTo.indexOf('//')
          if (doubleSlashIdx > -1) {
            var nextSlashIdx = linkTo.indexOf('/', doubleSlashIdx + 2)
            if (nextSlashIdx > -1) {
              linkToPage = linkTo.substr(nextSlashIdx)
              console.log(linkTo, linkToPage)
            } else {
              linkToPage = '/'
            }
          }
          if (linkToPage !== null) {
            pages[linkToPage] = pages[linkToPage] || []
            pages[linkToPage].push(link)
          }
        })
        Object.keys(pages).forEach(pageUrl => {
          var pageNode = {
            id: domain.id + pageUrl,
            domain: domain.id,
            name: pageUrl,
            _type: 'page',
            _color: node._color, // passing the domain fill colour to the page nodes
            _size: 5,
            _force: -170
          }
          nNodes.push(pageNode)
        })
      })

      if (nNodes.length > 0) {
        for (let i = 0; i < 15; i++) {
          let source = nNodes[Math.floor(Math.random() * nNodes.length)].id
          let target = nNodes[Math.floor(Math.random() * nNodes.length)].id
          let value = Math.ceil(Math.random() * 10)
          nLinks.push({ source, target, value })
        }
        this.graphData.nodes = nNodes
        this.graphData.links = nLinks
        console.log('new nodes', nNodes)
        console.log('new links', nLinks)
      } else {
        alert('No page level data could be found for domain ' + node.id)
      }

      function _traverseLinks (linksObj, typeOfLinks, targetDomainName) {
        var relevantLinks = []
        Object.keys(linksObj).forEach(pageName => {
          relevantLinks = relevantLinks.concat(linksObj[pageName].l[typeOfLinks].filter(link => { var x = link.to.indexOf(targetDomainName) > -1; /** console.log(link.to, x); **/ return x }))
          relevantLinks.concat(_traverseLinks(linksObj[pageName].p, typeOfLinks, targetDomainName))
        })
        return relevantLinks
      }
      function _findTargetPages (sourceDomain, targetDomain) {
        var typeOfLinksToTraverse = targetDomain.type // targetDomain.isLinkSite ? 'ls' : (targetDomain.isMoneySite ? 'ms' : 'ext')
        var pages = _traverseLinks(sourceDomain.links.p, typeOfLinksToTraverse, targetDomain.name)
        return pages
      }
    },
    updateGraphChord () {
      var me = this
      var d3 = this.$d3
      var nodes = this.graphData.nodes
      var msIds = nodes.filter(n => n && n.type === 'ms').map(n => n.id)
      var names = nodes.map(n => n && n.id)
      var [height, width] = this.getSvgSize()
      var outerRadius = Math.min(width, height) * 0.5 - this.chordRadius
      var innerRadius = outerRadius - 10

      var matrix = this.buildMatrix(this.graphData)
      var chord = d3.chord().padAngle(0.05)
          .sortSubgroups(d3.descending) // sort the chords inside an arc from high to low
          .sortChords(d3.descending) // which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
      var chordMatrix = chord(matrix)
      var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)
      var ribbon = d3.ribbon().radius(innerRadius)
      var color = d3.scaleOrdinal(this.$d3.scaleChromatic.schemeSet1.concat(this.$d3.scaleChromatic.schemeSet2).concat(this.$d3.scaleChromatic.schemeSet3))

      var group = this.__rootGroup.selectAll('g.groups')
      group.datum(chordMatrix)
      var chords = group.selectAll('g').data(chords => { /** console.log('append g for chords.groups', chords.groups); **/ return chords.groups })
      chords.exit().remove()
      var chordsEnter = chords.enter().append('g')
        .on('mouseover', fade(0.1))
        .on('mouseout', fade(me.opacityDefault))
        .on('click', clickGroup())

      function clickGroup () {
        return function (d, i) {
          me.__getPageLevelData(d, i)
          let tmpGraphData = Object.assign({}, this.graphData)
          this.graphData = { nodes: [], links: [] }
          me.updateGraphChord()
          this.graphData = Object.assign({}, tmpGraphData)
          me.updateGraphChord()
        }
      }

      function fade (opacity) {
        return function (d, i) {
          ribbons.filter(d => { return d.source.index !== i && d.target.index !== i }).transition()
            .style('opacity', opacity)
        }
      }

      chordsEnter.append('path')
        .attr('id', (d, i) => 'group' + d.index)
        .attr('d', arc)
        .style('fill', (d, i) => me._prePageLevelData ? (msIds.includes(nodes[i].domain) ? me.defaultLinksSiteColour : color(nodes[i].domain)) : (msIds.includes(names[i]) ? color(d.index) : me.defaultLinksSiteColour))
        .style('stroke', (d, i) => d3.rgb(me._prePageLevelData ? (msIds.includes(nodes[i].domain) ? me.defaultLinksSiteColour : color(nodes[i].domain)) : (msIds.includes(names[i]) ? color(d.index) : me.defaultLinksSiteColour)).darker())

      chordsEnter.append('text')  // group.
        .attr('x', 2)
        .attr('dy', 8)
        .text((chords, i) => { /** console.log(i, chords); **/ return names[i] })
        .style('fill', (d, i) => { return me._prePageLevelData ? (msIds.includes(nodes[i].domain) ? me.defaultLinksSiteColour : color(nodes[i].domain)) : (msIds.includes(names[i]) ? color(d.index) : me.defaultLinksSiteColour) })
        .style('font-weight', (chords, i) => { return msIds.includes(names[i]) ? 900 : 400 })
        .attr('transform', d => 'rotate(' + (d.startAngle * 180 / Math.PI - 90) + ') translate(' + outerRadius + ',0)')

      chords = chords.merge(chordsEnter)

      function getRibbonTitle (d) {
        var sourceName = names[d.source.index]
        var sourceValue = d.source.value
        var targetName = names[d.target.index]
        var targetValue = d.target.value
        return sourceValue + ' : ' + sourceName + ' -> ' + targetName + '\n' + targetValue + ' : ' + targetName + ' -> ' + sourceName
      }
      var ribbonsGroup = this.__rootGroup.selectAll('g.ribbons')
      ribbonsGroup.datum(chordMatrix)
      var ribbons = ribbonsGroup.selectAll('path').data(d => d) // .data(chords => chords.groups)
      ribbons.exit().remove()
      ribbons = ribbons.enter().append('path')
          .attr('d', ribbon)
          .style('fill', d => color(d.target.index))
          .style('stroke', d => d3.rgb(color(d.target.index)).darker())
          .merge(ribbons)
      ribbons.append('title')
        .text(getRibbonTitle)
    },
    repaintGraphChord () {
      this.__rootGroup.selectAll('g.groups').selectAll('g').data([]).exit().remove()
      this.__rootGroup.selectAll('g.ribbons').selectAll('path').data([]).exit().remove()
      this.updateGraphChord()
    },
    createGraphSankey () {
      var rootGroup = this.__svg.append('g')
      this.__links = rootGroup.append('g').attr('class', 'links').selectAll('.link')
      this.__nodes = rootGroup.append('g').attr('class', 'nodes').selectAll('.node')
      this.__arrows = rootGroup.append('g').selectAll('.label')
      this._createRootGroupTransform(this.__svg, null, rootGroup, this.$globalData.svgIntialTransform) // 2nd arg null = use default zoomExtent
      let [height, width] = this.getSvgSize()
      this._sankey = this.$d3.sankey.sankey()
      this._sankey
        .nodeId(function (d) { return function (n) { return n.id === d } })
        .nodeWidth(36)
        .nodePadding(20)
        .size([width, height / 2])
    },
    updateGraphSankey () {
      var me = this
      var msIds = this.graphData.nodes.filter(n => n && n.type === 'ms').map(n => n.id)
      this._sankey.nodes(this.graphData.nodes)
      this._sankey.links(this.graphData.links)
      let arrows = pathArrows.pathArrows()
        .arrowLength(10)
        .gapLength(150)
        .arrowHeadSize(4)
        .path(function (link) { return link.path })
      var color = this.$d3.scaleOrdinal(this.$d3.schemeCategory10)
      this.__links = this.__links.data(this._sankey.links())
      this.__links.exit().remove()
      let path = this.$d3.sankey.sankeyLinkHorizontal() // this._sankey.link()
      this.__links = this.__links.enter().append('path')
          .attr('id', d => d.source.id + ':::' + d.target.id)
          .attr('class', function (d) { return (d.causesCycle ? 'cycleLink' : 'link') })
          .attr('d', path)
          .attr('stroke', d => color(d.target.id))
          .attr('stroke-width', d => 0.5 + d.value)
          .attr('opacity', this.opacityDefault)
          .sort((a, b) => a.dy - b.dy)
          .append('title').text(l => l.value + ' from ' + l.source.id + ' to ' + l.target.id)

      this.__arrows = this.__arrows.data(this._sankey.links())
      this.__arrows.exit().remove()
      this.__arrows.enter()
        .append('g')
        .attr('class', 'g-arrow')
        .call(arrows)

      this.__nodes = this.__nodes.data(this.graphData.nodes)
      this.__nodes.exit().remove()
      // this.__nodes =
      var nodeEnter = this.__nodes.enter()
          .append('g')
            .call(this.$d3.drag()
              .subject(function (d) { return d })
              .on('start', function () { this.parentNode.appendChild(this) })
              .on('drag', dragmove))
            .attr('id', d => d.id)
            .attr('class', d => 'node ' + (d.type || 'domain'))
            .attr('transform', d => { return 'translate(' + d.x + ',' + d.y + ')' })

      var d3 = this.$d3
      function dragmove (d) {
        d3.select(this).attr('transform', 'translate(' + (d.x = Math.max(0, d3.event.x)) + ',' + (d.y = Math.max(0, d3.event.y)) + ')')
        me._sankey.relayout()
        d3.select('svg').select('g.links').selectAll('.link').attr('d', me._sankey.link())
      }

      var rects = nodeEnter.append('rect')
        // .attr('deb', d => util.inspect(d))
        .attr('height', d => Math.abs(d.dy) || 10)
        .attr('width', this._sankey.nodeWidth())
        .attr('fill', d => msIds.includes(d.id) ? color(d.id) : me.defaultLinksSiteColour)
      rects.append('title').text(d => d.id)
      nodeEnter.append('text').text(d => d.id)
        .attr('fill', d => msIds.includes(d.id) ? color(d.id) : this.defaultLinksSiteColour)
        .attr('font-size', d => msIds.includes(d.id) ? 'x-large' : 'normal')
      this.__nodes = this.__nodes.merge(nodeEnter)
    },
    createGraphNetwork () {
      var me = this
      var d3 = me.$d3
      this.__rootGroup = this.__svg.append('g')
      this.__defs = this.__rootGroup.append('defs')
      this.__defs.selectAll('marker')
        .data(['marker'])
        .enter().append('marker')
          .attr('id', function (d) { return d })
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 10)
          .attr('refY', 0)
          .attr('markerWidth', 4)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
        .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
      this.__defs.selectAll('pattern')
        .data([ {id: 'google', url: this.$globalData.appPathRoot + '/static/icons/google.png'}, {id: 'nogoogle', url: this.$globalData.appPathRoot + '/static/icons/nogoogle.png'} ])
        .enter().append('pattern')
            .attr('id', d => d.id)
            .attr('patternUnits', 'objectBoundingBox')
            .attr('width', '16')
            .attr('height', '16')
            .append('svg:image')
            .attr('xlink:href', d => d.url)
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 16)
            .attr('height', 16)
      this.__links = this.__rootGroup.append('g').attr('class', 'links').selectAll('.link')
      this.__nodes = this.__rootGroup.append('g').attr('class', 'nodes').selectAll('.node')
      this.__labels = this.__rootGroup.append('g').attr('class', 'labels').selectAll('.label')
      this.__charts = this.__rootGroup.append('g').attr('class', 'charts').selectAll('.chart')

      this._createRootGroupTransform(this.__svg, null, this.__rootGroup, this.$globalData.svgIntialTransform)

      this.simulation = d3.forceSimulation()
      this.updateGraphNetwork()
    },
    renderDomainsDropdown () {
      const selectedLookupType = this.$globalData.data[this.selectedLookupType]
      if (selectedLookupType) {
        const domains = this.$globalData.data[this.selectedLookupType].domains
        this.domains = domains.sort()
      }
    },
    /**
     * Close and reset the Link Map popup
     * @method closePopup
     * @return void
     * **/
    closePopup () {
      this.open = false
      this.graphData.nodes = []
      this.graphData.links = []
      this.toggleDomainsDropdownData = []
      this.toggledDomainsForDomainsDropdown = []
      this.toggleDomainDropdownType = null
      this.prepareForPrint()
    },
    /**
     * Print a network map
     * @method print
     * @return void
     * **/
    print () {
      this.prepareForPrint('print-network-map')
      window.print()
    },
    /**
     * Add or remove a special class for printing a linkmap
     * @method prepareForPrint
     * @param {String} className [optional]
     * @return void
     * **/
    prepareForPrint (className) {
      document.querySelector('body').className = className || ''
    },
    _scaleNodeSize (size, domain) {
      var minSize = this.$globalData.data.moneySite.domains.includes(domain) ? 5 : 3
      var scaledSize = this.nodeSizeFactor * this.nodeSizeScale(5 * size)
      let res = Math.max(scaledSize, minSize)
      return res
    },
    isMoneySite (domain) {
      return this.$globalData.data.moneySite.domains.includes(domain)
    },
    isLinkSite (domain) {
      return this.$globalData.data.linkSite.domains.includes(domain)
    },
    _colorNode (fromNode, toNode) {
      return this.isMoneySite(fromNode) ? styling.nodeColor.moneySite : (
              this.isLinkSite(fromNode) ? styling.nodeColor.linkSite : styling.nodeColor.externalSite)
    },
    _scaleLinkWidth (link) {
      return 0.75 + (1.5 * this.linkWidthScale(link.value))
    },
    _scaleLinkStrength (link, nodes) {
      let source = nodes.find(n => n.id === link.source)
      let target = nodes.find(n => n.id === link.target)
      let linkStrength = 0
      if (source.type === 'ms' && target.type === 'ms') {
        linkStrength += 0.9
      } else if (source.type === 'ms' && target.type === 'ls') {
        linkStrength += 0.8
      } else if (source.type === 'ls' && target.type === 'ms') {
        linkStrength += 0.7
      } else if (source.type === 'ls' && target.type === 'ls') {
        linkStrength += 0.6
      } else { /* external site involved */
        linkStrength += 0.5
      }
      linkStrength += this.linkStrengthScale(link.value)
      return linkStrength
    },
    _colorLink (fromDomain, toDomain) {
      var MS = this.$globalData.data.moneySite.domains
      var LS = this.$globalData.data.linkSite.domains
      var fromMS = MS.includes(fromDomain)
      var toMS = MS.includes(toDomain)
      var toLS = toMS ? false : LS.includes(toDomain)
      if (fromMS) {
        if (toMS) return styling.linkColor.ms2ms
        if (toLS) return styling.linkColor.ms2ls
        if (fromDomain === toDomain) return styling.linkColor.ms2int
        return styling.linkColor.ms2ext
      }
      var fromLS = fromMS ? false : LS.includes(fromDomain)
      if (fromLS) {
        if (toMS) return styling.linkColor.ls2ms
        if (toLS) return styling.linkColor.ls2ls
        if (fromDomain === toDomain) return styling.linkColor.ls2int
        return styling.linkColor.ls2ext
      }
      if (toMS) return styling.linkColor.ext2ms
      if (toLS) return styling.linkColor.ext2ls
      return styling.linkColor.ext2ext
    },
    getLinkSitesData () {
      let data = {}
      const selectedTld = this.selectedTld
      const allLSLinks = this.$globalData.data.allLSLinks
      const allMSLinks = this.$globalData.data.allMSLinks
      for (let linkedToLS in allLSLinks) {
        if (linkedToLS.endsWith(selectedTld)) {
          data[linkedToLS] = allLSLinks[linkedToLS]
        } else {
          let x = allLSLinks[linkedToLS]
          for (let linkedFromSite in x) {
            if (linkedFromSite.endsWith(selectedTld)) {
              let y = x[linkedFromSite]
              if (!data[linkedToLS]) {
                data[linkedToLS] = { }
              }
              data[linkedToLS][linkedFromSite] = { isMoneySite: y.isMoneySite, isLinkSite: y.isLinkSite, count: y.count, links: y.links }
            }
          }
        }
      }
      for (let linkedToMS in allMSLinks) {
        if (linkedToMS.endsWith(selectedTld)) {
          data[linkedToMS] = allMSLinks[linkedToMS]
        } else {
          let x = allMSLinks[linkedToMS]
          for (let linkedFromSite in x) {
            if (linkedFromSite.endsWith(selectedTld)) {
              let y = x[linkedFromSite]
              if (!data[linkedToMS]) {
                data[linkedToMS] = { }
              }
              data[linkedToMS][linkedFromSite] = { isMoneySite: y.isMoneySite, isLinkSite: y.isLinkSite, count: y.count, links: y.links }
            }
          }
        }
      }
      console.log('getLinkSitesData ' + selectedTld, data)
      return data
    },
    getLinkDataFromDomainTraversePages (data, typeOfLink, domain, objContainingPages) {
      Object.keys(objContainingPages).forEach(pageKey => {
        let page = objContainingPages[pageKey]
        // check links, then continue iterating child p
        page.l[typeOfLink].forEach(link => {
          var parsedUrl = url.parse(link.to)
          var parsedDomain = parseDomain(parsedUrl.hostname)
          // console.log('parsedUrl', parsedUrl)
          var domainRoot = parsedDomain ? parsedDomain.domain + '.' + parsedDomain.tld : parsedUrl.hostname
          if (!data[domainRoot]) {
            data[domainRoot] = { }
          }
          if (!data[domainRoot][domain]) {
            data[domainRoot][domain] = { count: 1 }
          } else {
            data[domainRoot][domain].count++
          }
        })
        this.getLinkDataFromDomainTraversePages(data, typeOfLink, domain, page.p)
      })
    },
    getLinksDataFromDomain (typeOfLink, domain, data) {
      // traverse all p and add whats required into the data
      if (!domain.links) { console.log('domain without links', domain) }
      this.getLinkDataFromDomainTraversePages(data, typeOfLink, domain.domain, domain.links.p)
    },
    resolveTypeOfLink (inTypeOfLink) {
      let typeOfLink = inTypeOfLink === 'internal' ? 'int' : (inTypeOfLink === 'external' ? 'ext' : (inTypeOfLink === 'toMS' ? 'ms' : (inTypeOfLink === 'toLS' ? 'ls' : null)))
      if (typeOfLink === null) console.error('incorrect type of link resolved to null', inTypeOfLink)
      return typeOfLink
    },
    getLinksData (inTypeOfLink) {
      let data = {}
      let typeOfLink = this.resolveTypeOfLink(inTypeOfLink)
      console.log('getGlobalData', this.getGlobalData())
      let inputData = null
      if (inTypeOfLink === 'internal') {
        inputData = this.$globalData.data.allIntLinks
      } else {
        inputData = this.$globalData.data.tlds[this.selectedTld].domains
      }
      Object.keys(inputData).forEach((domainKey) => {
        let domain = inputData[domainKey]
        this.getLinksDataFromDomain(typeOfLink, domain, data)
      })
      console.log('getLinksData(' + typeOfLink + ') returns', {inputData, data})
      return data
    },
    /**
     * Render a generic diagram
     * @method genericDiagram
     * @param {String} type ('allMSLinks' | 'allLSLinks')
     * @return void
     * **/
    genericDiagram (type, domain) {
      const tld = this.tld.tlds[this.selectedTld]
      const data = ['linkSite', 'moneySite'].includes(type) ? this.getDomainData(domain) : (type === 'allLSLinks' ? this.getLinkSitesData() : (type === 'links' ? this.getLinksData(domain) : this.$globalData.data[type]))
      let nodes = {} // [ { id: 'ms1' }, { id: 'ms1-p1' }, { id: 'ms1-p2' }, { id: 'ls1' }, { id: 'ls2' }, { id: 'ls3' }, { id: 'ms2' }, { id: 'ms3' }, { id: 'ms4' } ]
      let links = [] // [ { source: 'ms1', target: 'ms1-p1', value: 10 }, { source: 'ms1', target: 'ms1-p2', value: 10 }, { source: 'ms3', target: 'ms2', value: 1 }, { source: 'ls1', target: 'ms3', value: 1 }, { source: 'ls1', target: 'ms1-p1', value: 1 }, { source: 'ls2', target: 'ms1-p1', value: 2 }, { source: 'ls3', target: 'ms1-p2', value: 1 }, { source: 'ms2', target: 'ms1-p2', value: 6 }, { source: 'ms2', target: 'ls1', value: 12 } ]

      function isOnline (data, domainName) {
        return Object.keys(data).find((tldKey) => Object.keys(data[tldKey].domains).includes(domainName)) !== undefined
      }
      function isGIndex (data, domainName) {
        return data.items.find(item => item.from === domainName) !== undefined
      }

      let flatDomainsList = Object.keys(data)
      if (!['linkSite', 'moneySite', 'allLSLinks'].includes(type)) flatDomainsList = flatDomainsList.filter(domainName => domainName.endsWith(this.selectedTld))
      flatDomainsList.forEach((domain) => {
        const domainData = data[domain]
        if (!nodes[domain]) {
          var tldDomain = tld.domains[domain]
          if (tldDomain === undefined) {
            var parsedDomain = parseDomain(domain)
            let someTld
            if (parsedDomain) {
              someTld = this.$globalData.data.tlds[parsedDomain.tld] || { domains: [] }
              tldDomain = someTld.domains[domain]
            }
            if (tldDomain === undefined) {
              tldDomain = { id: domain, tld: 'domainwastloaded', isMoneySite: false, isLinkSite: false, links: [] }
            }
          }
          nodes[domain] = {
            id: domain,
            name: domain,
            tld: tldDomain.tld,
            type: tldDomain.isMoneySite ? 'ms' : (tldDomain.isLinkSite ? 'ls' : 'ext'),
            isOnline: isOnline(this.$globalData.data.tlds, domain),
            isGIndex: isGIndex(this.$globalData.data.googleIndex, domain),
            data: {
              type: type,
              domain: domain,
              domainData
            }
          }
        }
      })
      flatDomainsList.forEach((domainName) => {
        const domainData = data[domainName]
        Object.keys(domainData).forEach((nestedDomainName) => {
          var nestedDomainData = tld.domains[nestedDomainName]
          if (nestedDomainData === undefined) {
            var parsedDomain = parseDomain(nestedDomainName)
            let someTld
            if (parsedDomain) {
              someTld = this.$globalData.data.tlds[parsedDomain.tld] || { domains: [] }
              nestedDomainData = someTld.domains[nestedDomainName]
            }
            if (nestedDomainData === undefined) {
              nestedDomainData = { id: nestedDomainName, tld: 'domainwastloaded', isMoneySite: false, isLinkSite: false, links: [] }
            }
          }
          if (!nodes[nestedDomainName]) {
            nodes[nestedDomainName] = {
              id: nestedDomainName,
              name: nestedDomainName,
              // level: 'child',
              tld: nestedDomainData ? nestedDomainData.tld : 'needToFixTHis',
              type: nestedDomainData ? (nestedDomainData.isMoneySite ? 'ms' : (nestedDomainData.isLinkSite ? 'ls' : 'ext')) : 'needToFixTHis2',
              _type: 'domain',
              isOnline: isOnline(this.$globalData.data.tlds, nestedDomainName),
              isGIndex: isGIndex(this.$globalData.data.googleIndex, nestedDomainName),
              data: {
                domain: nestedDomainName,
                type: 'nested-node',
                links: domainData[nestedDomainName].links
              }
            }
          }
          links.push({
            target: domainName,
            source: nestedDomainName,
            _type: nodes[nestedDomainName].type + '-' + nodes[domainName].type
          })
        })
      })
      this.graphData.nodes = []
      this.graphData.links = []
      this.updateGraph()
      nodes = Object.keys(nodes).map(nodeId => nodes[nodeId])
      nodes.forEach(node => {
        let filterFn = link => link.target === node.id || link.source === node.id
        node._linksFrom = links.filter(link => link.source === node.id).length
        node._linksTo = links.filter(link => link.target === node.id).length
        node._size = this._scaleNodeSize(links.filter(filterFn).length, node.id)
        node.data.size = nodes._size
        node._force = Math.sqrt(node._size)
      })
      links.forEach(link => {
        let source = nodes.find(n => n.id === link.source)
        link.value = source._linksTo || 1
        link.width = this._scaleLinkWidth(link) // these _scale function assume link.value is set
      })

      this.graphData.nodes = nodes
      this.graphData.links = links

      this.updateGraph()
      this.updateToggleDomainsDropdown('msDontFilterAnything')
    },
    /**
     * Update the domains filter dropdown in the sidebar
     * @method updateToggleDomainsDropdown
     * @param {String} type
     * @return void
     * **/
    updateToggleDomainsDropdown (type) {
      let toggleDomainsMS = []
      let toggleDomainsLS = []
      let toggleDomainsExt = []
      this.graphData.nodes.filter(node => node.type !== type).forEach((item) => {
        let domain = item.id
        let targetArray = null
        if (this.isMoneySite(domain)) {
          targetArray = toggleDomainsMS
        } else if (this.isLinkSite(domain)) {
          targetArray = toggleDomainsLS
        } else {
          targetArray = toggleDomainsExt
        }
        targetArray.push(domain)
      })
      toggleDomainsMS = toggleDomainsMS.sort()
      toggleDomainsLS = toggleDomainsLS.sort()
      toggleDomainsExt = toggleDomainsExt.sort()

      this.toggleDomainsDropdownData =
        ['-- Money Sites --'].concat(
          toggleDomainsMS.concat(
            ['-- Link Sites --'].concat(
              toggleDomainsLS).concat(
                ['-- External Sites --'].concat(
                  toggleDomainsExt))))
      this.toggledDomainsForDomainsDropdown = this.toggleDomainsDropdownData
      this.toggleDomainDropdownType = type
    },
    /**
     * Turn on and off the domains in the map
     * @method filterDomains
     * @return void
     * **/
    filterDomains () {
      const d3 = this.$d3
      const hiding = 'hiding'
      const pinned = 'pinned'
      const isLabel = 'data-is-label'
      const nodes = d3.selectAll('.svg-viewer g.nodes g.node')._groups[0]
      nodes.forEach((node) => {
        const nodeElement = d3.select(node)
        const nodeData = nodeElement.data()[0]
        if (this.toggledDomainsForDomainsDropdown.includes(nodeData.id)) {
          // show nodes, links and labels
          d3.selectAll(`[${isLabel}="${nodeData.id}"]`)
            .classed(hiding, false).data().forEach(d => { d.hiding = false })
          nodeElement.classed(hiding, false).classed(pinned, false).data().forEach(d => { d.hiding = false })
        } else {
          if (!nodeElement.classed(this.toggleDomainDropdownType)) {
            // hide nodes, links and labels
            nodeElement.classed(pinned, true)
            d3.selectAll('.link')
              .filter(link => link.source === node || link.target === node)
              .classed(hiding, true).attr(isLabel, nodeData.id).data().forEach(d => { d.hiding = true })
            d3.selectAll('.label')
              .filter(link => link === node)
              .classed(hiding, true).attr(isLabel, nodeData.id)
            d3.selectAll(`g.node.${pinned}:not(.${hiding})`).each((node) => {
              d3.selectAll('.link').filter(link => link.source === node || link.target === node)
                .classed(hiding, true).attr(isLabel, nodeData.id)
                .data().forEach(d => { d.hiding = true })
              d3.selectAll('.label').filter(link => link === node)
                .classed(hiding, true).attr(isLabel, nodeData.id)
            }).classed(hiding, true).data().forEach(d => { d.hiding = true })
          }
        }
      })
      d3.selectAll(`.svg-viewer .nodes .node:not(.${hiding})`).each(node => {
        var l = d3.selectAll(`g.links .link:not(.${hiding})`).filter(l => l.source.id === node.id || l.target.id === node.id).size()
        if (l === 0) {
          d3.select(`.svg-viewer .nodes .node[id='${node.id}']`).classed(hiding, true).attr(isLabel, node.id).data().forEach(d => { d.hiding = true })
          d3.selectAll('.label').filter(link => { return link.id === node.id })
                .classed(hiding, true).attr(isLabel, node.id)
        }
      })
      this.updateNodeGIndex()
      this.renderLegend()
    },
    /**
     * Get all of the data for a domain, contained in this.$globalData.data
     * @method getDomainWhoisData
     * @param {Object} node
     * @return void
     * **/
    getDomainWhoisData (node) {
      const domain = node.data.domain
      const data = this.$globalData.data
      const whois = data.whois.items
      const nameServers = data.nameServers.items
      const ipAddresses = data.ipAddresses.items
      const googleIndex = data.googleIndex.items
      const selectedColumns = this.getConfig().selectedColumns
      const na = this.getLangKey('na')
      const domainData = {
        pinned: node.pinned,
        whois: {},
        nameServers: [na],
        ipAddresses: [na],
        googleIndex: false
      }
      whois.filter((item) => {
        if (item.domain_name === domain) {
          Object.keys(item).forEach((whoisItem) => {
            if (selectedColumns.includes(whoisItem)) {
              const itemData = item[whoisItem]
              domainData.whois[whoisItem] = itemData || na
            }
          })
        }
      })
      nameServers.filter((item) => {
        const itemDomain = this.getDomainName(item.domain)
        if (itemDomain === domain) {
          domainData.nameServers = item.type_ns && item.type_ns.length ? item.type_ns.split(',') : [na]
        }
      })
      ipAddresses.filter((item) => {
        const itemDomain = this.getDomainName(item.domain)
        if (itemDomain === domain) {
          domainData.ipAddresses = item.type_a && item.type_a.length ? item.type_a.split(',') : [na]
        }
      })
      googleIndex.filter((item) => {
        const itemDomain = this.getDomainName(item.to)
        if (itemDomain === domain) {
          domainData.googleIndex = true
        }
      })
      this.domainData = domainData
    },
    /**
     * Trim http(s)://www. and trailing trash from a URL
     * @method getDomainName
     * @param {String} url
     * @return {String}
     * **/
    getDomainName (url) {
      return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').toLowerCase().split('/')[0]
    },
    /**
     * @using ../../filters
     */
    camelCaseToTitle () {
      return filters.camelCaseToTitle()
    },
    /**
     * Force close dropdown menu (bug with <v-select />)
     * @method forceCloseMenu
     * @return void
     * **/
    forceCloseMenu () {
      document.querySelector('.menu__content').style.display = 'none'
    },
    getDomainData (domain) {
      let data = { }
      const allLSLinks = this.$globalData.data.allLSLinks
      const allMSLinks = this.$globalData.data.allMSLinks
      if (allLSLinks[domain]) {
        data[domain] = allLSLinks[domain]
      }
      for (let linkedToLS in allLSLinks) {
        let x = allLSLinks[linkedToLS][domain]
        if (x) {
          if (!data[linkedToLS]) {
            data[linkedToLS] = { }
          }
          data[linkedToLS][domain] = { count: x.count, links: x.links }
        }
      }
      if (allMSLinks[domain]) {
        data[domain] = allMSLinks[domain]
      }
      for (let linkedToMS in allMSLinks) {
        let x = allMSLinks[linkedToMS][domain]
        if (x) {
          if (!data[linkedToMS]) {
            data[linkedToMS] = {}
          }
          data[linkedToMS][domain] = { count: x.count, links: x.links }
        }
      }
      return data
    },
    /**
     * Diagram hub
     * @method generateDiagram
     * @return void
     * **/
    generateDiagram () {
      const selectedLookupType = this.selectedLookupType
      const selectedDomain = this.selectedDomains[0]
      const setTitle = (someThing) => {
        this.title = this.getLangKey('networkDiagramsTitles')[selectedLookupType](someThing)
      }
      console.log(`generate diagram for ${selectedLookupType} / ${selectedDomain}`)
      this.ajax(false)
      switch (selectedLookupType) {
        case 'nrMoneySites':
        case 'nrLinkSites':
          setTitle('.' + this.selectedTld)
          this.genericDiagram(selectedLookupType === 'nrMoneySites' ? 'allMSLinks' : 'allLSLinks')
          break
        case 'moneySite':
        case 'linkSite':
          setTitle(selectedDomain)
          this.genericDiagram(selectedLookupType, selectedDomain)
          break
        case 'links':
          setTitle(selectedDomain === 'toLS' ? ' linksite ' : (selectedDomain === 'toMS' ? ' moneysite ' : selectedDomain) + ' | .' + this.selectedTld)
          this.genericDiagram(selectedLookupType, selectedDomain)
          break
      }
    }
  }
}
</script>
<style>
.gindex
{
  visibility: hidden;
}

.node.ext ~ .gindex
{
  visibility: hidden !important;
}

.node rect
{
  cursor: move;
  fill-opacity: .9;
  shape-rendering: crispEdges;
}

.node text
{
  pointer-events: none;
  text-shadow: 0 1px 0 #fff;
}

.node.offline
{
    stroke: orangered;
    stroke-dasharray: 4, 4, 4, 4;
    stroke-width: 2px;
}

.node.ext.offline
{
    stroke: none;
}

.node.online
{
    stroke: darkgreen;
    stroke-width: 2px;
}

.link {
  fill: none;
}

.cycleLink
{
  fill: #600;
  opacity: .2;
  stroke: none;
  stroke-linejoin: "round";
}

.cycleLink:hover
{
  opacity: .5;
}

.node
{
  cursor: pointer;
}

.node.selected
{
  stroke: #caa455;
}

.node.pinned
{
  stroke: rgba(190, 56, 93, .6)
}

.link,
.node
{
  stroke-linecap: round;
}

.link.selected
{
  stroke: rgba(202, 164, 85, .6)
}

.curve
{
  fill: none
}

.label
{
  fill: purple;
  font-size: 12px;
  pointer-events: none;
  text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;
}

g.label rect {
  height: 16px;
  /* x: 8px;
  y: -8px; */
  opacity: 0.2;
}

@media print { /* does this work on the screenshot ?? */
  .label
  {
    text-shadow: none
  }
}

canvas
{
  position: absolute;
  top: 0;
  left: 0;
}

.content.linkmaps-viewer
{
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-bottom: 0 !important;
}

.pinned
{
  stroke: red !important
}

.marker
{
  fill: none
}

svg text
{
  cursor: default;
  user-select: none;
}

svg:active
{
  cursor: move;
}

.hiding
{
  visibility: hidden;
}

.domains-filter .input-group__selections
{
  visibility: hidden;
  height: 30px;
}

.group-tick line
{
  stroke: #000;
}

.ribbons
{
  fill-opacity: 0.67;
}

.network-map-filters-list li
{
  padding: 0 !important;
}
</style>
