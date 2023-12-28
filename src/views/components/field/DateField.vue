<template>
  <el-date-picker v-if="attribute && metadata"
    v-model="data" :type="attribute.type" :placeholder="metadata.edit.placeholder"
    value-format="yyyy-MM-dd"
    :disabled="!metadata.edit.editable">
  </el-date-picker>
</template>

<script>


export default {
  name: "DateField",
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
    };
  },
  watch: {
    data(newval) {
      this.$emit("change", newval);
    },
  },
  mounted() {
    

  },
  methods: {
    validate() {
      if (this.attribute.required && !this.value) {
        return "此项为必填"
      }
      return true
    }
  },
};
</script>

<style scoped></style>
