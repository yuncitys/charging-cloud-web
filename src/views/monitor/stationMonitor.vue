<template>
  <div class="app-container station-monitor">
    <div class="filter-container">
      <el-select
        v-model="stationId"
        class="filter-item"
        style="width: 260px; margin-right: 20px;"
        filterable
        remote
        clearable
        reserve-keyword
        placeholder="请选择充电站"
        :remote-method="searchStations"
        :loading="stationLoading"
        @visible-change="onStationVisible"
        @change="onStationChange"
      >
        <el-option
          v-for="item in stationOptions"
          :key="item.id"
          :label="item.networkName"
          :value="item.id"
        />
      </el-select>
      <el-input
        v-model="listQuery.deviceCode"
        class="filter-item"
        style="width: 180px; margin-right: 20px;"
        placeholder="请输入桩编号"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-input
        v-model="listQuery.gunNumber"
        class="filter-item"
        style="width: 140px; margin-right: 20px;"
        placeholder="请输入枪编号"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-select
        v-model="listQuery.sort"
        class="filter-item"
        style="width: 140px; margin-right: 20px;"
        placeholder="排序"
        @change="handleFilter"
      >
        <el-option label="默认" value="" />
        <el-option label="枪编号" value="gunCode" />
      </el-select>
      <el-button type="primary" size="mini" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button size="mini" class="filter-item" icon="el-icon-refresh" @click="handleReset">重置</el-button>
    </div>

    <div
      ref="monitorStage"
      class="monitor-stage"
      :class="{ 'is-fullscreen': isFullscreen }"
    >
    <div class="summary-strip">
      <div class="summary-power">
        <div class="summary-metric">
          <span class="summary-metric__label">额定功率</span>
          <div class="summary-metric__value">
            <span class="summary-metric__num">{{ dispPowerNum(summary.ratedPowerKw) }}</span>
            <span v-if="hasPower(summary.ratedPowerKw)" class="summary-metric__unit">kW</span>
          </div>
        </div>
        <div class="summary-metric">
          <span class="summary-metric__label">实时功率</span>
          <div class="summary-metric__value">
            <span class="summary-metric__num">{{ dispPowerNum(summary.realtimePowerKw) }}</span>
            <span v-if="hasPower(summary.realtimePowerKw)" class="summary-metric__unit">kW</span>
          </div>
        </div>
      </div>
      <div class="summary-strip__divider" />
      <div class="status-bar">
        <div
          v-for="tab in statusTabs"
          :key="'tab-' + String(tab.value)"
          class="status-chip"
          :class="['status-chip--' + tab.tone, { 'is-active': isTabActive(tab.value) }]"
          @click="onTabChange(tab.value)"
        >
          <span class="status-chip__name">{{ tab.name }}</span>
          <span class="status-chip__num">{{ tabCount(tab.countKey) }}</span>
        </div>
      </div>
    </div>

    <div v-if="!hasStation" class="empty-hint">请选择站点后查看监控</div>
    <el-card
      v-else
      class="content-card"
      shadow="never"
      v-loading="loading && !piles.length"
    >
      <div slot="header" class="content-card__head">
        <div class="content-card__left">
          <span class="content-card__station">{{ selectedStationName }}</span>
          <el-radio-group v-model="viewMode" size="small" class="content-card__tabs">
            <el-radio-button label="thumb">实时缩略</el-radio-button>
            <el-radio-button label="detail">实时详情</el-radio-button>
          </el-radio-group>
        </div>
        <el-button
          type="primary"
          size="mini"
          class="content-card__fullscreen"
          :icon="isFullscreen ? 'el-icon-close' : 'el-icon-full-screen'"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? '退出全屏' : '全屏展示' }}
        </el-button>
      </div>
      <div v-if="viewMode === 'thumb'" class="pile-grid">
        <el-card
          v-for="pile in displayPiles"
          :key="pile.deviceCode"
          class="pile-card"
          :class="{ 'pile-card--wide': isWidePile(pile) }"
          shadow="never"
        >
          <div slot="header" class="pile-card__head">
            <span>桩 {{ disp(pile.deviceCode) }}</span>
          </div>
          <div class="gun-row">
            <div
              v-for="gun in sortedGuns(pile)"
              :key="gunKey(gun)"
              class="gun-col"
              :class="'gun-col--' + statusTone(gun)"
            >
              <div class="gun-col__status">
                <span class="gun-col__title">
                  <span>{{ gunTitle(gun) }}</span>
                  <span v-if="gun.parkingNo" class="gun-col__parking"> · 车位 {{ gun.parkingNo }}</span>
                </span>
                <span>{{ statusText(gun) }}</span>
              </div>
              <div class="gun-col__body">
                <div v-for="row in cardFields(gun)" :key="row.label" class="gun-kv">
                  <span>{{ row.label }}</span>
                  <span>{{ row.value }}</span>
                </div>
              </div>
              <div class="gun-actions">
                <el-button size="mini" class="gun-action-btn" @click="openEvents(gun)">状态日志</el-button>
                <el-dropdown trigger="click" class="gun-action-dropdown" @command="cmd => onMoreCommand(cmd, gun)">
                  <el-button size="mini" class="gun-action-btn">
                    更多操作<i class="el-icon-arrow-down el-icon--right" />
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-if="isCharging(gun)" command="stop">停止充电</el-dropdown-item>
                    <el-dropdown-item command="more">设备详情</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div v-else class="detail-list">
        <el-card
          v-for="gun in flatGuns"
          :key="gunKey(gun)"
          class="detail-card"
          shadow="never"
        >
          <div slot="header" class="detail-card__head">
            <div>
              <span class="detail-card__code">{{ detailGunTitle(gun) }}</span>
              <el-tag size="mini" :type="statusTagType(gun)" class="detail-card__tag">{{ statusText(gun) }}</el-tag>
            </div>
            <div class="detail-card__actions">
              <el-button size="mini" class="gun-action-btn" @click="openEvents(gun)">状态日志</el-button>
              <el-dropdown trigger="click" @command="cmd => onMoreCommand(cmd, gun)">
                <el-button size="mini" class="gun-action-btn">
                  更多操作<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="isCharging(gun)" command="stop">停止充电</el-dropdown-item>
                  <el-dropdown-item command="more">设备详情</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <div class="detail-grid">
            <div class="detail-grid__col">
              <div v-for="row in detailLeftFields(gun)" :key="row.label" class="detail-grid__item">
                <span class="detail-grid__label">{{ row.label }}</span>
                <span class="detail-grid__value">{{ row.value }}</span>
              </div>
            </div>
            <div class="detail-grid__col">
              <div v-for="row in detailRightFields(gun)" :key="row.label" class="detail-grid__item">
                <span class="detail-grid__label">{{ row.label }}</span>
                <span class="detail-grid__value">{{ row.value }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div v-if="!loading && !piles.length" class="empty-hint">暂无符合条件的汽车桩</div>
    </el-card>
    </div>

    <gun-status-event-dialog ref="eventDialog" />
  </div>
</template>

<script>
import { getStationMonitorSummary, getStationMonitorPiles } from '@/api/monitor/stationMonitor'
import { getList as getNetworkDotPage } from '@/api/netWorkDot/netWorkDotList'
import { closeDevice } from '@/api/device/deviceList'
import { parseTime } from '@/utils/index'
import screenfull from 'screenfull'
import GunStatusEventDialog from './components/GunStatusEventDialog.vue'

const POLL_MS = 8000
const FAIL_TOAST_MS = 30000
const MISSING = '-'

export default {
  name: 'StationMonitor',
  components: { GunStatusEventDialog },
  data() {
    return {
      stationId: '',
      stationOptions: [],
      stationLoading: false,
      viewMode: 'thumb',
      tabStatus: null,
      listQuery: {
        deviceCode: '',
        gunNumber: '',
        sort: ''
      },
      summary: {},
      piles: [],
      loading: false,
      pollTimer: null,
      loadSeq: 0,
      lastFailToastAt: 0,
      isFullscreen: false,
      statusTabs: [
        { name: '全部', value: null, countKey: 'totalCount', tone: 'all' },
        { name: '故障', value: 3, countKey: 'faultCount', tone: 'fault' },
        { name: '离线', value: 2, countKey: 'offlineCount', tone: 'offline' },
        { name: '占用', value: 4, countKey: 'occupyCount', tone: 'occupy' },
        { name: '充电中', value: 1, countKey: 'chargingCount', tone: 'charging' },
        { name: '空闲', value: 0, countKey: 'idleCount', tone: 'idle' },
        { name: '其他', value: 99, countKey: 'otherCount', tone: 'other' }
      ]
    }
  },
  computed: {
    hasStation() {
      return this.stationId !== null && this.stationId !== '' && this.stationId !== undefined
    },
    displayPiles() {
      return Array.isArray(this.piles) ? this.piles : []
    },
    flatGuns() {
      const guns = []
      this.displayPiles.forEach(pile => {
        this.sortedGuns(pile).forEach(gun => guns.push(gun))
      })
      return guns
    },
    selectedStationName() {
      const hit = (this.stationOptions || []).find(item => String(item.id) === String(this.stationId))
      if (hit && hit.networkName) return hit.networkName
      if (this.summary && this.summary.networkName) return this.summary.networkName
      return MISSING
    }
  },
  created() {
    const query = this.$route.query || {}
    if (query.stationId) {
      this.stationId = Number(query.stationId) || query.stationId
    }
    if (query.tabStatus !== undefined && query.tabStatus !== '' && query.tabStatus !== 'null') {
      const n = Number(query.tabStatus)
      this.tabStatus = isNaN(n) ? null : n
    }
    if (this.$dict && this.$dict.getSelector) {
      this.$dict.getSelector('electric_out_type')
    }
    this.searchStations('').then(() => {
      if (!this.hasStation && this.stationOptions.length) {
        this.stationId = this.stationOptions[0].id
      }
      if (this.hasStation) {
        this.loadAll()
        this.startPoll()
      }
    })
    this.setupFullscreen()
  },
  beforeDestroy() {
    this.clearPoll()
    this.teardownFullscreen()
  },
  methods: {
    searchStations(query) {
      this.stationLoading = true
      return getNetworkDotPage({
        page: 1,
        limit: 20,
        type: 1,
        ruleId: 2,
        networkName: (query || '').trim()
      }).then(res => {
        this.stationLoading = false
        if (res && Number(res.code) === 200) {
          const list = Array.isArray(res.data) ? res.data : []
          this.mergeStationOptions(list)
          return
        }
        if (res && (Number(res.code) === 401 || Number(res.code) === 403)) {
          this.$message.error(res.msg || '没有访问权限，请联系管理员授权')
        }
      }).catch(() => {
        this.stationLoading = false
      })
    },
    mergeStationOptions(list) {
      const map = {}
      ;(list || []).forEach(item => {
        if (item && item.id != null) map[item.id] = item
      })
      this.stationOptions = Object.keys(map).map(id => map[id])
      this.ensureCurrentStationOption()
    },
    ensureCurrentStationOption() {
      if (!this.hasStation) return
      const exists = this.stationOptions.some(item => String(item.id) === String(this.stationId))
      if (!exists && this.summary && this.summary.networkName) {
        this.stationOptions = [{
          id: this.stationId,
          networkName: this.summary.networkName
        }].concat(this.stationOptions)
      }
    },
    onStationVisible(visible) {
      if (visible && !this.stationOptions.length) {
        this.searchStations('')
      }
    },
    onStationChange() {
      this.summary = {}
      this.piles = []
      this.clearPoll()
      if (!this.hasStation) return
      this.loadAll()
      this.startPoll()
    },
    handleFilter() {
      if (!this.hasStation) return
      this.loadAll()
    },
    handleReset() {
      this.listQuery.deviceCode = ''
      this.listQuery.gunNumber = ''
      this.listQuery.sort = ''
      if (this.hasStation) this.loadAll()
    },
    toggleFullscreen() {
      if (!screenfull.enabled) {
        this.$message.warning('当前浏览器不支持全屏')
        return
      }
      const el = this.$refs.monitorStage
      if (!el) return
      screenfull.toggle(el)
    },
    onFullscreenChange() {
      this.isFullscreen = !!(screenfull.isFullscreen)
    },
    setupFullscreen() {
      if (!screenfull.enabled) return
      screenfull.on('change', this.onFullscreenChange)
    },
    teardownFullscreen() {
      if (!screenfull.enabled) return
      screenfull.off('change', this.onFullscreenChange)
    },
    isTabActive(value) {
      if (value === null) return this.tabStatus === null
      return this.tabStatus === value
    },
    tabCount(key) {
      const n = this.summary && this.summary[key]
      return n == null ? 0 : n
    },
    onTabChange(value) {
      this.tabStatus = value
      if (!this.hasStation) return
      this.loadAll()
    },
    startPoll() {
      this.clearPoll()
      this.pollTimer = setInterval(() => this.loadAll(true), POLL_MS)
    },
    clearPoll() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    buildPileParams() {
      const params = {}
      if (this.tabStatus !== null) params.tabStatus = this.tabStatus
      const deviceCode = (this.listQuery.deviceCode || '').trim()
      if (deviceCode) params.deviceCode = deviceCode
      const gun = this.listQuery.gunNumber
      if (gun !== '' && gun != null) {
        const n = Number(gun)
        if (!isNaN(n)) params.gunNumber = n
      }
      if (this.listQuery.sort) params.sort = this.listQuery.sort
      return params
    },
    loadAll(silent) {
      if (!this.hasStation) return
      const seq = ++this.loadSeq
      if (!silent) this.loading = true
      Promise.all([this.fetchSummary(silent, seq), this.fetchPiles(silent, seq)]).then(() => {
        if (seq !== this.loadSeq) return
        this.loading = false
        this.ensureCurrentStationOption()
      }).catch(() => {
        if (seq !== this.loadSeq) return
        this.loading = false
      })
    },
    fetchSummary(silent, seq) {
      return getStationMonitorSummary(this.stationId).then(res => {
        if (seq !== this.loadSeq) return
        if (res && Number(res.code) === 200 && res.data) {
          this.summary = res.data
          return
        }
        this.handleBizFail(res, silent)
      }).catch(() => {
        if (seq !== this.loadSeq) return
        if (silent) {
          console.warn('station monitor poll failed, keeping last data')
          return
        }
        this.toastKeepOld(silent)
      })
    },
    fetchPiles(silent, seq) {
      return getStationMonitorPiles(this.stationId, this.buildPileParams()).then(res => {
        if (seq !== this.loadSeq) return
        if (res && Number(res.code) === 200) {
          this.piles = Array.isArray(res.data) ? res.data : []
          return
        }
        this.handleBizFail(res, silent)
      }).catch(() => {
        if (seq !== this.loadSeq) return
        if (silent) {
          console.warn('station monitor poll failed, keeping last data')
          return
        }
        this.toastKeepOld(silent)
      })
    },
    handleBizFail(res, silent) {
      const code = res && Number(res.code)
      const msg = (res && res.msg) || '加载失败'
      if (silent) {
        console.warn('station monitor poll biz fail, keeping last data', msg)
        return
      }
      if (code === 401 || code === 403) {
        this.toastOnce(msg)
        return
      }
      this.toastOnce(msg)
    },
    toastKeepOld(silent) {
      if (!silent && !this.piles.length && !this.summary.totalCount) {
        this.toastOnce('网络异常，请稍后重试')
        return
      }
      this.toastOnce('刷新失败，已保留上次数据')
    },
    toastOnce(msg) {
      const now = Date.now()
      if (now - this.lastFailToastAt < FAIL_TOAST_MS) return
      this.lastFailToastAt = now
      this.$message.warning(msg)
    },
    gunKey(gun) {
      return (gun.deviceCode || '') + '-' + (gun.gunNumber != null ? gun.gunNumber : '')
    },
    sortedGuns(pile) {
      const guns = (pile && Array.isArray(pile.guns)) ? pile.guns.slice() : []
      return guns.sort((a, b) => Number(a.gunNumber || 0) - Number(b.gunNumber || 0))
    },
    isWidePile(pile) {
      return this.sortedGuns(pile).length > 2
    },
    gunTitle(gun) {
      const name = gun && gun.gunName
      if (name != null && String(name).trim() !== '') return String(name).trim()
      return this.formatGun(gun && gun.gunNumber)
    },
    disp(v) {
      if (v == null || v === '') return MISSING
      return v
    },
    dispPower(v) {
      if (v == null || v === '') return MISSING
      return Number(v) + ' kW'
    },
    hasPower(v) {
      return v != null && v !== '' && !isNaN(Number(v))
    },
    dispPowerNum(v) {
      if (!this.hasPower(v)) return MISSING
      const n = Number(v)
      return Number.isInteger(n) ? String(n) : n.toFixed(2)
    },
    dispEnergy(v) {
      if (v == null || v === '') return MISSING
      return Number(v) + ' kWh'
    },
    dispSoc(v) {
      if (v == null || v === '') return MISSING
      return v + '%'
    },
    dispMinutes(v) {
      if (v == null || v === '') return MISSING
      const n = Number(v)
      if (isNaN(n)) return MISSING
      if (n < 60) return n + '分钟'
      const h = Math.floor(n / 60)
      const m = n % 60
      return m ? (h + '小时' + m + '分钟') : (h + '小时')
    },
    dispTime(v) {
      const text = parseTime(v)
      return text || MISSING
    },
    dispTemp(v) {
      if (v == null || v === '') return MISSING
      return Number(v) + ' ℃'
    },
    dispAmp(v) {
      if (v == null || v === '') return MISSING
      return Number(v) + ' A'
    },
    dispVolt(v) {
      if (v == null || v === '') return MISSING
      return Number(v) + ' V'
    },
    dispElectric(v) {
      if (v == null || v === '') return MISSING
      return this.$dict && this.$dict.formatElectricOutType
        ? (this.$dict.formatElectricOutType(v) || MISSING)
        : MISSING
    },
    dispEnergyDetail(v) {
      if (v == null || v === '') return MISSING
      return Number(v) + 'kW.h'
    },
    dispTimeShort(v) {
      const text = parseTime(v, '{m}-{d} {h}:{i}')
      return text || MISSING
    },
    dispAmpDetail(v) {
      if (v == null || v === '') return MISSING
      return Number(v) + ' (A)'
    },
    dispVoltDetail(v) {
      if (v == null || v === '') return MISSING
      return Number(v) + ' (V)'
    },
    dispChargeDuration(gun) {
      if (!gun || !gun.chargeStartTime) return MISSING
      const start = new Date(String(gun.chargeStartTime).replace(/-/g, '/')).getTime()
      if (isNaN(start)) return MISSING
      let end = Date.now()
      if (gun.chargeEndTime) {
        const endTs = new Date(String(gun.chargeEndTime).replace(/-/g, '/')).getTime()
        if (!isNaN(endTs)) end = endTs
      }
      if (end < start) return MISSING
      return this.dispMinutes(Math.floor((end - start) / 60000))
    },
    detailGunCode(gun) {
      if (gun && gun.gunCode) return String(gun.gunCode)
      if (!gun || !gun.deviceCode) return MISSING
      const n = this.formatGun(gun.gunNumber)
      return n === MISSING ? String(gun.deviceCode) : String(gun.deviceCode) + n
    },
    detailGunTitle(gun) {
      const code = this.detailGunCode(gun)
      return code === MISSING ? '充电桩' : ('充电桩' + code)
    },
    formatGun(n) {
      if (n == null || n === '') return MISSING
      const num = Number(n)
      if (isNaN(num)) return String(n)
      return num < 10 ? '0' + num : String(num)
    },
    isCharging(gun) {
      return Number(gun && gun.status) === 1
    },
    isOccupy(gun) {
      const s = Number(gun && gun.status)
      return s === 4 || s === 5
    },
    isFaultOrOffline(gun) {
      const s = Number(gun && gun.status)
      return s === 2 || s === 3
    },
    statusText(gun) {
      if (gun && gun.occupyPhaseLabel) return gun.occupyPhaseLabel
      if (gun && gun.statusLabel) return gun.statusLabel
      const map = { 0: '空闲', 1: '充电中', 2: '离线', 3: '故障', 4: '占用', 5: '预约' }
      return map[Number(gun && gun.status)] || '其他'
    },
    statusTone(gun) {
      const s = Number(gun && gun.status)
      if (s === 1) return 'charging'
      if (s === 2) return 'offline'
      if (s === 3) return 'fault'
      if (s === 4 || s === 5) return 'occupy'
      if (s === 0) return 'idle'
      return 'other'
    },
    statusTagType(gun) {
      const tone = this.statusTone(gun)
      if (tone === 'idle') return 'success'
      if (tone === 'charging') return ''
      if (tone === 'occupy') return 'warning'
      if (tone === 'fault') return 'danger'
      if (tone === 'offline') return 'info'
      return 'info'
    },
    cardFields(gun) {
      if (this.isCharging(gun)) {
        return [
          { label: '实时/需求功率', value: this.dispPower(gun.realtimePowerKw) + ' / ' + this.dispPower(gun.requirePowerKw) },
          { label: '电量', value: this.dispEnergy(gun.chargedKwh) },
          { label: 'SOC', value: this.dispSoc(gun.realtimeSoc) },
          { label: '预计剩余时长', value: this.dispMinutes(gun.remainMinutes) },
          { label: '车牌', value: this.disp(gun.plateNumber) },
          { label: '用户标签', value: this.disp(gun.userLabel) }
        ]
      }
      if (this.isOccupy(gun) && gun.occupyPhase === 'AFTER_CHARGE') {
        return [
          { label: '上次 SOC', value: this.dispSoc(gun.lastSoc) },
          { label: '车牌', value: this.disp(gun.plateNumber || gun.lastPlateNumber) },
          { label: '占用时长', value: this.dispMinutes(gun.occupyMinutes) },
          { label: '停止原因', value: this.disp(gun.stopReason) }
        ]
      }
      if (this.isOccupy(gun)) {
        return [
          { label: '占用时长', value: this.dispMinutes(gun.occupyMinutes) },
          { label: '开始时间', value: this.dispTime(gun.occupyStartTime) },
          { label: '车牌', value: this.disp(gun.plateNumber || gun.lastPlateNumber) },
          { label: '用户标签', value: this.disp(gun.userLabel) }
        ]
      }
      if (this.isFaultOrOffline(gun)) {
        return [
          { label: '简要原因', value: this.disp(gun.lastAlarmReason) }
        ]
      }
      return [
        { label: '车位', value: this.disp(gun.parkingNo) },
        { label: '上次车牌', value: this.disp(gun.lastPlateNumber) },
        { label: '上次结束', value: this.dispTime(gun.lastEndTime) },
        { label: '上次 SOC', value: this.dispSoc(gun.lastSoc) }
      ]
    },
    detailLeftFields(gun) {
      const charging = this.isCharging(gun)
      return [
        { label: '枪编号', value: this.detailGunCode(gun) },
        { label: '插枪时间', value: this.dispTimeShort(gun.plugTime) },
        { label: '充电时间', value: this.dispTimeShort(gun.chargeStartTime) },
        { label: '结束时间', value: this.dispTimeShort(gun.chargeEndTime) },
        { label: '预计剩余时长', value: this.dispMinutes(gun.remainMinutes) },
        { label: '充电时长', value: this.dispChargeDuration(gun) },
        { label: '充电电量', value: this.dispEnergyDetail(gun.chargedKwh) },
        { label: charging ? '车牌号' : '上次车牌号', value: this.disp(charging ? gun.plateNumber : (gun.lastPlateNumber || gun.plateNumber)) },
        { label: 'VIN码', value: this.disp(gun.vinCode) },
        { label: '电卡号', value: this.disp(gun.cardNo) }
      ]
    },
    detailRightFields(gun) {
      const charging = this.isCharging(gun)
      const rows = []
      if (charging) {
        rows.push({ label: '初始SOC', value: this.dispSoc(gun.startSoc) })
        rows.push({ label: '实时SOC', value: this.dispSoc(gun.realtimeSoc) })
      } else {
        rows.push({ label: '上次SOC', value: this.dispSoc(gun.lastSoc) })
      }
      rows.push(
        { label: '电池温度', value: this.dispTemp(gun.batteryTemperature) },
        { label: '枪端温度', value: this.dispTemp(gun.gunTemperature) },
        { label: '输出电流', value: this.dispAmpDetail(gun.outputCurrent) },
        { label: '输出电压', value: this.dispVoltDetail(gun.outputVoltage) },
        { label: '需求电流', value: this.dispAmpDetail(gun.requireCurrent) },
        { label: '需求电压', value: this.dispVoltDetail(gun.requireVoltage) },
        { label: '用户标签', value: this.disp(gun.userLabel) }
      )
      return rows
    },
    openEvents(gun) {
      if (this.$refs.eventDialog) {
        this.$refs.eventDialog.open(gun.deviceCode, gun.gunNumber)
      }
    },
    goMore(gun) {
      const query = { deviceCode: gun.deviceCode }
      if (gun.deviceId) query.id = gun.deviceId
      this.$router.push({ path: '/device/setCarDevice', query })
    },
    onMoreCommand(cmd, gun) {
      if (cmd === 'stop') {
        this.stopCharge(gun)
        return
      }
      if (cmd === 'more') {
        this.goMore(gun)
      }
    },
    stopCharge(gun) {
      if (!this.isCharging(gun)) return
      this.$confirm('确认停止该枪充电？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return closeDevice({
          deviceCode: gun.deviceCode,
          port: gun.gunNumber
        })
      }).then(res => {
        if (!res) return
        if (Number(res.code) === 200) {
          this.$message.success(res.msg || '已下发停充')
          this.loadAll(true)
          return
        }
        this.$message.error(res.msg || '停充失败')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.summary-strip {
  display: flex;
  align-items: stretch;
  margin: 4px 0 16px;
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;
}

.summary-power {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 40px;
  padding-right: 20px;
}

.summary-metric__label {
  display: block;
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

.summary-metric__value {
  display: flex;
  align-items: baseline;
  margin-top: 4px;
  gap: 4px;
}

.summary-metric__num {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.summary-metric__unit {
  font-size: 12px;
  color: #909399;
}

.summary-strip__divider {
  width: 1px;
  margin: 0 16px;
  background: #e4e7ed;
  align-self: stretch;
}

.view-switch {
  margin-left: 12px;
}

.monitor-stage.is-fullscreen,
.monitor-stage:fullscreen {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
  background: #f5f7fa;
  overflow: auto;
}

.station-monitor >>> .el-card__header {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 10px 16px;
  box-sizing: border-box;
  border-bottom: none;
}

.content-card {
  margin-top: 0;
}

.content-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.content-card__left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.content-card__station {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.content-card__tabs {
  flex-shrink: 0;
}

.content-card__tabs >>> .el-radio-button__inner {
  color: #606266;
}

.content-card__tabs >>> .el-radio-button__inner:hover {
  color: #07b161;
}

.content-card__tabs >>> .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  color: #fff;
  background-color: #07b161;
  border-color: #07b161;
  box-shadow: -1px 0 0 0 #07b161;
}

.content-card__fullscreen {
  flex-shrink: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 32px;
}

.detail-grid__col {
  min-width: 0;
}

.detail-grid__item {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  line-height: 1.5;
}

.detail-grid__label {
  flex: 0 0 auto;
  color: #909399;
  white-space: nowrap;
}

.detail-grid__label::after {
  content: '：';
}

.detail-grid__value {
  flex: 1;
  min-width: 0;
  color: #303133;
  word-break: break-all;
}

.content-card >>> .el-card__body {
  padding: 16px;
}

.status-bar {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.status-chip {
  min-width: 72px;
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  text-align: center;
}

.status-chip__name {
  display: block;
  font-size: 12px;
  color: #909399;
}

.status-chip__num {
  display: block;
  margin-top: 2px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.status-chip.is-active {
  box-shadow: 0 0 0 1px currentColor inset;
}

.status-chip--fault.is-active,
.status-chip--fault .status-chip__num { color: #F56C6C; }
.status-chip--offline.is-active,
.status-chip--offline .status-chip__num { color: #909399; }
.status-chip--occupy.is-active,
.status-chip--occupy .status-chip__num { color: #E6A23C; }
.status-chip--charging.is-active,
.status-chip--charging .status-chip__num { color: #409EFF; }
.status-chip--idle.is-active,
.status-chip--idle .status-chip__num { color: #67C23A; }
.status-chip--other.is-active,
.status-chip--other .status-chip__num { color: #606266; }
.status-chip--all.is-active,
.status-chip--all .status-chip__num { color: #303133; }

.empty-hint {
  padding: 48px 0;
  text-align: center;
  color: #909399;
}

.pile-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.pile-card {
  width: calc(50% - 8px);
  min-width: 520px;
  box-sizing: border-box;
}

.pile-card--wide {
  width: 100%;
  min-width: 0;
}

.pile-card__head {
  width: 100%;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.gun-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.gun-col {
  display: flex;
  flex-direction: column;
  flex: 1 1 180px;
  min-width: 180px;
  max-width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  box-sizing: border-box;
}

.pile-card--wide .gun-col {
  flex: 0 0 calc((100% - 36px) / 4);
  width: calc((100% - 36px) / 4);
  min-width: 0;
  max-width: calc((100% - 36px) / 4);
}

.gun-col__status {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  background: #909399;
}

.gun-col__title {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

.gun-col__parking {
  font-weight: 500;
  opacity: 0.95;
}

.gun-col--idle .gun-col__status { background: #67C23A; }
.gun-col--charging .gun-col__status { background: #409EFF; }
.gun-col--occupy .gun-col__status { background: #E6A23C; }
.gun-col--fault .gun-col__status { background: #F56C6C; }
.gun-col--offline .gun-col__status { background: #909399; }
.gun-col--other .gun-col__status { background: #606266; }

.gun-col__body {
  flex: 1;
}

.gun-kv {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  font-size: 12px;
  color: #606266;
}

.gun-kv span:last-child {
  color: #303133;
  margin-left: 8px;
  text-align: right;
  word-break: break-all;
}

.gun-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  margin-top: auto;
  border-top: 1px solid #ebeef5;
}

.gun-action-btn {
  width: 100%;
  margin: 0 !important;
  padding: 8px 4px;
  border-radius: 0;
  border: none;
  border-left: 1px solid #ebeef5;
  color: #303133 !important;
  background: #fff !important;
}

.gun-actions > .gun-action-btn {
  border-left: none;
}

.gun-action-dropdown {
  width: 100%;
}

.gun-action-dropdown .gun-action-btn {
  width: 100%;
}

.detail-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.detail-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-card__actions .gun-action-btn {
  width: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 7px 12px;
}

.detail-card {
  margin-bottom: 12px;
}

.detail-card__code {
  margin-right: 8px;
  font-weight: 600;
}

.detail-card__tag {
  vertical-align: middle;
}

@media (max-width: 1200px) {
  .pile-card {
    width: 100%;
    min-width: 0;
  }

  .pile-card--wide .gun-col {
    flex: 0 0 calc((100% - 12px) / 2);
    width: calc((100% - 12px) / 2);
    max-width: calc((100% - 12px) / 2);
  }

  .summary-strip {
    flex-direction: column;
    gap: 12px;
  }

  .summary-power {
    padding-right: 0;
  }

  .summary-strip__divider {
    width: auto;
    height: 1px;
    margin: 0;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .content-card__left {
    flex-wrap: wrap;
  }
}
</style>
