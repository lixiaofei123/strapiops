<template>
  <div class="wrapper">
    <CRow>
      <CCol sm="9">
        <CCard>
          <CCardHeader>

            <CRow>
              <CCol sm="8">
                <CIcon name="cil-justify-center" /><strong> {{ model_info.displayName }}</strong>
              </CCol>
              <CCol sm="4" style="text-align: right;">

              </CCol>
            </CRow>

          </CCardHeader>
          <CCardBody>

            <el-form ref="form" label-width="140px" :rules="rules" :model="model_value" v-if="model_attributes">
              <el-row v-for="(layout, index) in model_layouts" v-bind:key="index">
                <el-col v-for="attr in layout" v-bind:key="attr.name" :span="attr.size * 2">
                  <el-form-item v-if="model_attributes[attr.name] && metadatas[attr.name].edit.visible"
                    :label="metadatas[attr.name].edit.label"
                    :required="model_attributes[attr.name].required ? model_attributes[attr.name].required : false"
                    :prop="attr.name">
                    <el-input
                      v-if="model_attributes[attr.name].type === 'string' || model_attributes[attr.name].type === 'text'"
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
                    <el-input-number
                      v-if="model_attributes[attr.name].type === 'decimal' || model_attributes[attr.name].type === 'integer'"
                      type="number" v-model="model_value[attr.name]"
                      :precision="model_attributes[attr.name].type === 'decimal' ? 2 : 0"
                      :max="model_attributes[attr.name].max" :min="model_attributes[attr.name].min"
                      :placeholder="metadatas[attr.name].edit.placeholder"
                      :disabled="!metadatas[attr.name].edit.editable">

                    </el-input-number>
                    <el-switch v-if="model_attributes[attr.name].type === 'boolean'" v-model="model_value[attr.name]"
                      active-color="#13ce66" inactive-color="#ff4949" :disabled="!metadatas[attr.name].edit.editable">
                    </el-switch>

                    <Uploader v-if="model_attributes[attr.name].type === 'media'" :attrbute="model_attributes[attr.name]"
                      :attrbute_name="attr.name" :metadata="metadatas[attr.name].edit" @uploadsuccess="uploadImageSuccess"
                      :init_images="model_value[attr.name]" @delete="deleteImage"
                      :disabled="!metadatas[attr.name].edit.editable"></Uploader>

                    <ckeditor class="ckeditor" v-if="model_attributes[attr.name].type === 'richtext'" :editor="editor"
                      :disabled="!metadatas[attr.name].edit.editable" v-model="model_value[attr.name]"
                      :config="editorConfig" style="height:300px"></ckeditor>

                    <RalationSelect v-if="model_attributes[attr.name].type === 'relation'" 
                      :attributes="model_attributes[attr.name]" 
                      :attrbute_name="attr.name"
                      :metadata="metadatas[attr.name].edit"
                      :disabled="!metadatas[attr.name].edit.editable" 
                      :model="model"
                      v-model="model_value[attr.name]"
                      :content_id="content_id"
                      ></RalationSelect>
                    <span style="display: block;">{{ metadatas[attr.name].edit.description }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-button type="primary" @click="saveModelData">保存</el-button>
              </el-row>
            </el-form>
          </CCardBody>

        </CCard>
      </CCol>
      <CCol sm="3">
        <CCard>
          <CCardBody>
            <el-descriptions title="数据信息" direction="horizontal" :column="1" border>
              <el-descriptions-item label="创建者" v-if="model_value.createdBy">{{ model_value.createdBy.firstname }}
                {{ model_value.createdBy.lastname }}</el-descriptions-item>
              <el-descriptions-item label="创建时间" v-if="model_value.createdAt">{{ beautify_iso_time(model_value.createdAt)
              }}</el-descriptions-item>
              <el-descriptions-item label="上次更新者" v-if="model_value.updatedBy">{{ model_value.updatedBy.firstname }}
                {{ model_value.updatedBy.lastname }}</el-descriptions-item>
              <el-descriptions-item label="上次更新时间" v-if="model_value.updatedAt">{{
                beautify_iso_time(model_value.updatedAt) }}</el-descriptions-item>
              <el-descriptions-item label="发布时间" v-if="model_value.publishedAt">{{
                beautify_iso_time(model_value.publishedAt) }}</el-descriptions-item>
            </el-descriptions>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>


  </div>
</template>

<script>

import { get_content_configuration, save_model_data, get_content_by_id, update_content_by_id } from "../../api/api";
import Uploader from "../components/Uploader.vue"
import { beautify_iso_time } from "../../utils/utils"
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import UploadAdapter from '../components/UploadAdapter';
import RalationSelect from '../components/RalationSelect';

export default {
  name: "Content",
  components: {
    Uploader,
    RalationSelect
  },
  data() {
    return {
      fields: [],
      items: [],
      metadatas: {},
      model: "",
      model_info: {},
      model_attributes: {},
      model_layouts: [],
      model_value: {
       
      },
      content_id: -1,
      rules: {},
      editor: ClassicEditor,
      editorConfig: {
        toolbar: ['bold', 'italic', '|', 'link', 'uploadImage'],
        extraPlugins: [this.uploader]
      }
    };
  },
  created() {
  },
  computed: {
    user() {
      return this.$store.state.user
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(newVal) {
        this.clear()
        let model = newVal.model
        this.itemid = newVal.itemid
        if (model) {
          this.model = model
          this.load_model_info()
          this.content_configuration()
        }
      }
    },
  },
  methods: {
    clear() {
      this.fields = [];
      this.items = [];
      this.metadatas = {};
      this.model = "";
      this.model_info = {};
      this.model_attributes = {};
      this.model_layouts = [];
      this.model_value = {
      };
      this.rules = {};
    },
    load_model_info() {
      let contenttype = this.$store.getters.getContentTypeByUid(this.model)
      if (contenttype) {
        this.model_info = contenttype.info
        let model_attributes = contenttype.attributes
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
        if (this.itemid) {
          get_content_by_id(this.model, this.itemid, data => {
            this.model_value = data
            this.content_id = data.id
            this.model_attributes = model_attributes
          })
        } else {
          this.model_attributes = model_attributes
        }

      } else {
        setTimeout(() => {
          this.load_model_info()
        }, 1000)
      }
    },
    content_configuration() {
      get_content_configuration(this.model, data => {
        let metadatas = data.data.contentType.metadatas
        this.metadatas = metadatas
        let model_layouts = data.data.contentType.layouts.edit
        this.model_layouts = model_layouts
      })
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
      console.log("删除了一个图片", attrname, image)
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
    saveModelData() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let modeldata = this.model_value;
          modeldata.updatedBy = this.user
          modeldata.updatedAt = new Date().toISOString()
          if (!modeldata.createdAt) {
            modeldata.createdAt = this.user
            modeldata.createdBy = new Date().toISOString()
          }

          if (this.itemid) {
            update_content_by_id(this.model, this.itemid, modeldata, data => {
              this.$notify({
                title: '成功',
                message: `数据更新成功`,
                type: 'success'
              });
            }, () => {
              this.$notify.error({
                title: "警告",
                message: `数据保存失败`,
              });
            })
          } else {
            save_model_data(this.model, modeldata, data => {
              this.$notify({
                title: '成功',
                message: `数据保存成功`,
                type: 'success'
              });

              // console.log(data)
              this.$router.push({ path: `/contentEdit?model=${this.model}&itemid=${data.id}` });
            }, () => {
              this.$notify.error({
                title: "警告",
                message: `数据保存失败`,
              });
            })
          }

        } else {
          return false;
        }
      });



    },
    uploader(editor) {
      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new UploadAdapter(loader);
      };
    },
    beautify_iso_time(iostime) {
      return beautify_iso_time(iostime)
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
