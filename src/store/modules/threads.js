import { countObjectProperties } from '@/utils'
import firebase from 'firebase'
import Vue from 'vue'
import { makeAppendChildToParentMutation } from '@/store/assetHelpers'

export default {
  namespaced: true,

  actions: {
    createThread ({ state, commit, rootState }, { text, title, forumId }) {
      return new Promise((resolve, reject) => {
        const threadId = firebase
          .database()
          .ref('threads')
          .push().key
        const postId = firebase
          .database()
          .ref('posts')
          .push().key
        const userId = rootState.auth.authId
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
            commit(
              'setItem',
              {
                item: thread,
                id: threadId,
                resource: 'threads'
              },
              { root: true }
            )
            commit(
              'forums/appendThreadToForum',
              {
                childId: threadId,
                parentId: forumId
              },
              { root: true }
            )
            commit(
              'users/appendThreadToUser',
              {
                childId: threadId,
                parentId: userId
              },
              { root: true }
            )

            // Post
            commit(
              'setItem',
              { item: post, id: postId, resource: 'posts' },
              { root: true }
            )
            commit(
              'threads/appendPostToThread',
              {
                parentId: threadId,
                childId: postId
              },
              { root: true }
            )
            commit(
              'users/appendPostToUser',
              {
                parentId: post.userId,
                childId: postId
              },
              { root: true }
            )

            resolve(state.items[threadId])
          })
      })
    },

    updateThread ({ state, commit, rootState }, { title, text, id }) {
      return new Promise((resolve, reject) => {
        const thread = state.items[id]
        const post = state.posts[thread.firstPostId]

        const edited = {
          at: Math.floor(Date.now() / 1000),
          by: rootState.auth.authId
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
            commit(
              'posts/setPost',
              {
                postId: thread.firstPostId,
                post: {
                  ...post,
                  text,
                  edited
                }
              },
              { root: true }
            )

            resolve(post)
          })
      })
    },

    fetchThread: ({ dispatch }, { id }) =>
      dispatch('fetchItem', { resource: 'threads', id }, { root: true }),

    fetchThreads: ({ dispatch }, { ids }) =>
      dispatch('fetchItems', { ids, resource: 'threads' }, { root: true })
  },
  getters: {
    threadRepliesCount: state => id =>
      countObjectProperties(state.threads.items[id].posts) - 1
  },
  mutations: {
    setThread (state, { thread, threadId }) {
      Vue.set(state.items, threadId, thread)
    },

    appendContributorToThread: makeAppendChildToParentMutation({
      parent: 'threads',
      child: 'contributors'
    }),

    appendPostToThread: makeAppendChildToParentMutation({
      parent: 'threads',
      child: 'posts'
    })
  },
  state: {
    items: {}
  }
}
