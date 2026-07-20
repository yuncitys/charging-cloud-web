<template>
  <div class="card-coupon-scope-picker">
    <template v-if="scopeType === '1' || scopeType === '2'">
      <div class="card-coupon-scope-picker__toolbar">
        <el-checkbox v-model="selectAll" @change="toggleAll">全选</el-checkbox>
        <el-input v-model="keyword" placeholder="请输入关键字进行过滤" clearable size="small" style="width: 220px;" />
        <el-button type="primary" size="small" @click="loadStationTree">搜索</el-button>
      </div>
      <el-tree
        ref="stationTree"
        :data="stationTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'label', children: 'children' }"
        :filter-node-method="filterNode"
        default-expand-all
        class="card-coupon-scope-picker__tree"
        @check="emitStationIds"
      />
    </template>

    <template v-else-if="scopeType === '3'">
      <el-select
        v-model="innerGroupIds"
        multiple
        filterable
        placeholder="请选择电站分组"
        style="width: 100%;"
        @change="emitGroupIds"
      >
        <el-option v-for="g in stationGroupOptions" :key="g.id" :label="g.groupName" :value="Number(g.id)" />
      </el-select>
    </template>
  </div>
</template>

<script>
import { stationGroupOptions } from '@/api/marketing/marketing'
import { getChargeStationTreeByMerchant, getChargingStationList } from '@/api/netWorkDot/netWorkDotList'

export default {
  name: 'CardCouponScopePicker',
  props: {
    scopeType: { type: String, default: '2' },
    value: { type: Array, default: () => [] },
    groupIds: { type: Array, default: () => [] }
  },
  data() {
    return {
      keyword: '',
      selectAll: false,
      stationTree: [],
      stationLeafIds: [],
      stationGroupOptions: [],
      innerGroupIds: [],
      syncing: false,
      stationGroupLoading: false,
      stationGroupLoaded: false
    }
  },
  watch: {
    scopeType(val) {
      this.stationTree = []
      this.stationLeafIds = []
      if (val === '3') {
        this.loadStationGroupOptions(() => this.syncGroupIds(this.groupIds))
        return
      }
      this.loadStationTree()
    },
    value: {
      immediate: true,
      handler() {
        if (this.scopeType === '3') return
        this.$nextTick(() => this.applyCheckedKeys())
      }
    },
    groupIds: {
      immediate: true,
      handler(val) {
        if (this.scopeType === '3') {
          this.loadStationGroupOptions(() => this.syncGroupIds(val))
        } else {
          this.syncGroupIds(val)
        }
      }
    },
    keyword(val) {
      this.$refs.stationTree && this.$refs.stationTree.filter(val)
    }
  },
  created() {
    if (this.scopeType === '3') {
      this.loadStationGroupOptions(() => this.syncGroupIds(this.groupIds))
    } else {
      this.loadStationTree()
    }
  },
  methods: {
    syncGroupIds(val) {
      const source = val != null ? val : this.groupIds
      this.syncing = true
      this.innerGroupIds = (source || [])
        .map(id => Number(id))
        .filter(id => Number.isFinite(id))
      this.$nextTick(() => {
        this.syncing = false
      })
    },
    loadStationGroupOptions(done) {
      if (this.stationGroupLoaded) {
        typeof done === 'function' && done()
        return
      }
      if (this.stationGroupLoading) {
        this._pendingGroupOptionsCallback = done
        return
      }
      this.stationGroupLoading = true
      stationGroupOptions().then(res => {
        this.stationGroupOptions = res.data || []
        this.stationGroupLoaded = true
        typeof done === 'function' && done()
        if (typeof this._pendingGroupOptionsCallback === 'function') {
          this._pendingGroupOptionsCallback()
          this._pendingGroupOptionsCallback = null
        }
      }).finally(() => {
        this.stationGroupLoading = false
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return (data.label || '').indexOf(value) !== -1
    },
    loadStationTree() {
      if (this.scopeType === '3') return
      if (this.scopeType === '2') {
        getChargeStationTreeByMerchant({}).then(res => {
          if (!res || res.code !== 200) return
          const rows = res.data || []
          this.stationTree = rows.map(merchant => ({
            id: `merchant-${merchant.id}`,
            label: merchant.name,
            children: (merchant.chargingStationInfoVoList || []).map(station => ({
              id: String(station.id),
              label: station.networkName
            }))
          }))
          this.stationLeafIds = this.collectLeafIds(this.stationTree)
          this.$nextTick(() => this.applyCheckedKeys())
        })
        return
      }
      getChargingStationList({ page: 1, limit: 9999 }).then(res => {
        const list = res.data || []
        const cityMap = {}
        list.forEach(station => {
          const city = station.networkCity || '未分类城市'
          if (!cityMap[city]) cityMap[city] = []
          cityMap[city].push({
            id: String(station.id),
            label: station.networkName
          })
        })
        this.stationTree = Object.keys(cityMap).map(city => ({
          id: `city-${city}`,
          label: city,
          children: cityMap[city]
        }))
        this.stationLeafIds = this.collectLeafIds(this.stationTree)
        this.$nextTick(() => this.applyCheckedKeys())
      })
    },
    collectLeafIds(nodes) {
      const ids = []
      nodes.forEach(node => {
        if (node.children && node.children.length) {
          node.children.forEach(child => ids.push(child.id))
        }
      })
      return ids
    },
    applyCheckedKeys() {
      if (this.scopeType === '3' || !this.$refs.stationTree) return
      const keys = (this.value || []).map(String)
      this.syncing = true
      this.$refs.stationTree.setCheckedKeys(keys)
      this.$nextTick(() => {
        this.syncing = false
      })
    },
    idsEqual(a, b) {
      return JSON.stringify((a || []).map(String).sort()) === JSON.stringify((b || []).map(String).sort())
    },
    toggleAll(checked) {
      if (!this.$refs.stationTree) return
      this.$refs.stationTree.setCheckedKeys(checked ? this.stationLeafIds : [])
      this.emitStationIds()
    },
    emitStationIds() {
      if (this.syncing || !this.$refs.stationTree) return
      const nodes = this.$refs.stationTree.getCheckedNodes(true)
      const ids = nodes
        .map(n => n.id)
        .filter(id => id && !String(id).startsWith('merchant-') && !String(id).startsWith('city-'))
        .map(String)
      if (!this.idsEqual(ids, this.value)) {
        this.$emit('input', ids)
      }
    },
    emitGroupIds() {
      if (this.syncing) return
      const ids = this.innerGroupIds.map(id => Number(id))
      if (!this.idsEqual(ids, this.groupIds)) {
        this.$emit('update:groupIds', ids)
      }
    },
    validate() {
      if (this.scopeType === '3') {
        if (!this.innerGroupIds.length) return '请选择电站分组'
        return ''
      }
      if (!this.value || !this.value.length) return '请选择电站'
      return ''
    }
  }
}
</script>

<style scoped>
.card-coupon-scope-picker__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.card-coupon-scope-picker__tree {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 8px;
}
</style>
