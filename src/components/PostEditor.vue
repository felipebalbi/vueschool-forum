<template>
<div>
  <form @submit.prevent="save">
    <div class="form-group">
      <textarea
	name=""
	id=""
	cols="30"
	row="10"
	class="form-input"
	v-model="text">
      </textarea>
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
      const postId = 'greatPost' + Math.random()

      const post = {
        text: this.text,
        publishedAt: Math.floor(Date.now() / 1000),
        threadId: this.threadId,
        userId: 'VXjpr2WHa8Ux4Bnggym8QFLdv5C3',
        '.key': postId
      }

      this.text = ''
      this.$emit('save', { post })
    }
  }
}
</script>

