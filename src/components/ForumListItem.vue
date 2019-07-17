<template>
<div class="forum-listing">
  <div class="forum-details">
    <router-link
      :to="{name: 'Forum', params: {id: forum['.key']}}"
      class="text-xlarge">{{forum.name}}</router-link>
    <p>{{forum.description}}</p>
  </div>
  
  <div class="threads-count">
    <p><span class="count">{{threadsCount}}</span>
    {{threadsCount === 1 ? 'thread' : 'threads'}}</p>
  </div>
  
  <div class="last-thread">
    <!-- TODO -->
  </div>
</div>
</template>

<script>
export default {
  props: {
    forum: {
      required: true,
      type: Object
    }
  },

  computed: {
    threadsCount () {
      return this.forum.threads ? Object.values(this.forum.threads).length : 0
    }
  }
}
</script>
