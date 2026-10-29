<template>
  <div style="display: inline-block;">
    <el-button
      style="margin-right: 20px;"
      type="primary"
      class="filter-item"
      icon="el-icon-download"
      v-if="btnAuthen.permsVerifAuthention(':reports:orgCompare:export')"
      @click="doExport"
    >导出</el-button>
    <downloadProgress ref="downloadProgress" />
  </div>
</template>

<script>
import { exportOrgCompareStatistics } from '@/api/business/orgChargeStatistics.js'
import downloadProgress from '@/components/Common/downloadProgress.vue'

export default {
  name: 'DownOrgCompareStatistics',
  components: { downloadProgress },
  props: {
    queryData: { type: Object, default() { return {} } }
  },
  methods: {
    doExport() {
      const downloadData = JSON.parse(JSON.stringify(this.queryData))
      exportOrgCompareStatistics(downloadData).then(res => {
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
