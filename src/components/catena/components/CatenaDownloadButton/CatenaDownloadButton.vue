<template>
  <v-btn :class="['catena-download-button']" :color="color" dark @click="click">
    <v-icon>file_download</v-icon>
    <span v-if="label">{{ label }}</span>
  </v-btn>
</template>
<script>
export default {
  name: 'CatenaDownloadButton',
  props: {
    href: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: false
    },
    color: {
      type: String,
      required: false,
      default: 'primary'
    }
  },
  methods: {
    click () {
      window.open(this.href, '_self')
    }
  }
}
</script>
<style>
.catena-download-button.btn .icon,
.catena-download-button.btn span
{
  color: #fff !important;
}
</style>
