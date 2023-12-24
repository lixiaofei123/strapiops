<template>
  <div class="wrapper">
    <el-form ref="form" label-width="140px" :model="model_value" v-if="model_layouts">
      <el-row v-for="(layout, index) in model_layouts" v-bind:key="index">
        <el-col v-for="attr in layout" v-bind:key="attr.name" :span="24" :xl="attr.size * 2">
          <!-- <el-form-item v-if="model_attributes[attr.name] && metadatas[attr.name].edit.visible"
            :label="metadatas[attr.name].edit.label"
            :required="model_attributes[attr.name].required ? model_attributes[attr.name].required : false"
            :prop="attr.name"> -->

          <InputField v-if="model_attributes[attr.name].type !== 'component'" :ref="attr.name"
            :attribute="model_attributes[attr.name]" :metadata="metadatas[attr.name]" v-model="model_value[attr.name]">
          </InputField>


          <ContentForm v-if="model_attributes[attr.name].type === 'component'" :ref="attr.name" :main_model="false"
            :model="model_attributes[attr.name].component"
            :model_attributes="get_component_attr(model_attributes[attr.name].component)"
            :model_configuration="get_component_configuration(model_attributes[attr.name].component)"
            :init_model_value="model_value[attr.name]" />
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>


import RalationSelect from '../components/RalationSelect';
import ContentForm from "./ContentForm.vue"
import InputField from "./field/InputField.vue"
import { deepCopy } from "../../utils/utils";

export default {
  name: "ContentForm",
  components: {
    RalationSelect,
    ContentForm,
    InputField
  },
  props: {
    model: String,
    init_model_value: Object,
    main_model: Boolean,
    model_attributes: Object,
    model_configuration: Object,
  },
  data() {
    return {
      fields: [],
      items: [],
      content_id: undefined,
      model_value: {},
      metadatas: undefined,
      model_layouts: undefined,
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
      let model_value = {}
      Object.keys(model_attributes).forEach(k => {
        model_value[k] = model_attributes[k].default
      })

      this.model_value = model_value

      // 如果存在初始值，就更新初始值
      if (this.init_model_value !== undefined) {
        this.model_value = deepCopy(this.init_model_value)
        this.content_id = this.init_model_value.id
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
    getModelData(resolve, reject) {
      resolve = resolve || function () { }
      reject = reject || function () { }
      let modeldata = this.model_value;
      let validate = true
      let ref_keys = Object.keys(this.$refs)
      for (let i = 0; i < ref_keys.length; i++) {
        let key = ref_keys[i]
        if (key !== "form") {
          if (this.$refs[key].length > 0 && this.$refs[key][0].getModelData) {
            this.$refs[key][0].getModelData(data => {
              modeldata[key] = data
            }, () => {
              validate = false
            })
          }
          if (this.$refs[key].length > 0 && this.$refs[key][0].validate) {
            if (!this.$refs[key][0].validate()) {
              validate = false
            }
          }
        }
      }

      if (!validate) {
        reject()
      } else {
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

/deep/ .ck-content * {
  line-height: 120%;
}

/deep/ .ck-editor__editable_inline {
  min-height: 300px;
}
</style>
