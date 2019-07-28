// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import * as firebase from 'firebase'
import App from './App'
import router from './router'
import AppDate from '@/components/AppDate'
import store from '@/store'

Vue.component('AppDate', AppDate)
Vue.config.productionTip = false

// Your web app's Firebase configuration
var firebaseConfig = {}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },

  beforeCreate () {
    store.dispatch('fetchUser', { id: store.state.authId })
  }
})
