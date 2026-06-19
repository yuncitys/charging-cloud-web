<template>
  <div class="recharge-tier-editor">
    <div v-for="(tier, tIndex) in tiers" :key="tIndex" class="recharge-tier-editor__tier">
      <div class="recharge-tier-editor__tier-head">
        <el-button type="text" icon="el-icon-remove-outline" @click="removeTier(tIndex)" />
        <div class="recharge-tier-editor__amount">
          <span class="recharge-tier-editor__label">充值</span>
          <el-input v-model.number="tier.threshold" placeholder="请输入金额" type="number">
            <template slot="append">元</template>
          </el-input>
        </div>
      </div>
      <div class="recharge-tier-editor__rewards">
        <div v-for="(row, rIndex) in tier.rewards" :key="rIndex" class="reward-editor__row">
          <el-button type="text" icon="el-icon-remove-outline" class="reward-editor__remove" @click="removeReward(tIndex, rIndex)" />
          <div class="reward-editor__fields">
            <div class="reward-editor__field">
              <span class="reward-editor__label">卡券</span>
              <el-select v-model="row.rewardId" filterable placeholder="请选择" style="width: 100%;">
                <el-option v-for="c in cardCouponOptions" :key="c.cardCouponId" :label="c.cardCouponName" :value="c.cardCouponId" />
              </el-select>
            </div>
            <div class="reward-editor__field reward-editor__field--short">
              <span class="reward-editor__label">数量</span>
              <el-input v-model.number="row.rewardCount" placeholder="数量">
                <template slot="append">张/人</template>
              </el-input>
            </div>
          </div>
        </div>
        <el-button type="text" icon="el-icon-circle-plus-outline" @click="addReward(tIndex)">添加卡券</el-button>
      </div>
    </div>
    <el-button type="primary" icon="el-icon-plus" class="recharge-tier-editor__add-tier" @click="addTier">添加充值梯度</el-button>
  </div>
</template>

<script>
import { cardCouponRewardOptions } from '@/api/marketing/marketing'

export default {
  name: 'RechargeTierEditor',
  props: {
    value: { type: Array, default: () => [] }
  },
  data() {
    return {
      cardCouponOptions: [],
      tiers: [],
      syncing: false
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(val) {
        this.syncing = true
        if (val && val.length) {
          this.tiers = val.map(t => ({
            threshold: t.threshold,
            rewards: (t.rewards || []).map(r => ({ ...r }))
          }))
        } else {
          this.tiers = [this.emptyTier()]
        }
        this.$nextTick(() => {
          this.syncing = false
        })
      }
    },
    tiers: {
      deep: true,
      handler(val) {
        if (this.syncing) return
        this.$emit('input', val)
      }
    }
  },
  created() {
    cardCouponRewardOptions().then(res => {
      this.cardCouponOptions = res.data || []
    })
  },
  methods: {
    emptyReward() {
      return { rewardType: '2', rewardId: '', rewardCount: 1 }
    },
    emptyTier() {
      return { threshold: '', rewards: [this.emptyReward()] }
    },
    addTier() {
      this.tiers.push(this.emptyTier())
    },
    removeTier(index) {
      if (this.tiers.length <= 1) {
        this.$message.warning('至少保留一个充值梯度')
        return
      }
      this.tiers.splice(index, 1)
    },
    addReward(tIndex) {
      this.tiers[tIndex].rewards.push(this.emptyReward())
    },
    removeReward(tIndex, rIndex) {
      if (this.tiers[tIndex].rewards.length <= 1) {
        this.$message.warning('每个梯度至少一项卡券')
        return
      }
      this.tiers[tIndex].rewards.splice(rIndex, 1)
    },
    /** 转为 API rewards 扁平列表 */
    toFlatRewards() {
      const list = []
      this.tiers.forEach(tier => {
        const threshold = Number(tier.threshold)
        tier.rewards.forEach(r => {
          list.push({
            rewardType: '2',
            rewardId: r.rewardId,
            rewardCount: r.rewardCount || 1,
            rewardThreshold: threshold
          })
        })
      })
      return list
    },
    /** 从 API rewards 还原梯队（供编辑回填） */
    parseTiersFromRewards(rewards) {
      if (!rewards || !rewards.length) return [{ threshold: '', rewards: [{ rewardType: '2', rewardId: '', rewardCount: 1 }] }]
      const map = {}
      rewards.forEach(r => {
        const key = String(r.rewardThreshold != null ? r.rewardThreshold : 0)
        if (!map[key]) map[key] = { threshold: r.rewardThreshold, rewards: [] }
        map[key].rewards.push({ rewardType: r.rewardType, rewardId: r.rewardId, rewardCount: r.rewardCount })
      })
      return Object.values(map)
    },
    validate() {
      if (!this.tiers.length) return '请添加充值梯度'
      for (const tier of this.tiers) {
        if (tier.threshold === '' || tier.threshold == null || Number(tier.threshold) <= 0) return '请输入有效的充值金额'
        if (!tier.rewards.length) return '每个梯度至少添加一项卡券'
        for (const r of tier.rewards) {
          if (!r.rewardId) return '请选择卡券'
          if (!r.rewardCount || r.rewardCount < 1) return '请输入有效的卡券数量'
        }
      }
      return ''
    }
  }
}
</script>

<style scoped>
.recharge-tier-editor__tier {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fafafa;
}
.recharge-tier-editor__tier-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  width: 100%;
}
.recharge-tier-editor__amount {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
.recharge-tier-editor__label {
  flex-shrink: 0;
  width: 56px;
  padding: 0 12px;
  line-height: 36px;
  background: #f5f7fa;
  color: #606266;
  font-size: 13px;
  border-right: 1px solid #dcdfe6;
}
.recharge-tier-editor__amount >>> .el-input {
  flex: 1;
  min-width: 0;
}
.recharge-tier-editor__amount >>> .el-input__inner {
  border: none;
}
.recharge-tier-editor__add-tier {
  width: 100%;
  margin-top: 4px;
}
.reward-editor__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}
.reward-editor__remove {
  margin-top: 8px;
  color: #909399;
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
  background: #fff;
}
.reward-editor__label {
  flex-shrink: 0;
  width: 56px;
  padding: 0 12px;
  line-height: 36px;
  background: #f5f7fa;
  font-size: 13px;
  border-right: 1px solid #dcdfe6;
}
.reward-editor__field >>> .el-input__inner {
  border: none;
}
</style>
