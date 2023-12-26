<template>
  <div>
    <el-row>
      <el-col :span="24" :xl="12" style="padding-right: 20px;">
        <el-card>
          <div slot="header">
            创建Json字段
          </div>
          <div>
            <el-alert title="这里是一段关于创建Json字段Schema的作用描述" type="info">
            </el-alert>
            <div style="margin-top: 20px;">
              <el-button type="text" @click="showCreateDialog = true"
                v-if="schemalist.length === 0">点击创建Schema</el-button>
              <div v-for="(schema, index) in valid_schemalist" v-bind:key="schema.id" style="margin-bottom: 20px;">
                <el-tag :type="schema.hover ? 'danger' : ''" style="margin-right: 10px; cursor: pointer;"
                  @mouseover.native="enterField(schema)" @mouseleave.native="leaveField(schema)">{{ schema.label }} [{{
                    type2name[schema.type] }}]

                </el-tag>

                <el-tag :type="(value.hover || schema.hover) ? 'danger' : ''" style="margin-right: 10px; cursor: pointer;"
                  v-for="(value, name) in schema.properties" closable @click="editField(index, name)"
                  @close="deleteField(index, name)" @mouseover.native="entertag(value)"
                  @mouseleave.native="leavetag(value)">{{ name }}[{{
                    type2name[value.type] }}]({{ value.label }})</el-tag>
                <el-button class="button-new-tag" size="small"
                  @click="showCreateDialogForAddField(index)">增加字段</el-button>
              </div>
            </div>
          </div>
        </el-card>
        <div style="height: 20px;"></div>
        <el-card>
          <div slot="header">
            Schema生成
          </div>
          <div>
            <el-input type="textarea" v-model="schemetext" :autosize="true" :disabled="true">
            </el-input>
          </div>
        </el-card>
        <div style="height: 20px;"></div>

      </el-col>
      <el-col :span="24" :xl="12" style="padding-right: 20px;">
        <el-card>
          <div slot="header">
            JSON字段效果预览
          </div>
          <div style="margin-top: 20px;" v-if="schema">
            <el-form label-width="140px">
              <ObjectField v-if="schema.type === 'object'" :schema="schema" v-model="data"></ObjectField>
              <ArrayField v-if="schema.type === 'array'" :schema="schema" v-model="data"></ArrayField>
            </el-form>
          </div>
        </el-card>
        <div style="height: 20px;"></div>
        <el-card>
          <div slot="header">
            JSON结果预览
          </div>
          <div style="margin-top: 20px;" v-if="schema">
            <el-input type="textarea" v-model="datatext" :autosize="true" :disabled="true">
            </el-input>
          </div>
        </el-card>

      </el-col>
    </el-row>

    <el-dialog title="创建字段" :visible="showCreateDialog">
      <el-form label-width="120px">
        <el-form-item label="类型">
          <el-radio v-if="schemalist.length > 0" v-model="newfield.type" label="string">字符串</el-radio>
          <el-radio v-if="schemalist.length > 0" v-model="newfield.type" label="number">数字</el-radio>
          <el-radio v-if="schemalist.length > 0" v-model="newfield.type" label="boolean">布尔</el-radio>
          <el-radio v-if="schemalist.length > 0" v-model="newfield.type" label="enumeration">枚举</el-radio>
          <el-radio v-model="newfield.type" label="object">对象</el-radio>
          <el-radio v-model="newfield.type" label="array">数组</el-radio>
        </el-form-item>
        <el-form-item label="名称" required v-if="schemalist.length > 0">
          <el-input v-model="newfield.name" :disabled="newfield.edit"></el-input>
          <span>数据库存储的名称(建议用英文)</span>
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model="newfield.label"></el-input>
          <span>网页上显示的名称</span>
        </el-form-item>
        <el-form-item label="是否必填" required>
          <el-switch v-model="newfield.required"></el-switch>
        </el-form-item>
        <el-form-item label="枚举值" required v-if="newfield.type === 'enumeration' && schemalist.length > 0">
          <div v-for="item in newfield.enum" v-bind:key="item.id" style="margin-bottom: 15px;">
            显示名称 <el-input v-model="item.label" style="width: 120px;margin-right: 20px;"></el-input> 存储名称 <el-input
              v-model="item.value" style="width: 120px;margin-right: 20px;"></el-input><el-button type="text"
              style="color: red;" @click="deleteEnumOption(item)">删除</el-button>
          </div>
          <el-button type="text" @click="addNewEnumOption()">添加新的枚举值</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeCreateDialog()">取 消</el-button>
        <el-button type="primary" @click="addNewField()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

import { v4 as uuidv4 } from 'uuid';
import { deepCopy } from "../../utils/utils";

import ObjectField from "../components/field/json/ObjectField"
import ArrayField from "../components/field/json/ArrayField"

export default {
  name: "JsonSchemaGenerator",
  components: {
    ObjectField,
    ArrayField
  },
  data() {
    return {
      data: {},
      type2name: {
        string: '字符串',
        number: '数字',
        boolean: '布尔',
        enumeration: '枚举',
        object: '对象',
        array: '数组'
      },
      showCreateDialog: false,
      schemalist: [],
      newfield: {
        name: 'root',
        label: '',
        type: 'object',
        required: false,
        enum: [
        ]
      },
      editSchemaIndex: -1,
    };
  },
  created() {
    this.$store.commit('setNavs', [
      {
        active: true,
        name: "Json字段Schema生成"
      }
    ])
  },
  computed: {
    valid_schemalist() {
      return this.schemalist.filter(item => item.delete !== true)
    },
    schema() {
      if (this.schemalist.length === 0) {
        return "{}"
      } else {
        let rootschema = this.schemaToText(0)
        return rootschema
      }
    },
    schemetext() {
      return JSON.stringify(this.schema)
    },
    datatext() {
      return JSON.stringify(this.data, null, "\t")
    }
  },
  watch: {

  },
  methods: {
    clearDialog() {
      this.newfield = {
        name: this.schemalist.length === 0 ? 'root' : '',
        label: '',
        type: this.schemalist.length === 0 ? 'object' : 'string',
        required: false,
        enum: [
        ]
      }
    },
    closeCreateDialog() {
      this.showCreateDialog = false
      this.clearDialog()
    },
    showCreateDialogForAddField(index) {
      this.clearDialog()
      this.editSchemaIndex = index
      this.showCreateDialog = true
    },
    addNewEnumOption() {
      this.newfield.enum.push({ id: uuidv4(), label: '', value: '' })
    },
    deleteEnumOption(item) {
      let index = this.newfield.enum.findIndex(x => x.id === item.id)
      if (index !== -1) {
        this.newfield.enum.splice(index, 1)
      }
    },
    editField(index, name) {
      let objfield = this.schemalist[index]
      if (objfield && objfield.properties && objfield.properties[name]) {
        let property = objfield.properties[name]
        this.newfield = {
          name: name,
          label: property.label,
          type: property.type,
          required: property.required,
          enum: property.enum,
          edit: true,
        }

        this.editSchemaIndex = index
        this.showCreateDialog = true
      }

    },
    addNewField() {
      let newfield = {
        id: uuidv4(),
        label: this.newfield.label,
        required: this.newfield.required,
        type: this.newfield.type,
      }
      if (this.newfield.type === 'enumeration') {
        newfield.enum = this.newfield.enum
      }
      if (this.editSchemaIndex === -1) {
        newfield.properties = {}
        if (newfield.type === "object") {
          this.data = {}
        } else {
          this.data = []
        }
        this.schemalist.push(newfield)
      } else {
        let schema = this.schemalist[this.editSchemaIndex]
        if (schema.properties[this.newfield.name]) {
          // 更新值
          let oldschema = schema.properties[this.newfield.name]
          let linkedindex = oldschema.index
          let newfield0 = deepCopy(newfield)
          newfield0.index = linkedindex
          schema.properties[this.newfield.name] = deepCopy(newfield0)

          let linkschema = this.schemalist[linkedindex]
          linkschema.label = newfield0.label
          linkschema.required = newfield0.required

          this.$set(this.schemalist, this.editSchemaIndex, schema)
          this.$set(this.schemalist, this.linkedindex, linkschema)

        } else {
          schema.properties[this.newfield.name] = deepCopy(newfield)

          if (newfield.type === 'object' || newfield.type === 'array') {
            newfield.properties = {}
            newfield.parentindex = this.editSchemaIndex
            newfield.fieldname = this.newfield.name
            this.schemalist.push(newfield)
          }
          schema.properties[this.newfield.name].index = this.schemalist.length - 1
          this.$set(this.schemalist, this.editSchemaIndex, schema)
        }


      }

      this.closeCreateDialog()

    },
    entertag(value) {
      if (value.type === 'object' || value.type === 'array') {
        let index = value.index
        this.schemalist[index].hover = true
        this.$set(this.schemalist, index, this.schemalist[index])
      }
    },
    leavetag(value) {
      if (value.type === 'object' || value.type === 'array') {
        let index = value.index
        this.schemalist[index].hover = false
        this.$set(this.schemalist, index, this.schemalist[index])
      }
    },
    enterField(schema) {
      if (schema.parentindex >= 0) {
        let index = schema.parentindex
        let fieldname = schema.fieldname
        this.schemalist[index].properties[fieldname].hover = true
        this.$set(this.schemalist, index, this.schemalist[index])

      }
    },
    leaveField(schema) {
      if (schema.parentindex >= 0) {
        let index = schema.parentindex
        let fieldname = schema.fieldname
        this.schemalist[index].properties[fieldname].hover = false
        this.$set(this.schemalist, index, this.schemalist[index])

      }
    },
    deleteField(index, name) {
      let schema = this.schemalist[index]
      let field = schema.properties[name]
      if (field.type === 'object' || field.type === 'array') {
        let index = field.index
        this.schemalist[index].delete = true
        Object.keys(this.schemalist[index].properties).forEach(key => {
          let prop = this.schemalist[index].properties[key]
          if (prop.type === 'object' || prop.type === 'array') {
            this.deleteField(index, key)
          }
        })
        this.$set(this.schemalist, index, this.schemalist[index])
      }
      delete schema.properties[name]
      this.$set(this.schemalist, index, schema)

    },
    schemaToText(index) {
      let schema = this.schemalist[index]
      let newschema = {
        type: schema.type,
        required: schema.required
      }
      newschema.label = schema.label

      let properties = schema.properties
      if (properties) {
        newschema.properties = {}
        Object.keys(properties).forEach(key => {
          let newproperty = {
            type: properties[key].type,
            label: properties[key].label,
            required: properties[key].required,
          }
          if (properties[key].type === "enumeration") {
            newproperty.enum = properties[key].enum.map(item => { return { label: item.label, value: item.value } })
          }
          if (properties[key].type === "array" || properties[key].type === "object") {
            newproperty.properties = this.schemaToText(properties[key].index).properties
          }

          newschema.properties[key] = newproperty

        })



      }

      return newschema

    }

  },
};
</script>

<style scoped>
.piechar {
  padding: 30px 20px;
}

.title {
  padding-bottom: 20px;
  text-align: center;
}
</style>
