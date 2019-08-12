<template>
  <header class="header" id="header" v-click-outside="closeMobileNavbar">
    <router-link :to="{name: 'Home'}" class="logo">
      <img src="../assets/img/vueschool-logo.svg" />
    </router-link>

    <div class="btn-hamburger" @click="mobileNavBarOpen = !mobileNavBarOpen">
      <!-- use .btn-humburger-active to open the menu -->
      <div class="top bar"></div>
      <div class="middle bar"></div>
      <div class="bottom bar"></div>
    </div>

    <!-- use .navbar-open to open nav -->
    <nav class="navbar" :class="{'navbar-open': mobileNavBarOpen}">
      <ul v-if="user">
        <li class="navbar-mobile-item">
          <router-link :to="{name: 'Profile'}">View Profile</router-link>
        </li>
        <li class="navbar-mobile-item">
          <a @click.prevent="$store.dispatch('auth/signOut')">Sign Out</a>
        </li>
        <li class="navbar-user" v-click-outside="closeUserDropDown">
          <a @click.prevent="userDropDownOpen = !userDropDownOpen">
            <img class="avatar-small" :src="user.avatar" alt />
            <span>
              {{user.name}}
              <img class="icon-profile" src="../assets/img/arrow-profile.svg" alt />
            </span>
          </a>

          <!-- dropdown menu -->
          <!-- add class "active-drop" to show the dropdown -->
          <div id="user-dropdown" :class="{'active-drop': userDropDownOpen}">
            <div class="triangle-drop"></div>
            <ul class="dropdown-menu">
              <li class="dropdown-menu-item">
                <router-link :to="{name: 'Profile'}">View Profile</router-link>
              </li>
              <li class="dropdown-menu-item">
                <a @click.prevent="$store.dispatch('auth/signOut')">Sign Out</a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <ul v-else>
        <li class="navbar-item">
          <router-link :to="{name: 'SignIn'}">Sign In</router-link>
        </li>
        <li class="navbar-item">
          <router-link :to="{name: 'Register'}">Register</router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import clickOutside from '@/directives/click-outside'

export default {
  data () {
    return {
      userDropDownOpen: false,
      mobileNavBarOpen: false
    }
  },

  directives: {
    clickOutside
  },

  computed: {
    ...mapGetters({
      user: 'auth/authUser'
    })
  },

  methods: {
    closeUserDropDown () {
      this.userDropDownOpen = false
    },

    closeMobileNavbar () {
      this.mobileNavBarOpen = false
    }
  }
}
</script>
