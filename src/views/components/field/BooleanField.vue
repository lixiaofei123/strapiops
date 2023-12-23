<template>
  <el-switch v-if="attribute && metadata" v-model="data" active-color="#13ce66" inactive-color="#ff4949"
    :disabled="!metadata.edit.editable">
  </el-switch>
</template>

<script>


export default {
  name: "BooleanField",
  props: ["value"],
  model: {
    prop: "value",
    event: "change"
  },
  components: {

  },
  props: {
    value: Boolean,
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
      if (this.attribute.required && this.value === undefined) {
        return "此项为必填"
      }
      return true
    }
  },
};
</script>

<style scoped></style>
