<template>
  <v-container grid-list-lg>
    <catena-dashboard-box mode="full" :to="details" :straight-to-link-map="true" :searchable="true" :show="details" :title="details" />
  </v-container>
</template>
<script>
import methods from '../helpers/methods'
import S from 'string'

export default {
  name: 'Details',
  mixins: [
    methods
  ],
  data () {
    return {
      details: this.$route.params.details
    }
  },
  mounted () {
    this.setPageSubTitle(S(this.details).humanize().s)
  }
}
</script>
