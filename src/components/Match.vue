<template lang="pug">
  div.matchbox
    v-list(two line)
        v-list-tile(v-for="(team, teamId) in teamsData" :key="teamId")
          v-list-tile-avatar
            v-icon {{ team.icon }}
          v-list-tile-content
            v-list-tile-title
              b(:title="team.players | joinAttributes('name',' & ')") {{ team.name }}
              input.score(
                type="number"
                min="0"
                max="10"
                :value="matchData.teamsScores[teamId]"
                @input="score[teamId] = parseInt($event.target.value)"
                :disabled="matchData.finished"
              )
        v-list-tile(v-if="!matchData.finished")
          v-list-tile-content.flex-center
            v-btn.primary(@click="$emit('finishMatch', {roundId, matchId, score})") Finished
</template>

<script>
export default {
  name: 'Match',
  props: ['matchId', 'roundId', 'matchData', 'teamsData'],
  data () {
    return {
      score: {}
    }
  },
  methods: {
    finishMatch () {
      this.$emit('finishMatch', { roundId: this.roundId, matchId: this.matchId, score: this.score })
    }
  }

}
</script>

<style lang="scss">
input.score {
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  width: 40px;
  text-align: center;
  float: right;
  margin-right: 80px;

  &:disabled{
    background-color: rgba(175,175,175,0.3)
  }
}
.matchbox{
  padding-top: 5px;
  border-bottom: 1px solid rgba(0,0,0,0.2)
}
</style>
