<template>
    <el-dialog :title="dialogTitle" :visible.sync="visible" width="50%">
      <el-form ref="form" :model="formData" label-width="100px">
        <el-form-item label="互联机构" prop="organizationId">
          <el-select style="width: 100%;" class="filter-item" v-model="formData.organizationId" filterable clearable placeholder="请选择互联机构" disabled>
              <el-option
                  v-for="item in organizeList"
                  :key='item.id'
                  :label="item.name"
                  :value="item.id">
              </el-option>
          </el-select>
        </el-form-item>
  
        <el-form-item label="机构类型" prop="orgType">
          <el-radio-group v-model="formData.orgType" disabled>
            <el-radio :label="3">流量平台</el-radio>
            <el-radio :label="4">监管平台</el-radio>
          </el-radio-group>
        </el-form-item>
  
        <el-form-item label="电站维度">
          <el-radio-group v-model="formData.stationScopeType">
            <el-radio :label="2">按电站</el-radio>
            <!-- <el-radio :label="3">按电站分组</el-radio> -->
          </el-radio-group>
        </el-form-item>
  
        <el-form-item label="选择电站" prop="selectedStations" v-if="formData.stationScopeType === 2">
          <div class="station-select-box">
            <div class="search-bar">
              <!-- <el-checkbox v-model="checkAll" @change="handleCheckAll">全选</el-checkbox> -->
              <el-input v-model="searchKey" placeholder="请输入关键字进行过滤" clearable></el-input>
              <el-button type="primary" @click="filterTree">搜索</el-button>
            </div>
            <el-tree
              ref="stationTree"
              :data="filteredStations"
              show-checkbox
              node-key="id"
              :props="defaultProps"
              :default-expand-all="true"
              :filter-node-method="filterNode"
              @check-change="handleCheck"
            ></el-tree>
          </div>
        </el-form-item>
      </el-form>
  
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </el-dialog>
</template>
  
<script>
    import {
        getChargingStationList
    } from '@/api/netWorkDot/netWorkDotList.js'
    import {
      getOrganize,
      getAvailableStation,
      saveAvailableStation
    } from '@/api/organization/organization.js'
    export default {
        data() {
            return {
                visible: false,
                dialogTitle: "站点推送",
                searchKey: "",
                checkAll: false,
                formData: {
                  organizationId: '',
                  orgType: '',
                  stationScopeType: 2,
                  dataId: [],
                },
                stations: [],
                filteredStations: [],
                defaultProps: {
                  children: 'children',
                  label: 'networkName'
                },
                organizeList: [],
                chargeStationList: []
            };
        },
        watch: {
          searchKey() {
            this.filterTree();
          },
        },
        methods: {
            initTreeData(operatorId,operatorName){
              getChargingStationList(operatorId).then(res => {
                let treeData = {
                  id: parseInt(operatorId),
                  networkName: operatorName,
                  networkAddress: "",
                  children: res.data
                }
                let treeList = [treeData]
                this.stations = treeList
                console.log("stations:",this.stations)
                this.filteredStations = JSON.parse(JSON.stringify(this.stations));
              })
            },
            getOrganize(){
              let data = {orgMold: 2}
              getOrganize(data).then(res => {
                this.organizeList = res.data
              })
            },
            getAvailableStation(organizationId){
              getAvailableStation(organizationId).then(res => {
                if (res.code == 200){
                  this.formData = res.data
                  this.$nextTick(() => {
                    this.$refs.stationTree.setCheckedKeys(res.data.dataId)
                  })
                }
              })
            },
            openDialog(data) {
              this.visible = true;
              this.getOrganize()
              this.getAvailableStation(data.organizationId)
              this.initTreeData(data.operatorId,data.operatorName)
            },
            filterNode(value, data) {
              if (!value) return true;
              return data.networkName.includes(value);
            },
            filterTree() {
              this.$refs.stationTree.filter(this.searchKey);
            },
            handleCheck(data, checked) {
              const selected = this.$refs.stationTree.getCheckedKeys();
              console.log("selected:",selected)
              this.formData.dataId = selected;
              this.checkAll = selected.length === this.getAllStationIds().length;
            },
            handleCheckAll(val) {
              if (val) {
                this.$refs.stationTree.setCheckedKeys(this.getAllStationIds());
              } else {
                this.$refs.stationTree.setCheckedKeys([]);
              }
              this.formData.chargeStationId = val ? this.getAllStationIds() : [];
            },
            getAllStationIds() {
              return this.stations.flatMap(parent => parent.children.map(child => child.id));
            },
            handleSubmit() {
              // const keys = [
              //   ...this.$refs.stationTree.getCheckedKeys(),
              //   ...this.$refs.stationTree.getHalfCheckedKeys()
              // ];
              let data = this.formData
              if (data.dataId.length == 0) {
                this.$message.error('请选择可用的充电站点')
                return false
              }
              this.$refs.form.validate(valid => {
                if (valid) {
                  console.log("提交数据:", data);
                  saveAvailableStation(data).then(res => {
                    if (res.code == 200) {
                      this.visible = false;
                    } else {
                      this.$message.error(res.msg)
                    }
                  })
                }
              });
            },
        },
    };
</script>
  
  <style scoped>
  .dialog-footer {
    text-align: right;
  }
  .station-select-box {
    border: 0.2px solid gray;
    padding: 10px;
    border-radius: 4px;
  }
  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .search-bar .el-input {
    flex: 1;
  }
  .error-text {
    color: gray;
    font-size: 12px;
    margin-top: 5px;
    display: block;
  }
  </style>