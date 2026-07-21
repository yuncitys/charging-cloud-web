<template>
  <div class="app-container">
    <el-page-header :content="'兑换码管理 - ' + (activityName || activityId)" @back="goBack" />

    <div class="filter-container" style="margin-top: 20px;">
      <el-form inline>
        <el-form-item label="发放总数量">
          <span>{{ sendTotalCount }}</span>
        </el-form-item>
        <el-form-item label="已生成">
          <span>{{ generatedTotal }}</span>
        </el-form-item>
        <el-form-item label="剩余可生成">
          <span>{{ remainingCount }}</span>
        </el-form-item>
        <el-form-item label="生成数量">
          <el-input-number v-model="generateCount" :min="1" :max="maxGenerateCount" :disabled="remainingCount <= 0" />
        </el-form-item>
        <el-form-item>
          <el-button v-if="canGenerate" type="primary" :loading="generating" :disabled="remainingCount <= 0" icon="el-icon-plus" @click="handleGenerate">批量生成</el-button>
        </el-form-item>
        <el-form-item label="状态筛选">
          <el-select v-model="statusFilter" clearable placeholder="全部" @change="handleFilter">
            <el-option label="未兑换" value="0" />
            <el-option label="已兑换" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button v-if="canExport" type="primary" :loading="exporting" icon="el-icon-download" @click="handleExport">导出 Excel</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="listLoading"
        :data="codeList"
        fit
        highlight-current-row
        style="width: 100%;"
        empty-text="暂无兑换码，请批量生成"
      >
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span></template>
        </el-table-column>
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

      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.limit"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { activityDetail, exportExchangeCodes, generateCodes, listExchangeCodes } from '@/api/marketing/marketing'
import { MARKETING_PERMS } from './constants/marketingPermissions'
import { hasMarketingPerm } from './utils/marketingActivityAuth'
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
      exporting: false,
      activityId: '',
      activityName: '',
      sendTotalCount: 0,
      generatedTotal: 0,
      generateCount: 100,
      statusFilter: '',
      codeList: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        activityId: ''
      }
    }
  },
  computed: {
    remainingCount() {
      return Math.max(this.sendTotalCount - this.generatedTotal, 0)
    },
    maxGenerateCount() {
      return Math.max(this.remainingCount, 1)
    },
    canGenerate() {
      return hasMarketingPerm(MARKETING_PERMS.activityGenerateExchangeCodes)
    },
    canExport() {
      return hasMarketingPerm(MARKETING_PERMS.activityExportExchangeCodes)
    }
  },
  created() {
    this.activityId = this.$route.query.activityId || ''
    this.activityName = this.$route.query.activityName || ''
    this.listQuery.activityId = this.activityId
    if (!this.activityId) {
      this.$message.warning('缺少活动ID')
      return
    }
    this.loadActivityInfo()
    this.loadGeneratedTotal()
    this.loadCodeList()
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
    loadActivityInfo() {
      activityDetail(this.activityId).then(res => {
        if (res.code !== 200 || !res.data) return
        const subConfig = res.data.subConfig || {}
        this.sendTotalCount = Number(subConfig.sendTotalCount || 0)
        this.syncGenerateCount()
      })
    },
    loadGeneratedTotal() {
      listExchangeCodes({
        activityId: this.activityId,
        page: 1,
        limit: 1
      }).then(res => {
        if (res.code === 200) {
          this.generatedTotal = Number(res.count || 0)
          this.syncGenerateCount()
        }
      })
    },
    loadCodeList() {
      this.listLoading = true
      listExchangeCodes({
        activityId: this.activityId,
        page: this.listQuery.page,
        limit: this.listQuery.limit,
        conversionStatus: this.statusFilter || undefined
      }).then(res => {
        this.listLoading = false
        if (res.code === 200) {
          this.codeList = res.data || []
          this.total = Number(res.count || 0)
        } else {
          this.$message.error(res.msg || '查询兑换码失败')
        }
      }).catch(() => { this.listLoading = false })
    },
    syncGenerateCount() {
      const remaining = this.remainingCount
      if (remaining <= 0) {
        this.generateCount = 1
        return
      }
      this.generateCount = Math.min(this.generateCount, remaining)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.loadCodeList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.listQuery.page = 1
      this.loadCodeList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.loadCodeList()
    },
    handleGenerate() {
      if (!this.canGenerate) return
      if (!this.activityId) return
      if (this.remainingCount <= 0) {
        this.$message.warning('已达到发放总数量上限，无法继续生成')
        return
      }
      if (this.generateCount > this.remainingCount) {
        this.$message.warning(`生成数量不能超过剩余可生成数量（${this.remainingCount}）`)
        return
      }
      this.generating = true
      generateCodes(this.activityId, this.generateCount).then(res => {
        this.generating = false
        if (res.code === 200) {
          this.$message.success(res.msg || `成功生成 ${(res.data || []).length} 个兑换码`)
          this.loadGeneratedTotal()
          this.loadCodeList()
        } else {
          this.$message.error(res.msg || '生成失败')
        }
      }).catch(() => { this.generating = false })
    },
    handleExport() {
      if (!this.canExport) return
      if (!this.activityId) return
      this.exporting = true
      exportExchangeCodes({
        activityId: this.activityId,
        status: this.statusFilter || undefined
      }).then(res => {
        const blob = res
        const isJsonBlob = blob.type && (blob.type.includes('json') || blob.type.includes('text/plain'))
        const checkJson = isJsonBlob || blob.size < 1024
        const finish = () => { this.exporting = false }
        if (checkJson) {
          blob.text().then(text => {
            if (text.trim().startsWith('{')) {
              try {
                const json = JSON.parse(text)
                this.$message.error(json.msg || '导出失败')
              } catch (e) {
                this.$message.error('导出失败')
              }
              finish()
              return
            }
            this.downloadExchangeCodeBlob(blob)
            finish()
          }).catch(() => {
            this.$message.error('导出失败')
            finish()
          })
          return
        }
        this.downloadExchangeCodeBlob(blob)
        finish()
      }).catch(() => {
        this.exporting = false
        this.$message.error('导出失败')
      })
    },
    downloadExchangeCodeBlob(blob) {
      const fileBlob = blob.type
        ? blob
        : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(fileBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `兑换码-${this.activityId}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }
}
</script>
