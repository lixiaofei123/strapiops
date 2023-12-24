<template>
  <div>
    <el-card>
      <div slot="header">
        <span>媒体库</span>
        <FileScanner style="float: right" v-if="permission" :path="path" :folder="folder" :permission="permission">
        </FileScanner>

      </div>
    </el-card>
    <div style="height: 20px;"></div>
    <FolderExplorer :path.sync="path" :folder.sync="folder"></FolderExplorer>
    <div style="height: 20px;"></div>
    <FileExplorer :path="path"></FileExplorer>
  </div>
</template>

<script>



import FileExplorer from "../components/media/FileExplorer"
import FolderExplorer from "../components/media/FolderExplorer"
import FileScanner from "../components/media/FileScanner"

export default {
  name: "MediaLibrary.",
  components: {
    FileExplorer,
    FolderExplorer,
    FileScanner
  },
  data() {
    return {
      permission: undefined,
      path: "/",
      folder: ""
    };
  },
  created() {
    this.init()
  },
  computed: {

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
      }, () => {
        this.$alert('您无权访问此页面', '警告', {
          confirmButtonText: '确定'
        });
      })

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
  },
};
</script>

<style scoped></style>
