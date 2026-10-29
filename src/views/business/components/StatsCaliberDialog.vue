<template>
  <span class="stats-caliber">
    <i class="el-icon-question stats-caliber-trigger" title="统计口径说明" @click="visible = true" />
    <el-dialog
      :title="title"
      :visible.sync="visible"
      width="640px"
      append-to-body
      custom-class="stats-caliber-dialog"
    >
      <p v-if="intro" class="stats-caliber-intro">{{ intro }}</p>
      <el-table :data="fields" border size="small" style="width: 100%;" :show-header="true">
        <el-table-column prop="label" label="字段" width="180" />
        <el-table-column prop="desc" label="说明" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="visible = false">知道了</el-button>
      </span>
    </el-dialog>
  </span>
</template>

<script>
export default {
  name: 'StatsCaliberDialog',
  props: {
    title: { type: String, default: '统计口径说明' },
    intro: { type: String, default: '' },
    fields: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return { visible: false }
  }
}
</script>

<style scoped>
.stats-caliber-trigger {
  cursor: pointer;
  color: #909399;
  font-size: 16px;
  margin-left: 4px;
  vertical-align: middle;
}
.stats-caliber-trigger:hover {
  color: #409EFF;
}
.stats-caliber-intro {
  margin: 0 0 12px;
  color: #606266;
  line-height: 1.6;
  font-size: 13px;
}
</style>
