<template>
  <div :class="['linkmap-legend', 'elevation-2', expanded ? 'linkmap-legend-expanded' : null]">
    <div @dblclick="expanded = !expanded" :class="['linkmap-legend-titlebar', 'table-layout']">
      <div>
        <div :class="['px-3', 'white--text']" v-html="title" />
        <div :class="['align-right', 'px-3']">
          <v-icon v-if="!expanded" :class="['white--text', 'click-target']" @click.prevent="expanded = !expanded">keyboard_arrow_up</v-icon>
          <v-icon v-else :class="['white--text', 'click-target']" @click.prevent="expanded = !expanded">keyboard_arrow_down</v-icon>
        </div>
      </div>
    </div>
    <div :class="['pa-3', 'linkmap-legend-content']" :hidden="!expanded">
      <h6 v-html="nodesLabel" />
      <div :class="['table-layout']">
        <div v-for="(node, index) in details.nodes" :key="index" :class="[node.render ? null : 'hide-row']">
          <div>{{ node.label }} ({{ node.count }})</div>
          <div :class="['align-right']">
            <span :class="[node.shape, 'elevation-1']" :style="{background: node.color}" />
          </div>
        </div>
      </div>
      <h6 v-html="decorationsLabel" />
      <div :class="['table-layout']">
        <div v-for="(decoration, index) in details.decorations" :key="index" :class="[decoration.render ? null : 'hide-row']">
          <div>{{ decoration.label }}</div>
          <div :class="['align-right']">
            <span :class="['decoration-color-box', 'elevation-1']" :style="{background: decoration.color}" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LinkmapLegend',
  data () {
    return {
      expanded: true
    }
  },
  props: {
    title: {
      type: String,
      default: 'Legend'
    },
    details: {
      type: Object,
      required: true
    },
    nodesLabel: {
      type: String,
      default: 'Nodes'
    },
    decorationsLabel: {
      type: String,
      default: 'Decorations'
    }
  }
}
</script>
<style>
.linkmap-legend .rect,
.linkmap-legend .circle,
.linkmap-legend .decoration-color-box
{
  display: inline-block;
  vertical-align: middle;
  width: 18px;
  height: 18px;
  background: #404040;
}

.linkmap-legend h6,
.linkmap-legend .linkmap-legend-content .table-layout
{
  font-size: 13px;
}

.linkmap-legend .linkmap-legend-content .table-layout
{
  margin: 8px 0;
  color: rgba(1, 1, 1, .54);
}

.linkmap-legend .linkmap-legend-content .table-layout > div > div
{
  padding: 2px 0;
}

.linkmap-legend .circle
{
  border-radius: 100%;
}

.linkmap-legend
{
  position: fixed;
  z-index: 100;
  right: 8px;
  bottom: 8px;
  width: 300px;
  user-select: none;
  background: #fff;
}

.linkmap-legend .linkmap-legend-titlebar
{
  height: 55px;
  line-height: 55px;
  background: #F13D67;
}

.linkmap-legend .decoration-color-box,
.linkmap-legend .align-right > *:first-child
{
  transition: all 500ms cubic-bezier(0.680, -0.550, 0.265, 1.550);
}

.linkmap-legend h6
{
  margin: 0;
  padding: 0;
  font-weight: normal;
  line-height: 18px;
  color: #010101;
}

.linkmap-legend .hide-row .decoration-color-box,
.linkmap-legend .hide-row .align-right > *:first-child
{
  transform: scale(0);
  opacity: 0;
}

.linkmap-legend .hide-row
{
  transform: scale(0);
  position: absolute;
}
</style>
