<template>
  <el-time-picker v-if="attribute && metadata" v-model="data" :type="attribute.type"
    :placeholder="metadata.edit.placeholder" value-format="HH:mm:ss" :disabled="!metadata.edit.editable">
  </el-time-picker>
</template>

<script>


export default {
  name: "TimeField",
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
