<template>
  <div v-if="schema" class="border">

    <el-button-group class="switch">
      <el-button :type="mode === 'edit' ? 'primary' : ''" size="small" @click="mode = 'edit'">编辑模式</el-button>
      <el-button :type="mode === 'preview' ? 'primary' : ''" size="small" @click="mode = 'preview'">JSON预览</el-button>
    </el-button-group>

    <div v-if="attribute && metadata && schema">
      <div v-if="mode === 'edit'">
        <ObjectField v-if="schema.type === 'object'" :schema="schema" v-model="data" ref="jsonfield"></ObjectField>
        <ArrayField v-if="schema.type === 'array'" :schema="schema" v-model="data" ref="jsonfield"></ArrayField>
      </div>
      <div v-if="mode === 'preview'">
        <JsonEditorVue v-model="data" v-bind="{ readOnly: true }" />
      </div>
    </div>
  </div>
  <div v-else>
    <JsonEditorVue v-model="data" />
  </div>
</template>

<script>

import ObjectField from "./ObjectField"
import ArrayField from "./ArrayField"
import JsonEditorVue from 'json-editor-vue'

export default {
  name: "JsonField",
  props: ["value"],
  model: {
    prop: "value",
    event: "change"
  },
  components: {
    ObjectField,
    ArrayField,
    JsonEditorVue
  },
  props: {
    value: [Object, Array, String],
    attribute: Object,
    metadata: Object
  },
  data() {
    return {
      data: this.value,
      schema: undefined,
      mode: 'edit'
    };
  },
  watch: {
    data(newval) {
      if (typeof newval === 'string' && this.checkIsJson(newval)) {
        this.$emit("change", JSON.parse(newval));
      } else if(typeof newval === 'Object'){
        this.$emit("change", newval);
      }

    },
  },
  mounted() {
    let description = this.metadata.edit.description
    if (this.checkIsJson(description)) {
      this.schema = JSON.parse(this.metadata.edit.description)
      if (this.schema) {
        this.$emit("descriptionChanged", "")
      }
      if (this.schema && this.data) {
        let check = this.checkDataWithSchema(this.schema, this.data)
        if (check) {
        } else {
          this.$message.error(`${this.metadata.edit.label}的值不匹配设置的schema，本次保存将会覆盖旧值`);
          this.data = undefined
        }
      }
    }
  },
  methods: {
    checkIsJson(str) {
      if (str.startsWith("[") || str.startsWith("{")) {
        try {
          JSON.parse(str)
          return true
        } catch {
          return false
        }
      }
      return false
    },
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

      if (typeof this.data === "string" &&
        !this.checkIsJson(this.data)) {
        return "非法的JSON字符串"
      }

      return true
    }
  },
};
</script>

<style scoped>
.border {
  border: 2px solid #dedede;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  padding-top: 60px;
}

.switch {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
