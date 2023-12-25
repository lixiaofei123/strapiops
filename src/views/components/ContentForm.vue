<template>
  <div class="wrapper" :class="{ ischild: !main_model }" v-if="model_layouts">
    <div v-if="!main_model" style="margin-bottom: 20px;">
      {{ metadata.edit.label }}
    </div>
    <div v-for="(model_value, index) in model_values" v-bind:key="model_value.kid" :class="{ repeatable: repeatable }">
      <el-form ref="form" label-width="140px">
        <el-row v-for="(layout, index) in model_layouts" v-bind:key="index">
          <el-col v-for="attr in layout" v-bind:key="attr.name" :span="24" :xl="attr.size * 2">
            <InputField v-if="model_attributes[attr.name].type !== 'component'" :ref="attr.name"
              :attribute="model_attributes[attr.name]" :metadata="metadatas[attr.name]" v-model="model_value[attr.name]"
              :attrname="attr.name" :model="model" :contentId="getcontentid(model_value[attr.name])">
            </InputField>


            <ContentForm v-if="model_attributes[attr.name].type === 'component'" :ref="attr.name" :main_model="false"
              :model="model_attributes[attr.name].component"
              :model_attributes="get_component_attr(model_attributes[attr.name].component)"
              :model_configuration="get_component_configuration(model_attributes[attr.name].component)"
              :metadata="metadatas[attr.name]" :init_model_value="model_value[attr.name]"
              :repeatable="model_attributes[attr.name].repeatable" />
          </el-col>
        </el-row>

      </el-form>
      <el-button class="delbtn" type="danger" icon="el-icon-delete" circle  @click="deleteItem(index)" v-if="repeatable"></el-button>
    </div>
    <el-button @click="addNewItem()" type="primary" v-if="repeatable">
      添加{{ metadata.edit.label }}
    </el-button>
  </div>
</template>

<script>


import ContentForm from "./ContentForm.vue"
import InputField from "./field/InputField.vue"
import { deepCopy } from "../../utils/utils";
import { v4 as uuidv4 } from 'uuid';

export default {
  name: "ContentForm",
  components: {
    ContentForm,
    InputField
  },
  props: {
    model: String,
    init_model_value: [Object, Array],
    main_model: Boolean,
    model_attributes: Object,
    model_configuration: Object,
    repeatable: Boolean,
    metadata: Object
  },
  data() {
    return {
      fields: [],
      items: [],
      model_values: [],
      metadatas: undefined,
      model_layouts: undefined,
      default_model_value: {}
    };
  },
  created() {
    this.init_model_layout()
  },
  computed: {
    user() {
      return this.$store.state.user
    }
  },
  watch: {

  },
  methods: {
    init_model_layout() {
      let model_attributes = this.model_attributes
      Object.keys(model_attributes).forEach(k => {
        this.default_model_value[k] = model_attributes[k].default
      })

      this.model_values = []
      // 如果存在初始值，就更新初始值
      if (this.init_model_value !== undefined) {

        if (this.init_model_value instanceof Array) {
          for (let i = 0; i < this.init_model_value.length; i++) {
            let model_value = deepCopy(this.init_model_value[i]);
            model_value.kid = uuidv4()
            this.model_values.push(model_value)
          }
        } else {
          let init_model_value = deepCopy(this.init_model_value);
          init_model_value.kid = uuidv4()
          this.model_values.push(init_model_value)
        }
      } else {
        this.addNewItem()
      }

      this.metadatas = this.model_configuration.contentType.metadatas;
      this.model_layouts = this.model_configuration.contentType.layouts.edit

    },
    get_component_attr(component) {
      let contenttype = this.$store.getters.getComponentContentTypeByUid(component)
      return contenttype.attributes
    },
    get_component_configuration(component) {
      let configuration = this.model_configuration.components[component]
      return {
        components: this.model_configuration.components,
        contentType: {
          metadatas: configuration.metadatas,
          layouts: configuration.layouts
        }
      }
    },
    addNewItem() {
      let default_model_value = deepCopy(this.default_model_value);
      default_model_value.kid = uuidv4()
      this.model_values.push(default_model_value)
    },
    deleteItem(index){
      this.model_values.splice(index, 1)
    },
    getModelData(resolve, reject) {
      resolve = resolve || function () { }
      reject = reject || function () { }
      let modeldatas = this.model_values;
      let validate = true
      let ref_keys = Object.keys(this.$refs)

      for (let j = 0; j < modeldatas.length; j++) {
        for (let i = 0; i < ref_keys.length; i++) {
          let key = ref_keys[i]
          if (key !== "form") {
            let ref = this.$refs[key][j]
            if (ref) {
              if (ref.getModelData) {
                ref.getModelData(data => {
                  modeldatas[j][key] = data
                }, () => {
                  validate = false
                })
              }
              if (ref.validate) {
                if (!ref.validate()) {
                  validate = false
                }
              }
            }
          }
        }
      }



      if (!validate) {
        reject()
      } else {
        let modeldata = modeldatas
        if (!this.repeatable) {
          modeldata = modeldatas[0]
        }
        if (this.main_model) {
          modeldata.updatedBy = this.user
          modeldata.updatedAt = new Date().toISOString()
          if (!modeldata.createdAt) {
            modeldata.createdAt = this.user
            modeldata.createdBy = new Date().toISOString()
          }
        }
        resolve(modeldata)
      }
    },
    getcontentid(item) {
      if (item instanceof Object) {
        return item.id
      }
      return undefined
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

.ischild {
  border: 2px solid #dedede;
  padding: 20px;
  margin-bottom: 20px;
}

.repeatable {
  background-color: aliceblue;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
}

.delbtn{
  position: absolute;
  top: 20px;
  right: 20px;
}

/deep/ .ck-content * {
  line-height: 120%;
}

/deep/ .ck-editor__editable_inline {
  min-height: 300px;
}
</style>
