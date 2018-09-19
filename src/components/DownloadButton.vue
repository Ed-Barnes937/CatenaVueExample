<template>
  <v-btn tag="a" :href="href" :label="label" :color="color" :download="download" class="download-button">
    <v-icon>file_download</v-icon>
    <span v-if="label === true">download</span>
  </v-btn>
</template>

<script>
  export default {
    name: 'DownloadButton',
    data () {
      return {
        href: this.$attrs.href,
        download: this.$attrs.fileName,
        color: this.$attrs.color || 'catena',
        label: this.$attrs.label
      }
    }
  }
</script>
<style scoped>
.download-button.primary *,
.download-button.indigo *,
.download-button.catena *
{
  color: #e6ebed !important;
}

.download-button span
{
  padding-left: 10px;
}
</style>
