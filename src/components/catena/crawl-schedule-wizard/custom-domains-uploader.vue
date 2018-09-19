<template>
  <div :class="rootCss">
    <form>
      <label :for="rootCss[0]">
        <v-btn block dark :color="color" :class="[`${rootCss[0]}-dummy-button`]">
          <v-icon>file_upload</v-icon> <span>{{ lang.uploadCsv }}</span>
        </v-btn>
        <input @change="getFileData" type="file" :id="rootCss[0]" :name="rootCss[0]" :class="[`${rootCss[0]}-file-input`]" />
      </label>
    </form>
  </div>
</template>
<script>
import lang from './lang'

export default {
  name: 'CustomDomainsUploader',
  data () {
    return {
      lang,
      rootCss: ['custom-domains-uploader'],
      file: null
    }
  },
  props: {
    color: {
      type: String,
      default: 'grey'
    }
  },
  methods: {
    /**
     * Get the files array of the file input
     * @method getFileInputFormData
     * @return {Object}
     * */
    getFileInputFormData () {
      return this.$el.querySelector('input').files[0]
    },
    /**
     * Get the file data
     * @method getFileData
     * @return void
     * */
    getFileData () {
      this.file = this.getFileInputFormData()
      this.getBlob()
    },
    /**
     * Reset the form
     * @method resetForm
     * @return {void}
     * */
    resetForm () {
      this.file = null
      this.$el.querySelector('form').reset()
    },
    /**
     * Get the file blob
     * @method getBlob
     * @return {void}
     * */
    getBlob () {
      const reader = new FileReader()
      if (this.file.type !== 'text/csv') {
        this.$emit('error')
        this.resetForm()
        return
      }
      reader.readAsText(this.file)
      reader.onload = () => {
        this.$emit('input', reader.result.replace(/\n/g, ',').split(','))
        this.resetForm()
      }
    }
  }
}
</script>
<style>
.custom-domains-uploader label
{
  cursor: pointer;
}

.custom-domains-uploader .custom-domains-uploader-dummy-button
{
  pointer-events: none;
}

.custom-domains-uploader .custom-domains-uploader-file-input
{
  position: absolute;
  clip: rect(0, 0, 0, 0);
}
</style>
