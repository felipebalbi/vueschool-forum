<template>
  <div class="col-full push-top">
    <h1>
      Editting
      <i>{{thread.title}}</i>

      <ThreadEditor :title="thread.title" :text="text" @save="save" @cancel="cancel" />
    </h1>
  </div>
</template>

<script>
import ThreadEditor from '@/components/ThreadEditor.vue'

export default {
  components: {
    ThreadEditor
  },

  props: {
    id: {
      required: true,
      type: String
    }
  },

  computed: {
    thread () {
      return this.$store.state.threads[this.id]
    },

    text () {
      return this.$store.state.posts[this.thread.firstPostId].text
    }
  },

  methods: {
    save ({ title, text }) {
      this.$store
        .dispatch('updateThread', {
          id: this.id,
          title,
          text
        })
        .then(thread => {
          this.$router.push({
            name: 'ThreadShow',
            params: { id: thread['.key'] }
          })
        })
    },

    cancel () {
      this.$router.push({
        name: 'Forum',
        params: { id: this.thread.forumId }
      })
    }
  }
}
</script>