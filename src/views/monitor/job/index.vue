<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.jobName"
        placeholder="请输入任务名称"
        clearable
        style="width: 200px;margin-right: 20px ;" class="filter-item"
        @keyup.enter.native="handleQuery"
      />
      <el-select v-model="queryParams.jobGroup" placeholder="请选择任务组名" clearable style="margin-right: 20px ;" class="filter-item">
        <el-option
          v-for="dict in sys_job_group"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
      <el-select v-model="queryParams.status" placeholder="请选择任务状态" clearable style="margin-right: 20px ;" class="filter-item">
        <el-option
          v-for="dict in sys_job_status"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleQuery" icon="el-icon-search">
        查询
      </el-button>
      <el-button icon="el-icon-refresh" type="primary" style="margin-right: 20px ;" class="filter-item" @click="resetQuery">
        重置
      </el-button>

      <div style="margin: 15px 0;">
        <!-- 新增 -->
        <el-button
          style="margin-right: 20px ;" type="primary" class="filter-item"
          @click="handleAdd"
          v-if="btnAuthen.permsVerifAuthention(':monitor:job:add')"
        >新增</el-button>
        <el-button
          style="margin-right: 20px ;" type="primary" class="filter-item"
          :disabled="single"
          @click="handleUpdate"
          v-if="btnAuthen.permsVerifAuthention(':monitor:job:edit')"
        >修改</el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          class="filter-item"
          style="margin-right: 20px ;"
          :disabled="multiple"
          @click="handleDelete"
          v-if="btnAuthen.permsVerifAuthention(':monitor:job:remove')"
        >删除</el-button>
        <!-- <el-button
          type="warning"
          icon="el-icon-download"
          class="filter-item"
          style="margin-right: 20px ;"
          @click="handleExport"
          v-if="btnAuthen.permsVerifAuthention(':monitor:job:export')"
        >导出</el-button> -->
        <el-button
            type="info"
            icon="el-icon-s-operation"
            class="filter-item"
            style="margin-right: 20px ;"
            @click="handleJobLog"
            v-if="btnAuthen.permsVerifAuthention(':monitor:job:query')"
          >日志</el-button>
        </el-col>
      </div>


      <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange" element-loading-text="拼命加载中......"  fit
        highlight-current-row style="width: 100%;" align="center" id="tableBox">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
        </el-table-column>
        <el-table-column label="任务编号" width="100" align="center" prop="jobId" />
        <el-table-column label="任务名称" align="center" prop="jobName" :show-overflow-tooltip="true" />
        <el-table-column label="任务组名" align="center" prop="jobGroup">
          <template slot-scope="scope">
            <span v-if="scope.row.jobGroup === 'DEFAULT'">默认</span>
            <span v-if="scope.row.jobGroup === 'SYSTEM'">系统</span>
          </template>
        </el-table-column>
        <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
        <el-table-column label="cron执行表达式" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-if="btnAuthen.permsVerifAuthention(':monitor:job:edit')"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-if="btnAuthen.permsVerifAuthention(':monitor:job:remove')"
            >删除</el-button>
            <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)">
              <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="handleRun" icon="el-icon-caret-right"
                  v-if="btnAuthen.permsVerifAuthention(':monitor:job:changeStatus')">执行一次</el-dropdown-item>
                <el-dropdown-item command="handleView" icon="el-icon-view"
                  v-if="btnAuthen.permsVerifAuthention(':monitor:job:query')">任务详细</el-dropdown-item>
                <el-dropdown-item command="handleJobLog" icon="el-icon-s-operation"
                  v-if="btnAuthen.permsVerifAuthention(':monitor:job:query')">调度日志</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination :current-page="queryParams.page" :page-sizes="[10,20,30, 50]" :page-size="queryParams.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

    <!-- 添加或修改定时任务对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="任务名称" prop="jobName">
                <el-input v-model="form.jobName" placeholder="请输入任务名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务分组" prop="jobGroup">
                <el-select v-model="form.jobGroup" placeholder="请选择任务分组">
                  <el-option
                    v-for="dict in sys_job_group"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="invokeTarget">
                <span slot="label">
                  调用方法
                  <el-tooltip placement="top">
                    <div slot="content">
                      Bean调用示例：TaskService.params('参数')
                      <br />Class类调用示例：com.sharecharge.job.biz.task.TaskService.params('参数')
                      <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                    </div>
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </span>
                <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="cron表达式" prop="cronExpression">
                <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式">
                  <template slot="append">
                    <el-button type="primary" @click="handleShowCron">
                      生成表达式
                      <i class="el-icon-time el-icon--right"></i>
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="form.jobId !== undefined">
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio
                    v-for="dict in sys_job_status"
                    :key="dict.value"
                    :label="dict.value">
                    {{dict.label}}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="执行策略" prop="misfirePolicy">
                <el-radio-group v-model="form.misfirePolicy" size="small">
                  <el-radio-button label="1">立即执行</el-radio-button>
                  <el-radio-button label="2">执行一次</el-radio-button>
                  <el-radio-button label="3">放弃执行</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否并发" prop="concurrent">
                <el-radio-group v-model="form.concurrent" size="small">
                  <el-radio-button label="0">允许</el-radio-button>
                  <el-radio-button label="1">禁止</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>

      <el-dialog title="Cron表达式生成器" :visible.sync="openCron" append-to-body destroy-on-close class="scrollbar">
        <crontab @hide="openCron=false" @fill="crontabFill" :expression="expression"></crontab>
      </el-dialog>

      <!-- 任务日志详细 -->
      <el-dialog title="任务详细" :visible.sync="openView" width="700px" append-to-body>
        <el-form ref="form" :model="form" label-width="120px" size="mini">
          <el-row>
            <el-col :span="12">
              <el-form-item label="任务编号：">{{ form.jobId }}</el-form-item>
              <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务分组：">{{ form.jobGroup }}</el-form-item>
              <el-form-item label="创建时间：">{{ form.createTime }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="cron表达式：">{{ form.cronExpression }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="下次执行时间：">{{ form.nextValidTime }}</el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="调用目标方法：">{{ form.invokeTarget }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务状态：">
                <div v-if="form.status == 0">正常</div>
                <div v-else-if="form.status == 1">暂停</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否并发：">
                <div v-if="form.concurrent == 0">允许</div>
                <div v-else-if="form.concurrent == 1">禁止</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="执行策略：">
                <div v-if="form.misfirePolicy == 0">默认策略</div>
                <div v-else-if="form.misfirePolicy == 1">立即执行</div>
                <div v-else-if="form.misfirePolicy == 2">执行一次</div>
                <div v-else-if="form.misfirePolicy == 3">放弃执行</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="openView = false">关 闭</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from "@/api/monitor/job.js";
import Crontab from '@/components/Crontab'
import {
	parseTime
} from '@/utils/index'
export default {
  components: { Crontab },
  name: "Job",
  // dicts: ['sys_job_group', 'sys_job_status'],
  data() {
    return {
      //排序
      page: 1,
      limit: 10,
      //字典
      sys_job_group:
      [
        {
          "label":'默认',
          "value":"DEFAULT",
        },
        {
          "label":'系统',
          "value":"SYSTEM",
        }
      ],
      sys_job_status:
      [
        {
          "label":'正常',
          "value":"0",
        },
        {
          "label":'暂停',
        "value":"1",
        }
      ],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 定时任务表格数据
      jobList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示详细弹出层
      openView: false,
      // 是否显示Cron表达式弹出层
      openCron: false,
      // 传入的表达式
      expression: "",
      // 查询参数
      queryParams: {
        page: 1,
        limit: 10,
        jobName: '',
        jobGroup: '',
        status: ''
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        jobName: [
          { required: true, message: "任务名称不能为空", trigger: "blur" }
        ],
        invokeTarget: [
          { required: true, message: "调用目标字符串不能为空", trigger: "blur" }
        ],
        cronExpression: [
          { required: true, message: "cron执行表达式不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询定时任务列表 */
    getList() {
      this.loading = true;
      listJob(this.queryParams).then(response => {
        this.jobList = response.data;
        this.total = response.count;
        this.loading = false;
      });
    },
    // 任务组名字典翻译
    jobGroupFormat(row, column) {

    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        jobId: undefined,
        jobName: undefined,
        jobGroup: undefined,
        invokeTarget: undefined,
        cronExpression: undefined,
        misfirePolicy: 1,
        concurrent: 1,
        status: "0"
      };
      // this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      // this.resetForm("queryForm");
      this.queryParams.jobGroup = '',
      this.queryParams.jobName = '',
      this.queryParams.status = '',
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.jobId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleRun":
          this.handleRun(row);
          break;
        case "handleView":
          this.handleView(row);
          break;
        case "handleJobLog":
          this.handleJobLog(row);
          break;
        default:
          break;
      }
    },
    // 任务状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要' + text + '"' + row.jobName + '"任务吗？','警告', {
      	confirmButtonText: '是',
      	cancelButtonText: '否',
      	type: 'warning'
      }).then(function() {
        return changeJobStatus(row.jobId, row.status);
      }).then(() => {
        this.$message.success(text + "成功")
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    /* 立即执行一次 */
    handleRun(row) {
      this.$confirm('确认要立即执行一次"' + row.jobName + '"任务吗？','警告', {
      	confirmButtonText: '是',
      	cancelButtonText: '否',
      	type: 'warning'
      }).then(function() {
        return runJob(row.jobId, row.jobGroup);
      }).then(() => {
        this.$message.success("执行成功");
      }).catch(() => {});
    },
    /** 任务详细信息 */
    handleView(row) {
      getJob(row.jobId).then(response => {
        this.form = response.data;
        this.openView = true;
      });
    },
    /** cron表达式按钮操作 */
    handleShowCron() {
      this.expression = this.form.cronExpression;
      this.openCron = true;
    },
    /** 确定后回传值 */
    crontabFill(value) {
      this.form.cronExpression = value;
    },
    /** 任务日志列表查询 */
    handleJobLog(row) {
      // this.$router.push('/log/job')
      const jobId = row.jobId || 0;
      this.$router.push({
      	name: 'jobLog',
      	query: {
      		jobId: jobId
      	}
      })
      // this.$router.push('/log/job/' + jobId)
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加任务";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const jobId = row.jobId || this.ids;
      console.log("jobId",jobId)
      getJob(jobId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改任务";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.jobId != undefined) {
            let data = {
              jobId:this.form.jobId,
              jobName:this.form.jobName,
              jobGroup:this.form.jobGroup,
              invokeTarget:this.form.invokeTarget,
              cronExpression:this.form.cronExpression,
              misfirePolicy:this.form.misfirePolicy,
              concurrent:this.form.concurrent,
              status:this.form.status,
            }
            updateJob(data).then(response => {
              if(response.code == 200){
                this.open = false;
                this.$message.success("修改成功")
                this.getList();
              }else{
                this.open = true;
                this.$message.error(response.msg)
              }
            });
          } else {
            let data = {
              jobName:this.form.jobName,
              jobGroup:this.form.jobGroup,
              invokeTarget:this.form.invokeTarget,
              cronExpression:this.form.cronExpression,
              misfirePolicy:this.form.misfirePolicy,
              concurrent:this.form.concurrent,
              status:this.form.status,
            }
            addJob(data).then(response => {
              if(response.code == 200){
                this.open = false;
                this.$message.success("修改成功")
                this.getList();
              }else{
                this.open = true;
                this.$message.error(response.msg)
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const jobIds = row.jobId || this.ids;
      this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
      	confirmButtonText: '是',
      	cancelButtonText: '否',
      	type: 'warning'
      }).then(() => {
      	delJob(jobIds).then(res => {
      		if (res.code == 200) {
      			this.$message({
      				type: 'success',
      				message: '删除成功'
      			})
      			this.getList()
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('schedule/job/export', {
        ...this.queryParams
      }, `job_${new Date().getTime()}.xlsx`)
    },
    //分页
    handleSizeChange(val) {
      this.queryParams.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.getList()
    },
    //刷新表单
    resetForm(formName) {
    	this.$refs[formName].resetFields();
    },
  }
};
</script>
