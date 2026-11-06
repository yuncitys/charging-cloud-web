<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" class="filter-form" @submit.native.prevent>
        <el-form-item label="展示位">
          <el-select
            v-model="listQuery.placementCode"
            clearable
            placeholder="全部展示位"
            style="width: 200px;"
            @change="handleFilter"
          >
            <el-option
              v-for="item in placementOptions"
              :key="item.placementCode"
              :label="item.placementName ? `${item.placementName}（${item.placementCode}）` : item.placementCode"
              :value="item.placementCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上线状态">
          <el-select
            v-model="listQuery.itemStatus"
            clearable
            placeholder="全部"
            style="width: 130px;"
            @change="handleFilter"
          >
            <el-option label="已上线" :value="1" />
            <el-option label="已下线" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效状态">
          <el-select
            v-model="listQuery.effectiveStatus"
            clearable
            placeholder="全部"
            style="width: 160px;"
            @change="handleFilter"
          >
            <el-option v-for="item in effectiveOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(CONTENT_PERMS.add)"
            type="primary"
            icon="el-icon-plus"
            @click="onAdd"
          >新增内容</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      id="tableBox"
      v-loading="listLoading"
      :data="list"
      element-loading-text="拼命加载中......"
      fit
      highlight-current-row
      style="width: 100%;"
      align="center"
    >
      <el-table-column type="index" width="55" label="序号" align="center">
        <template slot-scope="scope"><span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span></template>
      </el-table-column>
      <el-table-column label="缩略图" align="center" width="120">
        <template slot-scope="scope">
          <img v-if="scope.row.itemType !== 2 && scope.row.mediaUrl" :src="scope.row.mediaUrl" class="thumb" alt="">
          <video v-else-if="scope.row.mediaUrl" :src="scope.row.mediaUrl" class="thumb" />
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column prop="itemTitle" label="标题" align="center" min-width="140" :show-overflow-tooltip="true" />
      <el-table-column label="展示位" align="center" min-width="140">
        <template slot-scope="scope">
          <el-tag
            v-for="code in scope.row.placementCodes || []"
            :key="code"
            size="mini"
            type="info"
            style="margin: 2px;"
          >{{ placementName(code) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="跳转" align="center" min-width="180" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ linkTypeLabel(scope.row.linkType) }}</span>
          <span v-if="scope.row.linkType !== 'NONE' && scope.row.linkValue" class="link-value">
            ：{{ scope.row.linkValue }}
          </span>
          <span v-if="scope.row.linkType === 'ACTIVITY' && scope.row.activityName" class="link-value">
            （{{ scope.row.activityName }}）
          </span>
        </template>
      </el-table-column>
      <el-table-column label="生效时间" align="center" min-width="220">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime || '立即' }} ~ {{ scope.row.endTime || '长期' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sorting" label="排序" align="center" width="80" />
      <el-table-column label="生效状态" align="center" width="120">
        <template slot-scope="scope">
          <el-tag size="small" :type="effectiveType(resolveEffectiveStatus(scope.row))">
            {{ effectiveLabel(resolveEffectiveStatus(scope.row)) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上线" align="center" width="90">
        <template slot-scope="scope">
          <el-switch
            :value="scope.row.itemStatus === 1"
            :disabled="!canStatus || scope.row._switching"
            @change="val => onSwitch(scope.row, val)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="onPreview(scope.row)">预览</el-button>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(CONTENT_PERMS.edit)"
            type="text"
            size="small"
            @click="onEdit(scope.row)"
          >编辑</el-button>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(CONTENT_PERMS.delete)"
            type="text"
            size="small"
            class="danger-text"
            @click="onDelete(scope.row)"
          >删除</el-button>
        </template>
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

    <content-form ref="contentForm" @saved="getLists" />
    <content-preview ref="contentPreview" />
  </div>
</template>

<script>
import { page as pageContentItem, status as updateStatus, remove as deleteContentItem } from '@/api/AD/contentItem.js'
import { list as listPlacement } from '@/api/AD/contentPlacement.js'
import ContentForm from './components/contentForm.vue'
import ContentPreview from './components/contentPreview.vue'
import {
  LINK_TYPE_LABEL,
  EFFECTIVE_STATUS_OPTIONS,
  CONTENT_PERMS,
  effectiveStatusLabel,
  effectiveStatusType,
  resolveEffectiveStatus
} from './constants.js'

export default {
  name: 'ADList',
  components: { ContentForm, ContentPreview },
  data() {
    return {
      CONTENT_PERMS,
      listLoading: false,
      list: [],
      total: 0,
      placementOptions: [],
      effectiveOptions: EFFECTIVE_STATUS_OPTIONS,
      listQuery: {
        page: 1,
        limit: 10,
        placementCode: '',
        itemStatus: '',
        effectiveStatus: ''
      }
    }
  },
  computed: {
    canStatus() {
      return this.btnAuthen.permsVerifAuthention(CONTENT_PERMS.status)
    }
  },
  created() {
    this.loadPlacements()
    this.getLists()
  },
  methods: {
    effectiveLabel(code) {
      return effectiveStatusLabel(code)
    },
    effectiveType(code) {
      return effectiveStatusType(code)
    },
    linkTypeLabel(type) {
      return LINK_TYPE_LABEL[type] || type || '—'
    },
    placementName(code) {
      const hit = this.placementOptions.find(i => i.placementCode === code)
      return hit && hit.placementName ? hit.placementName : code
    },
    loadPlacements() {
      listPlacement().then(res => {
        if (res && res.code === 200) this.placementOptions = res.data || []
      })
    },
    getLists() {
      this.listLoading = true
      // effectiveStatus 不是后端筛选参数，由前端对当前页结果做过滤
      const { effectiveStatus, ...serverQuery } = this.listQuery
      pageContentItem(serverQuery).then(res => {
        this.listLoading = false
        if (res && res.code === 200) {
          const rows = res.data || []
          this.list = effectiveStatus
            ? rows.filter(row => resolveEffectiveStatus(row) === effectiveStatus)
            : rows
          this.total = res.count || 0
        } else {
          this.$message.error((res && res.msg) || '列表加载失败')
        }
      }).catch(() => {
        // 错误已由请求层 toast 提示，这里只收起加载态，避免未捕获的 Uncaught 错误
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getLists()
    },
    resetFilter() {
      this.listQuery = { ...this.listQuery, page: 1, placementCode: '', itemStatus: '', effectiveStatus: '' }
      this.getLists()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.listQuery.page = 1
      this.getLists()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getLists()
    },
    onAdd() {
      this.$refs.contentForm.open()
    },
    onEdit(row) {
      this.$refs.contentForm.open(row)
    },
    onPreview(row) {
      this.$refs.contentPreview.open(row.id)
    },
    onSwitch(row, val) {
      const itemStatus = val ? 1 : 0
      const text = val ? '上线' : '下线'
      this.$confirm(`确认${text}该内容？`, '提示', { type: 'warning' }).then(() => {
        this.$set(row, '_switching', true)
        return updateStatus({ id: row.id, itemStatus })
      }).then(res => {
        if (res && res.code === 200) {
          this.$message.success(res.msg || `${text}成功`)
          this.getLists()
        } else {
          this.$message.error((res && res.msg) || `${text}失败`)
        }
      }).catch(() => {}).finally(() => {
        this.$set(row, '_switching', false)
      })
    },
    onDelete(row) {
      this.$confirm('删除后该内容将不再展示，确定删除吗？', '警告', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => deleteContentItem({ id: row.id })).then(res => {
        if (res && res.code === 200) {
          this.$message.success(res.msg || '删除成功')
          this.getLists()
        } else {
          this.$message.error((res && res.msg) || '删除失败')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.filter-container {
	margin-bottom: 12px;
}
.filter-form {
	margin-bottom: -10px;
}
.thumb {
	width: 100px;
	height: 60px;
	object-fit: cover;
	border-radius: 4px;
}
.link-value {
	color: #909399;
	font-size: 12px;
}
.danger-text {
	color: #f56c6c;
}
.pagination-container {
	padding: 20px 0 0;
	text-align: right;
}
</style>
