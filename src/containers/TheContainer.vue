<template>
  <div class="c-app">
    <TheSidebar v-if="permissions" :stat="stat" :permissions="permissions" />
    <CWrapper>
      <TheHeader :stat="stat" />
      <div class="c-body">
        <main class="c-main">
          <CContainer fluid>
            <transition name="fade" mode="out-in">
              <router-view :key="$route.path"></router-view>
            </transition>
          </CContainer>
        </main>
      </div>
      <TheFooter />
    </CWrapper>
  </div>
</template>

<script>
import { refresh_token, myInfo, get_permissions, search_folders, create_folder, list_files_with_related } from "../api/api";
import TheSidebar from "./TheSidebar";
import TheHeader from "./TheHeader";
import TheFooter from "./TheFooter";

export default {
  name: "TheContainer",
  components: {
    TheSidebar,
    TheHeader,
    TheFooter,
  },
  data() {
    return {
      user: {},
      stat: {},
      permissions: undefined,
    };
  },
  created() {
    this.loadInfo(() => {
      this.createUploadFolder(undefined, "strapiadmin/model", model => {
        this.createUploadFolder(undefined, "strapiadmin/editor", editor => {
          this.$store.commit('setUploadFoler', {
            model: model,
            editor: editor
          })

        })
      })
    });
  },
  methods: {
    loadInfo(success) {
      success = success || function () { }
      refresh_token(() => {
        myInfo((data) => {
          if (data.data) {
            this.$store.commit('setUserInfo', data.data)
            get_permissions(data => {
              let permissions_map = {}
              let permissions = data.data
              for (let i = 0; i < permissions.length; i++) {
                let permission = permissions[i]
                if (permission.action.startsWith("plugin::content-manager.explorer")) {
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

                if (permission.action.startsWith("plugin::upload")) {
                  if (permissions_map["upload"] == undefined) {
                    permissions_map["upload"] = {
                      read: false,
                      update: false,
                      download: false,
                      create: false
                    }
                  }

                  if (permission.action === "plugin::upload.read") {
                    permissions_map["upload"].read = true
                  }
                  if (permission.action === "plugin::upload.assets.update") {
                    permissions_map["upload"].update = true
                  }
                  if (permission.action === "plugin::upload.assets.create") {
                    permissions_map["upload"].create = true
                  }
                  if (permission.action === "plugin::upload.assets.download") {
                    permissions_map["upload"].download = true
                  }
                }

              }

              this.permissions = permissions_map
              this.$store.commit('setPermissionsMap', permissions_map)
              success()
            });
          }
        });
      })

    },

    createUploadFolder(parentid, path, resolve) {
      resolve = resolve || function () { }
      let names = path.split("/")
      if (names.length > 0) {
        let name = names[0]
        if (name !== "") {
          let subpath = names.splice(1).join("/")
          search_folders(parentid, name, 1, 10, data => {
            let folders = data.data
            let findindex = folders.findIndex(x => x.name === name)
            if (findindex === -1) {
              create_folder(parentid, name, data => {
                this.createUploadFolder(data.data.id, subpath, resolve)
              })
            } else {
              let foler = folders[findindex]
              this.createUploadFolder(foler.id, subpath, resolve)
            }
          })
        } else {
          resolve(parentid)
        }

      }
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
