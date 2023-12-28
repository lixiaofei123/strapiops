<template>
  <div class="main">
    <el-card class="box-card">
      <div slot="header">
        快速安装
      </div>
      <div>
        <div>
          <el-steps :active="step" finish-status="success">
            <el-step title="配置跨域"></el-step>
            <el-step title="设置地址"></el-step>
            <el-step title="完成"></el-step>
          </el-steps>
        </div>
        <div style="padding: 40px 0px">
          <div v-if="step === 0">
            请根据下列教程将<b>{{ origin }}</b>添加到跨域白名单中，允许本网站调用您的strapi网站admin接口<br><br>
            <el-link target="blank" type="primary"
              href="https://docs.strapi.io/dev-docs/configurations/middlewares#cors">配置CORS教程</el-link>

            <div class="buttons">
              <el-button style="margin-top: 50px;" @click="step = 1" type="primary">下一步</el-button>
            </div>

          </div>
          <div v-if="step === 1">
            <el-alert title="本网站为静态网站，全部功能均依赖strapi的admin接口完成" type="info" :closable="false">
            </el-alert>
            <div style="height: 20px;"></div>
            <el-form>
              <el-form-item label="后台地址" :error="checkerror">
                <el-input v-model="strapiurl" placeholder="https://example.com"></el-input>
              </el-form-item>
            </el-form>
            <el-alert title="请检查您的地址填写的是否正确或者是否已经正确配置了跨域" type="error" v-if="checkerror">
            </el-alert>
            <div class="buttons">
              <el-button @click="step = 0">上一步</el-button>
              <el-button @click="checkStrapiUrl" type="primary" :loading="isChecking">下一步</el-button>
            </div>

          </div>
          <div v-if="step === 2">
            <p>恭喜您完成了全部的步骤</p>
            <p>请注意，此次安装只对本浏览器生效。如果更换电脑或者浏览器您可能重新需要重复此步骤</p>
            <p>如果您需要更改strapi后端地址，请清空浏览器cookies或者重新访问此页面</p>
            <div class="buttons">
              <el-button @click="step = 1">上一步</el-button>
              <el-button type="primary" @click="gotoHome">去使用</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
  
<script>
import { check_strapi_url } from "../../api/api";
var cookies = require("vue-cookie");

export default {
  name: "Install",
  data() {
    return {
      origin: document.location.origin,
      step: 0,
      strapiurl: "",
      checkerror: "",
      isChecking: false
    };
  },
  created() {
    let strapiurl = cookies.get("strapiurl")
    if (strapiurl) {
      this.strapiurl = strapiurl
    }
  },
  methods: {
    checkStrapiUrl() {
      this.isChecking = true
      if (this.strapiurl.endsWith("/")) {
        this.strapiurl = this.strapiurl.substr(0, this.strapiurl.length - 1)
      }
      check_strapi_url(this.strapiurl, () => {
        this.isChecking = false
        cookies.set("strapiurl", this.strapiurl, { expires: '99Y' });
        this.step = 2
      }, err => {
        this.isChecking = false
        this.checkerror = "校验失败"
      })

      
    },
    gotoHome(){
      window.location.href = this.origin
    }
  },
};
</script>
<style scoped>
.main {
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 100px;
}

.buttons {
  margin-top: 50px;
}
</style>