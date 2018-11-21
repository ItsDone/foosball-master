import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import Vuelidate from 'vuelidate'

Vue.config.productionTip = false

Vue.use(Vuelidate)

Vue.filter('joinAttributes', (arr, propName, separator = ' ') => arr.map(item => item[propName]).join(separator))

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
