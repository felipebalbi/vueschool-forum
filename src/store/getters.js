import { countObjectProperties } from '@/utils'

export default {
  authUser (state) {
    return state.users[state.authId]
  },

  threadRepliesCount: state => id =>
    countObjectProperties(state.threads[id].posts) - 1,

  userPostsCount: state => id => countObjectProperties(state.users[id].posts),

  userThreadsCount: state => id =>
    countObjectProperties(state.users[id].threads)
}
