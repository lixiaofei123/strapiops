<template>
  <div>
    
  </div>
</template>

<script>



export default {
  name: "AdminDashboard",
  components: { },
  data() {
    return {
     
    };
  },
  created() {
    this.$store.commit('setNavs', [
      {
        active: true,
        name: "主面板"
      }
    ])
  },
  computed: {
   
  },
  watch: {
    
  },
  methods: {
    
  },
};
</script>

<style scoped>
.piechar {
  padding: 30px 20px;
}
.title {
  padding-bottom: 20px;
  text-align: center;
}
</style>
