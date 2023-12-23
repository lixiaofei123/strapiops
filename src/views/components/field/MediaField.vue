<template>
  <div v-if="attribute && metadata">
    <div class="image-container">
      <div :style="{ width: (uploadList.length + 1) * 120 + 'px' }">
        <div class="uploadbox" @click="readyUploadFile" :style="{
          'background-color': !canupload ? '#484848' : '#fbfdff'
        }">
          <i class="el-icon-plus"></i>
          <input type="file" ref="upload_btn" class="sr-only" name="image" :accept="accept">
        </div>

        <div class="previewbox" v-for="item in reverseUploadList" v-bind:key="item.key">
          <el-image class="preview_image" :src="item.previewurl" fit="scale-down"
            :preview-src-list="item.type === 'image' ? [item.url] : []"></el-image>

          <div class="filename" v-if="item.type !== 'image'">{{ item.name }}</div>
          <el-progress class="upload_progress" :percentage="item.uploadprogress" :show-text="false"
            v-if="item.uploadprogress !== 101"></el-progress>
          <el-button class="delete_img_btn" type="danger" icon="el-icon-delete" circle v-if="item.uploadprogress === 101"
            size="mini" @click="removeFile(item.key)"> </el-button>
        </div>
      </div>

    </div>
    <el-dialog title="图片剪裁" :visible.sync="showImageCropDialog" :close-on-click-modal="false" :show-close="false">
      <div style="text-align: center;">
        <span>此图片要求尺寸比例为{{ width }}x{{ height }}</span>
        <div>
          <img class="src_image" ref="src_image" :src="src_image_url">
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelCrop()">取 消</el-button>
        <el-button type="primary" @click="cropFinished">确 定</el-button>
      </span>

    </el-dialog>
  </div>
</template>

<script>
import 'cropperjs/dist/cropper.css';
import { upload } from "../../../api/api";
import Cropper from 'cropperjs';

export default {
  name: "MediaField",
  props: ["value"],
  model: {
    prop: "value",
    event: "change"
  },
  props: {
    value: [Object, Array],
    attribute: Object,
    metadata: Object,
  },
  data() {
    return {
      limitsize: false,
      width: 0,
      height: 0,
      showImageCropDialog: false,
      src_image_url: undefined,
      cropper: undefined,
      filename: undefined,
      uploadding: false,
      uploadList: [],
      accept: "",
    };
  },
  mounted() {
    this.init()
    this.initExistedFiles()
    this.initUploader();
  },
  methods: {
    init() {
      let allowedTypes = this.attribute.allowedTypes
      let accept = ""
      for (let i = 0; i < allowedTypes.length; i++) {
        let allowedType = allowedTypes[i]
        if (allowedType == "images") {
          accept += "image/*"
        }
        if (allowedType == "videos") {
          accept += "video/*"
        }
        if (allowedType == "audios") {
          accept += "audio/*"
        }
        if (allowedType == "files") {
          accept = "*"
          break
        }

        if (i !== allowedTypes.length) {
          accept += ","
        }

      }
      this.accept = accept
    },
    checkIsAllowUploadFile(file) {
      let filetype = this.getFileType(file)
      let allowedTypes = this.attribute.allowedTypes
      for (let i = 0; i < allowedTypes.length; i++) {
        let allowedType = allowedTypes[i]
        if (allowedType == "files") {
          return true
        }
        if (allowedType.startsWith(filetype)) {
          return true
        }
      }
      return false

    },
    initUploader() {
      setTimeout(() => {
        let description = this.metadata.edit.description
        let limitsize = this.checkPattern(description)
        if (limitsize) {
          let arr = description.split("x")
          let width = parseInt(arr[0])
          let height = parseInt(arr[1])
          this.limitsize = true
          this.width = width
          this.height = height
        }

        this.$refs.upload_btn.addEventListener('change', e => {
          var files = e.target.files;
          console.log(files)
          let imageCropHandleFunc = (url, filename) => {

            if (this.limitsize) {
              this.filename = filename
              this.src_image_url = url
              this.showImageCropDialog = true
              setTimeout(() => {
                this.cropper = new Cropper(this.$refs.src_image, {
                  aspectRatio: this.width / this.height,
                  minCropBoxWidth: 200
                });
              }, 100)
            } else {
              // 直接上传
              if (files && files.length > 0) {
                let file = files[0]
                let filename = file.name
                this.uploadData(url, filename, file)
              }

            }
            this.$refs.upload_btn.value = ""

          };
          if (files && files.length > 0) {
            let file = files[0];
            if (this.checkIsAllowUploadFile(file)) {
              let filename = file.name
              let filetype = file.type
              if (filetype.startsWith("image")) {
                if (URL) {
                  imageCropHandleFunc(URL.createObjectURL(file), filename);
                } else if (FileReader) {
                  reader = new FileReader();
                  reader.onload = (e) => {
                    imageCropHandleFunc(reader.result, filename);
                  };
                  reader.readAsDataURL(file);
                }
              } else {
                // 其余类型，直接上传
                this.$refs.upload_btn.value = ""
                let filename = file.name
                this.uploadData(this.getPreviewUrl(this.getFileType(file)), filename, file)

              }
            } else {
              this.$refs.upload_btn.value = ""
              this.$notify.error({
                title: "警告",
                message: `不支持的文件类型`,
              });
            }
          }

        })
      }, 100)
    },
    getPreviewUrl(type, file) {
      if (type === "image") {
        if (file.formats) {
          if (file.formats.thumbnail) {
            return file.formats.thumbnail.url
          }
          if (file.formats.small) {
            return file.formats.small.url
          }
          if (file.formats.medium) {
            return file.formats.medium.url
          }
        }
        return file.url
      } else if (type === "video") {
        return "https://img.alicdn.com/imgextra/i2/O1CN01YgPBAp1zvunG71HdD_!!6000000006777-2-tps-140-140.png"
      } else if (type === "audio") {
        return "https://img.alicdn.com/imgextra/i2/O1CN01YgPBAp1zvunG71HdD_!!6000000006777-2-tps-140-140.png"
      } else if (type === "other") {
        return "https://img.alicdn.com/imgextra/i2/O1CN01YgPBAp1zvunG71HdD_!!6000000006777-2-tps-140-140.png"
      } else if (type === "doc") {
        return "https://img.alicdn.com/imgextra/i2/O1CN017vpxdQ27S9zPCPqMD_!!6000000007795-2-tps-140-140.png"
      }

    },
    initExistedFiles() {
      if (this.value) {
        if (this.value.length) {
          for (let i = 0; i < this.value.length; i++) {
            let file = this.value[i]
            this.uploadList.push(this.getPreviewItem(file))
          }
        } else {
          let file = this.value
          this.uploadList.push(this.getPreviewItem(file))
        }
      }

    },
    readyUploadFile() {
      if (this.canupload) {
        this.$refs.upload_btn.click()
      }
    },
    checkPattern(inputString) {
      const pattern = /^\d+x\d+$/;
      return pattern.test(inputString);
    },
    uploadData(url, filename, file) {
      this.uploadding = true
      let uploaditem = {
        key: new Date().getTime(),
        previewurl: url,
        uploadprogress: 0,
        name: filename,
        type: this.getFileType(file)
      }
      this.uploadList.push(uploaditem)
      let index = this.uploadList.length - 1


      let folder = this.$store.getters.getModelFolder()
      upload(folder, filename, file, progress => {
        uploaditem.uploadprogress = progress * 100
        this.$set(this.uploadList, index, uploaditem)
      }, data => {
        this.clearUpload()
        uploaditem.uploadprogress = 101
        uploaditem.data = data[0]
        uploaditem.url = data[0].url
        this.$set(this.uploadList, index, uploaditem)
      })
    },
    clearUpload() {
      this.src_image_url = undefined
      if (this.cropper) {
        this.cropper.destroy();
        this.cropper = undefined
      }
      this.filename = undefined
      this.uploadding = false
    },
    cancelCrop() {
      this.clearUpload()
      this.showImageCropDialog = false
    },
    cropFinished() {
      if (this.cropper) {
        let canvas = this.cropper.getCroppedCanvas()
        let url = canvas.toDataURL();
        canvas.toBlob(blob => {
          this.uploadData(url, this.filename, blob)
        })
      }
      this.showImageCropDialog = false
    },
    removeFile(key) {
      let findindex = this.uploadList.findIndex(item => item.key === key)
      if (findindex != -1) {
        this.uploadList.splice(findindex, 1)
      }
    },
    getFileType(file) {
      if (file && (file.mime || file.type)) {
        let mime = file.mime || file.type
        if (mime.startsWith("video")) {
          return "video"
        }
        if (mime.startsWith("audio")) {
          return "audio"
        }
        if (mime.startsWith("image")) {
          return "image"
        }
        if (mime.startsWith("application/vnd") || mime.startsWith("text")) {
          return "doc"
        }

      }
      return "other"

    },
    getPreviewItem(file) {
      if (file) {
        let previewItem = {
          key: file.id,
          type: this.getFileType(file),
          url: file.url,
          uploadprogress: 101,
          data: file,
          name: file.name
        }
        previewItem.previewurl = this.getPreviewUrl(previewItem.type, file)
        return previewItem
      }
      return {}
    },
    validate() {
      if (this.attribute.required && this.value === undefined || this.value.length === 0) {
        return "此项为必填"
      }
      return true
    }
  },
  computed: {
    canupload() {
      return this.metadata.edit.editable && !this.uploadding && ((this.uploadList.length > 0 && this.attribute.multiple) || (this.uploadList.length === 0))
    },
    reverseUploadList() {
      return this.uploadList.slice().reverse();
    },
    savedata() {
      return this.uploadList.map(item => item.data)
    },
  },
  watch: {
    savedata(newval) {
      this.$emit("change", newval);
    }
  }
};
</script>

<style scoped>
.image-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.image-container::-webkit-scrollbar {
  width: 100px;
  height: 7px
}

.image-container::-webkit-scrollbar-thumb {
  background: #409EFF;
  width: 7px;
  opacity: 0.4;
  border-radius: 7px;
  z-index: 99;
}


.previewbox {
  width: 100px;
  height: 100px;
  margin-right: 10px;
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  position: relative;
  display: inline-block;
}

.preview_image {
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  width: 100px;
  height: 100px;
  display: inline-block;
}

.upload_progress {
  width: 100px;
  position: absolute;
  bottom: 0px;
}

.filename {
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  line-height: 120%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  font-size: 12px;
}

.delete_img_btn {
  position: absolute;
  bottom: 0px;
  right: 5px;
}


.uploadbox {
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  width: 100px;
  height: 100px;
  cursor: pointer;
  line-height: 100px;
  vertical-align: top;
  display: inline-block;
  text-align: center;
  font-size: 30px;
  margin-right: 10px;

}

.src_image {
  width: 100%;
  max-width: 800px;
}
</style>