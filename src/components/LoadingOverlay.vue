<template>
  <div class="loading-overlay" :hidden="hidden">
    <v-progress-circular
      v-if="circular"
      color="grey darken-3"
      :indeterminate="indeterminate"
      :width="width"
      :size="64"
    ></v-progress-circular>
    <v-progress-linear
      v-else
      color="warning"
      :height="height"
      :indeterminate="indeterminate"
    ></v-progress-linear>
  </div>
</template>

<script>
  export default {
    name: 'LoadingOverlay',
    data () {
      return {
        hidden: true,
        circular: true, // selects between circular and linear progress bar
        hideTimeout: 0.25, // optional hide timeout (milliseconds * 1000)
        width: 7, // width of the circular progress bar
        indeterminate: true,
        size: 64, // height and width of the circular bar
        height: 4 // height of the linear bar
      }
    },
    created () {
      this.$root.$on('ajax', (state) => {
        if (state) {
          this.hidden = false
          return
        }
        window.setTimeout(() => {
          this.hidden = !state
        }, this.hideTimeout * 1000)
      })
    }
  }
</script>
<style scoped>
.loading-overlay,
.loading-overlay .progress-circular
{
  position: fixed;
}

.loading-overlay
{
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
  background: rgba(33, 33, 33, .46);
  cursor: wait;
}

.loading-overlay .progress-circular
{
  top: 50%;
  left: 50%;
  margin: -32px 0 0 -32px;
}

.loading-overlay .progress-linear
{
  margin: 0;
}
</style>
