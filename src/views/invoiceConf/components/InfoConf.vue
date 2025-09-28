<template>
  <transition name="el-zoom-in-center">
    <div>
      <div class="edit-preview-main" v-show="isAdd">
        <div class="common-page-header">
          <el-page-header @back="goBack" :content="'开票信息配置'"/>
          <div class="options">
            <el-button type="primary" @click="addOrUpdateHandle(null)" v-if="btnAuthen.permsVerifAuthention(':invoiceLoginConfig:save')">新增</el-button>
          </div>
        </div>

        <div class="common-page-main">
          <el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
            <el-table-column type="index" width="55" label="序号" align="center">
              <template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
            </el-table-column>
            <el-table-column prop="name" label="用户名" width="150"/>
            <el-table-column prop="account" label="账号" width="150"/>
            <el-table-column prop="taxNumber" label="企业税号" width="150"/>
            <el-table-column prop="telephoneNumber" label="联系电话" width="150"/>
            <el-table-column prop="roleType" label="开票身份" width="150">
              <template v-slot="scope">
                {{ getRoleLabel(scope.row.roleType) }}
              </template>
            </el-table-column>
            <el-table-column prop="channelFlag" label="线路标识" width="150">
              <template v-slot="scope">
                {{ getChannelLabel(scope.row.channelFlag) }}
              </template>
            </el-table-column>
            <el-table-column prop="regionCode" label="地区编码" width="150"/>
            <el-table-column prop="status" label="状态" width="120">
              <template v-slot="scope">
                <el-tag effect="dark" type="info" v-if="scope.row.status == 1">禁用</el-tag>
                <el-tag effect="dark" type="success" v-else>启用</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="150"/>
            <el-table-column prop="createUser" label="创建用户" width="150"/>
            <el-table-column prop="updateTime" label="修改时间" width="150"/>
            <el-table-column prop="updateUser" label="修改用户" width="150"/>
            <el-table-column label="操作" fixed="right" width="180">
              <template v-slot="scope">
                <el-button type="text" @click="viewDetails(scope.row)" >查看</el-button>
                <el-button type="text" @click="addOrUpdateHandle(scope.row)" 
                  v-if="btnAuthen.permsVerifAuthention(':invoiceLoginConfig:update')">编辑</el-button>
                <el-button type="text" class="smart-table-delBtn" @click="handleDel(scope.row.id)"
                  v-if="btnAuthen.permsVerifAuthention(':invoiceLoginConfig:delete')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination :current-page="searchForm.page" :page-sizes="[10,20,30, 50]" :page-size="searchForm.limit"
              :total="total" background layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>

      <LoginConfForm ref="loginForm" v-show="!isAdd" :isAdd="isAdd"></LoginConfForm>
    </div>
  </transition>
</template>

<script>
import LoginConfForm from './InfoForm'
import { page as getList,del,update } from '@/api/invoiceConf/loginConf'
export default {
  name: 'LoginConf',
  components: {LoginConfForm},
  data() {
    return {
      isAdd: true,
      param: {
        title: '新增',
        id: ''
      },
      searchForm: {
        page: 1,
				limit: 10,
        taxNumber:''
      },
      roleTypeList:[],
      channelFlagList:[
        { 'fullName': '线路一', 'enCode': '1' }, 
        { 'fullName': '线路二', 'enCode': '2' }, 
        { 'fullName': '线路三', 'enCode': '3' }
      ],
      query:null,

      page: 1,
      limit: 10,
      total: 10,
      tableKey: 0,
      listLoading: false,
      list: [],
    }
  },
  created() {
  },
  methods: {
    handleSizeChange(val) {
      this.searchForm.limit = val
      this.getLists()
    },
    handleCurrentChange(val) {
      this.searchForm.page = val
      this.getLists()
    },
    handleFilter() {
      this.searchForm.page = 1
      this.getLists()
    },
    getLists() {
      this.listLoading = true
      let listQuery = JSON.parse(JSON.stringify(this.searchForm))
      console.log("listQuery:",listQuery)
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
    initData(data){
      this.query = data;
      this.searchForm.taxNumber = this.query.taxNumber;
      this.searchForm.page = 1
      this.search();
      if (data.type === 3){
        this.getWqRoleList();
      } else if (data.type === 4){
        this.getPtRoleList();
      }
    },
    goBack() {
      this.$parent.isShowInfoConf = true;
    },
    getRoleLabel(encode){
      let label = '';
      this.roleTypeList.forEach(item => {
        if(item.enCode == encode){
          label = item.fullName;
        }
      });
      return label;
    },
    getChannelLabel(encode){
      let label = '';
      this.channelFlagList.forEach(item => {
        if(item.enCode == encode){
          label = item.fullName;
        }
      });
      return label;
    },
    getPtRoleList(){
      this.roleTypeList = [
        { 'fullName': '法定代表人', 'enCode': '01' }, 
        { 'fullName': '财务负责人', 'enCode': '02' },
        { 'fullName': '办税员', 'enCode': '03' }, 
        { 'fullName': '涉税服务人员', 'enCode': '04' }, 
        { 'fullName': '管理员', 'enCode': '05' }, 
        { 'fullName': '领票人', 'enCode': '07' }, 
        { 'fullName': '开票员', 'enCode': '09' }, 
        { 'fullName': '其他人员', 'enCode': '99' },
      ]
    },
    getWqRoleList(){
      this.roleTypeList = [
        { 'fullName': '法定代表人', 'enCode': '2' }, 
        { 'fullName': '财务负责人', 'enCode': '1' },
        { 'fullName': '办税员', 'enCode': '3' }, 
        { 'fullName': '购票员', 'enCode': '4' }, 
        { 'fullName': '普通管理员', 'enCode': '5' }, 
        { 'fullName': '社保经办人', 'enCode': '8' }, 
        { 'fullName': '开票员', 'enCode': '7' }, 
        { 'fullName': '销售人员', 'enCode': '10' },
      ]
    },
    search() {
      this.getLists()
    },
    addOrUpdateHandle(data) {
      this.isAdd = false
      this.$refs.loginForm.initInfo(data,this.query);
    },
    handleDel(id) {
      this.$confirmUtil.confirm('此操作将删除此数据', () => {
        del(id).then(res => {
          this.$message.success(res.msg)
          this.search()
        })
      })
    },
    viewDetails(row){
      this.isAdd = false
      // this.$refs.loginForm.reset();
      this.$refs.loginForm.viewDetail(row);
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-preview-main {
  position: absolute;
  top: 15px;
  right: 15px;
  bottom: 0px;
  left: 15px;
  height: calc(100vh - 100px);
  background: rgba(255, 255, 255, 1);
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.common-page-header {
  padding: 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;

  .options {
    flex-shrink: 0;
    margin-left: auto;
  }

  .el-page-header {
    .el-page-header__left {
      flex-shrink: 0;
    }

    .el-page-header__content {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.common-page-main {
  padding: 20px;
  height: 100%;

  .common-title {
    border-bottom: 1px solid #dcdfe6;
    overflow: hidden;

    h3 {
      font-size: 14px;
      line-height: 32px;
      float: left;
      padding: 0;
      margin: 0;
    }
  }
}

.table-actions {
  cursor: pointer;
  text-align: center;
  border: 1px dashed rgba(0, 0, 255, 0.51);

  &:active {
    border: 1px dashed rgba(0, 0, 255, 1);
  }
}
.activity-img{
  position: relative;
  width: 150px;
  height: 150px;
  .del-icon{
    position: absolute;
    right: -12px;
    top: -12px;
    width: 24px;
    height: 24px;
    background-color: #fff;
    border-radius: 12px;
    cursor: pointer;
  }
  .el-icon-error{
    font-size: 24px;
    color:#ff0000 ;
    
  }
}
.avatar-uploader {
  >>> .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #409EFF;
    }
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 150px;
    height: 150px;
    line-height: 150px;
    text-align: center;
  }
}
</style>
