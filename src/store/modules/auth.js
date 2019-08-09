import firebase from 'firebase'

export default {
  namespaced: true,

  actions: {
    registerUserWithEmailAndPassword (
      { dispatch },
      { name, username, password, email, avatar = null }
    ) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(
          credential => {
            return dispatch('users/createUser', {
              id: credential.user.uid,
              name,
              username,
              password,
              email,
              avatar
            })
          },
          { root: true }
        )
        .then(() => {
          return dispatch('fetchAuthUser')
        })
    },

    signInWithEmailAndPassword (context, { email, password }) {
      return firebase.auth().signInWithEmailAndPassword(email, password)
    },

    signInWithGoogle ({ dispatch }) {
      const provider = new firebase.auth.GoogleAuthProvider()
      return firebase
        .auth()
        .signInWithPopup(provider)
        .then(data => {
          const user = data.user
          firebase
            .database()
            .ref('users')
            .child(user.uid)
            .once('value', snapshot => {
              if (!snapshot.exists()) {
                return dispatch(
                  'users/createUser',
                  {
                    id: user.uid,
                    name: user.displayName,
                    email: user.email,
                    username: user.email,
                    avatar: user.photoURL
                  },
                  { root: true }
                ).then(() => {
                  return dispatch('fetchAuthUser')
                })
              }
            })
        })
    },

    signOut ({ commit }) {
      return firebase
        .auth()
        .signOut()
        .then(() => {
          commit('setAuthId', null)
        })
    },

    initAuthentication ({ dispatch, commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.unsubscribeAuthObserver) {
          state.unsubscribeAuthObserver()
        }

        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
          console.log('👤 User has changed')
          if (user) {
            dispatch('fetchAuthUser').then(dbUser => resolve(dbUser))
          } else {
            resolve(null)
          }
        })

        commit('setUnsubscribeAuthObserver', unsubscribe)
      })
    },

    fetchAuthUser ({ commit, dispatch }) {
      const userId = firebase.auth().currentUser.uid

      return new Promise((resolve, reject) => {
        firebase
          .database()
          .ref('users')
          .child(userId)
          .once('value', snapshot => {
            if (snapshot.exists()) {
              return dispatch(
                'users/fetchUser',
                { id: userId },
                { root: true }
              ).then(user => {
                commit('setAuthId', userId)
                resolve(user)
              })
            } else {
              resolve(null)
            }
          })
      })
    }
  },
  getters: {
    authUser (state, getters, rootState) {
      return state.authId ? rootState.users.items[state.authId] : null
    }
  },
  mutations: {
    setAuthId (state, id) {
      state.authId = id
    },

    setUnsubscribeAuthObserver (state, unsubscribe) {
      state.unsubscribeAuthObserver = unsubscribe
    }
  },
  state: {
    authId: null,
    unsubscribeAuthObserver: null
  }
}
