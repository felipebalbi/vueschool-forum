import firebase from 'firebase'

export default {
  namespaced: true,

  actions: {
    fetchCategory: ({ dispatch }, { id }) =>
      dispatch('fetchItem', { resource: 'categories', id }, { root: true }),

    fetchCategories: ({ dispatch }, { ids }) =>
      dispatch('fetchItems', { ids, resource: 'categories' }, { root: true }),

    fetchAllCategories ({ commit, state }) {
      return new Promise((resolve, reject) => {
        firebase
          .database()
          .ref('categories')
          .once('value', snapshot => {
            const categoriesObject = snapshot.val()
            Object.keys(categoriesObject).forEach(categoryId => {
              const category = categoriesObject[categoryId]
              this.commit(
                'setItem',
                {
                  resource: 'categories',
                  id: categoryId,
                  item: category
                },
                { root: true }
              )
            })
            resolve(Object.values(state.items))
          })
      })
    }
  },
  getters: {},
  mutations: {},
  state: {
    items: {}
  }
}
