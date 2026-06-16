<template>
  <div class="app-container">
    <el-page-header :content="'兑换码管理 - ' + (activityName || activityId)" @back="goBack" />

    <div class="filter-container" style="margin-top: 20px;">
      <el-form inline>
        <el-form-item label="生成数量">
          <el-input-number v-model="generateCount" :min="1" :max="5000" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="generating" icon="el-icon-plus" @click="handleGenerate">批量生成</el-button>
        </el-form-item>
        <el-form-item label="状态筛选">
          <el-select v-model="statusFilter" clearable placeholder="全部" @change="applyFilter">
            <el-option label="未兑换" value="0" />
            <el-option label="已兑换" value="1" />
          </el-select>
        </el-form-item>
      </el-form>

      <el-table v-loading="listLoading" :data="filteredList" fit highlight-current-row style="width: 100%;">
        <el-table-column type="index" width="55" label="序号" align="center" />
        <el-table-column prop="conversionCode" label="兑换码" align="center" min-width="200" />
        <el-table-column prop="conversionStatus" label="状态" align="center" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.conversionStatus === '1' ? 'success' : 'info'" size="mini">
              {{ scope.row.conversionStatus === '1' ? '已兑换' : '未兑换' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="conversionUserAccount" label="兑换用户" align="center" min-width="120" />
        <el-table-column prop="conversionTime" label="兑换时间" align="center" width="160">
          <template slot-scope="scope"><span>{{ scope.row.conversionTime | formatDate }}</span></template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!codeList.length && !generating" description="暂无兑换码，请批量生成" />
    </div>
  </div>
</template>

<script>
import { generateCodes } from '@/api/marketing/marketing'
import { parseTime } from '@/utils/index'

export default {
  name: 'exchangeCodeList',
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time)
    }
  },
  data() {
    return {
      listLoading: false,
      generating: false,
      activityId: '',
      activityName: '',
      generateCount: 100,
      statusFilter: '',
      codeList: []
    }
  },
  computed: {
    filteredList() {
      if (!this.statusFilter) return this.codeList
      return this.codeList.filter(item => item.conversionStatus === this.statusFilter)
    }
  },
  created() {
    this.activityId = this.$route.query.activityId || ''
    this.activityName = this.$route.query.activityName || ''
    if (!this.activityId) {
      this.$message.warning('缺少活动ID')
    }
  },
  methods: {
    goBack() {
      this.$router.push({
        name: 'activityList',
        query: {
          activityType: this.$route.query.activityType || '6',
          typeName: this.$route.query.typeName || '券码兑换'
        }
      })
    },
    applyFilter() {},
    handleGenerate() {
      if (!this.activityId) return
      this.generating = true
      generateCodes(this.activityId, this.generateCount).then(res => {
        this.generating = false
        if (res.code === 200) {
          const codes = res.data || []
          const newRows = codes.map(code => ({
            conversionCode: code,
            conversionStatus: '0',
            conversionUserAccount: '',
            conversionTime: null
          }))
          this.codeList = newRows.concat(this.codeList)
          this.$message.success(res.msg || `成功生成 ${codes.length} 个兑换码`)
        } else {
          this.$message.error(res.msg || '生成失败')
        }
      }).catch(() => { this.generating = false })
    }
  }
}
</script>
