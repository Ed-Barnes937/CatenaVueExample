<template>
  <v-menu>
    <v-btn ripple dark slot="activator" color="grey darken-4">
      <v-avatar size="24px" class="mr-3">
        <img v-if="hasPicture()" :src="avatarPicture" alt="" />
        <v-icon v-else>account_circle</v-icon>
      </v-avatar>
      <span class="text-muted">{{ welcomeMessage }}</span>
    </v-btn>
    <v-list dense>
      <v-list-tile>
        <v-list-tile-avatar><v-icon>settings</v-icon></v-list-tile-avatar>
        <v-list-tile-title>Settings</v-list-tile-title>
      </v-list-tile>
      <v-divider></v-divider>
      <v-list-tile v-on:click="logout">
        <v-list-tile-avatar><v-icon>exit_to_app</v-icon></v-list-tile-avatar>
        <v-list-tile-title>Log Out</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>

import { AUTH_EVENTS } from './../auth/auth-events.js'
import methods from '../helpers/methods'
const defaultName = 'Flamingo Fify'
const defaultPicture = ''

export default {
  name: 'NavAvatar',
  mixins: [
    methods
  ],
  data () {
    return {
      profile: null,
      avatarPicture: defaultPicture,
      avatarName: defaultName
    }
  },
  computed: {
    welcomeMessage: function () {
      return `Hello, ${this.avatarName}`
    }
  },
  mounted () {
    this.$auth0.on(AUTH_EVENTS.isLoggedIn, () => {
      this.$auth0.getProfile((err, profile) => {
        if (err) return console.log(err)
        this.profile = profile
      })
    })
    setTimeout(this.refreshUserProfile.bind(this), 300)
  },
  methods: {
    hasPicture () {
      return (this.profile && !!this.profile.picture) // eslint-disable-line no-extra-boolean-cast
    },
    getUsername () {
      if (this.profile) {
        this.log('[USER PROFILE]', this.profile)
        this.$store.commit('profile', this.profile)
        return this.profile.given_name || defaultName
      }

      return defaultName
    },
    logout () {
      return this.$auth0.logout()
    },
    refreshUserProfile () {
      const vm = this
      if (this.$auth0.userProfile) {
        this.$nextTick(() => {
          vm.setProfile(this.$auth0.userProfile)
        })
      } else {
        this.$auth0.getProfile((err, profile) => {
          if (err) return console.log(err)
          this.log('[SETTING PROFILE]', profile)
          vm.setProfile(profile)
        })
      }
    },
    setProfile (profile) {
      const vm = this
      vm.profile = profile
      vm.avatarPicture = vm.hasPicture() ? vm.profile.picture : defaultPicture
      vm.avatarName = vm.getUsername()
    }
  }
}
</script>
