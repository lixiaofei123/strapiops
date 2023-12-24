<template>
  <div>
    <el-row>
      <el-col :span="24" :xl="16" style="padding-right: 20px;">
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
                  v-for="(value, name) in schema.properties" closable @close="deleteField(index, name)"
                  @mouseover.native="entertag(value)" @mouseleave.native="leavetag(value)">{{ name }}[{{
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
        <el-card>
          <div slot="header">
            JSON结果预览
          </div>
          <div style="margin-top: 20px;" v-if="schema">
            {{ datatext }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="24" :xl="8" style="padding-right: 20px;">
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
          <el-input v-model="newfield.name"></el-input>
          <span>数据库存储的名称(建议用英文)</span>
        </el-form-item>
        <el-form-item label="显示名称" required v-if="schemalist.length > 0">
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
import ArrayField from "../components/field/json/ObjectField"

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
      schemalist: [{
        "id": "f1abab84-337d-48cb-acf0-84258c5b498f",
        "label": "根",
        "required": false,
        "type": "object",
        "properties": {
          "name": {
            "id": "c99429a9-d377-48ee-8016-792a818f34da",
            "label": "姓名",
            "required": false,
            "type": "number",
            "index": 0
          },
          "age": {
            "id": "fd902550-7b69-4ba9-865d-5eec222d9f76",
            "label": "年龄",
            "required": false,
            "type": "number",
            "index": 0
          },
          "xueli": {
            "id": "755efc16-da27-4711-83ad-de83f8bc932b",
            "label": "学历",
            "required": true,
            "type": "enumeration",
            "enum": [{
              "id": "d871860f-3d9e-4745-ba67-bf732b48e04b",
              "label": "小学",
              "value": "xiaoxue"
            }, {
              "id": "4d309e9d-5008-446e-a7bf-575d45fb46c5",
              "label": "初中",
              "value": "chuzhong"
            }, {
              "id": "6844c6ee-ce22-4695-8737-58cd4cc6509e",
              "label": "高中",
              "value": "gaozong"
            }, {
              "id": "95632b04-be93-4c8b-9e8b-29cae8f3464c",
              "label": "大学",
              "value": "daxue"
            }, {
              "id": "6633e7ec-62d0-465d-92de-0f36128d79c1",
              "label": "研究生",
              "value": "yanjiusheng"
            }],
            "index": 0
          },
          "coledge": {
            "id": "ea942ffc-f606-4c07-849d-5e8ffa731240",
            "label": "大学",
            "required": false,
            "type": "object",
            "index": 1,
            "hover": false
          },
          "workers": {
            "id": "acdb97d2-90c5-4835-a80a-aed59b03a9d4",
            "label": "工作经历",
            "required": false,
            "type": "array",
            "index": 2
          }
        }
      }, {
        "id": "ea942ffc-f606-4c07-849d-5e8ffa731240",
        "label": "大学",
        "required": false,
        "type": "object",
        "properties": {
          "name": {
            "id": "c46fadcf-81b7-471c-bc5c-e061dfabb333",
            "label": "名称",
            "required": false,
            "type": "string",
            "index": 2
          },
          "year": {
            "id": "f5f35571-563b-41b8-be74-6b2fe53182f7",
            "label": "毕业年份",
            "required": false,
            "type": "number",
            "index": 2
          },
          "isover": {
            "id": "760cfa85-76d8-4a7b-899b-d3186d842e34",
            "label": "是否毕业",
            "required": false,
            "type": "boolean",
            "index": 2
          },
          "teacher": {
            "id": "92fa4fc4-3f89-41a6-bbf8-9e585651360b",
            "label": "教师",
            "required": false,
            "type": "array",
            "index": 3
          }
        },
        "parentindex": 0,
        "fieldname": "coledge",
        "hover": false
      }, {
        "id": "acdb97d2-90c5-4835-a80a-aed59b03a9d4",
        "label": "工作经历",
        "required": false,
        "type": "array",
        "properties": {
          "name": {
            "id": "14fde0e5-8b2f-4351-a974-389eeece22fc",
            "label": "公司名称",
            "required": false,
            "type": "string",
            "index": 3
          },
          "address": {
            "id": "93eddcc8-a212-4287-9214-aa359a331aa1",
            "label": "地址",
            "required": false,
            "type": "string",
            "index": 3
          },
          "boss": {
            "id": "7e5f7eb5-ffb0-419d-a62f-ff4361369261",
            "label": "老板信息",
            "required": true,
            "type": "object",
            "index": 4,
            "hover": false
          }
        },
        "parentindex": 0,
        "fieldname": "workers",
        "hover": false
      }, {
        "id": "92fa4fc4-3f89-41a6-bbf8-9e585651360b",
        "label": "教师",
        "required": false,
        "type": "array",
        "properties": {
          "name": {
            "id": "6730c9dd-d539-48ac-9033-940a2839ed52",
            "label": "姓名",
            "required": false,
            "type": "string",
            "index": 3
          },
          "age": {
            "id": "4691192d-0b3e-4ffd-877e-e31a5ff7db40",
            "label": "年龄",
            "required": false,
            "type": "number",
            "index": 3
          },
          "zhuanye": {
            "id": "e2dd10ba-e74d-4bed-9f9d-292b32afab4f",
            "label": "教授专业",
            "required": true,
            "type": "enumeration",
            "enum": [{
              "id": "7a3ffc3e-3d42-4462-9d93-09ee993b792b",
              "label": "计算机",
              "value": "jisuanji"
            }, {
              "id": "5ddd4c26-1f1e-41fb-a524-fc1375800be9",
              "label": "体育",
              "value": "tiyu"
            }, {
              "id": "1f0dff50-f147-40ff-ba26-748b52d52d62",
              "label": "语言",
              "value": "yuyan"
            }],
            "index": 3
          }
        },
        "parentindex": 1,
        "fieldname": "teacher",
        "hover": false
      }, {
        "id": "7e5f7eb5-ffb0-419d-a62f-ff4361369261",
        "label": "老板信息",
        "required": true,
        "type": "object",
        "properties": {
          "name": {
            "id": "5f1292b3-c544-4f19-8338-4f780bc4bc53",
            "label": "姓名",
            "required": false,
            "type": "string",
            "index": 4
          },
          "age": {
            "id": "cfb548fd-fe5d-422b-a9e8-dcd21343afd6",
            "label": "年龄",
            "required": false,
            "type": "number",
            "index": 4
          }
        },
        "parentindex": 2,
        "fieldname": "boss",
        "hover": false
      }],
      newfield: {
        name: 'root',
        label: '根',
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
      return JSON.stringify(this.data)
    }
  },
  watch: {

  },
  methods: {
    clearDialog() {
      this.newfield = {
        name: this.schemalist.length === 0 ? 'root' : '',
        label: this.schemalist.length === 0 ? '根对象' : '',
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
        this.schemalist.push(newfield)
      } else {
        let schema = this.schemalist[this.editSchemaIndex]
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
      if (index !== 0) {
        newschema.label = schema.label
      }
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
