<template>
  <div :class="['context-menu', 'elevation-12']" :style="style" :hidden="hidden">
    <v-list>
      <v-list-tile @click="event(item.event)" v-for="(item, index) in items" :key="index">
        <v-list-tile-content>
          <v-list-tile v-html="item.title" />
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </div>
</template>
<script>
export default {
  name: 'CatenaContextMenu',
  data () {
    return {
      items: [],
      hidden: true,
      style: {
        top: 0,
        left: 0
      },
      elementData: {}
    }
  },
  created () {
    this.items = this.$attrs.items
  },
  methods: {
    position (x, y) {
      this.style = {
        left: `${x}px`,
        top: `${y}px`
      }
      return this
    },
    show () {
      this.hidden = false
    },
    hide () {
      this.hidden = true
    },
    event (event) {
      this.$root.$emit(event, this.elementData)
      this.hide()
    },
    setItems (items) {
      this.items = items
    }
  }
}
</script>
<style>
.context-menu
{
  position: fixed;
  width: 200px;
  z-index: 1000;
  background: #fff;
}
</style>
