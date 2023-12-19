<template>
  <CChartBar
    :datasets="defaultDatasets"
    :labels="labels"
  />
</template>

<script>
import { CChartBar } from '@coreui/vue-chartjs'

export default {
  name: 'CChartBarExample',
  components: { CChartBar },
  computed: {
    labels(){
      return ['a','b','c','d','e','f','g','h','k','j']
    },
    defaultDatasets () {
      return [
        {
          label: "ceshi",
          backgroundColor: '#f87979',
          data: [0,1,2,3,4,5,6,7,8,9]
        }
      ]
    }
  }
}
</script>
