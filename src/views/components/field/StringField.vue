<template>
  <div v-if="attribute && metadata">
    <el-input v-model="data" v-if="attribute.type === 'text'" :type="'textarea'" :placeholder="metadata.edit.placeholder"
      :minlength="attribute.minLength ? attribute.minLength : 0"
      :maxlength="attribute.maxLength ? attribute.maxLength : ''" :disabled="!metadata.edit.editable">
    </el-input>
    <el-input v-model="data" v-else :type="'textarea'" :placeholder="metadata.edit.placeholder"
      :minlength="attribute.minLength ? attribute.minLength : 0"
      :maxlength="attribute.maxLength ? attribute.maxLength : ''" :disabled="!metadata.edit.editable"
      :rows="5"
      >
    </el-input>
  </div>
</template>

<script>


export default {
  name: "StringField",
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
      regex: undefined
    };
  },
  watch: {
    data(newval) {
      this.$emit("change", newval);
    },
  },
  mounted() {
    if (this.attribute.regex) {
      this.regex = new RegExp(this.attribute.regex)
    }
  },
  methods: {
    validate() {
      //this.attribute.regex
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
        if (this.regex && !this.regex.test(this.value)) {
          return "不符合正则表达式规则"
        }
      }

      return true
    }
  },
};
</script>

<style scoped></style>
