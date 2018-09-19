<template>
  <div :class="['svg-gauge', block ? 'svg-gauge-block' : null]" :style="gaugeStyle">
    <svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 32 32">
      <g fill="none" fill-rule="evenodd" :stroke-width="stroke">
        <circle :fill="fill" :cx="axis" :cy="axis" :r="radius" :stroke="trackColor"/>
        <circle :cx="axis" :cy="axis" :r="radius" :stroke="fillColor" stroke-dasharray="75" :stroke-dashoffset="offset" :class="[!value ? 'fill-hide' : null]"/>
      </g>
      <text x="50%" :fill="labelColor" :font-size="labelSize" y="50%" text-anchor="middle" alignment-baseline="middle">{{ value }}</text>
    </svg>
  </div>
</template>
<script>
export default {
  name: 'SvgGauge',
  data () {
    return {
      radius: 12,
      axis: 16,
      labelStyle: {
        color: this.labelColor,
        fontSize: `${this.labelSize}px`
      },
      gaugeStyle: {
        width: `${this.size}px`,
        height: `${this.size}px`
      }
    }
  },
  props: {
    fill: {
      type: String,
      default: 'none'
    },
    value: {
      type: Number,
      required: true
    },
    size: {
      type: Number,
      default: 64
    },
    trackColor: {
      type: String,
      default: '#ccc'
    },
    stroke: {
      type: Number,
      default: 3
    },
    fillColor: {
      type: String,
      default: '#444'
    },
    labelColor: {
      type: String,
      default: '#383b40'
    },
    labelSize: {
      type: Number,
      default: 7
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    circumference () {
      return this.radius * 2 * Math.PI
    },
    offset () {
      return (this.circumference / 100) * (100 - this.value)
    }
  }
}
</script>
<style>
.svg-gauge
{
  display: inline-block;
  vertical-align: middle;
  cursor: default;
}

.svg-gauge.svg-gauge-block
{
  display: block;
}

.svg-gauge text
{
  font-family: Roboto, Helvetica, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.svg-gauge circle
{
  transition: stroke-dashoffset 300ms ease-in-out;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.svg-gauge circle:last-child
{
  transform: rotate(270deg);
  transform-origin: center center;
}

.svg-gauge .fill-hide
{
  opacity: 0;
}
</style>
