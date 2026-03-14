<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>站点设置</span>
        <div style="float: right;">
          <!-- <el-tag v-if="station.merchantName" style="margin-right: 10px;">{{ station.merchantName }}</el-tag>
          <el-tag v-if="station.networkName" type="info" style="margin-right: 10px;">{{ station.networkName }}</el-tag> -->
          <el-button size="mini" type="primary" @click="$router.back()">返回</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="详情" name="detail" />
        <el-tab-pane label="抽成规则" name="commission" />
        <el-tab-pane label="分账设置" name="split" />
      </el-tabs>

      <div v-show="activeTab === 'detail'" v-loading="loadingStation" element-loading-text="拼命加载中......">
        <el-form :model="station" label-position="left" label-width="120px" size="medium" disabled>
          <el-divider content-position="left">基础信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="充电站类型">
                <el-radio-group v-model="station.ruleId">
                  <el-radio :label="1">单车充电站</el-radio>
                  <el-radio :label="2">汽车充电站</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="运营商户">
                <el-select v-model="station.merchantId" filterable clearable style="width: 100%;">
                  <el-option v-for="item in merchantList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="station.ruleId == 2">
              <el-form-item label="计费标准">
                <el-select v-model="station.pricingRuleId" filterable clearable style="width: 100%;">
                  <el-option v-for="item in priceTypeList" :key="item.id" :label="item.feeName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="站点名称">
                <el-input v-model="station.networkName" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="充电站位置">
                <el-input v-model="station.networkAddress" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="充电站经度">
                <el-input v-model="station.networkLongitude" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="充电站纬度">
                <el-input v-model="station.networkLatitude" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="投放地查询">
                <el-input v-model="mapInput" placeholder="请输入大概地址查询" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item>
                <el-tag type="warning" style="font-size: 16px;">在投放地输入框内查询小区位置后，可点击地图再次选取更详细的楼层或街道地址</el-tag>
              </el-form-item>
            </el-col>
          </el-row>

          <div id="GDMapSetting" style="height:400px;width: 900px;margin: 60px 0;" v-show="activeTab === 'detail'"></div>

          <el-divider content-position="left">监管信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="电站位置">
                <el-radio-group v-model="station.locationAddress">
                  <el-radio :label="1">地上电站</el-radio>
                  <el-radio :label="2">地下电站</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="可用电容">
                <el-input v-model="station.capacity" type="number">
                  <template slot="append">KWA</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="电站类型">
                <el-select v-model="station.stationType" filterable clearable style="width: 100%;">
                  <el-option v-for="item in stationTypeList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="建设场所">
                <el-select v-model="station.buildAddress" filterable clearable style="width: 100%;">
                  <el-option v-for="item in buildAddressList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="人员值守">
                <el-radio-group v-model="station.isDuty">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="独立报装">
                <el-radio-group v-model="station.isAloneApply">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公共停车场">
                <el-radio-group v-model="station.isPublicParkingLot">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">运营信息</el-divider>
          <el-row>
            <el-col :span="24">
              <el-form-item label="站场辅助设备">
                <el-checkbox v-model="station.isBarrierGate" label="道闸">道闸</el-checkbox>
                <el-checkbox v-model="station.isLockFlag" label="地锁">地锁</el-checkbox>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="营业时间">
                <el-time-picker
                  is-range
                  v-model="station.businessHours"
                  value-format="HH:mm:ss"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="管理员电话">
                <el-input v-model="station.phone" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="停车收费模式">
                <el-select v-model="station.parkFeeType" filterable clearable style="width: 100%;">
                  <el-option v-for="item in parkFeeType" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="停车收费提示">
                <el-input v-model="station.parkFeeTip" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="站点标签">
                <el-select v-model="station.stationTag" multiple collapse-tags style="width: 100%;">
                  <el-option v-for="item in stationTagList" :key="item.id + ''" :label="item.name" :value="item.id + ''" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="站场备注">
                <el-input v-model="station.remark" type="textarea" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">审计信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="创建用户">
                <el-input v-model="station.createUser" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创建时间">
                <el-input v-model="station.createTime" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新用户">
                <el-input v-model="station.updateUser" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新时间">
                <el-input v-model="station.updateTime" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div v-show="activeTab === 'commission'" v-loading="loadingCommission" element-loading-text="拼命加载中......">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span>抽成规则</span>
            <div style="float: right;">
              <el-tag :type="commissionExists ? 'success' : 'info'" style="margin-right: 10px;">{{ commissionExists ? (commission.collectFlag == '1' ? '收取' : '不收取') : '未配置' }}</el-tag>
              <el-button size="mini" type="primary" @click="openCommissionEdit">{{ commissionExists ? '修改' : '配置规则' }}</el-button>
            </div>
          </div>

          <el-form :model="commission" label-width="160px" size="medium" disabled>
            <el-row>
              <el-col :span="12">
                <el-form-item label="电费抽成">
                  <el-input :value="commission.collectFlag == '1' ? formatCommission(commission.powerRateType, commission.powerRate) : '-'" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="服务费抽成">
                  <el-input :value="commission.collectFlag == '1' ? formatCommission(commission.serviceRateType, commission.serviceRate) : '-'" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="修改用户">
                  <el-input :value="commission.updateUser || '-'" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="修改时间">
                  <el-input :value="commission.updateTime || '-'" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div>

      <div v-show="activeTab === 'split'" v-loading="splitLoading" element-loading-text="拼命加载中......">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span>分账设置</span>
            <div style="float: right;">
              <el-button size="mini" type="primary" :loading="splitSaving" @click="saveSplitConfig">保存</el-button>
            </div>
          </div>

          <el-alert title="温馨提示" type="warning" :closable="false" show-icon style="margin-bottom: 12px;">
            <div style="line-height: 22px;">
              <div>1）分成比例仅支持填写整数（例如：分成 60% 则填写“60”）。</div>
              <div>2）如无需分成给第三方，请将 100% 设置给站点归属方。</div>
              <div>3）电费/服务费/预约费/占位费分别校验：所有分账方合计必须等于 100%。</div>
              <div>4）到账金额按“平台抽成后的剩余金额 × 分成比例”计算。</div>
            </div>
          </el-alert>

          <el-table :data="splitTableData" border style="width: 100%;" v-loading="splitLoading" element-loading-text="loading……">
            <el-table-column label="分账主体" align="center" min-width="280">
              <template slot-scope="scope">
                <el-select v-model="scope.row.merchantNo" filterable clearable placeholder="请选择分账方" style="width: 100%;">
                  <el-option
                    v-for="item in payeeList"
                    :key="item.id"
                    :label="formatPayeeLabel(item)"
                    :value="item.merchantNo"
                  />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="电费" align="center" min-width="140">
              <el-table-column label="分账比例(%)" align="center" min-width="140">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.electricRate" type="number" />
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="服务费" align="center" min-width="140">
              <el-table-column label="分账比例(%)" align="center" min-width="140">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.serviceRate" type="number" />
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="预约费" align="center" min-width="140">
              <el-table-column label="分账比例(%)" align="center" min-width="140">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.reserveRate" type="number" />
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="占位费" align="center" min-width="140">
              <el-table-column label="分账比例(%)" align="center" min-width="140">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.occupyRate" type="number" />
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="操作" width="100" align="center">
              <template slot-scope="scope">
                <el-button v-if="splitTableData.length > 1" type="danger" size="mini" @click="removeSplitRow(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin: 10px 0;">
            <el-button type="primary" @click="addSplitRow">+ 新增分账方</el-button>
            <el-link type="primary" style="margin-left: 10px;" @click="toAddAccount">点击此处去创建收款账号</el-link>
          </div>
        </el-card>
      </div>
    </el-card>

    <el-dialog :visible.sync="editCommissionVisible" :title="commissionExists ? '修改抽成规则' : '配置抽成规则'" @close="editCommissionVisible = false" :append-to-body="true" width="520px">
      <el-form ref="commissionForm" :model="commissionForm" :rules="commissionRules" label-position="left" label-width="120px">
        <el-form-item label="是否收取抽成" prop="collectFlag">
          <el-radio-group v-model="commissionForm.collectFlag">
            <el-radio :label="'0'">不收取</el-radio>
            <el-radio :label="'1'">收取</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="commissionForm.collectFlag == '1'" label="电费抽成" prop="powerRate">
          <div style="display: flex; gap: 10px;">
            <el-select v-model="commissionForm.powerRateType" style="width: 120px">
              <!-- <el-option :value="'0'" label="度数" /> -->
              <el-option :value="'1'" label="折扣" />
            </el-select>
            <el-input v-model="commissionForm.powerRate" placeholder="请输入数值" type="number">
              <template slot="append">
                <span v-if="commissionForm.powerRateType == '1'">%</span>
                <span v-else>元/度</span>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item v-if="commissionForm.collectFlag == '1'" label="服务费抽成" prop="serviceRate">
          <div style="display: flex; gap: 10px;">
            <el-select v-model="commissionForm.serviceRateType" style="width: 120px">
              <!-- <el-option :value="'0'" label="度数" /> -->
              <el-option :value="'1'" label="折扣" />
            </el-select>
            <el-input v-model="commissionForm.serviceRate" placeholder="请输入数值" type="number">
              <template slot="append">
                <span v-if="commissionForm.serviceRateType == '1'">%</span>
                <span v-else>元/度</span>
              </template>
            </el-input>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editCommissionVisible = false">取消</el-button>
        <el-button type="primary" :loading="commissionSaving" @click="saveCommissionRule">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getChargeStationById } from '@/api/netWorkDot/netWorkDotList'
import { getByStationId as getStationCommissionInfo, saveOrUpdate as saveCommissionRuleApi } from '@/api/finance/commissionStrategy'
import { getMerchant } from '@/api/merchant/merchant'
import { findDevicePriceByPriceType } from '@/api/device/deviceList'
import loadMap from '@/utils/loadMap.js'
import { getByStationId as getSplitConfigByStationId, saveOrUpdate as saveSplitConfigApi } from '@/api/finance/stationCommissionSettlementAccount'
import { listCompleted as listCompletedTradeMerchant } from '@/api/pay/tradeEntry'

export default {
  name: 'netWorkDotSetting',
  data() {
    return {
      activeTab: 'detail',
      stationId: '',
      stationTagList: [
        { id: 1, name: '免费wifi' },
        { id: 2, name: '空调休息室' },
        { id: 3, name: '按摩室' },
        { id: 4, name: '便利店' },
        { id: 5, name: '洗车' },
        { id: 6, name: '饮用水' },
        { id: 7, name: '厕所' },
        { id: 8, name: '快餐' },
        { id: 9, name: '自动售货机' },
        { id: 10, name: '雨蓬' }
      ],
      stationTypeList: [
        { id: 1, name: '公共' },
        { id: 50, name: '个人' },
        { id: 100, name: '公交（专用）' },
        { id: 101, name: '环卫（专用）' },
        { id: 102, name: '物流（专用）' },
        { id: 103, name: '出租车（专用） ' },
        { id: 255, name: '其它 ' }
      ],
      buildAddressList: [
        { id: 1, name: '居民区' },
        { id: 2, name: '公共机构' },
        { id: 3, name: '企事业单位' },
        { id: 4, name: '写字楼' },
        { id: 5, name: '工业园区' },
        { id: 6, name: '交通枢纽' },
        { id: 7, name: '大型文体设施' },
        { id: 8, name: '城市绿地' },
        { id: 9, name: '大型建筑配建停车场' },
        { id: 10, name: '路边停车场' },
        { id: 11, name: '城际高速服务区' },
        { id: 255, name: '其它' }
      ],
      parkFeeType: [
        { id: 1, name: '免费停车' },
        { id: 2, name: '收费停车' },
        { id: 3, name: '充电减免' },
        { id: 4, name: '限时免费' },
        { id: 5, name: '其它' }
      ],
      merchantList: [],
      priceTypeList: [],
      station: {
        id: '',
        networkName: '',
        ruleId: 1,
        networkAddress: '',
        networkLongitude: '',
        networkLatitude: '',
        merchantId: '',
        merchantName: '',
        pricingRuleId: '',
        locationAddress: 1,
        capacity: '',
        stationType: '',
        buildAddress: '',
        isDuty: 0,
        isAloneApply: 0,
        isPublicParkingLot: 0,
        isLockFlag: false,
        isBarrierGate: false,
        phone: '',
        parkFeeType: '',
        parkFeeTip: '',
        stationTag: [],
        businessHours: [],
        remark: '',
        createUser: '',
        createTime: '',
        updateUser: '',
        updateTime: ''
      },
      loadingStation: false,
      mapInput: '',
      GDMap: null,
      plugins: [
        'AMap.Autocomplete',
        'AMap.PlaceSearch',
        'AMap.OverView',
        'AMap.MouseTool',
        'AMap.PolyEditor',
        'AMap.RectangleEditor',
        'AMap.DistrictLayer',
        'AMap.CustomLayer'
      ],
      key: '87331a23c6a4e734969f8621bc166eff',
      v: '1.4.4',

      loadingCommission: false,
      commissionExists: false,
      commission: {
        stationName: '',
        collectFlag: '0',
        powerRateType: '0',
        powerRate: '',
        serviceRateType: '0',
        serviceRate: '',
        updateUser: '',
        updateTime: ''
      },
      editCommissionVisible: false,
      commissionSaving: false,
      commissionRules: {
        collectFlag: [{ required: true, message: '请选择是否收取抽成', trigger: 'blur' }],
        powerRate: [{ required: true, message: '请输入电费抽成', trigger: 'blur' }],
        serviceRate: [{ required: true, message: '请输入服务费抽成', trigger: 'blur' }]
      },
      commissionForm: {
        id: '',
        stationId: '',
        collectFlag: '0',
        powerRateType: '1',
        powerRate: '',
        serviceRateType: '1',
        serviceRate: ''
      },

      splitLoading: false,
      splitLoaded: false,
      splitSaving: false,
      payeeList: [],
      splitTableData: []
    }
  },
  created() {
    this.stationId = this.$route.params.id || ''
    this.initStation()
    this.getMerchant()
    this.getDevicePriceByPriceType()
  },
  methods: {
    handleTabClick(tab) {
      if (tab.name === 'detail') {
        this.$nextTick(() => {
          this.initMap()
        })
      }
      if (tab.name === 'commission') {
        this.loadCommissionRule()
      }
      if (tab.name === 'split') {
        this.loadSplitConfig()
      }
    },
    formatCommission(type, value) {
      if (value === null || value === undefined || value === '') return '-'
      if (type == '1') return `${value}%`
      return `${value} 元/度`
    },
    formatSettBankAccType(type) {
      if (type === '0010' || type === 10 || type === '10') return '借记账户'
      if (type === '0030' || type === 30 || type === '30') return '对公账户'
      return '-'
    },
    initStation() {
      if (!this.stationId) {
        this.$message.error('缺少站点ID')
        return
      }
      this.loadingStation = true
      getChargeStationById(this.stationId).then(res => {
        if (res.code == 200) {
          const data = res.data || {}
          const businessHours = this.parseJsonArray(data.businessHours)
          const stationTag = this.parseJsonArray(data.stationTag).map(i => String(i))
          this.station = {
            ...this.station,
            ...data,
            id: data.id || this.stationId,
            ruleId: Number(data.ruleId || this.station.ruleId || 1),
            merchantId: data.merchantId || data.merchant_id || this.$route.query.merchantId || '',
            merchantName: data.merchantName || data.merchant_name || this.$route.query.merchantName || '',
            networkName: data.networkName || this.$route.query.stationName || '',
            pricingRuleId: data.pricingRuleId ?? data.pricing_rule_id ?? this.station.pricingRuleId,
            locationAddress: Number(data.locationAddress ?? data.location_address ?? 1),
            isDuty: this.normalizeFlag01(data.isDuty),
            isAloneApply: this.normalizeFlag01(data.isAloneApply),
            isPublicParkingLot: this.normalizeFlag01(data.isPublicParkingLot),
            isBarrierGate: this.normalizeBool(data.isBarrierGate),
            isLockFlag: this.normalizeBool(data.isLockFlag),
            businessHours,
            stationTag
          }
          this.getPayeeList()
          this.$nextTick(() => {
            this.initMap()
          })
        } else {
          this.$message.error(res.msg || '查询站点详情失败')
        }
      }).catch(() => {
        this.$message.error('查询站点详情失败')
      }).finally(() => {
        this.loadingStation = false
      })
    },
    parseJsonArray(val) {
      if (!val) return []
      if (Array.isArray(val)) return val
      if (typeof val !== 'string') return []
      try {
        const parsed = JSON.parse(val)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    },
    normalizeFlag01(val) {
      if (val === true) return 1
      if (val === false) return 0
      if (val === 1 || val === '1') return 1
      return 0
    },
    normalizeBool(val) {
      if (val === true) return true
      if (val === false) return false
      if (val === 1 || val === '1') return true
      return !!val
    },
    initMap() {
      if (this.GDMap) return
      const lng = Number(this.station.networkLongitude)
      const lat = Number(this.station.networkLatitude)
      if (!lng || !lat) return
      const container = document.getElementById('GDMapSetting')
      if (!container) return
      loadMap(this.key, this.plugins, this.v).then(AMap => {
        if (this.GDMap) return
        const center = [lng, lat]
        const map = new AMap.Map('GDMapSetting', {
          resizeEnable: true,
          zoom: 18,
          center
        })
        const marker = new AMap.Marker({
          position: center
        })
        map.add(marker)
        this.GDMap = map
      })
    },
    getMerchant() {
      getMerchant().then(res => {
        if (res && res.code == 200) {
          this.merchantList = res.data || []
          if (!this.station.merchantName && this.station.merchantId) {
            const hit = this.merchantList.find(i => String(i.id) === String(this.station.merchantId))
            if (hit) this.station.merchantName = hit.name
          }
        }
      })
    },
    getDevicePriceByPriceType() {
      const payload = { priceType: 1, ruleId: 2 }
      findDevicePriceByPriceType(payload).then(res => {
        if (res && res.code == 200) {
          this.priceTypeList = res.data || []
        }
      })
    },
    loadCommissionRule() {
      if (!this.stationId) return
      this.loadingCommission = true
      const stationName = this.station.networkName || ''
      this.commission = {
        stationName,
        collectFlag: '0',
        powerRateType: '0',
        powerRate: '',
        serviceRateType: '0',
        serviceRate: '',
        updateUser: '',
        updateTime: ''
      }
      getStationCommissionInfo(this.stationId).then(res => {
        if (res.code == 200) {
          const data = res.data || null
          this.commissionExists = !!data
          if (data) {
            this.commission = {
              stationName,
              id: data.id,
              collectFlag: String(data.collectFlag ?? '0'),
              powerRateType: String(data.powerRateType ?? '0'),
              powerRate: data.powerRate ?? '',
              serviceRateType: String(data.serviceRateType ?? '0'),
              serviceRate: data.serviceRate ?? '',
              updateUser: data.updateUser || '',
              updateTime: data.updateTime || ''
            }
          }
        } else {
          this.$message.error(res.msg || '查询抽成规则失败')
        }
      }).catch(() => {
        this.$message.error('查询抽成规则失败')
      }).finally(() => {
        this.loadingCommission = false
      })
    },
    openCommissionEdit() {
      this.editCommissionVisible = true
      this.commissionForm = {
        id: this.commissionExists ? (this.commission.id || '') : '',
        stationId: this.stationId,
        collectFlag: this.commissionExists ? String(this.commission.collectFlag ?? '0') : '0',
        powerRateType: this.commissionExists ? String(this.commission.powerRateType ?? '0') : '0',
        powerRate: this.commissionExists ? (this.commission.powerRate ?? '0') : '0',
        serviceRateType: this.commissionExists ? String(this.commission.serviceRateType ?? '0') : '0',
        serviceRate: this.commissionExists ? (this.commission.serviceRate ?? '0') : '0'
      }
    },
    saveCommissionRule() {
      this.$refs.commissionForm.validate(valid => {
        if (!valid) return
        this.commissionSaving = true
        const payload = { ...this.commissionForm, stationId: this.stationId }
        saveCommissionRuleApi(payload).then(res => {
          if (res.code == 200) {
            this.$message.success(res.msg || '保存成功')
            this.editCommissionVisible = false
            this.commissionExists = false
            this.loadCommissionRule()
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        }).catch(() => {
          this.$message.error('保存失败')
        }).finally(() => {
          this.commissionSaving = false
        })
      })
    },
    getPayeeList() {
      const merchantId = this.station.merchantId
      if (!merchantId) {
        this.payeeList = []
        return
      }
      listCompletedTradeMerchant(merchantId).then(res => {
        if (res && res.code == 200) {
          this.payeeList = res.data || []
        } else {
          this.payeeList = []
        }
      }).catch(() => {
        this.payeeList = []
      })
    },
    findPayeeById(merchantNo) {
      if (!merchantNo) return null
      return (this.payeeList || []).find(i => String(i.merchantNo) === String(merchantNo)) || null
    },
    matchPayeeMerchantNoFromConfigRow(item) {
      if (!item) return ''
      const merchantNo = item.merchantNo || item.merchant_no || ''
      if (merchantNo) return merchantNo
      const busTradeMerNo = item.busTradeMerNo || item.bus_trade_mer_no || ''
      const settBankAccNo = item.settBankAccNo || item.sett_bank_acc_no || ''
      const hit = (this.payeeList || []).find(i => {
        const iMerchantNo = i.merchantNo || i.merchant_no || ''
        const iBusTradeMerNo = i.busTradeMerNo || i.bus_trade_mer_no || ''
        const iSettBankAccNo = i.settBankAccNo || i.sett_bank_acc_no || ''
        return (busTradeMerNo && iBusTradeMerNo && String(busTradeMerNo) === String(iBusTradeMerNo)) ||
          (settBankAccNo && iSettBankAccNo && String(settBankAccNo) === String(iSettBankAccNo))
      })
      return hit ? hit.merchantNo : ''
    },
    buildSettlementPayloadFromPayee(payee) {
      if (!payee) return null
      return {
        merchantId: payee.merchantId || payee.merchant_id || this.station.merchantId || '',
        merchantName: payee.merchantName || payee.merchant_name || '',
        merchantNo: payee.merchantNo,
        busTradeMerNo: payee.busTradeMerNo,
        settBankAccType: payee.settBankAccType,
        settBankAccName: payee.settBankAccName,
        settBankBranchId: payee.settBankBranchId,
        settBankBranchName: payee.settBankBranchName,
        settBankAccNo: payee.settBankAccNo
      }
    },
    formatPayeeLabel(item) {
      if (!item) return ''
      const name = item.settBankAccName || item.merchantName || item.merchant_name || item.name || ''
      const acc = item.settBankAccNo || item.merchantNo || item.busTradeMerNo || item.no || ''
      if (name && acc) return `${name}  ${acc}`
      return name || acc || ''
    },
    toAddAccount() {
      this.$router.push({ path: '/tradeEntry/add' })
    },
    normalizeRate(val) {
      const n = Number(val)
      if (!Number.isFinite(n)) return 0
      if (n < 0) return 0
      if (n > 100) return 100
      return Math.floor(n)
    },
    sumByKey(key) {
      return (this.splitTableData || []).reduce((sum, row) => sum + this.normalizeRate(row[key]), 0)
    },
    validateSplitTable() {
      const rows = this.splitTableData || []
      const seen = new Set()
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        if (!r.merchantNo) {
          this.$message.error('请选择分账方')
          return false
        }
        const k = String(r.merchantNo)
        if (seen.has(k)) {
          this.$message.error('分账方不可重复')
          return false
        }
        seen.add(k)
        r.electricRate = this.normalizeRate(r.electricRate)
        r.serviceRate = this.normalizeRate(r.serviceRate)
        r.reserveRate = this.normalizeRate(r.reserveRate)
        r.occupyRate = this.normalizeRate(r.occupyRate)
      }
      const electricSum = this.sumByKey('electricRate')
      const serviceSum = this.sumByKey('serviceRate')
      const reserveSum = this.sumByKey('reserveRate')
      const occupySum = this.sumByKey('occupyRate')

      if (electricSum > 100) {
        this.$message.error('电费分账比例总和不能超过100%')
        return false
      }
      if (serviceSum > 100) {
        this.$message.error('服务费分账比例总和不能超过100%')
        return false
      }
      if (reserveSum > 100) {
        this.$message.error('预约费分账比例总和不能超过100%')
        return false
      }
      if (occupySum > 100) {
        this.$message.error('占位费分账比例总和不能超过100%')
        return false
      }

      if (rows.length === 1) {
        if (electricSum !== 100) {
          this.$message.error('电费分账比例需等于100%')
          return false
        }
        if (serviceSum !== 100) {
          this.$message.error('服务费分账比例需等于100%')
          return false
        }
        if (reserveSum !== 100) {
          this.$message.error('预约费分账比例需等于100%')
          return false
        }
        if (occupySum !== 100) {
          this.$message.error('占位费分账比例需等于100%')
          return false
        }
      }

      if (rows.length > 1) {
        if (electricSum !== 100) {
          this.$message.error('电费分账比例总和需等于100%')
          return false
        }
        if (serviceSum !== 100) {
          this.$message.error('服务费分账比例总和需等于100%')
          return false
        }
        if (reserveSum !== 100) {
          this.$message.error('预约费分账比例总和需等于100%')
          return false
        }
        if (occupySum !== 100) {
          this.$message.error('占位费分账比例总和需等于100%')
          return false
        }
      }
      return true
    },
    loadSplitConfig() {
      if (this.splitLoaded) return
      this.splitLoading = true
      getSplitConfigByStationId(this.stationId).then(res => {
        if (res && res.code == 200) {
          const data = res.data
          const list = Array.isArray(data) ? data : (data ? [data] : [])
          this.splitTableData = list.map(item => ({
            id: item.id,
            stationId: item.stationId || this.stationId,
            merchantNo: item.merchantNo || this.matchPayeeMerchantNoFromConfigRow(item),
            electricRate: item.electricRate ?? item.powerRate ?? 0,
            serviceRate: item.serviceRate ?? 0,
            reserveRate: item.reserveRate ?? 0,
            occupyRate: item.occupyRate ?? 0
          }))
        } else {
          this.splitTableData = []
        }
        this.splitLoaded = true
      }).catch(() => {
        this.splitTableData = []
        this.splitLoaded = true
      }).finally(() => {
        this.splitLoading = false
      })
    },
    addSplitRow() {
      if (this.splitTableData.length > 0) {
        const last = this.splitTableData[this.splitTableData.length - 1]
        if (!last.merchantNo) {
          this.$message.error('请选择分账方')
          return
        }
      }
      this.splitTableData.push({
        networkDotId: this.stationId,
        merchantNo: '',
        electricRate: 0,
        serviceRate: 0,
        reserveRate: 0,
        occupyRate: 0
      })
    },
    removeSplitRow(index) {
      this.splitTableData.splice(index, 1)
    },
    saveSplitConfig() {
      if (!this.validateSplitTable()) return
      this.splitSaving = true
      const payload = (this.splitTableData || []).map(row => {
        const payee = this.findPayeeById(row.merchantNo)
        const base = this.buildSettlementPayloadFromPayee(payee) || {}
        return {
          ...base,
          id: row.id,
          stationId: this.stationId,
          electricRate: this.normalizeRate(row.electricRate),
          serviceRate: this.normalizeRate(row.serviceRate),
          reserveRate: this.normalizeRate(row.reserveRate),
          occupyRate: this.normalizeRate(row.occupyRate)
        }
      })

      const callOneByOne = () => {
        return payload.reduce((p, item) => {
          return p.then(prev => {
            if (prev && prev.code && prev.code != 200) return prev
            return saveSplitConfigApi(item)
          })
        }, Promise.resolve({ code: 200 })).then(res => {
          if (res && res.code == 200) return { code: 200, msg: '保存成功' }
          return res
        })
      }

      callOneByOne().then(res => {
        if (res && res.code == 200) {
          this.$message.success(res.msg || '保存成功')
          this.splitLoaded = false
          this.loadSplitConfig()
        } else {
          this.$message.error((res && res.msg) || '保存失败')
        }
      }).catch(() => {
        this.$message.error('保存失败')
      }).finally(() => {
        this.splitSaving = false
      })
    }
  }
}
</script>
