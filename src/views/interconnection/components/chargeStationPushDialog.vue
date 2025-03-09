<template>
    <el-dialog :title="dialogTitle" :visible.sync="visible" width="50%">
      <el-form ref="form" :model="formData" label-width="100px" :rules="rules">
        <el-form-item label="客户名称">
          <el-input v-model="formData.organizationName" disabled></el-input>
        </el-form-item>
  
        <el-form-item label="客户类别">
          <el-input v-model="formData.organizationType" disabled></el-input>
        </el-form-item>
  
        <el-form-item label="电站维度">
          <el-radio-group v-model="formData.stationType">
            <el-radio :label="0">按电站</el-radio>
            <el-radio :label="1">全部电站</el-radio>
          </el-radio-group>
        </el-form-item>
  
        <el-form-item label="选择电站" prop="selectedStations" v-if="formData.stationType === 0">
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
        <el-button type="primary" @click="handleSubmit">推送</el-button>
      </div>
    </el-dialog>
</template>
  
<script>
    import {
        getChargingStationList
    } from '@/api/netWorkDot/netWorkDotList.js'
    export default {
        data() {
            return {
                visible: false,
                dialogTitle: "站点推送",
                searchKey: "",
                checkAll: false,
                formData: {
                    organizationName: "资金清算平台",
                    organizationType: "流量平台",
                    stationType: 0,
                    selectedStations: [],
                },
                stations: [],
                filteredStations: [],
                rules: {
                    selectedStations: [{ required: true, message: "请选择电站", trigger: "change" }],
                },
                defaultProps: {
					children: 'children',
					label: 'networkName'
				},
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
                const data = {
                    ruleId: 2,
                    adminId: operatorId
                }
                getChargingStationList(data).then(res => {
                    let treeData = {
                        id: parseInt(operatorId),
                        networkName: operatorName,
                        networkAddress: "",
                        children: res.data
                    }
                    let treeList = [treeData]
                    this.stations = treeList
                    console.log("stations",this.stations)
                    this.filteredStations = JSON.parse(JSON.stringify(this.stations));
                })
            },
            openDialog(data) {
                this.visible = true;
                this.initTreeData(data.operatorId,data.operatorName)
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.label.includes(value);
            },
            filterTree() {
                this.$refs.stationTree.filter(this.searchKey);
            },
            handleCheck(data, checked) {
                const selected = this.$refs.stationTree.getCheckedKeys();
                this.formData.selectedStations = selected;
                this.checkAll = selected.length === this.getAllStationIds().length;
            },
            handleCheckAll(val) {
                if (val) {
                    this.$refs.stationTree.setCheckedKeys(this.getAllStationIds());
                } else {
                    this.$refs.stationTree.setCheckedKeys([]);
                }
                this.formData.selectedStations = val ? this.getAllStationIds() : [];
            },
            getAllStationIds() {
                return this.stations.flatMap(parent => parent.children.map(child => child.id));
            },
            handleSubmit() {
                this.$refs.form.validate(valid => {
                    if (valid) {
                    console.log("提交数据:", this.formData);
                    this.visible = false;
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