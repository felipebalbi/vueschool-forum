import firebase from 'firebase'
import { Promise } from 'q'
import { removeEmptyProperties } from '@/utils'

export default {
  createPost ({ commit, state }, post) {
    const postId = firebase
      .database()
      .ref('posts')
      .push().key
    post.userId = state.authId
    post.publishedAt = Math.floor(Date.now() / 1000)

    const updates = {}
    updates[`posts/${postId}`] = post
    updates[`threads/${post.threadId}/posts/${postId}`] = postId
    updates[`threads/${post.threadId}/contributors/${post.userId}`] =
      post.userId
    updates[`users/${post.userId}/posts/${postId}`] = postId

    firebase
      .database()
      .ref()
      .update(updates)
      .then(() => {
        commit('setItem', { item: post, id: postId, resource: 'posts' })
        commit('appendPostToThread', {
          parentId: post.threadId,
          childId: postId
        })
        commit('appendContributorToThread', {
          parentId: post.threadId,
          childId: post.userId
        })
        commit('appendPostToUser', { parentId: post.userId, childId: postId })
        return Promise.resolve(state.posts[postId])
      })
  },

  createUser ({ commit, state }, { id, email, name, username, avatar = null }) {
    return new Promise((resolve, reject) => {
      const registeredAt = Math.floor(Date.now() / 1000)
      const usernameLower = username.toLowerCase()
      email = email.toLowerCase()
      const user = {
        email,
        name,
        username,
        avatar,
        registeredAt,
        usernameLower
      }
      firebase
        .database()
        .ref('users')
        .child(id)
        .set(user)
        .then(() => {
          commit('setItem', { id: id, item: user, resource: 'users' })
          resolve(state.users[id])
        })
    })
  },

  registerUserWithEmailAndPassword (
    { dispatch },
    { name, username, password, email, avatar = null }
  ) {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(credential => {
        return dispatch('createUser', {
          id: credential.user.uid,
          name,
          username,
          password,
          email,
          avatar
        })
      })
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
              return dispatch('createUser', {
                id: user.uid,
                name: user.displayName,
                email: user.email,
                username: user.email,
                avatar: user.photoURL
              }).then(() => {
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

  updatePost ({ commit, state }, { id, text }) {
    return new Promise((resolve, reject) => {
      const post = state.posts[id]
      const edited = {
        at: Math.floor(Date.now() / 1000),
        by: state.authId
      }

      const updates = { text, edited }
      firebase
        .database()
        .ref('posts')
        .child(id)
        .update(updates)
        .then(() => {
          commit('setPost', {
            postId: id,
            post: {
              ...post,
              text,
              edited
            }
          })

          resolve(post)
        })
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

  createThread ({ state, commit, dispatch }, { text, title, forumId }) {
    return new Promise((resolve, reject) => {
      const threadId = firebase
        .database()
        .ref('threads')
        .push().key
      const postId = firebase
        .database()
        .ref('posts')
        .push().key
      const userId = state.authId
      const publishedAt = Math.floor(Date.now() / 1000)

      const thread = {
        title,
        forumId,
        publishedAt,
        userId,
        firstPostId: postId,
        posts: {}
      }
      thread.posts[postId] = postId
      const post = {
        text,
        publishedAt,
        threadId,
        userId
      }

      const updates = {}
      updates[`threads/${threadId}`] = thread
      updates[`forums/${forumId}/threads/${threadId}`] = threadId
      updates[`users/${userId}/threads/${threadId}`] = threadId

      updates[`posts/${postId}`] = post
      updates[`users/${userId}/posts/${postId}`] = postId

      firebase
        .database()
        .ref()
        .update(updates)
        .then(() => {
          // thread
          commit('setItem', { item: thread, id: threadId, resource: 'threads' })
          commit('appendThreadToForum', {
            childId: threadId,
            parentId: forumId
          })
          commit('appendThreadToUser', { childId: threadId, parentId: userId })

          // Post
          commit('setItem', { item: post, id: postId, resource: 'posts' })
          commit('appendPostToThread', {
            parentId: threadId,
            childId: postId
          })
          commit('appendPostToUser', { parentId: post.userId, childId: postId })

          resolve(state.threads[threadId])
        })
    })
  },

  updateThread ({ state, commit, dispatch }, { title, text, id }) {
    return new Promise((resolve, reject) => {
      const thread = state.threads[id]
      const post = state.posts[thread.firstPostId]

      const edited = {
        at: Math.floor(Date.now() / 1000),
        by: state.authId
      }

      const updates = {}
      updates[`posts/${thread.firstPostId}/text`] = text
      updates[`posts/${thread.firstPostId}/edited`] = edited
      updates[`threads/${id}/title`] = title
      firebase
        .database()
        .ref()
        .update(updates)
        .then(() => {
          commit('setThread', { threadId: id, thread: { ...thread, title } })
          commit('setPost', {
            postId: thread.firstPostId,
            post: {
              ...post,
              text,
              edited
            }
          })

          resolve(post)
        })
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
            return dispatch('fetchUser', { id: userId }).then(user => {
              commit('setAuthId', userId)
              resolve(user)
            })
          } else {
            resolve(null)
          }
        })
    })
  },

  updateUser ({ commit }, user) {
    const updates = {
      avatar: user.avatar,
      username: user.username,
      name: user.name,
      bio: user.bio,
      website: user.website,
      email: user.email,
      location: user.location
    }

    return new Promise((resolve, reject) => {
      firebase
        .database()
        .ref('users')
        .child(user['.key'])
        .update(removeEmptyProperties(updates))
        .then(() => {
          commit('setUser', { userId: user['.key'], user })
          resolve(user)
        })
    })
  },

  fetchCategory: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { resource: 'categories', id }),

  fetchForum: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { resource: 'forums', id }),

  fetchThread: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { resource: 'threads', id }),

  fetchPost: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { resource: 'posts', id }),

  fetchUser: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { resource: 'users', id }),

  fetchCategories: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { ids, resource: 'categories' }),

  fetchForums: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { ids, resource: 'forums' }),

  fetchThreads: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { ids, resource: 'threads' }),

  fetchPosts: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { ids, resource: 'posts' }),

  fetchUsers: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { ids, resource: 'users' }),

  fetchAllCategories ({ commit, state }) {
    return new Promise((resolve, reject) => {
      firebase
        .database()
        .ref('categories')
        .once('value', snapshot => {
          const categoriesObject = snapshot.val()
          Object.keys(categoriesObject).forEach(categoryId => {
            const category = categoriesObject[categoryId]
            this.commit('setItem', {
              resource: 'categories',
              id: categoryId,
              item: category
            })
          })
          resolve(Object.values(state.categories))
        })
    })
  },

  fetchItem ({ state, commit }, { id, resource }) {
    console.log('fetching', resource, id)
    return new Promise((resolve, reject) => {
      firebase
        .database()
        .ref(resource)
        .child(id)
        .once('value', snapshot => {
          commit('setItem', {
            id: snapshot.key,
            item: snapshot.val(),
            resource
          })

          resolve(state[resource][id])
        })
    })
  },

  fetchItems ({ dispatch }, { ids, resource }) {
    ids = Array.isArray(ids) ? ids : Object.keys(ids)
    return Promise.all(ids.map(id => dispatch('fetchItem', { id, resource })))
  }
}
