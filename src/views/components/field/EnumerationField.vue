<template>
  <el-select v-if="attribute && metadata" v-model="data"
    :placeholder="metadata.edit.placeholder" :disabled="!metadata.edit.editable">
    <el-option v-for="(item, index) in enums" :key="item"
      :label="labels[index]" :value="item">
    </el-option>
  </el-select>
</template>

<script>


export default {
  name: "EnumerationField",
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
      enums: [],
      labels: [],
    };
  },
  watch: {
    data(newval) {
      this.$emit("change", newval);
    },
  },
  mounted() {
    let description = this.metadata.edit.description;
    let enums = this.attribute.enum;
    let labels = description.split(";")
    if(labels.length !== enums.length){
      labels = enums
    }else{
      this.$emit("descriptionChanged", "")
    }
    this.enums = enums
    this.labels = labels
    
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
