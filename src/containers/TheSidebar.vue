<template>
  <CSidebar fixed :minimize="minimize" :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])">
    <CSidebarBrand class="d-md-down-none" to="/">
      <h3 class="c-sidebar-brand-full">STRAPI OPS</h3>
      <h3 class="c-sidebar-brand-minimized">OPS</h3>
    </CSidebarBrand>

    <CRenderFunction flat :content-to-render="admin_nav" />
    <CSidebarFooter class="d-md-down-none">

    </CSidebarFooter>
    <CSidebarMinimizer class="d-md-down-none" @click.native="$store.commit('set', ['sidebarMinimize', !minimize])">
    </CSidebarMinimizer>
  </CSidebar>
</template>

<script>

import { get_content_init } from "../api/api";

export default {
  name: "TheSidebar",
  props: {
    permissions: Object,
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
              name: "内容集合",
              icon: "cil-list",
              items: [

              ],
            },
            {
              _name: "CSidebarNavDropdown",
              name: "单项内容",
              icon: "cil-puzzle",
              items: [

              ],
            },
            {
              _name: "CSidebarNavDropdown",
              name: "工具",
              icon: "cil-settings",
              items: [
                {
                  name: "JsonSchema生成",
                  to: `/jsonSchemaGenerator`
                }
              ],
            }
          ],
        },
      ]
    };
  },
  created() {
    this.load_content_models()
  },
  methods: {
    load_content_models() {
      let permissions = this.permissions
      get_content_init(data => {
        let content_types = data.data.contentTypes
        let models = content_types.filter(item => {
          return (permissions[item.uid] && permissions[item.uid].read) && item.isDisplayed && item.kind === "collectionType"
        }).map(item => {
          return {
            name: item.info.displayName,
            to: `/content?model=${item.uid}`,
          }
        })
        this.admin_nav[0]["_children"][1].items = models

        let singletype_models = content_types.filter(item => {
          return (permissions[item.uid] && permissions[item.uid].read) && item.isDisplayed && item.kind === "singleType"
        }).map(item => {
          return {
            name: item.info.displayName,
            to: `/contentEdit?model=${item.uid}`,
          }
        })
        this.admin_nav[0]["_children"][2].items = singletype_models



        if (permissions["upload"] && permissions["upload"].read) {
          this.admin_nav[0]["_children"].push(
            {
              _name: "CSidebarNavItem",
              name: "媒体库",
              to: "/mediaLibrary",
              icon: "cil-image"
            }
          )
        }

        this.$store.commit('setContentTypes', data.data.contentTypes)
        this.$store.commit('setComponents', data.data.components)
      })
    },
  },
  watch: {
  },
  computed: {
    show() {
      return this.$store.state.sidebarShow;
    },
    minimize() {
      return this.$store.state.sidebarMinimize;
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