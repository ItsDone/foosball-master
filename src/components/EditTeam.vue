<template lang="pug">
  v-form(@submit.prevent="createTeam(team.teamId)")
    v-card.mb-3
      v-card-text
        ul.teamPlayers
          li(v-for="playerId in team.playersIds" :key="playerId") {{ getPlayer()(playerId).name }}
        v-text-field.pa-1(v-model.trim="name"
                          required
                          outline
                          :error-messages="nameErrors()"
                          @input="$v.name.$touch()"
                          @blur="$v.name.$touch()"
                          label="Team name")
        app-icon-picker(v-model="icon" defaultIcon="random")
        v-btn(type="submit" color="info" block) OK
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
import IconPicker from '@/components/IconPicker'
import { mapGetters } from 'vuex'

export default {
  name: 'EditTeam',
  components: {
    'appIconPicker': IconPicker
  },
  props: ['team'],
  data () {
    return {
      icon: null,
      name: ''
    }
  },
  validations: {
    name: {
      required,
      minLength: minLength(3),
      unique: function (val, obj) {
        return this.$store.getters.teamNames.indexOf(val) === -1
      }
    }
  },
  methods: {
    nameErrors () {
      const errors = []
      if (!this.$v.name.$dirty) return errors
      !this.$v.name.required && errors.push('Put your name in !!')
      !this.$v.name.minLength && errors.push('Too short ..')
      !this.$v.name.unique && errors.push('This one is already in.')
      return errors
    },
    createTeam (teamId) {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.$store.dispatch('createTeam', { teamId, name: this.name, icon: this.icon })
      }
    },
    ...mapGetters(['getPlayer'])
  }
}
</script>
<style lang="scss">
.teamPlayers {
  display: flex;
  justify-content: space-around;
  padding: 0;
  li {
    list-style-type: none;
    font-size: 1.5em;
    display: inline-block;
    margin: 0 5px;
  }
}
</style>
