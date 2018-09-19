<template>
  <div :class="['catena-avatar']" :style="style">{{ abbr }}</div>
</template>

<script>
export default {
  name: 'Avatar',
  computed: {
    style () {
      return {
        backgroundColor: this.background,
        height: `${this.size}px`,
        width: `${this.size}px`,
        lineHeight: `${this.size}px`,
        color: this.color
      }
    },
    abbr () {
      const label = this.label
      if (!this.truncate) {
        return label
      }
      return label.split('.').map((item) => {
        return item[0]
      })
        .join('')
        .toUpperCase()
    }
  },
  props: {
    truncate: {
      type: Boolean,
      default: false,
      required: false
    },
    background: {
      type: String,
      required: false,
      default: '#ccc'
    },
    color: {
      type: String,
      required: false,
      default: '#000'
    },
    size: {
      type: [Number, String],
      required: false,
      default: 36
    },
    label: {
      type: [Number, String],
      required: false
    }
  }
}
</script>
<style>
.catena-avatar
{
  border-radius: 100%;
  text-align: center;
  color: #fff;
  font-weight: bold;
  display: inline-block;
  vertical-align: middle;
  user-select: none;
  font-size: 12px;
}
</style>
