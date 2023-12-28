<template>
  <el-date-picker v-if="attribute && metadata"
    v-model="data" :type="attribute.type" :placeholder="metadata.edit.placeholder"
    :disabled="!metadata.edit.editable">
  </el-date-picker>
</template>

<script>


export default {
  name: "DateTimeField",
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
      data: this.value ? Date.parse(this.value) : undefined,
    };
  },
  watch: {
    data(newval) {
      if(newval){
        this.$emit("change", newval.toISOString());
      }else{
        this.$emit("change", undefined);
      }
      
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
