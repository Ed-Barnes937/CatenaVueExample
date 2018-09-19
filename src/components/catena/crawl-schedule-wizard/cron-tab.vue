<template>
  <div :class="rootCss" v-if="cron">
    <v-layout row>
      <v-flex>
        <v-btn dark block :color="color" @click="applyPreset({minute: 0})">
          <v-icon>schedule</v-icon>&nbsp;<span>{{ lang.hourly }}</span>
        </v-btn>
      </v-flex>
      <v-flex>
        <v-btn dark block :color="color" @click="applyPreset({minute: 0, hour: 0})">
          <v-icon>schedule</v-icon>&nbsp;<span>{{ lang.daily }}</span>
        </v-btn>
      </v-flex>
      <v-flex>
        <v-btn dark block :color="color" @click="applyPreset({minute: 0, hour: 0, dayOfTheWeek: 0})">
          <v-icon>schedule</v-icon>&nbsp;<span>{{ lang.weekly }}</span>
        </v-btn>
      </v-flex>
      <v-flex>
        <v-btn dark block :color="color" @click="applyPreset({minute: 0, hour: 0, dayOfTheMonth: 1})">
          <v-icon>schedule</v-icon>&nbsp;<span>{{ lang.monthly }}</span>
        </v-btn>
      </v-flex>
      <v-flex>
        <v-btn dark block :color="color" @click="reset">
          <v-icon>delete</v-icon>&nbsp;<span>{{ lang.reset }}</span>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex>
        <v-select @input="onInput" :color="color" multiple :label="lang.minute" :items="dropdown(60)" v-model="cron.minute" />
      </v-flex>
      <v-flex>
        <v-select @input="onInput" :color="color" multiple :label="lang.hour" :items="dropdown(24)" v-model="cron.hour" />
      </v-flex>
      <v-flex>
        <v-select @input="onInput" :color="color" multiple :label="lang.dayOfTheMonth" :items="dropdown(31, 1)" v-model="cron.dayOfTheMonth" />
      </v-flex>
      <v-flex>
        <v-select @input="onInput" :color="color" multiple :label="lang.month" :items="dropdown(12, 1)" v-model="cron.month" />
      </v-flex>
      <v-flex>
        <v-select @input="onInput" :color="color" multiple :label="lang.dayOfTheWeek" :items="dropdown(7)" v-model="cron.dayOfTheWeek" />
      </v-flex>
    </v-layout>
    <p :class="['pink--text', 'text-xs-center']">{{ cronsStringHumanized }}</p>
  </div>
</template>
<script>
import cronstrue from 'cronstrue'
import lang from './lang'

export default {
  name: 'CronTab',
  data () {
    return {
      lang,
      rootCss: ['cron-tab'],
      cron: null,
      cronString: null,
      cronsStringHumanized: null
    }
  },
  watch: {
    'cron.minute' () {
      this.option('minute')
    },
    'cron.hour' () {
      this.option('hour')
    },
    'cron.dayOfTheMonth' () {
      this.option('dayOfTheMonth')
    },
    'cron.month' () {
      this.option('month')
    },
    'cron.dayOfTheWeek' () {
      this.option('dayOfTheWeek')
    }
  },
  props: {
    color: {
      type: String,
      default: 'grey'
    }
  },
  mounted () {
    this.reset()
  },
  methods: {
    /**
     * Reset the cron tab
     * @method reset
     * @return void
     * */
    reset () {
      this.cron = {
        minute: ['*'],
        hour: ['*'],
        dayOfTheMonth: ['*'],
        month: ['*'],
        dayOfTheWeek: ['*']
      }
      this.onInput()
    },
    /**
     * Apply a ready-made preset
     * @method applyPreset
     * @param {Object} items
     * @return void
     * */
    applyPreset (items) {
      this.reset()
      Object.keys(items).forEach(item => {
        this.cron[item] = [items[item]]
      })
    },
    /**
     * Set dropdown options
     * @method option
     * @mparam {String} key
     * @return void
     * */
    option (key) {
      const option = this.cron[key]
      const length = option.length
      const asterisk = '*'
      if (!length) {
        this.cron[key] = [asterisk]
        return
      }
      if (length > 1 && option[length - 1] === asterisk) {
        this.cron[key] = [asterisk]
        return
      }
      if (length > 1 && (option[length - 1] === asterisk || option[0] === asterisk)) {
        this.cron[key].splice(option.findIndex((item) => {
          return item === asterisk
        }), 1)
      }
    },
    /**
     * Create the items for the cron field input
     * @method dropdown
     * @param {Number} length
     * @param {Number} at [optional]
     * @return {Array}
     * */
    dropdown (length, at) {
      at = at || 0
      return ['*'].concat(Array.from({length: length}, (value, key) => key + at))
    },
    /**
     * $input event handler
     * @method onInput
     * @return {void}
     * */
    onInput () {
      this.getCron()
      this.$emit('input', {
        cronString: this.cronString,
        cronsStringHumanized: this.cronsStringHumanized
      })
    },
    /**
     * Get the cron value and humanize them
     * @method onInput
     * @return {void}
     * */
    getCron () {
      const cron = this.cron
      const cronString = [
        cron.minute.join(','),
        cron.hour.join(','),
        cron.dayOfTheMonth.join(','),
        cron.month.join(','),
        cron.dayOfTheWeek.join(',')
      ].join(' ')
      this.cronString = cronString
      this.cronsStringHumanized = cronstrue.toString(cronString)
    }
  }
}
</script>
<style>

</style>
