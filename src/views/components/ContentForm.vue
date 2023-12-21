<template>
  <div class="wrapper">
    <el-form ref="form" label-width="140px" :rules="rules" :model="model_value" v-if="model_layouts">
      <el-row v-for="(layout, index) in model_layouts" v-bind:key="index">
        <el-col v-for="attr in layout" v-bind:key="attr.name" :span="attr.size * 2">
          <el-form-item v-if="model_attributes[attr.name] && metadatas[attr.name].edit.visible"
            :label="metadatas[attr.name].edit.label"
            :required="model_attributes[attr.name].required ? model_attributes[attr.name].required : false"
            :prop="attr.name">
            <el-input v-if="model_attributes[attr.name].type === 'string' || model_attributes[attr.name].type === 'text'"
              v-model="model_value[attr.name]" :placeholder="metadatas[attr.name].edit.placeholder"
              :type="model_attributes[attr.name].type === 'text' ? 'textarea' : 'text'"
              :minlength="model_attributes[attr.name].minLength ? model_attributes[attr.name].minLength : 0"
              :maxlength="model_attributes[attr.name].maxLength ? model_attributes[attr.name].maxLength : ''"
              :disabled="!metadatas[attr.name].edit.editable">

            </el-input>
            <el-date-picker
              v-if="model_attributes[attr.name].type === 'date' || model_attributes[attr.name].type === 'datetime'"
              v-model="model_value[attr.name]" :type="model_attributes[attr.name].type"
              :placeholder="metadatas[attr.name].edit.placeholder"
              :value-format="model_attributes[attr.name].type === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-ddTHH:mm:ss.000Z'"
              :disabled="!metadatas[attr.name].edit.editable">
            </el-date-picker>

            <el-select v-if="model_attributes[attr.name].type === 'enumeration'" v-model="model_value[attr.name]"
              :placeholder="metadatas[attr.name].edit.placeholder" :disabled="!metadatas[attr.name].edit.editable">
              <el-option v-for="item in model_attributes[attr.name].enum" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>

            <el-input-number
              v-if="model_attributes[attr.name].type === 'decimal' || model_attributes[attr.name].type === 'integer'"
              type="number" v-model="model_value[attr.name]"
              :precision="model_attributes[attr.name].type === 'decimal' ? 2 : 0" :max="model_attributes[attr.name].max"
              :min="model_attributes[attr.name].min" :placeholder="metadatas[attr.name].edit.placeholder"
              :disabled="!metadatas[attr.name].edit.editable">

            </el-input-number>
            <el-switch v-if="model_attributes[attr.name].type === 'boolean'" v-model="model_value[attr.name]"
              active-color="#13ce66" inactive-color="#ff4949" :disabled="!metadatas[attr.name].edit.editable">
            </el-switch>

            <Uploader v-if="model_attributes[attr.name].type === 'media'" :attrbute="model_attributes[attr.name]"
              :attrbute_name="attr.name" :metadata="metadatas[attr.name].edit" @uploadsuccess="uploadImageSuccess"
              :init_images="model_value[attr.name]" @delete="deleteImage" :disabled="!metadatas[attr.name].edit.editable">
            </Uploader>

            <ckeditor class="ckeditor" v-if="model_attributes[attr.name].type === 'richtext'" :editor="editor"
              :disabled="!metadatas[attr.name].edit.editable" v-model="model_value[attr.name]" :config="editorConfig"
              style="height:300px"></ckeditor>

            <RalationSelect v-if="model_attributes[attr.name].type === 'relation'"
              :attributes="model_attributes[attr.name]" :attrbute_name="attr.name" :metadata="metadatas[attr.name].edit"
              :disabled="!metadatas[attr.name].edit.editable" :model="model" v-model="model_value[attr.name]"
              :content_id="content_id"></RalationSelect>

            <ContentForm v-if="model_attributes[attr.name].type === 'component'" :ref="attr.name" :main_model="false"
              :model="model_attributes[attr.name].component"
              :model_attributes="get_component_attr(model_attributes[attr.name].component)"
              :model_configuration="get_component_configuration(model_attributes[attr.name].component)"
              :init_model_value="model_value[attr.name]" />


            <span style="display: block;">{{ metadatas[attr.name].edit.description }}</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>

import Uploader from "./Uploader.vue"
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import UploadAdapter from './UploadAdapter';
import RalationSelect from '../components/RalationSelect';
import ContentForm from "./ContentForm.vue"

import { deepCopy } from "../../utils/utils";

export default {
  name: "ContentForm",
  components: {
    Uploader,
    RalationSelect,
    ContentForm
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
      rules: {},
      model_value: {},
      editor: ClassicEditor,
      metadatas: undefined,
      model_layouts: undefined,
      editorConfig: {
        toolbar: ['bold', 'italic', '|', 'link', 'uploadImage'],
        extraPlugins: [this.uploader]
      }
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
      let rules = {}
      Object.keys(model_attributes).forEach(k => {
        model_value[k] = model_attributes[k].default
        rules[k] = []
        if (model_attributes[k].required) {
          rules[k].push(
            { required: true, message: '请填写此字段', trigger: 'blur' }
          )
        }


        if (model_attributes[k].minLength || model_attributes[k].maxLength) {
          let rule = { trigger: 'blur', message: '' }

          if (model_attributes[k].minLength) {
            rule.min = model_attributes[k].minLength
            rule.message += `至少为${model_attributes[k].minLength}位  `
          }
          if (model_attributes[k].maxLength) {
            rule.max = model_attributes[k].maxLength
            rule.message += `最多为${model_attributes[k].maxLength}位`
          }
          rules[k].push(rule)
        }

        if (model_attributes[k].min || model_attributes[k].max) {
          let rule = { trigger: 'blur', message: '' }
          if (model_attributes[k].min) {
            rule.min = model_attributes[k].min
            rule.message += `最小为${model_attributes[k].min} `
          }
          if (model_attributes[k].max) {
            rule.max = model_attributes[k].max
            rule.message += `最大为${model_attributes[k].max}`
          }
          rule.type = "number"
          rules[k].push(rule)
        }

      })

      this.rules = rules
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
    uploadImageSuccess(attrname, image) {
      let attr_attr = this.model_attributes[attrname]
      if (attr_attr) {
        if (!attr_attr.multiple) {
          this.model_value[attrname] = image
        } else {
          if (!this.model_value[attrname]) {
            this.model_value[attrname] = []
          }
          this.model_value[attrname].push(image)
        }
      }
    },
    deleteImage(attrname, image) {
      let attr_attr = this.model_attributes[attrname]
      if (attr_attr) {
        if (!attr_attr.multiple) {
          this.model_value[attrname] = undefined
        } else {
          if (this.model_value[attrname]) {
            let index = this.model_value[attrname].findIndex(item => item.id === image.id)
            if (index !== -1) {
              this.model_value[attrname].splice(index, 1)
            }
          }

        }
      }
    },
    getModelData(resolve, reject) {
      resolve = resolve || function () { }
      reject = reject || function () { }

      let modeldata = this.model_value;
      let ref_keys = Object.keys(this.$refs)
      for (let i = 0; i < ref_keys.length; i++) {
        let key = ref_keys[i]
        if (key !== "form") {
          if (this.$refs[key].length > 0 && this.$refs[key][0].getModelData) {
            this.$refs[key][0].getModelData(data => {
              modeldata[key] = data
            }, reject)
          }
        }
      }

      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.main_model) {
            modeldata.updatedBy = this.user
            modeldata.updatedAt = new Date().toISOString()
            if (!modeldata.createdAt) {
              modeldata.createdAt = this.user
              modeldata.createdBy = new Date().toISOString()
            }
          }

          resolve(modeldata)
        } else {
          reject()
        }
      });
    },
    uploader(editor) {
      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new UploadAdapter(loader);
      };
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

/deep/ .ck-content {
  line-height: 20%;
}

/deep/ .ck-editor__editable_inline {
  min-height: 300px;
}
</style>
