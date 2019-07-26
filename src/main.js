// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import firebase from 'firebase'
import App from './App'
import router from './router'
import AppDate from '@/components/AppDate'
import store from '@/store'

Vue.component('AppDate', AppDate)
Vue.config.productionTip = false

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC-uE_36ZgehlyD-Oh7bnz1AfAEa8Hk-Dw',
  authDomain: 'vue-school-forum-5468b.firebaseapp.com',
  databaseURL: 'https://vue-school-forum-5468b.firebaseio.com',
  projectId: 'vue-school-forum-5468b',
  storageBucket: '',
  messagingSenderId: '883747564910',
  appId: '1:883747564910:web:fab993eeb65de7bf'
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
