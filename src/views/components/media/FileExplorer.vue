<template>
  <div>
    <el-card>
      <div slot="header" class="clearfix">
        <span>文件</span>
      </div>
      <div>
        <div class="files" v-loading="loaddingFiles">
          <div class="file item" v-for="file in files" v-bind:key="file.id">
            <el-image fit="contain" style="width: 92px; height: 72px" :src="getThumbnailUrl(file)" :preview-src-list="[file.url]">
            </el-image>

            <div class="itemname">
              {{ file.name }}
            </div>
          </div>
        </div>
        <div style="height: 50px;"></div>
        <el-pagination background layout="prev, pager, next" :total="total" :page-size="pagesize"
          :current-page.sync="page">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>
  
<script>

import { list_files } from "../../../api/api"
import {getThumbnailUrl} from "../../../utils/utils"

export default {
  name: "FileExplorer",
  components: {

  },
  props: {
    path: String
  },
  data() {
    return {
      page: 1,
      pagesize: 50,
      total: 0,
      loaddingFiles: false,
      files: [],
    };
  },
  watch: {
    path: {
      immediate: true,
      handler(newval) {
        this.loadFilesByPath(newval, 1)
      }
    },
    page(newval) {
      this.loadFilesByPath(this.path, newval)
    }
  },
  mounted() {


  },
  methods: {
    getThumbnailUrl(file){
      return getThumbnailUrl(file)
    },
    loadFilesByPath(newval, page) {
      this.page = page
      this.loaddingFiles = true
      list_files(newval, page, this.pagesize, data => {
        let pagination = data.pagination
        this.total = pagination.total
        this.files = data.results
        this.loaddingFiles = false
      }, () => {
        this.loaddingFiles = false
      })
    }
  },
};
</script>
  
<style scoped>
.files {
  display: flex;
  flex-wrap: wrap;
  min-height: 100px;
}

.files .item {
  width: 100px;
  height: 120px;
  margin: 10px;
  text-align: center;
  cursor: pointer;
}

.files .item .itemname {
  margin-top: 10px;
  max-height: 40px;
  font-size: 14px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
}
</style>
  