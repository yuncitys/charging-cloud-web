<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.contactPhone" style="width: 200px;margin-right: 20px;" class="filter-item"
				placeholder="请输入联系方式" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-select v-model="listQuery.status" style="width: 200px;margin-right: 20px;" class="filter-item"
				placeholder="处理状态" clearable @change="handleFilter">
				<el-option v-for="item in statusOptions" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item" style="margin-right: 20px;"
				start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange" format="yyyy-MM-dd"
				value-format="yyyy-MM-dd">
			</el-date-picker>
			<el-button type="primary" class="filter-item" @click="handleFilter" icon="el-icon-search">查询</el-button>

			<el-table
				v-loading="listLoading"
				:data="list"
				fit
				highlight-current-row
				row-key="groupKey"
				style="width: 100%;margin-top: 20px;"
			>
				<el-table-column type="expand">
					<template slot-scope="scope">
						<el-table :data="scope.row.issueRows" border size="mini" class="child-table">
							<el-table-column type="index" width="55" label="序号" align="center" />
							<el-table-column prop="subTypeName" label="问题分类" align="center" min-width="120" />
							<el-table-column prop="description" label="问题描述" align="center" min-width="220" show-overflow-tooltip />
							<el-table-column prop="status" label="状态" align="center" width="90">
								<template slot-scope="childScope">
									<el-tag type="danger" v-if="childScope.row.status == 0">未处理</el-tag>
									<el-tag type="success" v-else>已处理</el-tag>
								</template>
							</el-table-column>
							<el-table-column prop="handleRemark" label="处理备注" align="center" min-width="160" show-overflow-tooltip />
						</el-table>
					</template>
				</el-table-column>
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}}</span></template>
				</el-table-column>
				<el-table-column prop="userName" label="用户名" align="center" />
				<el-table-column prop="contactPhone" label="联系方式" align="center" />
				<el-table-column prop="typeName" label="反馈类型" align="center" />
				<!-- <el-table-column prop="issueCount" label="子问题数" align="center" width="100" /> -->
				<el-table-column prop="descriptionSummary" label="问题摘要" align="center" show-overflow-tooltip />
				<el-table-column prop="status" label="状态" align="center">
					<template slot-scope="scope">
						<el-tag type="danger" v-if="scope.row.status == 0">未处理</el-tag>
						<el-tag type="success" v-else>已处理</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="createTime" label="提交时间" align="center">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="160">
					<template slot-scope="scope">
						<el-button type="primary" size="mini" @click="openDetail(scope.row)">详情</el-button>
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>
		</div>

		<el-drawer
			title="反馈详情"
			:visible.sync="detailVisible"
			size="720px"
			custom-class="feedback-detail-drawer"
		>
			<div v-if="currentRow" class="drawer-body">
				<div class="summary-card">
					<div class="summary-card__header">
						<div>
							<div class="summary-card__title">{{ currentRow.typeName || '用户反馈' }}</div>
							<div class="summary-card__sub">批次号：{{ currentRow.batchId || '-' }}</div>
						</div>
						<div class="status-wrap">
							<el-tag type="danger" v-if="currentRow.status == 0">未处理</el-tag>
							<el-tag type="success" v-else>已处理</el-tag>
						</div>
					</div>
					<div class="summary-grid">
						<div class="summary-item">
							<span>用户名</span>
							<b>{{ currentRow.userName || '-' }}</b>
						</div>
						<div class="summary-item">
							<span>联系方式</span>
							<b>{{ currentRow.contactPhone || '-' }}</b>
						</div>
						<div class="summary-item">
							<span>提交时间</span>
							<b>{{ currentRow.createTime | formatDate }}</b>
						</div>
						<div class="summary-item">
							<span>子问题数</span>
							<b>{{ currentRow.issueCount }}</b>
						</div>
					</div>
					<div class="extra-section">
						<div class="extra-section__label">扩展信息</div>
						<div v-if="formatExtraFieldList(currentRow.extraFields).length" class="extra-tags">
							<div v-for="item in formatExtraFieldList(currentRow.extraFields)" :key="item.key" class="extra-tag">
								<span>{{ item.label }}</span>
								<b>{{ item.value }}</b>
							</div>
						</div>
						<div v-else class="empty-text">暂无扩展信息</div>
					</div>
				</div>

				<div class="issue-detail-list">
					<div v-for="(item, index) in currentRow.issueRows" :key="item.id" class="issue-detail-card">
						<div class="issue-card-title">
							<div class="issue-card-title__left">
								<span class="issue-index">{{ index + 1 }}</span>
								<span>{{ item.subTypeName }}</span>
							</div>
							<div class="status-wrap">
								<el-tag size="mini" type="danger" v-if="item.status == 0">未处理</el-tag>
								<el-tag size="mini" type="success" v-else>已处理</el-tag>
							</div>
						</div>
						<div class="detail-block">
							<div class="detail-label">问题描述</div>
							<div class="detail-value">{{ item.description || '-' }}</div>
						</div>
						<div class="detail-meta">
							<span>提交时间：{{ item.createTime | formatDate }}</span>
						</div>
						<div class="detail-block" v-if="formatExtraFieldList(item.extraFields).length">
							<div class="detail-label">扩展信息</div>
							<div class="extra-tags">
								<div v-for="field in formatExtraFieldList(item.extraFields)" :key="field.key" class="extra-tag">
									<span>{{ field.label }}</span>
									<b>{{ field.value }}</b>
								</div>
							</div>
						</div>
						<div class="detail-block" v-if="item.handleRemark">
							<div class="detail-label">处理备注</div>
							<div class="detail-value">{{ item.handleRemark }}</div>
						</div>
						<div class="detail-row" v-if="parseImages(item.imageUrls).length">
							<div class="detail-label">凭证图片</div>
							<div class="img-list">
								<el-image
									v-for="(img, idx) in parseImages(item.imageUrls)"
									:key="idx"
									:src="img"
									:preview-src-list="parseImages(item.imageUrls)"
									style="width: 100px;height: 100px;margin-right: 10px;margin-top: 8px;"
									fit="cover"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="drawer-footer" v-if="currentRow">
				<el-input
					v-if="currentRow.status == 0"
					type="textarea"
					:rows="2"
					v-model="handleRemark"
					placeholder="请输入内部处理备注"
					class="handle-input"
				/>
				<el-button @click="detailVisible = false" type="warning" size="mini">关闭</el-button>
				<el-button
					v-if="currentRow.status == 0"
					type="primary" size="mini"
					:loading="handleLoading"
					@click="confirmHandle"
				>确认处理</el-button>
			</div>
		</el-drawer>
	</div>
</template>

<script>
import { getFeedbackPage, handleFeedback } from '@/api/feedback/feedback.js'
import { parseTime } from '@/utils/index'

export default {
	name: 'feedbackList',
	data() {
		return {
			listLoading: false,
			page: 1,
			limit: 10,
			list: [],
			rawList: [],
			total: 0,
			listQuery: {
				page: 1,
				limit: 10,
				status: '',
				contactPhone: '',
				createTimeStart: '',
				createTimeEnd: ''
			},
			statusOptions: [{ title: '未处理', id: 0 }, { title: '已处理', id: 1 }],
			extraFieldLabels: {
				deviceCode: '充电枪号',
				port: '枪号/端口',
				orderNo: '订单号',
				stationName: '站点名称'
			},
			time: '',
			detailVisible: false,
			currentRow: null,
			handleRemark: '',
			handleLoading: false
		}
	},
	filters: {
		formatDate(time) {
			if (!time) return ''
			return parseTime(time)
		}
	},
	created() {
		this.getList()
	},
	methods: {
		getList() {
			this.listLoading = true
			getFeedbackPage(this.listQuery).then(res => {
				this.listLoading = false
				this.rawList = res.data || []
				this.list = this.buildParentRows(this.rawList)
				this.total = res.count || 0
			}).catch(() => { this.listLoading = false })
		},
		handleFilter() {
			this.listQuery.page = 1
			this.getList()
		},
		dateChange(e) {
			if (e) {
				this.listQuery.createTimeStart = e[0]
				this.listQuery.createTimeEnd = e[1]
			} else {
				this.listQuery.createTimeStart = ''
				this.listQuery.createTimeEnd = ''
			}
		},
		handleSizeChange(val) {
			this.listQuery.limit = val
			this.limit = val
			this.getList()
		},
		handleCurrentChange(val) {
			this.listQuery.page = val
			this.page = val
			this.getList()
		},
		openDetail(row) {
			this.currentRow = row
			this.handleRemark = ''
			this.detailVisible = true
		},
		confirmHandle() {
			if (!this.currentRow) return
			const pendingRows = (this.currentRow.issueRows || []).filter(item => Number(item.status) === 0)
			if (!pendingRows.length) return
			this.handleLoading = true
			Promise.all(pendingRows.map(item => handleFeedback({ id: item.id, handleRemark: this.handleRemark }))).then(results => {
				const failed = results.find(item => item.code !== 200)
				if (failed) {
					this.$message.error(failed.msg || '处理失败')
					return
				}
				this.$message.success('处理成功')
				this.detailVisible = false
				this.getList()
			}).finally(() => {
				this.handleLoading = false
			})
		},
		parseImages(imageUrls) {
			if (!imageUrls) return []
			try {
				const parsed = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls
				return Array.isArray(parsed) ? parsed.map(item => this.buildImageUrl(item)).filter(Boolean) : []
			} catch (e) {
				return []
			}
		},
		buildImageUrl(url) {
			if (!url) return ''
			if (url.indexOf('http') === 0) return url
			const base = process.env.VUE_APP_BASE_API || ''
			return base + (url.indexOf('/') === 0 ? url : '/' + url)
		},
		formatExtraFields(extraFields) {
			const list = this.formatExtraFieldList(extraFields)
			return list.length ? list.map(item => `${item.label}: ${item.value}`).join('；') : '-'
		},
		formatExtraFieldList(extraFields) {
			if (!extraFields) return []
			try {
				const obj = typeof extraFields === 'string' ? JSON.parse(extraFields) : extraFields
				if (!obj || typeof obj !== 'object') return []
				return Object.keys(obj).filter(k => obj[k] !== undefined && obj[k] !== null && obj[k] !== '').map(k => ({
					key: k,
					label: this.extraFieldLabels[k] || k,
					value: obj[k]
				}))
			} catch (e) {
				return []
			}
		},
		buildParentRows(rows) {
			const groups = []
			const groupMap = {}
			rows.forEach(row => {
				const key = this.getGroupKey(row)
				if (!groupMap[key]) {
					groupMap[key] = {
						...row,
						groupKey: key,
						issueRows: [],
						issueCount: 0,
						descriptionSummary: ''
					}
					groups.push(groupMap[key])
				}
				groupMap[key].issueRows.push(row)
			})
			groups.forEach(group => {
				group.issueCount = group.issueRows.length
				group.status = group.issueRows.some(item => Number(item.status) === 0) ? 0 : 1
				group.descriptionSummary = group.issueRows.map(item => item.subTypeName).filter(Boolean).join('、')
				group.createTime = group.issueRows[0] && group.issueRows[0].createTime
			})
			return groups
		},
		getGroupKey(row) {
			if (row.batchId) return row.batchId
			const timeKey = this.formatGroupTime(row.createTime)
			return [
				row.userId || '',
				row.contactPhone || '',
				row.typeId || '',
				row.extraFields || '',
				timeKey
			].join('|')
		},
		formatGroupTime(time) {
			if (!time) return ''
			return parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') || String(time)
		}
	}
}
</script>

<style scoped>
.child-table {
	margin: 8px 48px 8px 88px;
	width: calc(100% - 136px);
}

.drawer-body {
	height: calc(100vh - 150px);
	overflow-y: auto;
	padding: 0 24px 112px;
	box-sizing: border-box;
	background: #f5f7fa;
}

.summary-card,
.issue-detail-card {
	border: 1px solid #ebeef5;
	border-radius: 10px;
	background: #fff;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary-card {
	padding: 20px;
}

.summary-card__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding-bottom: 16px;
	border-bottom: 1px solid #ebeef5;
}

.summary-card__title {
	font-size: 18px;
	font-weight: 600;
	color: #303133;
	line-height: 1;
}

.summary-card__sub {
	margin-top: 8px;
	font-size: 13px;
	color: #909399;
}

.status-wrap {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	min-height: 28px;
}

.summary-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;
	padding-top: 18px;
}

.summary-item span,
.extra-section__label,
.detail-label {
	display: block;
	margin-bottom: 6px;
	font-size: 13px;
	color: #909399;
	font-weight: 400;
}

.summary-item b {
	font-size: 14px;
	color: #303133;
	word-break: break-all;
}

.extra-section {
	margin-top: 18px;
	padding-top: 16px;
	border-top: 1px solid #ebeef5;
}

.extra-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.extra-tag {
	display: inline-flex;
	align-items: center;
	border-radius: 4px;
	overflow: hidden;
	border: 1px solid #dcdfe6;
	background: #fafafa;
}

.extra-tag span {
	padding: 5px 8px;
	color: #909399;
	background: #f5f7fa;
	border-right: 1px solid #dcdfe6;
	font-size: 12px;
}

.extra-tag b {
	padding: 5px 10px;
	color: #303133;
	font-size: 12px;
	font-weight: 400;
}

.empty-text {
	color: #c0c4cc;
	font-size: 13px;
}

.issue-detail-list {
	margin-top: 20px;
}

.issue-detail-card {
	padding: 18px;
	margin-bottom: 16px;
}

.issue-card-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-weight: 600;
	margin-bottom: 16px;
	color: #303133;
}

.issue-card-title__left {
	display: flex;
	align-items: center;
	min-width: 0;
}

.issue-index {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 22px;
	height: 22px;
	margin-right: 8px;
	border-radius: 50%;
	background: #409eff;
	color: #fff;
	font-size: 12px;
	font-weight: 600;
}

.detail-block {
	margin-top: 14px;
}

.detail-value {
	line-height: 22px;
	color: #606266;
	white-space: pre-wrap;
	word-break: break-all;
}

.detail-meta {
	margin-top: 10px;
	font-size: 13px;
	color: #909399;
}

.detail-row {
	margin-top: 14px;
}

.img-list {
	display: flex;
	flex-wrap: wrap;
	margin-top: 8px;
}

.drawer-footer {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding: 16px 24px;
	background: #fff;
	border-top: 1px solid #ebeef5;
	box-sizing: border-box;
}

.handle-input {
	flex: 1;
	margin-right: 16px;
}

::v-deep .feedback-detail-drawer .el-drawer__body {
	position: relative;
	height: 100%;
	overflow: hidden;
}
</style>
