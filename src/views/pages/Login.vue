<template>
    <div class="c-app flex-row align-items-center">
      <CContainer>
        <CRow class="justify-content-center">
          <CCol md="8">
            <CCardGroup>
              <CCard class="p-4">
                <CCardBody>
                  <CForm>
                    <h1>登录</h1>
                    <p class="text-muted">使用邮箱登录</p>
                    <CInput
                      placeholder="请输入邮箱账号"
                      autocomplete="username email"
                      v-model="username"
                    >
                      <template #prepend-content
                        ><CIcon name="cil-user"
                      /></template>
                    </CInput>
                    <CInput
                      placeholder="请输入密码"
                      type="password"
                      autocomplete="curent-password"
                      v-model="password"
                    >
                      <template #prepend-content
                        ><CIcon name="cil-lock-locked"
                      /></template>
                    </CInput>
                    <CRow>
                      <CCol col="6" class="text-left">
                        <CButton
                          color="primary"
                          class="px-4"
                          @click="loginFlyingCrow"
                          >登录</CButton
                        >
                      </CCol>
                      <CCol col="6" class="text-right">
                       
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard
                color="primary"
                text-color="white"
                class="text-center py-5 d-md-down-none"
                body-wrapper
              >
                <CCardBody>
                  <img
                    name="logo"
                    height="80"
                    alt="Logo"
                    :src="require('@/assets/image/logo_white.png')"
                  />
                  <div style="height:20px;"></div>
                  <h5>Strapi Admin</h5>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  </template>
  
  <script>
  import { siteInfo, login } from "../../api/api";
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
      siteInfo((data) => {
        this.allowRegister = data.data.site.allowRegister;
      });
    },
    methods: {
      loginFlyingCrow() {
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