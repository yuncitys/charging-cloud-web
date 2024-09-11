<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.content" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入物联卡号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-select v-model="listQuery.status" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择状态" clearable @change="handleFilter">
				<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange"
				format="yyyy-MM-dd" value-format="yyyy-MM-dd">
			</el-date-picker>
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
      	icon="el-icon-search">
        查询
      </el-button>

			<div style="margin: 15px 0;">
        <!-- 新增 -->
        <el-button style="margin-right: 20px ;" type="primary" class="filter-item"
          @click="onOpenWindows" v-if="btnAuthen.permsVerifAuthention(':iot:card:save')">
          添加物联网卡
        </el-button>

        <!-- 模板下载 -->
        <el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="handleDownloadTemplate"
        	:loading="downloadLoading" icon="el-icon-download" v-if="btnAuthen.permsVerifAuthention(':iot:card:upload')">
          模板下载
        </el-button>

        <!--批量导入-->
        <uploadExcel @getLists="getLists"/>
			</div>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
        <!-- <el-table-column label="运营商" prop="wxName" align="center" :show-overflow-tooltip="isPc">
        </el-table-column> -->
        <el-table-column label="卡号" prop="iccid" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
        <el-table-column label="msisdn" prop="msisdn" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
				<el-table-column label="IMSI" prop="imsi" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
        <el-table-column label="运营商" prop="channelName"  align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
        <el-table-column label="可使用流量（M）" prop="packageCanUsage"  align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
        <el-table-column label="已使用流量（M）" prop="packageHasUsage"  align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
				<el-table-column label="状态" prop="cardStatus"  align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<el-tag v-if="scope.row.cardStatus == 0">未开卡</el-tag>
						<el-tag v-if="scope.row.cardStatus == 2">沉默期</el-tag>
						<el-tag v-if="scope.row.cardStatus == 4">已停机</el-tag>
            <el-tag v-if="scope.row.cardStatus == 5">已断网</el-tag>
            <el-tag v-if="scope.row.cardStatus == 8">待激活</el-tag>
            <el-tag v-if="scope.row.cardStatus == 9">正常使用</el-tag>
            <el-tag v-if="scope.row.cardStatus == 20">期满,关停</el-tag>
            <el-tag v-if="scope.row.cardStatus == 21">已回收状态</el-tag>
            <el-tag v-if="scope.row.cardStatus == 80">未知</el-tag>
            <el-tag v-if="scope.row.cardStatus == 99">已删除</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="remark" label="备注" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" sortable :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
        <el-table-column prop="updateTime" label="更新时间" align="center" sortable :show-overflow-tooltip='isPc'>
        	<template slot-scope="scope">
        		<span>{{ scope.row.updateTime | formatDate }}</span>
        	</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="320">
        	<template slot-scope="scope">
        		<div style="display: flex;justify-content: center;align-items: center;">
              <!-- 编辑 -->
              <editPage :row_data="scope.row"  @getLists="getLists" />

              <!-- 详情 -->
              <div v-if="btnAuthen.permsVerifAuthention(':iot:card:info')" style="margin-left: 10px;"  size="mini">
              	<card-info :row_data="scope.row"></card-info>
              </div>

        			<el-button type="danger" @click="remove(scope.row.id)" style="margin-left: 10px;" size="mini"
                  v-if="btnAuthen.permsVerifAuthention(':iot:card:delete')"> 删除
        			</el-button>
        		</div>
        	</template>
        </el-table-column>
			</el-table>

			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>

      <addPage ref="addPage" @getLists="getLists" />
		</div>
	</div>
</template>

<script>
	import {
		getList,
    remove,
    add,
    update,
    upload
	} from '@/api/iotCard/iotCard.js'
	import {
		parseTime
	} from '@/utils/index'
  import addPage from './components/addPage.vue'
  import editPage from './components/editPage.vue'
  import uploadExcel from './components/uploadExcel.vue'
  import cardInfo from './components/cardInfo.vue'
	export default {
		name: 'iotCard',
    components: {
    	addPage,
    	editPage,
    	uploadExcel,
      cardInfo
    },
		data() {
			return {
				listLoading: true,
        downloadLoading: false,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
          content:'',
          status:'',
					createTimeStart: '',
					createTimeEnd: ''
				},
				tableKey: 0,
        time: '',
				tags: [
          {
						id: '0',
						title: '未开卡'
					},
					{
						id: '2',
						title: '沉默期'
					},
					{
						id: '4',
						title: '已停机'
					},
          {
          	id: '5',
          	title: '已断网'
          },
          {
          	id: '8',
          	title: '待激活'
          },
          {
          	id: '9',
          	title: '正常使用'
          },
          {
          	id: '20',
          	title: '期满,关停'
          },
          {
          	id: '21',
          	title: '已回收状态'
          },
          {
          	id: '80',
          	title: '未知'
          }
				]
			}
		},
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			},
		},
		mounted() {

		},
		methods: {
			getLists() {
				this.listLoading = true
				let listQuery = JSON.parse(JSON.stringify(this.listQuery))
				if (listQuery.createTimeStart == null) {
					listQuery.createTimeStart = ''
				}
				if (listQuery.createTimeEnd == null) {
					listQuery.createTimeEnd = ''
				}
				getList(listQuery).then(res => {
					if (res.code == 200) {
						console.log(res)
						this.list = res.data
						this.total = res.count
						this.listLoading = false
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getLists()
			},
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getLists()
			},
			dateChange(e) {
				if (e) {
					this.listQuery.createTimeStart = e[0]
					this.listQuery.createTimeEnd = e[1]
				} else {
					this.listQuery.createTimeStart = ''
					this.listQuery.createTimeEnd = ''
				}
				this.handleFilter()
			},
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
      //模板下载
      handleDownloadTemplate() {
        this.downloadLoading = true
      	import('@/vendor/Export2Excel').then(excel => {
      		const tHeader = ['iccid', 'imsi', 'msisdn', '运营商','可使用流量(M)','已使用流量(M)','备注']
      		const data = []
      		excel.export_json_to_excel({
      			header: tHeader,
      			data,
      			filename: '物联网卡导入模板'
      		})
      		this.downloadLoading = false
      	})
      },
      //打开新增
      onOpenWindows(){
        this.$nextTick(() => {
        	this.$refs.addPage.openSave()
        })
      },
      //删除操作
      remove(iotCardId) {
      	this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
      		confirmButtonText: '是',
      		cancelButtonText: '否',
      		type: 'warning'
      	}).then(() => {
      		let data = {
      			iotCardId
      		}
      		console.log(data)
      		remove(data).then(res => {
      			if (res.code == 200) {
      				this.$message({
      					type: 'success',
      					message: res.msg
      				})
      				this.getLists()
      			} else {
      				this.$message.error(res.msg)
      			}
      		})
      	})
      },
		},
		created() {
			this.getLists()
		},
	}
</script>
