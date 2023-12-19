<template>
  <CDropdown
    inNav
    class="c-header-nav-items"
    placement="bottom-end"
    add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        {{ user.firstname }} {{ user.lastname }}
      </CHeaderNavLink>
    </template>
    <CDropdownItem @click="logout0">
      <CIcon name="cil-lock-locked" /> 注销
    </CDropdownItem>
  </CDropdown>
</template>

<script>

export default {
  name: "TheHeaderDropdownAccnt",
  props: {
    user: Object,
  },
  data() {
    return {
    };
  },
  methods: {
    logout0(){
      this.$emit('logout')
    },
  },
  watch: {
  },
};
</script>

<style scoped>
.c-icon {
  margin-right: 0.3rem;
}
.label {
  padding: 5px 0px;
  font-size: 10px;
}
</style>
