<template>
  <div v-if="asyncDataStatus_ready" class="col-full push-top">
    <h1>Welcome to the forum</h1>

    <CategoryList :categories="categories" />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'
import CategoryList from '@/components/CategoryList'

export default {
  components: {
    CategoryList
  },

  mixins: [asyncDataStatus],

  computed: {
    categories () {
      return Object.values(this.$store.state.categories.items)
    }
  },

  methods: {
    ...mapActions('categories', ['fetchAllCategories']),
    ...mapActions('forums', ['fetchForums'])
  },

  created () {
    this.fetchAllCategories().then(categories =>
      Promise.all(
        categories.map(category => this.fetchForums({ ids: category.forums }))
      ).then(() => {
        this.asyncDataStatus_fetched()
      })
    )
  }
}
</script>

