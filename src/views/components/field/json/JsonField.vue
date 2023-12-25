<template>
  <div>
    <div v-if="attribute && metadata && schema">
      <ObjectField v-if="schema.type === 'object'" :schema="schema" v-model="data" ref="jsonfield"></ObjectField>
      <ArrayField v-if="schema.type === 'array'" :schema="schema" v-model="data" ref="jsonfield"></ArrayField>
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
    value: [Object, Array],
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
    console.log(this.data)
    if (this.schema && this.data) {
      let check = this.checkDataWithSchema(this.schema, this.data)
      if (check) {
        console.log("符合规则")
      } else {
        this.$message.error(`${this.metadata.edit.label}的值不匹配设置的schema，本次保存将会覆盖旧值`);
        this.data = undefined
      }
    }
    this.$emit("descriptionChanged", "")
  },
  methods: {
    checkSchema() {
      // TODO 检查schema是否合法
      return true
    },
    checkDataWithSchema(field, data) {
      // 检查目前的数据是否符合schema
      if (data && field) {
        if (field.type === 'array') {
          if (data instanceof Array) {
            let check = true
            Object.keys(field.properties).forEach(key => {
              for (let i = 0; i < data.length; i++) {
                if (!this.checkDataWithSchema(field.properties[key], data[i][key])) {
                  check = false
                }
              }

            })
            return check
          } else {
            return false
          }

        }
        if (field.type === 'object') {
          if (data instanceof Object && !(data instanceof Array)) {
            let check = true
            Object.keys(field.properties).forEach(key => {
              if (!this.checkDataWithSchema(field.properties[key], data[key])) {
                check = false
              }
            })
            return check
          } else {
            return false
          }
        }
        if (field.type === 'string') {
          return typeof data === "string"
        }
        if (field.type === 'number') {
          return !isNaN(data)
        }
        if (field.type === 'boolean') {
          return typeof data === "boolean"
        }
      }
      return true
    },
    validate() {
      if (this.attribute.required && this.value === undefined) {
        return "此项为必填"
      }
      let jsonfield = this.$refs["jsonfield"]
      if (jsonfield && jsonfield.validate && !jsonfield.validate()) {
        return "存在不符合要求的输入"
      }
      return true
    }
  },
};
</script>

<style scoped></style>
