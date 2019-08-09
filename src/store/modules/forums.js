import { makeAppendChildToParentMutation } from '@/store/assetHelpers'

export default {
  namespaced: true,

  actions: {
    fetchForum: ({ dispatch }, { id }) =>
      dispatch('fetchItem', { resource: 'forums', id }, { root: true }),

    fetchForums: ({ dispatch }, { ids }) =>
      dispatch('fetchItems', { ids, resource: 'forums' }, { root: true })
  },
  getters: {},
  mutations: {
    appendThreadToForum: makeAppendChildToParentMutation({
      parent: 'forums',
      child: 'threads'
    })
  },
  state: {
    items: {}
  }
}
