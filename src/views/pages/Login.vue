<template>
  <div class="loginbox">
    <el-card>
      <CCardBody>
        <div style="text-align: center;padding: 40px 0px">
          <h3>StrApi Ops登录</h3>
        </div>
        <el-form ref="form" label-width="40px">
          <el-form-item label="邮箱">
            <el-input v-model="username" type="email" placeholder="请输入登录邮箱" prefix-icon="el-icon-user"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="password" type="password" show-password placeholder="请输入密码" prefix-icon="el-icon-key"></el-input>
          </el-form-item>
          <el-button type="primary" @click="loginStrapi">登录</el-button>
        </el-form>
      </CCardBody>
    </el-card>
  </div>
</template>
  
<script>
import { login } from "../../api/api";
var cookies = require("vue-cookie");

export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      allowRegister: true,
    };
  },
  created() {

  },
  methods: {
    loginStrapi() {
      login(
        this.username,
        this.password,
        (data) => {
          if (data.data.token) {
            let token = data.data.token;
            cookies.set("authorization", token, 6);
            window.location.href = "/"
          }
        },
        () => {
          this.$notify.error({
            title: "错误",
            message: `登录失败,请确认账号密码是否正确`,
          });
        }
      );
    },
  },
};
</script>
<style>
.loginbox{
  width: calc(100% - 20px);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 150px;
}
</style>