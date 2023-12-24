<template>
  <div>
    <div v-if="attribute && metadata && schema">
        <ObjectField v-if="schema.type === 'object'" :schema="schema" v-model="data" ref="jsonfield"></ObjectField>
        <ArrayField  v-if="schema.type === 'array'" :schema="schema" v-model="data" ref="jsonfield"></ArrayField>
    </div>
  </div>
</template>

<script>

import ObjectField from "./ObjectField"
import ArrayField from "./ArrayField"

export default {
  name: "JsonField",
  props: ["value"],
  model: {
    prop: "value",
    event: "change"
  },
  components: {
    ObjectField,
    ArrayField
  },
  props: {
    value: Object,
    attribute: Object,
    metadata: Object
  },
  data() {
    return {
      data: this.value,
      schema: undefined
    };
  },
  watch: {
    data(newval) {
      this.$emit("change", newval);
    },
  },
  mounted() {
   this.schema = JSON.parse(this.metadata.edit.description)
   this.$emit("descriptionChanged", "没有描述信息")
  },
  methods: {
    validate() {
      if (this.attribute.required && this.value === undefined) {
        return "此项为必填"
      }
      let jsonfield = this.$refs["jsonfield"]
      if(jsonfield && jsonfield.validate &&  !jsonfield.validate()){
        return "存在不符合要求的输入"
      }
      return true
    }
  },
};
</script>

<style scoped></style>
