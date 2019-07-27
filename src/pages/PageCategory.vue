<template>
  <div v-if="category" class="category-wrapper">
    <div class="col-full push-top">
      <h1>{{category.name}}</h1>
    </div>

    <div class="col-full">
      <CategoryListItem :category="category" />
    </div>
  </div>
</template>

<script>
import CategoryListItem from '@/components/CategoryListItem'

export default {
  props: {
    id: {
      required: true,
      type: String
    }
  },

  computed: {
    category () {
      return this.$store.state.categories[this.id]
    }
  },

  components: {
    CategoryListItem
  },

  created () {
    this.$store.dispatch('fetchCategory', { id: this.id }).then(category => {
      this.$store.dispatch('fetchForums', { ids: category.forums })
    })
  }
}
</script>

<style scoped>
.category-wrapper {
  width: 100%;
}
</style>
