<template>
  <div class="c-app">
    <TheSidebar :stat="stat" />
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
import { refresh_token, myInfo } from "../api/api";
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
    };
  },
  created() {
    this.loadInfo();
  },
  methods: {
    loadInfo() {
      refresh_token(() => {
        myInfo((data) => {
          if (data.data) {
            this.$store.commit('setUserInfo', data.data)
          }
        });
      })

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
