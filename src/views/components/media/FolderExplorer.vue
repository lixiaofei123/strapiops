<template>
  <div>
    <el-card>
      <div slot="header">
        <el-row>
          <el-col :span="24">
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
          </el-col>
        </el-row>
      </div>

      <div class="files" v-loading="loaddingFolder">
        <div class="dir item" v-for="folder in curFolders" v-bind:key="folder.id" @click="goToFolder(folder)">
          <img width="92" height="72"
            src="https://img.alicdn.com/imgextra/i1/O1CN01rGJZac1Zn37NL70IT_!!6000000003238-2-tps-230-180.png">
          <div class="itemname">
            {{ folder.name }}
          </div>
        </div>
      </div>
    </el-card>

  </div>
</template>
  
<script>

import { folder_structure, get_folder_by_id } from "../../../api/api";

export default {
  name: "FileExplorer",
  components: {

  },
  props: {
  },
  data() {
    return {
      folders: [],
      curFolders: [],
      loaddingFolder: false,
      foler_stacks: [],
      page: 1,
      pagesize: 50,
      path: "/"
    };
  },
  watch: {
    curpath(newvalue) {
      this.$emit('update:folder', newvalue)
    },
    path(newvalue) {
      this.$emit('update:path', newvalue)
    }
  },
  mounted() {
    this.init()
  },
  computed: {
    curpath() {
      return this.foler_stacks.reduce((old, item) => old + "/" + item.name, "")
    },
  },
  methods: {
    init() {
      this.loadFolders()
    },

    loadFolders() {
      folder_structure(data => {
        this.folders = data.data
        this.goToFolder()
      })
    },
    goToFolder(folder) {
      this.loaddingFolder = true
      if (folder) {
        for (let i = 0; i < this.foler_stacks.length; i++) {
          if (this.foler_stacks[i].id === folder.id) {
            this.foler_stacks = this.foler_stacks.slice(0, i + 1)
            get_folder_by_id(folder.id, data => {
              this.path = data.data.path
              this.curFolders = folder.children
              this.loaddingFolder = false
            })
            return
          }
        }
        get_folder_by_id(folder.id, data => {
          this.path = data.data.path
          this.foler_stacks.push(folder)
          this.curFolders = folder.children
          this.loaddingFolder = false
        })
      } else {
        // 回到根目录了
        this.path = "/"
        this.curFolders = this.folders
        this.foler_stacks = []
        this.loaddingFolder = false
      }

    },
  }
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

a {
  text-decoration: none;
  color: #409EFF;
}
</style>
  