<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>站点设置</span>
        <div style="float: right;">
          <el-button v-if="activeTab === 'detail' && !isEditing && btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:edit')" size="mini" type="primary" @click="startEdit" >编辑</el-button>
          <el-button v-if="activeTab === 'detail' && isEditing" size="mini" @click="cancelEdit">取消</el-button>
          <el-button v-if="activeTab === 'detail' && isEditing && btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:edit')" size="mini" type="primary" :loading="detailSaving" @click="saveStation">保存</el-button>
          <el-button size="mini" type="primary" @click="$router.back()">返回</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="基本信息" name="detail" />
        <el-tab-pane label="抽成规则" name="commission" />
        <el-tab-pane label="分账设置" name="split" />
      </el-tabs>

      <div v-show="activeTab === 'detail'" v-loading="loadingStation" element-loading-text="拼命加载中......">
        <div v-if="!isEditing" class="detail-view">
          <div class="detail-section">
            <div class="detail-section__title">基础信息</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">站点名称</div>
                  <div class="kv__value">{{ station.networkName || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="kv">
                  <div class="kv__label">充电站位置</div>
                  <div class="kv__value">{{ station.networkAddress || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">充电站经度</div>
                  <div class="kv__value">{{ station.networkLongitude || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">充电站纬度</div>
                  <div class="kv__value">{{ station.networkLatitude || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">运营商户</div>
                  <div class="kv__value">{{ station.merchantName || getNameById(merchantList, station.merchantId) || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="kv">
                  <div class="kv__label">归属地区</div>
                  <div class="kv__value">{{ stationAreaDisplayText }}</div>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="kv">
                  <div class="kv__label">电站图片</div>
                  <div class="kv__value">
                    <div class="station-picture-view-grid">
                      <div class="station-picture-view-item" v-for="slot in stationPictureSlots" :key="slot.sort">
                        <el-image
                          v-if="slot.url"
                          :src="slot.url"
                          :preview-src-list="getPicturePreviewList(stationPictureSlots)"
                          class="station-picture-view-img"
                          fit="cover"
                        />
                        <div v-else class="station-picture-view-empty">无</div>
                        <div class="station-picture-view-label">{{ slot.label }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div id="GDMapSetting" class="detail-map" v-show="activeTab === 'detail'"></div>

          <div class="detail-section">
            <div class="detail-section__title">监管信息</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">电站位置</div>
                  <div class="kv__value">{{ station.locationAddress == 2 ? '地下电站' : '地上电站' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">可用电容</div>
                  <div class="kv__value">{{ station.capacity ? `${station.capacity} KWA` : '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">电站类型</div>
                  <div class="kv__value">{{ getNameById(stationTypeList, station.stationType) || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">建设场所</div>
                  <div class="kv__value">{{ getNameById(buildAddressList, station.buildAddress) || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">人员值守</div>
                  <div class="kv__value">{{ station.isDuty == 1 ? '是' : '否' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">独立报装</div>
                  <div class="kv__value">{{ station.isAloneApply == 1 ? '是' : '否' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">公共停车场</div>
                  <div class="kv__value">{{ station.isPublicParkingLot == 1 ? '是' : '否' }}</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="detail-section">
            <div class="detail-section__title">运营信息</div>
            <el-row :gutter="20">
              <el-col :span="24">
                <div class="kv">
                  <div class="kv__label">站场辅助设备</div>
                  <div class="kv__value">
                    <el-tag v-if="station.isBarrierGate" size="mini" style="margin-right: 6px;">道闸</el-tag>
                    <el-tag v-if="station.isLockFlag" size="mini" type="success" style="margin-right: 6px;">地锁</el-tag>
                    <span v-if="!station.isBarrierGate && !station.isLockFlag">-</span>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">营业时间</div>
                  <div class="kv__value">{{ formatBusinessHours(station.businessHours) }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">管理员电话</div>
                  <div class="kv__value">{{ station.phone || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">停车收费模式</div>
                  <div class="kv__value">{{ getNameById(parkFeeType, station.parkFeeType) || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">停车收费提示</div>
                  <div class="kv__value">{{ station.parkFeeTip || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="kv">
                  <div class="kv__label">站点标签</div>
                  <div class="kv__value">{{ formatStationTags(station.stationTag) }}</div>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="kv">
                  <div class="kv__label">站场备注</div>
                  <div class="kv__value">{{ station.remark || '-' }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <el-form v-else ref="detailForm" :model="editStation" :rules="detailFormRules" label-position="left" label-width="120px" size="medium" class="detail-edit">
          <el-divider content-position="left">基础信息</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="站点名称">
                <el-input v-model="editStation.networkName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="运营商户">
                <el-select v-model="editStation.merchantId" filterable clearable style="width: 100%;" @change="handleMerchantChange">
                  <el-option v-for="item in merchantList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="归属地区" prop="areaPath">
                <el-cascader
                  :key="settingAreaCascaderKey"
                  v-model="editStation.areaPath"
                  :options="settingAreaOptions"
                  :props="settingAreaCascaderProps"
                  clearable
                  filterable
                  placeholder="请选择省 / 市 / 区"
                  style="width: 100%;"
                  append-to-body
                  @change="handleSettingAreaChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="充电站位置">
                <el-input v-model="editStation.networkAddress" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="充电站经度">
                <el-input v-model="editStation.networkLongitude" @change="updateMapPosition" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="充电站纬度">
                <el-input v-model="editStation.networkLatitude" @change="updateMapPosition" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="投放地查询">
                <el-input v-model="mapInput" placeholder="请输入大概地址查询" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item>
                <el-tag type="warning" style="font-size: 14px;">在投放地输入框内查询小区位置后，可点击地图再次选取更详细的楼层或街道地址</el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="电站图片">
                <div class="picture-grid">
                  <div class="picture-slot" v-for="slot in editStationPictureSlots" :key="slot.sort">
                    <el-upload
                      action=""
                      :show-file-list="false"
                      :http-request="(p) => handleStationPictureUpload(slot.sort, p)"
                      accept=".jpg,.jpeg,.png,.gif"
                    >
                      <div class="picture-box">
                        <el-image
                          v-if="slot.url"
                          :src="slot.url"
                          style="width: 100%; height: 100%;"
                          fit="contain"
                        />
                        <i v-else class="el-icon-plus picture-plus"></i>
                      </div>
                    </el-upload>
                    <div class="picture-label">{{ slot.label }}</div>
                  </div>
                </div>
                <div class="picture-tip">图片仅支持 .jpg、.jpeg、.png、.gif，建议比例4:3，最多5张</div>
              </el-form-item>
            </el-col>
          </el-row>

          <div id="GDMapSetting" class="detail-map" v-show="activeTab === 'detail'"></div>

          <el-divider content-position="left">监管信息</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="电站位置">
                <el-radio-group v-model="editStation.locationAddress">
                  <el-radio :label="1">地上电站</el-radio>
                  <el-radio :label="2">地下电站</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="可用电容">
                <el-input v-model="editStation.capacity" type="number">
                  <template slot="append">KWA</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="电站类型">
                <el-select v-model="editStation.stationType" filterable clearable style="width: 100%;">
                  <el-option v-for="item in stationTypeList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="建设场所">
                <el-select v-model="editStation.buildAddress" filterable clearable style="width: 100%;">
                  <el-option v-for="item in buildAddressList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="人员值守">
                <el-radio-group v-model="editStation.isDuty">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="独立报装">
                <el-radio-group v-model="editStation.isAloneApply">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公共停车场">
                <el-radio-group v-model="editStation.isPublicParkingLot">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">运营信息</el-divider>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="站场辅助设备">
                <el-checkbox v-model="editStation.isBarrierGate" label="道闸">道闸</el-checkbox>
                <el-checkbox v-model="editStation.isLockFlag" label="地锁">地锁</el-checkbox>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="营业时间">
                <el-time-picker
                  is-range
                  v-model="editStation.businessHours"
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
                <el-input v-model="editStation.phone" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="停车收费模式">
                <el-select v-model="editStation.parkFeeType" filterable clearable style="width: 100%;">
                  <el-option v-for="item in parkFeeType" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="停车收费提示">
                <el-input v-model="editStation.parkFeeTip" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="站点标签">
                <el-select v-model="editStation.stationTag" multiple filterable clearable style="width: 100%;">
                  <el-option v-for="item in stationTagList" :key="item.id + ''" :label="item.name" :value="item.id + ''" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="站场备注">
                <el-input v-model="editStation.remark" type="textarea" />
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
              <el-button
                v-if="btnAuthen.permsVerifAuthention(':web:commissionStrategy:save')"
                size="mini"
                type="primary"
                @click="openCommissionEdit"
              >{{ commissionExists ? '修改' : '配置规则' }}</el-button>
            </div>
          </div>

          <div class="detail-view">
            <el-row :gutter="20">
              <!-- <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">抽成状态</div>
                  <div class="kv__value">{{ commissionExists ? (commission.collectFlag == '1' ? '收取' : '不收取') : '未配置' }}</div>
                </div>
              </el-col> -->
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">电费抽成</div>
                  <div class="kv__value">{{ commissionExists && commission.collectFlag == '1' ? formatCommission(commission.powerRateType, commission.powerRate) : '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">服务费抽成</div>
                  <div class="kv__value">{{ commissionExists && commission.collectFlag == '1' ? formatCommission(commission.serviceRateType, commission.serviceRate) : '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">修改用户</div>
                  <div class="kv__value">{{ commission.updateUser || '-' }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="kv">
                  <div class="kv__label">修改时间</div>
                  <div class="kv__value">{{ commission.updateTime || '-' }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>

      <div v-show="activeTab === 'split'" v-loading="splitLoading" element-loading-text="拼命加载中......">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span>分账设置</span>
            <div style="float: right;">
              <el-button
                v-if="btnAuthen.permsVerifAuthention(':web:splitAccount:save')"
                size="mini"
                type="primary"
                :loading="splitSaving"
                @click="saveSplitConfig"
              >保存</el-button>
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
                <el-button
                  v-if="splitTableData.length > 1 && btnAuthen.permsVerifAuthention(':web:splitAccount:save')"
                  type="danger"
                  size="mini"
                  @click="removeSplitRow(scope.$index)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin: 10px 0;">
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':web:splitAccount:save')"
              type="primary"
              @click="addSplitRow"
            >+ 新增分账方</el-button>
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
        <el-button
          v-if="btnAuthen.permsVerifAuthention(':web:commissionStrategy:save')"
          type="primary"
          :loading="commissionSaving"
          @click="saveCommissionRule"
        >确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getChargeStationById, getNetworkDotPictures, updateNetworkDot } from '@/api/netWorkDot/netWorkDotList'
import { getAreaSelector } from '@/api/area/index.js'
import { getByStationId as getStationCommissionInfo, saveOrUpdate as saveCommissionRuleApi } from '@/api/finance/commissionStrategy'
import { getMerchant } from '@/api/merchant/merchant'
import { upload } from '@/api/upload/file'
import loadMap from '@/utils/loadMap.js'
import { getByStationId as getSplitConfigByStationId, saveOrUpdate as saveSplitConfigApi } from '@/api/finance/stationCommissionSettlementAccount'
import { listCompleted as listCompletedTradeMerchant } from '@/api/pay/tradeEntry'

export default {
  name: 'NetWorkDotSetting',
  data() {
    return {
      activeTab: 'detail',
      stationId: '',
      isEditing: false,
      detailSaving: false,
      editStation: null,
      stationPictureSlots: [
        { sort: 1, label: '主入口图', url: '' },
        { sort: 2, label: '标志路径', url: '' },
        { sort: 3, label: '电站全景', url: '' },
        { sort: 4, label: '电桩特写', url: '' },
        { sort: 5, label: '其它图片', url: '' }
      ],
      editStationPictureSlots: [
        { sort: 1, label: '主入口图', url: '' },
        { sort: 2, label: '标志路径', url: '' },
        { sort: 3, label: '电站全景', url: '' },
        { sort: 4, label: '电桩特写', url: '' },
        { sort: 5, label: '其它图片', url: '' }
      ],
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
      station: {
        id: '',
        networkName: '',
        ruleId: 1,
        networkAddress: '',
        networkLongitude: '',
        networkLatitude: '',
        merchantId: '',
        merchantName: '',
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
        networkProvince: '',
        networkCity: '',
        networkRegion: ''
      },
      loadingStation: false,
      mapInput: '',
      GDMap: null,
      GDMarker: null,
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
      key: (window.BaseConfig && window.BaseConfig.VUE_MAP_KEY) ? window.BaseConfig.VUE_MAP_KEY : '',
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
      splitTableData: [],

      settingAreaOptions: [],
      settingAreaCascaderKey: 1,
      settingAreaCascaderProps: {
        value: 'id',
        label: 'fullName',
        children: 'children',
        emitPath: true,
        lazy: true,
        lazyLoad: (node, resolve) => {
          this.loadSettingAreaChildren(node, resolve)
        }
      },
      detailFormRules: {
        // areaPath: [{
        //   type: 'array',
        //   required: true,
        //   len: 3,
        //   message: '请选择完整的省 / 市 / 区',
        //   trigger: 'change'
        // }]
      },
      /** 基本信息只读：归属地区展示为区划名称（由 id 解析） */
      stationAreaDisplayText: '-'
    }
  },
  created() {
    this.stationId = this.$route.params.id || ''
    this.initStation()
    this.getMerchant()
  },
  methods: {
    getNameById(list, id, labelKey = 'name') {
      if (!list || !list.length) return ''
      const hit = list.find(i => String(i.id) === String(id))
      if (!hit) return ''
      return hit[labelKey] || hit.name || hit.label || ''
    },
    formatStationAreaReadonly(row) {
      const p = (row && row.networkProvince != null ? String(row.networkProvince) : '').trim()
      const c = (row && row.networkCity != null ? String(row.networkCity) : '').trim()
      const r = (row && row.networkRegion != null ? String(row.networkRegion) : '').trim()
      if (!p && !c && !r) return '-'
      return [p, c, r].filter(Boolean).join(' / ') || '-'
    },
    async loadStationAreaDisplayText() {
      const row = this.station || {}
      const p = (row.networkProvince != null ? String(row.networkProvince) : '').trim()
      const c = (row.networkCity != null ? String(row.networkCity) : '').trim()
      const d = (row.networkRegion != null ? String(row.networkRegion) : '').trim()
      if (!p && !c && !d) {
        this.stationAreaDisplayText = '-'
        return
      }
      this.stationAreaDisplayText = '-'
      try {
        const res1 = await getAreaSelector('-1')
        const provinces = this.normalizeSettingAreaList(res1)
        const pi = this.findSettingAreaNodeBySavedValue(provinces, p)
        if (!pi) {
          this.stationAreaDisplayText = this.formatStationAreaReadonly(row)
          return
        }
        const pName = (pi.fullName || p).trim()
        if (!c) {
          this.stationAreaDisplayText = pName || '-'
          return
        }
        const res2 = await getAreaSelector(String(pi.id))
        const cities = this.normalizeSettingAreaList(res2)
        const ci = this.findSettingAreaNodeBySavedValue(cities, c)
        if (!ci) {
          this.stationAreaDisplayText = [pName, c, d].filter(Boolean).join(' / ')
          return
        }
        const cName = (ci.fullName || c).trim()
        if (!d) {
          this.stationAreaDisplayText = [pName, cName].filter(Boolean).join(' / ') || '-'
          return
        }
        const res3 = await getAreaSelector(String(ci.id))
        const dists = this.normalizeSettingAreaList(res3)
        const di = this.findSettingAreaNodeBySavedValue(dists, d)
        const dName = di ? String(di.fullName || d).trim() : d
        this.stationAreaDisplayText = [pName, cName, dName].filter(Boolean).join(' / ') || '-'
      } catch (e) {
        this.stationAreaDisplayText = this.formatStationAreaReadonly(row)
      }
    },
    normalizeSettingAreaList(res) {
      const data = res && res.data
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.list) ? data.list : (Array.isArray(res) ? res : []))
      return list.map(item => ({
        ...item,
        id: item && item.id != null ? String(item.id) : item.id
      }))
    },
    findSettingAreaNodeBySavedValue(list, saved) {
      const s = String(saved || '').trim()
      if (!s || !Array.isArray(list)) return null
      const byId = list.find(n => String(n.id) === s)
      if (byId) return byId
      return list.find(n => this.settingAreaNameMatch(n.fullName, s))
    },
    settingAreaNameMatch(apiName, savedName) {
      if (!apiName || !savedName) return false
      const a = String(apiName).replace(/\s/g, '')
      const b = String(savedName).replace(/\s/g, '')
      return a === b || a.includes(b) || b.includes(a)
    },
    loadSettingAreaChildren(node, resolve) {
      if (!node) {
        resolve([])
        return
      }
      const level = node.level
      const parentId = level === 0 ? '-1' : (node.value != null ? String(node.value) : '')
      getAreaSelector(parentId).then(res => {
        const nodes = this.normalizeSettingAreaList(res).map(item => ({
          ...item,
          leaf: level >= 2
        }))
        resolve(nodes)
      }).catch(() => {
        resolve([])
      })
    },
    loadSettingAreaOptionsForPath(provinceId, cityId, countyId) {
      if (!provinceId) return Promise.resolve()
      return getAreaSelector('-1').then(res => {
        const provinces = this.normalizeSettingAreaList(res)
        provinces.forEach(p => {
          p.leaf = false
        })
        this.settingAreaOptions = provinces
        const provinceNode = this.settingAreaOptions.find(p => String(p.id) === String(provinceId))
        if (!provinceNode || !cityId) return Promise.resolve()
        return getAreaSelector(provinceId).then(res2 => {
          const cities = this.normalizeSettingAreaList(res2)
          cities.forEach(c => {
            c.leaf = false
          })
          this.$set(provinceNode, 'children', cities)
          const cityNode = cities.find(c => String(c.id) === String(cityId))
          if (!cityNode || !countyId) return Promise.resolve()
          return getAreaSelector(cityId).then(res3 => {
            const counties = this.normalizeSettingAreaList(res3)
            counties.forEach(a => {
              a.leaf = true
            })
            this.$set(cityNode, 'children', counties)
          })
        })
      }).catch(() => {
        this.settingAreaOptions = []
      })
    },
    hydrateSettingStationArea() {
      if (!this.editStation) return Promise.resolve()
      const p = (this.editStation.networkProvince || '').trim()
      const c = (this.editStation.networkCity || '').trim()
      const d = (this.editStation.networkRegion || '').trim()
      if (!p || !c || !d) {
        this.$set(this.editStation, 'areaPath', [])
        return Promise.resolve()
      }
      return getAreaSelector('-1').then(res1 => {
        const provinces = this.normalizeSettingAreaList(res1)
        const pi = this.findSettingAreaNodeBySavedValue(provinces, p)
        if (!pi) return
        return getAreaSelector(String(pi.id)).then(res2 => {
          const cities = this.normalizeSettingAreaList(res2)
          const ci = this.findSettingAreaNodeBySavedValue(cities, c)
          if (!ci) return
          return getAreaSelector(String(ci.id)).then(res3 => {
            const dists = this.normalizeSettingAreaList(res3)
            const di = this.findSettingAreaNodeBySavedValue(dists, d)
            if (!di) return
            return this.loadSettingAreaOptionsForPath(String(pi.id), String(ci.id), String(di.id)).then(() => {
              this.$nextTick(() => {
                this.$set(this.editStation, 'areaPath', [String(pi.id), String(ci.id), String(di.id)])
              })
            })
          })
        })
      }).catch(() => {})
    },
    handleSettingAreaChange(val) {
      if (!this.editStation) return
      const path = Array.isArray(val) ? val.map(v => String(v)) : []
      this.$set(this.editStation, 'areaPath', path)
      if (path.length === 3) {
        this.editStation.networkProvince = path[0]
        this.editStation.networkCity = path[1]
        this.editStation.networkRegion = path[2]
      } else {
        this.editStation.networkProvince = ''
        this.editStation.networkCity = ''
        this.editStation.networkRegion = ''
      }
      this.$nextTick(() => {
        this.$refs.detailForm && this.$refs.detailForm.validateField('areaPath')
      })
    },
    formatBusinessHours(val) {
      const arr = Array.isArray(val) ? val : this.parseJsonArray(val)
      if (!arr || arr.length < 2) return '-'
      const start = arr[0]
      const end = arr[1]
      if (!start || !end) return '-'
      return `${start} 至 ${end}`
    },
    formatStationTags(val) {
      const arr = Array.isArray(val) ? val : this.parseJsonArray(val)
      const ids = (arr || []).map(i => String(i))
      if (!ids.length) return '-'
      const names = ids.map(id => {
        const hit = (this.stationTagList || []).find(t => String(t.id) === String(id))
        return hit ? hit.name : id
      }).filter(Boolean)
      return names.length ? names.join('、') : '-'
    },
    buildStationPictureSlots(list) {
      const base = [
        { sort: 1, label: '主入口图', url: '' },
        { sort: 2, label: '标志路径', url: '' },
        { sort: 3, label: '电站全景', url: '' },
        { sort: 4, label: '电桩特写', url: '' },
        { sort: 5, label: '其它图片', url: '' }
      ]
      if (Array.isArray(list)) {
        list.forEach(it => {
          const sort = it && it.sort != null ? Number(it.sort) : null
          const hit = base.find(b => b.sort === sort)
          if (hit) hit.url = it.pictureUrl || ''
        })
      }
      return base
    },
    getPicturePreviewList(slots) {
      return (slots || []).map(s => s && s.url).filter(Boolean)
    },
    loadStationPictures() {
      if (!this.stationId) return
      getNetworkDotPictures(this.stationId).then(res => {
        if (res && res.code === 200) {
          const list = Array.isArray(res.data) ? res.data : []
          this.stationPictureSlots = this.buildStationPictureSlots(list)
          if (!this.isEditing) {
            this.editStationPictureSlots = JSON.parse(JSON.stringify(this.stationPictureSlots || []))
          }
        }
      }).catch(() => {
        void 0
      })
    },
    setEditPictureUrl(sort, url) {
      const idx = (this.editStationPictureSlots || []).findIndex(s => Number(s.sort) === Number(sort))
      if (idx !== -1) {
        this.$set(this.editStationPictureSlots, idx, {
          ...this.editStationPictureSlots[idx],
          url
        })
      }
    },
    handleStationPictureUpload(sort, params) {
      const file = params && params.file
      if (!file) return
      const isOk = /\.(jpg|jpeg|png|gif)$/i.test(file.name || '')
      if (!isOk) {
        this.$message.error('仅支持 jpg/jpeg/png/gif')
        return
      }
      const form = new FormData()
      form.append('file', file)
      upload('WebAnnexFile', form).then(res => {
        const url = res && res.data && (res.data.url || res.data)
        this.setEditPictureUrl(sort, url || (res && res.data) || '')
        this.$message.success('上传成功')
      }).catch(() => {
        this.$message.error('上传失败')
      })
    },
    startEdit() {
      this.isEditing = true
      this.editStation = JSON.parse(JSON.stringify(this.station || {}))
      const bh = this.parseJsonArray(this.editStation && this.editStation.businessHours)
      this.editStation.businessHours = Array.isArray(bh) ? bh : []
      this.$set(this.editStation, 'areaPath', [])
      this.settingAreaOptions = []
      this.settingAreaCascaderKey += 1
      this.editStationPictureSlots = JSON.parse(JSON.stringify(this.stationPictureSlots || []))
      this.$nextTick(() => {
        this.resetMapInstance()
        this.initMap()
        this.updateMapPosition()
        this.hydrateSettingStationArea()
      })
    },
    cancelEdit() {
      this.isEditing = false
      this.detailSaving = false
      this.editStation = null
      this.settingAreaOptions = []
      this.settingAreaCascaderKey += 1
      this.editStationPictureSlots = JSON.parse(JSON.stringify(this.stationPictureSlots || []))
      this.mapInput = ''
      this.$nextTick(() => {
        this.resetMapInstance()
        this.initMap()
        this.updateMapPosition()
      })
    },
    resetMapInstance() {
      this.GDMap = null
      this.GDMarker = null
      const container = document.getElementById('GDMapSetting')
      if (container) container.innerHTML = ''
    },
    handleMerchantChange(val) {
      const hit = (this.merchantList || []).find(i => String(i.id) === String(val))
      if (this.editStation) {
        this.editStation.merchantName = hit ? (hit.name || '') : ''
      }
    },
    buildStationUpdatePayload() {
      const src = this.editStation || {}
      const payload = {
        ...src,
        id: src.id || this.stationId
      }
      payload.ruleId = Number(payload.ruleId || 1)
      payload.locationAddress = Number(payload.locationAddress || 1)
      payload.isDuty = this.normalizeFlag01(payload.isDuty)
      payload.isAloneApply = this.normalizeFlag01(payload.isAloneApply)
      payload.isPublicParkingLot = this.normalizeFlag01(payload.isPublicParkingLot)
      payload.isBarrierGate = this.normalizeBool(payload.isBarrierGate)
      payload.isLockFlag = this.normalizeBool(payload.isLockFlag)
      payload.businessHours = JSON.stringify(Array.isArray(payload.businessHours) ? payload.businessHours : this.parseJsonArray(payload.businessHours))
      payload.stationTag = JSON.stringify(Array.isArray(payload.stationTag) ? payload.stationTag : this.parseJsonArray(payload.stationTag))
      payload.stationPictures = (this.editStationPictureSlots || []).filter(s => s && s.url).slice(0, 5).map(s => ({
        pictureUrl: s.url,
        sort: s.sort
      }))
      delete payload.areaPath
      delete payload.pricingRuleId
      return payload
    },
    saveStation() {
      if (!this.stationId || !this.editStation) return
      const hasPicture = (this.editStationPictureSlots || []).some(s => s && s.url)
      if (!hasPicture) {
        this.$message.error('请至少上传1张站点图片')
        return
      }
      this.$refs.detailForm.validate(valid => {
        if (!valid) return
        this.detailSaving = true
        const payload = this.buildStationUpdatePayload()
        updateNetworkDot(payload).then(res => {
          if (res && res.code === 200) {
            this.$message.success(res.msg || '保存成功')
            this.isEditing = false
            this.editStation = null
            this.settingAreaOptions = []
            this.settingAreaCascaderKey += 1
            this.initStation()
          } else {
            this.$message.error((res && res.msg) || '保存失败')
          }
        }).catch(() => {
          this.$message.error('保存失败')
        }).finally(() => {
          this.detailSaving = false
        })
      })
    },
    handleTabClick(tab) {
      if (tab.name === 'detail') {
        this.$nextTick(() => {
          this.initMap()
          this.updateMapPosition()
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
      if (type === '1') return `${value}%`
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
        if (res.code === 200) {
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
            locationAddress: Number(data.locationAddress ?? data.location_address ?? 1),
            isDuty: this.normalizeFlag01(data.isDuty),
            isAloneApply: this.normalizeFlag01(data.isAloneApply),
            isPublicParkingLot: this.normalizeFlag01(data.isPublicParkingLot),
            isBarrierGate: this.normalizeBool(data.isBarrierGate),
            isLockFlag: this.normalizeBool(data.isLockFlag),
            businessHours,
            stationTag,
            networkProvince: data.networkProvince ?? data.network_province ?? '',
            networkCity: data.networkCity ?? data.network_city ?? '',
            networkRegion: data.networkRegion ?? data.network_region ?? ''
          }
          this.loadStationAreaDisplayText()
          this.loadStationPictures()
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
      const data = this.isEditing && this.editStation ? this.editStation : this.station
      const lng = Number(data.networkLongitude)
      const lat = Number(data.networkLatitude)
      if (this.GDMap) {
        this.updateMapPosition()
        return
      }
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
        this.GDMarker = marker
      })
    },
    updateMapPosition() {
      if (!this.GDMap) return
      const data = this.isEditing && this.editStation ? this.editStation : this.station
      const lng = Number(data.networkLongitude)
      const lat = Number(data.networkLatitude)
      if (!lng || !lat) return
      const center = [lng, lat]
      try {
        this.GDMap.setCenter(center)
        this.GDMap.setZoom(18)
        if (this.GDMarker && this.GDMarker.setPosition) {
          this.GDMarker.setPosition(center)
        }
      } catch (e) {
        void e
      }
    },
    getMerchant() {
      getMerchant({ roleType: 'OPERATOR', type: 1 }).then(res => {
        if (res && res.code === 200) {
          this.merchantList = res.data || []
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
        if (res.code === 200) {
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
        powerRateType: this.commissionExists ? String(this.commission.powerRateType ?? '1') : '1',
        powerRate: this.commissionExists ? (this.commission.powerRate ?? '0') : '0',
        serviceRateType: this.commissionExists ? String(this.commission.serviceRateType ?? '1') : '1',
        serviceRate: this.commissionExists ? (this.commission.serviceRate ?? '0') : '0'
      }
    },
    saveCommissionRule() {
      this.$refs.commissionForm.validate(valid => {
        if (!valid) return
        this.commissionSaving = true
        const payload = { ...this.commissionForm, stationId: this.stationId }
        saveCommissionRuleApi(payload).then(res => {
          if (res.code === 200) {
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
      listCompletedTradeMerchant({ roleType: 'SETTLE', status: '30' }).then(res => {
        if (res && res.code === 200) {
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
      const name = item.name || item.merchantName || ''
      const accame = item.settBankAccName || item.merchantName || item.merchant_name || item.name || ''
      const acc = item.settBankAccNo || item.merchantNo || item.busTradeMerNo || item.no || ''
      if (accame && acc && name) return `${name}  ${accame} ${acc}`
      return name || accame || acc || ''
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
        if (res && res.code === 200) {
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
            if (prev && prev.code && prev.code !== 200) return prev
            return saveSplitConfigApi(item)
          })
        }, Promise.resolve({ code: 200 })).then(res => {
          if (res && res.code === 200) return { code: 200, msg: '保存成功' }
          return res
        })
      }

      callOneByOne().then(res => {
        if (res && res.code === 200) {
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

<style scoped>
.detail-view {
  padding: 6px 2px 14px;
}

.detail-section {
  padding: 14px 0 6px;
}

.detail-section__title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.kv {
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 12px;
  margin-bottom: 12px;
  min-height: 66px;
}

.kv__label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.kv__value {
  font-size: 14px;
  color: #303133;
  word-break: break-all;
  line-height: 20px;
}

.detail-map {
  height: 400px;
  width: 100%;
  margin: 14px 0 10px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.detail-edit {
  padding-top: 8px;
}

.station-picture-view-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.station-picture-view-item {
  width: 120px;
}

.station-picture-view-img {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  background: #fff;
}

.station-picture-view-empty {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}

.station-picture-view-label {
  text-align: center;
  color: #409EFF;
  margin-top: 6px;
  font-size: 12px;
}

.picture-grid {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.picture-slot {
  width: 120px;
}

.picture-box {
  width: 120px;
  height: 120px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.picture-plus {
  font-size: 28px;
  color: #909399;
}

.picture-label {
  text-align: center;
  color: #409EFF;
  margin-top: 8px;
  font-size: 12px;
}

.picture-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
