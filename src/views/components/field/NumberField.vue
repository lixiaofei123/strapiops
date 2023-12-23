<template>
  <el-input-number v-if="attribute && metadata" type="number" v-model="data" :precision="precision" :max="attribute.max"
    :min="attribute.min" :placeholder="metadata.edit.placeholder" :disabled="!metadata.edit.editable"> </el-input-number>
</template>

<script>


export default {
  name: "NumberField",
  props: ["value"],
  model: {
    prop: "value",
    event: "change"
  },
  components: {

  },
  props: {
    value: Number,
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
      if (this.attribute.required && this.value === undefined) {
        return "此项为必填"
      }
      if (this.value !== undefined) {
        if (this.attribute.min > 0 && this.value < this.attribute.min) {
          return `字段的值应该大于${this.attribute.min}`
        }
        if (this.attribute.max > 0 && this.value > this.attribute.max) {
          return `字段的值应该小于${this.attribute.max}`
        }

      }

      return true
    }
  },
  computed:{
    precision(){
      return this.attribute.type === "integer" ? 0 : (this.attribute.type === "float" ? 9 : 2)
    }
  }
};
</script>

<style scoped></style>
