<template>
  <v-dialog hide-overlay :value="show" persistent :class="['cc-linkmap-dialog', 'cc-linkmap-mini-dialog']" max-width="auto">
    <v-card :class="['cc-linkmap-dialog ']" width="auto" :style="{position: 'fixed', top: `${$parent.nodeMiniDialogData.pageY}px`, left: `${$parent.nodeMiniDialogData.pageX}px`}">
      <v-card-title>
        <div :class="['table-layout']">
          <div>
            <div :class="['avatar-cell']">
              <avatar :background="details.color" color="#fff" :label="details.avatar" />
            </div>
            <div>
              <div :class="['ellipsis', 'cc-linkmap-mini-dialog-title']">{{ details.id }}</div>
            </div>
            <div :class="['avatar-cell', 'align-right']">
              <v-icon @click="close(true)" small>close</v-icon>
            </div>
          </div>
        </div>
      </v-card-title>
      <v-card-text :class="['pa-0']">
        <cell-divider />
        <div :class="['table-layout', 'align-center']">
          <div>
            <div :class="['v-align-top']">
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
        </div>
        <cell-divider :class="['mt-2']" />
      </v-card-text>
      <v-card-actions>
        <v-btn block color="black" dark @click="showExpandedDialog">{{ lang.viewMoreInfo }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import Avatar from '../avatar/index'
import CellDivider from '../cell-divider/index'
import infoPopupsLang from '../infoPopupsLang'

export default {
  name: 'LinkmapMiniDialog',
  components: {
    Avatar,
    CellDivider
  },
  data () {
    return {
      lang: infoPopupsLang,
      subsectionLabel: ['grey--text', 'lighten-2', 'mb-1', 'small-label']
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
    close (clearSelection) {
      this.$parent.nodeMiniDialog = false
      this.$parent.nodeMiniDialogData = null
      if (clearSelection) {
        this.$parent.removeBodyClassFix()
      }
    },
    showExpandedDialog () {
      this.$parent.nodeExpandedDialogData = this.details
      this.$parent.nodeExpandedDialog = true
      this.close()
    }
  }
}
</script>
<style>
.avatar-cell
{
  width: 50px;
}
</style>
