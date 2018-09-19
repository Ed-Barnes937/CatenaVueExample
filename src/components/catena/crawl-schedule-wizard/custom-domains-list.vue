<template>
  <div :class="rootCss">
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex lg6>
          <v-text-field :placeholder="lang.addDomain" :label="lang.domain" :color="color" v-model="domain" prepend-icon="add_box" @keyup.enter="addDomain" />
        </v-flex>
        <v-flex lg3>
          <custom-domains-uploader @error="showError" @input="onDomainsInput" :color="color" />
        </v-flex>
        <v-flex lg3>
          <v-btn :color="color" block dark @click="clearList">
            <v-icon>clear</v-icon>
            <span>{{ lang.clearList }}</span>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
    <v-alert :value="error" v-model="error" dismissible :class="['mb-4']">{{ lang.unsupportedFileType }}</v-alert>
    <div :class="['ma-2']">
      <v-text-field :placeholder="lang.filterDomains" append-icon="search" v-model="search" :color="color" v-if="domains.length" />
    </div>
    <div :class="[`${rootCss[0]}-list-wrapper`, 'elevation-2']" v-if="domains.length && filteredItems.length">
      <v-list>
        <v-list-tile v-for="(domain, index) in filteredItems" :key="index">
          <v-list-tile-content>
            <v-list-tile-title>{{ domain }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple @click="removeDomain(domain)">
              <v-icon :color="color">delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </div>
  </div>
</template>
<script>
import lang from './lang'
import CustomDomainsUploader from './custom-domains-uploader'

export default {
  name: 'CustomDomainsList',
  components: {
    CustomDomainsUploader
  },
  data () {
    return {
      lang,
      search: '',
      domains: [],
      domain: null,
      error: false,
      rootCss: ['custom-domains-list']
    }
  },
  props: {
    color: {
      type: String,
      default: 'grey'
    }
  },
  computed: {
    /**
     * Filtering of the domains list
     * @computed filteredItems
     * @return {Array}
     * */
    filteredItems () {
      return this.domains.filter(domain => {
        return domain.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    }
  },
  watch: {
    domains () {
      this.$emit('input', this.domains)
    }
  },
  methods: {
    /**
     * Show error if the uploaded file type is not supported
     * @method showError
     * @return {void}
     * */
    showError () {
      this.error = true
    },
    test (domain) {
      return /^[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,}$/i.test(domain)
    },
    /**
     * Add domain to the list
     * @method addDomain
     * @return {void}
     * */
    addDomain () {
      const domain = this.domain
      if (this.test(domain)) {
        this.domains.push(domain)
      }
      this.domain = null
    },
    /**
     * Clear the domains list
     * @method clearList
     * @return {void}
     * */
    clearList () {
      this.domains = []
      this.domain = ''
      this.search = ''
    },
    /**
     * Remove domain from the list
     * @method removeDomain
     * @param {String} domain
     * @return {void}
     * */
    removeDomain (domain) {
      this.domains.splice(this.domains.findIndex(item => {
        return item === domain
      }), 1)
      this.search = ''
    },
    /**
     * Concatenate domains on manual input
     * @method onDomainsInput
     * @param {Array} domains
     * @return {void}
     * */
    onDomainsInput (domains) {
      this.domains = this.domains.concat(domains)
    }
  }
}
</script>
<style>
.custom-domains-list .custom-domains-list-list-wrapper
{
  max-height: 210px;
  overflow: auto;
}
</style>
