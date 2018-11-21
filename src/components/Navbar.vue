<template lang="pug">
  v-toolbar(app)
      v-toolbar-title.headline.text-uppercase
        span Something smart
      v-btn(@click="$emit('not')")
        span Click me not
      v-btn(@click="$emit('addPlayersToggle')")
        span Add players
      v-btn(v-if="$store.getters.getUnassignedPlayers.length >= 2" @click="$store.dispatch('randomizeTeams')")
        span Team up !
      v-btn(v-if="$store.state.teams.length >= 2" @click="$store.dispatch('startTournament')")
        span Start
      v-btn(@click="$store.dispatch('cleanup')")
        v-icon delete
</template>

<script>
export default {

}
</script>
