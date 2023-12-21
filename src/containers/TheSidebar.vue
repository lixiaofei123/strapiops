<template>
  <CSidebar fixed :minimize="minimize" :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])">
    <CSidebarBrand class="d-md-down-none" to="/">
      <img class="c-sidebar-brand-full" :height="35" :src="require('@/assets/image/logo_white.png')" />
      <img class="c-sidebar-brand-minimized" :height="35" :src="require('@/assets/image/logo_mini_white.png')" />
    </CSidebarBrand>

    <CRenderFunction flat :content-to-render="admin_nav" />
    <CSidebarFooter class="d-md-down-none">

    </CSidebarFooter>
    <CSidebarMinimizer class="d-md-down-none" @click.native="$store.commit('set', ['sidebarMinimize', !minimize])">
    </CSidebarMinimizer>
  </CSidebar>
</template>

<script>

import { get_content_init, get_permissions } from "../api/api";

export default {
  name: "TheSidebar",
  props: {

  },
  data() {
    return {
      admin_nav: [
        {
          _name: "CSidebarNav",
          _children: [
            {
              _name: "CSidebarNavItem",
              name: "主面板",
              to: "/dashboard",
              icon: "cil-speedometer"
            },
            {
              _name: "CSidebarNavDropdown",
              name: "内容管理",
              icon: "cil-puzzle",
              items: [

              ],
            },
          ],
        },
      ]
    };
  },
  methods: {
    load_content_models() {
      get_permissions(data => {
        let permissions_map = {}
        let permissions = data.data
        for (let i = 0; i < permissions.length; i++) {
          let permission = permissions[i]
          let model = permission.subject
          if (permissions_map[model] === undefined) {
            permissions_map[model] = {
              read: false,
              delete: false,
              update: false,
              create: false,
              publish: false
            }
          }
          if (permission.action === "plugin::content-manager.explorer.read") {
            permissions_map[model].read = true
          }
          if (permission.action === "plugin::content-manager.explorer.delete") {
            permissions_map[model].delete = true
          }
          if (permission.action === "plugin::content-manager.explorer.update") {
            permissions_map[model].update = true
          }
          if (permission.action === "plugin::content-manager.explorer.create") {
            permissions_map[model].create = true
          }
          if (permission.action === "plugin::content-manager.explorer.publish") {
            permissions_map[model].publish = true
          }
        }

        this.$store.commit('setPermissionsMap', permissions_map)

        get_content_init(data => {
          let content_types = data.data.contentTypes
          let models = content_types.filter(item => {
            return (permissions_map[item.uid] && permissions_map[item.uid].read) && item.isDisplayed
          }).map(item => {
            return {
              name: item.info.displayName,
              to: `/content?model=${item.uid}`,
            }
          })
          this.admin_nav[0]["_children"][1].items = models
          this.$store.commit('setContentTypes', data.data.contentTypes)
          this.$store.commit('setComponents', data.data.components)
        })

      });

    },
  },
  watch: {
    user() {
      this.load_content_models()
    },
  },
  computed: {
    show() {
      return this.$store.state.sidebarShow;
    },
    minimize() {
      return this.$store.state.sidebarMinimize;
    },
    user: function () {
      return this.$store.state.user;
    }
  },
};
</script>

<style scoped>
.label {
  padding: 5px 0px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  ;
}
</style>