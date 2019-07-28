import firebase from 'firebase'
import { Promise } from 'q'

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
    updates[`users/${post.userId}/posts/${postId}`] = postId

    firebase
      .database()
      .ref()
      .update(updates)
      .then(() => {
        post['.key'] = postId
        commit('setItem', { item: post, id: postId, resource: 'posts' })
        commit('appendPostToThread', {
          parentId: post.threadId,
          childId: postId
        })
        commit('appendPostToUser', { parentId: post.userId, childId: postId })
        return Promise.resolve(state.posts[postId])
      })
  },

  updatePost ({ commit, state }, { id, text }) {
    return new Promise((resolve, reject) => {
      const post = state.posts[id]
      commit('setPost', {
        postId: id,
        post: {
          ...post,
          text,
          edited: {
            at: Math.floor(Date.now() / 1000),
            by: state.authId
          }
        }
      })
      resolve(post)
    })
  },

  createThread ({ state, commit, dispatch }, { text, title, forumId }) {
    return new Promise((resolve, reject) => {
      const threadId = 'greatThread' + Math.random()
      const userId = state.authId
      const publishedAt = Math.floor(Date.now() / 1000)

      const thread = {
        '.key': threadId,
        title,
        forumId,
        publishedAt,
        userId
      }

      commit('setThread', { threadId, thread })
      commit('appendThreadToForum', { childId: threadId, parentId: forumId })
      commit('appendThreadToUser', { childId: threadId, parentId: userId })

      dispatch('createPost', { text, threadId }).then(post => {
        commit('setThread', {
          threadId,
          thread: { ...thread, firstPostId: post['.key'] }
        })
      })
      resolve(state.threads[threadId])
    })
  },

  updateThread ({ state, commit, dispatch }, { title, text, id }) {
    return new Promise((resolve, reject) => {
      const thread = state.threads[id]
      const newThread = { ...thread, title }

      commit('setThread', { threadId: id, thread: newThread })
      dispatch('updatePost', { id: thread.firstPostId, text }).then(() =>
        resolve(newThread)
      )
    })
  },

  updateUser: ({ commit }, user) =>
    commit('setUser', { userId: user['.key'], user }),

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
