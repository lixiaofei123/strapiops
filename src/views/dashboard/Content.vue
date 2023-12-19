<template>
  <div class="wrapper">
    <CCard>
      <CCardHeader>
        <CRow>
          <CCol sm="8">
            <CIcon name="cil-justify-center" /><strong> {{ model_info.displayName }}</strong>
          </CCol>
          <CCol sm="4" style="text-align: right;">
            <CButton v-if="model_info" size="sm" color="primary" @click="editContent('')">
              新增{{ model_info.displayName }}
            </CButton>
          </CCol>
        </CRow>



      </CCardHeader>
      <CCardBody>
        <ContentTable :fields="fields" :items="items" @deleteContent="deleteContent" @editContent="editContent"></ContentTable>
        <CPagination align="end" :active-page.sync="currentPage" :pages="page_count" />
        <br>
      </CCardBody>

    </CCard>

  </div>
</template>

<script>

import { get_content_configuration, get_content_list, delete_content_by_id } from "../../api/api";
import ContentTable from "../components/ContentTable.vue"
var moment = require('moment');

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
      page_count: 1,
      page_size: 10,
      sort_by: undefined,
      sort_order: undefined,
      metadatas: undefined,
      model: "",
      model_info: {}
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
          this.content_configuration()
        }
      }
    },
    currentPage(newval) {
      this.load_content_list(newval);
    }
  },
  methods: {
    clear(){
      this.fields = []
      this.items = []
      this.currentPage = 1
      this.page_count = 1
      this.page_size = 10
      this.sort_by = undefined
      this.sort_order = undefined
      this.metadatas = undefined
      this.model =  ""
      this.model_info=  {}
    },
    load_model_info() {
      let contenttype = this.$store.getters.getContentTypeByUid(this.model)
      if (contenttype) {
        this.model_info = contenttype.info
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
        return result.formats["thumbnail"].url
      }
      if (result.formats["small"]) {
        return result.formats["small"].url
      }
      return result.url
    },
    get_value(metadata, result) {

      if (result) {
        if (typeof result === "string") {
          if (this.isValidDateTimeFormat(result)) {
            let time = Date.parse(result)
            return {
              type: "string",
              data: moment.unix(time / 1000).format("YYYY年MM月DD日 HH时mm分")
            }
          } else {
            return {
              type: "string",
              data: result
            }
          }

        }
        if (result.formats) {
          return {
            type: "image",
            data: this.get_image_url(result)
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
          if (results.length > 0) {
            let items = []
            for (let i = 0; i < results.length; i++) {
              let item = {}
              for (let j = 0; j < this.fields.length; j++) {
                let field = this.fields[j].key
                let value = this.get_value(this.metadatas[field], results[i][field])
                item[field] = value

              }
              items.push(item)
            }
            this.items = items
          }

          let pagination = data.pagination
          this.currentPage = page
          this.page_count = pagination.pageCount
          this.page_size = pagination.pageSize
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

        this.load_content_list(1);

      })
    },
    deleteContent(itemid) {
      let displayName = this.model_info.displayName
      console.log(displayName)
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
    editContent(itemid){
      this.$router.push({ path: `/contentEdit?model=${this.model}&itemid=${itemid}` });
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
</style>
