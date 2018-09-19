<template>
  <div :class="['catena-css-arrow']" :style="style" :width="width" />
</template>
<script>
export default {
  name: 'CatenaCssArrow',
  created () {
    // hexadecimal or named color value
    this.color = this.$attrs.color || '#404040'
    // 'dotted' | 'dashed' | 'solid' | 'double'
    this.lineStyle = this.$attrs.lineStyle || 'solid'
    this.width = this.$attrs.width || '100%'
    this.style = {
      borderColor: this.color,
      borderTopStyle: this.lineStyle,
      width: this.width
    }
  }
}
</script>
<style>
.catena-css-arrow
{
  height: 0;
  position: relative;
  border-top: solid 2px transparent;
  display: inline-block;
  width: 100%;
  vertical-align: middle;
}

.catena-css-arrow::after
{
  content: "";
  display: block;
  width: 0;
  height: 0;
  border: solid 6px transparent;
  border-left-color: inherit;
  position: absolute;
  right: -12px;
  top: -7px;
}
</style>
