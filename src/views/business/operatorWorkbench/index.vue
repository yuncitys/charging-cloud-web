<template>
  <div class="app-container operator-workbench-page">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="form left" @submit.native.prevent="search">
        <el-form-item label="统计周期">
          <el-radio-group v-model="searchForm.periodType" size="small" @change="search">
            <el-radio-button label="TODAY">今日</el-radio-button>
            <el-radio-button label="WEEK">本周</el-radio-button>
            <el-radio-button label="MONTH">本月</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商户">
          <el-select
            v-model="searchForm.merchantId"
            clearable
            filterable
            placeholder="全部"
            style="width: 200px"
            @change="onMerchantChange"
          >
            <el-option v-for="m in merchantList" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="业态">
          <el-select
            v-model="searchForm.ruleId"
            clearable
            placeholder="全部"
            style="width: 140px"
            @change="onRuleChange"
          >
            <el-option v-for="r in ruleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="站点">
          <el-select
            v-model="searchForm.stationIds"
            clearable
            filterable
            multiple
            collapse-tags
            placeholder="全部"
            style="width: 240px"
          >
            <el-option v-for="s in filteredStationList" :key="s.id" :label="s.networkName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="anyLoading" @click="search">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 经营概览 -->
    <div v-if="canView" class="wb-block" v-loading="blocks.overview.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">经营概览</span>
        <span class="wb-block__meta" :title="overviewMeta.title">
          <span class="wb-block__meta-item"><em>统计周期</em>{{ overviewMeta.period }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>统计区间</em>{{ overviewMeta.range }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>同步</em>{{ overviewMeta.sync }}</span>
        </span>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/business/businessStatistics')">
          经营报表 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.overview.error" class="wb-error">
        <span>{{ blocks.overview.error }}</span>
        <el-button size="mini" type="primary" @click="loadOverview">重试</el-button>
      </div>
      <div v-else class="wb-cards">
        <div class="wb-card">
          <div class="wb-card__label">经营实收（元）</div>
          <div class="wb-card__value">{{ money(overview.actualIncome) }}</div>
          <div class="wb-card__sub">与经营报表一致（订单实收口径）</div>
          <div class="wb-card__sub">
            环比
            <span v-if="overview.incomeWow != null" :class="overview.incomeWow >= 0 ? 'up' : 'down'">
              {{ overview.incomeWow >= 0 ? '↑' : '↓' }} {{ percent(Math.abs(overview.incomeWow)) }}
            </span>
            <span v-else>--</span>
          </div>
        </div>
        <div class="wb-card">
          <div class="wb-card__label">充电量（度）</div>
          <div class="wb-card__value">{{ money(overview.chargeKwh) }}</div>
        </div>
        <div class="wb-card">
          <div class="wb-card__label">订单数</div>
          <div class="wb-card__value">{{ overview.orderCount != null ? overview.orderCount : 0 }}</div>
        </div>
        <div class="wb-card">
          <div class="wb-card__label">优惠金额（元）</div>
          <div class="wb-card__value">{{ money(overview.discountAmount) }}</div>
        </div>
      </div>
      <div v-if="!blocks.overview.error" class="wb-fee">
        <div class="wb-fee__title">费用结构</div>
        <div class="wb-fee__bar">
          <div class="wb-fee__seg wb-fee__seg--elec" :style="{ width: feeElecPercent + '%' }" />
          <div class="wb-fee__seg wb-fee__seg--service" :style="{ width: feeServicePercent + '%' }" />
        </div>
        <div class="wb-fee__legend">
          <span><i class="dot dot--elec" />电费 {{ money(overview.electricFee) }} 元（{{ feeElecPercent }}%）</span>
          <span><i class="dot dot--service" />服务费 {{ money(overview.serviceFee) }} 元（{{ feeServicePercent }}%）</span>
        </div>
      </div>
    </div>

    <!-- 终端状态（实时，不随统计周期变化） -->
    <div v-if="canView" class="wb-block" v-loading="blocks.terminal.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">终端状态</span>
        <span class="wb-block__meta" :title="terminalMeta.title">
          <span class="wb-block__meta-item"><em>统计周期</em>{{ terminalMeta.period }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>统计区间</em>{{ terminalMeta.range }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>同步</em>{{ terminalMeta.sync }}</span>
        </span>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/device/faultMonitor')">
          异常明细 <i class="el-icon-arrow-right" />
        </el-link>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/device/stationMonitor')">
          电站监控 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.terminal.error" class="wb-error">
        <span>{{ blocks.terminal.error }}</span>
        <el-button size="mini" type="primary" @click="loadTerminal">重试</el-button>
      </div>
      <div v-else class="wb-term">
        <div v-for="col in terminalColumns" :key="col.key" class="wb-term__col">
          <div class="wb-term__title">{{ col.title }}</div>
          <div class="wb-term__grid">
            <div v-for="st in TERMINAL_STATES" :key="st.key" class="wb-card wb-term__item">
              <div class="wb-card__label">{{ st.label }}</div>
              <div class="wb-card__value" :class="st.cls">{{ int(terminal[col.key] && terminal[col.key][st.key]) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 充电用户（跟顶栏周期，末日可含今天；约每 15 分钟同步） -->
    <div v-if="canView" class="wb-block" v-loading="blocks.chargeUser.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">充电用户</span>
        <el-tooltip effect="dark" placement="top" :content="CHARGE_USER_TIP">
          <i class="el-icon-question wb-col-help wb-cu-help" />
        </el-tooltip>
        <span class="wb-block__meta" :title="chargeUserMeta.title">
          <span class="wb-block__meta-item"><em>统计周期</em>{{ chargeUserMeta.period }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>统计区间</em>{{ chargeUserMeta.range }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>同步</em>{{ chargeUserMeta.sync }}</span>
        </span>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="openChargeUserAnalysis">
          用户分析 <i class="el-icon-data-line" />
        </el-link>
      </div>
      <div v-if="blocks.chargeUser.error" class="wb-error">
        <span>{{ blocks.chargeUser.error }}</span>
        <el-button size="mini" type="primary" @click="loadChargeUser">重试</el-button>
      </div>
      <div v-else class="wb-cu">
        <div class="wb-cu__cards">
          <div class="wb-card">
            <div class="wb-card__label">充电用户数</div>
            <div class="wb-card__value">{{ int(chargeUser.chargeUserCount) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">新增充电用户数</div>
            <div class="wb-card__value">{{ int(chargeUser.newChargeUserCount) }}</div>
          </div>
        </div>
        <div class="wb-cu__ring">
          <div class="wb-ring" :style="chargeUserRingStyle">
            <div class="wb-ring__inner">{{ chargeUserNewPercent }}%</div>
          </div>
          <div class="wb-cu__ring-text">
            <div class="wb-card__label">新增占比</div>
            <div class="wb-card__sub">新增 ÷ 充电用户</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户分析抽屉：昨日|本月对照卡 + 近 30 日趋势 + 本月按站 Top；筛选继承商户/业态/站点 -->
    <el-drawer
      title="用户分析"
      :visible.sync="cuDrawer"
      direction="rtl"
      size="760px"
      append-to-body
      custom-class="wb-alert-config-drawer"
    >
      <div class="wb-drawer">
        <div class="wb-drawer__body">
          <div class="wb-drawer__note wb-ma-note">{{ CHARGE_USER_ANALYSIS_NOTE }}</div>
          <div v-if="cuError" class="wb-ma-error">
            <span>{{ cuError }}</span>
            <el-button size="mini" type="primary" @click="loadChargeUserAnalysis">重试</el-button>
          </div>
          <div v-else v-loading="cuLoading">
            <div class="wb-cu-compare">
              <div v-for="c in cuCompareCards" :key="c.key" class="wb-card">
                <div class="wb-card__label">{{ c.card.titleHint || c.fallbackTitle }}</div>
                <div class="wb-cu-compare__row">
                  <div>
                    <div class="wb-card__sub">充电用户</div>
                    <div class="wb-card__value">{{ int(c.card.chargeUserCount) }}</div>
                  </div>
                  <div>
                    <div class="wb-card__sub">新增</div>
                    <div class="wb-card__value">{{ int(c.card.newChargeUserCount) }}</div>
                  </div>
                </div>
                <div class="wb-card__sub">{{ cuCardPeriod(c.card) }}</div>
              </div>
            </div>

            <div class="wb-ma-title">近 30 日趋势（每日人数，非累计）</div>
            <el-table :data="cuTrend" size="small" max-height="360" empty-text="暂无数据" style="width: 100%">
              <el-table-column label="日期" prop="date" min-width="110" />
              <el-table-column label="当日充电用户" min-width="120" align="right">
                <template slot-scope="scope">{{ int(scope.row.chargeUserCount) }}</template>
              </el-table-column>
              <el-table-column label="当日新增" min-width="100" align="right">
                <template slot-scope="scope">{{ int(scope.row.newChargeUserCount) }}</template>
              </el-table-column>
            </el-table>

            <div class="wb-ma-title">本月按站充电用户 Top 10</div>
            <div class="wb-tip wb-cu-top-note">{{ CHARGE_USER_STATION_TOP_NOTE }}</div>
            <el-table :data="cuStationTop" size="small" empty-text="暂无数据" style="width: 100%">
              <el-table-column label="#" type="index" width="50" align="center" />
              <el-table-column label="电站名称" min-width="200" show-overflow-tooltip>
                <template slot-scope="scope">{{ scope.row.stationName || ('电站 ' + scope.row.stationId) }}</template>
              </el-table-column>
              <el-table-column label="充电用户数" min-width="110" align="right">
                <template slot-scope="scope">{{ int(scope.row.chargeUserCount) }}</template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="wb-drawer__footer">
          <el-button size="small" @click="cuDrawer = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 异常预警 -->
    <div v-if="canAlerts" class="wb-block" v-loading="blocks.alerts.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">异常预警</span>
        <span class="wb-block__meta" :title="alertMeta.title">
          <span class="wb-block__meta-item"><em>统计周期</em>{{ alertMeta.period }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>统计区间</em>{{ alertMeta.range }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>同步</em>{{ alertMeta.sync }}</span>
        </span>
        <el-button class="wb-block__btn" size="mini" icon="el-icon-setting" @click="openConfig">预警设置</el-button>
        <el-button size="mini" icon="el-icon-view" @click="openDismissed">已忽略</el-button>
        <el-button size="mini" icon="el-icon-close" :disabled="!alertSelection.length" @click="openBatchDismiss">
          批量忽略<template v-if="alertSelection.length">（{{ alertSelection.length }}）</template>
        </el-button>
        <el-link class="wb-block__link wb-block__link--inline" type="primary" :underline="false" @click="go('/device/faultMonitor')">
          故障监控 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.alerts.error" class="wb-error">
        <span>{{ blocks.alerts.error }}</span>
        <el-button size="mini" type="primary" @click="loadAlerts">重试</el-button>
      </div>
      <template v-else>
        <el-table :data="alerts" size="small" style="width: 100%" empty-text="暂无预警" @selection-change="onAlertSelectionChange">
          <el-table-column type="selection" width="45" align="center" />
          <el-table-column label="站点" prop="stationName" min-width="160" show-overflow-tooltip />
          <el-table-column label="预警类型" width="120" align="center">
            <template slot-scope="scope">
              <el-tag size="small" :type="alertMeta(scope.row.alertType).tag">{{ alertMeta(scope.row.alertType).label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="说明" min-width="260">
            <template slot-scope="scope">{{ alertDesc(scope.row) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="goAlert(scope.row)">去处理</el-button>
              <el-button type="text" size="small" @click="openDismiss(scope.row)">忽略</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="wb-pagination"
          background
          layout="total, sizes, prev, pager, next"
          :total="alertTotal"
          :current-page="alertPage"
          :page-size="alertLimit"
          :page-sizes="[20, 50, 100]"
          @size-change="onAlertSizeChange"
          @current-change="onAlertPageChange"
        />
      </template>
    </div>

    <!-- 预警设置抽屉：自定义 class + 底栏固定，避免说明文案过长把「保存」顶出可视区 -->
    <el-drawer
      title="预警设置"
      :visible.sync="configDrawer"
      direction="rtl"
      size="480px"
      append-to-body
      custom-class="wb-alert-config-drawer"
    >
      <div class="wb-drawer">
        <div class="wb-drawer__body">
          <el-form label-position="top" size="small">
            <el-form-item v-if="!searchForm.merchantId" label="商户">
              <el-select v-model="configMerchantId" filterable placeholder="请选择商户" style="width: 100%" @change="loadConfig">
                <el-option v-for="m in merchantList" :key="m.id" :label="m.name" :value="m.id" />
              </el-select>
            </el-form-item>
          </el-form>
          <el-form v-loading="configLoading" label-position="top" size="small" class="wb-config-form">
            <el-form-item label="收入骤降比例">
              <el-input-number v-model="configForm.dropRatioThreshold" :min="0.01" :max="1" :step="0.05" :precision="4" style="width: 200px" />
              <div class="wb-tip">{{ FIELD_TIPS.dropRatioThreshold }}</div>
            </el-form-item>
            <el-form-item label="骤降基线金额（元）">
              <el-input-number v-model="configForm.dropBaselineMin" :min="0" :step="10" :precision="2" style="width: 200px" />
              <div class="wb-tip">{{ FIELD_TIPS.dropBaselineMin }}</div>
            </el-form-item>
            <el-form-item label="故障高发（新建工单数）">
              <el-input-number v-model="configForm.faultHighMinOrders" :min="1" :step="1" :precision="0" style="width: 200px" />
              <div class="wb-tip">{{ FIELD_TIPS.faultHighMinOrders }}</div>
            </el-form-item>
            <el-form-item label="启动成功率下限">
              <el-input-number v-model="configForm.startSuccessRateMin" :min="0.01" :max="1" :step="0.05" :precision="4" style="width: 200px" />
              <div class="wb-tip">{{ FIELD_TIPS.startSuccessRateMin }}</div>
            </el-form-item>
            <el-form-item label="启动失败最少订单数">
              <el-input-number v-model="configForm.startFailMinSamples" :min="1" :step="1" :precision="0" style="width: 200px" />
              <div class="wb-tip">{{ FIELD_TIPS.startFailMinSamples }}</div>
            </el-form-item>
          </el-form>
          <div class="wb-drawer__note">{{ CONFIG_FOOTER_NOTE }}</div>
        </div>
        <div class="wb-drawer__footer">
          <el-button size="small" @click="configDrawer = false">取消</el-button>
          <el-button size="small" type="primary" :loading="configSaving" :disabled="!configMerchantId" @click="saveConfig">保存</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 忽略时长 -->
    <el-dialog title="忽略预警" :visible.sync="dismissDialog" width="420px" append-to-body>
      <div v-if="dismissMode === 'batch'" class="wb-dismiss-info">已选 {{ dismissTargets.length }} 条预警</div>
      <div v-else-if="dismissTarget" class="wb-dismiss-info">
        {{ dismissTarget.stationName }} · {{ alertMeta(dismissTarget.alertType).label }}
      </div>
      <el-form label-width="80px" size="small">
        <el-form-item label="忽略时长">
          <el-radio-group v-model="dismissDays">
            <el-radio-button :label="3">3 天</el-radio-button>
            <el-radio-button :label="7">7 天</el-radio-button>
            <el-radio-button :label="30">30 天</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="wb-tip">忽略后该站点该类型预警在期限内不再出现在列表，到期自动恢复；商户内共享，可在「已忽略」中取消。</div>
      <span slot="footer">
        <el-button size="small" @click="dismissDialog = false">取消</el-button>
        <el-button size="small" type="primary" :loading="dismissing" @click="confirmDismiss">确定</el-button>
      </span>
    </el-dialog>

    <!-- 已忽略抽屉 -->
    <el-drawer title="已忽略的预警" :visible.sync="dismissedDrawer" direction="rtl" size="560px" append-to-body>
      <div class="wb-drawer">
        <el-form v-if="!searchForm.merchantId" label-position="top" size="small">
          <el-form-item label="商户">
            <el-select v-model="dismissedMerchantId" filterable placeholder="请选择商户" style="width: 100%" @change="loadDismissed">
              <el-option v-for="m in merchantList" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
          </el-form-item>
        </el-form>
        <el-table v-loading="dismissedLoading" :data="dismissedList" size="small" empty-text="暂无已忽略预警">
          <el-table-column label="站点" prop="stationName" min-width="140" show-overflow-tooltip />
          <el-table-column label="类型" width="110" align="center">
            <template slot-scope="scope">
              <el-tag size="small" :type="alertMeta(scope.row.alertType).tag">{{ alertMeta(scope.row.alertType).label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="到期时间" prop="expireAt" min-width="150" />
          <el-table-column label="操作" width="90" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="cancelOne(scope.row)">取消忽略</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>

    <!-- 财务 -->
    <div v-if="canFinance" class="wb-block" v-loading="blocks.finance.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">财务</span>
        <span class="wb-block__meta" :title="financeMeta.title">
          <span class="wb-block__meta-item"><em>统计周期</em>{{ financeMeta.period }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>统计区间</em>{{ financeMeta.range }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>同步</em>{{ financeMeta.sync }}</span>
        </span>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/finance/stationFinanceDayBill')">
          站点日账单 <i class="el-icon-arrow-right" />
        </el-link>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/finance/settlementLedger')">
          结算台账 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.finance.error" class="wb-error">
        <span>{{ blocks.finance.error }}</span>
        <el-button size="mini" type="primary" @click="loadFinance">重试</el-button>
      </div>
      <template v-else>
        <el-alert v-if="finance.hint" class="wb-hint" type="info" :closable="false" show-icon :title="finance.hint" />
        <div class="wb-cards wb-cards--3">
          <div class="wb-card">
            <div class="wb-card__label">出账合计（元）</div>
            <div class="wb-card__value">{{ money(finance.receivable) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">结算实收（元）</div>
            <div class="wb-card__value">{{ money(finance.actualReceived) }}</div>
            <div class="wb-card__sub">与站点财务日账单一致</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">已结算（元）</div>
            <div class="wb-card__value">{{ money(finance.settledAmount) }}</div>
            <div class="wb-card__sub">{{ settledSubText }}</div>
          </div>
        </div>
        <div class="wb-yesterday">
          昨日：收入 {{ money(finance.yesterdayIncome) }} 元 ｜ 订单 {{ finance.yesterdayOrders != null ? finance.yesterdayOrders : 0 }} 笔 ｜
          电量 {{ money(finance.yesterdayKwh) }} 度
        </div>
      </template>
    </div>

    <!-- 营销：有权限即展示，数据全 0 也显示 -->
    <div v-if="canMarketing" class="wb-block" v-loading="blocks.marketing.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">营销</span>
        <span class="wb-block__meta" :title="marketingMeta.title">
          <span class="wb-block__meta-item"><em>统计周期</em>{{ marketingMeta.period }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>统计区间</em>{{ marketingMeta.range }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>同步</em>{{ marketingMeta.sync }}</span>
        </span>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="openMarketingAnalysis">
          营销分析 <i class="el-icon-data-line" />
        </el-link>
        <el-link class="wb-block__link wb-block__link--inline" type="primary" :underline="false" @click="go('/marketing/activityHub')">
          营销中心 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.marketing.error" class="wb-error">
        <span>{{ blocks.marketing.error }}</span>
        <el-button size="mini" type="primary" @click="loadMarketing">重试</el-button>
      </div>
      <template v-else>
        <div class="wb-cards wb-cards--6">
          <div class="wb-card">
            <div class="wb-card__label">进行中活动</div>
            <div class="wb-card__value">{{ int(marketing.activeActivityCount) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">发券数</div>
            <div class="wb-card__value">{{ int(marketing.issueCount) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">核销数</div>
            <div class="wb-card__value">{{ int(marketing.redeemCount) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">核销率</div>
            <div class="wb-card__value">{{ percent(marketing.redeemRate) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">优惠成本（元）</div>
            <div class="wb-card__value">{{ money(marketing.discountCost) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">补贴成本（元）</div>
            <div class="wb-card__value">{{ money(marketing.subsidyCost) }}</div>
          </div>
        </div>
        <!-- 活动参与：订单集与「核销订单实收」一致；电站/用户为日表逐日去重之和（跨日可能重复计） -->
        <div class="wb-cards wb-cards--3 wb-cards--row2">
          <div class="wb-card">
            <div class="wb-card__label">活动订单电量（度）</div>
            <div class="wb-card__value">{{ money(marketing.activityOrderKwh) }}</div>
            <div class="wb-card__sub">{{ MARKETING_TIPS.activityOrderKwh }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">参与电站数</div>
            <div class="wb-card__value">{{ int(marketing.participateStationCount) }}</div>
            <div class="wb-card__sub">{{ MARKETING_TIPS.participateStationCount }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">参与用户数</div>
            <div class="wb-card__value">{{ int(marketing.participateUserCount) }}</div>
            <div class="wb-card__sub">{{ MARKETING_TIPS.participateUserCount }}</div>
          </div>
        </div>
        <div class="wb-roi">
          核销订单实收 {{ money(marketing.redeemOrderActualIncome) }} 元 ｜ 粗略 ROI：
          <b>{{ marketing.roughRoi != null ? Number(marketing.roughRoi).toFixed(2) : '--' }}</b>
          <el-tag size="mini" type="warning" effect="plain" style="margin-left: 8px">
            {{ marketing.roiNote || '非严格增量' }}
          </el-tag>
        </div>
      </template>
    </div>

    <!-- 营销分析抽屉：日趋势 + 活动 Top；筛选继承商户/业态（站点对营销不生效） -->
    <el-drawer
      title="营销分析"
      :visible.sync="maDrawer"
      direction="rtl"
      size="760px"
      append-to-body
      custom-class="wb-alert-config-drawer"
    >
      <div class="wb-drawer">
        <div class="wb-drawer__body">
          <el-form :inline="true" size="small" class="wb-ma-filter" @submit.native.prevent>
            <el-form-item label="统计周期">
              <el-radio-group v-model="maMode" size="small" @change="loadMarketingAnalysis">
                <el-radio-button v-for="o in ANALYSIS_RANGE_OPTIONS" :key="o.value" :label="o.value">{{ o.label }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item class="wb-ma-range">
              <span v-if="maWindow">{{ maWindow.startDate }} ~ {{ maWindow.endDate }}（共 {{ maWindow.analysisDays }} 天）</span>
            </el-form-item>
          </el-form>
          <div class="wb-drawer__note wb-ma-note">{{ MARKETING_ANALYSIS_NOTE }}</div>
          <div v-if="searchForm.stationIds && searchForm.stationIds.length" class="wb-tip">
            营销按商户统计，所选站点筛选对本分析不生效；业态为「商户是否存在该业态网点」的软过滤。
          </div>

          <div v-if="maError" class="wb-ma-error">
            <span>{{ maError }}</span>
            <el-button size="mini" type="primary" @click="loadMarketingAnalysis">重试</el-button>
          </div>
          <template v-else>
            <div class="wb-ma-title">日趋势</div>
            <el-table v-loading="maLoading" :data="maTrend" size="small" max-height="360" empty-text="暂无数据" style="width: 100%">
              <el-table-column label="日期" prop="date" min-width="100" />
              <el-table-column label="发券数" min-width="80" align="right">
                <template slot-scope="scope">{{ int(scope.row.issueCount) }}</template>
              </el-table-column>
              <el-table-column label="核销数" min-width="80" align="right">
                <template slot-scope="scope">{{ int(scope.row.redeemCount) }}</template>
              </el-table-column>
              <el-table-column label="优惠成本(元)" min-width="110" align="right">
                <template slot-scope="scope">{{ money(scope.row.discountCost) }}</template>
              </el-table-column>
              <el-table-column label="活动订单电量(度)" min-width="130" align="right">
                <template slot-scope="scope">{{ money(scope.row.activityOrderKwh) }}</template>
              </el-table-column>
            </el-table>

            <div class="wb-ma-title">活动 Top 20</div>
            <el-table v-loading="maLoading" :data="maTop" size="small" empty-text="暂无数据" style="width: 100%">
              <el-table-column label="#" type="index" width="50" align="center" />
              <el-table-column label="活动名称" min-width="160" show-overflow-tooltip>
                <template slot-scope="scope">{{ scope.row.activityName || ('活动 ' + scope.row.activityId) }}</template>
              </el-table-column>
              <el-table-column label="发券数" min-width="80" align="right">
                <template slot-scope="scope">{{ int(scope.row.issueCount) }}</template>
              </el-table-column>
              <el-table-column label="核销数" min-width="80" align="right">
                <template slot-scope="scope">{{ int(scope.row.redeemCount) }}</template>
              </el-table-column>
              <el-table-column min-width="130" align="right">
                <template slot="header">
                  <span>活动订单电量(度)</span>
                  <el-tooltip effect="dark" placement="top" :content="MARKETING_TIPS.topKwh">
                    <i class="el-icon-question wb-col-help" @click.stop />
                  </el-tooltip>
                </template>
                <template slot-scope="scope">{{ money(scope.row.activityOrderKwh) }}</template>
              </el-table-column>
              <el-table-column label="优惠成本(元)" min-width="110" align="right">
                <template slot-scope="scope">{{ money(scope.row.discountCost) }}</template>
              </el-table-column>
            </el-table>
          </template>
        </div>
        <div class="wb-drawer__footer">
          <el-button size="small" @click="maDrawer = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 电站电量 Top10（周期随顶栏） -->
    <div v-if="canView" class="wb-block" v-loading="blocks.stationTop.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">电站电量前 10</span>
        <span class="wb-block__meta" :title="stationTopBlockMeta.title">
          <span class="wb-block__meta-item"><em>统计周期</em>{{ stationTopBlockMeta.period }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>统计区间</em>{{ stationTopBlockMeta.range }}</span>
          <span class="wb-block__meta-sep">｜</span>
          <span class="wb-block__meta-item"><em>同步</em>{{ stationTopBlockMeta.sync }}</span>
        </span>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/business/businessStatistics')">
          电站报表 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.stationTop.error" class="wb-error">
        <span>{{ blocks.stationTop.error }}</span>
        <el-button size="mini" type="primary" @click="loadStationTop">重试</el-button>
      </div>
      <el-table v-else :data="stationTop" size="small" style="width: 100%" empty-text="暂无数据">
        <el-table-column label="排名" prop="rank" width="70" align="center" />
        <el-table-column label="电站名称" prop="stationName" min-width="180" show-overflow-tooltip />
        <el-table-column label="总电量(度)" min-width="110" align="right">
          <template slot-scope="scope">{{ num(scope.row.totalKwh) }}</template>
        </el-table-column>
        <el-table-column min-width="130" align="right">
          <template slot="header">
            <span>日均电量(度)</span>
            <el-tooltip effect="dark" placement="top" :content="STATION_TOP_TIPS.avgDailyKwh">
              <i class="el-icon-question wb-col-help" @click.stop />
            </el-tooltip>
          </template>
          <template slot-scope="scope">{{ num(scope.row.avgDailyKwh) }}</template>
        </el-table-column>
        <el-table-column min-width="150" align="right">
          <template slot="header">
            <span>单枪日均电量(度)</span>
            <el-tooltip effect="dark" placement="top" :content="STATION_TOP_TIPS.avgDailyKwhPerGun">
              <i class="el-icon-question wb-col-help" @click.stop />
            </el-tooltip>
          </template>
          <template slot-scope="scope">{{ num(scope.row.avgDailyKwhPerGun) }}</template>
        </el-table-column>
        <el-table-column label="终端数量(个)" min-width="110" align="right">
          <template slot-scope="scope">{{ scope.row.gunCount != null ? scope.row.gunCount : '--' }}</template>
        </el-table-column>
        <el-table-column min-width="130" align="right">
          <template slot="header">
            <span>充电利用率(%)</span>
            <el-tooltip effect="dark" placement="top" :content="STATION_TOP_TIPS.utilizationRate">
              <i class="el-icon-question wb-col-help" @click.stop />
            </el-tooltip>
          </template>
          <template slot-scope="scope">{{ num(scope.row.utilizationRate) }}</template>
        </el-table-column>
        <el-table-column min-width="130" align="right">
          <template slot="header">
            <span>额定功率(kW)</span>
            <el-tooltip effect="dark" placement="top" :content="STATION_TOP_TIPS.ratedPowerKw">
              <i class="el-icon-question wb-col-help" @click.stop />
            </el-tooltip>
          </template>
          <template slot-scope="scope">{{ num(scope.row.ratedPowerKw) }}</template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="!canView && !canAlerts && !canFinance && !canMarketing" class="wb-block wb-error">暂无工作台数据权限</div>
  </div>
</template>

<script>
import { getMerchant } from '@/api/merchant/merchant'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import {
  workbenchOverview,
  workbenchAlerts,
  workbenchFinance,
  workbenchMarketing,
  workbenchMarketingAnalysis,
  workbenchChargeUsers,
  workbenchChargeUserAnalysis,
  getTerminalStatus,
  getStationPowerTop,
  getAlertConfig,
  saveAlertConfig,
  dismissAlert,
  batchDismissAlerts,
  listDismissed,
  cancelDismiss
} from '@/api/business/operatorWorkbench'
import { ANALYSIS_RANGE_OPTIONS, buildAnalysisWindow, fillTrend } from './marketingAnalysis'
import {
  CHARGE_USER_TIP,
  CHARGE_USER_ANALYSIS_NOTE,
  CHARGE_USER_STATION_TOP_NOTE,
  newUserPercent,
  ringStyle
} from './chargeUser'
import { SYNC, buildBlockMeta } from './blockMeta'

const ALERT_META = {
  START_FAIL: { label: '启动失败率高', tag: 'danger' },
  FAULT_HIGH: { label: '故障工单多', tag: 'danger' },
  INCOME_DROP: { label: '收入骤降', tag: 'warning' },
  ZERO_INCOME: { label: '零收入', tag: 'info' }
}

// 字段提示全文（spec：设置 UI）
const FIELD_TIPS = {
  dropRatioThreshold: '含义：判定日经营实收相对近 7 日均值的比例上限。作用：比例越低越「严」（更容易报骤降）。填 0.5 表示实收不到均价一半才告警。',
  dropBaselineMin: '含义：近 7 日均值的最低门槛。作用：均值低于该金额的站点不报骤降，避免长期低流水小站误报。',
  faultHighMinOrders: '含义：判定日新建故障工单数的下限。作用：达到或超过该笔数则进入「故障高发」列表，便于优先派修。',
  startSuccessRateMin: '含义：启动成功订单占比的最低可接受值。作用：成功率低于该值则告警；调低可减少告警，调高更敏感。',
  startFailMinSamples: '含义：参与成功率计算的最少样本（启动+无响应）。作用：样本不足不告警，避免「仅 1 单失败」刷屏。'
}

// 电站电量 Top10 表头公式（与后端 Service 口径一致）
const STATION_TOP_TIPS = {
  avgDailyKwh: '总电量 ÷ 区间天数 D（起止日含首尾，至少 1）',
  avgDailyKwhPerGun: '日均电量 ÷ 终端数量；终端数为 0 时显示 --',
  utilizationRate: '(总充电时长分钟 ÷ 60) ÷ (终端数量 × 24 × D) × 100；终端数为 0 时显示 --',
  ratedPowerKw: '站下未删设备额定功率之和（W）÷ 1000'
}
// 营销活动参与三字段口径（参与电站/用户为日表 SUM；与后端 OperatorWorkbenchMarketingVo 注释一致）
const MARKETING_TIPS = {
  activityOrderKwh: '有核销关联订单的充电量合计',
  participateStationCount: '区间内各日去重电站数之和（跨日可能重复计）',
  participateUserCount: '区间内各日去重用户数之和（跨日可能重复计）',
  topKwh: '同一订单被同活动多张券核销只计一次；一单跨多个活动则各活动各计一次，故 Top 合计可能大于趋势电量'
}
const MARKETING_ANALYSIS_NOTE = '趋势读营销日表，无数据的日期按 0 补齐；活动 Top 按核销数倒序（其次电量）。手工券与平台活动发券不计入 Top，Top 核销数已剔除已删除用户券，可能略小于趋势核销数。'
const CONFIG_FOOTER_NOTE = '修改后立即作用于预警列表，无需重跑统计任务。预警判定日规则与 V1 相同（选「今日」时看昨日已收口日）。'
const DEFAULT_CONFIG = {
  dropRatioThreshold: 0.5,
  dropBaselineMin: 100,
  faultHighMinOrders: 3,
  startSuccessRateMin: 0.9,
  startFailMinSamples: 10
}

// 终端状态：六态展示顺序与配色
const TERMINAL_STATES = [
  { key: 'fault', label: '故障', cls: 'wb-term--fault' },
  { key: 'offline', label: '离线', cls: 'wb-term--offline' },
  { key: 'occupy', label: '占用', cls: 'wb-term--occupy' },
  { key: 'charging', label: '充电中', cls: 'wb-term--charging' },
  { key: 'idle', label: '空闲', cls: 'wb-term--idle' },
  { key: 'other', label: '其他', cls: '' }
]
const TERMINAL_COLUMNS = [
  { key: 'dc', title: '直流' },
  { key: 'ac', title: '交流' }
]
function newBlock() {
  return { loading: false, error: '' }
}

export default {
  name: 'OperatorWorkbench',
  data() {
    return {
      searchForm: { periodType: 'TODAY', merchantId: null, ruleId: null, stationIds: [] },
      merchantList: [],
      ruleOptions: [],
      stationList: [],
      blocks: {
        overview: newBlock(),
        alerts: newBlock(),
        finance: newBlock(),
        marketing: newBlock(),
        chargeUser: newBlock(),
        terminal: newBlock(),
        stationTop: newBlock()
      },
      TERMINAL_STATES,
      terminalColumns: TERMINAL_COLUMNS,
      terminal: {},
      stationTop: [],
      stationTopMeta: {},
      FIELD_TIPS,
      STATION_TOP_TIPS,
      MARKETING_TIPS,
      MARKETING_ANALYSIS_NOTE,
      ANALYSIS_RANGE_OPTIONS,
      maDrawer: false,
      maLoading: false,
      maError: '',
      maMode: '30',
      maWindow: null,
      maTrend: [],
      maTop: [],
      maSeq: 0,
      CHARGE_USER_TIP,
      CHARGE_USER_ANALYSIS_NOTE,
      CHARGE_USER_STATION_TOP_NOTE,
      chargeUser: {},
      cuDrawer: false,
      cuLoading: false,
      cuError: '',
      cuYesterday: {},
      cuMonth: {},
      cuTrend: [],
      cuStationTop: [],
      cuSeq: 0,
      CONFIG_FOOTER_NOTE,
      configDrawer: false,
      configLoading: false,
      configSaving: false,
      configMerchantId: null,
      configForm: { ...DEFAULT_CONFIG },
      dismissDialog: false,
      dismissing: false,
      dismissTarget: null,
      dismissMode: 'one', // 'one' | 'batch'
      dismissTargets: [], // 批量模式下的已选行
      alertSelection: [],
      dismissDays: 7,
      dismissedDrawer: false,
      dismissedLoading: false,
      dismissedMerchantId: null,
      dismissedList: [],
      overview: {},
      alerts: [],
      alertPage: 1,
      alertLimit: 20,
      alertTotal: 0,
      finance: {},
      marketing: {}
    }
  },
  computed: {
    canView() { return this.perm(':web:operatorWorkbench:view') },
    canAlerts() { return this.perm(':web:operatorWorkbench:alerts') },
    canFinance() { return this.perm(':web:operatorWorkbench:finance') },
    canMarketing() { return this.perm(':web:operatorWorkbench:marketing') },
    anyLoading() {
      return Object.keys(this.blocks).some(k => this.blocks[k].loading)
    },
    // 站点列表已由 /networkDot/list 按 merchantId、ruleId 过滤（VO 无 merchantId，不能前端再滤）
    filteredStationList() {
      return this.stationList
    },
    overviewMeta() {
      return buildBlockMeta({
        periodType: this.searchForm.periodType,
        periodStart: this.overview.periodStart,
        periodEnd: this.overview.periodEnd,
        sync: SYNC.WORKBENCH_DAY,
        dataAsOf: this.overview.dataAsOf
      })
    },
    terminalMeta() {
      return buildBlockMeta({
        periodType: this.searchForm.periodType,
        sync: SYNC.REALTIME,
        followsPeriod: false
      })
    },
    chargeUserMeta() {
      const c = this.chargeUser
      return buildBlockMeta({
        periodType: this.searchForm.periodType,
        periodStart: c.periodStart,
        periodEnd: c.periodEnd,
        sync: SYNC.CHARGE_USER
      })
    },
    alertMeta() {
      const first = this.alerts.length ? this.alerts[0] : null
      const day = first && first.alertDate
      return buildBlockMeta({
        periodType: this.searchForm.periodType,
        periodStart: day,
        periodEnd: day,
        sync: SYNC.ALERT
      })
    },
    financeMeta() {
      const f = this.finance
      return buildBlockMeta({
        periodType: this.searchForm.periodType,
        periodStart: f.settlementPeriodStart,
        periodEnd: f.settlementPeriodEnd,
        sync: SYNC.FINANCE,
        dataAsOf: f.dataAsOf
      })
    },
    marketingMeta() {
      const m = this.marketing
      return buildBlockMeta({
        periodType: this.searchForm.periodType,
        periodStart: m.periodStart,
        periodEnd: m.periodEnd,
        sync: SYNC.MARKETING,
        dataAsOf: m.dataAsOf
      })
    },
    stationTopBlockMeta() {
      const m = this.stationTopMeta
      return buildBlockMeta({
        periodType: this.searchForm.periodType,
        periodStart: m.periodStart,
        periodEnd: m.periodEnd,
        sync: SYNC.STATION_TOP,
        dataAsOf: m.dataAsOf
      })
    },
    chargeUserNewPercent() {
      return newUserPercent(this.chargeUser.newChargeUserCount, this.chargeUser.chargeUserCount)
    },
    chargeUserRingStyle() {
      return ringStyle(this.chargeUserNewPercent)
    },
    cuCompareCards() {
      return [
        { key: 'yesterday', card: this.cuYesterday || {}, fallbackTitle: '昨日充电用户' },
        { key: 'month', card: this.cuMonth || {}, fallbackTitle: '本月充电用户' }
      ]
    },
    settledSubText() {
      const f = this.finance
      if (!f.settlementPeriodStart) return '商户结算快照汇总'
      const range = f.settlementPeriodStart === f.settlementPeriodEnd
        ? f.settlementPeriodStart
        : `${f.settlementPeriodStart} ~ ${f.settlementPeriodEnd}`
      return `结算快照汇总（${range}），待结算暂无`
    },
    feeTotal() {
      return (Number(this.overview.electricFee) || 0) + (Number(this.overview.serviceFee) || 0)
    },
    feeElecPercent() {
      if (!this.feeTotal) return 0
      return Math.round((Number(this.overview.electricFee) || 0) / this.feeTotal * 1000) / 10
    },
    feeServicePercent() {
      if (!this.feeTotal) return 0
      return Math.round((100 - this.feeElecPercent) * 10) / 10
    }
  },
  created() {
    this.initMerchant()
    this.initRuleOptions()
    this.initStationList()
    this.search()
  },
  methods: {
    perm(code) {
      return !!(this.btnAuthen && this.btnAuthen.permsVerifAuthention(code))
    },
    buildParams(withPage) {
      const f = this.searchForm
      const p = { periodType: f.periodType }
      if (f.merchantId) p.merchantId = f.merchantId
      if (f.ruleId !== null && f.ruleId !== undefined && f.ruleId !== '') p.ruleId = f.ruleId
      if (f.stationIds && f.stationIds.length) p.stationIds = f.stationIds
      if (withPage) {
        p.page = this.alertPage
        p.limit = this.alertLimit
      }
      return p
    },
    initMerchant() {
      getMerchant().then(res => {
        if (res.code === 200) this.merchantList = res.data || []
      }).catch(() => {})
    },
    // 业态选项：字典 device_rule（按 BaseConfig.VUE_RULE_ID_TABS 过滤，值为数字）
    initRuleOptions() {
      this.$dict.getDeviceRuleOptions().then(list => {
        this.ruleOptions = list || []
      }).catch(() => { this.ruleOptions = [] })
    },
    // 站点候选：后端按 merchantId / ruleId 过滤（VO 不含这两字段，无法前端过滤）
    initStationList() {
      const params = {}
      if (this.searchForm.merchantId) params.merchantId = this.searchForm.merchantId
      if (this.searchForm.ruleId !== null && this.searchForm.ruleId !== undefined && this.searchForm.ruleId !== '') {
        params.ruleId = this.searchForm.ruleId
      }
      return getChargingStationList(params).then(res => {
        if (res.code === 200) this.stationList = res.data || []
      }).catch(() => { this.stationList = [] })
    },
    // 切换商户/业态：重拉站点候选，剔除已选但不在候选内的站点，再查询
    onMerchantChange() {
      this.initStationList().then(() => {
        const allowed = new Set(this.filteredStationList.map(s => s.id))
        this.searchForm.stationIds = this.searchForm.stationIds.filter(id => allowed.has(id))
        this.search()
      })
    },
    onRuleChange() {
      this.initStationList().then(() => {
        const allowed = new Set(this.filteredStationList.map(s => s.id))
        this.searchForm.stationIds = this.searchForm.stationIds.filter(id => allowed.has(id))
        this.search()
      })
    },
    search() {
      // 无权限不请求；四块互不阻断；查询/换筛选条件回到第 1 页
      this.alertPage = 1
      if (this.canView) {
        this.loadOverview()
        this.loadTerminal()
        this.loadChargeUser()
        this.loadStationTop()
      }
      if (this.canAlerts) this.loadAlerts()
      if (this.canFinance) this.loadFinance()
      if (this.canMarketing) this.loadMarketing()
    },
    // 通用块加载：失败只影响本块
    runBlock(key, api, onOk, withPage) {
      const block = this.blocks[key]
      block.loading = true
      block.error = ''
      return api(this.buildParams(withPage)).then(res => {
        if (res && res.code === 200) {
          onOk(res.data, res)
        } else {
          block.error = (res && res.msg) || '加载失败，请重试'
        }
      }).catch(e => {
        block.error = (e && e.message) || '加载失败，请重试'
      }).then(() => {
        block.loading = false
      })
    },
    loadOverview() {
      return this.runBlock('overview', workbenchOverview, d => { this.overview = d || {} })
    },
    loadAlerts() {
      // 刷新/失败重试前清空勾选，避免表格销毁后「批量忽略（N）」仍指向不可见旧行
      this.alertSelection = []
      return this.runBlock('alerts', workbenchAlerts, (d, res) => {
        this.alerts = Array.isArray(d) ? d : []
        const count = Number(res && res.count)
        this.alertTotal = isNaN(count) ? this.alerts.length : count
        // 忽略/取消后当前页已越界：回退到最后一页重新加载
        if (!this.alerts.length && this.alertTotal > 0 && this.alertPage > 1) {
          this.alertPage = Math.max(1, Math.ceil(this.alertTotal / this.alertLimit))
          this.$nextTick(() => this.loadAlerts()) // 等外层 loading 复位后再重载
        }
      }, true)
    },
    onAlertPageChange(page) {
      this.alertPage = page
      this.loadAlerts() // loadAlerts 内会清空勾选
    },
    onAlertSizeChange(size) {
      this.alertLimit = size
      this.alertPage = 1
      this.loadAlerts()
    },
    loadFinance() {
      return this.runBlock('finance', workbenchFinance, d => { this.finance = d || {} })
    },
    loadMarketing() {
      return this.runBlock('marketing', workbenchMarketing, d => { this.marketing = d || {} })
    },
    // 营销分析：窗口末日/天数由前端算（服务端 statDate 仅为末日，不识别周期；末日夹取到今天）
    openMarketingAnalysis() {
      this.maMode = '30'
      this.maDrawer = true
      this.loadMarketingAnalysis()
    },
    loadMarketingAnalysis() {
      const win = buildAnalysisWindow(this.maMode, this.searchForm.periodType)
      this.maWindow = win
      const params = this.buildParams()
      delete params.stationIds // 营销为商户维，站点筛选不生效
      params.statDate = win.statDate
      params.analysisDays = win.analysisDays
      const seq = ++this.maSeq // 切换周期时丢弃过期响应
      this.maLoading = true
      this.maError = ''
      return workbenchMarketingAnalysis(params).then(res => {
        if (seq !== this.maSeq) return
        if (res && res.code === 200) {
          const d = res.data || {}
          this.maTrend = fillTrend(d.trend, win)
          this.maTop = Array.isArray(d.activityTop) ? d.activityTop : []
        } else {
          this.maError = (res && res.msg) || '加载失败，请重试'
        }
      }).catch(e => {
        if (seq !== this.maSeq) return
        this.maError = (e && e.message) || '加载失败，请重试'
      }).then(() => {
        if (seq === this.maSeq) this.maLoading = false
      })
    },
    loadChargeUser() {
      return this.runBlock('chargeUser', workbenchChargeUsers, d => { this.chargeUser = d || {} })
    },
    // 用户分析：不识别 periodType，statDate 缺省今天（服务端取最近已收口日）；筛选继承商户/业态/站点
    openChargeUserAnalysis() {
      this.cuDrawer = true
      this.loadChargeUserAnalysis()
    },
    loadChargeUserAnalysis() {
      const seq = ++this.cuSeq // 筛选变化后重开抽屉时丢弃过期响应
      this.cuLoading = true
      this.cuError = ''
      return workbenchChargeUserAnalysis(this.buildParams()).then(res => {
        if (seq !== this.cuSeq) return
        if (res && res.code === 200) {
          const d = res.data || {}
          this.cuYesterday = d.yesterday || {}
          this.cuMonth = d.monthToDate || {}
          this.cuTrend = Array.isArray(d.trend) ? d.trend : []
          this.cuStationTop = Array.isArray(d.stationTop) ? d.stationTop : []
        } else {
          this.cuError = (res && res.msg) || '加载失败，请重试'
        }
      }).catch(e => {
        if (seq !== this.cuSeq) return
        this.cuError = (e && e.message) || '加载失败，请重试'
      }).then(() => {
        if (seq === this.cuSeq) this.cuLoading = false
      })
    },
    cuCardPeriod(c) {
      if (c.subHint) return c.subHint
      if (!c.periodStart) return '--'
      return c.periodStart === c.periodEnd ? `统计日 ${c.periodStart}` : `统计区间 ${c.periodStart} ~ ${c.periodEnd}`
    },
    loadTerminal() {
      return this.runBlock('terminal', getTerminalStatus, d => { this.terminal = d || {} })
    },
    loadStationTop() {
      return this.runBlock('stationTop', getStationPowerTop, d => {
        // 兼容旧版：data 直接为数组；新版为 { list, dataAsOf, periodStart, periodEnd, periodHint }
        if (Array.isArray(d)) {
          this.stationTop = d
          this.stationTopMeta = {}
          return
        }
        const o = d || {}
        this.stationTop = Array.isArray(o.list) ? o.list : []
        this.stationTopMeta = {
          dataAsOf: o.dataAsOf,
          periodStart: o.periodStart,
          periodEnd: o.periodEnd,
          periodHint: o.periodHint
        }
      })
    },
    // 默认商户：筛选商户 > 唯一商户 > 空（需在抽屉内选择）
    defaultMerchantId() {
      if (this.searchForm.merchantId) return this.searchForm.merchantId
      return this.merchantList.length === 1 ? this.merchantList[0].id : null
    },
    openConfig() {
      this.configMerchantId = this.defaultMerchantId()
      this.configForm = { ...DEFAULT_CONFIG }
      this.configDrawer = true
      if (this.configMerchantId) this.loadConfig()
    },
    loadConfig() {
      if (!this.configMerchantId) return
      this.configLoading = true
      getAlertConfig(this.configMerchantId).then(res => {
        if (res && res.code === 200 && res.data) {
          const d = res.data
          this.configForm = {
            dropRatioThreshold: Number(d.dropRatioThreshold),
            dropBaselineMin: Number(d.dropBaselineMin),
            faultHighMinOrders: Number(d.faultHighMinOrders),
            startSuccessRateMin: Number(d.startSuccessRateMin),
            startFailMinSamples: Number(d.startFailMinSamples)
          }
        } else {
          this.$message.error((res && res.msg) || '读取预警设置失败')
        }
      }).catch(() => {}).then(() => { this.configLoading = false })
    },
    saveConfig() {
      if (!this.configMerchantId) return this.$message.warning('请选择商户')
      this.configSaving = true
      saveAlertConfig({ merchantId: this.configMerchantId, ...this.configForm }).then(res => {
        if (res && res.code === 200) {
          this.$message.success('保存成功')
          this.configDrawer = false
          this.loadAlerts() // 保存后立即刷新预警列表
        } else {
          this.$message.error((res && res.msg) || '保存失败')
        }
      }).catch(() => {}).then(() => { this.configSaving = false })
    },
    onAlertSelectionChange(rows) {
      this.alertSelection = rows || []
    },
    openDismiss(row) {
      this.dismissMode = 'one'
      this.dismissTarget = row
      this.dismissTargets = []
      this.dismissDays = 7
      this.dismissDialog = true
    },
    openBatchDismiss() {
      if (!this.alertSelection.length) return
      this.dismissMode = 'batch'
      this.dismissTarget = null
      this.dismissTargets = this.alertSelection.slice()
      this.dismissDays = 7
      this.dismissDialog = true
    },
    // 批量：缺 merchantId（行内与筛选商户均无）的行在提交前过滤，计入失败条数并提示
    confirmBatchDismiss() {
      const items = []
      let skipped = 0
      this.dismissTargets.forEach(row => {
        const merchantId = row.merchantId || this.searchForm.merchantId
        if (!merchantId) {
          skipped++
          return
        }
        items.push({ merchantId, stationId: row.stationId, alertType: row.alertType })
      })
      if (!items.length) {
        return this.$message.warning('所选预警缺少商户信息，请先在筛选中选择商户')
      }
      this.dismissing = true
      batchDismissAlerts({ days: this.dismissDays, items }).then(res => {
        if (res && res.code === 200) {
          const d = res.data || {}
          const ok = Number(d.successCount) || 0
          const fail = (Number(d.failCount) || 0) + skipped
          const firstMsg = d.failures && d.failures.length ? d.failures[0].msg : ''
          if (fail > 0) {
            this.$message.warning(`已忽略 ${ok} 条，失败 ${fail} 条${firstMsg ? '（' + firstMsg + '）' : ''}`)
          } else {
            this.$message.success(`已忽略 ${ok} 条`)
          }
          this.dismissDialog = false
          this.dismissTargets = []
          this.loadAlerts()
        } else {
          this.$message.error((res && res.msg) || '批量忽略失败')
          this.loadAlerts()
        }
      }).catch(() => {
        this.loadAlerts()
      }).then(() => { this.dismissing = false })
    },
    confirmDismiss() {
      if (this.dismissMode === 'batch') return this.confirmBatchDismiss()
      const row = this.dismissTarget
      if (!row) return
      const merchantId = row.merchantId || this.searchForm.merchantId
      this.dismissing = true
      dismissAlert({
        merchantId,
        stationId: row.stationId,
        alertType: row.alertType,
        days: this.dismissDays
      }).then(res => {
        if (res && res.code === 200) {
          this.$message.success(`已忽略 ${this.dismissDays} 天`)
          this.dismissDialog = false
          this.loadAlerts()
        } else {
          this.$message.error((res && res.msg) || '忽略失败')
        }
      }).catch(() => {}).then(() => { this.dismissing = false })
    },
    openDismissed() {
      this.dismissedMerchantId = this.defaultMerchantId()
      this.dismissedList = []
      this.dismissedDrawer = true
      if (this.dismissedMerchantId) this.loadDismissed()
    },
    loadDismissed() {
      if (!this.dismissedMerchantId) return
      this.dismissedLoading = true
      listDismissed(this.dismissedMerchantId).then(res => {
        if (res && res.code === 200) {
          this.dismissedList = Array.isArray(res.data) ? res.data : []
        } else {
          this.$message.error((res && res.msg) || '加载失败')
        }
      }).catch(() => {}).then(() => { this.dismissedLoading = false })
    },
    cancelOne(row) {
      cancelDismiss(row.id, this.dismissedMerchantId).then(res => {
        if (res && res.code === 200) {
          this.$message.success('已取消忽略')
          this.loadDismissed()
          this.loadAlerts()
        } else {
          this.$message.error((res && res.msg) || '取消失败')
        }
      }).catch(() => {})
    },
    alertMeta(type) {
      return ALERT_META[type] || { label: type || '-', tag: 'info' }
    },
    alertDesc(row) {
      const m = row.metricValue
      const c = row.compareValue
      switch (row.alertType) {
        case 'ZERO_INCOME': return '判定日实收为 0'
        case 'INCOME_DROP': return `较前7日均值降幅 ${this.percent(m)}，判定日实收 ${this.money(c)} 元`
        case 'FAULT_HIGH': return `判定日新建故障工单 ${this.int(m)} 个（阈值 ${this.int(c)}）`
        case 'START_FAIL': return `启动成功率 ${this.percent(m)}（阈值 ${this.percent(c)}）`
        default: return ''
      }
    },
    go(path, query) {
      this.$router.push({ path, query: query || {} })
    },
    goAlert(row) {
      const query = { stationId: row.stationId }
      if (row.alertType === 'FAULT_HIGH' || row.alertType === 'START_FAIL') {
        this.go('/device/faultMonitor', query)
      } else {
        this.go('/business/businessStatistics', query)
      }
    },
    money(v) {
      const n = Number(v)
      return isNaN(n) || v == null ? '0.00' : n.toFixed(2)
    },
    // 可空数值：null/非数字 → '--'，否则保留 2 位
    num(v) {
      if (v == null || v === '') return '--'
      const n = Number(v)
      return isNaN(n) ? '--' : n.toFixed(2)
    },
    int(v) {
      return v == null ? 0 : v
    },
    percent(v) {
      const n = Number(v)
      return isNaN(n) || v == null ? '0.0%' : (n * 100).toFixed(1) + '%'
    }
  }
}
</script>

<style lang="scss" scoped>
.operator-workbench-page {
  .wb-block {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 16px 20px;
    margin-bottom: 16px;
    min-height: 96px;
  }
  .wb-block__head {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
  }
  .wb-block__title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-right: 16px;
  }
  .wb-block__asof {
    font-size: 12px;
    color: #909399;
    margin-right: 16px;
  }
  .wb-block__meta {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: 12px;
    color: #909399;
    margin-right: 16px;
    line-height: 1.4;
    max-width: 62%;
  }
  .wb-block__meta-item em {
    font-style: normal;
    color: #c0c4cc;
    margin-right: 4px;
  }
  .wb-block__meta-sep {
    margin: 0 6px;
    color: #dcdfe6;
  }
  .wb-block__btn {
    margin-left: auto;
  }
  .wb-block__link {
    margin-left: auto;
    & + .wb-block__link {
      margin-left: 16px;
    }
  }
  .wb-block__btn + .el-button {
    margin-left: 8px;
  }
  .wb-block__link--inline {
    margin-left: 16px;
  }
  .wb-pagination {
    margin-top: 12px;
    text-align: right;
  }
  .wb-error {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #f56c6c;
    padding: 12px 0;
  }
  .wb-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    &--6 {
      grid-template-columns: repeat(6, 1fr);
    }
    &--3 {
      grid-template-columns: repeat(3, 1fr);
    }
    &--row2 {
      margin-top: 12px;
    }
  }
  .wb-card {
    background: #f7f9fc;
    border-radius: 6px;
    padding: 14px 16px;
  }
  .wb-card__label {
    font-size: 13px;
    color: #909399;
  }
  .wb-card__value {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-top: 6px;
  }
  .wb-card__sub {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    .up { color: #f56c6c; }
    .down { color: #67c23a; }
  }
  .wb-term {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .wb-term__title {
    font-size: 14px;
    font-weight: 600;
    color: #606266;
    margin-bottom: 8px;
  }
  .wb-term__grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  }
  .wb-term__item {
    padding: 10px 12px;
    .wb-card__value { font-size: 20px; }
  }
  .wb-term--fault { color: #f56c6c; }
  .wb-term--offline { color: #909399; }
  .wb-term--occupy { color: #e6a23c; }
  .wb-term--charging { color: #409eff; }
  .wb-term--idle { color: #67c23a; }
  .wb-hint {
    margin-bottom: 12px;
  }
  .wb-cu-help {
    margin: 0 16px 0 -8px;
  }
  .wb-cu {
    display: flex;
    align-items: stretch;
    gap: 12px;
  }
  .wb-cu__cards {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .wb-cu__ring {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #f7f9fc;
    border-radius: 6px;
    padding: 14px 24px;
  }
  .wb-ring {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .wb-ring__inner {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #f7f9fc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
  .wb-yesterday,
  .wb-roi {
    margin-top: 12px;
    font-size: 13px;
    color: #606266;
  }
  .wb-fee {
    margin-top: 16px;
  }
  .wb-fee__title {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }
  .wb-fee__bar {
    display: flex;
    height: 14px;
    border-radius: 7px;
    overflow: hidden;
    background: #ebeef5;
  }
  .wb-fee__seg {
    height: 100%;
    &--elec { background: #409eff; }
    &--service { background: #e6a23c; }
  }
  .wb-fee__legend {
    display: flex;
    gap: 24px;
    margin-top: 8px;
    font-size: 12px;
    color: #606266;
  }
  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    &--elec { background: #409eff; }
    &--service { background: #e6a23c; }
  }
  .wb-col-help {
    margin-left: 4px;
    color: #c0c4cc;
    font-size: 14px;
    cursor: pointer;
    vertical-align: middle;
  }
}

// 抽屉 / 对话框 append-to-body，不在页面根节点内，样式需放在外层
.wb-tip {
  font-size: 12px;
  line-height: 1.5;
  color: #909399;
  margin-top: 4px;
}
.wb-ma-filter {
  margin-bottom: 4px;
}
.wb-ma-range {
  font-size: 12px;
  color: #909399;
}
.wb-ma-error {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f56c6c;
  padding: 12px 0;
}
.wb-ma-note {
  margin: 0 0 8px;
}
.wb-cu-compare {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
  .wb-card { background: #f7f9fc; border-radius: 6px; padding: 14px 16px; }
  .wb-card__label { font-size: 13px; color: #909399; }
  .wb-card__value { font-size: 24px; font-weight: 600; color: #303133; margin-top: 4px; }
  .wb-card__sub { font-size: 12px; color: #909399; margin-top: 4px; }
}
.wb-cu-compare__row {
  display: flex;
  gap: 32px;
  margin-top: 6px;
}
.wb-cu-top-note {
  margin: 0 0 8px;
}
.wb-ma-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 16px 0 8px;
}
.wb-col-help {
  margin-left: 4px;
  color: #c0c4cc;
  font-size: 14px;
  cursor: pointer;
  vertical-align: middle;
}
.wb-dismiss-info {
  margin-bottom: 12px;
  color: #303133;
  font-weight: 600;
}
.wb-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.wb-drawer__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 20px 16px;
}
.wb-drawer__note {
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
  background: #f7f9fc;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 8px;
}
.wb-drawer__footer {
  flex-shrink: 0;
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  text-align: right;
  background: #fff;
}
</style>

<style>
/* append-to-body 抽屉须用非 scoped，否则无法作用到 .el-drawer__body */
.wb-alert-config-drawer.el-drawer .el-drawer__body {
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
.wb-alert-config-drawer.el-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}
</style>
