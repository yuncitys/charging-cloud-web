<template>
  <div class="user-scope-picker">
    <template v-if="userScope === '1'">
      <div class="user-scope-picker__toolbar">
        <el-checkbox v-model="selectAllCustomers" @change="toggleAllCustomers">全选</el-checkbox>
        <el-input v-model="customerKeyword" placeholder="请输入关键字进行过滤" clearable size="small" style="width: 220px;" />
        <el-button type="primary" size="small" @click="loadCustomers">搜索</el-button>
      </div>
      <el-tree
        ref="customerTree"
        :data="customerTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
        :filter-node-method="filterCustomerNode"
        default-expand-all
        class="user-scope-picker__tree"
        @check="emitCustomerScopes"
      />
    </template>

    <template v-else-if="userScope === '2'">
      <el-select v-model="selectedGroupIds" multiple filterable placeholder="请选择用户分组" style="width: 100%;" @change="emitGroupScopes">
        <el-option v-for="g in userGroupOptions" :key="g.id" :label="g.groupName" :value="g.id" />
      </el-select>
    </template>

    <template v-else-if="userScope === '3'">
      <p class="user-scope-picker__hint">已选择全部用户，无需单独配置。</p>
    </template>

    <template v-else-if="userScope === '4'">
      <el-input v-model="phoneText" type="textarea" :rows="6" placeholder="每行一个手机号" @input="emitPhoneScopes" />
    </template>
  </div>
</template>

<script>
import { userGroupPage } from '@/api/marketing/marketing'
import { getChargingCustomerPage } from '@/api/chargingCustomer/index'

export default {
  name: 'UserScopePicker',
  props: {
    userScope: { type: String, default: '1' },
    value: { type: Array, default: () => [] },
    emptyHint: { type: String, default: '请选择发放用户' }
  },
  data() {
    return {
      customerKeyword: '',
      selectAllCustomers: false,
      customerTree: [],
      customerFlat: [],
      userGroupOptions: [],
      selectedGroupIds: [],
      phoneText: '',
      syncing: false
    }
  },
  watch: {
    userScope() {
      this.resetFromValue()
    },
    value: {
      immediate: true,
      handler() {
        this.resetFromValue()
      }
    },
    customerKeyword(val) {
      this.$refs.customerTree && this.$refs.customerTree.filter(val)
    }
  },
  created() {
    this.loadCustomers()
    userGroupPage({ page: 1, limit: 999 }).then(res => {
      this.userGroupOptions = res.data || []
    })
  },
  methods: {
    isCustomerLeafId(id) {
      if (id == null || id === '') return false
      const key = String(id)
      return !['platform', 'internal', 'inter', 'customer-root'].includes(key)
    },
    normalizeCustomerId(id) {
      const num = Number(id)
      return Number.isFinite(num) ? num : null
    },
    filterCustomerNode(value, data) {
      if (!value) return true
      return (data.name || '').indexOf(value) !== -1
    },
    loadCustomers() {
      getChargingCustomerPage({ page: 1, limit: 9999 }).then(res => {
        const list = res.data || []
        this.customerFlat = list
        this.customerTree = [
          { id: 'platform', name: '平台机构', disabled: true, children: [] },
          { id: 'internal', name: '内部子公司', disabled: true, children: [] },
          { id: 'inter', name: '互联机构', disabled: true, children: [] },
          {
            id: 'customer-root',
            name: '客户机构',
            children: list.map(item => ({
              id: item.id,
              name: item.name || item.companyName,
              orgType: '1'
            }))
          }
        ]
        this.$nextTick(() => this.applyCheckedKeys())
      })
    },
    applyCheckedKeys() {
      if (this.userScope !== '1' || !this.$refs.customerTree) return
      const keys = (this.value || []).map(s => s.dataId).filter(Boolean)
      this.syncing = true
      this.$refs.customerTree.setCheckedKeys(keys)
      this.$nextTick(() => {
        this.syncing = false
      })
    },
    resetFromValue() {
      const scopes = this.value || []
      this.syncing = true
      if (this.userScope === '2') {
        this.selectedGroupIds = scopes.map(s => s.dataId)
      } else if (this.userScope === '4') {
        this.phoneText = scopes.map(s => s.dataName).join('\n')
      } else {
        this.$nextTick(() => this.applyCheckedKeys())
      }
      this.$nextTick(() => {
        if (this.userScope !== '1') {
          this.syncing = false
        }
      })
    },
    scopesEqual(a, b) {
      return JSON.stringify(a || []) === JSON.stringify(b || [])
    },
    toggleAllCustomers(checked) {
      if (!this.$refs.customerTree) return
      if (checked) {
        const keys = this.customerFlat.map(c => c.id)
        this.$refs.customerTree.setCheckedKeys(keys)
      } else {
        this.$refs.customerTree.setCheckedKeys([])
      }
      this.emitCustomerScopes()
    },
    emitCustomerScopes() {
      if (this.syncing || !this.$refs.customerTree) return
      const nodes = this.$refs.customerTree.getCheckedNodes(true)
      const scopes = nodes
        .filter(n => this.isCustomerLeafId(n.id))
        .map(n => {
          const dataId = this.normalizeCustomerId(n.id)
          if (dataId == null) return null
          return {
            dataId,
            dataName: n.name,
            orgType: '1'
          }
        })
        .filter(Boolean)
      if (!this.scopesEqual(scopes, this.value)) {
        this.$emit('input', scopes)
      }
    },
    emitGroupScopes() {
      if (this.syncing) return
      const scopes = this.selectedGroupIds.map(id => {
        const g = this.userGroupOptions.find(x => x.id === id)
        return { dataId: id, dataName: g ? g.groupName : '', orgType: '2' }
      })
      if (!this.scopesEqual(scopes, this.value)) {
        this.$emit('input', scopes)
      }
    },
    emitPhoneScopes() {
      if (this.syncing) return
      const scopes = this.phoneText.split('\n').map(s => s.trim()).filter(Boolean).map((phone, idx) => ({
        dataId: idx + 1,
        dataName: phone,
        orgType: '4'
      }))
      if (!this.scopesEqual(scopes, this.value)) {
        this.$emit('input', scopes)
      }
    },
    validate() {
      if (this.userScope === '3') return ''
      if (this.userScope === '4') {
        if (!this.phoneText.trim()) return '请输入指定用户手机号'
        return ''
      }
      if (this.userScope === '1') {
        if (this.$refs.customerTree) {
          this.emitCustomerScopes()
          const nodes = this.$refs.customerTree.getCheckedNodes(true)
          const hasCustomer = nodes.some(n => this.isCustomerLeafId(n.id) && this.normalizeCustomerId(n.id) != null)
          if (!hasCustomer) return this.emptyHint
          return ''
        }
      }
      if (this.userScope === '2') {
        if (!this.selectedGroupIds.length) return this.emptyHint
        return ''
      }
      if (!this.value || !this.value.length) return this.emptyHint
      return ''
    }
  }
}
</script>

<style scoped>
.user-scope-picker__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.user-scope-picker__tree {
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 8px;
}
.user-scope-picker__hint {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
</style>
