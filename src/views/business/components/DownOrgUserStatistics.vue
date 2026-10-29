<template>
  <div style="display: inline-block;">
    <el-button
      style="margin-right: 20px;"
      type="primary"
      class="filter-item"
      icon="el-icon-download"
      v-if="btnAuthen.permsVerifAuthention(':reports:orgUser:export')"
      @click="doExport"
    >导出</el-button>
    <downloadProgress ref="downloadProgress" />
  </div>
</template>

<script>
import { exportOrgUserStatistics } from '@/api/business/orgChargeStatistics.js'
import downloadProgress from '@/components/Common/downloadProgress.vue'

export default {
  name: 'DownOrgUserStatistics',
  components: { downloadProgress },
  props: {
    queryData: { type: Object, default() { return {} } }
  },
  methods: {
    doExport() {
      const downloadData = JSON.parse(JSON.stringify(this.queryData))
      downloadData.limit = 2000
      exportOrgUserStatistics(downloadData).then(res => {
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
