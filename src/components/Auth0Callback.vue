<template>
  <div class="callback">Auth0 Callback</div>
</template>

<script>
export default {
  name: 'Auth0Callback',
  data () {
    this.$auth0.handleAuthentication()
    return {}
  }
}
</script>
