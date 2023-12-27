<template>
  <div class="wrapper">
    <el-row>
      <el-col :span="24" :xl="18" style="padding-right: 20px;">
        <el-card class="card">
          <div slot="header">
            <span v-if="model_info">{{ model_info.displayName }}</span>
            <el-button :disabled="!ready || saving" style="float: right;margin-left:20px" type="primary"
              @click="saveModelData()">保存</el-button>
            <el-button v-if="this.itemid && this.canPublish && !model_value.publishedAt" style="float: right" @click="publishContent(true)"
              type="primary">发布</el-button>
            <el-button v-if="this.itemid && this.canPublish && model_value.publishedAt" style="float: right" type="danger"
              @click="publishContent(false)">取消发布</el-button>
          </div>
          <div style="min-height: 300px;" v-loading="!ready || saving">
            <ContentForm v-if="ready" ref="form" :model="model" v-model="model_value" :main_model="true"
              :model_attributes="model_attributes" :model_configuration="model_configuration">
            </ContentForm>
          </div>

        </el-card>
      </el-col>
      <el-col :span="24" :xl="5" style="padding-right: 20px;">
        <el-card v-if="model_value">
          <el-descriptions title="数据信息" direction="horizontal" :column="1" border>
            <el-descriptions-item label="创建者" v-if="model_value.createdBy">{{ model_value.createdBy.firstname
            }}
              {{ model_value.createdBy.lastname }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" v-if="model_value.createdAt">{{
              beautify_iso_time(model_value.createdAt)
            }}</el-descriptions-item>
            <el-descriptions-item label="上次更新者" v-if="model_value.updatedBy">{{
              model_value.updatedBy.firstname }}
              {{ model_value.updatedBy.lastname }}</el-descriptions-item>
            <el-descriptions-item label="上次更新时间" v-if="model_value.updatedAt">{{
              beautify_iso_time(model_value.updatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="发布时间" v-if="model_value.publishedAt">{{
              beautify_iso_time(model_value.publishedAt) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <div style="height: 20px;"></div>
        <el-card v-if="model_info && kind !== 'singleType'">
          <el-button v-if="permission.read" @click="confirmContentSave(gotoList)" style="width:100%">
            返回{{ model_info.displayName }}列表
          </el-button>
          <div style="height: 20px;"></div>
          <el-button v-if="itemid && permission.create" @click="confirmContentSave(gotoNew)" style="width:100%"
            type="primary">
            新建{{ model_info.displayName }}
          </el-button>
        </el-card>
      </el-col>
    </el-row>


  </div>
</template>

<script>

import { get_content_configuration, save_model_data, get_content_by_id, update_content_by_id, publish_content } from "../../api/api";
import ContentForm from "../components/ContentForm.vue"
import { beautify_iso_time, deepCopy } from "../../utils/utils"

export default {
  name: "Content",
  components: {
    ContentForm
  },
  data() {
    return {
      model: undefined,
      model_value: undefined,
      init_model_value: undefined,
      ready: false,
      saving: false,
      model_info: undefined,
      model_configuration: undefined,
      model_attributes: undefined,
      itemid: undefined,
      permission: undefined,
      kind: undefined,
      canPublish: false
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
    model_info: {
      immediate: true,
      handler(newval) {
        if (newval) {
          if (this.kind === 'singleType') {
            this.$store.commit('setNavs', [
              {
                active: true,
                name: "内容管理"
              },

              {
                active: true,
                name: "编辑"
              }
            ])
          } else {
            this.$store.commit('setNavs', [
              {
                active: true,
                name: "内容管理"
              },
              {
                to: `#/content?model=${this.model}`,
                name: newval.displayName + "列表"
              },

              {
                active: true,
                name: "编辑"
              }
            ])
          }

        }
      }
    }
  },
  methods: {
    clear() {
      this.ready = false
      this.model = undefined
      this.model_value = undefined
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
        this.kind = contenttype.kind
        if(contenttype.options){
          this.canPublish = contenttype.options.draftAndPublish
        }
        // 获取布局和元信息
        this.content_configuration(data => {
          this.model_configuration = data.data
          if (this.itemid || contenttype.kind === 'singleType') {
            get_content_by_id(this.model, this.itemid, data => {
              this.itemid = data.id
              this.model_value = data
              this.ready = true
              this.init_model_value = JSON.stringify(data)
            }, () => {
              // 加载不到数据，就变成新增模式
              this.itemid = undefined
              this.init_model_value = ""
              this.ready = true
            })
          } else {
            this.init_model_value = ""
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
    gotoList() {
      this.$router.push({ path: `/content?model=${this.model}` });
    },
    gotoNew() {
      this.$router.push({ path: `/contentEdit?model=${this.model}` });
    },
    confirmContentSave(callback) {
      callback = callback || function () { }
      if (this.model_value) {
        let model_value = JSON.stringify(this.model_value)
        if (model_value === this.init_model_value) {
          callback()
        } else {
          this.$confirm(`是否放弃当前修改?`).then(() => {
            callback()
          }, () => { })
        }
      } else {
        callback()
      }
    },
    beautify_iso_time(iostime) {
      return beautify_iso_time(iostime)
    },
    saveModelData() {
      this.saving = true
      this.saveModelData0(() => {
        this.init_model_value = JSON.stringify(this.model_value)
        this.saving = false
      }, () => {
        this.saving = false
      })
    },
    saveModelData0(resolve, reject) {
      resolve = resolve || function () { }
      reject = reject || function () { }
      this.$refs['form'].validate(() => {
        if (this.itemid) {
          let modeldata = deepCopy(this.model_value)
          modeldata.createdAt = this.user
          modeldata.createdBy = new Date().toISOString()
          update_content_by_id(this.model, this.itemid, modeldata, () => {
            resolve()
            this.$notify({
              title: '成功',
              message: `数据更新成功`,
              type: 'success'
            });
          }, () => {
            reject()
            this.$notify.error({
              title: "警告",
              message: `数据保存失败`,
            });
          })
        } else {
          let modeldata = deepCopy(this.model_value)
          modeldata.updatedBy = this.user
          modeldata.updatedAt = new Date().toISOString()
          save_model_data(this.model, modeldata, data => {
            resolve()
            this.$notify({
              title: '成功',
              message: `数据保存成功`,
              type: 'success'
            });

            // console.log(data)
            this.$router.push({ path: `/contentEdit?model=${this.model}&itemid=${data.id}` });
          }, () => {
            reject()
            this.$notify.error({
              title: "警告",
              message: `数据保存失败`,
            });
          })
        }
      }, () => {
        reject()
        this.$notify.error({
          title: "警告",
          message: `表单校验失败`,
        });
      })

    },
    publishContent(publish) {
      if (this.itemid) {
        publish_content(this.model, this.itemid, publish, () => {
          this.$notify({
            title: '成功',
            message: `${publish ? '发布' : '取消发布'}成功`,
            type: 'success'
          });
          this.model_value.publishedAt = publish ? new Date().toISOString() : null
        }, () => {
          this.$notify({
            title: "通知",
            message: `${publish ? '发布' : '取消发布'}失败`,
          });

        })
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

/deep/ .ck-content {
  line-height: 20%;
}

/deep/ .ck-editor__editable_inline {
  min-height: 300px;
}
</style>
