<template>
  <div class="reward-editor">
    <div v-for="(row, index) in innerList" :key="index" class="reward-editor__row">
      <el-button type="text" icon="el-icon-remove-outline" class="reward-editor__remove" @click="removeRow(index)" />
      <div class="reward-editor__fields">
        <div class="reward-editor__field">
          <span class="reward-editor__label">卡券</span>
          <el-select v-model="row.rewardId" filterable placeholder="请选择优惠券/抵用卡" style="width: 100%;">
            <el-option v-for="c in cardCouponOptions" :key="c.cardCouponId" :label="c.cardCouponName" :value="c.cardCouponId" />
          </el-select>
        </div>
        <div class="reward-editor__field reward-editor__field--short">
          <span class="reward-editor__label">数量</span>
          <el-input v-model.number="row.rewardCount" placeholder="请输入发送数量">
            <template slot="append">张/人</template>
          </el-input>
        </div>
      </div>
    </div>
    <el-button type="text" icon="el-icon-circle-plus-outline" class="reward-editor__add" @click="addRow">添加卡券</el-button>
  </div>
</template>

<script>
import { cardCouponPage } from '@/api/marketing/marketing'

export default {
  name: 'RewardEditor',
  props: {
    value: { type: Array, default: () => [] }
  },
  data() {
    return {
      cardCouponOptions: [],
      innerList: [],
      syncing: false
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(val) {
        this.syncing = true
        this.innerList = (val && val.length) ? val.map(r => ({ ...r })) : [this.emptyRow()]
        this.$nextTick(() => {
          this.syncing = false
        })
      }
    },
    innerList: {
      deep: true,
      handler(val) {
        if (this.syncing) return
        this.$emit('input', val.map(r => ({
          rewardType: '2',
          rewardId: r.rewardId,
          rewardCount: r.rewardCount || 1,
          rewardThreshold: r.rewardThreshold
        })))
      }
    }
  },
  created() {
    cardCouponPage({ page: 1, limit: 999, cancelFlag: '0' }).then(res => {
      this.cardCouponOptions = res.data || []
    })
  },
  methods: {
    emptyRow() {
      return { rewardType: '2', rewardId: '', rewardCount: 1 }
    },
    addRow() {
      this.innerList.push(this.emptyRow())
    },
    removeRow(index) {
      if (this.innerList.length <= 1) {
        this.$message.warning('至少保留一项卡券')
        return
      }
      this.innerList.splice(index, 1)
    },
    validate() {
      if (!this.innerList.length) return '请添加至少一项卡券'
      for (const row of this.innerList) {
        if (!row.rewardId) return '请选择卡券'
        if (!row.rewardCount || row.rewardCount < 1) return '请输入有效的发送数量'
      }
      return ''
    }
  }
}
</script>

<style scoped>
.reward-editor__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}
.reward-editor__remove {
  margin-top: 8px;
  color: #909399;
  font-size: 18px;
}
.reward-editor__fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.reward-editor__field {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
.reward-editor__label {
  flex-shrink: 0;
  width: 56px;
  padding: 0 12px;
  line-height: 36px;
  background: #f5f7fa;
  color: #606266;
  font-size: 13px;
  border-right: 1px solid #dcdfe6;
}
.reward-editor__field >>> .el-select,
.reward-editor__field >>> .el-input {
  flex: 1;
}
.reward-editor__field >>> .el-input__inner {
  border: none;
  border-radius: 0;
}
.reward-editor__field >>> .el-input-group__append {
  border: none;
  background: #f5f7fa;
}
.reward-editor__add {
  color: #409eff;
  padding-left: 0;
}
</style>
