<template>
  <div>
    <CCard>
      <CCardHeader>
        <CRow>
          <CCol sm="10">
            <CIcon name="cil-justify-center" /> <strong>媒体库</strong>
            <div style="height: 20px;"></div>
          </CCol>
          <CCol sm="2">
            <el-button @click="showScanUnusedImageDialog()" type="primary" v-if="canScan">
              扫描本文件夹下未使用文件
            </el-button>
          </CCol>
        </CRow>
      </CCardHeader>
    </CCard>

    <CCard>
      <CCardHeader>
        <CRow>
          <CCol sm="10">
            <ol class="breadcrumb border-0 mb-0">
              <li role="presentation" class="breadcrumb-item"><a href="javascript:void(0)" @click="goToFolder()"
                  class="router-link-active" target="_self"> 根目录
                </a>
              </li>
              <li v-for="folder in foler_stacks" role="presentation" class="active breadcrumb-item"
                v-bind:key="folder.id">
                <a class="router-link-active" href="javascript:void(0)" @click="goToFolder(folder)" target="_self"> {{
                  folder.name }} </a>
              </li>
            </ol>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody>

        <div class="files">
          <div class="dir item" v-for="folder in curFolders" v-bind:key="folder.id" @click="goToFolder(folder)">
            <img width="92" height="72"
              src="https://img.alicdn.com/imgextra/i1/O1CN01rGJZac1Zn37NL70IT_!!6000000003238-2-tps-230-180.png">
            <div class="itemname">
              {{ folder.name }}
            </div>
          </div>
        </div>

      </CCardBody>
    </CCard>

    <CCard>
      <CCardHeader>
        <CRow>
          <CCol sm="10">
            <strong>文件</strong>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody>

        <div class="files">
          <div class="file item"></div>
          <div class="file item"></div>
          <div class="file item"></div>
          <div class="file item"></div>
          <div class="file item"></div>
          <div class="file item"></div>
          <div class="file item"></div>
        </div>

      </CCardBody>
    </CCard>

    <el-dialog :title="scanmode === 'scan' ? '扫描本文件夹下未使用文件' : '删除未使用文件'" :visible.sync="showScanUnusedImagesDialog"
      :close-on-click-modal="false" :show-close="false">
      <div v-if="scanmode === 'scan'">
        <div style="text-align: center;">
          <p>功能说明: 通过扫描本目录下的文件(不支持递归搜索)，找出其中未被使用的文件。然后可以手动批量删除这些文件来释放服务器上这些图片所占用的空间</p>
          <el-alert title="重要提醒" type="error"
            description="对于富文本字段引用的图片，无法分析依赖关系，会被误删。
                                                                                        通过本平台编辑富文本上传的图片会被放到strapiadmin/editor目录下，这个目录将会被禁止使用此功能。"
            show-icon>
          </el-alert>
        </div>
        <div style="text-align: center;padding:40px 20px">
          <div>
            <el-progress type="circle" :percentage="percentage"
              :status="percentage === 100 ? 'success' : undefined"></el-progress>
          </div>
          <div style="padding-top: 20px;">
            一共有{{ total_file_num }}个文件，{{ unused_file_num }}个未被使用文件,{{ unknown_used_file_num }}个未知是否被使用文件
          </div>
        </div>
      </div>
      <div v-if="scanmode === 'delete'">
        <el-table :data="unusedFilecurrentPage" :show-overflow-tooltip="true"
          @selection-change="handleUnusedFilesSelectionChanged">
          <el-table-column type="selection"></el-table-column>
          <el-table-column property="id" label="文件ID" width="80"></el-table-column>
          <el-table-column property="name" label="文件名"></el-table-column>
          <el-table-column property="mime" label="文件类型" width="100"></el-table-column>
          <el-table-column label="预览" width="120">
            <template slot-scope="scope">
              <img v-if="scope.row.mime.startsWith('image')" style="width:80px;height: 80px;"
                :src="getSmallestUrl(scope.row)">
            </template>
          </el-table-column>

        </el-table>
        <el-pagination background layout="prev, pager, next" :total="unused_files.length"
          :page-size="unused_files_pagesize" :current-page.sync="unused_files_page">
        </el-pagination>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelScan">取 消</el-button>
        <el-button type="primary" @click="startScan" v-if="scanmode === 'scan' && startScanBtn">开始扫描</el-button>
        <el-button type="danger" @click="readyToDelete"
          v-if="scanmode === 'scan' && percentage === 100">选取并清理文件</el-button>
        <el-button type="danger" @click="deleteSelectFiles" v-if="scanmode === 'delete'">清理选中文件</el-button>
      </span>

    </el-dialog>
  </div>
</template>

<script>

import { list_files, delete_by_id, list_files_with_related, folder_structure, get_folder_by_id } from "../../api/api";


export default {
  name: "MediaLibrary.",
  components: {},
  data() {
    return {
      showScanUnusedImagesDialog: false,
      percentage: 0,
      total_file_num: 0,
      unused_file_num: 0,
      unknown_used_file_num: 0,
      startScanBtn: true,
      unused_files: [],
      unused_files_page: 0,
      unused_files_pagesize: 6,
      unknown_used_files: [],
      unused_files_selections: [],
      scanmode: 'scan',
      permission: undefined,
      files: [],
      folders: [],
      curFolders: [],
      foler_stacks: [],
      file_page: 1,
      file_pagesize: 10,
      foler_page: 1,
      foler_pagesize: 10,
      path: "/",
    };
  },
  created() {
    this.init()
  },
  computed: {
    unusedFilecurrentPage() {
      return this.unused_files.slice((this.unused_files_page - 1) * this.unused_files_pagesize, this.unused_files_page * this.unused_files_pagesize)
    },
    canScan() {
      return this.curpath !== "/strapiadmin/editor" && this.permission && this.permission.read && this.permission.update
    },
    curpath() {
      return this.foler_stacks.reduce((old, item) => old + "/" + item.name, "")
    },
  },
  watch: {
  },
  methods: {
    init() {
      this.$store.commit('setNavs', [
        {
          active: true,
          name: "媒体库"
        }
      ])

      this.checkPermission(() => {
        this.loadFolders()
      }, () => {
        this.$alert('您无权访问此页面', '警告', {
          confirmButtonText: '确定'
        });
      })

    },
    loadFolders() {
      folder_structure(data => {
        this.folders = data.data
        this.goToFolder()
      })
    },
    goToFolder(folder) {

      if (folder) {
        for (let i = 0; i < this.foler_stacks.length; i++) {
          if (this.foler_stacks[i].id === folder.id) {
            this.foler_stacks = this.foler_stacks.slice(0, i + 1)
            get_folder_by_id(folder.id, data => {
              this.path = data.data.path
              this.curFolders = folder.children
            })
            return
          }
        }
        get_folder_by_id(folder.id, data => {
          this.path = data.data.path
          this.foler_stacks.push(folder)
          this.curFolders = folder.children
        })
      } else {
        // 回到跟目录了
        this.path = "/"
        this.curFolders = this.folders
        this.foler_stacks = []
      }

    },
    checkPermission(callback, nopermissioncallback) {
      callback = callback || function () { }
      nopermissioncallback = nopermissioncallback || function () { }

      let allpermission = this.$store.getters.getPermissions()
      if (allpermission) {
        if (!allpermission.upload || !allpermission.upload.read) {
          nopermissioncallback()
        } else {
          this.permission = allpermission.upload
          callback()
        }
      } else {
        setTimeout(() => {
          this.checkPermission(callback, nopermissioncallback)
        }, 100)
      }
    },
    showScanUnusedImageDialog() {
      this.showScanUnusedImagesDialog = true
    },
    cancelScan() {
      this.showScanUnusedImagesDialog = false
      this.percentage = 0
      this.total_file_num = 0
      this.unused_file_num = 0
      this.unused_files = []
      this.unknown_used_files = []
      this.startScanBtn = true
      this.scanmode = "scan"
      this.unused_files_page = 0
      this.unused_files_selections = []

    },
    getSmallestUrl(item) {
      if (item.formats) {
        let formats = item.formats
        return formats["thumbnail"] ? formats["thumbnail"].url : (
          formats["small"] ? formats["small"].url : (
            formats["medium"] ? formats["medium"].url : (
              formats["large"] ? formats["large"].url : item.url
            )
          )
        )
      }
    },
    readyToDelete() {
      this.scanmode = "delete"
    },
    handleUnusedFilesSelectionChanged(vals) {
      this.unused_files_selections = vals
    },
    deleteSelectFiles() {
      let deleteFile = (selections) => {
        if (selections.length > 0) {
          let selection = selections[0]
          let findindex = this.unused_files.findIndex(x => x.id === selection.id)
          if (findindex !== -1) {
            delete_by_id(selection.id, () => {
              selections.splice(0, 1)
              this.unused_files.splice(0, 1)
              this.$notify({
                title: '提示',
                message: `${selection.name}删除成功`
              });
              deleteFile(selections)
            }, () => {
              selections.splice(0, 1)
              deleteFile(selections)
              this.$notify.error({
                title: '错误',
                message: `${selection.name}删除失败`
              });
            })
          } else {
            selections.splice(0, 1)
            deleteFile(selections)
          }

        }
      }
      deleteFile(this.unused_files_selections)
    },
    startScan() {
      this.startScanBtn = false
      let noused = 0
      let unknown_used = 0
      let count = 0
      list_files_with_related(this.path, 1, 10, data => {
        let pagination = data.pagination
        let total = pagination.total
        this.createImageNoUseScanTask(this.path, undefined, 1, 10, total, (total, isused, result) => {

          if (isused === 'unused') {
            noused++
            this.unused_files.push(result)
          }
          if (isused === 'unknown') {
            unknown_used++
            this.unknown_used_files.push(result)
          }
          count++
          this.percentage = parseInt(count / total * 100)
          this.total_file_num = total
          this.unused_file_num = noused
          this.unknown_used_file_num = unknown_used
        }, () => {
          this.percentage = 100
        })
      })

    },
    createImageNoUseScanTask(parentpath, total, page, pageCount, endpage, progresscallback, finishedCallback, errCallback) {
      progresscallback = progresscallback || function () { }
      finishedCallback = finishedCallback || function () { }
      errCallback = errCallback || function () { }
      if (page <= endpage) {
        list_files_with_related(parentpath, page, pageCount, data => {
          let pagination = data.pagination
          let total = pagination.total
          let page = pagination.page
          let results = data.results
          if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
              let result = results[i]
              if (result.related && result.related.length > 0) {
                progresscallback(total, 'used', result)
              } else {
                progresscallback(total, 'unused', result)
              }
            }
            this.createImageNoUseScanTask(parentpath, total, page + 1, pageCount, endpage, progresscallback, finishedCallback, errCallback)
          }


        }, () => {
          if (pageCount === 1) {
            progresscallback(total, 'unknown', { id: page })
            errCallback(parentpath, page, pageCount, endpage)
          } else {
            // 出现错误了，当前页变成逐条扫描
            let newstartpage = (page - 1) * pageCount + 1
            let enewndpage = page * pageCount

            let returnMainTask = () => {
              //然后恢复到正常扫描
              this.createImageNoUseScanTask(parentpath, total, page + 1, pageCount, endpage, progresscallback)
            }
            let resumeChildTask = (pparentpath0, page0, pageCount0, endpage0) => {
              this.createImageNoUseScanTask(pparentpath0, total, page0 + 1, pageCount0, endpage0, progresscallback, returnMainTask, resumeChildTask)
            }
            this.createImageNoUseScanTask(parentpath, total, newstartpage, 1, enewndpage, progresscallback, returnMainTask, resumeChildTask)

          }
        })
      } else {
        finishedCallback()
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

.files {
  display: flex;
  flex-wrap: wrap;
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
  /* 显示两行 */
  text-overflow: ellipsis;
}

a {
  text-decoration: none;
  color: #409EFF;
}
</style>
