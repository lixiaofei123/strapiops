<template>
  <div v-if="schema">
    <div v-for="(value, name) in schema.properties">
      <el-form-item :label="value.label ? value.label : name" :required="value.required" :error="errors[name]">
        <el-input v-if="value.type === 'string'" v-model="data[name]"></el-input>
        <el-input v-if="value.type === 'number'" v-model="data[name]" type="number"></el-input>
        <el-switch v-if="value.type === 'boolean'" v-model="data[name]" active-color="#13ce66" inactive-color="#ff4949">
        </el-switch>
        <el-select v-if="value.type === 'enumeration'" v-model="data[name]">
          <el-option v-for="item in value.enum" :key="item.value" :label="item.label ? item.label : item.value"
            :value="item.value">
          </el-option>
        </el-select>
        <ObjectField v-if="value.type === 'object'" :schema="value" v-model="data[name]" :ref="name"></ObjectField>
        <ArrayField v-if="value.type === 'array'" :schema="value" v-model="data[name]" :ref="name"></ArrayField>
      </el-form-item>
    </div>
  </div>
</template>

<script>

import ObjectField from "./ObjectField"
import ArrayField from "./ArrayField"


export default {
  name: "ObjectField",
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
    schema: Object,
  },
  data() {
    return {
      data: this.value ? this.value : {},
      errors: {}
    };
  },
  watch: {
    data: {
      deep: true,
      handler(newval) {
        this.$emit("change", newval);
      }
    },
  },
  mounted() {

  },
  methods: {
    validate() {
      let noerror = true
      this.errors = {}
      let properties = this.schema.properties
      let keys = Object.keys(properties)
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        if (properties[key]) {
          let type = properties[key].type
          if (type !== "object" && type !== "array") {
            if (properties[key] && properties[key].required && !this.data[key]) {
              this.errors[key] = "此项是必填项"
              noerror = false
            }
          } else {
            let obj = this.$refs[key]
            if (obj && obj.length > 0 && obj[0].validate) {
              if (!obj[0].validate()) {
                noerror = false
              }
            }
          }

        }

      }
      return noerror
    }
  },
};
</script>

<style scoped></style>
