<template>
  <ckeditor class="ckeditor" ref="ckeditor" v-if="attribute && metadata && editorConfig" :editor="editor"
    :disabled="!metadata.edit.editable" v-model="data" :config="editorConfig" style="height:300px"></ckeditor>
</template>

<script>


import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import UploadAdapter from './UploadAdapter';

export default {
  name: "RichTextField",
  props: ["value"],
  model: {
    prop: "value",
    event: "change"
  },
  components: {

  },
  props: {
    value: String,
    attribute: Object,
    metadata: Object
  },
  data() {
    return {
      data: this.value,
      editor: ClassicEditor,
      editorConfig: undefined
    };
  },
  watch: {
    data(newval) {
      this.$emit("change", newval);
    },
  },
  mounted() {
    this.init_editor()
  },
  methods: {
    init_editor() {
      let folder = this.$store.getters.getEditorFolder()
      if (folder) {
        this.editorConfig = {
          toolbar: ['bold', 'italic', '|', 'link', 'uploadImage'],
          // extraPlugins: [this.uploader],
          folderid: folder,
        }
      } else {
        setTimeout(() => {
          this.init_editor()
        }, 100)
      }

    },
    uploader(editor) {
      // let folderid = editor.config._config.folderid
      // editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      //   return new UploadAdapter(loader, folderid);
      // };
    },
    validate() {
      if (this.attribute.required && !this.value) {
        return "此项为必填"
      }
      if (this.value) {
        if (this.attribute.minLength && this.value.length < this.attribute.minLength) {
          return `字段的长度应该大于${this.attribute.minLength}`
        }
        if (this.attribute.maxLength && this.value.length > this.attribute.maxLength) {
          return `字段的长度应该小于${this.attribute.minLength}`
        }

      }

      return true
    }
  },
};
</script>

<style scoped></style>
