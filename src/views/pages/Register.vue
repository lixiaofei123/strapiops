<template>
  <div class="d-flex align-items-center min-vh-100">
    <CContainer fluid>
      <CRow class="justify-content-center">
        <CCol md="6">
          <CCard class="mx-4 mb-0">
            <CCardBody class="p-4">
              <CForm>
                <h1>注册飞鸦账户</h1>
                <p class="text-muted">开启飞鸦图床之旅吧</p>
                <CInput
                  placeholder="用户名"
                  v-model="username"
                  autocomplete="username"
                  invalid-feedback="用户名是8到12位且不能包含特殊字符"
                  :is-valid="userNameIsValid"
                  :readonly="!allowRegister"
                >
                  <template #prepend-content><CIcon name="cil-user"/></template>
                </CInput>
                <CInput
                  placeholder="邮箱"
                  v-model="email"
                  autocomplete="email"
                  invalid-feedback="邮箱格式非法"
                  :is-valid="emailIsValid"
                  :readonly="!allowRegister"
                  prepend="@"
                />
                <CInput
                  placeholder="密码"
                  type="password"
                  v-model="password"
                  autocomplete="new-password"
                  invalid-feedback="密码是8到20位且不能包含特殊字符"
                  :is-valid="passwordIsValid"
                  :readonly="!allowRegister"
                >
                  <template #prepend-content
                    ><CIcon name="cil-lock-locked"
                  /></template>
                </CInput>
                <CInput
                  placeholder="重复密码"
                  type="password"
                  v-model="confirmPassword"
                  autocomplete="new-password"
                  invalid-feedback="两次输入的密码不一致"
                  class="mb-4"
                  :is-valid="confirmPasswordIsValid"
                  :readonly="!allowRegister"
                >
                  <template #prepend-content
                    ><CIcon name="cil-lock-locked"
                  /></template>
                </CInput>
                <CAlert show color="danger" v-if="!allowRegister"
                  >当前站点已经禁止新用户注册</CAlert
                >
                <CAlert show :color="alertColor" v-if="alertText">{{
                  alertText
                }}</CAlert>

                <CButton
                  color="success"
                  :disabled="!allowRegister"
                  block
                  @click="registerNow()"
                  >注册</CButton
                >
              </CForm>
            </CCardBody>
            <CCardFooter class="p-4"> </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import { siteInfo, register } from "../../api/api";
var cookies = require("vue-cookie");

export default {
  name: "Register",
  data() {
    return {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      allowRegister: true,
      alertColor: "danger",
      alertText: "",
      userNameIsValid: true,
      emailIsValid: true,
      passwordIsValid: true,
      confirmPasswordIsValid: true,
    };
  },
  created() {
    siteInfo((data) => {
      this.allowRegister = data.data.site.allowRegister;
    });
  },
  methods: {
    registerNow() {
      this.userNameIsValid = /^[a-zA-Z0-9_-]{8,12}$/.test(this.username);
      this.emailIsValid = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(
        this.email
      );
      this.passwordIsValid = /^(\w){8,20}$/.test(this.password);
      this.confirmPasswordIsValid = this.password === this.confirmPassword;
      if (
        this.allowRegister &&
        this.userNameIsValid &&
        this.emailIsValid &&
        this.passwordIsValid &&
        this.confirmPasswordIsValid
      ) {
        register(
          this.username,
          this.email,
          this.password,
          (data) => {
            if (data.code === 200) {
              this.success(`注册成功，页面将在5秒后跳转`);
              let token = data.message;
              cookies.set("authorization", token, 6);
              setTimeout(() => {
                window.location.href = "/"
              }, 5000);
            }
          },
          (data) => {
            this.error(`注册失败:${data.reason}`);
          }
        );
      }
    },
    error(text) {
      this.alertColor = "danger";
      this.alertText = text;
    },
    success(text) {
      this.alertColor = "primary";
      this.alertText = text;
    },
  },
};
</script>
