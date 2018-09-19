<template>
  <v-container grid-list-lg v-if="headers.length">
    <v-toolbar :class="['grid-toolbar']" dense>
      <v-spacer />
      <v-text-field :color="inputColor" :placeholder="labelSearch" value="Search" append-icon="search" v-model="search" />
      <v-select :color="inputColor" class="search-in-select" :items="headers" v-model="searchIn" single-line />
      <catena-download-button :color="inputColor" :label="labelDownload" :href="dataUri" />
    </v-toolbar>
    <v-data-table :rows-per-page-items="rowsPerPage" :headers="headers" :search="search" :class="tableElevation" :items="filteredGridData">
      <template slot="items" slot-scope="props">
        <td v-for="(column, index) in headers" :key="index">
          <a v-if="column.value === 'to'" :href="prependProtocolToDomain(props.item[column.value])" target="_blank">{{ props.item[column.value].replace('www.', '') }}</a>
          <span v-else v-html="props.item[column.value]" />
        </td>
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
import methods from '../helpers/methods'

export default {
  name: 'GoogleIndex',
  mixins: [methods],
  data () {
    return {
      headers: [],
      search: '',
      searchIn: 'to',
      inputColor: this.getConfig().inputColor,
      tableElevation: this.getConfig().tableElevation,
      rowsPerPage: this.getConfig().rowsPerPage,
      labelSearch: this.getLangKey('search'),
      labelDownload: this.getLangKey('download'),
      title: this.getLangKey('googleIndex')
    }
  },
  mounted () {
    const store = this.$store
    const data = store.getters.data.googleIndex
    this.inputColor = store.state.cssClasses.inputColor
    this.items = data.items
    this.headers = data.headers
    this.recordsLength = data.recordsLength
    this.dataUri = `${data.dataUri}?download`
  },
  computed: {
    filteredGridData () {
      const items = this.items.filter((data) => {
        if (data[this.searchIn]) {
          return data[this.searchIn].toLowerCase().indexOf(this.search.toLowerCase()) >= 0
        }
      })
      this.setPageSubTitle(`${this.title} (${items.length}) ${this.getLangKey('records')}`)
      return items
    }
  }
}
</script>
<style>
.google-index tbody td:nth-child(2) {
  width: 33%;
  word-break: break-all;
}
</style>
