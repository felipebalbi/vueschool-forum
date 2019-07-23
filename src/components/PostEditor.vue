<template>
  <div>
    <form @submit.prevent="save">
      <div class="form-group">
        <textarea name id cols="30" row="10" class="form-input" v-model="text"></textarea>
      </div>

      <div class="form-actions">
        <button class="btn-blue">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      text: ''
    }
  },
  props: {
    threadId: {
      require: true
    }
  },
  methods: {
    save () {
      const post = {
        text: this.text,
        threadId: this.threadId
      }

      this.text = ''
      this.$emit('save', { post })
      this.$store.dispatch('createPost', post)
    }
  }
}
</script>

