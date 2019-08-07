import { countObjectProperties } from '@/utils'

export default {
  authUser (state) {
    return state.authId ? state.users[state.authId] : null
  },

  threadRepliesCount: state => id =>
    countObjectProperties(state.threads[id].posts) - 1,

  userPostsCount: state => id => countObjectProperties(state.users[id].posts),

  userThreadsCount: state => id =>
    countObjectProperties(state.users[id].threads)
}
