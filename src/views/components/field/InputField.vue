<template>
  <el-form-item v-if="attribute && metadata.edit.visible" :label="metadata.edit.label"
    :required="attribute.required" :error="errText">
    <StringField v-if="attribute.type === 'string' || attribute.type === 'text'" ref="input" v-model="data" :attribute="attribute"
      :metadata="metadata">
    </StringField>
    <EmailField v-else-if="attribute.type === 'email'" ref="input" v-model="data" :attribute="attribute"
      :metadata="metadata">
    </EmailField>
    <PasswordField v-else-if="attribute.type === 'password'" ref="input" v-model="data" :attribute="attribute"
      :metadata="metadata">
    </PasswordField>
    <NumberField v-else-if="attribute.type === 'integer' || attribute.type === 'float' || attribute.type === 'decimal'" 
      ref="input" v-model="data" :attribute="attribute"
      :metadata="metadata">
    </NumberField>
    <BigIntegerField v-else-if="attribute.type === 'biginteger'" ref="input" v-model="data" :attribute="attribute"
      :metadata="metadata">
    </BigIntegerField>
    <EnumerationField v-else-if="attribute.type === 'enumeration'" ref="input" v-model="data" :attribute="attribute"
      :metadata="metadata">
    </EnumerationField>
    <TimeField v-else-if="attribute.type === 'date' || attribute.type === 'datetime' || attribute.type === 'time'" ref="input" v-model="data" :attribute="attribute"
      :metadata="metadata">
    </TimeField>
    <BooleanField v-else-if="attribute.type === 'boolean'" ref="input" v-model="data" :attribute="attribute"
      :metadata="metadata">
    </BooleanField>
    <RichTextField v-else-if="attribute.type === 'richtext'" ref="input" v-model="data" :attribute="attribute"
      :metadata="metadata">
    </RichTextField>
    <MediaField v-else-if="attribute.type === 'media'" ref="input" v-model="data" :attribute="attribute"
      :metadata="metadata">
    </MediaField>
    <span style="display: block;">{{ description }}</span>
  </el-form-item>
</template>

<script>

import StringField from "./StringField"
import EmailField from "./EmailField"
import PasswordField from "./PasswordField"
import NumberField from "./NumberField"
import BigIntegerField from "./BigIntegerField"
import EnumerationField from "./EnumerationField"
import TimeField from "./TimeField"
import BooleanField from "./BooleanField"
import RichTextField from "./RichTextField"
import MediaField from "./MediaField"

export default {
  name: "InputField",
  model: {
    prop: "value",
    event: "change"
  },
  components: {
    StringField,
    EmailField,
    PasswordField,
    NumberField,
    BigIntegerField,
    EnumerationField,
    TimeField,
    BooleanField,
    RichTextField,
    MediaField
  },
  props: {
    value: [String, Object, Array, Number,Boolean],
    attribute: Object,
    metadata: Object
  },
  data() {
    return {
      data: this.value,
      errText: "",
      description: this.metadata.edit.description
    };
  },
  mounted() {
  },
  watch: {
    data(newval) {
      this.$emit("change", newval);
    },
    $refs(){
      console.log(this.$refs)
    }
  },
  methods: {
    validate(){
      this.errText = ""
      if(this.$refs.input && this.$refs.input.validate){
        let result = this.$refs.input.validate()
        if(result === true){
          return true
        }else{
          this.errText = result
          return false
        }
      }
      return true
    },
    descriptionChanged(newdesc){
      this.description = newdesc
    }
  },
};
</script>

<style scoped></style>
