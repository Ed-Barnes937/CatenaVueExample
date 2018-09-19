<template>
  <v-container grid-list-lg v-if="headers.length">
    <v-toolbar :class="['grid-toolbar']" dense>
      <v-spacer />
      <v-text-field :color="inputColor" :placeholder="labelSearch" append-icon="search" clearable v-model="search" />
      <catena-download-button :color="inputColor" :label="labelDownload" :href="dataUri" />
    </v-toolbar>
    <v-select :color="inputColor" :items="headers" v-model="selectedColumns" @input="setSelectedColumns" autocomplete multiple chips />
    <v-data-table :rows-per-page-items="rowsPerPage" :headers="filteredHeaders" :search="search" :items="filteredItems" :class="tableElevation">
      <template slot="items" slot-scope="props">
        <td v-for="(column, index) in filteredHeaders" :key="index">
          <span v-if="formattableDates.indexOf(column.value) > -1">{{ props.item[column.value] | formatDate }}</span>
          <a v-else-if="column.value === 'domain_name'" :href="'http://' + props.item[column.value]" target="_blank">{{ props.item[column.value] }}</a>
          <div v-else-if="column.value === 'domain_status'" :title="props.item[column.value] | camelCaseToTitle" class="domain-status-column">
            <v-chip v-if="props.item[column.value]" :color="domainStatuesMap[props.item[column.value]]" text-color="white">{{ props.item[column.value] | camelCaseToTitle }}</v-chip>
            <v-chip v-else-if="!props.item[column.value]" color="orange">n/a</v-chip>
            <v-chip v-else color="orange">{{ props.item[column.value] | camelCaseToTitle }}</v-chip>
          </div>
          <a :title="props.item[column.value]" v-html="props.item[column.value]" v-else-if="emailFields.indexOf(column.value) > -1" :href="'mailto:' + props.item[column.value]" class="email-cell" />
          <span v-else v-html="props.item[column.value]" />
        </td>
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
import methods from '../helpers/methods'
import filters from '../helpers/filters'

export default {
  name: 'WhoIs',
  mixins: [
    methods
  ],
  data () {
    return {
      headers: [],
      search: '',
      dataUri: '',
      rowsPerPage: this.getConfig().rowsPerPage,
      tableElevation: this.getConfig().tableElevation,
      inputColor: this.getConfig().inputColor,
      domainStatuesMap: this.getConfig().domainStatusesMap,
      formattableDates: this.getConfig().formattableDates,
      emailFields: this.getConfig().emailFields,
      labelSearch: this.getLangKey('search'),
      labelDownload: this.getLangKey('download'),
      title: this.getLangKey('whois')
    }
  },
  computed: {
    filteredHeaders () {
      return this.headers.filter(h => h.selected)
    },
    filteredItems () {
      return this.items.map(item => {
        let filtered = Object.assign({}, item)
        this.headers.forEach(header => {
          if (!header.selected) delete filtered[header.value]
        })
        return filtered
      })
    }
  },
  mounted () {
    const store = this.$store
    const data = store.getters.data.whois
    this.inputColor = store.state.cssClasses.inputColor
    this.items = data.items
    this.headers = data.headers
    this.recordsLength = data.recordsLength
    this.dataUri = `${data.dataUri}?download`
    this.selectedColumns = data.selectedColumns
    this.setPageSubTitle(`${this.title} (${this.recordsLength}) ${this.getLangKey('records')}`)
  },
  methods: {
    /**
     * Filter columns
     * @method setSelectedColumns
     * @return {Array}
     */
    setSelectedColumns () {
      this.headers.filter(h => {
        h.selected = this.selectedColumns.indexOf(h.value) > -1
      })
    },
    /**
     * @using ../../filters
     */
    formatDate () {
      return filters.formatDate()
    },
    /**
     * @using ../../filters
     */
    camelCaseToTitle () {
      return filters.camelCaseToTitle()
    }
  }
}
</script>
