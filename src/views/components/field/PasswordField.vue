<template>
  <el-input v-if="attribute && metadata" v-model="data" type="password" :show-password="true"
    :placeholder="metadata.edit.placeholder" :minlength="attribute.minLength ? attribute.minLength : 0"
    :maxlength="attribute.maxLength ? attribute.maxLength : ''" :disabled="!metadata.edit.editable">
  </el-input>
</template>

<script>
export default {
  name: "PasswordField",
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
      data: this.value
    };
  },
  watch: {
    data(newval) {
      this.$emit("change", newval);
    },
  },
  methods: {
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