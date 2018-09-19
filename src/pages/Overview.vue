<template>
  <v-container grid-list-lg>
    <v-layout row wrap v-if="params.selection !== 'portfolios'">
      <v-flex lg6>
        <v-card>
          <v-card-title>Whois records for {{ params.overview }}</v-card-title>
          <v-card-text>
            <v-list two-line v-if="whois">
              <template v-for="(value, key) in whois">
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ S(key).humanize().s }}:</v-list-tile-title>
                    <v-list-tile-sub-title>{{ value }}</v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-divider />
              </template>
            </v-list>
            <v-alert type="error" :value="true" v-else>
              No whois record is available for <strong>{{ params.overview }}</strong> at the moment.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex lg6>
        <v-card>
          <v-card-title>Found in allMSLinks DTO</v-card-title>
          <v-card-actions>
            <to-link-maps :selections="selections" :params="params" />
          </v-card-actions>
          <v-card-text>
            <v-expansion-panel v-if="allMsLinks">
              <v-expansion-panel-content v-for="(value, key) in allMsLinks" :key="key">
                <div slot="header">{{ key }} (links count: {{ value.count }})</div>
                <div>
                  <div v-for="(linkValue, linkKey) in value.links">
                    <h5 :class="['px-4', 'grey--text']">{{ linkKey }}</h5>
                    <v-list two-line :class="['mx-4', 'my-4', 'elevation-12']">
                      <template v-if="linkValue.length" v-for="(link, index) in linkValue">
                        <v-list-tile>
                          <v-list-tile-action>
                            <v-checkbox color="pink" :value="link" v-model="selections"></v-checkbox>
                          </v-list-tile-action>
                          <v-list-tile-content>
                            <v-list-tile-title>from: {{ link.f }}</v-list-tile-title>
                            <v-list-tile-sub-title>to: {{ link.t }}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-divider v-if="linkValue.length - 1 > index" />
                      </template>
                    </v-list>
                  </div>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-alert type="error" :value="true" v-else>
              No whois record is available for <strong>{{ params.overview }}</strong> at the moment.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <to-link-maps :selections="selections" :params="params" />
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import S from 'string'
import methods from '../helpers/methods'

export default {
  name: 'Overview',
  mixins: [
    methods
  ],
  components: {
    'to-link-maps': {
      props: {
        selections: {
          type: Array,
          required: true
        },
        params: {
          type: Object,
          required: true
        }
      },
      methods: {
        toLinkMaps () {
          console.log('toLinkMaps', this.selections, this.params)
          // at this point, selection and params should be stored in Vuex, so they are accessed by the linkmaps page
          this.$router.push({
            name: 'dashboard-selection-overview-linkmap'
          })
        }
      },
      template: `<v-btn @click="toLinkMaps()" block color="pink" dark>linkmaps <v-icon>chevron_right</v-icon></v-btn></v-card-actions>`
    }
  },
  data () {
    return {
      selections: [],
      params: this.$route.params,
      whois: null,
      allMsLinks: null,
      S: S
    }
  },
  mounted () {
    const params = this.params
    const selection = params.selection
    if (selection !== 'portfolios') {
      this.getWhoisData()
      this.getAllMSLinksData()
      this.setPageSubTitle(`${S(selection).humanize().s} &raquo; ${params.overview}`)
    }
  },
  methods: {
    /**
     * @method getAllMSLinksData
     * @return void
     * */
    getAllMSLinksData () {
      const data = this.$store.getters.data.allMSLinks[this.params.overview]
      if (data) {
        this.allMsLinks = data
        console.log('getAllMSLinksData', this.allMsLinks)
      }
    },
    /**
     * @method getWhoisData
     * @return void
     * */
    getWhoisData () {
      let whois = this.$store.getters.data.whois.items.filter(item => item.domain_name.replace(/www\./, '') === this.params.overview)
      if (whois && whois.length) {
        this.whois = whois[0]
        console.log('getWhoisData', this.whois)
      }
    }
  }
}
</script>
