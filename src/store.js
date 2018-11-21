import Vue from 'vue'
import Vuex from 'vuex'
import { randomInt } from './helpers'
import VuexPersist from 'vuex-persist'

Vue.use(Vuex)

const vuexLocalStorage = new VuexPersist({
  key: 'fooMaster', // The key to store the state on in the storage provider.
  storage: window.localStorage // or window.sessionStorage or localForage
  // Function that passes the state and returns the state with only the objects you want to store.
  // reducer: state => state,
  // Function that passes a mutation and lets you decide if it should update the state in localStorage.
  // filter: mutation => (true)
})
const plugins = [vuexLocalStorage.plugin]
const initialState = () => {
  return {
    players: [],
    teams: [],
    newTeams: [],
    tournamentRounds: [],
    winnerTeamId: null
  }
}

const getters = {
  playersNames (state) {
    const names = state.players.map(player => player.name)
    return names
  },
  teamNames (state) {
    if (state.teams.length === 0) return []
    const teamNames = state.teams.map(team => (team.name ? team.name : null))
    return teamNames
  },
  getUnassignedPlayers (state, getters) {
    if (state.teams.length === 0) {
      return state.players
    }
    const unassignedPlayers = state.players.filter(player => !player['teamId'])
    return unassignedPlayers
  },
  getPlayer: state => playerId =>
    state.players.find(player => player.playerId === playerId),
  getTeam: state => teamId =>
    state.teams.find(team => team.teamId === parseInt(teamId)),
  isInTeam: (state, getters) => playerId =>
    state.teams.find(
      team => team.teamId === getters.getPlayer(playerId).teamId
    ),
  teamDetails: (state, getters) => teamIds => {
    const teamsData = {}
    teamIds.forEach(teamId => {
      const teamData = { ...getters.getTeam(teamId), players: [] }
      teamData.playersIds.forEach(playerId => {
        teamData.players.push(getters.getPlayer(playerId))
      })
      teamsData[teamId] = teamData
    })
    return teamsData
  }
}

const mutations = {
  addPlayer (state, player) {
    const playerId =
      state.players.reduce(
        (maxId, player) => Math.max(maxId, player.playerId),
        0
      ) + 1
    state.players.push({ playerId, ...player })
  },
  removePlayer (state, removedPlayerId) {
    const players = state.players.filter(
      player => player.playerId !== removedPlayerId
    )
    state.players = players
  },
  cancelTeam (state, cancelledTeamId) {
    const teams = state.teams.filter(team => {
      if (cancelledTeamId === team.teamId) {
        team.playerIds.forEach(playerId => {
          state.players.find(
            player => player.playerId === playerId
          ).teamId = null
        })
        return false
      }
      return true
    })
    state.teams = teams
  },
  createNewTeam (state, teamPlayers) {
    const maxId = teams =>
      teams.reduce((maxId, team) => Math.max(maxId, team.teamId), 0)
    const teamId = Math.max(maxId(state.newTeams), maxId(state.teams)) + 1
    const team = {
      teamId,
      playersIds: teamPlayers.map(player => player.playerId),
      new: true
    }
    state.newTeams.push(team)
    teamPlayers.forEach(player => {
      player.teamId = team.teamId
    })
  },
  cancelNewTeams (state) {
    state.newTeams.forEach(team => {
      team.playersIds.forEach(playerId => {
        state.players.find(player => player.playerId === playerId).teamId = null
      })
    })
    state.newTeams = []
  },
  createTeam (state, { teamId, name, icon }) {
    const newTeamIndex = state.newTeams.findIndex(
      team => team.teamId === teamId
    )
    state.newTeams[newTeamIndex].new = false
    state.teams.push(Object.assign({ name, icon }, state.newTeams[newTeamIndex]))
    state.newTeams.splice(newTeamIndex, 1)
  },
  cancelTournament (state) {
    state.tournamentRounds = []
    state.winnerTeamId = null
  },
  addRound (state, round) {
    state.tournamentRounds.push(round)
  },
  finishMatch (state, { roundId, matchId, score }) {
    state.tournamentRounds[roundId][matchId].finished = true
    let winnerScore = 0
    let winnerId = 0

    for (const teamId in state.tournamentRounds[roundId][matchId].teamsScores) {
      if (!score[teamId])score[teamId] = 0
      state.tournamentRounds[roundId][matchId].teamsScores[teamId] = score[teamId]
      if (score[teamId] >= winnerScore) {
        winnerScore = score[teamId] || 0
        winnerId = teamId
      }
    }
    state.tournamentRounds[roundId][matchId].winnerId = parseInt(winnerId)
  },
  setWinner (state, teamId) {
    state.winnerTeamId = teamId
  },
  cleanup (state, teamId) {
    Object.assign(state, initialState())
  }
}

const actions = {
  addPlayer ({ commit }, player) {
    commit('addPlayer', player)
  },
  /* Remove a player, cancel teams in the case that player has one */
  removePlayer ({ commit, getters }, playerId) {
    const player = getters.getPlayer(playerId)
    if (player.teamId) {
      commit('cancelTeam', player.teamId)
    }
    commit('removePlayer', player.playerId)
  },
  randomizeTeams ({ commit, getters }) {
    // get a shallow copy
    const players = getters.getUnassignedPlayers.slice()
    commit('cancelNewTeams')
    while (players.length > 1) {
      const teamPlayers = []
      for (let i = 0; i < 2; i++) {
        let index = randomInt(0, players.length - 1)
        teamPlayers.push(players[index])
        players.splice(index, 1)
      }
      commit('createNewTeam', teamPlayers)
    }
  },

  createTeam ({ commit }, { teamId, name, icon }) {
    commit('createTeam', { teamId, name, icon })
  },

  // Randomize matches
  startTournament ({ commit, dispatch, state }) {
    // to let Match component be destroyed
    commit('cancelTournament')
    setTimeout(() => {
      dispatch('addRound')
    }, 0)
  },
  finishMatch ({ commit }, matchDetails) {
    commit('finishMatch', matchDetails)
  },
  addRound ({ commit, state }, teamIds) {
    const teams = teamIds ? state.teams.filter(team => teamIds.includes(team.teamId)) : state.teams.slice()
    const roundMatches = []
    while (teams.length > 1) {
      const matchTeams = {}
      for (let i = 0; i < 2; i++) {
        let index = randomInt(0, teams.length - 1)
        matchTeams[teams[index].teamId] = 0
        teams.splice(index, 1)
      }
      roundMatches.push({ teamsScores: matchTeams, finished: false })
    }
    commit('addRound', roundMatches)
  },

  startNextRound ({ commit, dispatch, state }) {
    const winnerTeamsIds = []
    state.tournamentRounds[state.tournamentRounds.length - 1].forEach(match => {
      winnerTeamsIds.push(match.winnerId)
    })
    dispatch('addRound', winnerTeamsIds)
  },
  endTournament ({ commit, state }) {
    commit('setWinner', state.tournamentRounds[state.tournamentRounds.length - 1][0].winnerId)
  },
  cleanup ({ commit }) {
    commit('cleanup')
  }
}

export default new Vuex.Store({
  state: initialState(),
  getters,
  mutations,
  actions,
  plugins,
  strict: true
})
