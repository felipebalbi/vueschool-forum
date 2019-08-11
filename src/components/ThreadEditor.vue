<template>
  <form @submit.prevent="save">
    <div class="form-group">
      <label for="thread_title">Title:</label>
      <input
        v-model.lazy="form.title"
        @blur="$v.form.title.$touch()"
        type="text"
        id="thread_title"
        class="form-input"
        name="title"
      />
      <template v-if="$v.form.title.$error">
        <span v-if="!$v.form.title.required" class="form-error">This field is required</span>
        <span
          v-else-if="!$v.form.title.minLength"
          class="form-error"
        >The title must be at least 6 characters long</span>
      </template>
    </div>

    <div class="form-group">
      <label for="thread_content">Content:</label>
      <textarea
        v-model.lazy="form.text"
        @blur="$v.form.text.$touch()"
        id="thread_content"
        class="form-input"
        name="content"
        rows="8"
        cols="140"
      ></textarea>
      <template v-if="$v.form.text.$error">
        <span v-if="!$v.form.text.required" class="form-error">This field is required</span>
        <span
          v-else-if="!$v.form.text.minLength"
          class="form-error"
        >The text must be at least 6 characters long</span>
        <span
          v-else-if="!$v.form.text.maxLength"
          class="form-error"
        >The text must be at most 280 characters long</span>
      </template>
    </div>

    <div class="btn-group">
      <button @click.prevent="cancel" class="btn btn-ghost">Cancel</button>
      <button
        class="btn btn-blue"
        type="submit"
        name="Publish"
      >{{ isUpdate ? 'Update' : 'Publish' }}</button>
    </div>
  </form>
</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      form: {
        title: this.title,
        text: this.text
      }
    }
  },

  validations: {
    form: {
      title: {
        required,
        minLength: minLength(5)
      },

      text: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(280)
      }
    }
  },

  props: {
    title: {
      type: String,
      default: ''
    },

    text: {
      type: String,
      default: ''
    }
  },

  computed: {
    isUpdate () {
      return !!this.title
    }
  },

  methods: {
    save () {
      this.$emit('save', { title: this.form.title, text: this.form.text })
    },

    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>
