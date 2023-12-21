<template>
    <div>
        <div class="image-container" v-if="attrbute.allowedTypes.length === 1 && attrbute.allowedTypes[0] === 'images'">
            <div :style="{ width: (uploadList.length + 1) * 120 + 'px' }">
                <div class="uploadbox" @click="readyUploadFile" :style="{
                    'background-color': !canupload ? '#484848' : '#fbfdff'
                }">
                    <i class="el-icon-plus"></i>
                    <input type="file" ref="upload_btn" class="sr-only" name="image" accept="image/*">
                </div>

                <div class="previewbox" v-for="item in uploadList" v-bind:key="item.key">
                    <el-image class="preview_image" :src="item.previewurl" fit="scale-down"></el-image>
                    <el-progress class="upload_progress" :percentage="item.uploadprogress" :show-text="false"
                        v-if="item.uploadprogress !== 100"></el-progress>
                    <el-button class="delete_img_btn" type="danger" icon="el-icon-delete" circle
                        v-if="item.uploadprogress === 100" size="mini" @click="deleteImage(item.key)"> </el-button>
                </div>
            </div>

        </div>
        <div v-else>
            目前仅支持纯图片上传，不支持混合类型
        </div>
        <el-dialog title="图片剪裁" :visible.sync="showImageCropDialog" :close-on-click-modal="false">
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
import { upload } from "../../api/api";
import Cropper from 'cropperjs';

export default {
    name: "Uploader",
    props: {
        attrbute: Object,
        metadata: Object,
        attrbute_name: String,
        disabled: Boolean,
        init_images: [Object, Array]
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
            uploadList: []
        };
    },
    mounted() {

        this.init_preview_images()
        this.init_uploader();


    },
    methods: {
        init_uploader() {
            setTimeout(() => {
                let description = this.metadata.description
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
                    let done = (url, filename) => {
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
                    };
                    if (files && files.length > 0) {
                        let file = files[0];
                        let filename = file.name
                        if (URL) {
                            done(URL.createObjectURL(file), filename);
                        } else if (FileReader) {
                            reader = new FileReader();
                            reader.onload = (e) => {
                                done(reader.result, filename);
                            };
                            reader.readAsDataURL(file);
                        }
                    }

                })
            }, 100)
        },
        getPreviewUrl(image) {
            if (image.formats) {
                if (image.formats.thumbnail) {
                    return image.formats.thumbnail.url
                }
                if (image.formats.small) {
                    return image.formats.small.url
                }
                if (image.formats.medium) {
                    return image.formats.medium.url
                }
            }
            return image.url
        },
        init_preview_images() {
            if (this.init_images) {
                if (this.init_images.length) {
                    for (let i = 0; i < this.init_images.length; i++) {
                        let image = this.init_images[i]
                        this.uploadList.push({
                            key: image.id,
                            previewurl: this.getPreviewUrl(image),
                            uploadprogress: 100,
                            data: image
                        })
                    }
                } else {
                    let image = this.init_images
                    this.uploadList.push({
                        key: image.id,
                        previewurl: this.getPreviewUrl(image),
                        uploadprogress: 100,
                        data: image
                    })
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
                uploadprogress: 0

            }
            this.uploadList.push(uploaditem)
            let index = this.uploadList.length - 1
            upload(filename, file, progress => {
                uploaditem.uploadprogress = progress * 100
                this.$set(this.uploadList, index, uploaditem)
            }, data => {
                this.clearUpload()
                uploaditem.uploadprogress = 100
                uploaditem.data = data[0]
                this.$set(this.uploadList, index, uploaditem)
                this.$emit('uploadsuccess', this.attrbute_name, data[0])
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
        cancelCrop(){
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
        deleteImage(key) {
            let findindex = this.uploadList.findIndex(item => item.key === key)
            if (findindex != -1) {
                let delete_image = this.uploadList[findindex]
                this.uploadList.splice(findindex, 1)
                this.$emit('delete', this.attrbute_name, delete_image.data)
            }
        },
    },
    computed: {
        canupload() {
            return !this.disabled && !this.uploadding && ((this.uploadList.length > 0 && this.attrbute.multiple) || (this.uploadList.length === 0))
        },
    },
};
</script>
  
<style scoped>
.image-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
}

.image-container::-webkit-scrollbar{width:100px;height: 7px}
.image-container::-webkit-scrollbar-thumb{
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

.delete_img_btn {
    position: absolute;
    bottom: 5px;
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