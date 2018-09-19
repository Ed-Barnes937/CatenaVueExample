<template>
  <div :class="['catena-linkmap', 'elevation-12']">
    <v-toolbar :color="toolbarColor" dense v-if="tools && title">
      <v-toolbar-title v-if="title" v-html="chartTitle" />
      <v-spacer />
      <template v-if="tools">
        <v-menu offset-y>
          <v-btn icon slot="activator">
            <v-icon>mdi-export</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile v-for="format in exportFormats" :key="format" @click="exportChart(format)">
              <v-list-tile-title>{{ format }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </template>
    </v-toolbar>
    <div :class="['catena-linkmap-svg']">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="`${width}px`"
        :height="`${height}px`"
        @mousemove="drag($event)"
        @mouseup="drop()" v-if="bounds.minX">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
          </marker>
        </defs>
        <line
          _marker-end="url(#arrow)"
          @click="$emit('line:click', link)"
          @mouseover="$emit('line:hover', link)"
          v-for="link in graph.links"
          :x1="coords[link.source.index].x"
          :y1="coords[link.source.index].y"
          :x2="coords[link.target.index].x"
          :y2="coords[link.target.index].y"
          :stroke-dasharray="link.strokeDashArray ? link.strokeDashArray.join(',') : 'none'"
          :stroke="link.stroke || defaultColor"
          :class="link.cssClass || []"
          :stroke-width="link.strokeWidth || 1" />
        <template v-for="(node, i) in graph.nodes">
          <circle
            @click.stop="$emit('node:click', node)"
            @mouseover="$emit('node:hover', node)"
            @mousedown="currentMove = {x: $event.screenX, y: $event.screenY, node: node}"
            :cx="coords[i].x"
            :cy="coords[i].y"
            :r="node.r || 5"
            :fill="node.fill || defaultColor"
            :stroke="node.strokeColor || 'transparent'"
            :class="node.cssClass || []"
            :stroke-width="node.strokeWidth || 1"
          />
        </template>
        <text
          v-for="label in graph.labels"
          :x="label.x"
          :y="label.y"
          :class="label.cssClass || []"
          :fill="label.fill || defaultColor"
          :fontSize="label.fontSize || labelDefaultSize"
          :fontFamily="label.fontFamily || labelDefaultFont"
          :stroke="label.stroke || 'transparent'"
          :stroke-width="label.strokeWidth || 1" />
      </svg>
    </div>
  </div>
</template>
<script>
import {saveSvgAsPng} from 'save-svg-as-png'
import {saveAs} from 'file-saver'

export default {
  name: 'CatenaLinkmap',
  props: {
    title: {
      type: Boolean,
      required: false
    },
    fileName: {
      type: String,
      required: false,
      default: 'linkmap'
    },
    tools: {
      type: Boolean,
      required: false
    },
    chartTitle: {
      type: String,
      required: false
    },
    toolbarColor: {
      type: String,
      required: false,
      default: 'primary'
    },
    width: {
      type: Number,
      required: false,
      default: 640
    },
    height: {
      type: Number,
      required: false,
      default: 480
    },
    dataUrl: {
      type: String,
      required: true
    },
    defaultColor: {
      type: String,
      required: false,
      default: '#000'
    },
    labelDefaultSize: {
      type: String,
      required: false,
      default: '11px'
    },
    labelDefaultFont: {
      type: String,
      required: false,
      default: 'Roboto, Arial, Helvetica'
    }
  },
  data () {
    return {
      exportFormats: [
        'xls',
        'json',
        'svg',
        'png'
      ],
      graph: {
        nodes: [],
        links: [],
        labels: []
      },
      padding: 10,
      simulation: null,
      currentMove: null
    }
  },
  computed: {
    bounds () {
      return {
        minX: Math.min(...this.graph.nodes.map(n => n.x)),
        maxX: Math.max(...this.graph.nodes.map(n => n.x)),
        minY: Math.min(...this.graph.nodes.map(n => n.y)),
        maxY: Math.max(...this.graph.nodes.map(n => n.y))
      }
    },
    coords () {
      return this.graph.nodes.map(node => {
        return {
          x: this.padding + (node.x - this.bounds.minX) * (this.width - 2 * this.padding) / (this.bounds.maxX - this.bounds.minX),
          y: this.padding + (node.y - this.bounds.minY) * (this.height - 2 * this.padding) / (this.bounds.maxY - this.bounds.minY)
        }
      })
    }
  },
  mounted () {
    this.simulate()
  },
  methods: {
    /**
     * @method exportChart
     * @param {String} format
     * @return void
     */
    exportChart (format) {
      const element = this.$el.querySelector('.catena-linkmap-svg svg')
      const fileName = this.fileName
      const config = {
        backgroundColor: 'white',
        scale: 1,
        height: this.height,
        width: this.width,
        top: 0,
        left: 0
      }
      switch (format) {
        case 'png':
          saveSvgAsPng(element, `${fileName}.png`, config)
          break
        case 'json':
          const data = JSON.stringify(this.graph)
          const blob = new Blob([data], {type: 'text/plain;charset=utf-8'})
          saveAs(blob, `${fileName}.json`)
          break
      }
      console.log(format)
    },
    /**
     * @method simulate
     * @return void
     */
    simulate () {
      const d3 = this.$d3
      this.$http(this.dataUrl).then(response => {
        response.data.data.nodes.map((n, index) => {
          return {
            x: null,
            y: null,
            id: n.id,
            index: index
          }
        })
        this.graph = response.data.data
        console.log(this.graph.links)
        this.simulation = d3.forceSimulation(this.graph.nodes)
          .force('charge', d3.forceManyBody().strength(d => -10))
          .force('link', d3.forceLink(this.graph.links).id(d => {
            return d.id
          }))
          .force('x', d3.forceX())
          .force('y', d3.forceY())
      })
    },
    /**
     * @method drag
     * @param {Object} e event
     * @return void
     */
    drag (e) {
      if (this.currentMove) {
        this.currentMove.node.fx = this.currentMove.node.x - (this.currentMove.x - e.screenX) * (this.bounds.maxX - this.bounds.minX) / (this.width - 2 * this.padding)
        this.currentMove.node.fy = this.currentMove.node.y - (this.currentMove.y - e.screenY) * (this.bounds.maxY - this.bounds.minY) / (this.height - 2 * this.padding)
        this.currentMove.x = e.screenX
        this.currentMove.y = e.screenY
      }
    },
    /**
     * @method drop
     * @return void
     */
    drop () {
      delete this.currentMove.node.fx
      delete this.currentMove.node.fy
      this.currentMove = null
      this.simulation.alpha(1)
      this.simulation.restart()
    }
  }
}
</script>
