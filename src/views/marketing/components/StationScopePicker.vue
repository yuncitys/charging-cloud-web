<template>
  <div class="station-scope-picker" :class="{ 'station-scope-picker--disabled': disabled }">
    <template v-if="stationScope === '1'">
      <div class="station-scope-picker__toolbar">
        <el-checkbox v-model="selectAll" :disabled="disabled || !stationLeafIds.length" @change="toggleAll">全选</el-checkbox>
        <el-input v-model="keyword" placeholder="请输入关键字进行过滤" clearable size="small" class="station-scope-picker__search" :disabled="disabled" />
        <el-button type="primary" size="small" :disabled="disabled" @click="loadScopeData">搜索</el-button>
      </div>
      <div v-if="disabled" class="station-scope-picker__empty-box">{{ pendingMerchantHint }}</div>
      <template v-else>
        <el-tree
          ref="merchantTree"
          :data="merchantTree"
          show-checkbox
          node-key="id"
          :props="{ label: 'name', children: 'children', disabled: 'disabled' }"
          :filter-node-method="filterNode"
          default-expand-all
          class="station-scope-picker__tree"
          @check="emitScopes"
        />
        <p v-if="!merchantTree.length || !stationLeafIds.length" class="station-scope-picker__hint">{{ emptyHint }}</p>
      </template>
    </template>

    <template v-else-if="stationScope === '2'">
      <el-select
        v-model="selectedGroupIds"
        multiple
        filterable
        placeholder="请选择电站分组"
        style="width: 100%;"
        :disabled="disabled"
        @change="emitGroupScopes"
      >
        <el-option v-for="g in stationGroupOptions" :key="g.id" :label="g.groupName" :value="g.id" />
      </el-select>
      <p v-if="disabled" class="station-scope-picker__hint">{{ pendingMerchantHint }}</p>
    </template>

    <template v-else-if="stationScope === '3'">
      <p class="station-scope-picker__hint">已选择全部电站，无需单独配置。</p>
    </template>
  </div>
</template>

<script>
import { stationGroupOptions } from '@/api/marketing/marketing'
import { getChargeStationTreeByMerchant } from '@/api/netWorkDot/netWorkDotList'

export default {
  name: 'StationScopePicker',
  props: {
    stationScope: { type: String, default: '1' },
    value: { type: Array, default: () => [] },
    merchantId: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    pendingMerchantHint: { type: String, default: '请先选择归属商户' }
  },
  data() {
    return {
      keyword: '',
      selectAll: false,
      merchantTree: [],
      stationLeafIds: [],
      stationGroupOptions: [],
      selectedGroupIds: [],
      syncing: false,
      stationGroupLoading: false,
      stationGroupLoaded: false
    }
  },
  computed: {
    restrictToMerchant() {
      return this.stationScope === '1' && !!this.merchantId
    },
    emptyHint() {
      return '暂无数据'
    }
  },
  watch: {
    disabled() {
      this.loadScopeData()
    },
    stationScope(val) {
      this.resetFromValue()
      this.loadScopeData()
      if (val === '2') {
        this.loadStationGroupOptions()
      }
    },
    merchantId() {
      if (this.stationScope !== '1') return
      this.loadScopeData()
    },
    value: {
      immediate: true,
      handler() {
        this.resetFromValue()
      }
    },
    keyword(val) {
      this.$refs.merchantTree && this.$refs.merchantTree.filter(val)
    }
  },
  created() {
    this.loadScopeData()
  },
  methods: {
    loadStationGroupOptions() {
      if (this.stationGroupLoading || this.stationGroupLoaded) return
      this.stationGroupLoading = true
      stationGroupOptions().then(res => {
        this.stationGroupOptions = res.data || []
        this.stationGroupLoaded = true
      }).finally(() => {
        this.stationGroupLoading = false
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return (data.name || '').indexOf(value) !== -1
    },
    loadScopeData() {
      if (this.stationScope !== '1') return
      if (this.disabled) {
        this.merchantTree = []
        this.stationLeafIds = []
        return
      }
      const params = {}
      if (this.restrictToMerchant) {
        params.merchantId = Number(this.merchantId)
      }
      getChargeStationTreeByMerchant(params).then(res => {
        const rows = (res && res.code === 200) ? (res.data || []) : []
        this.merchantTree = this.buildMerchantStationTree(rows)
        this.stationLeafIds = this.collectStationLeafIds(this.merchantTree)
        this.$nextTick(() => this.applyCheckedKeys())
      })
    },
    buildMerchantStationTree(rows) {
      return rows.map(merchant => {
        const children = (merchant.chargingStationInfoVoList || []).map(station => ({
          id: station.id,
          name: station.networkName,
          ruleId: station.ruleId,
          stationOperatorId: merchant.id
        }))
        return {
          id: `merchant-${merchant.id}`,
          name: merchant.name,
          disabled: children.length === 0,
          children
        }
      })
    },
    collectStationLeafIds(nodes) {
      const ids = []
      nodes.forEach(node => {
        if (node.children && node.children.length) {
          node.children.forEach(child => ids.push(child.id))
        }
      })
      return ids
    },
    applyCheckedKeys() {
      if (this.stationScope !== '1' || !this.$refs.merchantTree) return
      const keys = (this.value || []).map(s => s.dataId).filter(Boolean)
      this.syncing = true
      this.$refs.merchantTree.setCheckedKeys(keys)
      this.$nextTick(() => {
        this.syncing = false
      })
    },
    resetFromValue() {
      const scopes = this.value || []
      this.syncing = true
      if (this.stationScope === '2') {
        this.selectedGroupIds = scopes.map(s => s.dataId)
        this.$nextTick(() => {
          this.syncing = false
        })
      } else if (this.stationScope === '1') {
        this.$nextTick(() => this.applyCheckedKeys())
      } else {
        this.syncing = false
      }
    },
    scopesEqual(a, b) {
      return JSON.stringify(a || []) === JSON.stringify(b || [])
    },
    toggleAll(checked) {
      if (!this.$refs.merchantTree) return
      this.$refs.merchantTree.setCheckedKeys(checked ? this.stationLeafIds : [])
      this.emitScopes()
    },
    emitScopes() {
      if (this.disabled || this.syncing || !this.$refs.merchantTree) return
      const nodes = this.$refs.merchantTree.getCheckedNodes(true)
      const scopes = nodes
        .filter(n => typeof n.id === 'number')
        .map(n => ({
          dataId: n.id,
          dataName: n.name,
          stationType: n.ruleId != null ? String(n.ruleId) : '',
          stationOperatorId: n.stationOperatorId
        }))
      if (!this.scopesEqual(scopes, this.value)) {
        this.$emit('input', scopes)
      }
    },
    emitGroupScopes() {
      if (this.disabled || this.syncing) return
      const scopes = this.selectedGroupIds.map(id => {
        const g = this.stationGroupOptions.find(x => x.id === id)
        return { dataId: id, dataName: g ? g.groupName : '', stationType: '3' }
      })
      if (!this.scopesEqual(scopes, this.value)) {
        this.$emit('input', scopes)
      }
    },
    validate() {
      if (this.stationScope === '3') return ''
      if (this.disabled) return this.pendingMerchantHint
      if (!this.value || !this.value.length) return '请选择适用电站范围'
      return ''
    }
  }
}
</script>

<style scoped>
.station-scope-picker__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.station-scope-picker__search {
  flex: 1;
  min-width: 0;
}
.station-scope-picker__tree {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 8px;
}
.station-scope-picker__hint {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
.station-scope-picker__empty-box {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 16px;
  font-size: 13px;
  color: #909399;
  background: #fafafa;
}
.station-scope-picker--disabled .station-scope-picker__toolbar {
  opacity: 0.65;
}
</style>
