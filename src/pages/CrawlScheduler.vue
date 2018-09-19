<template>
  <v-container grid-list-lg>
    <v-layout row wrap>
      <v-flex>
        <crawl-schedule-wizard />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import CrawlScheduleWizard from '../components/catena/crawl-schedule-wizard'

export default {
  name: 'CrawlScheduler',
  components: {
    CrawlScheduleWizard
  },
  // mixins: [
  //   methods
  // ],
  mounted () {
    // this.setPageSubTitle(this.getLangKey('dashboard'))
  }
}
</script>
