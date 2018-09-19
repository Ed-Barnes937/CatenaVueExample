<template>
  <v-dialog v-model="open" max-width="document.body.clientWidth">
    <v-card>
      <v-card-title class="headline text-xs-left" v-html="domain" />
      <v-card-text>
        <v-toolbar  :class="['grid-toolbar']" dense>
          <v-spacer />
          <v-text-field :color="inputColor" :placeholder="labelSearch" append-icon="search" v-model="search" />
          <v-select :color="inputColor" :class="['search-in-select']" :items="columns" v-model="searchIn" single-line />
        </v-toolbar>
        <v-data-table
          :rows-per-page-items="rowsPerPageItems"
          :pagination.sync="pagination"
          :headers="columns"
          :class="['elevation-1', 'striped-table']"
          :items="filteredGridData">
          <template slot="items" slot-scope="props">
            <td :class="['text-xs-left']" v-for="(column, index) in columns" :key="index" v-html="props.item[column.value]" />
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :color="inputColor" dark raised @click.native="open = false" v-html="getLangKey('close')" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
  import Mixins from '../helpers/methods'

  export default {
    name: 'TabularDataPopup',
    data () {
      return {
        search: '',
        domain: '',
        searchIn: '',
        labelSearch: this.getLangKey('search'),
        inputColor: this.$store.state.cssClasses.inputColor,
        open: false,
        columns: [],
        items: [],
        rowsPerPageItems: this.getConfig().rowsPerPageItems,
        pagination: {
          rowsPerPage: this.getConfig().rowsPerPage
        }
      }
    },
    mixins: [Mixins],
    computed: {
      filteredGridData () {
        return this.items.filter((data) => {
          return data[this.searchIn].toLowerCase().indexOf(this.search.toLowerCase()) >= 0
        })
      }
    },
    created () {
      this.$root.$on(this.$store.getters.events.showTabularDataPopup, (data) => {
        this.items = data.items
        this.columns = data.columns
        this.domain = data.domain
        this.open = true
        this.searchIn = data.searchIn || ''
      })
    }
  }
</script>
