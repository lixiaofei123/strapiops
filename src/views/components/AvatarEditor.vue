<template>
  <CModal title="编辑头像" :show="show" :no-close-on-backdrop="true">
    <div
      style="text-align:center"
      :style="{
        marginLeft: 'auto',
        marginRight: 'auto',
        width: containerWidth + 'px',
        height: containerHeight + 60 + 'px',
      }"
    >
      <div
        :style="{
          width: containerWidth + 'px',
          height: containerHeight + 'px',
        }"
      >
        <div
          class="avatar-crop-containter"
          :style="{
            width: containerWidth + 'px',
            height: containerHeight + 'px',
          }"
        >
          <div
            class="avatar-wrapper"
            :style="{
              width: containerWidth + 'px',
              height: containerHeight + 'px',
            }"
          >
            <div
              class="image-bg-wrapper"
              :style="{
                left: left + 'px',
                top: top + 'px',
                width: width * scale + 'px',
                height: height * scale + 'px',
              }"
            >
              <img
                :style="{
                  width: width * scale + 'px',
                  height: height * scale + 'px',
                  transform: 'none',
                }"
                :src="imageData"
              />
            </div>
          </div>
          <div
            class="avatar-drag-box avatar-move"
            @mousedown="dragStart = true"
            @mouseup="dragStart = false"
            @mouseleave="mouseLeave"
            @mousemove="drag"
            :style="{
              width: containerWidth + 'px',
              height: containerHeight + 'px',
            }"
          ></div>
          <div
            class="avatar-crop-box"
            :style="{
              width: avatarWidth + 'px',
              height: avatarHeight + 'px',
              left: avatar_crop_left + 'px',
              top: avatar_crop_top + 'px',
            }"
          >
            <span class="avatar-view-box">
              <img
                :style="{
                  width: width * scale + 'px',
                  height: height * scale + 'px',
                  marginLeft: left - avatar_crop_left + 'px',
                  marginTop: top - avatar_crop_top + 'px',
                  transform: 'none',
                }"
                :src="imageData"
              />
            </span>
            <span
              class="avatar-face avatar-move"
              @mousedown="dragStart = true"
              @mousemove="drag"
              @mouseup="dragStart = false"
            ></span>
          </div>
        </div>
      </div>
      <div style="height:15px"></div>
      <CButton color="primary" size="sm" @click="enlarge">
        <CIcon :content="$options.freeSet['cilZoomIn']" />&nbsp;放大 </CButton
      >&nbsp;&nbsp;
      <CButton color="primary" size="sm" @click="narrow">
        <CIcon :content="$options.freeSet['cilZoomOut']" />&nbsp;缩小
      </CButton>
    </div>
    <template #footer>
      <CButton @click="$emit('cancel')" color="info">取消</CButton>
      <CButton @click="avatar()" color="success">确认</CButton>
    </template>
  </CModal>
</template>

<script>
import { freeSet } from "@coreui/icons";
export default {
  name: "AvatarEditor",
  freeSet,
  props: {
    imageData: String,
    show: Boolean,
  },
  watch: {
    imageData(newval) {
      this.image = new Image();
      this.image.src = newval;
      this.image.onload = () => {
        this.init();
      };
    },
  },
  data() {
    return {
      image: null,
      dragStart: false,
      containerWidth: 308,
      containerHeight: 300,
      avatarWidth: 150,
      avatarHeight: 150,
      width: 470,
      height: 581,
      scale: 1,
      top: 0,
      left: 0,
      avatar_crop_left: 0,
      avatar_crop_top: 0,
      avatar_crop_right: 0,
      avatar_crop_bottom: 0,
    };
  },
  created() {},
  computed: {},
  methods: {
    avatar() {
      // 裁剪的区域是
      let left = (this.avatar_crop_left - this.left) / this.scale;
      let top = (this.avatar_crop_top - this.top) / this.scale;
      let width = this.avatarWidth / this.scale;
      let height = this.avatarHeight / this.scale;

      let canvas = document.createElement("canvas");
      canvas.width = this.avatarWidth
      canvas.height = this.avatarHeight
      let ctx = canvas.getContext("2d");
      ctx.drawImage(this.image, left, top, width, height,0,0,this.avatarWidth,this.avatarHeight);
      this.$emit("avatar", canvas.toDataURL());
    },
    init() {
      this.width = this.image.width;
      this.height = this.image.height;
      //第一步，先将图片缩放并移动到合适的位置
      // 将其长边缩放到300，另外一条边等比缩放
      let scaleX = this.containerWidth / this.width;
      let scaleY = this.containerHeight / this.height;
      this.scale = scaleX < scaleY ? scaleX : scaleY;
      this.left = (this.containerWidth - this.scale * this.width) / 2;
      this.top = (this.containerHeight - this.scale * this.height) / 2;
      this.avatar_crop_left = (this.containerWidth - this.avatarWidth) / 2;
      this.avatar_crop_top = (this.containerHeight - this.avatarHeight) / 2;
      this.avatar_crop_right = this.containerWidth - this.avatar_crop_left;
      this.avatar_crop_bottom = this.containerHeight - this.avatar_crop_top;
    },
    enlarge() {
      this.scaleAvatar(0.1);
    },
    narrow() {
      this.scaleAvatar(-0.1);
    },
    scaleAvatar(delta) {
      if (
        this.width * (this.scale + delta) <= this.avatarWidth ||
        this.height * (this.scale + delta) <= this.avatarHeight
      ) {
        delta = Math.max(
          this.avatarWidth / this.width - this.scale,
          this.avatarHeight / this.height - this.scale
        );
      }

      this.scale += delta;

      let a = this.avatar_crop_left - this.left;
      let b = this.avatar_crop_top - this.top;

      // 重新计算let和top的位置
      let newleft = this.avatar_crop_left - (a + (delta * this.width) / 2);
      let newtop = this.avatar_crop_top - (b + (delta * this.height) / 2);

      //不能超边界
      if (newleft >= this.avatar_crop_left) {
        this.left = this.avatar_crop_left;
      } else if (newleft + this.width * this.scale < this.avatar_crop_right) {
        this.left = this.avatar_crop_right - this.width * this.scale;
      } else {
        this.left = newleft;
      }

      if (newtop >= this.avatar_crop_top) {
        this.top = this.avatar_crop_top;
      } else if (newtop + this.height * this.scale < this.avatar_crop_bottom) {
        this.top = this.avatar_crop_top - this.top * this.scale;
      } else {
        this.top = newtop;
      }

      //
    },
    mouseLeave(event) {
      if (
        event.offsetX < 0 ||
        event.offsetX > this.containerWidth ||
        event.offsetY < 0 ||
        event.offsetY > this.containerHeight
      ) {
        this.dragStart = false;
      }
    },
    drag(event) {
      if (this.dragStart) {
        if (event.movementX < 0) {
          let moveBefore = this.left + this.width * this.scale;
          if (moveBefore > this.avatar_crop_right) {
            let moveAfter = moveBefore + event.movementX;
            if (moveAfter < this.avatar_crop_right) {
              this.left = this.avatar_crop_right - this.width * this.scale;
            } else {
              this.left += event.movementX;
            }
          }
        }
        if (event.movementX > 0) {
          if (this.left < this.avatar_crop_left) {
            if (this.left + event.movementX > this.avatar_crop_left) {
              this.left = this.avatar_crop_left;
            } else {
              this.left += event.movementX;
            }
          }
        }

        if (event.movementY < 0) {
          let moveBefore = this.top + this.height * this.scale;
          if (moveBefore > this.avatar_crop_bottom) {
            let moveAfter = moveBefore + event.movementY;
            if (moveAfter < this.avatar_crop_bottom) {
              this.top = this.avatar_crop_bottom - this.height * this.scale;
            } else {
              this.top += event.movementY;
            }
          }
        }
        if (event.movementY > 0) {
          if (this.top < this.avatar_crop_top) {
            if (this.top + event.movementY > this.avatar_crop_top) {
              this.top = this.avatar_crop_top;
            } else {
              this.top += event.movementY;
            }
          }
        }
      }
    },
  },
};
</script>
<style scoped>
.avatar-crop-containter {
  overflow: hidden;
  position: absolute;
  user-select: none;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC);
}

.avatar-crop-containter img {
  display: block;
}
.avatar-wrapper {
  overflow: hidden;
  position: absolute;
}
.image-bg-wrapper {
  overflow: hidden;
  position: absolute;
}
.avatar-drag-box {
  background: black;
  opacity: 0.5;
  position: absolute;
}
.avatar-crop-box {
  position: absolute;
}

.avatar-view-box {
  display: block;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 500px;
  border: 1px solid #39f;
}
.avatar-face {
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
}
.avatar-move {
  cursor: move;
}
</style>
