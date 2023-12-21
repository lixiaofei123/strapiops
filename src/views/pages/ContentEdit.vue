<template>
  <div class="wrapper">
    <CRow>
      <CCol sm="9">
        <CCard>
          <CCardHeader>

            <CRow>
              <CCol sm="8">
                <CIcon v-if="model_info" name="cil-justify-center" /><strong> {{ model_info.displayName }}</strong>
              </CCol>
              <CCol sm="4" style="text-align: right;" v-if="permission.create || permission.update">
                <CButton @click="saveModelData()" color="primary" class="mb-2">
                  保存
                </CButton>
              </CCol>
            </CRow>

          </CCardHeader>
          <CCardBody>
            <ContentForm v-if="ready" ref="form" :model="model" :init_model_value="init_model_value" :main_model="true"
              :model_attributes="model_attributes" :model_configuration="model_configuration">
            </ContentForm>
          </CCardBody>

        </CCard>
      </CCol>
      <CCol sm="3">
        <CCard>
          <CCardBody>
            <el-descriptions title="数据信息" direction="horizontal" :column="1" border v-if="init_model_value">
              <el-descriptions-item label="创建者" v-if="init_model_value.createdBy">{{ init_model_value.createdBy.firstname
              }}
                {{ init_model_value.createdBy.lastname }}</el-descriptions-item>
              <el-descriptions-item label="创建时间" v-if="init_model_value.createdAt">{{
                beautify_iso_time(init_model_value.createdAt)
              }}</el-descriptions-item>
              <el-descriptions-item label="上次更新者" v-if="init_model_value.updatedBy">{{
                init_model_value.updatedBy.firstname }}
                {{ init_model_value.updatedBy.lastname }}</el-descriptions-item>
              <el-descriptions-item label="上次更新时间" v-if="init_model_value.updatedAt">{{
                beautify_iso_time(init_model_value.updatedAt) }}</el-descriptions-item>
              <el-descriptions-item label="发布时间" v-if="init_model_value.publishedAt">{{
                beautify_iso_time(init_model_value.publishedAt) }}</el-descriptions-item>
            </el-descriptions>
          </CCardBody>
        </CCard>
        <CCard v-if="model_info">
          <CCardBody>
            <CButton  v-if="permission.read" @click="gotoList()" style="width:100%" color="primary" class="mb-2">
              返回{{ model_info.displayName }}列表
            </CButton>
            <CButton v-if="itemid && permission.create" @click="gotoNew()" style="width:100%" color="primary" class="mb-2">
              新建{{ model_info.displayName }}
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>


  </div>
</template>

<script>

import { get_content_configuration, save_model_data, get_content_by_id, update_content_by_id } from "../../api/api";
import ContentForm from "../components/ContentForm.vue"
import { beautify_iso_time } from "../../utils/utils"

export default {
  name: "Content",
  components: {
    ContentForm
  },
  data() {
    return {
      model: undefined,
      init_model_value: undefined,
      ready: false,
      model_info: undefined,
      model_configuration: undefined,
      model_attributes: undefined,
      itemid: undefined,
      permission: undefined
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
        }
      }
    },
  },
  methods: {
    clear() {
      this.ready = false
      this.model = undefined
      this.init_model_value = undefined
      this.model_configuration = undefined
      this.model_attribute = undefined
      this.model_info = undefined
    },
    load_model_info() {
      let contenttype = this.$store.getters.getModelContentTypeByUid(this.model)
      if (contenttype) {
        this.permission = this.$store.getters.getPermissionByUid(this.model)
        if (!this.permission || !this.permission.read) {
          this.$alert('您无权访问此页面', '警告', {
            confirmButtonText: '确定'
          });
          return
        }

        this.model_info = contenttype.info
        this.model_attributes = contenttype.attributes
        // 获取布局和元信息
        this.content_configuration(data => {
          this.model_configuration = data.data
          if (this.itemid) {
            get_content_by_id(this.model, this.itemid, data => {
              this.init_model_value = data
              this.ready = true
            })
          } else {
            this.ready = true
          }
        })


      } else {
        setTimeout(() => {
          this.load_model_info()
        }, 100)
      }

    },
    content_configuration(callback) {
      callback = callback || function () { }
      get_content_configuration(this.model, data => {

        callback(data)
      })
    },
    gotoList(){
      this.$router.push({ path: `/content?model=${this.model}` });
    },
    gotoNew(){
      this.$router.push({ path: `/contentEdit?model=${this.model}` });
    },
    beautify_iso_time(iostime) {
      return beautify_iso_time(iostime)
    },
    saveModelData() {
      this.$refs['form'].getModelData(data => {
        if (this.itemid) {
          update_content_by_id(this.model, this.itemid, data, () => {
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
          save_model_data(this.model, data, data => {
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
      }, () => {
        console.log("获取失败.......")
      })

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

/deep/ .ck-content {
  line-height: 20%;
}

/deep/ .ck-editor__editable_inline {
  min-height: 300px;
}
</style>
