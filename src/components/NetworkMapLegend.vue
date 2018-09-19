<template>
  <div :class="['network-map-legend', 'elevation-12', hidden ? 'network-map-legend-collapsed' : null]">
    <v-toolbar dense dark color="catena">
      <v-toolbar-title v-if="!hidden" v-html="title" />
      <v-spacer v-if="!hidden" />
      <v-toolbar-side-icon @click="hidden = !hidden">
        <v-icon v-html="hidden ? 'keyboard_arrow_down' : 'keyboard_arrow_up'" />
      </v-toolbar-side-icon>
    </v-toolbar>
    <v-container text-xs-left :hidden="hidden">
      <div v-for="(colors, group) in styling" :key="group">
        <h5>{{ group | camelCaseToTitle }}s</h5>
        <ul>
          <li v-for="(color, label) in colors" v-if="mappedColors.includes(color)" :key="label">
            <v-layout row wrap v-if="setCount(group, color) > 0">
              <v-flex xs9 text-xs-right>
                <h6 v-html="`${lang[group][label]} <span>(${setCount(group, color)})</span>`" />
              </v-flex>
              <v-flex xs3 text-xs-center v-if="group.includes('link')" >
                <catena-css-arrow :color="color" />
              </v-flex>
              <v-flex xs3 text-xs-center v-if="label==='externalSite'" >
                <svg viewBox="0 0 6 6" :class="['svgItem']">
                  <circle r="1.5" cx="3" cy="3" :fill="color" />
                </svg>
              </v-flex>
              <v-flex xs3 text-xs-center v-if="label==='moneySite'" >
                <svg viewBox="50 -100 600 600" transform="scale(1.5)" :class="['svgItem']">
                  <polygon :fill="color" :stroke="color" stroke-width="2"
                  points="350,75  379,161 469,161 397,215
                    423,301 350,250 277,301 303,215
                    231,161 321,161" />
                </svg>
              </v-flex>
              <v-flex xs3 text-xs-center v-if="label==='linkSite'">
                <svg viewBox="-1 -1 5 6" :class="['svgItem']">
                  <rect r="1.5" cx="3" cy="3" width="3" height="3" :fill="color" />
                </svg>
              </v-flex>
            </v-layout>
          </li>
        </ul>
      </div>
      <div v-if="this.fullData.showDecorations && this.fullData.showDecorations.length > 0">
        <h5>Decorations</h5>
        <ul>
          <li v-if="this.fullData.showDecorations.includes('googleindex')">
            <v-layout row wrap>
              <v-flex xs9 text-xs-right>
                <h6 v-html="`Indexed <span>(${setCountDecoration('googleindex')})</span>`" />
              </v-flex>
              <v-flex xs3 text-xs-center>
                <img v-bind:src="this.$globalData.appPathRoot + '/static/icons/google.png'">
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs9 text-xs-right>
                <h6 v-html="`Not Indexed <span>(${setCountDecoration('nogoogleindex')})</span>`" />
              </v-flex>
              <v-flex xs3 text-xs-center>
                <img v-bind:src="this.$globalData.appPathRoot + '/static/icons/nogoogle.png'">
              </v-flex>
            </v-layout>
          </li>
        </ul>
      </div>
    </v-container>
  </div>
</template>
<script>
import networkMapStyling from '../helpers/networkStyling'
import methods from '../helpers/methods'
import filters from '../helpers/filters'

export default {
  name: 'NetworkMapLegend',
  mixins: [
    methods
  ],
  data () {
    return {
      title: 'Legend',
      hidden: false,
      styling: networkMapStyling,
      lang: this.getLangKey('networkMapLegend'),
      colors: [],
      events: this.$store.getters.events,
      mappedColors: [],
      fullData: {}
    }
  },
  created () {
    /**
     * listen to the renderLegend event, so the legend is updated
     * **/
    this.$root.$on(this.events.renderLegend, (data) => {
      this.mapItemsColors(data).getColors()
    })
  },
  methods: {
    setCount (group, color) {
      return this.fullData[group === 'nodeColor' ? 'nodes' : 'links'].filter((link) => !link.hiding && link._color === color).length
    },
    setCountDecoration (group) {
      let count = 'n/a'
      let filterFn = null
      if (group === 'googleindex') {
        filterFn = n => !n.hiding && n.isGIndex
      } else if (group === 'nogoogleindex') {
        filterFn = n => !n.hiding && !n.isGIndex
      }
      if (filterFn) {
        count = this.fullData.nodes.filter(filterFn).length
      }
      return count
    },
    /**
     * @method camelCaseToTitle
     * @using ../helpers/methods.js
     * @param {String} key
     * @return {String}
     * **/
    camelCaseToTitle (key) {
      return filters.camelCaseToTitle(key)
    },
    /**
     * Get all available colors from ../helpers/filters.js and put them in an array
     * @method getColors
     * @return void
     * **/
    getColors () {
      const styling = this.styling
      this.colors = this.colors.concat(Object.values(styling.linkColor))
                               .concat(Object.values(styling.nodeColor))
    },
    /**
     * Get the used colors in for links and nodes in the currently displayed diagram
     * @method mapItemsColors
     * @param {Object} data
     * @return {Object}
     * **/
    mapItemsColors (data) {
      const links = data.links
      const nodes = data.nodes
      this.fullData = data
      this.mappedColors = []
      links.forEach((link) => {
        const color = link._color
        // console.log(link)
        if (!this.mappedColors.includes(color)) {
          this.mappedColors.push(color)
          // console.log('this.mappedColors', this.mappedColors)
        }
      })
      nodes.forEach((node) => {
        const color = node._color
        if (!this.mappedColors.includes(color)) {
          this.mappedColors.push(color)
        }
      })
      return this
    }
  }
}
</script>
<style>
.svgItem {
  height: 20px
}

.network-map-legend ul,
.network-map-legend li,
.network-map-legend h5,
.network-map-legend h6
{
  margin: 0;
  padding: 0;
  list-style: none;
}

.network-map-legend
{
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 200px;
  background: #fff;
}

.network-map-legend h5
{
  font-size: 12px;
  font-weight: bold;
}

.network-map-legend h6
{
  font-size: 11px;
  padding: 6px 6px 6px 0;
}

.network-map-legend h6 span
{
  opacity: .7;
}

.network-map-legend .container
{
  overflow-y: scroll;
  padding-top: 0;
  padding-bottom: 0;
}

.network-map-legend nav.toolbar
{
  margin-bottom: 0;
}

.network-map-legend .toolbar__content
{
  background: none;
}

.network-map-legend.network-map-legend-collapsed
{
  width: auto;
}

.network-map-legend .el-container
{
  padding: 8px;
}
</style>
