<template>
  <CHeader fixed with-subheader light>
    <CToggler
      in-header
      class="ml-3 d-lg-none"
      @click="$store.commit('toggleSidebarMobile')"
    />
    <CToggler
      in-header
      class="ml-3 d-md-down-none"
      @click="$store.commit('toggleSidebarDesktop')"
    />

    <CHeaderNav class="d-md-down-none">
      <CHeaderNavItem class="px-3">
        <CHeaderNavLink onclick="window.location.href='/'">
          首页
        </CHeaderNavLink>
      </CHeaderNavItem>
    </CHeaderNav>
    <CHeaderBrand class="mx-auto" to="/">
      <img name="logo" height="40" alt="Logo" :src="require('@/assets/image/logo_main.png')" />
    </CHeaderBrand>
    <CHeaderNav class="mr-4">
      <TheHeaderDropdownAccnt :user="user"  @logout="logout" />
    </CHeaderNav>
    <CSubheader class="px-3">
      <CBreadcrumbRouter class="border-0 mb-0" />
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
  created() {},
  computed: {
    user: function() {
      return this.$store.state.user;
    },
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
