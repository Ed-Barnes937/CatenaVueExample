<template>
  <div :class="['catena-loading-overlay']" :hidden="hidden">
    <v-icon>mdi-loading</v-icon>
  </div>
</template>
<script>
export default {
  name: 'CatenaLoadingOverlay',
  data () {
    return {
      hidden: true
    }
  },
  created () {
    this.$root.$on('ajax', (state) => {
      if (state) {
        this.hidden = false
        return
      }
      this.hidden = !state
    })
  }
}
</script>
<style>
.catena-loading-overlay,
.catena-loading-overlay .icon
{
  position: fixed;
}

.catena-loading-overlay
{
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
  background: rgba(33, 33, 33, .46);
  cursor: wait;
}

.catena-loading-overlay .icon
{
  font-size: 96px;
  font-weight: bold;
}

.catena-loading-overlay .icon
{
  top: 50%;
  left: 50%;
  margin: -64px 0 0 -64px;
}

.catena-loading-overlay .icon
{
  animation: rotating 2s linear infinite;
}

@keyframes rotating
{
  from
  {
    transform: rotate(0deg);
  }

  to
  {
    transform: rotate(360deg);
  }
}
</style>
