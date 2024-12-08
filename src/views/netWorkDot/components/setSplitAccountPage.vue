<template>
	<div style="display: inline-block;">
		<el-button type="primary" style="margin-left: 10px;" @click="showformData()" size="mini"
			v-if="btnAuthen.permsVerifAuthention(':web:splitAccount:save')">
      设置分成
		</el-button>
		<!-- 编辑 -->
		<el-dialog :visible.sync="dialogVisible" title="设置分成" @close="dialogVisible = false" :append-to-body="true" width="60%">
			<!-- 温馨提示 -->
      <div>
        <p style="color: orange;">温馨提示1：分成比例仅需填写整数（如：想分60%给某个用户则填“60”）；若不需分成给第三方人员，请设置100%给站点归属方。</p>
        <p style="color: orange;">温馨提示2：所有分成比例的总和必须等于100。</p>
        <p style="color: orange;">温馨提示3：添加了电费收取人，则优先结算电费，剩余金额再进行分成。</p>
      </div>
      <!-- 表格 -->
      <el-table :data="tableData" border style="width: 100%; margin-top: 10px;"  v-loading="loading" element-loading-text="loading……">
        <el-table-column prop="adminId" label="收款人（收款账号）" width="385">
          <template #default="scope">
            <el-select v-model="scope.row.adminId" placeholder="请选择收款人" style="width: 100%;">
              <el-option
                v-for="item in payeeList"
                :key="item.id"
                :label="item.adminFullname + '(' + item.adminName + ')'"
                :value="item.id"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column prop="splitRate" label="分成比例(%)" width="150">
          <template #default="scope">
            <el-input
              v-model="scope.row.splitRate"
              placeholder="请输入分成比例"
              style="width: 100%;"
            />
          </template>
        </el-table-column>

        <el-table-column prop="isHost" label="是否主分成人" width="150">
          <template #default="scope">
            <el-radio
              :label="true"
              v-model="scope.row.isHost"
              @change="handleMainChange(scope.$index)">是</el-radio>
            <el-radio :label="false" v-model="scope.row.isHost">否</el-radio>
          </template>
        </el-table-column>

        <el-table-column prop="remark" label="备注" width="200">
          <template #default="scope">
            <el-input
              v-model="scope.row.remark"
              placeholder="请输入备注"
              style="width: 100%;"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.$index)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 表格底部操作 -->
      <div style="margin: 10px 0;">
        <el-button type="primary" @click="addRow">+ 新增分成人员</el-button>
        <el-link type="primary" style="margin-left: 10px;">点击此处去创建收款账号</el-link>
      </div>

      <!-- 弹窗底部 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveData">保存</el-button>
      </div>
		</el-dialog>
	</div>
</template>

<script>
	import {
    getSplitAccount,
    saveOrUpdate
	} from '@/api/orderSplitAccount/orderSplitAccount.js'
	import {
	  getAgent
	} from '@/api/agent/agentList.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'orderSplitAccount',
		components: {

		},
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			return {
				dialogVisible: false, // 弹窗是否显示
				loading: false, // 表格加载状态
				tableData: [], // 表格数据
        payeeList: [] ,// 收款人下拉列表
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
			showformData() {
				let scope = this.row_data
				this.dialogVisible = true
				this.getAgentList(),
        this.getSplitAccount(scope.id)
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
      getAgentList() {
      	getAgent().then(res => {
      		if (res.code == 200) {
      			this.payeeList = res.data
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      getSplitAccount(networkDotId) {
        let data = {
          networkDotId
        }
      	getSplitAccount(data).then(res => {
      		if (res.code == 200) {
            if (res.data.length === 0){
              this.tableData = [{networkDotId: networkDotId, adminId: '', splitRate: '', isHost: true, remark: '' }]
            }else{
              this.tableData = res.data
            }
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      // 添加一行
      addRow() {
        let previous = this.tableData.length - 1 < 0 ? 0 : this.tableData.length - 1;
        if(this.tableData[previous].adminId == ''){
          this.$message.error('请选择收款帐号')
          return false
        }
        if(this.tableData[previous].splitRate == ''){
          this.$message.error('请设置分成比例')
          return false
        }
        this.tableData.push({networkDotId: this.row_data.id, adminId: '', splitRate: '', isHost: false, remark: '' });
      },
      // 删除一行
      handleDelete(index) {
        this.tableData.splice(index, 1);
      },
      // 处理主分成人选项
      handleMainChange(selectedIndex) {
        // 遍历表格数据，确保只有一行的 isMain 为 true
        this.tableData.forEach((item, index) => {
          item.isHost = index === selectedIndex; // 只有当前选中的行是 true
        });
      },
      // 保存数据
      saveData() {
        let data = this.tableData
        let networkDotId = this.row_data.id
        console.log('充电站',networkDotId,'保存的数据：',this.tableData);
        saveOrUpdate(networkDotId,data).then(res => {
        	if (res.code == 200) {
            this.dialogVisible = false;
        		this.$message.success(res.msg)
            this.$emit('getLists')
        	} else {
            this.dialogVisible = true;
        		this.$message.error(res.msg)
        	}
        })

      }
		},
		created() {

		},
	}
</script>

<style>
	.el-dialog {
		display: flex;
		flex-direction: column;
		margin: 0 !important;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		/*height:600px;*/
		max-height: calc(100% - 30px);
		max-width: calc(100% - 30px);
	}

	.el-dialog .el-dialog__body {
		flex: 1;
		overflow: auto;

	}

  /* 添加表格内容对齐的样式 */
  .el-table .el-table-column {
    text-align: center;
  }
</style>
