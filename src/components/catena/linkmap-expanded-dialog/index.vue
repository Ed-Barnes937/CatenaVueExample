<template>
  <v-dialog hide-overlay persistent :value="show" :class="['cc-linkmap-dialog', 'cc-linkmap-expanded-dialog']" max-width="auto">
    <v-card width="auto" :style="style" :class="['cc-linkmap-dialog ']">
      <v-card-title>
        <div :class="['table-layout']">
          <div>
            <div :class="['avatar-cell']">
              <avatar color="#fff" :background="details.color" :label="details.avatar" />
            </div>
            <div>
              <div :class="dialogTitle" v-html="details.id" />
            </div>
            <div :class="['avatar-cell', 'align-right']">
              <v-icon @click="close" small>close</v-icon>
            </div>
          </div>
        </div>
      </v-card-title>
      <v-card-text :class="['pa-0']">
        <cell-divider />
        <div :class="['table-layout', 'align-center']">
          <div>
            <div :class="alignTop">
              <div :class="subsectionLabel" v-html="lang.linksTotal" />
              <div>{{ parseInt(details._linksTo + details._linksFrom, 10) }}</div>
            </div>
            <div :class="['v-align-top']">
              <div :class="subsectionLabel">
                <span v-if="!details.isGIndex" v-html="lang.not" />{{ lang.indexed }}
              </div>
              <v-icon :class="['icon-small']">fa-google</v-icon>
            </div>
          </div>
          <div>
            <div :class="alignTop">
              <div :class="subsectionLabel" v-html="lang.linksOutbound" />
              <v-icon color="pink">arrow_back</v-icon> {{ details._linksFrom }} {{ lang.links }}
            </div>
            <div :class="alignTop">
              <div :class="subsectionLabel"  v-html="lang.linksInbound" />
              <v-icon color="green">arrow_forward</v-icon> {{ details._linksTo }} {{ lang.links }}
            </div>
          </div>
        </div>
        <cell-divider :class="['mt-2']" />
        <h5 :class="sectionHeader" v-html="lang.domainRating" />
        <svg-gauge block track-color="#e2e8ea" fill-color="#ef355c" :value="details.rating" :size="75" :stroke="2" :label-size="8" :class="['margin-auto', 'my-2']" />
        <cell-divider :class="['mt-2']" />
        <h5 :class="sectionHeader" v-html="lang.behaviour" />
        <div :class="['table-layout', 'align-center', 'mt-1']">
          <div>
            <div>
              <div :class="subsectionLabel" v-html="lang.ctr" />
              <div :class="sectionHeader">
                <strong :class="labelLarge">{{ details.ctr }}%</strong>
              </div>
            </div>
            <div :class="['cell-separator']" />
            <div>
              <div :class="subsectionLabel"  v-html="lang.ndc" />
              <div :class="sectionHeader">
                <strong :class="labelLarge">{{ details.ndc }}%</strong>
              </div>
            </div>
          </div>
        </div>
        <cell-divider :class="['mt-2']" />
        <h5 :class="sectionHeader" v-html="lang.dns" />
        <div :class="['table-layout', 'mx-4']">
          <div>
            <div>
              <h6 :class="subsectionLabel" v-html="lang.ipAddress" />
              <div>
                <strong :class="labelMedium">{{ details.ip }}</strong>
              </div>
            </div>
          </div>
          <div>
            <div>
              <h6 :class="subsectionLabel" v-html="lang.nameServers" />
              <ul :class="['pink-text', 'bulletless-list']">
                <li v-for="(ns, index) in details.ns" :key="index">
                  <strong v-html="ns" :class="labelMedium" />
                </li>
              </ul>
            </div>
          </div>
        </div>
        <cell-divider :class="['mt-2']" />
        <h5 :class="sectionHeader" v-html="lang.whois" />
        <div :class="['mx-4']">
          <ul :class="['bulletless-list']">
            <li v-for="(value, key) in details.whois">
              <div :class="subsectionLabel" v-html="key" />
              <div :class="[labelMedium, 'mb-1']">
                <strong v-html="value" />
              </div>
            </li>
          </ul>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
import Avatar from '../avatar/index'
import CellDivider from '../cell-divider/index'
import infoPopupsLang from '../infoPopupsLang'

export default {
  name: 'LinkmapExpandedDialog',
  components: {
    Avatar,
    CellDivider
  },
  data () {
    return {
      lang: infoPopupsLang,
      sectionHeader: ['align-center', 'section-header', 'pa-0', 'ma-0'],
      alignTop: ['v-align-top'],
      subsectionLabel: ['grey--text', 'lighten-2', 'mb-1', 'small-label'],
      dialogTitle: ['ellipsis', 'cc-linkmap-mini-dialog-title'],
      labelLarge: ['large-label'],
      labelMedium: ['label-medium']
    }
  },
  computed: {
    style () {
      return {
        position: 'fixed',
        width: 'auto',
        left: this.$parent.$parent.expanded ? '316px' : '74px',
        top: `82px`,
        height: `${document.documentElement.offsetHeight - 100}px`
      }
    }
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    details: {
      type: Object,
      required: true
    }
  },
  methods: {
    close () {
      this.$parent.nodeExpandedDialog = false
      this.$parent.nodeExpandedDialogData = null
      this.$parent.removeBodyClassFix()
    }
  }
}
</script>
