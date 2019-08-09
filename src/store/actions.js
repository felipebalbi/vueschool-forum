import firebase from 'firebase'
import { Promise } from 'q'

export default {
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
