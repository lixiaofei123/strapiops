<template>
  <el-date-picker v-if="attribute && metadata && (attribute.type === 'date' || attribute.type === 'datetime')"
    v-model="data" :type="attribute.type" :placeholder="metadata.edit.placeholder"
    :value-format="attribute.type === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-ddTHH:mm:ss.000Z'"
    :disabled="!metadata.edit.editable">
  </el-date-picker>
  <el-time-picker v-else-if="attribute && metadata && attribute.type === 'time'" v-model="data" :type="attribute.type"
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
