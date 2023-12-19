<template>
  <CFooter :fixed="false">
    <div>
        <a href="https://strapiadmin.lixf.ink/" target="_blank">StrApi Admin</a>
        <span class="ml-1">&copy; {{ new Date().getFullYear() }}</span>
      </div>
    <div class="mfs-auto">
        <span class="mr-1">后台由</span>
        <a href="https://strapi.io/">StrApi</a>
        <span class="mr-1">驱动</span>
      </div>
  </CFooter>
</template>

<script>
export default {
  name: 'TheFooter'
}
</script>
