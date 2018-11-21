<template lang="pug">
  v-layout
    v-flex(xs4 v-for="(round, i) in tournamentRounds" :key="i" v-show="!$store.state.winnerTeamId")
      v-card
        v-toolbar.heading(:color="finishedMatchesCount[i] == round.length ?'grey':'red'" dark)
          v-flex(xs4) Round {{ i+1 }}:
          v-spacer
          v-flex(xs4) {{ finishedMatchesCount[i] }} / {{ round.length }}
        app-match(
          v-for="(match, ii) in round"
          :matchId="ii"
          :roundId="i"
          :key="ii"
          @finishMatch="finishMatch"
          :matchData="tournamentRounds[i][ii]"
          :teamsData="$store.getters.teamDetails(Object.keys(tournamentRounds[i][ii].teamsScores))")
    v-flex(xs12 v-if="$store.state.winnerTeamId")
      v-card
        v-toolbar.heading.flex-center(color="green" dark)
          v-toolbar-title
            template(v-for="n in 5")
              v-icon accessibility_new
              v-icon accessibility
            span.px-3 !!! Tournament finished !!!
            template(v-for="n in 5")
              v-icon accessibility_new
              v-icon accessibility
        h1.pt-5 ~~~~~~~~~~~~~~~~~~~~ Winners ~~~~~~~~~~~~~~~~~~~~
        h2.text-xs-center.pt-5 Team: {{ winners.name }}
        h2.text-xs-center.pb-5 Players: {{ winners.players | joinAttributes('name', ' & ') }}

</template>

<script>
import Match from '@/components/Match'
export default {
  components: { 'app-match': Match },
  computed: {
    tournamentRounds () {
      return this.$store.state.tournamentRounds
    },
    finishedMatchesCount () {
      const finishedMatchesCount = []
      this.tournamentRounds.forEach(round => {
        finishedMatchesCount.push(round.reduce((count, match) => count + (match.finished ? 1 : 0), 0))
      })
      return finishedMatchesCount
    },
    winners () {
      if (!this.$store.state.winnerTeamId) {
        return null
      } else {
        return this.$store.getters.teamDetails([this.$store.state.winnerTeamId])[this.$store.state.winnerTeamId]
      }
    }
  },
  methods: {
    finishMatch ({ roundId, matchId, score }) {
      this.$store.dispatch('finishMatch', { roundId, matchId, score })
      // Is round finished?
      if (this.finishedMatchesCount[roundId] === this.tournamentRounds[roundId].length) {
        this.$store.dispatch(this.tournamentRounds[roundId].length === 1 ? 'endTournament' : 'startNextRound')
      }
    }
  }
}
</script>
<style lang="scss">
.heading {
  font-size: 20px;
  font-weight: bold;
}
</style>
