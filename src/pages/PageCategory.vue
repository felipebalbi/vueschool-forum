<template>
  <div v-if="asyncDataStatus_ready" class="category-wrapper">
    <div class="col-full push-top">
      <h1>{{category.name}}</h1>
    </div>

    <div class="col-full">
      <CategoryListItem :category="category" />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'
import CategoryListItem from '@/components/CategoryListItem'

export default {
  props: {
    id: {
      required: true,
      type: String
    }
  },
  mixins: [asyncDataStatus],

  computed: {
    category () {
      return this.$store.state.categories.items[this.id]
    }
  },

  components: {
    CategoryListItem
  },

  methods: {
    ...mapActions('categories', ['fetchCategory']),
    ...mapActions('forums', ['fetchForums'])
  },

  created () {
    this.fetchCategory({ id: this.id }).then(category =>
      this.fetchForums({ ids: category.forums }).then(() => {
        this.asyncDataStatus_fetched()
      })
    )
  }
}
</script>

<style scoped>
.category-wrapper {
  width: 100%;
}
</style>
