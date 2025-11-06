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
      <el-select v-model="queryParams.status" placeholder="请选择执行状态" clearable style="margin-right: 20px ;" class="filter-item">
        <el-option
          v-for="dict in sys_common_status"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
      <el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item" style="margin-right: 20px ;"
        start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange" format="yyyy-MM-dd" value-format="yyyy-MM-dd HH:mm:ss" 
        :default-time="['00:00:00', '23:59:59']">
      </el-date-picker>
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleQuery" icon="el-icon-search">
        查询
      </el-button>
      <el-button icon="el-icon-refresh" type="primary" style="margin-right: 20px ;" class="filter-item" @click="resetQuery">
        重置
      </el-button>

      <div style="margin: 15px 0;">
        <el-button
          style="margin-right: 20px ;" type="danger" class="filter-item"
          icon="el-icon-delete"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
        <el-button
          style="margin-right: 20px ;" type="danger" class="filter-item"
          icon="el-icon-delete"
          @click="handleClean"
        >清空</el-button>
        <!-- 导出Excel -->
			  <downExcel :queryData="queryParams" />
        <!-- <el-button
          style="margin-right: 20px ;" type="warning" class="filter-item"
          icon="el-icon-download"
          @click="handleExport"
        >导出</el-button> -->
        <!-- <el-button
          style="margin-right: 20px ;" type="warning" class="filter-item"
          icon="el-icon-close"
          @click="handleClose"
        >关闭</el-button> -->
      </div>

      <el-table v-loading="loading" :data="jobLogList" @selection-change="handleSelectionChange" element-loading-text="拼命加载中......"  fit
        highlight-current-row style="width: 100%;" align="center" id="tableBox">
        <el-table-column type="selection" width="60" align="center" />
        <!-- <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
        </el-table-column> -->
        <el-table-column label="日志编号" align="center" prop="jobLogId" />
        <el-table-column label="任务名称" align="center" prop="jobName" :show-overflow-tooltip="true" />
        <el-table-column label="任务组名" align="center" prop="jobGroup" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span v-if="scope.row.jobGroup === 'DEFAULT'">默认</span>
            <span v-if="scope.row.jobGroup === 'SYSTEM'">系统</span>
          </template>
        </el-table-column>
        <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
        <el-table-column label="日志信息" align="center" prop="jobMessage" :show-overflow-tooltip="true" />
        <el-table-column label="执行状态" align="center" prop="status">
          <template slot-scope="scope">
            <span v-if="scope.row.status === '0'">成功</span>
            <span v-if="scope.row.status === '1'">失败</span>
          </template>
        </el-table-column>
        <el-table-column label="执行时间" align="center" prop="createTime" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-view"
              @click="handleView(scope.row)"
            >详细</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination :current-page="queryParams.page" :page-sizes="[10,20,30, 50]" :page-size="queryParams.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <!-- 调度日志详细 -->
      <el-dialog title="调度日志详细" :visible.sync="open" width="700px" append-to-body>
        <el-form ref="form" :model="form" label-width="100px" size="mini">
          <el-row>
            <el-col :span="12">
              <el-form-item label="日志序号：">{{ form.jobLogId }}</el-form-item>
              <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务分组：">{{ form.jobGroup }}</el-form-item>
              <el-form-item label="执行时间：">{{ form.createTime }}</el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="调用方法：">{{ form.invokeTarget }}</el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="日志信息：">{{ form.jobMessage }}</el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="执行状态：">
                <div v-if="form.status == 0">正常</div>
                <div v-else-if="form.status == 1">失败</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="异常信息：" v-if="form.status == 1">{{ form.exceptionInfo }}</el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getJob} from "@/api/monitor/job";

import downExcel from './components/downJobLogExcel.vue'

import { listJobLog, delJobLog, cleanJobLog, exportExcel} from "@/api/monitor/jobLog";

import {
  parseTime,
  numTime,
  formatSeconds,
  getNowTime
} from '@/utils/index'

export default {
  name: "JobLog",
  components: {
    downExcel
  },
  data() {
    return {
      //时间查询
      time: '',
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
      sys_common_status:[
        {
          "label":'成功',
          "value":"0",
        },
        {
          "label":'失败',
          "value":"1",
        }
      ],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 调度日志表格数据
      jobLogList: [],
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        page: 1,
        limit: 10,
        jobName: '',
        jobGroup: '',
        status: '',
        createTimeStart: '',
        createTimeEnd: ''
      }
    };
  },
  created() {
    // const jobId = this.$route.params && this.$route.params.jobId;
    const jobId = this.$route.query.jobId;
    if (jobId !== undefined && jobId != 0) {
      getJob(jobId).then(response => {
        this.queryParams.jobName = response.data.jobName;
        this.queryParams.jobGroup = response.data.jobGroup;
        this.getList();
      });
    } else {
      this.getList();
    }
  },
  methods: {
    //日期查询参数
    dateChange(e) {
    	if (e) {
    		this.queryParams.createTimeStart = e[0]
    		this.queryParams.createTimeEnd = e[1]
    	} else {
    		this.queryParams.createTimeStart = ''
    		this.queryParams.createTimeEnd = ''
    	}
    	this.getList()
    },
    /** 查询调度日志列表 */
    getList() {
      this.loading = true;
      listJobLog(this.queryParams).then(response => {
          this.jobLogList = response.data;
          this.total = response.count;
          this.loading = false;
        }
      );
    },
    // 返回按钮
    handleClose() {
      const obj = { path: "/monitor/job" };
      this.$tab.closeOpenPage(obj);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.time = '',
      this.queryParams = {
        page: 1,
        limit: 10,
        jobName: '',
        jobGroup: '',
        status: '',
        createTimeStart: '',
        createTimeEnd: ''
      }
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.jobLogId);
      this.multiple = !selection.length;
    },
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true;
      this.form = row;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const jobLogIds = this.ids;
      this.$confirm('是否确认删除调度日志编号为"' + jobLogIds + '"的数据项？','警告', {
      	confirmButtonText: '是',
      	cancelButtonText: '否',
      	type: 'warning'
      }).then(function() {
        return delJobLog(jobLogIds);
      }).then(() => {
        this.getList();
        this.$message.success("删除成功");
      }).catch(() => {});
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$confirm('是否确认清空所有调度日志数据项？','警告', {
      	confirmButtonText: '是',
      	cancelButtonText: '否',
      	type: 'warning'
      }).then(function() {
        return cleanJobLog();
      }).then(() => {
        this.getList();
        this.$message.success("清空成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      exportExcel(this.queryParams).then(res => {
      	let blob = res
      	let objectUrl = URL.createObjectURL(blob);
      	let a = document.createElement('a');
      	a.href = objectUrl;
      	let time = getNowTime()
      	a.download = `定时任务日志列表${time}.xlsx`
      	a.click();
      	this.downloadLoading = false
      })
      // this.download('schedule/job/log/export', {
      //   ...this.queryParams
      // }, `log_${new Date().getTime()}.xlsx`)
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
  }
};
</script>
