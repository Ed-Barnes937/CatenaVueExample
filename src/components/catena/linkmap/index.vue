<template>
  <div :class="['catena-linkmap']" :style="style">
    <div>
      <svg
        :id="id"
        width="100%"
        :height="`${height}px`"
        :class="['elevation-12', ext ? 'external-sites' : null, dn ? 'domain-names' : null, isGIndex ? 'google-indexed' : null, ml ? 'multi-linking' : null, ls ? 'network-sites' : null, ms ? 'money-sites' : null]">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
          </marker>
          <pattern x="0" y="0" v-for="(fill, index) in fills" :key="index" :id="index" :height="nodeRadius * fill.size" :width="nodeRadius * fill.size">
            <image x="0" y="0" :width="nodeRadius * fill.size" :height="nodeRadius * fill.size" :xlink:href="fill.data" />
          </pattern>
        </defs>
        <g :class="['top-group']">
          <g :class="['links']" />
          <g :class="['nodes']" />
          <g :class="['texts']" />
        </g>
      </svg>
    </div>
    <linkmap-mini-dialog v-if="nodeMiniDialogData" :show="nodeMiniDialog" :details="nodeMiniDialogData" />
    <linkmap-expanded-dialog v-if="nodeExpandedDialogData" :show="nodeExpandedDialog" :details="nodeExpandedDialogData" />
    <linkmap-legend :details="legend" />
  </div>
</template>
<script>
import LinkmapMiniDialog from '../linkmap-mini-dialog/index'
import LinkmapExpandedDialog from '../linkmap-expanded-dialog'
import LinkmapLegend from '../linkmap-legend'
import methods from '../../../helpers/methods'

const DEBUG_FORCE_ATTRIBS = false

const map = {
  links: [],
  nodes: []
}

export default {
  name: 'CatenaLinkmap',
  mixins: [
    methods
  ],
  components: {
    LinkmapMiniDialog,
    LinkmapExpandedDialog,
    LinkmapLegend
  },
  created () {
    const colors = this.colors
    this.nodeSize = this.nodeRadius * 4
    this.nodesGroupTranslateOffset.ms = this.nodeSize / 2
    this.colorizeNodes([colors.ms], 'ms', 4)
    this.colorizeNodes([colors.isGIndex], 'isGIndex', 2)
    this.colorizeNodes([colors.ms, colors.isGIndex], 'msIsGIndex', 4)
    this.colorizeNodes([colors.ext], 'ext', 2)
    this.colorizeNodes([colors.ls], 'ls', 2)
    this.colorizeNodes([colors.ls, colors.isGIndex], 'lsIsGIndex', 2)
  },
  data () {
    return {
      style: {
        // width: `${this.width}px`
      },
      simulation: null,
      nodeSize: null,
      // nodeRadius: 5,
      nodesGroupTranslateOffset: {
        ms: 0,
        ls: 0,
        ext: 0
      },
      offsetX: {
        ms: 25,
        ls: 10,
        ext: 10
      },
      offsetY: {
        ms: 14,
        ls: 4,
        ext: 4
      },
      radial: 5,
      scaleExtent: [1 / 12, 12],
      nodeMiniDialog: false,
      nodeMiniDialogData: null,
      nodeExpandedDialog: false,
      nodeExpandedDialogData: null,
      colors: {
        ext: '#5aa554', // external site
        isGIndex: '#2f69c8', // is Google indexed
        ms: '#ca4d41', // product (money site)
        ls: '#f9e269', // network site (link site)
        ml: '#dd4d69' // multilinking site
      },
      // node shapes
      shapes: {
        ms: 'rect',
        ls: 'circle',
        ext: 'circle'
      },
      // localization strings
      labels: {
        ext: 'External Site',
        isGIndex: 'Google Indexed',
        ls: 'Network Site',
        ml: 'Multilinking',
        ms: 'Product'
      },
      // avatar translations for the info popups when node has been clicked
      avatars: {
        ms: 'P',
        ls: 'NS',
        ext: 'EXT',
        ml: 'ML'
      },
      // this will be auto generated
      fills: {},
      linkForceConfig: [
          { source: 'ms', target: 'ms', distance: 80, strength: 0.9 },
          { source: 'ms', target: 'ls', distance: 60, strength: 0.8 },
          { source: 'ms', target: 'ext', distance: 120, strength: 0.5 },
          { source: 'ls', target: 'ms', distance: 60, strength: 0.8 },
          { source: 'ls', target: 'ls', distance: 80, strength: 0.7 },
          { source: 'ls', target: 'ext', distance: 100, strength: 0.5 },
          { source: 'ext', target: 'ms', distance: 100, strength: 0.7 },
          { source: 'ext', target: 'ls', distance: 150, strength: 0.5 },
          { source: 'ext', target: 'ext', distance: 200, strength: 0.4 } ]
    }
  },
  props: {
    data: {
      type: Object
    },
    dn: {
      type: Boolean,
      required: true
    },
    ms: {
      type: Boolean,
      required: true
    },
    ls: {
      type: Boolean,
      required: true
    },
    isGIndex: {
      type: String,
      required: true
    },
    ml: {
      type: Boolean,
      required: true
    },
    ext: {
      type: Boolean,
      required: true
    },
    width: {
      type: Number,
      required: false,
      default: 1600
    },
    height: {
      type: Number,
      required: false,
      default: 800
    },
    stroke: {
      type: String,
      required: false,
      default: '#ccc'
    },
    // circular nodes (non-products sites)
    nodeRadius: {
      type: Number,
      required: false,
      default: 5
    },
    // circular nodes (non-products sites)
    simForceRadialRadius: {
      type: Number,
      required: true,
      default: 5
    },
    simForceRadialStrength: {
      type: Number,
      required: true,
      default: 5
    },
    simForceLinkStrength: {
      type: Number,
      required: true,
      default: 5
    },
    simForceLinkDistance: {
      type: Number,
      required: false,
      default: 45
    },
    simForceChargeStrength: {
      type: Number,
      required: false,
      default: 45
    },
    simForceChargeDistance: {
      type: Array,
      required: false
    },
    simForceCollideRadius: {
      type: Number,
      required: false
    },
    simForceCollideStrength: {
      type: Number,
      required: false
    },
    simForceCollideIterations: {
      type: Number,
      required: false
    },
    simAlphaDecay: {
      type: Number,
      required: false
    },
    simAlpha: {
      type: Number,
      required: false
    },
    simAlphaMin: {
      type: Number,
      required: false
    },
    simAlphaTarget: {
      type: Number,
      required: false
    },
    simVelocityDecay: {
      type: Number,
      required: false
    },
    forceCollide: {
      type: Number,
      default: 15
    },
    strokeWidth: {
      type: Number,
      required: false,
      default: 1
    },
    fill: {
      type: String,
      required: false,
      default: '#bb5547'
    },
    strength: {
      type: Number,
      required: false,
      default: -250
    },
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    /**
     * Create the legend object out of the available data
     * @computed legend
     * @return {Object}
     */
    legend () {
      const nodes = []
      const colors = this.colors
      const shapes = this.shapes
      const labels = this.labels
      Object.keys(shapes).forEach(key => {
        nodes.push({
          color: colors[key],
          label: labels[key],
          shape: shapes[key],
          count: this.getNodesCountByType(key),
          render: this[key]
        })
      })
      return {
        nodes,
        decorations: [{
          label: labels.isGIndex,
          color: colors.isGIndex,
          render: this.isGIndex
        }, {
          label: labels.ml,
          color: colors.ml,
          render: this.ml
        }, {
          label: labels.ext,
          color: colors.ext,
          render: this.ext
        }]
      }
    }
  },
  beforeDestroy () {
    this.flushLinkmapNodes()
  },
  watch: {
    simAlpha () {
      this.restartSimulation()
    },
    simAlphaDecay () {
      this.restartSimulation()
    },
    simAlphaMin () {
      this.restartSimulation()
    },
    simAlphaTarget () {
      this.restartSimulation()
    },
    simVelocityDecay () {
      this.restartSimulation()
    },
    simForceChargeStrength () {
      this._applyForceAttribute('charge', 'strength', this.fnSimForceChargeStrength, 'simForceChargeStrength')
    },
    simForceChargeDistance () {
      console.error('TMP not applying simForceChargeDistance')
      // this._applyForceAttribute('charge', 'distanceMin', this.fnSimForceChargeDistanceMin[0], 'simForceChargeDistance')
      // this._applyForceAttribute('charge', 'distanceMax', this.fnSimForceChargeDistanceMin[1], 'simForceChargeDistance')
    },
    simForceCollideRadius () {
      this._applyForceAttribute('collision', 'radius', this.fnSimForceCollideRadius, 'simForceCollideRadius')
    },
    simForceCollideStrength () {
      this._applyForceAttribute('collision', 'strength', 1, 'simForceCollideStrength') // this.fnSimForceCollideStrength
    },
    simForceCollideIterations () {
      this._applyForceAttribute('collision', 'iterations', this.fnSimForceCollideIterations, 'simForceCollideIterations')
    },
    simForceLinkDistance () {
      this._applyForceAttribute('link', 'distance', this.fnSimForceLinkDistance, 'simForceLinkDistance')
    },
    simForceLinkStrength () {
      this._applyForceAttribute('link', 'strength', this.fnSimForceLinkStrength, 'simForceLinkStrength')
    },
    simForceRadialRadius () {
      this._applyForceAttribute('radial', 'radius', this.fnSimForceRadialRadius, 'simForceRadialRadius')
    },
    simForceRadialStrength () {
      this._applyForceAttribute('radial', 'strength', this.fnSimForceRadialStrength, 'simForceRadialStrength')
    },
    // reinitialize on every data prop change
    data () {
      this.init()
    },
    // on "Domain Name" visibility toggle
    dn () {
      this.$emit('input:dn', {
        toggled: this.dn
      })
      if (this.simulation) this.simulation.restart()
    },
    ms () {
      this.$emit('input:ms', {
        toggled: this.ms
      })
    },
    // on "Google Index" visibility toggle
    isGIndex () {
      this.$emit('input:isgindex', {
        toggled: this.isGIndex
      })
    },
    // on "Network Site" visibility change
    ls () {
      this.$emit('input:ls', {
        toggled: this.ls
      })
    },
    // on "Multilinking Site" visibility toggle
    ml () {
      this.$emit('input:ml', {
        toggled: this.ml
      })
    },
    // on "External Site" visibility toggle
    ext () {
      this.$emit('input:ext', {
        toggled: this.ext
      })
    },
    height () {
      this.log('my height has changed', this.height)
      this.initSimulationForceCenter()
      this.restartSimulation()
    },
    width () {
      this.log('my width has changed', this.height)
      this.initSimulationForceCenter()
      this.restartSimulation()
    }
  },
  methods: {
    /**
     * D3 ticked function callback
     * @method ticked
     * @return void
     */
    ticked () {
      this.nodesGroup.attr('transform', d => 'translate(' + (d.x - d.typeSpecificVariation) + ',' + (d.y - d.typeSpecificVariation) + ')')
      this.textsGroup.attr('transform', d => 'translate(' + (d.x + d.offsetX) + ',' + (d.y + d.offsetY) + ')')
      this.linksGroup.attr('d', link => 'M' + link.source.x + ',' + link.source.y + 'L' + link.target.x + ',' + link.target.y)
      this.linksGroup.attr('data-id', data => data.source.name.replace(/www./gi, ''))
    },
    /**
     * Flush the Vuex stored linkmap data nodes to free menory up
     * @method flushLinkmapNodes
     * @return void
     */
    flushLinkmapNodes () {
      const nodes = []
      this.log('[VUEX] flush linkmap nodes to free memory up', nodes)
      this.$store.commit('setLinkmapNodes', nodes)
      if (this.simulation) {
        this.simulation.stop()
      }
    },
    /**
     * Get a D3 reference of the SVG element
     * @method getSvg
     * @return {Element}
     */
    getSvg () {
      return this.$d3.select(`#${this.id}`)
    },
    /**
     * Create base64/png representation of colors, related to the type of the node
     * @method colorizeNodes
     * @param {Array} colors
     * @param {String} type
     * @return void
     */
    colorizeNodes (colors, type, size) {
      let stops = []
      let used = 0
      colors.forEach(color => {
        const slice = 100 / colors.length
        stops.push(`${color} ${used}% ${slice + used}%`)
        used = slice + used
      })
      let gradient = new window.ConicGradient({
        stops: stops.join(','),
        size: this.nodeRadius * 10 // we need it crisp
      })

      this.fills[type] = {
        data: gradient.png,
        size: size
      }
    },
    /**
     * Get the nodes count by type, so they are used with the legend
     * @method getNodesCountByType
     * @return {Number}
     */
    getNodesCountByType (type) {
      return map.nodes.filter(site => {
        return site.type === type
      }).length
    },
    /**
     * Create DOM element by specified W3 namespace
     * @method createElementNS
     * @param {String} element
     * @param {String} namespace [optional]
     * @return {Element}
     */
    createElementNS (element, namespace) {
      return document.createElementNS(namespace || 'http://www.w3.org/2000/svg', element)
    },
    /**
     * Reset the linkmap
     * @method reset
     * @return {Element}
     */
    reset () {
      map.nodes = this.data.nodes
      map.links = this.data.links
      console.time('resetLinkmapData')
      var orphanNodes = map.nodes.filter(n => undefined === (map.links.find(l => l.source === n.id || l.target === n.id)))
      if (orphanNodes.length) console.error('There are orphanNodes!', orphanNodes)
      var linksWithMissingNodes = this.data.links.filter(l => this.data.nodes.filter(n => n.id !== l.source).length === 0 && this.data.nodes.filter(n => n.id !== l.target).length === 0)
      if (linksWithMissingNodes.length) console.error('THERE ARE linksWithMissingNodes!!!', linksWithMissingNodes)
      console.timeEnd('resetLinkmapData')
      console.log('map', map)
    },
    /**
     * Network Graph Node Attrbiutes functions
     */
    nodeAttrR (d) {
      // console.log('nodeAttrR d.type', d ? d.type : 'no d')
      if (d.type !== 'ms') return this.radius || 5
    },
    nodeAttrCX (d) {
      return d.type === 'ms' ? d.x - (this.nodeSize / 0.2) : d.x
    },
    nodeAttrCY (d) {
      return d.type === 'ms' ? d.y - (this.nodeSize / 0.2) : d.y
    },
    nodeAttrWidth (d) {
      if (d.type === 'ms') return this.nodeSize
    },
    nodeAttrHeight (d) {
      if (d.type === 'ms') return this.nodeSize
    },
    nodeAttrFill (d) {
      let type = d.type
      if ((d.isGIndex) && (type === 'ms' || type === 'ls')) {
        type += 'IsGIndex'
      }
      return `url(#${type})`
    },
    nodeAttrClass (d) {
      return ['node', `node-type-${d.type.toLowerCase()}`, d.isGIndex ? 'google-indexed' : 'google-not-indexed'].join(' ')
    },
    _logSimVals (message, value) {
      if (DEBUG_FORCE_ATTRIBS) console.log(message, value)
    },
    _applyForceAttribute (forceName, attribName, value, watcherName) {
      // if (DEBUG_FORCE_ATTRIBS) console.log('force ' + forceName + ' attrib ' + attribName + ', ' + watcherName + ' = ' + this[watcherName])
      // note that this[watcherName] may not be the actual value used by the forces - it's used/manipulated by the value / force accessor function
      if (this.simulation) {
        let force = this.simulation.force(forceName)
        if (force && force[attribName]) {
          force[attribName](value)
          // note that the value is actually/typically an accessor function
          this.restartSimulation()
        } else {
          if (!force) {
            console.error('force ' + forceName + ' does not exist')
          } else {
            console.error('force ' + forceName + ' attribute ' + attribName + ' does not exist')
          }
        }
      }
    },
    /**
     * Network Graph Simulation Forces functions
     */
    fnSimForceChargeStrength (d) {
      var x = this.simForceChargeStrength * (d.type === 'ms' ? +1 : -0.1)
      // var x = (d.radius || 7) * (this.simForceChargeStrength || 1) / 10 // Math.pow((d.radius || 7), 2.0) * (this.simForceChargeStrength || 1)
      // this._logSimVals('fnSimForceChargeStrength ' + x, d)
      // return x
      console.log('fnSimForceChargeStrength ' + x, d)
      return x
    },
    fnSimForceChargeDistanceMin (d) {
      let x = 33 // this.simForceChargeDistance[0] || 200
      this._logSimVals('fnSimForceChargeDistanceMin ' + x, d)
      return x
    },
    fnSimForceChargeDistanceMax (d) {
      let x = 100 // this.simForceChargeDistance[1] || 350
      this._logSimVals('fnSimForceChargeDistanceMax ' + x, d)
      return x
    },
    fnSimForceCollideRadius (d) {
      let x = (d.radius || 20) * this.simForceCollideRadius
      this._logSimVals('fnSimForceCollideRadius : ' + x, d)
      return x
    },
    fnSimForceCollideStrength (d) {
      let x = (this.simForceCollideStrength || 7) / 10
      this._logSimVals('fnSimForceCollideStrength ' + x, d)
      return x
    },
    fnSimForceCollideIterations (d) {
      let x = this.simForceCollideIterations || 1
      this._logSimVals('fnSimForceCollideIterations ' + x, d)
      return x
    },
    fnSimForceLinkDistance (d) {
      let x = null
      let factor = (this.simForceLinkDistance ? this.simForceLinkDistance : 1) / 5
      if (!d.source || !d.target || !d.source.type || !d.target.type) x = factor * 20
      let config = this.linkForceConfig.find(c => c.source === d.source.type && c.target === d.target.type)
      if (config) x = config.distance * factor
      this._logSimVals('fnSimForceLinkDistance ' + x, d)
      return x
    },
    fnSimForceLinkStrength (d) {
      let x = null
      if (!d.source || !d.target || !d.source.type || !d.target.type) x = 1 / 10
      let config = this.linkForceConfig.find(c => c.source === d.source.type && c.target === d.target.type)
      if (config) {
        x = config.strength * (1 / this.simForceLinkStrength) * 2
      } else {
        console.error('no link strength config for type of link: ' + d.source.type + '->' + d.target.type)
      }
      this._logSimVals('fnSimForceLinkStrength ' + x, d)
      return x
    },
    fnSimForceRadialRadius (d) {
      let x = (d.type === 'ms' ? 3 : (d.type === 'ls' ? 2 : 1)) // * (this.simForceRadialRadius || 1)
      this._logSimVals('fnSimForceRadialRadius : ' + x, d)
      return x
    },
    fnSimForceRadialX (d) {
      let x = this.width
      this._logSimVals('fnSimForceRadialX ' + x, d)
      return x
    },
    fnSimForceRadialY (d) {
      let x = this.height
      this._logSimVals('fnSimForceRadialY ' + x, d)
      return x
    },
    fnSimForceRadialStrength (d) {
      let x = this.simForceRadialStrength / 10
      this._logSimVals('fnSimForceRadialStrength : ' + x, d)
      return x
    },
    restartSimulation () {
      if (this.simulation) {
        this.simulation.stop()
        if (this.simAlpaDecay) {
          let modifiedAlphaDecay = this.simAlphaDecay / 1000
          this.simulation.alphaDecay(modifiedAlphaDecay)
          this._logSimVals('simulation alpha decay', modifiedAlphaDecay)
        }
        if (this.simAlphaMin) {
          let modifiedAlphaMin = this.simAlphaMin / 1000
          this.simulation.alphaMin(modifiedAlphaMin)
          this._logSimVals('simulation alpha min', modifiedAlphaMin)
        }
        if (this.simAlphaTarget) {
          let modifiedAlphaTarget = this.simAlphaTarget / 1000
          this.simulation.alphaTarget(modifiedAlphaTarget)
          this._logSimVals('simulation alpha target', modifiedAlphaTarget)
        }
        if (this.simVelocityDecay) {
          let modifiedVelocityDecay = this.simVelocityDecay / 1000
          this.simulation.velocityDecay(modifiedVelocityDecay)
          this._logSimVals('simulation velocity decay', modifiedVelocityDecay)
        }
        let modifiedAlpha = this.simAlpha ? this.simAlpha / 1000 : 1
        this.simulation.alpha(modifiedAlpha).restart()
        this._logSimVals('restarted simulation with  alpha', modifiedAlpha)
      }
    },
    initSimulationForceCharge () {
      if (!this.simulation) return
      this.simulation.force('charge', null)
        .force('charge', this.$d3.forceManyBody()
          .strength(d => d.type === 'ms' ? +5 : -1)
        //    .distanceMin(this.fnSimForceChargeDistanceMin)
        //    .distanceMax(this.fnSimForceChargeDistanceMax)
        )
    },
    initSimulationForceRadial () {
      if (!this.simulation) return
      this.simulation.force('radial', null)
        // .force('radial', this.$d3.forceRadial()
        //   .radius(this.fnSimForceRadialRadius)
        //   .strength(this.fnSimForceRadialStrength)
        //   // .x(this.fnSimForceRadialX)
        //   // .y(this.fnSimForceRadialY)
        // )
    },
    initSimulationForceCenter () {
      if (!this.simulation) return
      let x = this.width / 2
      let y = this.height / 2
      console.log('setting center', {x, y})
      this.simulation.force('center', null)
        .force('center', this.$d3.forceCenter(x, y))
    },
    initSimulationForceLink () {
      if (!this.simulation) return
      this.simulation.force('link', null)
        .force('link', this.$d3.forceLink()
          .id(d => d.id)
          .distance(this.fnSimForceLinkDistance)
          .strength(this.fnSimForceLinkStrength)
        )
    },
    initSimulationForceCollide () {
      if (!this.simulation) return
      this.simulation.force('collision', null)
        .force('collision', this.$d3.forceCollide()
          .radius(this.fnSimForceCollideRadius)
          .strength(1) // this.fnSimForceCollideStrength)
        // //   .iterations(this.fnSimForceCollideIterations)
        )
    },
    initSimulation () {
      if (this.simulation) this.simulation.stop()
      this.simulation = this.$d3.forceSimulation()
      // this.initSimulationForceCharge()
      this.initSimulationForceRadial()
      this.initSimulationForceCenter()
      this.initSimulationForceLink()
      // this.initSimulationForceCollide()
      this.simulation.on('tick', this.ticked)
      this.simulation.nodes(map.nodes)
      this.simulation.force('link').links(map.links)
      this.restartSimulation()
    },
    /**
     * Initialize the linkmap
     * @method init
     */
    init () {
      console.time('linkmap index.vue init')
      const d3 = this.$d3
      const svg = this.getSvg().select('.top-group')
      this.linksGroup = svg.select('.links').selectAll('.link')
      this.nodesGroup = svg.select('.nodes').selectAll('.node')
      this.textsGroup = svg.select('.texts').selectAll('.text')
      this.log('[LINKMAP] init', this.data)
      this.reset()
      console.time('LinkMapInitData')
      this.linksGroup = this.linksGroup.data(map.links)
      this.nodesGroup = this.nodesGroup.data(map.nodes)
      this.textsGroup = this.textsGroup.data(map.nodes)

      this.linksGroup.exit().remove()
      var linkEnterSelection = this.linksGroup.enter()
      this.linksGroup = linkEnterSelection
        .append('path')
        .attr('class', d => ['link', d.source.isGIndex && d.target.isGIndex ? 'google-indexed' : 'google-not-indexed', d.source.type].join(' '))
        .attr('stroke', d => d.stroke || this.stroke || '#ccc')
        .attr('stroke-width', this.strokeWidth || 10)
        // .attr('data-id', d => d.source.name.replace(/www./gi, ''))
      this.linksGroup.insert('title').text(d => d.source + ' --( ' + d.value + ' )--> ' + d.target)

      this.nodesGroup.exit().remove()
      var nodeEnterSelection = this.nodesGroup.enter()
      this.nodesGroup = nodeEnterSelection
        .append((d) => {
          let shapeSelected = d.type === 'ms' ? this.shapes.ms : this.shapes.ls
          return this.createElementNS(shapeSelected, null)
        })
        .attr('class', this.nodeAttrClass)
        .attr('r', this.nodeAttrR)
        .attr('width', this.nodeAttrWidth)
        .attr('height', this.nodeAttrHeight)
        .attr('data-id', (d) => {
          return d.id.replace(/www./gi, '')
        })
        .attr('data-typeSpecificVariation', d => { d.typeSpecificVariation = this.nodesGroupTranslateOffset[d.type]; return d.typeSpecificVariation })
        .style('fill', this.nodeAttrFill)
        .on('click', (d) => {
          const event = d3.event
          const type = d.type
          document.querySelector('body').classList.add('v-dialog-transparent-overlay')
          this.getSvg().selectAll(`.top-group > * > *:not(*[data-id="${d.name}"])`).classed('item-transparent', true)
          d.color = this.colors[type]
          d.avatar = this.avatars[type]
          d.pageX = event.pageX
          d.pageY = event.pageY
          d.rating = d.rating || 32 // @todo (FD) needs to be added to the DTO
          d.ctr = d.ctr || 76 // @todo (FD) needs to be added to the DTO
          d.ndc = d.ndc || 64 // @todo (FD) needs to be added to the DTO
          d.ip = d.ip || '67.23.166.155' // (FD) @todo needs to be added to the DTO
          d.ns = d.ns || ['ns118.lacehost.com', 'ns117.lacehost.com'] // (FD) @todo needs to be added to the DTO
          d.whois = d.whois || {
            key1: 'value 1',
            key2: 'value 2',
            key3: 'value 3'
          } // @todo (FD) @todo needs to be added to the DTO
          this.log('domain data', d)
          if (this.nodeExpandedDialog) {
            this.nodeExpandedDialogData = d
          } else {
            this.nodeMiniDialogData = d
            this.nodeMiniDialog = true
          }
        })
      this.nodesGroup.insert('title').text(d => d.id)

      this.textsGroup.exit().remove()
      this.textsGroup = this.textsGroup.enter().append('text')
        .text(d => d.name)
        .attr('class', d => ['text', d.isGIndex ? 'google-indexed' : null, d.type].join(' '))
        .attr('fill', (d) => {
          if (d.type === 'ms') {
            return this.colors.ms
          }
        })
        .attr('data-offsetX', d => { d.offsetX = this.offsetX[d.type]; return d.offsetX })
        .attr('data-offsetY', d => { d.offsetY = this.offsetY[d.type]; return d.offsetY })
        .merge(this.textsGroup)
      console.timeEnd('LinkMapInitData')
      this.initSimulation()
      this.bindUI()
      console.log('linkmap index.vue init took')
      console.timeEnd('linkmap index.vue init')
    },
    /**
     * Bind UI behaviors like zoom and pan
     * @method bindUI
     * @return void
     */
    bindUI () {
      let svg = this.getSvg()
      let topGroup = svg.select('.top-group')
      let d3 = this.$d3
      svg.call(
        d3.zoom()
        .scaleExtent([1 / 12, 12])
        .on('zoom', function () { topGroup.attr('transform', d3.event.transform) })
      )
    },
    removeBodyClassFix () {
      this.getSvg().selectAll('*').classed('item-transparent', false)
      document.querySelector('body').classList.remove('v-dialog-transparent-overlay')
    }
  }
}
</script>
<style>
.catena-linkmap svg:not(.network-sites) .text.ls,
.catena-linkmap svg:not(.domain-names) .text,
.catena-linkmap svg:not(.money-sites) .text.ms,
.catena-linkmap svg:not(.external-sites) .text.ext,
.catena-linkmap svg.google-indexed .google-not-indexed,
.catena-linkmap svg.google-not-indexed .google-indexed
{
  opacity: 0;
}

.catena-linkmap .node,
.catena-linkmap .text,
.catena-linkmap .link
{
  transition: opacity .25s ease-in-out;
}

.catena-linkmap svg,
.catena-linkmap svg > g
{
  transform-origin: 50% 50% 0;
}

.catena-linkmap,
.catena-linkmap svg
{
  display: block;
  width: 100%;
}

.catena-linkmap .node
{
  stroke: #000;
  stroke-width: 0;
}

.catena-linkmap .text
{
  user-select: none;
  font-size: 12px;
  -webkit-pointer-events: none;
  -moz-pointer-events: none;
  pointer-events: none;
  margin-top: -5px;
}

.catena-linkmap svg:active
{
  cursor: move;
}

.catena-linkmap svg:active .texts
{
  display: none;
}

.catena-linkmap .text.ms
{
  font-weight: 500;
}

.v-dialog-transparent-overlay .overlay.overlay--active::before
{
  /*opacity: 0;*/
}

.v-dialog-transparent-overlay .dialog
{
  box-shadow: none;
}

.item-transparent
{
  /*opacity: .5;*/
}
</style>