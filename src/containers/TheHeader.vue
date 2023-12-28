<template>
  <CHeader fixed with-subheader light>
    <CToggler in-header class="ml-3 d-lg-none" @click="$store.commit('toggleSidebarMobile')" />
    <CToggler in-header class="ml-3 d-md-down-none" @click="$store.commit('toggleSidebarDesktop')" />

    <CHeaderNav class="d-md-down-none">
      <CHeaderNavItem class="px-3">
        <CHeaderNavLink onclick="window.location.href='/'">
          首页
        </CHeaderNavLink>
      </CHeaderNavItem>
    </CHeaderNav>
    <CHeaderBrand class="mx-auto" to="/">
      <h2>内容管理系统</h2>
    </CHeaderBrand>
    <CHeaderNav class="mr-4">
      <TheHeaderDropdownAccnt :user="user" @logout="logout" />
    </CHeaderNav>
    <CSubheader class="px-3">
      <ol class="breadcrumb border-0 mb-0">
        <li role="presentation" class="breadcrumb-item"><a href="#/" class="router-link-active" target="_self"> 主页 </a>
        </li>
        <li v-for="nav in navs"  role="presentation" class="active breadcrumb-item">
          <a v-if="nav.to" :href="nav.to" class="router-link-active" target="_self"> {{nav.name}} </a>
          <span v-else>{{nav.name}}</span> 
          
        </li>
      </ol>
    </CSubheader>
  </CHeader>
</template>

<script>
var cookies = require("vue-cookie");
import TheHeaderDropdownAccnt from "./TheHeaderDropdownAccnt";

export default {
  name: "TheHeader",
  props: {
    stat: Object,
  },
  data() {
    return {};
  },
  created() { },
  computed: {
    user: function () {
      return this.$store.state.user;
    },
    navs() {
      return this.$store.state.navs
    }
  },
  methods: {
    logout() {
      cookies.set("authorization", "");
      this.stat = {};
      window.location = "/";
    },
  },
  components: {
    TheHeaderDropdownAccnt,
  },
};
</script>
<style scoped>
a{
  text-decoration: none;
  color: #409EFF;
}
</style>
