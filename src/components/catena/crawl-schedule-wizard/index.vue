<template>
  <div :class="rootCss" v-if="bootstrapData">
    <v-card>
      <v-card-text>
        <v-container grid-list-lg>
          <v-layout row :class="[`${rootCss[0]}-steps-header`]">
            <v-flex v-for="(step, index) in steps" :key="index">
              <div :class="[`${rootCss[0]}-step-circle`, 'white--text', index === currentStep ? 'pink' : 'grey l-100']">{{ index + 1 }}</div>
              <div :class="[`${rootCss[0]}-step-label`, index === currentStep ? 'pink--text' : 'grey--text l-100']">
                <strong>{{ step.label }}</strong>
              </div>
              <div :class="[`${rootCss[0]}-step-line`, index === currentStep ? 'pink' : 'grey l-100']" />
            </v-flex>
          </v-layout>
          <v-layout row v-for="(step, index) in steps" :key="index" :hidden="index !== currentStep">
            <v-flex :class="['controls-area']">
              <template v-for="control in step.controls">
                <v-text-field :placeholder="control.label" :color="color" :label="control.label" v-model="schedule.name" v-if="control.type === 'text'" />
                <v-select :multiple="control.multiple" :color="color" @input="onInput($event, control.name)" :label="control.label" v-if="control.type === 'select'" :items="control.items" v-model="control.model" />
                <v-checkbox @change="onCheckBoxInput($event, control.name)" :color="color" :label="control.label" v-if="control.type === 'checkbox'" v-model="control.model" />
                <custom-domains-list @input="onCustomDomainsInput($event, control.name)" :color="color" v-if="control.type === 'custom-domains-list'" />
                <v-alert :value="true" v-if="control.type === 'alert'">{{ control.text }}</v-alert>
              </template>
              <template v-if="index === 3">
                <p :class="['pink--text', 'text-xs-center']">
                  {{ lang.readyToStart(lang[schedule.profile], cronsStringHumanized ? cronsStringHumanized.toLowerCase() : null) }}
                </p>
              </template>
              <template v-if="index === 2">
                <cron-tab @input="onCronTabInput" :color="color" />
              </template>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <div :class="['table-layout', 'ma-4']">
          <div>
            <div>
              <v-btn :class="['action-button']" :color="color" @click="navigate('prev')" :disabled="currentStep === 0">
                <span :class="['white--text']">{{ lang.previous }}</span>
              </v-btn>
              <v-btn :class="['action-button']" :color="color" @click="navigate('next')" :disabled="currentStep === steps.length - 1 || (!schedule.profile || !schedule.name)">
                <span :class="['white--text']">{{ lang.next }}</span>
              </v-btn>
            </div>
            <div :class="['align-right']">
              <v-btn :class="['action-button']" color="success" @click="start" :disabled="currentStep !== steps.length - 1">
                <span :class="['white--text']">{{ lang.start }}</span>
              </v-btn>
            </div>
          </div>
        </div>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
import CustomDomainsList from './custom-domains-list'
import CronTab from './cron-tab'
import lang from './lang'
import steps from './steps'

export default {
  name: 'CrawlScheduleWizard',
  components: {CronTab, CustomDomainsList},
  data () {
    return {
      lang,
      steps,
      currentStep: 0,
      color: 'pink',
      bootstrapData: null,
      cronsStringHumanized: null,
      bootstrapUrl: '/static/cron-schedule-wizard/bootstrap.json',
      rootCss: ['crawl-schedule-wizard'],
      schedule: {profile: null, name: null, user: null, config: {}}
    }
  },
  watch: {
    'schedule.profile' () {
      const profile = this.schedule.profile
      switch (profile) {
        case 'domain-vault':
          this.steps[1].controls = [{
            type: 'select',
            label: lang.statuses,
            name: 'statuses',
            multiple: true,
            items: this.bootstrapData.statuses,
            model: []
          }, {
            type: 'select',
            label: lang.portfolios,
            name: 'portfolios',
            multiple: true,
            items: this.bootstrapData.portfolios,
            model: []
          }, {
            type: 'select',
            label: lang.types,
            name: 'types',
            multiple: true,
            items: this.bootstrapData.types,
            model: []
          }, {
            type: 'checkbox',
            label: lang.includeReferringDomains,
            name: 'includeReferringDomains',
            model: false
          }]
          break
        case 'custom-domains-list':
          this.steps[1].controls = [{
            type: 'custom-domains-list',
            name: 'customDomainsList'
          }]
          break
        case 'go-link':
          this.steps[1].controls = [{type: 'alert', text: lang.noConfigOptions}]
          this.currentStep = 2 // jump directly to step 3, as 'go-link' profile does not have any config options
          break
      }
    }
  },
  mounted () {
    this.bootstrapApp()
  },
  methods: {
    /**
     * Get initial data from the API
     * @method bootstrapApp
     * @return {void}
     * */
    bootstrapApp () {
      this.$http(this.bootstrapUrl)
        .then(response => {
          this.bootstrapData = response.data
        })
        .catch(error => {
          console.error('[DISCOVERY/SCHEDULER]', error)
        })
    },
    /**
     * Previous and next button click handlers
     * @method dropdown
     * @param {String} direction
     * @return {void}
     * */
    navigate (direction) {
      const currentStep = this.currentStep
      switch (direction) {
        case 'prev':
          this.currentStep = currentStep !== 0 ? currentStep - 1 : currentStep
          break
        case 'next':
          this.currentStep = currentStep + 1
          break
      }
    },
    /**
     * On profile selection input
     * @method onInput
     * @param {String} $event
     * @param {String} name
     * @return {void}
     * */
    onInput ($event, name) {
      if (name === 'profile') {
        this.schedule[name] = $event
      } else {
        this.schedule.config[name] = $event
      }
    },
    /**
     * Start a crawl
     * @method start
     * @return {void}
     * */
    start () {
      this.schedule.user = this.$store.getters.profile
      console.log('start crawl', this.schedule)
    },
    /**
     * $input event handler for the cron tab component
     * @method onCronTabInput
     * @param {Object} data
     * @return {void}
     * */
    onCronTabInput (data) {
      this.schedule.config.cron = data.cronString
      this.cronsStringHumanized = data.cronsStringHumanized
    },
    /**
     * $change event handler for checkboxes
     * @method onCheckBoxInput
     * @param {Boolean} $event
     * @param {String} name
     * @return {void}
     * */
    onCheckBoxInput ($event, name) {
      this.schedule.config[name] = $event
    },
    /**
     * $input event handler for the custom domains list component
     * @method onCustomDomainsInput
     * @param {Array} $event
     * @param {String} name
     * @return {void}
     * */
    onCustomDomainsInput ($event, name) {
      this.schedule.config[name] = $event
    }
  }
}
</script>
<style>
.crawl-schedule-wizard .crawl-schedule-wizard-step-label,
.crawl-schedule-wizard .crawl-schedule-wizard-step-circle
{
  display: inline-block;
  vertical-align: middle;
}

.crawl-schedule-wizard .crawl-schedule-wizard-step-label
{
  text-transform: uppercase;
}

.crawl-schedule-wizard .crawl-schedule-wizard-step-circle
{
  border-radius: 100%;
  height: 32px;
  font-weight: 500;
  width: 32px;
  line-height: 32px;
  text-align: center;
}

.crawl-schedule-wizard .action-button
{
  width: 128px;
}

.crawl-schedule-wizard .crawl-schedule-wizard-step-line
{
  height: 2px;
  background: #ccc;
  margin: 8px 0 0;
}

.controls-area
{
  min-height: 200px;
}
</style>
