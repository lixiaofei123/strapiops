<template>
  <el-input v-if="attribute && metadata" v-model="data" type="text" :placeholder="metadata.edit.placeholder"
    :disabled="!metadata.edit.editable">
  </el-input>
</template>

<script>


export default {
  name: "BigIntegerField",
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

      if(isNaN(this.value)){
        return "不是合法的数字"
      }
      if (this.value) {
        let value = parseInt(this.value)
        if (this.attribute.min > 0 && value < this.attribute.min) {
          return `字段的值应该大于${this.attribute.min}`
        }
        if (this.attribute.max > 0 && value > this.attribute.max) {
          return `字段的值应该小于${this.attribute.max}`
        }

      }

      return true
    }
  },
};
</script>

<style scoped></style>
