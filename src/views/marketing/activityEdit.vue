<template>
  <div class="app-container marketing-page">
    <div class="marketing-page-header__back">
      <el-button type="text" icon="el-icon-arrow-left" @click="goBack">返回活动列表</el-button>
    </div>

    <div v-if="typeMeta" class="marketing-type-badge">
      <i :class="typeMeta.icon" class="marketing-type-badge__icon" />
      <span class="marketing-type-badge__label">{{ isEdit ? '编辑' : '新建' }}{{ typeMeta.label }}</span>
    </div>

    <div class="marketing-wizard">
      <el-steps :active="step" finish-status="success" align-center style="margin-bottom: 24px;">
        <el-step title="基础信息" />
        <el-step v-if="hasSubConfigStep" title="规则配置" />
        <el-step title="奖励配置" />
        <el-step v-if="hasScopeStep" title="适用范围" />
        <el-step title="确认提交" />
      </el-steps>

      <div v-loading="loading">
        <!-- 基础信息 -->
        <el-form v-show="step === 0" ref="basicForm" :model="activity" :rules="basicRules" label-width="120px" style="max-width: 720px;">
          <el-form-item label="活动名称" prop="activityName">
            <el-input v-model="activity.activityName" placeholder="请输入活动名称" maxlength="50" show-word-limit />
          </el-form-item>
          <el-form-item label="活动类型">
            <el-input :value="typeMeta ? typeMeta.label : ''" disabled />
          </el-form-item>
          <el-form-item label="发起方" prop="activityInitiator">
            <el-radio-group v-model="activity.activityInitiator">
              <el-radio label="1">平台</el-radio>
              <el-radio label="2">商户</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="活动时间" prop="timeRange">
            <el-date-picker
              v-model="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%;"
              @change="onTimeRangeChange"
            />
          </el-form-item>
          <el-form-item label="活动介绍">
            <el-input v-model="activity.activityRemark" type="textarea" :rows="2" placeholder="向用户展示的简短说明" />
          </el-form-item>
          <el-form-item label="活动规则">
            <el-input v-model="activity.activityRule" type="textarea" :rows="3" placeholder="领取条件、使用限制等规则说明" />
          </el-form-item>
        </el-form>

        <!-- 类型专属规则 -->
        <el-form v-show="step === 1 && hasSubConfigStep" label-width="140px" style="max-width: 720px;">
          <template v-if="activity.activityType === '2'">
            <el-form-item label="限领周期">
              <el-select v-model="subConfig.limitType">
                <el-option v-for="item in limitTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="限领次数">
              <el-input-number v-model="subConfig.limitCount" :min="1" />
            </el-form-item>
          </template>

          <template v-if="activity.activityType === '3'">
            <el-form-item label="发放方式">
              <el-radio-group v-model="subConfig.sendType">
                <el-radio v-for="item in sendTypeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="subConfig.sendType === '2'" label="发放时间">
              <el-date-picker v-model="subConfig.sendTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
            <el-form-item label="用户范围">
              <el-select v-model="subConfig.userScope">
                <el-option v-for="item in activityUserScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </template>

          <template v-if="activity.activityType === '4'">
            <el-form-item label="满N度可领">
              <el-input-number v-model="subConfig.limitPower" :min="0" :precision="2" />
              <span class="field-hint">度</span>
            </el-form-item>
            <el-form-item label="限领周期">
              <el-select v-model="subConfig.limitType">
                <el-option v-for="item in limitTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="限领次数">
              <el-input-number v-model="subConfig.limitCount" :min="1" />
            </el-form-item>
            <el-form-item label="电站范围">
              <el-select v-model="subConfig.stationScope">
                <el-option v-for="item in stationScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户范围">
              <el-select v-model="subConfig.userScope">
                <el-option v-for="item in standardUserScopeOptions" :key="'u'+item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </template>

          <template v-if="activity.activityType === '5'">
            <el-form-item label="活动标题">
              <el-input v-model="subConfig.activityTitle" placeholder="扫码页展示标题" />
            </el-form-item>
            <el-form-item label="活动图片">
              <el-input v-model="subConfig.activityImage" placeholder="图片 URL" />
            </el-form-item>
            <el-form-item label="限领周期">
              <el-select v-model="subConfig.limitType">
                <el-option v-for="item in limitTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="限领次数">
              <el-input-number v-model="subConfig.limitCount" :min="1" />
            </el-form-item>
            <el-form-item label="用户范围">
              <el-select v-model="subConfig.userScope">
                <el-option v-for="item in pairUserScopeOptions" :key="'p'+item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </template>

          <template v-if="activity.activityType === '6'">
            <el-form-item label="券码发放总量">
              <el-input-number v-model="subConfig.sendTotalCount" :min="1" />
            </el-form-item>
            <el-form-item label="用户范围">
              <el-select v-model="subConfig.userScope">
                <el-option v-for="item in standardUserScopeOptions" :key="'u'+item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </template>
        </el-form>

        <!-- 奖励 -->
        <div v-show="rewardStepIndex === step">
          <div class="marketing-tip">选择本活动发放的卡券及数量；充值活动可设置充值满额门槛。</div>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="addReward">添加奖励</el-button>
          <el-table :data="rewards" border style="width: 100%; margin-top: 12px;">
            <el-table-column label="卡券" min-width="220">
              <template slot-scope="scope">
                <el-select v-model="scope.row.rewardId" filterable placeholder="选择卡券" style="width: 100%;">
                  <el-option v-for="c in cardCouponOptions" :key="c.cardCouponId" :label="c.cardCouponName" :value="c.cardCouponId" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="120">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.rewardCount" :min="1" size="small" />
              </template>
            </el-table-column>
            <el-table-column v-if="typeMeta && typeMeta.showRewardThreshold" label="充值门槛(元)" width="150">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.rewardThreshold" :min="0" :precision="2" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template slot-scope="scope">
                <el-button type="text" @click="removeReward(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 适用范围（仅需要时展示） -->
        <el-form v-show="scopeStepIndex === step" label-width="120px" style="max-width: 720px;">
          <el-form-item v-if="showStationGroupSelect" label="电站分组">
            <el-select v-model="selectedStationGroupIds" multiple filterable placeholder="选择电站分组" style="width: 100%;">
              <el-option v-for="g in stationGroupOptions" :key="g.id" :label="g.groupName" :value="g.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="showUserGroupSelect" label="用户分组">
            <el-select v-model="selectedUserGroupIds" multiple filterable placeholder="选择用户分组" style="width: 100%;">
              <el-option v-for="g in userGroupOptions" :key="g.id" :label="g.groupName" :value="g.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="showSpecifiedUsers" label="指定用户">
            <el-input v-model="specifiedUserPhones" type="textarea" :rows="4" placeholder="每行一个手机号" />
          </el-form-item>
          <div v-if="!showStationGroupSelect && !showUserGroupSelect && !showSpecifiedUsers" class="marketing-tip">
            当前活动类型无需额外配置适用范围。
          </div>
        </el-form>

        <!-- 预览 -->
        <div v-show="previewStepIndex === step" class="preview-box">
          <el-descriptions title="活动预览" :column="1" border>
            <el-descriptions-item label="活动名称">{{ activity.activityName }}</el-descriptions-item>
            <el-descriptions-item label="活动类型">{{ typeMeta ? typeMeta.label : '' }}</el-descriptions-item>
            <el-descriptions-item label="发起方">{{ activity.activityInitiator === '1' ? '平台' : '商户' }}</el-descriptions-item>
            <el-descriptions-item label="活动时间">{{ activity.activityBeginTime }} ~ {{ activity.activityEndTime }}</el-descriptions-item>
            <el-descriptions-item label="奖励项">{{ rewards.length }} 项</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <div class="wizard-footer">
        <el-button v-if="step > 0" @click="step--">上一步</el-button>
        <el-button v-if="step < previewStepIndex" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="step === previewStepIndex" type="success" :loading="submitting" @click="handleSubmit">提交</el-button>
        <el-button @click="goBack">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  activityDetail, saveActivity, updateActivity,
  cardCouponRewardOptions, userGroupOptions, stationGroupOptions
} from '@/api/marketing/marketing'
import {
  getActivityTypeMeta,
  loadLimitTypeOptions,
  loadSendTypeOptions,
  loadActivityUserScopeOptions,
  loadActivityStationScopeOptions
} from './constants/activityTypes'
import './styles/marketing.scss'

export default {
  name: 'activityEdit',
  data() {
    return {
      step: 0,
      loading: false,
      submitting: false,
      timeRange: [],
      activity: {
        activityId: '',
        activityName: '',
        activityType: '',
        activityInitiator: '1',
        activityInitiatorId: '0',
        activityBeginTime: '',
        activityEndTime: '',
        activityRemark: '',
        activityRule: ''
      },
      subConfig: {},
      rewards: [],
      selectedStationGroupIds: [],
      selectedUserGroupIds: [],
      specifiedUserPhones: '',
      cardCouponOptions: [],
      limitTypeOptions: [],
      sendTypeOptions: [],
      activityUserScopeOptions: [],
      stationScopeOptions: [],
      stationGroupOptions: [],
      userGroupOptions: [],
      stationGroupLoaded: false,
      basicRules: {
        activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    standardUserScopeOptions() {
      return (this.activityUserScopeOptions || []).filter(o => ['1', '2', '3'].includes(String(o.value)))
    },
    pairUserScopeOptions() {
      return (this.activityUserScopeOptions || []).filter(o => ['1', '2'].includes(String(o.value)))
    },
    isEdit() {
      return !!this.$route.query.id
    },
    fixedType() {
      return this.$route.query.activityType || this.activity.activityType
    },
    typeMeta() {
      return getActivityTypeMeta(this.fixedType)
    },
    hasSubConfigStep() {
      const type = this.fixedType
      return type && type !== '1'
    },
    hasScopeStep() {
      return this.showStationGroupSelect || this.showUserGroupSelect || this.showSpecifiedUsers
    },
    showStationGroupSelect() {
      const type = this.fixedType
      if (type === '4') return this.subConfig.stationScope === '2'
      return false
    },
    showUserGroupSelect() {
      const type = this.fixedType
      const us = this.subConfig.userScope
      if (type === '1' || type === '2') return true
      if (type === '3' && us === '2') return true
      if (type === '4' && us === '2') return true
      if (type === '5' && us === '2') return true
      if (type === '6' && us === '2') return true
      return false
    },
    showSpecifiedUsers() {
      return this.fixedType === '3' && this.subConfig.userScope === '4'
    },
    rewardStepIndex() {
      return this.hasSubConfigStep ? 2 : 1
    },
    scopeStepIndex() {
      if (!this.hasScopeStep) return -1
      return this.rewardStepIndex + 1
    },
    previewStepIndex() {
      if (this.hasScopeStep) return this.scopeStepIndex + 1
      return this.rewardStepIndex + 1
    }
  },
  watch: {
    showStationGroupSelect(val) {
      if (val) {
        this.loadStationGroupOptions()
      }
    }
  },
  created() {
    loadLimitTypeOptions().then(list => { this.limitTypeOptions = list || [] })
    loadSendTypeOptions().then(list => { this.sendTypeOptions = list || [] })
    loadActivityUserScopeOptions().then(list => { this.activityUserScopeOptions = list || [] })
    loadActivityStationScopeOptions().then(list => { this.stationScopeOptions = list || [] })

    const type = this.$route.query.activityType
    if (!type && !this.$route.query.id) {
      this.$router.replace({ name: 'activityHub' })
      return
    }
    this.activity.activityType = type || ''
    this.loadOptions()
    if (this.isEdit) {
      this.loadDetail()
    } else {
      this.resetSubConfig(this.activity.activityType)
    }
  },
  methods: {
    resetSubConfig(type) {
      const defaults = {
        '2': { limitType: '2', limitCount: 1 },
        '3': { sendType: '1', userScope: '3' },
        '4': { limitPower: 0, limitType: '2', limitCount: 1, stationScope: '3', userScope: '3' },
        '5': { activityTitle: '', limitType: '2', limitCount: 1, userScope: '1' },
        '6': { sendTotalCount: 100, userScope: '3' }
      }
      this.subConfig = defaults[type] ? { ...defaults[type] } : {}
    },
    onTimeRangeChange(val) {
      if (val && val.length === 2) {
        this.activity.activityBeginTime = val[0]
        this.activity.activityEndTime = val[1]
      } else {
        this.activity.activityBeginTime = ''
        this.activity.activityEndTime = ''
      }
    },
    loadOptions() {
      cardCouponRewardOptions().then(res => {
        this.cardCouponOptions = res.data || []
      })
      userGroupOptions().then(res => {
        this.userGroupOptions = res.data || []
      })
    },
    loadStationGroupOptions() {
      if (this.stationGroupLoaded) return
      stationGroupOptions().then(res => {
        this.stationGroupOptions = res.data || []
        this.stationGroupLoaded = true
      })
    },
    loadDetail() {
      this.loading = true
      activityDetail(this.$route.query.id).then(res => {
        this.loading = false
        if (res.code !== 200 || !res.data) return
        const data = res.data
        Object.assign(this.activity, data.activity || {})
        this.activity.activityType = this.fixedType || this.activity.activityType
        this.rewards = (data.rewards || []).map(r => ({ ...r }))
        this.subConfig = data.subConfig || {}
        if (this.activity.activityBeginTime && this.activity.activityEndTime) {
          this.timeRange = [this.activity.activityBeginTime, this.activity.activityEndTime]
        }
        this.selectedStationGroupIds = (data.stationScopes || []).map(s => s.dataId)
        this.selectedUserGroupIds = (data.userScopes || []).map(s => s.dataId)
      }).catch(() => { this.loading = false })
    },
    addReward() {
      this.rewards.push({ rewardType: '2', rewardId: '', rewardCount: 1, rewardThreshold: 0 })
    },
    removeReward(index) {
      this.rewards.splice(index, 1)
    },
    buildScopes() {
      const stationScopes = this.showStationGroupSelect
        ? this.selectedStationGroupIds.map(id => {
          const g = this.stationGroupOptions.find(x => x.id === id)
          return { dataId: id, dataName: g ? g.groupName : '', stationType: '3' }
        })
        : []
      const userScopes = []
      if (this.showUserGroupSelect) {
        this.selectedUserGroupIds.forEach(id => {
          const g = this.userGroupOptions.find(x => x.id === id)
          userScopes.push({ dataId: id, dataName: g ? g.groupName : '' })
        })
      }
      if (this.showSpecifiedUsers && this.specifiedUserPhones) {
        this.specifiedUserPhones.split('\n').map(s => s.trim()).filter(Boolean).forEach((phone, idx) => {
          userScopes.push({ dataId: idx + 1, dataName: phone })
        })
      }
      return { stationScopes, userScopes }
    },
    nextStep() {
      if (this.step === 0) {
        this.$refs.basicForm.validate(valid => {
          if (!valid) return
          if (!this.activity.activityBeginTime) {
            this.$message.warning('请选择活动时间')
            return
          }
          this.step++
        })
        return
      }
      if (this.step === this.rewardStepIndex) {
        if (!this.rewards.length) {
          this.$message.warning('请至少添加一项奖励')
          return
        }
        if (this.rewards.some(r => !r.rewardId)) {
          this.$message.warning('请选择卡券')
          return
        }
      }
      if (this.step >= this.previewStepIndex) return
      let next = this.step + 1
      if (!this.hasSubConfigStep && next === 1) next = this.rewardStepIndex
      if (!this.hasScopeStep && next === this.scopeStepIndex) next = this.previewStepIndex
      this.step = next
    },
    goBack() {
      const q = { activityType: this.fixedType, typeName: this.$route.query.typeName }
      this.$router.push({ name: 'activityList', query: q })
    },
    handleSubmit() {
      const { stationScopes, userScopes } = this.buildScopes()
      const payload = {
        activity: { ...this.activity, activityType: this.fixedType },
        rewards: this.rewards,
        stationScopes,
        userScopes,
        subConfig: this.subConfig
      }
      this.submitting = true
      const api = this.isEdit ? updateActivity : saveActivity
      api(payload).then(res => {
        this.submitting = false
        if (res.code === 200) {
          this.$message.success('保存成功')
          this.goBack()
        } else {
          this.$message.error(res.msg || '保存失败')
        }
      }).catch(() => { this.submitting = false })
    }
  }
}
</script>

<style scoped>
.field-hint {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
}
.preview-box {
  max-width: 720px;
}
</style>
