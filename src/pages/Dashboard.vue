<template>
  <v-container grid-list-lg>
    <v-layout row wrap>
      <v-flex lg6>
        <catena-dashboard-box show="portfoliorecords" title="Portfolios" to="dashboard/portfoliorecords" :straight-to-link-map="true"/>
      </v-flex>
      <v-flex lg6>
        <catena-dashboard-box show="portfolioassetproductrecords" title="Products" to="dashboard/portfolioassetproductrecords" :straight-to-link-map="true"/>
      </v-flex>
      <v-flex lg6>
        <catena-dashboard-box show="portfolioassetnetworkrecords" title="Domains" to="dashboard/portfolioassetnetworkrecords" :straight-to-link-map="true"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import methods from '../helpers/methods'

export default {
  name: 'Dashboard',
  mixins: [
    methods
  ],
  mounted () {
    this.setPageSubTitle(this.getLangKey('dashboard'))
  }
}
</script>
