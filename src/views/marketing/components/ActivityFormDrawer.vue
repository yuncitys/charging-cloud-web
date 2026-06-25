<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visibleSync"
    direction="rtl"
    size="680px"
    :wrapper-closable="false"
    append-to-body
    custom-class="marketing-activity-drawer"
    @open="onOpen"
    @close="onClose"
  >
    <div v-if="visibleSync" v-loading="loading" class="marketing-activity-drawer__body">
      <!-- 注册领取 -->
      <el-form v-if="activityType === '1'" ref="formRef" :model="form" :rules="registerRules" label-width="100px" label-position="top">
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="—"
            start-placeholder="请选择开始日期"
            end-placeholder="请选择结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input v-model="form.activityRemark" type="textarea" :rows="3" placeholder="请输入活动说明" />
        </el-form-item>
        <el-form-item label="活动规则">
          <el-input v-model="form.activityRule" type="textarea" :rows="3" placeholder="请输入活动规则" />
        </el-form-item>
        <el-form-item label="卡券设置" prop="rewards">
          <reward-editor ref="rewardEditor" v-model="form.rewards" />
        </el-form-item>
      </el-form>

      <!-- 充值领取 -->
      <el-form v-else-if="activityType === '2'" ref="formRef" :model="form" :rules="rechargeRules" label-width="100px" label-position="top">
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="—"
            start-placeholder="请选择开始日期"
            end-placeholder="请选择结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="活动规则图片" prop="ruleImage">
          <upload-file v-model="form.ruleImage" />
          <p class="field-hint">请上传 1M 以内、尺寸 750×320px 的图片，用于客户端展示</p>
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input v-model="form.activityRemark" type="textarea" :rows="3" placeholder="请输入活动说明" />
        </el-form-item>
        <el-form-item label="卡券设置" prop="tiers">
          <recharge-tier-editor ref="tierEditor" v-model="form.tiers" />
        </el-form-item>
        <el-form-item label="限制次数" prop="limitCount">
          <div class="limit-row limit-row--full">
            <el-input v-model.number="form.limitCount" placeholder="请输入次数" class="limit-row__count" />
            <el-select v-model="form.limitType" class="limit-row__type">
              <el-option label="次/人/天" value="1" />
              <el-option label="次/人/活动周期" value="2" />
            </el-select>
          </div>
        </el-form-item>
      </el-form>

      <!-- 定向发放 -->
      <el-form v-else-if="activityType === '3'" ref="formRef" :model="form" :rules="directionalRules" label-width="100px" label-position="top">
        <activity-initiator-fields :form="form" @initiator-change="onInitiatorChange" />
        <el-form-item v-if="showMerchantField" label="归属商户" prop="activityInitiatorId">
          <el-select v-model="form.activityInitiatorId" filterable placeholder="请选择商户" style="width: 100%;" @change="onMerchantSelectChange">
            <el-option v-for="m in merchantOptions" :key="m.id" :label="m.name || m.merchantName" :value="String(m.id)" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input v-model="form.activityRemark" type="textarea" :rows="3" placeholder="请输入活动说明" />
        </el-form-item>
        <el-form-item label="卡券设置" prop="rewards">
          <reward-editor ref="rewardEditor" v-model="form.rewards" />
        </el-form-item>
        <el-form-item label="发放时间" prop="sendType">
          <el-radio-group v-model="form.sendType">
            <el-radio label="1">立即发放</el-radio>
            <el-radio label="2">定时发放</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.sendType === '2'" label="定时时间" prop="sendTime">
          <el-date-picker v-model="form.sendTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择发放时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="用户维度" prop="userScope">
          <el-radio-group v-model="form.userScope" @change="onUserScopeChange">
            <el-radio label="1">按客户发送</el-radio>
            <el-radio label="2">用户分组</el-radio>
            <el-radio label="4">指定用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发放用户" prop="userScopes">
          <user-scope-picker ref="scopePicker" :user-scope="form.userScope" v-model="form.userScopes" />
        </el-form-item>
      </el-form>

      <!-- 充电领取 -->
      <el-form v-else-if="activityType === '4'" ref="formRef" :model="form" :rules="chargeRules" label-width="100px" label-position="top">
        <activity-initiator-fields :form="form" @initiator-change="onInitiatorChange" />
        <el-form-item v-if="showMerchantField" label="归属商户" prop="activityInitiatorId">
          <el-select v-model="form.activityInitiatorId" filterable placeholder="请选择商户" style="width: 100%;" @change="onMerchantSelectChange">
            <el-option v-for="m in merchantOptions" :key="m.id" :label="m.name || m.merchantName" :value="String(m.id)" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="—"
            start-placeholder="请选择开始日期"
            end-placeholder="请选择结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input v-model="form.activityRemark" type="textarea" :rows="3" placeholder="请输入活动说明" />
        </el-form-item>
        <el-form-item label="活动规则">
          <el-input v-model="form.activityRule" type="textarea" :rows="3" placeholder="请输入活动规则" />
        </el-form-item>
        <el-form-item label="发放条件" prop="limitPower">
          <div class="condition-row condition-row--full">
            <span>充电满</span>
            <el-input v-model.number="form.limitPower" placeholder="请输入度数" class="condition-row__input" />
            <span>度发放</span>
          </div>
        </el-form-item>
        <el-form-item label="卡券设置" prop="rewards">
          <reward-editor ref="rewardEditor" v-model="form.rewards" />
        </el-form-item>
        <el-form-item label="限制次数" prop="limitCount">
          <div class="limit-row limit-row--full">
            <el-input v-model.number="form.limitCount" placeholder="请输入次数" class="limit-row__count" />
            <el-select v-model="form.limitType" class="limit-row__type">
              <el-option label="次/人/天" value="1" />
              <el-option label="次/人/活动周期" value="2" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="电站维度" prop="stationScope">
          <el-radio-group v-model="form.stationScope" @change="onStationScopeChange">
            <el-radio label="1">按商户</el-radio>
            <el-radio label="2">按电站分组</el-radio>
            <el-radio label="3">全部电站</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.stationScope !== '3'" label="选择电站" prop="stationScopes">
          <station-scope-picker
            ref="stationPicker"
            :station-scope="form.stationScope"
            :merchant-id="chargeStationMerchantId"
            :disabled="stationScopePickerDisabled"
            v-model="form.stationScopes"
          />
        </el-form-item>
        <el-form-item label="用户维度" prop="userScope">
          <el-radio-group v-model="form.userScope" @change="onUserScopeChange">
            <el-radio label="1">按客户发放</el-radio>
            <el-radio label="2">用户分组</el-radio>
            <el-radio label="3">全部用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.userScope !== '3'" label="发放用户" prop="userScopes">
          <user-scope-picker ref="scopePicker" :user-scope="form.userScope" v-model="form.userScopes" />
        </el-form-item>
      </el-form>

      <!-- 扫码领取 -->
      <el-form v-else-if="activityType === '5'" ref="formRef" :model="form" :rules="scanRules" label-width="100px" label-position="top">
        <activity-initiator-fields :form="form" @initiator-change="onInitiatorChange" />
        <el-form-item v-if="showMerchantField" label="归属商户" prop="activityInitiatorId">
          <el-select v-model="form.activityInitiatorId" filterable placeholder="请选择商户" style="width: 100%;" @change="onMerchantSelectChange">
            <el-option v-for="m in merchantOptions" :key="m.id" :label="m.name || m.merchantName" :value="String(m.id)" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="—"
            start-placeholder="请选择开始日期"
            end-placeholder="请选择结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="活动标题" prop="activityTitle">
          <el-input v-model="form.activityTitle" placeholder="请输入活动标题" maxlength="30" />
        </el-form-item>
        <el-form-item label="活动图片" prop="activityImage">
          <upload-file v-model="form.activityImage" />
          <p class="field-hint">请上传 1M 以内、尺寸 750×320px 的图片，用于客户端展示</p>
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input v-model="form.activityRemark" type="textarea" :rows="3" placeholder="请输入活动说明" />
        </el-form-item>
        <el-form-item label="活动规则">
          <el-input v-model="form.activityRule" type="textarea" :rows="3" placeholder="请输入活动规则" />
        </el-form-item>
        <el-form-item label="卡券设置" prop="rewards">
          <reward-editor ref="rewardEditor" v-model="form.rewards" />
        </el-form-item>
        <el-form-item label="限制次数" prop="limitCount">
          <div class="limit-row limit-row--full">
            <el-input v-model.number="form.limitCount" placeholder="请输入次数" class="limit-row__count" />
            <el-select v-model="form.limitType" class="limit-row__type">
              <el-option label="次/人/天" value="1" />
              <el-option label="次/人/活动周期" value="2" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="用户维度" prop="userScope">
          <el-radio-group v-model="form.userScope" @change="onUserScopeChange">
            <el-radio label="1">按客户发放</el-radio>
            <el-radio label="2">用户分组</el-radio>
            <el-radio label="3">全部用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.userScope !== '3'" label="适用用户范围设置" prop="userScopes">
          <user-scope-picker ref="scopePicker" :user-scope="form.userScope" v-model="form.userScopes" />
        </el-form-item>
      </el-form>

      <!-- 券码兑换 -->
      <el-form v-else-if="activityType === '6'" ref="formRef" :model="form" :rules="exchangeRules" label-width="100px" label-position="top">
        <activity-initiator-fields :form="form" @initiator-change="onInitiatorChange" />
        <el-form-item v-if="showMerchantField" label="归属商户" prop="activityInitiatorId">
          <el-select v-model="form.activityInitiatorId" filterable placeholder="请选择商户" style="width: 100%;" @change="onMerchantSelectChange">
            <el-option v-for="m in merchantOptions" :key="m.id" :label="m.name || m.merchantName" :value="String(m.id)" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input v-model="form.activityRemark" type="textarea" :rows="3" placeholder="请输入活动说明" />
        </el-form-item>
        <el-form-item label="发放总数量" prop="sendTotalCount">
          <el-input v-model.number="form.sendTotalCount" placeholder="请输入发放总数量" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="卡券设置" prop="rewards">
          <reward-editor ref="rewardEditor" v-model="form.rewards" />
        </el-form-item>
        <el-form-item label="用户维度" prop="userScope">
          <el-radio-group v-model="form.userScope" @change="onUserScopeChange">
            <el-radio label="1">按客户发放</el-radio>
            <el-radio label="2">用户分组</el-radio>
            <el-radio label="3">全部用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.userScope !== '3'" label="适用用户范围设置" prop="userScopes">
          <user-scope-picker ref="scopePicker" :user-scope="form.userScope" v-model="form.userScopes" />
        </el-form-item>
      </el-form>
    </div>

    <div class="marketing-activity-drawer__footer">
      <el-button @click="visibleSync = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { activityDetail, saveActivity, updateActivity } from '@/api/marketing/marketing'
import { getActivityTypeMeta } from '../constants/activityTypes'
import RewardEditor from './RewardEditor'
import RechargeTierEditor from './RechargeTierEditor'
import UserScopePicker from './UserScopePicker'
import StationScopePicker from './StationScopePicker'
import UploadFile from '@/components/Common/uploadFile'
import ActivityInitiatorFields from './ActivityInitiatorFields'
import marketingMerchantMixin from '../utils/marketingMerchantMixin'
import { applyInitiatorDefaults, normalizeInitiatorPayload, isMerchantIdSelected } from '../utils/marketingActivityAuth'
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils/index'
import '../styles/marketing.scss'

export default {
  name: 'ActivityFormDrawer',
  mixins: [marketingMerchantMixin],
  components: { RewardEditor, RechargeTierEditor, UserScopePicker, StationScopePicker, UploadFile, ActivityInitiatorFields },
  props: {
    visible: { type: Boolean, default: false },
    activityType: { type: String, required: true },
    activityId: { type: String, default: '' }
  },
  data() {
    const validateMerchantInitiatorId = (rule, value, callback) => {
      if (['3', '4', '5', '6'].includes(this.activityType) && String(this.form.activityInitiator) === '2') {
        if (!isMerchantIdSelected(value)) {
          callback(new Error('请选择归属商户'))
          return
        }
      }
      callback()
    }
    const validateLimitCount = (rule, value, callback) => {
      if (value === '' || value == null || Number(value) < 1) {
        callback(new Error('请输入有效的限制次数'))
        return
      }
      callback()
    }
    const validateLimitPower = (rule, value, callback) => {
      if (value === '' || value == null || Number(value) <= 0) {
        callback(new Error('请输入有效的发放条件（充电度数）'))
        return
      }
      callback()
    }
    const validateSendTime = (rule, value, callback) => {
      if (this.activityType === '3' && this.form.sendType === '2' && !value) {
        callback(new Error('请选择定时发放时间'))
        return
      }
      callback()
    }
    const validateRewards = (rule, value, callback) => {
      const editor = this.$refs.rewardEditor
      if (!editor) {
        callback()
        return
      }
      const msg = editor.validate()
      if (msg) {
        callback(new Error(msg))
        return
      }
      callback()
    }
    const validateTiers = (rule, value, callback) => {
      const editor = this.$refs.tierEditor
      if (!editor) {
        callback()
        return
      }
      const msg = editor.validate()
      if (msg) {
        callback(new Error(msg))
        return
      }
      callback()
    }
    const validateUserScopes = (rule, value, callback) => {
      if (['4', '5', '6'].includes(this.activityType) && this.form.userScope === '3') {
        callback()
        return
      }
      const picker = this.$refs.scopePicker
      if (!picker) {
        callback()
        return
      }
      const msg = picker.validate()
      if (msg) {
        callback(new Error(msg))
        return
      }
      callback()
    }
    const validateStationScopes = (rule, value, callback) => {
      if (this.activityType !== '4' || this.form.stationScope === '3') {
        callback()
        return
      }
      if (this.form.activityInitiator === '2' && !isMerchantIdSelected(this.form.activityInitiatorId)) {
        callback(new Error('请先选择归属商户'))
        return
      }
      const picker = this.$refs.stationPicker
      if (!picker) {
        callback()
        return
      }
      const msg = picker.validate()
      if (msg) {
        callback(new Error(msg))
        return
      }
      callback()
    }
    const validateSendTotalCount = (rule, value, callback) => {
      if (value === '' || value == null || Number(value) < 1) {
        callback(new Error('请输入有效的发放总数量'))
        return
      }
      callback()
    }
    const rewardFieldRule = { required: true, validator: validateRewards, trigger: 'change' }
    const userScopeFieldRule = { required: true, validator: validateUserScopes, trigger: 'change' }
    return {
      loading: false,
      submitting: false,
      form: {},
      registerRules: {
        activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        timeRange: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
        rewards: [rewardFieldRule]
      },
      rechargeRules: {
        activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        timeRange: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
        ruleImage: [{ required: true, message: '请上传活动规则图片', trigger: 'change' }],
        tiers: [{ required: true, validator: validateTiers, trigger: 'change' }],
        limitCount: [{ required: true, validator: validateLimitCount, trigger: 'blur' }]
      },
      directionalRules: {
        activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        activityInitiator: [{ required: true, message: '请选择发起方', trigger: 'change' }],
        activityInitiatorId: [{ required: true, validator: validateMerchantInitiatorId, trigger: 'change' }],
        rewards: [rewardFieldRule],
        sendType: [{ required: true, message: '请选择发放时间', trigger: 'change' }],
        sendTime: [{ required: true, validator: validateSendTime, trigger: 'change' }],
        userScope: [{ required: true, message: '请选择用户维度', trigger: 'change' }],
        userScopes: [userScopeFieldRule]
      },
      chargeRules: {
        activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        timeRange: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
        activityInitiator: [{ required: true, message: '请选择发起方', trigger: 'change' }],
        activityInitiatorId: [{ required: true, validator: validateMerchantInitiatorId, trigger: 'change' }],
        limitPower: [{ required: true, validator: validateLimitPower, trigger: 'blur' }],
        rewards: [rewardFieldRule],
        limitCount: [{ required: true, validator: validateLimitCount, trigger: 'blur' }],
        stationScope: [{ required: true, message: '请选择电站维度', trigger: 'change' }],
        stationScopes: [{ required: true, validator: validateStationScopes, trigger: 'change' }],
        userScope: [{ required: true, message: '请选择用户维度', trigger: 'change' }],
        userScopes: [userScopeFieldRule]
      },
      scanRules: {
        activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        timeRange: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
        activityInitiator: [{ required: true, message: '请选择发起方', trigger: 'change' }],
        activityInitiatorId: [{ required: true, validator: validateMerchantInitiatorId, trigger: 'change' }],
        activityTitle: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
        activityImage: [{ required: true, message: '请上传活动图片', trigger: 'change' }],
        rewards: [rewardFieldRule],
        limitCount: [{ required: true, validator: validateLimitCount, trigger: 'blur' }],
        userScope: [{ required: true, message: '请选择用户维度', trigger: 'change' }],
        userScopes: [userScopeFieldRule]
      },
      exchangeRules: {
        activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        activityInitiator: [{ required: true, message: '请选择发起方', trigger: 'change' }],
        activityInitiatorId: [{ required: true, validator: validateMerchantInitiatorId, trigger: 'change' }],
        sendTotalCount: [{ required: true, validator: validateSendTotalCount, trigger: 'blur' }],
        rewards: [rewardFieldRule],
        userScope: [{ required: true, message: '请选择用户维度', trigger: 'change' }],
        userScopes: [userScopeFieldRule]
      }
    }
  },
  computed: {
    ...mapGetters(['adminUser']),
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    isEdit() {
      return !!this.activityId
    },
    typeMeta() {
      return getActivityTypeMeta(this.activityType)
    },
    drawerTitle() {
      const label = this.typeMeta ? this.typeMeta.label : '活动'
      return (this.isEdit ? '编辑' : '新增') + label + '活动'
    },
    chargeStationMerchantId() {
      if (this.activityType !== '4' || this.form.activityInitiator !== '2') return ''
      const id = this.form.activityInitiatorId
      return isMerchantIdSelected(id) ? String(id) : ''
    },
    stationScopePickerDisabled() {
      return this.form.activityInitiator === '2' && !isMerchantIdSelected(this.form.activityInitiatorId)
    }
  },
  methods: {
    isMerchantIdSelected,
    onMerchantSelectChange() {
      if (this.activityType === '4') {
        this.$set(this.form, 'stationScopes', [])
      }
    },
    onInitiatorChange(val) {
      if (val === '1') {
        this.$set(this.form, 'activityInitiatorId', '0')
      } else if (!isMerchantIdSelected(this.form.activityInitiatorId)) {
        this.form.activityInitiatorId = ''
      }
      if (this.activityType === '4') {
        this.$set(this.form, 'stationScopes', [])
      }
      this.$nextTick(() => {
        if (['3', '4', '5', '6'].includes(this.activityType) && this.$refs.formRef) {
          this.$refs.formRef.validateField('activityInitiatorId')
        }
      })
    },
    onStationScopeChange() {
      this.form.stationScopes = []
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate('stationScopes')
        }
      })
    },
    onUserScopeChange() {
      this.form.userScopes = []
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate('userScopes')
        }
      })
    },
    onOpen() {
      this.loadMerchantOptions()
      if (this.isEdit) {
        this.loadDetail()
      } else {
        this.resetForm()
      }
    },
    onClose() {
      this.form = {}
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },
    resetForm() {
      const type = this.activityType
      if (type === '1') {
        this.form = {
          activityName: '',
          timeRange: [],
          activityRemark: '',
          activityRule: '',
          rewards: [{ rewardType: '2', rewardId: '', rewardCount: 1 }]
        }
      } else if (type === '2') {
        this.form = {
          activityName: '',
          timeRange: [],
          ruleImage: '',
          activityRemark: '',
          tiers: [{ threshold: '', rewards: [{ rewardType: '2', rewardId: '', rewardCount: 1 }] }],
          limitType: '1',
          limitCount: 1
        }
      } else if (type === '3') {
        this.form = {
          activityInitiator: '1',
          activityInitiatorId: '0',
          activityName: '',
          activityRemark: '',
          rewards: [{ rewardType: '2', rewardId: '', rewardCount: 1 }],
          sendType: '1',
          sendTime: '',
          userScope: '1',
          userScopes: []
        }
        applyInitiatorDefaults(this.form, this.adminUser)
      } else if (type === '4') {
        this.form = {
          activityInitiator: '1',
          activityInitiatorId: '0',
          activityName: '',
          timeRange: [],
          activityRemark: '',
          activityRule: '',
          limitPower: '',
          rewards: [{ rewardType: '2', rewardId: '', rewardCount: 1 }],
          limitType: '1',
          limitCount: 1,
          stationScope: '1',
          stationScopes: [],
          userScope: '1',
          userScopes: []
        }
        applyInitiatorDefaults(this.form, this.adminUser)
      } else if (type === '5') {
        this.form = {
          activityInitiator: '1',
          activityInitiatorId: '0',
          activityName: '',
          timeRange: [],
          activityTitle: '',
          activityImage: '',
          activityRemark: '',
          activityRule: '',
          rewards: [{ rewardType: '2', rewardId: '', rewardCount: 1 }],
          limitType: '1',
          limitCount: 1,
          userScope: '1',
          userScopes: []
        }
        applyInitiatorDefaults(this.form, this.adminUser)
      } else if (type === '6') {
        this.form = {
          activityInitiator: '1',
          activityInitiatorId: '0',
          activityName: '',
          activityRemark: '',
          sendTotalCount: 100,
          rewards: [{ rewardType: '2', rewardId: '', rewardCount: 1 }],
          userScope: '1',
          userScopes: []
        }
        applyInitiatorDefaults(this.form, this.adminUser)
      }
    },
    loadDetail() {
      this.loading = true
      activityDetail(this.activityId).then(res => {
        this.loading = false
        if (res.code !== 200 || !res.data) return
        const { activity, rewards, userScopes, stationScopes, subConfig } = res.data
        const type = this.activityType
        if (type === '1') {
          this.form = {
            activityId: activity.activityId,
            activityName: activity.activityName,
            timeRange: activity.activityBeginTime && activity.activityEndTime
              ? [activity.activityBeginTime, activity.activityEndTime] : [],
            activityRemark: activity.activityRemark || '',
            activityRule: activity.activityRule || '',
            rewards: rewards && rewards.length ? rewards : [{ rewardType: '2', rewardId: '', rewardCount: 1 }]
          }
        } else if (type === '2') {
          this.form = {
            activityId: activity.activityId,
            activityName: activity.activityName,
            timeRange: activity.activityBeginTime && activity.activityEndTime
              ? [activity.activityBeginTime, activity.activityEndTime] : [],
            ruleImage: activity.activityRule || '',
            activityRemark: activity.activityRemark || '',
            tiers: this.parseRechargeTiers(rewards),
            limitType: (subConfig && subConfig.limitType) || '1',
            limitCount: Number((subConfig && subConfig.limitCount) || 1)
          }
        } else if (type === '3') {
          this.form = {
            activityId: activity.activityId,
            activityInitiator: activity.activityInitiator || '1',
            activityInitiatorId: activity.activityInitiator === '2'
              ? String(activity.activityInitiatorId || '')
              : '0',
            activityName: activity.activityName,
            activityRemark: activity.activityRemark || '',
            rewards: rewards && rewards.length ? rewards : [{ rewardType: '2', rewardId: '', rewardCount: 1 }],
            sendType: subConfig && subConfig.sendType != null ? String(subConfig.sendType) : '1',
            sendTime: this.formatPickerDateTime(subConfig && subConfig.sendTime),
            userScope: (subConfig && subConfig.userScope) || '1',
            userScopes: userScopes || []
          }
        } else if (type === '4') {
          this.form = {
            activityId: activity.activityId,
            activityInitiator: activity.activityInitiator || '1',
            activityInitiatorId: activity.activityInitiator === '2'
              ? String(activity.activityInitiatorId || '')
              : '0',
            activityName: activity.activityName,
            timeRange: activity.activityBeginTime && activity.activityEndTime
              ? [activity.activityBeginTime, activity.activityEndTime] : [],
            activityRemark: activity.activityRemark || '',
            activityRule: activity.activityRule || '',
            limitPower: (subConfig && subConfig.limitPower) != null ? Number(subConfig.limitPower) : '',
            rewards: rewards && rewards.length ? rewards : [{ rewardType: '2', rewardId: '', rewardCount: 1 }],
            limitType: (subConfig && subConfig.limitType) || '1',
            limitCount: Number((subConfig && subConfig.limitCount) || 1),
            stationScope: (subConfig && subConfig.stationScope) || '1',
            stationScopes: stationScopes || [],
            userScope: (subConfig && subConfig.userScope) || '1',
            userScopes: userScopes || []
          }
        } else if (type === '5') {
          this.form = {
            activityId: activity.activityId,
            activityInitiator: activity.activityInitiator || '1',
            activityInitiatorId: activity.activityInitiator === '2'
              ? String(activity.activityInitiatorId || '')
              : '0',
            activityName: activity.activityName,
            timeRange: activity.activityBeginTime && activity.activityEndTime
              ? [activity.activityBeginTime, activity.activityEndTime] : [],
            activityTitle: (subConfig && subConfig.activityTitle) || '',
            activityImage: (subConfig && subConfig.activityImage) || '',
            activityRemark: activity.activityRemark || '',
            activityRule: activity.activityRule || '',
            rewards: rewards && rewards.length ? rewards : [{ rewardType: '2', rewardId: '', rewardCount: 1 }],
            limitType: (subConfig && subConfig.limitType) || '1',
            limitCount: Number((subConfig && subConfig.limitCount) || 1),
            userScope: (subConfig && subConfig.userScope) || '1',
            userScopes: userScopes || []
          }
        } else if (type === '6') {
          this.form = {
            activityId: activity.activityId,
            activityInitiator: activity.activityInitiator || '1',
            activityInitiatorId: activity.activityInitiator === '2'
              ? String(activity.activityInitiatorId || '')
              : '0',
            activityName: activity.activityName,
            activityRemark: activity.activityRemark || '',
            sendTotalCount: Number((subConfig && subConfig.sendTotalCount) || 100),
            rewards: rewards && rewards.length ? rewards : [{ rewardType: '2', rewardId: '', rewardCount: 1 }],
            userScope: (subConfig && subConfig.userScope) || '1',
            userScopes: userScopes || []
          }
        }
      }).catch(() => { this.loading = false })
    },
    parseRechargeTiers(rewards) {
      if (!rewards || !rewards.length) {
        return [{ threshold: '', rewards: [{ rewardType: '2', rewardId: '', rewardCount: 1 }] }]
      }
      const map = {}
      rewards.forEach(r => {
        const key = String(r.rewardThreshold != null ? r.rewardThreshold : 0)
        if (!map[key]) map[key] = { threshold: r.rewardThreshold, rewards: [] }
        map[key].rewards.push({ rewardType: r.rewardType, rewardId: r.rewardId, rewardCount: r.rewardCount })
      })
      return Object.values(map)
    },
    formatPickerDateTime(time) {
      if (!time) return ''
      if (typeof time === 'string') return time
      return parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    buildPayload() {
      const type = this.activityType
      const isPlatformOnly = type === '1' || type === '2'
      const initiator = isPlatformOnly
        ? { activityInitiator: '1', activityInitiatorId: '0' }
        : normalizeInitiatorPayload(this.form, this.adminUser)
      const activity = {
        activityId: this.form.activityId || '',
        activityName: this.form.activityName,
        activityType: type,
        activityInitiator: initiator.activityInitiator,
        activityInitiatorId: initiator.activityInitiatorId,
        activityRemark: this.form.activityRemark || ''
      }
      let rewards = []
      let subConfig = {}
      let userScopes = []
      let stationScopes = []

      if (type === '1') {
        activity.activityBeginTime = this.form.timeRange[0]
        activity.activityEndTime = this.form.timeRange[1]
        activity.activityRule = this.form.activityRule || ''
        rewards = this.form.rewards
      } else if (type === '2') {
        activity.activityBeginTime = this.form.timeRange[0]
        activity.activityEndTime = this.form.timeRange[1]
        activity.activityRule = this.form.ruleImage || ''
        rewards = this.$refs.tierEditor.toFlatRewards()
        subConfig = { limitType: this.form.limitType, limitCount: this.form.limitCount }
      } else if (type === '3') {
        const now = new Date()
        const end = new Date(now)
        end.setHours(23, 59, 59, 0)
        if (this.form.sendType === '1') {
          activity.activityBeginTime = parseTime(now, '{y}-{m}-{d} {h}:{i}:{s}')
          activity.activityEndTime = parseTime(end, '{y}-{m}-{d} {h}:{i}:{s}')
        } else if (this.form.sendTime) {
          const send = new Date(String(this.form.sendTime).replace(/-/g, '/'))
          const sendEnd = new Date(send)
          sendEnd.setHours(23, 59, 59, 0)
          activity.activityBeginTime = this.form.sendTime
          activity.activityEndTime = parseTime(sendEnd, '{y}-{m}-{d} {h}:{i}:{s}')
        }
        activity.activityRule = ''
        rewards = this.form.rewards
        subConfig = {
          sendType: this.form.sendType,
          sendTime: this.form.sendType === '2' ? this.form.sendTime : null,
          userScope: this.form.userScope
        }
        userScopes = this.form.userScopes || []
      } else if (type === '4') {
        activity.activityBeginTime = this.form.timeRange[0]
        activity.activityEndTime = this.form.timeRange[1]
        activity.activityRule = this.form.activityRule || ''
        rewards = this.form.rewards
        subConfig = {
          limitPower: this.form.limitPower,
          limitType: this.form.limitType,
          limitCount: this.form.limitCount,
          stationScope: this.form.stationScope,
          userScope: this.form.userScope
        }
        stationScopes = this.form.stationScope === '3' ? [] : (this.form.stationScopes || [])
        userScopes = this.form.userScope === '3' ? [] : (this.form.userScopes || [])
      } else if (type === '5') {
        activity.activityBeginTime = this.form.timeRange[0]
        activity.activityEndTime = this.form.timeRange[1]
        activity.activityRule = this.form.activityRule || ''
        rewards = this.form.rewards
        subConfig = {
          activityTitle: this.form.activityTitle,
          activityImage: this.form.activityImage,
          limitType: this.form.limitType,
          limitCount: this.form.limitCount,
          userScope: this.form.userScope
        }
        userScopes = this.form.userScope === '3' ? [] : (this.form.userScopes || [])
      } else if (type === '6') {
        activity.activityRule = ''
        rewards = this.form.rewards
        subConfig = {
          sendTotalCount: this.form.sendTotalCount,
          userScope: this.form.userScope
        }
        userScopes = this.form.userScope === '3' ? [] : (this.form.userScopes || [])
      }

      return { activity, rewards, subConfig, userScopes, stationScopes }
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        const payload = this.buildPayload()
        this.submitting = true
        const api = this.isEdit ? updateActivity : saveActivity
        api(payload).then(res => {
          this.submitting = false
          if (res.code === 200) {
            this.$message.success(res.msg || '保存成功')
            this.visibleSync = false
            this.$emit('saved')
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        }).catch(() => { this.submitting = false })
      })
    }
  }
}
</script>

<style scoped>
.field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
.limit-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.limit-row--full {
  width: 100%;
}
.limit-row--full .limit-row__count {
  flex: 1;
  min-width: 0;
}
.limit-row--full .limit-row__type {
  flex: 1;
  min-width: 0;
}
.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}
.condition-row--full {
  width: 100%;
}
.condition-row--full .condition-row__input {
  flex: 1;
  min-width: 0;
}
</style>
