<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visibleSync"
    direction="rtl"
    size="760px"
    :wrapper-closable="false"
    append-to-body
    custom-class="marketing-activity-drawer"
    @open="onOpen"
    @close="onClose"
  >
    <div v-if="visibleSync" v-loading="loading" class="marketing-activity-drawer__body">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="top">
        <activity-initiator-fields :form="form" @initiator-change="onInitiatorChange" />
        <el-form-item v-if="showMerchantField" label="归属商户" prop="activityInitiatorId">
          <el-select v-model="form.activityInitiatorId" filterable placeholder="请选择商户" style="width: 100%;" @change="onMerchantChange">
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

        <el-form-item v-if="isStationType" label="优惠值设置方式" prop="discountValueMode">
          <el-radio-group v-model="form.discountValueMode" @change="onDiscountValueModeChange">
            <el-radio v-for="item in discountValueModeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="折扣类型" prop="discountType">
          <el-select v-model="form.discountType" placeholder="请选择折扣类型" style="width: 100%;">
            <el-option v-for="item in discountTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="优惠方式" prop="rateType">
          <el-radio-group v-model="form.rateType">
            <el-radio v-for="item in rateTypeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="费率配置" prop="rateSettingType">
          <el-radio-group v-model="form.rateSettingType">
            <el-radio v-for="item in rateSettingTypeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="showGlobalRateFields">
          <el-form-item v-if="isUnifiedRate" :label="'统一优惠值（' + rateUnit + '）'" prop="unifiedRateValue">
            <el-input v-model="form.unifiedRateValue" :placeholder="'请输入统一优惠值（' + rateUnit + '）'">
              <template slot="append">{{ rateUnit }}</template>
            </el-input>
          </el-form-item>
          <template v-else>
            <el-form-item :label="'尖时段优惠值（' + rateUnit + '）'" prop="sharpRateValue">
              <el-input v-model="form.sharpRateValue" :placeholder="'请输入尖时段优惠值（' + rateUnit + '）'">
                <template slot="append">{{ rateUnit }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="'峰时段优惠值（' + rateUnit + '）'" prop="peakRateValue">
              <el-input v-model="form.peakRateValue" :placeholder="'请输入峰时段优惠值（' + rateUnit + '）'">
                <template slot="append">{{ rateUnit }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="'平时段优惠值（' + rateUnit + '）'" prop="flatRateValue">
              <el-input v-model="form.flatRateValue" :placeholder="'请输入平时段优惠值（' + rateUnit + '）'">
                <template slot="append">{{ rateUnit }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="'谷时段优惠值（' + rateUnit + '）'" prop="valleyRateValue">
              <el-input v-model="form.valleyRateValue" :placeholder="'请输入谷时段优惠值（' + rateUnit + '）'">
                <template slot="append">{{ rateUnit }}</template>
              </el-input>
            </el-form-item>
          </template>
        </template>

        <template v-if="merchantStationReady">
          <el-form-item label="电站范围" prop="stationScopeType">
            <el-radio-group v-model="form.stationScopeType" @change="onStationScopeTypeChange">
              <el-radio v-for="item in stationScopeTypeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="参与电站" prop="stationScopes">
          <template v-if="form.stationScopeType === '1'">
            <div class="limit-row limit-row--full">
              <el-select v-model="selectedStationIds" multiple filterable collapse-tags placeholder="请选择电站" class="limit-row__count">
                <el-option v-for="station in stationOptions" :key="station.id" :label="station.name" :value="station.id" />
              </el-select>
              <el-button type="primary" class="limit-row__type" @click="addSelectedStations">添加电站</el-button>
            </div>
          </template>
          <template v-else>
            <el-input
              v-model="batchStationText"
              type="textarea"
              :rows="3"
              placeholder="请输入电站ID，支持逗号、空格、换行分隔"
            />
            <div class="station-batch-actions">
              <el-button type="primary" size="mini" @click="addBatchStations">批量添加电站</el-button>
              <p class="field-hint">{{ batchStationHint }}</p>
            </div>
          </template>
          <el-table :data="form.stationScopes" border size="small" max-height="320" style="margin-top: 12px;">
            <el-table-column type="index" width="50" label="序号" align="center" />
            <el-table-column prop="dataId" label="电站ID" align="center" width="110" />
            <el-table-column prop="dataName" label="电站名称" align="center" min-width="180" show-overflow-tooltip />
            <template v-if="showStationRateColumns">
              <el-table-column v-if="isUnifiedRate" :label="'统一优惠值（' + rateUnit + '）'" align="center" min-width="180">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.unifiedRateValue" size="mini">
                    <template slot="append">{{ rateUnit }}</template>
                  </el-input>
                </template>
              </el-table-column>
              <template v-else>
                <el-table-column :label="'尖（' + rateUnit + '）'" align="center" min-width="130">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.sharpRateValue" size="mini">
                      <template slot="append">{{ rateUnit }}</template>
                    </el-input>
                  </template>
                </el-table-column>
                <el-table-column :label="'峰（' + rateUnit + '）'" align="center" min-width="130">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.peakRateValue" size="mini">
                      <template slot="append">{{ rateUnit }}</template>
                    </el-input>
                  </template>
                </el-table-column>
                <el-table-column :label="'平（' + rateUnit + '）'" align="center" min-width="130">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.flatRateValue" size="mini">
                      <template slot="append">{{ rateUnit }}</template>
                    </el-input>
                  </template>
                </el-table-column>
                <el-table-column :label="'谷（' + rateUnit + '）'" align="center" min-width="130">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.valleyRateValue" size="mini">
                      <template slot="append">{{ rateUnit }}</template>
                    </el-input>
                  </template>
                </el-table-column>
              </template>
            </template>
            <el-table-column label="操作" align="center" width="90" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="removeStation(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          </el-form-item>
        </template>
        <p v-if="form.activityInitiator === '2' && !merchantStationReady" class="field-hint">请先选择归属商户</p>

        <template v-if="isUserType">
          <el-form-item label="参与用户设置" prop="userScopeType">
            <el-radio-group v-model="form.userScopeType" @change="onUserScopeTypeChange">
              <el-radio v-for="item in userScopeTypeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="参与用户" prop="userScopes">
            <user-scope-picker
              ref="userScopePicker"
              :user-scope="pickerUserScope"
              v-model="form.userScopes"
              empty-hint="请选择参与用户"
            />
          </el-form-item>
        </template>

        <el-form-item v-if="isStationType" label="使用星期" prop="weekDays">
          <div class="week-days-box">
            <el-checkbox :indeterminate="weekDayIndeterminate" :value="isAllWeekDaysChecked" @change="toggleAllWeekDays">全选</el-checkbox>
            <el-checkbox-group v-model="selectedWeekDays">
              <el-checkbox v-for="item in weekDayOptions" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item label="生效时段" prop="timeSlots">
          <div class="time-slot-editor">
            <div class="time-slot-editor__toolbar">
              <el-button type="primary" size="mini" icon="el-icon-plus" @click="addTimeSlot">新增时段</el-button>
              <p class="field-hint">时段采用 24 小时制，开始时间必须早于结束时间。</p>
            </div>
            <div v-for="(slot, index) in form.timeSlots" :key="index" class="time-slot-row">
              <span class="time-slot-row__label">时段{{ index + 1 }}</span>
              <el-time-picker
                v-model="slot.startTime"
                value-format="HH:mm"
                format="HH:mm"
                placeholder="开始时间"
                style="width: 130px;"
              />
              <span>—</span>
              <el-time-picker
                v-model="slot.endTime"
                value-format="HH:mm"
                format="HH:mm"
                placeholder="结束时间"
                style="width: 130px;"
              />
              <el-button type="text" size="mini" @click="removeTimeSlot(index)">删除</el-button>
            </div>
          </div>
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
import { getChargeStationTreeByMerchant } from '@/api/netWorkDot/netWorkDotList'
import UserScopePicker from './UserScopePicker'
import ActivityInitiatorFields from './ActivityInitiatorFields'
import marketingMerchantMixin from '../utils/marketingMerchantMixin'
import { applyInitiatorDefaults, normalizeInitiatorPayload, isMerchantIdSelected } from '../utils/marketingActivityAuth'
import { mapGetters } from 'vuex'
import { getActivityTypeMeta } from '../constants/activityTypes'
import {
  DISCOUNT_TYPE,
  RATE_TYPE,
  RATE_SETTING_TYPE,
  DISCOUNT_VALUE_MODE,
  STATION_SCOPE_TYPE,
  USER_SCOPE_TYPE,
  WEEK_DAY_LABELS,
  defaultWeekDays,
  defaultTimeSlots,
  emptyRateValues,
  getRateUnit,
  userScopesToParticipants,
  participantsToUserScopes
} from '../constants/discountActivity'
import '../styles/marketing.scss'

function toOptionList(mapObj) {
  return Object.keys(mapObj).map(key => ({ value: String(key), label: mapObj[key] }))
}

function parseNumberLike(value) {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function compareTime(a, b) {
  if (!a || !b) return 0
  const [ha, ma] = String(a).split(':').map(Number)
  const [hb, mb] = String(b).split(':').map(Number)
  return ha * 60 + ma - (hb * 60 + mb)
}

export default {
  name: 'DiscountActivityFormDrawer',
  mixins: [marketingMerchantMixin],
  components: { UserScopePicker, ActivityInitiatorFields },
  props: {
    visible: { type: Boolean, default: false },
    activityType: { type: String, required: true },
    activityId: { type: String, default: '' }
  },
  data() {
    const validateInitiatorMerchant = (rule, value, callback) => {
      if (String(this.form.activityInitiator) === '2' && !isMerchantIdSelected(value)) {
        callback(new Error('请选择归属商户'))
        return
      }
      callback()
    }
    const validateTimeRange = (rule, value, callback) => {
      if (!Array.isArray(value) || value.length !== 2) {
        callback(new Error('请选择活动时间'))
        return
      }
      callback()
    }
    const validateRateValue = (fieldLabel, value, callback) => {
      const num = parseNumberLike(value)
      if (num == null || num <= 0) {
        callback(new Error(`请输入有效的${fieldLabel}`))
        return
      }
      if (this.form.rateType === '2' && num > 100) {
        callback(new Error(`${fieldLabel}不能超过100`))
        return
      }
      callback()
    }
    const validateUnifiedRate = (rule, value, callback) => {
      if (!this.showGlobalRateFields || !this.isUnifiedRate) {
        callback()
        return
      }
      validateRateValue('统一优惠值', value, callback)
    }
    const validateSharpRate = (rule, value, callback) => {
      if (!this.showGlobalRateFields || this.isUnifiedRate) {
        callback()
        return
      }
      validateRateValue('尖时段优惠值', value, callback)
    }
    const validatePeakRate = (rule, value, callback) => {
      if (!this.showGlobalRateFields || this.isUnifiedRate) {
        callback()
        return
      }
      validateRateValue('峰时段优惠值', value, callback)
    }
    const validateFlatRate = (rule, value, callback) => {
      if (!this.showGlobalRateFields || this.isUnifiedRate) {
        callback()
        return
      }
      validateRateValue('平时段优惠值', value, callback)
    }
    const validateValleyRate = (rule, value, callback) => {
      if (!this.showGlobalRateFields || this.isUnifiedRate) {
        callback()
        return
      }
      validateRateValue('谷时段优惠值', value, callback)
    }
    const validateStationScopes = (rule, value, callback) => {
      if (!this.merchantStationReady) {
        callback()
        return
      }
      if (!Array.isArray(this.form.stationScopes) || !this.form.stationScopes.length) {
        callback(new Error('请至少添加一个电站'))
        return
      }
      if (this.showStationRateColumns) {
        const hasInvalid = this.form.stationScopes.some(station => {
          if (this.isUnifiedRate) {
            const num = parseNumberLike(station.unifiedRateValue)
            return num == null || num <= 0 || (this.form.rateType === '2' && num > 100)
          }
          const fields = ['sharpRateValue', 'peakRateValue', 'flatRateValue', 'valleyRateValue']
          return fields.some(field => {
            const num = parseNumberLike(station[field])
            return num == null || num <= 0 || (this.form.rateType === '2' && num > 100)
          })
        })
        if (hasInvalid) {
          callback(new Error('请完善电站优惠值配置'))
          return
        }
      }
      callback()
    }
    const validateUserScopes = (rule, value, callback) => {
      if (!this.isUserType) {
        callback()
        return
      }
      const picker = this.$refs.userScopePicker
      if (picker && typeof picker.validate === 'function') {
        const msg = picker.validate()
        if (msg) {
          callback(new Error(msg))
          return
        }
      }
      const scopes = this.form.userScopes || []
      if (!scopes.length) {
        callback(new Error('请选择参与用户'))
        return
      }
      callback()
    }
    const validateWeekDays = (rule, value, callback) => {
      if (!this.isStationType) {
        callback()
        return
      }
      if (!Array.isArray(this.selectedWeekDays) || !this.selectedWeekDays.length) {
        callback(new Error('请至少选择一天'))
        return
      }
      callback()
    }
    const validateTimeSlots = (rule, value, callback) => {
      const slots = this.form.timeSlots || []
      if (!slots.length) {
        callback(new Error('请至少配置一个时段'))
        return
      }
      const sorted = slots
        .map(slot => ({ ...slot }))
        .sort((a, b) => compareTime(a.startTime, b.startTime))
      for (let i = 0; i < sorted.length; i++) {
        const slot = sorted[i]
        if (!slot.startTime || !slot.endTime) {
          callback(new Error('请完善所有时段的开始和结束时间'))
          return
        }
        if (compareTime(slot.startTime, slot.endTime) >= 0) {
          callback(new Error('时段开始时间必须早于结束时间'))
          return
        }
        if (i > 0 && compareTime(sorted[i - 1].endTime, slot.startTime) > 0) {
          callback(new Error('时段不能重叠'))
          return
        }
      }
      callback()
    }

    return {
      loading: false,
      submitting: false,
      form: this.createDefaultForm(),
      selectedStationIds: [],
      batchStationText: '',
      stationOptions: [],
      stationNameMap: {},
      stationMetaMap: {},
      selectedWeekDays: this.weekDaysToValues(defaultWeekDays()),
      rules: {
        activityInitiator: [{ required: true, message: '请选择发起方', trigger: 'change' }],
        activityInitiatorId: [{ required: true, validator: validateInitiatorMerchant, trigger: 'change' }],
        activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        timeRange: [{ required: true, validator: validateTimeRange, trigger: 'change' }],
        discountValueMode: [{ required: true, message: '请选择优惠值设置方式', trigger: 'change' }],
        discountType: [{ required: true, message: '请选择折扣类型', trigger: 'change' }],
        rateType: [{ required: true, message: '请选择优惠方式', trigger: 'change' }],
        rateSettingType: [{ required: true, message: '请选择费率配置', trigger: 'change' }],
        unifiedRateValue: [{ validator: validateUnifiedRate, trigger: 'blur' }],
        sharpRateValue: [{ validator: validateSharpRate, trigger: 'blur' }],
        peakRateValue: [{ validator: validatePeakRate, trigger: 'blur' }],
        flatRateValue: [{ validator: validateFlatRate, trigger: 'blur' }],
        valleyRateValue: [{ validator: validateValleyRate, trigger: 'blur' }],
        stationScopeType: [{ required: true, message: '请选择电站范围', trigger: 'change' }],
        stationScopes: [{ validator: validateStationScopes, trigger: 'change' }],
        userScopeType: [{ required: true, message: '请选择参与用户设置', trigger: 'change' }],
        userScopes: [{ validator: validateUserScopes, trigger: 'change' }],
        weekDays: [{ validator: validateWeekDays, trigger: 'change' }],
        timeSlots: [{ validator: validateTimeSlots, trigger: 'change' }]
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
    isStationType() {
      return String(this.activityType) === '7'
    },
    isUserType() {
      return String(this.activityType) === '8'
    },
    typeMeta() {
      return getActivityTypeMeta(this.activityType)
    },
    drawerTitle() {
      const typeLabel = this.typeMeta ? this.typeMeta.label : '折扣活动'
      return `${this.isEdit ? '编辑' : '新增'}${typeLabel}`
    },
    discountTypeOptions() {
      return toOptionList(DISCOUNT_TYPE)
    },
    rateTypeOptions() {
      return toOptionList(RATE_TYPE)
    },
    rateSettingTypeOptions() {
      return toOptionList(RATE_SETTING_TYPE)
    },
    discountValueModeOptions() {
      return toOptionList(DISCOUNT_VALUE_MODE)
    },
    stationScopeTypeOptions() {
      return toOptionList(STATION_SCOPE_TYPE)
    },
    userScopeTypeOptions() {
      return toOptionList(USER_SCOPE_TYPE)
    },
    pickerUserScope() {
      return String(this.form.userScopeType) === '1' ? '2' : '1'
    },
    weekDayOptions() {
      return WEEK_DAY_LABELS.map((label, idx) => ({ value: idx + 1, label }))
    },
    rateUnit() {
      return getRateUnit(this.form.rateType)
    },
    isUnifiedRate() {
      return String(this.form.rateSettingType) === '1'
    },
    showStationRateColumns() {
      return this.isStationType && String(this.form.discountValueMode) === '2'
    },
    merchantStationReady() {
      return this.form.activityInitiator !== '2' || isMerchantIdSelected(this.form.activityInitiatorId)
    },
    batchStationHint() {
      if (this.form.activityInitiator === '2') {
        return '仅支持当前商户下存在的电站 ID，重复项将自动忽略。'
      }
      return '仅支持系统内存在的电站 ID，重复项将自动忽略。'
    },
    showGlobalRateFields() {
      if (this.isUserType) return true
      return String(this.form.discountValueMode) === '1'
    },
    weekDayIndeterminate() {
      return this.selectedWeekDays.length > 0 && this.selectedWeekDays.length < 7
    },
    isAllWeekDaysChecked() {
      return this.selectedWeekDays.length === 7
    }
  },
  watch: {
    selectedWeekDays: {
      deep: true,
      handler() {
        this.form.weekDays = this.valuesToWeekDays(this.selectedWeekDays)
      }
    }
  },
  methods: {
    createDefaultForm() {
      return {
        activityId: '',
        activityInitiator: '1',
        activityInitiatorId: '0',
        activityName: '',
        timeRange: [],
        activityRemark: '',
        discountValueMode: '1',
        discountType: '1',
        rateType: '1',
        rateSettingType: '1',
        ...emptyRateValues(),
        stationScopeType: '1',
        stationScopes: [],
        userScopeType: '1',
        userScopes: [],
        weekDays: defaultWeekDays(),
        timeSlots: defaultTimeSlots().map(slot => ({ ...slot }))
      }
    },
    resetForm() {
      this.form = this.createDefaultForm()
      applyInitiatorDefaults(this.form, this.adminUser)
      this.selectedStationIds = []
      this.batchStationText = ''
      this.selectedWeekDays = this.weekDaysToValues(this.form.weekDays)
      this.loadStationOptions()
    },
    weekDaysToValues(bits) {
      return String(bits || defaultWeekDays())
        .split('')
        .map((bit, idx) => (bit === '1' ? idx + 1 : null))
        .filter(Boolean)
    },
    valuesToWeekDays(values) {
      const set = new Set((values || []).map(Number))
      return new Array(7).fill('0').map((_, idx) => (set.has(idx + 1) ? '1' : '0')).join('')
    },
    loadStationOptions() {
      if (this.form.activityInitiator === '2' && !this.merchantStationReady) {
        this.stationOptions = []
        this.stationNameMap = {}
        this.stationMetaMap = {}
        return
      }
      const params = {}
      if (this.form.activityInitiator === '2') {
        params.merchantId = Number(this.form.activityInitiatorId)
      }
      getChargeStationTreeByMerchant(params).then(res => {
        const rows = (res && res.code === 200) ? (res.data || []) : []
        const list = []
        const map = {}
        const meta = {}
        rows.forEach(merchant => {
          (merchant.chargingStationInfoVoList || []).forEach(station => {
            const id = String(station.id)
            const name = station.networkName || station.stationName || id
            list.push({ id, name, ruleId: station.ruleId, merchantId: merchant.id })
            map[id] = name
            meta[id] = {
              name,
              ruleId: station.ruleId,
              merchantId: merchant.id
            }
          })
        })
        this.stationOptions = list
        this.stationNameMap = map
        this.stationMetaMap = meta
        this.pruneInvalidStations()
      })
    },
    pruneInvalidStations() {
      if (!Array.isArray(this.form.stationScopes) || !this.form.stationScopes.length) return
      const next = this.form.stationScopes.filter(item => this.stationNameMap[String(item.dataId)])
      if (next.length !== this.form.stationScopes.length) {
        this.form.stationScopes = next
      }
    },
    clearStationSelection() {
      this.form.stationScopes = []
      this.selectedStationIds = []
      this.batchStationText = ''
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
      this.resetForm()
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },
    onInitiatorChange(val) {
      if (val === '1') {
        this.$set(this.form, 'activityInitiatorId', '0')
      } else if (!isMerchantIdSelected(this.form.activityInitiatorId)) {
        this.form.activityInitiatorId = ''
      }
      this.clearStationSelection()
      this.loadStationOptions()
    },
    onMerchantChange() {
      this.clearStationSelection()
      this.loadStationOptions()
    },
    onDiscountValueModeChange() {
      if (String(this.form.discountValueMode) === '1') {
        this.form.stationScopes = this.form.stationScopes.map(station => {
          const next = { ...station }
          delete next.unifiedRateValue
          delete next.sharpRateValue
          delete next.peakRateValue
          delete next.flatRateValue
          delete next.valleyRateValue
          return next
        })
      } else {
        this.form.stationScopes = this.form.stationScopes.map(station => ({
          ...station,
          ...emptyRateValues(),
          ...station
        }))
      }
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.validateField('stationScopes'))
    },
    onStationScopeTypeChange() {
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.validateField('stationScopes'))
    },
    onUserScopeTypeChange() {
      this.form.userScopes = []
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate('userScopes')
        }
      })
    },
    toggleAllWeekDays(checked) {
      this.selectedWeekDays = checked ? [1, 2, 3, 4, 5, 6, 7] : []
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.validateField('weekDays'))
    },
    getStationById(stationId) {
      const id = String(stationId)
      const option = this.stationOptions.find(item => item.id === id)
      if (option) return option
      const meta = this.stationMetaMap[id]
      if (!meta) return null
      return {
        id,
        name: meta.name,
        ruleId: meta.ruleId,
        merchantId: meta.merchantId
      }
    },
    buildStationScopeMeta(stationId, stationName) {
      const id = String(stationId)
      const station = this.getStationById(id)
      const meta = this.stationMetaMap[id] || {}
      const ruleId = station && station.ruleId != null ? station.ruleId : meta.ruleId
      const merchantId = station && station.merchantId != null ? station.merchantId : meta.merchantId
      return {
        dataName: stationName || meta.name || this.stationNameMap[id] || id,
        stationType: ruleId != null ? String(ruleId) : (station && station.stationType != null ? String(station.stationType) : ''),
        stationOperatorId: merchantId != null ? Number(merchantId) : null
      }
    },
    buildStationRateFields() {
      return this.showStationRateColumns ? emptyRateValues() : {}
    },
    mergeStationToList(stationId, stationName) {
      const idNum = Number(stationId)
      if (!idNum) return false
      const exists = this.form.stationScopes.some(item => Number(item.dataId) === idNum)
      if (exists) return false
      this.form.stationScopes.push({
        dataId: idNum,
        ...this.buildStationScopeMeta(stationId, stationName),
        ...this.buildStationRateFields()
      })
      return true
    },
    addSelectedStations() {
      if (!this.selectedStationIds.length) {
        this.$message.warning('请先选择电站')
        return
      }
      let addedCount = 0
      this.selectedStationIds.forEach(id => {
        const station = this.getStationById(id)
        if (station && this.mergeStationToList(station.id, station.name)) {
          addedCount++
        }
      })
      this.selectedStationIds = []
      if (!addedCount) {
        this.$message.warning('所选电站已存在')
      }
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.validateField('stationScopes'))
    },
    addBatchStations() {
      const text = (this.batchStationText || '').trim()
      if (!text) {
        this.$message.warning('请输入电站ID')
        return
      }
      const ids = text.split(/[\s,，]+/).map(item => item.trim()).filter(Boolean)
      if (!ids.length) {
        this.$message.warning('未识别到有效电站ID')
        return
      }
      let addedCount = 0
      let missCount = 0
      ids.forEach(id => {
        const station = this.getStationById(id)
        if (!station) {
          missCount++
          return
        }
        if (this.mergeStationToList(station.id, station.name)) {
          addedCount++
        }
      })
      this.batchStationText = ''
      if (!addedCount && missCount) {
        this.$message.warning('未匹配到可添加的电站')
      } else if (missCount) {
        this.$message.warning(`成功添加${addedCount}个电站，${missCount}个未匹配`)
      }
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.validateField('stationScopes'))
    },
    removeStation(index) {
      this.form.stationScopes.splice(index, 1)
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.validateField('stationScopes'))
    },
    mapUserScopesFromDetail(config) {
      const userScopeType = String(config.userScopeType || '1')
      return participantsToUserScopes(config.participants, userScopeType)
    },
    addTimeSlot() {
      this.form.timeSlots.push({
        startTime: '00:00',
        endTime: '23:59',
        sortOrder: this.form.timeSlots.length
      })
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.validateField('timeSlots'))
    },
    removeTimeSlot(index) {
      if (this.form.timeSlots.length <= 1) {
        this.$message.warning('至少保留一个时段')
        return
      }
      this.form.timeSlots.splice(index, 1)
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.validateField('timeSlots'))
    },
    mapStationScopesFromDetail(scopes, stationRates) {
      const rateMap = {}
      ;(stationRates || []).forEach(rate => {
        rateMap[String(rate.stationId)] = rate
      })
      return (scopes || []).map(scope => {
        const id = Number(scope.dataId)
        const meta = this.buildStationScopeMeta(id, scope.dataName)
        const rate = rateMap[String(id)] || {}
        return {
          dataId: id,
          dataName: meta.dataName,
          stationType: scope.stationType != null && scope.stationType !== '' ? String(scope.stationType) : meta.stationType,
          stationOperatorId: scope.stationOperatorId != null ? scope.stationOperatorId : meta.stationOperatorId,
          ...emptyRateValues(),
          ...rate
        }
      })
    },
    loadDetail() {
      if (!this.activityId) return
      this.loading = true
      activityDetail(this.activityId).then(res => {
        this.loading = false
        if (res.code !== 200 || !res.data) return
        const { activity, stationScopes, subConfig } = res.data
        const config = subConfig || {}
        const rateValues = {
          unifiedRateValue: config.unifiedRateValue != null ? String(config.unifiedRateValue) : '',
          sharpRateValue: config.sharpRateValue != null ? String(config.sharpRateValue) : '',
          peakRateValue: config.peakRateValue != null ? String(config.peakRateValue) : '',
          flatRateValue: config.flatRateValue != null ? String(config.flatRateValue) : '',
          valleyRateValue: config.valleyRateValue != null ? String(config.valleyRateValue) : ''
        }
        this.form = {
          activityId: activity.activityId || '',
          activityInitiator: activity.activityInitiator || '1',
          activityInitiatorId: activity.activityInitiator === '2'
            ? String(activity.activityInitiatorId || '')
            : '0',
          activityName: activity.activityName || '',
          timeRange: activity.activityBeginTime && activity.activityEndTime ? [activity.activityBeginTime, activity.activityEndTime] : [],
          activityRemark: activity.activityRemark || '',
          discountValueMode: this.isStationType ? String(config.discountValueMode || '1') : '1',
          discountType: String(config.discountType || '1'),
          rateType: String(config.rateType || '1'),
          rateSettingType: String(config.rateSettingType || '1'),
          ...rateValues,
          stationScopeType: String(config.stationScopeType || '1') === '3' ? '1' : String(config.stationScopeType || '1'),
          stationScopes: this.mapStationScopesFromDetail(stationScopes, config.stationRates),
          userScopeType: String(config.userScopeType || '1'),
          userScopes: this.mapUserScopesFromDetail(config),
          weekDays: this.isStationType ? String(config.weekDays || defaultWeekDays()) : defaultWeekDays(),
          timeSlots: (config.timeSlots && config.timeSlots.length ? config.timeSlots : defaultTimeSlots()).map((slot, idx) => ({
            startTime: slot.startTime || '00:00',
            endTime: slot.endTime || '23:59',
            sortOrder: slot.sortOrder != null ? Number(slot.sortOrder) : idx
          }))
        }
        this.selectedWeekDays = this.weekDaysToValues(this.form.weekDays)
        this.loadStationOptions()
      }).catch(() => {
        this.loading = false
      })
    },
    normalizeRateField(value) {
      const txt = value == null ? '' : String(value).trim()
      return txt === '' ? '' : txt
    },
    buildSubConfig() {
      const subConfig = {
        discountType: this.form.discountType,
        rateType: this.form.rateType,
        rateSettingType: this.form.rateSettingType,
        unifiedRateValue: this.normalizeRateField(this.form.unifiedRateValue),
        sharpRateValue: this.normalizeRateField(this.form.sharpRateValue),
        peakRateValue: this.normalizeRateField(this.form.peakRateValue),
        flatRateValue: this.normalizeRateField(this.form.flatRateValue),
        valleyRateValue: this.normalizeRateField(this.form.valleyRateValue),
        stationScopeType: this.form.stationScopeType,
        timeSlots: (this.form.timeSlots || []).map((slot, idx) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          sortOrder: idx
        }))
      }
      if (this.isStationType) {
        subConfig.discountValueMode = this.form.discountValueMode
        subConfig.weekDays = this.form.weekDays
        if (String(this.form.discountValueMode) === '2') {
          subConfig.stationRates = this.form.stationScopes.map(station => ({
            stationId: Number(station.dataId),
            stationName: station.dataName,
            unifiedRateValue: this.normalizeRateField(station.unifiedRateValue),
            sharpRateValue: this.normalizeRateField(station.sharpRateValue),
            peakRateValue: this.normalizeRateField(station.peakRateValue),
            flatRateValue: this.normalizeRateField(station.flatRateValue),
            valleyRateValue: this.normalizeRateField(station.valleyRateValue)
          }))
        } else {
          subConfig.stationRates = []
        }
      }
      if (this.isUserType) {
        subConfig.userScopeType = this.form.userScopeType
        subConfig.participants = userScopesToParticipants(this.form.userScopes, this.form.userScopeType)
      }
      return subConfig
    },
    buildPayload() {
      const initiator = normalizeInitiatorPayload(this.form, this.adminUser)
      const activity = {
        activityId: this.form.activityId || '',
        activityName: this.form.activityName,
        activityType: String(this.activityType),
        activityInitiator: initiator.activityInitiator,
        activityInitiatorId: initiator.activityInitiatorId,
        activityBeginTime: this.form.timeRange[0],
        activityEndTime: this.form.timeRange[1],
        activityRemark: this.form.activityRemark || ''
      }
      const stationScopes = (this.form.stationScopes || []).map(item => {
        const meta = this.buildStationScopeMeta(item.dataId, item.dataName)
        return {
          dataId: Number(item.dataId),
          dataName: meta.dataName,
          stationType: item.stationType != null && item.stationType !== '' ? String(item.stationType) : meta.stationType,
          stationOperatorId: item.stationOperatorId != null ? item.stationOperatorId : meta.stationOperatorId
        }
      })
      const userScopes = []

      return {
        activity,
        rewards: [],
        userScopes,
        stationScopes,
        subConfig: this.buildSubConfig()
      }
    },
    handleSubmit() {
      if (this.isUserType && this.$refs.userScopePicker && this.$refs.userScopePicker.emitCustomerScopes) {
        this.$refs.userScopePicker.emitCustomerScopes()
        if (this.$refs.userScopePicker.emitGroupScopes && String(this.form.userScopeType) === '1') {
          this.$refs.userScopePicker.emitGroupScopes()
        }
      }
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        const payload = this.buildPayload()
        this.submitting = true
        const api = this.isEdit ? updateActivity : saveActivity
        api(payload).then(res => {
          this.submitting = false
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.visibleSync = false
            this.$emit('saved')
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        }).catch(() => {
          this.submitting = false
        })
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
  flex-shrink: 0;
}
.station-batch-actions {
  margin-top: 8px;
}
.week-days-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.time-slot-editor__toolbar {
  margin-bottom: 10px;
}
.time-slot-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.time-slot-row:last-child {
  margin-bottom: 0;
}
.time-slot-row__label {
  width: 56px;
  color: #606266;
  flex-shrink: 0;
}
</style>
