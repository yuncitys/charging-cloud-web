<template>
  <div style="display: inline-block;">
    <el-button
      style="margin-right: 20px;"
      type="primary"
      class="filter-item"
      icon="el-icon-download"
      v-if="btnAuthen.permsVerifAuthention(':reports:businessOverview:export')"
      @click="doExport"
    >导出</el-button>
    <downloadProgress ref="downloadProgress" />
  </div>
</template>

<script>
import { businessOverviewStationExport } from '@/api/business/businessOverview.js'
import downloadProgress from '@/components/Common/downloadProgress.vue'

export default {
  name: 'DownBusinessOverviewStations',
  components: { downloadProgress },
  props: {
    queryData: { type: Object, default() { return {} } }
  },
  methods: {
    doExport() {
      const downloadData = JSON.parse(JSON.stringify(this.queryData))
      downloadData.page = 1
      downloadData.limit = 2000
      businessOverviewStationExport(downloadData).then(res => {
        if (res.code == 200) {
          this.$refs.downloadProgress.open(res.data.id)
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
</script>
