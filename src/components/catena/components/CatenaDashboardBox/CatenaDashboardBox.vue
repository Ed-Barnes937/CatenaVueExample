<template>
  <div>
    <v-card v-if="ready">
      <v-card-text :class="['pa-0']">
        <v-toolbar dense>
          <v-toolbar-title :class="['to-sentence-case']" v-html="title" />
          <v-spacer />
          <v-toolbar-items>
            <v-switch :disabled="true" :color="buttonColor" v-model="showMineOnly" :class="['mt-2', 'mr-2']" />
            <v-btn :disabled="true" icon @click.native="dialog = true">
              <v-icon color="pink">settings</v-icon>
            </v-btn>
            <v-btn v-if="mode === 'compact'" icon router :to="to">
              <v-icon :color="buttonColor">mdi-window-maximize</v-icon>
            </v-btn>
            <v-btn v-if="mode === 'full'" icon router to="/dashboard">
              <v-icon :color="buttonColor">mdi-window-minimize</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div :class="['ml-2']" v-if="searchable">
          <v-text-field placeholder="Type to filter columns..." :hide-details="true" color="pink" append-icon="search" v-model="filterInputValue" @input="onFilterTextBoxChanged" />
        </div>
        <ag-grid v-if="columnDefs.length && rowData.length" :class="['ag-theme-material']" :grid-options="gridOptions" :row-data="rowData" :column-defs="columnDefs" />
      </v-card-text>
    </v-card>
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title :class="['headline', 'to-sentence-case']">{{ title }} Settings ({ getUserRole.label })</v-card-title>
        <v-card-text></v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn flat @click.native="closeDialog(true)">Save</v-btn>
          <v-btn flat @click.native="closeDialog(false)">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import {AgGridVue} from 'ag-grid-vue'
import methods from '../../../../helpers/methods'

export default {
  name: 'CatenaDashboardBox',
  mixins: [
    methods
  ],
  components: {
    'ag-grid': AgGridVue
  },
  data () {
    return {
      /**
       *
       * @TODO MI why start with ready: false? nothing appears this way until the loading has completed :-(
       *
       */
      ready: true,
      dialog: false,
      showMineOnly: true,
      filterInputValue: null,
      buttonColor: 'pink',
      gridOptions: {
        onRowClicked: this.onRowClicked,
        showToolPanel: this.mode === 'full',
        pagination: true,
        paginationPageSize: this.mode === 'full' ? 10 : 3,
        enableSorting: true,
        animateRows: true,
        onGridReady ($event) {
          $event.api.sizeColumnsToFit()
        },
        domLayout: 'autoHeight'
      },
      labels: {
        product: 'Product',
        portfolio: 'Portfolio',
        ndc: 'NDC',
        nrDomainsLinks: 'Number of Domain Links',
        domains: 'Domains'
      },
      rowData: [],
      columnDefs: []
    }
  },
  props: {
    /**
     * Grid title
     * */
    title: {
      type: String,
      required: true
    },
    /**
     * Expaded view route
     * */
    to: {
      type: String,
      required: true
    },
    /**
     * Grid display type
     * */
    show: {
      type: String,
      required: true
    },
    /**
     * Allow grid filtering
     * */
    searchable: {
      type: Boolean,
      required: false
    },
    /**
     * Grid mode
     * 'compact', 'full'
     * */
    mode: {
      type: String,
      required: false,
      default: 'compact'
    },
    /**
     * Navigate straight to the linkmaps, skip the full view
     * */
    straightToLinkMap: {
      type: Boolean,
      required: false
    }
  },
  computed: {
    /**
     * Get the user role from Vuex
     * @computed getUserRole
     * @return String
     * */
    getUserRole () {
      return this.$store.getters.selectedRole
    }
  },
  watch: {
    /**
     * Show user-defined view only
     * @watch showMineOnly
     * @return String
     * */
    showMineOnly () {
      console.log('showMineOnly', this.showMineOnly)
    }
  },
  mounted () {
    this.getBoxData()
    let gridData = {}
    let rowData = []
    const store = this.$store
    const data = store.getters.data
    const columnDefs = []
    switch (this.show) {
      case 'domains':
        gridData = data.domains
        break
      case 'products':
        gridData = store.getters.data.ipAddresses
        if (gridData && gridData.items && gridData.items.forEach) {
          gridData.items.forEach(item => {
            if (data.moneySite.domains.indexOf(item.domain.replace(/www\./g, '')) > -1) {
              rowData.push(item)
            }
          })
        }
        break
      default:
        gridData = this[this.show]
        break
    }
    if (!rowData.length && gridData && gridData.items) {
      rowData = gridData.items
    } else {
      this.log('[DASHBOARD] no grid data, no grid data items', gridData, '#b00')
    }
    if (gridData && gridData.headers && gridData.headers.forEach) {
      gridData.headers.forEach(header => {
        columnDefs.push({
          headerName: header.text,
          field: header.value
        })
      })
      this.columnDefs = columnDefs
      this.rowData = rowData
    } else {
      this.log('[DASHBOARD] no grid data, no grid data headers or not an array', gridData, '#b00')
    }
  },
  beforeDestroy () {
  },
  methods: {
    /**
     * Simple grid filtering
     * @method onFilterTextBoxChanged
     * @return void
     * */
    onFilterTextBoxChanged () {
      this.gridOptions.api.setQuickFilter(this.filterInputValue)
    },
    /**
     * Navigate to the linkmaps
     * @method onRowClicked
     * @param {Object} $event
     * @return void
     * /dashboard/:selection/:overview/linkmap
     * */
    onRowClicked ($event) {
      const show = this.show
      const store = this.$store
      const routes = {
        portfolioassetnetworkrecords: 'domainName',
        portfolioassetproductrecords: 'domainName',
        portfoliorecords: 'name'
      }
      const portfolio = show !== 'portfoliorecords' ? $event.data.portfolioName : $event.data.name
      const overview = $event.data[routes[show]]
      store.commit('setLinkmapNodes', store.getters.extractLinkmapNodes(portfolio))
      if (!this.straightToLinkMap) {
        return
      }
      this.$router.push({
        path: `/dashboard/${show}/${overview}/linkmap`
      })
    },
    /**
     * Call the API to get the box data
     * @method getBoxData
     * @return void
     * */
    getBoxData () {
      const details = this.show
      const url = `${this.$globalData.config.apiEndpoint}${details}`
      const columnDefs = []
      const root = this.$root
      root.$emit('ajax', true)
      this.$http(url)
      .then(response => {
        const rowData = response.data
        if (rowData.length > 0) {
          Object.keys(rowData[0]).forEach(field => {
            const columnDef = {
              headerName: this.labels[field],
              field
            }
            columnDefs.push(columnDef)
          })
          this.columnDefs = columnDefs
        }
        this.rowData = rowData
        // this.ready = true
        this.storeRowData({
          type: this.show,
          rows: this.rowData
        })
        root.$emit('ajax')
      })
      // this catch clause allows the .$http to fail without blocking the ui.
      .catch(err => {
        alert('There was a problem loading data from\n\n' + url + '\n\n' + err)
        root.$emit('ajax')
      })
    },
    storeRowData (data) {
      this.$store.commit('rowData', data)
    },
    /**
     * Close the dialog and optionally save the settings
     * @method closeDialog
     * @param {Boolean} save
     * @return void
     * **/
    closeDialog (save) {
      this.dialog = false
      if (save) {
        this.saveSettings()
      }
    },
    /**
     * Save the settings
     * @method saveSettings
     * **/
    saveSettings () {
      console.log('save settings', this.title, this.getUserRole)
    }
  }
}
</script>
