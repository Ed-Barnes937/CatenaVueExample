<template>
  <div class="['catena-css-circle']" :style="style" />
</template>
<script>
export default {
  name: 'CatenaCssCircle',
  created () {
    this.radius = this.$attrs.radius || 32
    this.color = this.$attrs.color || '#404040'
    this.style = {
      background: this.color,
      width: `${this.radius}px`,
      height: `${this.radius}px`
    }
  }
}
</script>
<style>
.catena-css-circle
{
  border-radius: 100%;
  margin: 4px auto;
  display: inline-block;
  vertical-align: middle;
  box-sizing: border-box;
}
</style>
