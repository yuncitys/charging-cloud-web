<template>
  <div class="order-search-panel">
    <el-form :model="listQuery" label-width="96px" class="order-search-form" size="small" @submit.native.prevent>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="订单搜索">
            <el-input
              v-model="listQuery.orderCode"
              clearable
              :placeholder="listQuery.orderCodeType === 2 ? '请精确输入支付单号' : '请精确输入业务单号'"
              @keyup.enter.native="$emit('filter')"
              @clear="$emit('filter')"
            >
              <el-select slot="prepend" v-model="listQuery.orderCodeType" style="width: 108px;" @change="$emit('filter')">
                <el-option :value="1" label="业务单号" />
                <el-option :value="2" label="支付单号" />
              </el-select>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="充电站">
            <el-select
              v-model="listQuery.chargingStationIds"
              multiple
              filterable
              clearable
              collapse-tags
              placeholder="请选择充电站"
              style="width: 100%;"
              @change="$emit('filter')"
            >
              <el-option
                v-for="item in chargingStationList"
                :key="item.id"
                :label="item.networkName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="订单状态">
            <el-select v-model="listQuery.orderStatus" clearable placeholder="请选择订单状态" style="width: 100%;" @change="$emit('filter')">
              <el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <template v-if="searchExpanded">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="设备号">
              <el-input v-model="listQuery.deviceCode" clearable placeholder="请精确输入设备号" @keyup.enter.native="$emit('filter')" @clear="$emit('filter')" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="支付状态">
              <el-select v-model="listQuery.payStatus" clearable placeholder="请选择支付状态" style="width: 100%;" @change="$emit('filter')">
                <el-option v-for="item in payTags" :key="item.id" :label="item.title" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="设备类型">
              <el-select v-model="listQuery.electricOut" clearable placeholder="请选择设备类型" style="width: 100%;" @change="$emit('filter')">
                <el-option :value="0" label="交流" />
                <el-option :value="1" label="直流" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="用户ID">
              <el-input v-model="listQuery.userCode" clearable placeholder="请输入用户ID号" @keyup.enter.native="$emit('filter')" @clear="$emit('filter')" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="手机号">
              <el-input v-model="listQuery.phoneNumber" clearable placeholder="请输入手机号" @keyup.enter.native="$emit('filter')" @clear="$emit('filter')" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="车牌号">
              <el-input v-model="listQuery.plateNumber" clearable placeholder="请输入车牌号" @keyup.enter.native="$emit('filter')" @clear="$emit('filter')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="电卡编号">
              <el-input v-model="listQuery.cardNo" clearable placeholder="请输入电卡编号" @keyup.enter.native="$emit('filter')" @clear="$emit('filter')" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="企业名称">
              <el-input v-model="listQuery.companyName" clearable placeholder="请输入企业名称" @keyup.enter.native="$emit('filter')" @clear="$emit('filter')" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="VIN码">
              <el-input v-model="listQuery.vinCode" clearable placeholder="请输入VIN码" @keyup.enter.native="$emit('filter')" @clear="$emit('filter')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="时间类型">
              <el-select v-model="listQuery.timeQueryType" placeholder="请选择时间类型" style="width: 100%;" @change="$emit('filter')">
                <el-option :value="1" label="订单创建" />
                <el-option :value="2" label="订单开始" />
                <el-option :value="3" label="订单结束" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item :label="timeQueryTypeLabel">
              <el-date-picker
                :value="time"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                :default-time="['00:00:00', '23:59:59']"
                style="width: 100%;"
                @input="onTimeChange"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <div class="order-search-actions">
        <el-button size="small" @click="$emit('reset')">重置</el-button>
        <el-button type="primary" size="small" @click="$emit('filter')">筛选</el-button>
        <downExcel :query-data="listQuery" :export-keys="exportKeys" size="small" class="order-search-export" />
        <el-button type="text" size="small" class="order-search-toggle" @click="searchExpanded = !searchExpanded">
          {{ searchExpanded ? '收起' : '展开' }}
          <i :class="searchExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import downExcel from './downExcel.vue'

export default {
  name: 'OrderSearchPanel',
  components: {
    downExcel
  },
  props: {
    listQuery: {
      type: Object,
      required: true
    },
    time: {
      type: [Array, String],
      default: ''
    },
    chargingStationList: {
      type: Array,
      default: () => []
    },
    tags: {
      type: Array,
      default: () => []
    },
    payTags: {
      type: Array,
      default: () => []
    },
    exportKeys: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchExpanded: true
    }
  },
  computed: {
    timeQueryTypeLabel() {
      if (this.listQuery.timeQueryType === 2) return '订单开始时间'
      if (this.listQuery.timeQueryType === 3) return '订单结束时间'
      return '订单创建时间'
    }
  },
  methods: {
    onTimeChange(value) {
      this.$emit('update:time', value)
      this.$emit('date-change', value)
    }
  }
}
</script>

<style>
  .order-search-panel {
    background: #fff;
    padding: 0 0 8px;
    margin-bottom: 12px;
    border-radius: 4px;
  }

  .order-search-form .el-form-item {
    margin-bottom: 16px;
  }

  .order-search-form .el-form-item__label {
    color: #606266;
    font-weight: 400;
  }

  .order-search-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    padding-top: 4px;
    margin-top: 4px;
  }

  .order-search-export {
    display: inline-block;
  }

  .order-search-export .filter-item {
    margin-bottom: 0;
    margin-right: 0 !important;
  }

  .order-search-toggle {
    color: #606266;
    padding-right: 0;
  }
</style>
