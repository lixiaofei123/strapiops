<template>
  <div>
    <div v-if="schema">
      <ObjectField :schema="schema" v-for="(item, index) in data" v-bind:key="item.id" v-model="item.data" ref="fields">
      </ObjectField>
      <el-button @click="addNew">增加一个新的{{ schema.label }}</el-button>
    </div>
  </div>
</template>

<script>

import { v4 as uuidv4 } from 'uuid';

export default {
  name: "ArrayField",
  props: ["value"],
  model: {
    prop: "value",
    event: "change"
  },
  components: {
    ObjectField: () => import('./ObjectField')
  },
  props: {
    value: Array,
    schema: Object,
  },
  data() {
    return {
      data: this.value ? this.value.map(item => { return { id: uuidv4(), data: item } }) : [],
    };
  },
  watch: {
    data: {
      deep: true,
      handler(newval) {
        this.$emit("change", newval.map(item => item.data));
      }
    },
  },
  mounted() {

  },
  methods: {
    addNew() {
      this.data.push({
        id: uuidv4(),
        data: {}
      })
    },
    validate() {
      if (this.schema.required && (!this.data || this.data.length === 0)) {
        return false
      }
      let noerror = true
      if (this.$refs["fields"]) {
        for (let i = 0; i < this.$refs["fields"].length; i++) {
          let obj = this.$refs["fields"][i]
          if (obj.validate && !obj.validate()) {
            noerror = false
          }
        }
      }

      return noerror
    }
  },
};
</script>

<style scoped></style>
