<template>
  <div class="wrapper">
    <CCard>
      <CCardHeader>
        <CRow>
          <CCol sm="8">
            <CIcon v-if="model_info" name="cil-justify-center" /><strong> {{ model_info.displayName }}</strong>
          </CCol>
          <CCol sm="4" style="text-align: right;" v-if="permission && permission.create">
            <el-button v-if="model_info" type="primary" @click="editContent('')">
              新增{{ model_info.displayName }}
            </el-button>
          </CCol>
        </CRow>



      </CCardHeader>
      <CCardBody>
        <ContentTable :fields="fields" :items="items" @deleteContent="deleteContent" @editContent="editContent"
          @bool_value_changed="bool_value_changed" :permission="permission"></ContentTable>
        <el-pagination background layout="prev, pager, next" :total="totalCount" :page-size="pageSize"
          @current-change="page => currentPage = page">
        </el-pagination>


        <br>
      </CCardBody>

    </CCard>

  </div>
</template>

<script>

import { get_content_configuration, get_content_list, delete_content_by_id, publish_content } from "../../api/api";
import ContentTable from "../components/ContentTable.vue"
import { format_timestamp,getAbsoluteUrl } from "../../utils/utils"

export default {
  name: "Content",
  components: {
    ContentTable
  },
  data() {
    return {
      fields: [],
      items: [],
      currentPage: 1,
      totalCount: 1,
      pageSize: 10,
      sort_by: undefined,
      sort_order: undefined,
      metadatas: undefined,
      model: "",
      model_info: {},
      contenttype: undefined,
      permission: undefined
    };
  },
  created() {
    
  },
  computed: {

  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(newVal) {
        let model = newVal.model
        if (model) {
          this.clear();
          this.model = model
          this.load_model_info()
        }
      }
    },
    currentPage(newval) {
      this.load_content_list(newval);
    },
    model_info: {
      immediate: true,
      handler(newval) {
        if (newval) {
          this.$store.commit('setNavs', [
            {
              active: true,
              name: "内容管理"
            },
            {
              active: true,
              name: newval.displayName + "列表"
            }
          ])
        }

      }
    },
  },
  methods: {
    clear() {
      this.fields = []
      this.items = []
      this.currentPage = 1
      this.totalCount = 1
      this.pageSize = 10
      this.sort_by = undefined
      this.sort_order = undefined
      this.metadatas = undefined
      this.model = ""
      this.model_info = {}
      this.contenttype = undefined
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
        this.contenttype = contenttype
        this.content_configuration()
      } else {
        setTimeout(() => {
          this.load_model_info()
        }, 1000)
      }
    },
    isValidDateTimeFormat(str) {
      const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
      return regex.test(str);
    },
    get_image_url(result) {
      if (result.formats["thumbnail"]) {
        return getAbsoluteUrl(result.formats["thumbnail"].url)
      }
      if (result.formats["small"]) {
        return getAbsoluteUrl(result.formats["small"].url)
      }
      return getAbsoluteUrl(result.url)
    },
    get_value(metadata, result) {

      if (result !== undefined && result != null) {
        if (typeof result === "string") {
          if (this.isValidDateTimeFormat(result)) {
            let time = Date.parse(result)
            return {
              type: "string",
              data: format_timestamp(time / 1000)
            }
          } else {
            return {
              type: "string",
              data: result
            }
          }

        }
        if (typeof result === "boolean") {
          return {
            type: "boolean",
            data: result,
            can_update: false,
          }

        }

        if (result.formats) {
          return {
            type: "image",
            data: this.get_image_url(result),
            url: result.url
          }
        }
        if (metadata.list.mainField) {
          return {
            type: "string",
            data: result[metadata.list.mainField]
          }
        }

        if (result.length) {
          let results = result.map(item => {
            return this.get_value(metadata, item)
          })
          return {
            type: "array",
            data: results
          }
        }
      }

      return {
        type: "string",
        data: result
      }
    },
    load_content_list(page) {

      get_content_list(this.model, this.sort_by,
        this.sort_order, page, this.page_size, data => {
          let results = data.results
          let items = []
          for (let i = 0; i < results.length; i++) {
            let item = {}
            for (let j = 0; j < this.fields.length; j++) {
              let field = this.fields[j].key
              let value = this.get_value(this.metadatas[field], results[i][field])
              item[field] = value

            }

            item['isPublish'] = {
              type: "boolean",
              can_update: this.permission.publish,
              data: results[i]["publishedAt"] !== null
            }

            items.push(item)
          }
          this.items = items
          let pagination = data.pagination
          this.currentPage = page
          this.totalCount = pagination.total
          this.pageSize = pagination.pageSize
        }
      )

    },
    content_configuration() {
      get_content_configuration(this.model, data => {
        let fields = []
        let metadatas = data.data.contentType.metadatas
        data.data.contentType.layouts.list.forEach(item => {
          fields.push({
            key: item,
            label: metadatas[item].edit.label ? metadatas[item].edit.label : item
          })
        })

        this.metadatas = metadatas
        this.fields = fields
        let setting = data.data.contentType.settings
        this.page_size = setting.pageSize

        this.sort_by = setting.defaultSortBy
        this.sort_order = setting.defaultSortOrder

        if (this.contenttype.options && this.contenttype.options.draftAndPublish) {
          fields.push({
            key: "isPublish",
            label: "发布状态"
          })
        }

        this.load_content_list(1);

      })
    },
    deleteContent(itemid) {
      let displayName = this.model_info.displayName
      this.$confirm(`您确定要删除ID为${itemid}的${displayName}吗?该操作不可撤销`).then(() => {
        delete_content_by_id(this.model, itemid, () => {
          // 重新加载此页
          this.load_content_list(this.currentPage);
          this.$notify({
            title: '成功',
            message: `删除ID为${itemid}的${displayName}成功`,
            type: 'success'
          });
        }, () => {
          this.$notify.error({
            title: "警告",
            message: `删除失败`,
          });
        })
      }).catch(() => {
        this.$notify({
          title: "通知",
          message: `您取消了删除`,
        });
      })
    },
    editContent(itemid) {
      this.$router.push({ path: `/contentEdit?model=${this.model}&itemid=${itemid}` });
    },
    bool_value_changed(data, attr, newvalue) {
      let displayName = this.model_info.displayName
      if (attr === "isPublish") {
        let findindex = this.items.findIndex(item => item === data)
        if (findindex !== -1) {
          let findid = this.items[findindex].id.data
          if (newvalue) {
            publish_content(this.model, findid, true, () => {
              this.$notify({
                title: '成功',
                message: `发布${displayName}成功`,
                type: 'success'
              });
            }, () => {
              this.$notify({
                title: "通知",
                message: `发布'${displayName}失败`,
              });
              this.items[findindex][attr].data = false
              this.$set(this.items, findindex, this.items[findindex])

            })
          } else {
            this.$confirm(`您确定要取消ID为${findid}的${displayName}的发布状态吗？取消发布后，用户将无法查看到此条数据。`).then(() => {
              publish_content(this.model, findid, false, () => {
                this.$notify({
                  title: '成功',
                  message: `取消发布${displayName}成功`,
                  type: 'success'
                });
              }, () => {
                this.$notify({
                  title: "通知",
                  message: `取消发布'${displayName}失败`,
                });
                this.items[findindex][attr].data = true
                this.$set(this.items, findindex, this.items[findindex])

              })
            }).catch(() => {
              this.items[findindex][attr].data = true
              this.$set(this.items, findindex, this.items[findindex])
            })
          }

        }
      }

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
