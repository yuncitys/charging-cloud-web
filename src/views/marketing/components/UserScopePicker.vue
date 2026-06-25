<template>
  <div class="user-scope-picker">
    <template v-if="userScope === '1'">
      <div class="user-scope-picker__toolbar">
        <el-checkbox v-model="selectAllCustomers" :disabled="!selectableFlat.length" @change="toggleAllCustomers">全选</el-checkbox>
        <el-input v-model="customerKeyword" placeholder="请输入关键字进行过滤" clearable size="small" style="width: 220px;" />
        <el-button type="primary" size="small" @click="loadCustomers">搜索</el-button>
      </div>
      <el-tree
        ref="customerTree"
        :data="customerTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'name', children: 'children', disabled: 'disabled' }"
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
import { userGroupOptions } from '@/api/marketing/marketing'
import { getChargingOrganizationTree } from '@/api/chargingCustomer/index'

const ORGANIZATION_TREE_CATEGORIES = [
  { id: 'platform', name: '平台机构' },
  { id: 'internal', name: '内部子公司' },
  { id: 'inter', name: '互联机构' },
  { id: 'customer-root', name: '客户机构' }
]

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
      selectableFlat: [],
      userGroupOptions: [],
      selectedGroupIds: [],
      phoneText: '',
      syncing: false,
      userGroupLoading: false,
      userGroupLoaded: false
    }
  },
  watch: {
    userScope: {
      immediate: true,
      handler(val) {
        this.resetFromValue()
        if (val === '2') {
          this.loadUserGroupOptions()
        } else if (val === '1') {
          this.loadCustomers()
        }
      }
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
  methods: {
    normalizeGroupId(id) {
      if (id == null || id === '') return null
      const num = Number(id)
      return Number.isFinite(num) ? num : String(id)
    },
    matchGroupId(a, b) {
      if (a == null || b == null) return false
      return String(a) === String(b)
    },
    findUserGroupOption(id) {
      return this.userGroupOptions.find(x => this.matchGroupId(x.id, id))
    },
    loadUserGroupOptions() {
      if (this.userGroupLoading || this.userGroupLoaded) return
      this.userGroupLoading = true
      userGroupOptions().then(res => {
        this.userGroupOptions = res.data || []
        this.userGroupLoaded = true
        if (this.userScope === '2') {
          this.resetFromValue()
        }
      }).finally(() => {
        this.userGroupLoading = false
      })
    },
    isSelectableOrgId(id) {
      if (id == null || id === '') return false
      const num = Number(id)
      if (!Number.isFinite(num)) return false
      return this.selectableFlat.some(item => Number(item.id) === num)
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
      const params = {}
      if (this.customerKeyword) {
        params.keyword = this.customerKeyword
      }
      getChargingOrganizationTree(params).then(res => {
        const grouped = res.data || {}
        this.selectableFlat = ORGANIZATION_TREE_CATEGORIES.flatMap(category => grouped[category.name] || [])
        this.customerTree = ORGANIZATION_TREE_CATEGORIES.map(category => {
          const children = (grouped[category.name] || []).map(item => ({
            id: item.id,
            name: item.name,
            orgType: item.orgType,
            orgMold: item.orgMold,
            orgTypeName: item.orgTypeName,
            orgFinalType: item.orgFinalType
          }))
          return {
            id: category.id,
            name: category.name,
            disabled: children.length === 0,
            children
          }
        })
        this.$nextTick(() => this.applyCheckedKeys())
      })
    },
    applyCheckedKeys() {
      if (this.userScope !== '1' || !this.$refs.customerTree) return
      const keys = (this.value || [])
        .map(s => this.normalizeCustomerId(s.dataId))
        .filter(id => id != null)
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
        this.selectedGroupIds = scopes.map(s => {
          const option = this.findUserGroupOption(s.dataId)
          return option ? option.id : this.normalizeGroupId(s.dataId)
        }).filter(id => id != null)
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
        const keys = this.selectableFlat.map(c => c.id)
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
        .filter(n => this.isSelectableOrgId(n.id))
        .map(n => {
          const dataId = this.normalizeCustomerId(n.id)
          if (dataId == null) return null
          return {
            dataId,
            dataName: n.name,
            orgType: n.orgFinalType || n.orgMold || '1'
          }
        })
        .filter(Boolean)
      if (!this.scopesEqual(scopes, this.value)) {
        this.$emit('input', scopes)
      }
    },
    emitGroupScopes() {
      if (this.syncing) return
      const prevScopes = this.value || []
      const scopes = this.selectedGroupIds.map(id => {
        const g = this.findUserGroupOption(id)
        const prev = prevScopes.find(s => this.matchGroupId(s.dataId, id))
        const dataId = this.normalizeGroupId(id)
        return {
          dataId,
          dataName: g ? g.groupName : (prev && prev.dataName) || String(id),
          orgType: '2'
        }
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
          const hasCustomer = nodes.some(n => this.isSelectableOrgId(n.id) && this.normalizeCustomerId(n.id) != null)
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
