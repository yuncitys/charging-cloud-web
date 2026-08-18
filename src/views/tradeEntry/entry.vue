<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? '修改商户进件' : '新增商户进件' }}</span>
      </div>
      <el-steps :active="active" finish-status="success" align-center style="margin-bottom: 40px;">
        <el-step title="基础信息 & 商户主体" />
        <el-step title="经营地址 & 法人信息" />
        <el-step title="结算账户" />
      </el-steps>

      <el-form ref="form" :model="form" :rules="rules" label-width="160px" size="medium">
        <!-- Step 1: Basic & Subject Info -->
        <div v-show="active === 0">
          <el-divider content-position="left">基础信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="渠道代码" prop="serviceProviderId">
                <el-select v-model="form.serviceProviderId" placeholder="请选择渠道代码" style="width: 100%" :disabled="isEdit">
                  <el-option label="TZBank (tzbank)" value="tzbank" />
                  <el-option label="微信服务商 (wxpay_partner)" value="wxpay_partner" />
                  <el-option label="默认 (local)" value="local" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="运营商户" prop="merchantId">
                <el-select v-model="form.merchantId" placeholder="请选择运营商户" style="width: 100%" filterable clearable :disabled="isEdit || merchantIdLocked">
                  <el-option v-for="item in merchantList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="管理员姓名" prop="managerName">
                <el-input v-model="form.managerName" placeholder="请输入管理员姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="管理员手机号" prop="managerMobile">
                <el-input v-model="form.managerMobile" placeholder="请输入管理员手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="isWxPartner">
              <el-form-item label="联系邮箱" prop="managerEmail">
                <el-input v-model="form.managerEmail" placeholder="用于接收微信开户邮件及业务通知" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">商户主体信息</el-divider>
          <div class="ocr-upload-container">
            <el-upload
              class="ocr-uploader"
              drag
              action=""
              :show-file-list="false"
              :http-request="(params) => handleUpload(params, '04')"
              accept=".jpg,.jpeg,.png"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将营业执照拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过5MB</div>
            </el-upload>
            <div v-if="!isWxPartner && !isLocal" class="ocr-tip-text">
              <i class="el-icon-info"></i> 上传营业执照可自动识别并填充下方信息
            </div>
            <div v-else class="ocr-tip-text">
              <i class="el-icon-info"></i> {{ isLocal ? '本地渠道仅保存图片，不支持 OCR 自动识别' : '上传营业执照图片（微信通道不支持 OCR 自动识别）' }}
            </div>
            <div v-if="form.corLicenseImg" class="ocr-preview">
              <el-image
                class="ocr-preview-image"
                :src="form.corLicenseImg"
                :preview-src-list="[form.corLicenseImg]"
                fit="contain"
              >
                <div slot="error" class="ocr-preview-error">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              <div class="ocr-preview-label">营业执照预览</div>
            </div>
          </div>
          <el-row>
            <!-- <el-col :span="12">
              <el-form-item label="业务方交易商户编号" prop="busTradeMerNo">
                <el-input v-model="form.busTradeMerNo" placeholder="请输入业务方交易商户编号" />
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item label="商户类型" prop="merType">
                <el-select v-model="form.merType" placeholder="请选择商户类型" style="width: 100%" :disabled="isEdit">
                  <el-option label="交易商户" value="0" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="交易商户类型" prop="tradeMerType">
                <el-select v-model="form.tradeMerType" placeholder="请选择交易商户类型" style="width: 100%" :disabled="isEdit" @change="handleTradeMerTypeChange">
                  <el-option label="个体工商户" value="0" />
                  <el-option label="企业" value="1" />
                  <el-option v-if="!isWxPartner" label="小微商户(自然人)" value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件类型" prop="merCertType">
                <el-select v-model="form.merCertType" placeholder="请选择证件类型" style="width: 100%" :disabled="isEdit">
                  <el-option label="营业执照" value="11" />
                  <el-option label="身份证" value="22" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商户名称" prop="merName">
                <el-input v-model="form.merName" placeholder="请输入商户名称" :disabled="isEdit" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件号码" prop="merCertNo">
                <el-input v-model="form.merCertNo" placeholder="请输入统一社会信用代码/证件号" :disabled="isEdit" />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="营业执照批次号" prop="corLicenseBatchNo">
                <el-input v-model="form.corLicenseBatchNo" placeholder="请输入营业执照批次号" />
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item label="商户简称" prop="shortName">
                <el-input v-model="form.shortName" placeholder="请输入商户简称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件生效日期" prop="corIdEffectDate">
                <el-date-picker v-model="form.corIdEffectDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件到期日期" prop="corIdExaDate">
                <div style="display: flex; gap: 10px; align-items: center;">
                  <el-date-picker v-model="form.corIdExaDate" :disabled="corIdExaDateForever" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="flex: 1;" />
                  <el-checkbox v-model="corIdExaDateForever">永久</el-checkbox>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="注册资金(万元)" prop="corCapital">
                <el-input-number v-model="form.corCapital" :precision="2" :step="0.1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Step 2: Address & Legal Person -->
        <div v-show="active === 1">
          <el-divider content-position="left">经营地址信息</el-divider>
          <el-row>
            <el-col :span="8">
              <el-form-item label="省" prop="merProvinceId">
                <el-select v-model="form.merProvinceId" placeholder="请选择省" @change="handleProvinceChange" style="width: 100%">
                  <el-option
                    v-for="item in provinceList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="市" prop="merRegionId">
                <el-select v-model="form.merRegionId" placeholder="请选择市" @change="handleCityChange" style="width: 100%">
                  <el-option
                    v-for="item in cityList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="区" prop="merCountyId">
                <el-select v-model="form.merCountyId" placeholder="请选择区" style="width: 100%">
                  <el-option
                    v-for="item in areaList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="详细地址" prop="merAddress">
                <el-input v-model="form.merAddress" placeholder="请输入详细地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="!isWxPartner">
              <el-form-item label="经营类目" prop="busKindCode">
                <el-cascader
                  v-model="form.busKindCode"
                  :options="busKindOptions"
                  :props="{ label: 'label', value: 'code', emitPath: false }"
                  placeholder="请选择经营类目"
                  style="width: 100%"
                  filterable
                />
              </el-form-item>
            </el-col>
            <el-col :span="isWxPartner ? 24 : 12">
              <el-form-item label="客户电话" prop="serverPhone">
                <el-input v-model="form.serverPhone" placeholder="请输入客户电话" />
              </el-form-item>
            </el-col>
            <template v-if="isWxPartner">
              <el-col :span="12">
                <el-form-item label="结算规则 ID" prop="tradeEntryWx.settlementId">
                  <el-input v-model="form.tradeEntryWx.settlementId" placeholder="入驻结算规则 ID，见微信费率对照表" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属行业" prop="tradeEntryWx.qualificationType">
                  <el-input v-model="form.tradeEntryWx.qualificationType" placeholder="行业名称，如：停车、生活服务" />
                </el-form-item>
              </el-col>
            </template>
          </el-row>

          <template v-if="isWxPartner">
            <el-divider content-position="left">经营场景</el-divider>
            <el-row>
              <el-col :span="24">
                <el-form-item label="经营场景类型">
                  <div class="scene-type-row">
                    <el-checkbox-group v-model="form.tradeEntryWx.salesScenesTypes" class="scene-type-checkboxes">
                      <el-checkbox v-for="item in wxSalesSceneOptions" :key="item.value" :label="item.value">
                        {{ item.label }}
                      </el-checkbox>
                    </el-checkbox-group>
                    <span class="scene-type-tip"><i class="el-icon-info" /> 至少选择一项；充电站建议勾选「线下场所」+「小程序」</span>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <template v-if="hasWxScene('SALES_SCENES_STORE')">
              <el-divider content-position="left">线下场所</el-divider>
              <el-row :gutter="20">
                <el-col v-for="item in wxSceneAttachments('SALES_SCENES_STORE')" :key="item.type" :span="12">
                  <el-form-item :label="item.label">
                    <div class="scene-upload-inline">
                      <div v-for="(url, idx) in scenePics(item.type)" :key="item.type + '-' + idx" class="scene-thumb">
                        <el-image :src="url" :preview-src-list="scenePics(item.type)" fit="cover" />
                      </div>
                      <el-upload
                        class="scene-uploader"
                        action=""
                        :show-file-list="false"
                        :http-request="(p) => handleUpload(p, item.type)"
                        accept=".jpg,.jpeg,.png"
                      >
                        <div class="scene-upload-btn">
                          <i :class="scenePics(item.type).length ? 'el-icon-refresh' : 'el-icon-plus'" />
                          <span>{{ scenePics(item.type).length ? '更换' : '上传' }}</span>
                        </div>
                      </el-upload>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>

            <template v-if="hasWxScene('SALES_SCENES_MINI_PROGRAM')">
              <el-divider content-position="left">小程序场景</el-divider>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="服务商小程序 AppId">
                    <el-input v-model="form.tradeEntryWx.miniProgramAppid" placeholder="可留空，默认取支付渠道配置" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="商家小程序 AppId">
                    <el-input v-model="form.tradeEntryWx.miniProgramSubAppid" placeholder="与服务商 AppId 二选一或同时填写" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="小程序截图">
                    <div class="scene-upload-inline">
                      <div v-for="(url, idx) in scenePics('07')" :key="'07-' + idx" class="scene-thumb">
                        <el-image :src="url" :preview-src-list="scenePics('07')" fit="cover" />
                      </div>
                      <el-upload
                        class="scene-uploader"
                        action=""
                        :show-file-list="false"
                        :http-request="(p) => handleUpload(p, '07', true)"
                        accept=".jpg,.jpeg,.png"
                      >
                        <div class="scene-upload-btn">
                          <i class="el-icon-plus" />
                          <span>添加</span>
                        </div>
                      </el-upload>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>

            <template v-if="hasWxScene('SALES_SCENES_MP')">
              <el-divider content-position="left">公众号场景</el-divider>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="服务商公众号 AppId">
                    <el-input v-model="form.tradeEntryWx.mpAppid" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="商家公众号 AppId">
                    <el-input v-model="form.tradeEntryWx.mpSubAppid" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="公众号截图">
                    <div class="scene-upload-inline">
                      <div v-for="(url, idx) in scenePics('08')" :key="'08-' + idx" class="scene-thumb">
                        <el-image :src="url" :preview-src-list="scenePics('08')" fit="cover" />
                      </div>
                      <el-upload
                        class="scene-uploader"
                        action=""
                        :show-file-list="false"
                        :http-request="(p) => handleUpload(p, '08', true)"
                        accept=".jpg,.jpeg,.png"
                      >
                        <div class="scene-upload-btn">
                          <i class="el-icon-plus" />
                          <span>添加</span>
                        </div>
                      </el-upload>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>

            <template v-if="hasWxScene('SALES_SCENES_WEB')">
              <el-divider content-position="left">网站场景</el-divider>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="网站域名">
                    <el-input v-model="form.tradeEntryWx.webDomain" placeholder="https://example.com" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="网站 AppId">
                    <el-input v-model="form.tradeEntryWx.webAppid" placeholder="可选" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="网站授权函">
                    <div class="scene-upload-inline">
                      <div v-for="(url, idx) in scenePics('11')" :key="'11-' + idx" class="scene-thumb">
                        <el-image :src="url" :preview-src-list="scenePics('11')" fit="cover" />
                      </div>
                      <el-upload
                        class="scene-uploader"
                        action=""
                        :show-file-list="false"
                        :http-request="(p) => handleUpload(p, '11')"
                        accept=".jpg,.jpeg,.png"
                      >
                        <div class="scene-upload-btn">
                          <i :class="scenePics('11').length ? 'el-icon-refresh' : 'el-icon-plus'" />
                          <span>{{ scenePics('11').length ? '更换' : '上传' }}</span>
                        </div>
                      </el-upload>
                    </div>
                    <div class="ocr-tip-text">备案主体不一致时需上传</div>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>

            <template v-if="hasWxScene('SALES_SCENES_APP')">
              <el-divider content-position="left">App 场景</el-divider>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="服务商 AppId">
                    <el-input v-model="form.tradeEntryWx.appAppid" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="商家 AppId">
                    <el-input v-model="form.tradeEntryWx.appSubAppid" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="App 截图">
                    <div class="scene-upload-inline">
                      <div v-for="(url, idx) in scenePics('09')" :key="'09-' + idx" class="scene-thumb">
                        <el-image :src="url" :preview-src-list="scenePics('09')" fit="cover" />
                      </div>
                      <el-upload
                        class="scene-uploader"
                        action=""
                        :show-file-list="false"
                        :http-request="(p) => handleUpload(p, '09', true)"
                        accept=".jpg,.jpeg,.png"
                      >
                        <div class="scene-upload-btn">
                          <i class="el-icon-plus" />
                          <span>添加</span>
                        </div>
                      </el-upload>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>

            <template v-if="hasWxScene('SALES_SCENES_WEWORK')">
              <el-divider content-position="left">企业微信场景</el-divider>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="企业微信 CorpID">
                    <el-input v-model="form.tradeEntryWx.weworkSubCorpId" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="企业微信截图">
                    <div class="scene-upload-inline">
                      <div v-for="(url, idx) in scenePics('10')" :key="'10-' + idx" class="scene-thumb">
                        <el-image :src="url" :preview-src-list="scenePics('10')" fit="cover" />
                      </div>
                      <el-upload
                        class="scene-uploader"
                        action=""
                        :show-file-list="false"
                        :http-request="(p) => handleUpload(p, '10', true)"
                        accept=".jpg,.jpeg,.png"
                      >
                        <div class="scene-upload-btn">
                          <i class="el-icon-plus" />
                          <span>添加</span>
                        </div>
                      </el-upload>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
          </template>

          <el-divider content-position="left">法人/经营者信息</el-divider>
          <div class="ocr-upload-container">
            <el-row :gutter="40">
              <el-col :span="12">
                <el-upload
                  class="ocr-uploader"
                  drag
                  action=""
                  :show-file-list="false"
                  :http-request="(params) => handleUpload(params, '01')"
                  accept=".jpg,.jpeg,.png"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">将身份证<strong style="color: #409EFF">正面</strong>拖到此处，或<em>点击上传</em></div>
                </el-upload>
                <div v-if="!isWxPartner" class="ocr-tip-text">
                  <i class="el-icon-info"></i> 识别身份证正面
                </div>
                <div v-else class="ocr-tip-text">
                  <i class="el-icon-info"></i> 上传身份证正面
                </div>
                <div v-if="form.corLegIdFaceImg" class="ocr-preview">
                  <el-image
                    class="ocr-preview-image"
                    :src="form.corLegIdFaceImg"
                    :preview-src-list="[form.corLegIdFaceImg]"
                    fit="contain"
                  >
                    <div slot="error" class="ocr-preview-error">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </el-image>
                  <div class="ocr-preview-label">正面预览</div>
                </div>
              </el-col>
              <el-col :span="12">
                <el-upload
                  class="ocr-uploader"
                  drag
                  action=""
                  :show-file-list="false"
                  :http-request="(params) => handleUpload(params, '02')"
                  accept=".jpg,.jpeg,.png"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">将身份证<strong style="color: #409EFF">反面</strong>拖到此处，或<em>点击上传</em></div>
                </el-upload>
                <div v-if="!isWxPartner" class="ocr-tip-text">
                  <i class="el-icon-info"></i> 识别身份证反面
                </div>
                <div v-else class="ocr-tip-text">
                  <i class="el-icon-info"></i> 上传身份证反面
                </div>
                <div v-if="form.corLegIdBackImg" class="ocr-preview">
                  <el-image
                    class="ocr-preview-image"
                    :src="form.corLegIdBackImg"
                    :preview-src-list="[form.corLegIdBackImg]"
                    fit="contain"
                  >
                    <div slot="error" class="ocr-preview-error">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </el-image>
                  <div class="ocr-preview-label">反面预览</div>
                </div>
              </el-col>
            </el-row>
          </div>
          <el-row>
            <el-col :span="24">
              <el-form-item label="法人姓名" prop="corLegName">
                <el-input v-model="form.corLegName" placeholder="请输入法人代表或个人经营者名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件类型" prop="corLegIdType">
                <el-select v-model="form.corLegIdType" placeholder="请选择证件类型" style="width: 100%">
                  <el-option label="身份证" value="11" />
                  <el-option label="军人或武警证件号" value="12" />
                  <el-option label="港澳台通行证" value="13" />
                  <el-option label="护照" value="14" />
                  <el-option label="户口本" value="15" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件号码" prop="corLegIdNo">
                <el-input v-model="form.corLegIdNo" placeholder="请输入证件号码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件生效日期" prop="corLegIdEffectDate">
                <el-date-picker v-model="form.corLegIdEffectDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件到期日期" prop="corLegIdExaDate">
                <div style="display: flex; gap: 10px; align-items: center;">
                  <el-date-picker v-model="form.corLegIdExaDate" :disabled="corLegIdExaDateForever" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="flex: 1;" />
                  <el-checkbox v-model="corLegIdExaDateForever">永久</el-checkbox>
                </div>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="证件正面照批次号" prop="corLegIdFaceImgBatchNo">
                <el-input v-model="form.corLegIdFaceImgBatchNo" placeholder="请输入批次号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件背面照批次号" prop="corLegIdBackImgBatchNo">
                <el-input v-model="form.corLegIdBackImgBatchNo" placeholder="请输入批次号" />
              </el-form-item>
            </el-col> -->
            <el-col :span="8">
              <el-form-item label="省" prop="corLegProvince">
                <el-select v-model="form.corLegProvince" placeholder="请选择省" @change="handleLegProvinceChange" style="width: 100%">
                  <el-option
                    v-for="item in provinceList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="市" prop="corLegCity">
                <el-select v-model="form.corLegCity" placeholder="请选择市" @change="handleLegCityChange" style="width: 100%">
                  <el-option
                    v-for="item in legCityList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="区" prop="corLegCountyId">
                <el-select v-model="form.corLegCountyId" placeholder="请选择区" style="width: 100%">
                  <el-option
                    v-for="item in legAreaList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="详细地址" prop="corLegAddress">
                <el-input v-model="form.corLegAddress" placeholder="请输入法人详细地址" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Step 3: Settlement & Attachments -->
        <div v-show="active === 2">
          <el-divider content-position="left">结算账户信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="结算账户类型" prop="settBankAccType">
                <el-select v-model="form.settBankAccType" placeholder="请选择" style="width: 100%">
                  <el-option label="借记账户" value="0010" />
                  <el-option label="对公账户" value="0030" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="账户名称" prop="settBankAccName">
                <el-input v-model="form.settBankAccName" placeholder="需与证件名称一致" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0030'">
              <el-form-item label="开户行名称" prop="settBankBranchName">
                <el-select
                  v-model="form.settBankBranchName"
                  placeholder="请输入开户行名称"
                  filterable
                  clearable
                  @change="handleBankChange"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in bankList"
                    :key="item.bank_code"
                    :label="item.bank_name"
                    :value="item.bank_name"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0030'">
              <el-form-item label="开户行行号" prop="settBankBranchId">
                <el-input v-model="form.settBankBranchId" placeholder="12位联行号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行账号" prop="settBankAccNo">
                <el-input v-model="form.settBankAccNo" placeholder="结算银行卡号" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0010' && !isWxPartner">
              <el-form-item label="持卡人身份证号" prop="identityNo">
                <el-input v-model="form.identityNo" placeholder="结算卡持卡人身份证" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0010' && !isWxPartner">
              <el-form-item label="银行预留手机号" prop="mobileNo">
                <el-input v-model="form.mobileNo" placeholder="用于短信验证" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div style="margin-top: 40px; text-align: center;">
          <el-button @click="cancel">取消</el-button>
          <el-button v-if="active > 0" @click="prev">上一步</el-button>
          <el-button v-if="active < 2" type="primary" @click="next">下一步</el-button>
          <el-button v-if="active === 2" type="primary" :loading="loading" @click="save">保存</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { addTradeEntry, updateTradeEntry, getTradeEntryDetail, imgInfoDiscern } from '@/api/pay/tradeEntry'
import { getAreaSelector } from '@/api/area/index'
import { getMerchant } from '@/api/merchant/merchant'
import { upload } from '@/api/upload/file'
import dictData from '@/utils/dictData'
import { WX_SALES_SCENE_OPTIONS, WX_SCENE_ATTACHMENT, defaultWxTradeEntryWx, flattenTradeEntryWx } from '@/utils/wxSalesScene'

export default {
  name: 'TradeEntryForm',
  data() {
    return {
      active: 0,
      loading: false,
      isEdit: false,
      merchantIdLocked: false,
      provinceList: [],
      cityList: [],
      areaList: [],
      legCityList: [],
      legAreaList: [],
      busKindOptions: [],
      bankList: [],
      merchantList: [],
      wxSalesSceneOptions: WX_SALES_SCENE_OPTIONS,
      corIdExaDateForever: false,
      corLegIdExaDateForever: false,
      form: {
        id: undefined,
        // Basic
        tenantId: '',
        merchantId: '',
        serviceProviderId: 'tzbank',
        apiVersion: '',
        managerName: '',
        managerMobile: '',
        managerEmail: '',
        // Subject
        busTradeMerNo: '',
        merType: '0',
        tradeMerType: '',
        merCertType: '',
        merName: '',
        merCertNo: '',
        corLicenseBatchNo: '',
        corLicenseImg: '',
        storeEntranceImg: '',
        storeInteriorImg: '',
        shortName: '',
        corCapital: 0,
        corIdEffectDate: '',
        corIdExaDate: '',
        // Address
        merProvinceId: '',
        merRegionId: '',
        merCountyId: '',
        merAddress: '',
        busKindCode: '',
        serverPhone: '',
        // Legal Person
        corLegName: '',
        corLegIdType: '',
        corLegIdNo: '',
        corLegIdFaceImgBatchNo: '',
        corLegIdFaceImg: '',
        corLegIdBackImgBatchNo: '',
        corLegIdBackImg: '',
        corLegIdEffectDate: '',
        corLegIdExaDate: '',
        corLegProvince: '',
        corLegCity: '',
        corLegCountyId: '',
        corLegAddress: '',
        // Settlement
        settBankAccType: '',
        settBankAccName: '',
        settBankBranchId: '',
        settBankBranchName: '',
        settBankAccNo: '',
        identityNo: '',
        mobileNo: '',
        // Attachments
        attchList: [],
        tradeEntryWx: defaultWxTradeEntryWx()
      },
      rules: {
        tenantId: [{ required: true, message: '请输入租户标识', trigger: 'blur' }],
        merchantId: [{ required: true, message: '请选择运营商户', trigger: 'change' }],
        serviceProviderId: [{ required: true, message: '请输入渠道代码', trigger: 'blur' }],
        busTradeMerNo: [{ required: true, message: '请输入业务方交易商户编号', trigger: 'blur' }],
        merType: [{ required: true, message: '请选择商户类型', trigger: 'change' }],
        tradeMerType: [{ required: true, message: '请选择交易商户类型', trigger: 'change' }],
        merName: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
        merCertNo: [{ required: true, message: '请输入证件号码', trigger: 'blur' }],
        managerMobile: [{ required: true, message: '请输入管理员手机号', trigger: 'blur' }],
        settBankAccType: [{ required: true, message: '请选择结算账户类型', trigger: 'change' }],
        settBankAccName: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
        settBankAccNo: [{ required: true, message: '请输入银行账号', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isWxPartner() {
      return this.form.serviceProviderId === 'wxpay_partner'
    },
    isLocal() {
      return this.form.serviceProviderId === 'local'
    }
  },
  watch: {
    'form.serviceProviderId'(val) {
      if (val === 'wxpay_partner' && this.form.tradeMerType === '2') {
        this.form.tradeMerType = ''
      }
      if (val === 'wxpay_partner') {
        const wx = this.form.tradeEntryWx || {}
        if (!wx.salesScenesTypes || !wx.salesScenesTypes.length) {
          this.form.tradeEntryWx = { ...defaultWxTradeEntryWx(), ...wx }
        }
      }
      this.applyChannelRules()
    },
    'form.settBankAccType'(val) {
      if (val === '0030') {
        this.rules.settBankBranchName = [{ required: true, message: '请选择开户行名称', trigger: 'change' }]
        this.rules.settBankBranchId = [{ required: true, message: '请输入开户行行号', trigger: 'blur' }]
        this.$delete(this.rules, 'identityNo')
        this.$delete(this.rules, 'mobileNo')
        this.form.identityNo = ''
        this.form.mobileNo = ''
      } else if (val === '0010') {
        if (!this.isWxPartner) {
          this.rules.identityNo = [{ required: true, message: '请输入持卡人身份证号', trigger: 'blur' }]
          this.rules.mobileNo = [{ required: true, message: '请输入银行预留手机号', trigger: 'blur' }]
        } else {
          this.$delete(this.rules, 'identityNo')
          this.$delete(this.rules, 'mobileNo')
        }
        this.$delete(this.rules, 'settBankBranchName')
        this.$delete(this.rules, 'settBankBranchId')
      } else {
        this.$delete(this.rules, 'settBankBranchName')
        this.$delete(this.rules, 'settBankBranchId')
        this.$delete(this.rules, 'identityNo')
        this.$delete(this.rules, 'mobileNo')
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    corIdExaDateForever(val) {
      if (val) {
        this.form.corIdExaDate = '9999-12-31'
      } else if (String(this.form.corIdExaDate || '') === '9999-12-31') {
        this.form.corIdExaDate = ''
      }
    },
    corLegIdExaDateForever(val) {
      if (val) {
        this.form.corLegIdExaDate = '9999-12-31'
      } else if (String(this.form.corLegIdExaDate || '') === '9999-12-31') {
        this.form.corLegIdExaDate = ''
      }
    },
    'form.corIdExaDate'(val) {
      this.corIdExaDateForever = String(val || '') === '9999-12-31'
    },
    'form.corLegIdExaDate'(val) {
      this.corLegIdExaDateForever = String(val || '') === '9999-12-31'
    }
  },
  created() {
    this.busKindOptions = dictData.getBusKindData()
    this.bankList = dictData.getBankNo()
    this.getProvinceList()
    this.getMerchantList()
    const merchantId = this.$route.query && this.$route.query.merchantId
    if (merchantId !== null && merchantId !== undefined && merchantId !== '') {
      this.form.merchantId = merchantId
      this.merchantIdLocked = true
    }
    if (this.$route.query && this.$route.query.prefill === '1') {
      try {
        const cached = sessionStorage.getItem('tradeEntryPrefill')
        if (cached) {
          const data = JSON.parse(cached)
          if (data && typeof data === 'object') {
            delete data.id
            Object.assign(this.form, data)
            if (data.tradeEntryWx) {
              this.form.tradeEntryWx = flattenTradeEntryWx(data.tradeEntryWx)
            }
            if (Array.isArray(this.form.attchList)) {
              this.mapAttachmentsFromAttchList(this.form.attchList)
            }
            this.loadAreaOptionsForCurrentForm()
          }
        }
      } catch (e) {
        // ignore
      }
      sessionStorage.removeItem('tradeEntryPrefill')
    }
    const id = this.$route.params.id
    if (id) {
      this.isEdit = true
      this.form.id = id
      this.fetchData(id)
    }
    this.applyChannelRules()
  },
  methods: {
    applyChannelRules() {
      const val = this.form.serviceProviderId
      if (val === 'wxpay_partner') {
        this.rules.managerEmail = [
          { required: true, message: '请输入联系邮箱', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ]
      } else {
        this.$delete(this.rules, 'managerEmail')
      }
    },
    normalizeWxExt(wxExt) {
      return flattenTradeEntryWx(wxExt)
    },
    hasWxScene(scene) {
      const scenes = (this.form.tradeEntryWx && this.form.tradeEntryWx.salesScenesTypes) || []
      return scenes.includes(scene)
    },
    wxSceneAttachments(scene) {
      return WX_SCENE_ATTACHMENT[scene] || []
    },
    scenePics(type) {
      const ft = parseInt(type, 10)
      if (ft === 5 && this.form.storeEntranceImg) return [this.form.storeEntranceImg]
      if (ft === 6 && this.form.storeInteriorImg) return [this.form.storeInteriorImg]
      return (this.form.attchList || [])
        .filter(a => a && Number(a.fileType) === ft && a.fileUrl)
        .map(a => a.fileUrl)
    },
    validateWxScenes() {
      const wx = this.form.tradeEntryWx || {}
      const scenes = wx.salesScenesTypes || []
      if (!scenes.length) {
        return '请至少选择一项经营场景'
      }
      const uploaded = (this.form.attchList || []).map(a => Number(a.fileType))
      const hasType = t => uploaded.includes(parseInt(t, 10))
      for (const scene of scenes) {
        if (scene === 'SALES_SCENES_STORE') {
          if (!this.form.shortName) return '线下场所：商户简称不能为空'
          if (!this.form.merCountyId || !this.form.merAddress) return '线下场所：经营地址区编码和详细地址不能为空'
          if (!hasType('05')) return '线下场所：请上传门头照'
          if (!hasType('06')) return '线下场所：请上传店内环境照'
        } else if (scene === 'SALES_SCENES_MINI_PROGRAM') {
          // 服务商 AppId 可由支付渠道配置补全，前端不强制填写
        } else if (scene === 'SALES_SCENES_MP') {
          if (!wx.mpAppid && !wx.mpSubAppid) return '公众号场景：服务商或商家公众号 AppId 至少填一项'
          if (!hasType('08')) return '公众号场景：请上传公众号页面截图'
        } else if (scene === 'SALES_SCENES_WEB') {
          if (!wx.webDomain) return '网站场景：请填写互联网网站域名'
        } else if (scene === 'SALES_SCENES_APP') {
          if (!wx.appAppid && !wx.appSubAppid) return 'App 场景：服务商或商家 AppId 至少填一项'
          if (!hasType('09')) return 'App 场景：请上传 App 截图'
        } else if (scene === 'SALES_SCENES_WEWORK') {
          if (!wx.weworkSubCorpId) return '企业微信场景：请填写商家企业微信 CorpID'
          if (!hasType('10')) return '企业微信场景：请上传企业微信页面截图'
        }
      }
      return null
    },
    getMerchantList() {
      getMerchant().then(res => {
        if (res && res.code == 200) {
          this.merchantList = res.data || []
        } else {
          this.merchantList = []
        }
      }).catch(() => {
        this.merchantList = []
      })
    },
    normalizeAreaList(res) {
      const data = res && res.data
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.list)) return data.list
      if (Array.isArray(res)) return res
      return []
    },
    mapAttachmentsFromAttchList(attchList) {
      if (!Array.isArray(attchList)) return
      attchList.forEach(a => {
        const url = a && a.fileUrl
        const ft = (a && a.fileType != null ? String(a.fileType) : '').padStart(2, '0')
        if (!url) return
        if (ft === '04') {
          this.$set(this.form, 'corLicenseImg', url)
          if (a.fileBatchId) this.form.corLicenseBatchNo = a.fileBatchId
        } else if (ft === '01') {
          this.$set(this.form, 'corLegIdFaceImg', url)
          if (a.fileBatchId) this.form.corLegIdFaceImgBatchNo = a.fileBatchId
        } else if (ft === '02') {
          this.$set(this.form, 'corLegIdBackImg', url)
          if (a.fileBatchId) this.form.corLegIdBackImgBatchNo = a.fileBatchId
        } else if (ft === '05') {
          this.$set(this.form, 'storeEntranceImg', url)
        } else if (ft === '06') {
          this.$set(this.form, 'storeInteriorImg', url)
        }
      })
    },
    getProvinceList() {
      getAreaSelector('-1').then(res => {
        this.provinceList = this.normalizeAreaList(res)
      })
    },
    handleProvinceChange(val) {
      this.form.merRegionId = ''
      this.form.merCountyId = ''
      this.cityList = []
      this.areaList = []
      getAreaSelector(val).then(res => {
        this.cityList = this.normalizeAreaList(res)
      })
    },
    handleCityChange(val) {
      this.form.merCountyId = ''
      this.areaList = []
      getAreaSelector(val).then(res => {
        this.areaList = this.normalizeAreaList(res)
      })
    },
    handleLegProvinceChange(val) {
      this.form.corLegCity = ''
      this.form.corLegCountyId = ''
      this.legCityList = []
      this.legAreaList = []
      getAreaSelector(val).then(res => {
        this.legCityList = this.normalizeAreaList(res)
      })
    },
    handleLegCityChange(val) {
      this.form.corLegCountyId = ''
      this.legAreaList = []
      getAreaSelector(val).then(res => {
        this.legAreaList = this.normalizeAreaList(res)
      })
    },
    loadAreaOptionsForCurrentForm() {
      if (this.form.merProvinceId) {
        getAreaSelector(this.form.merProvinceId).then(res => {
          this.cityList = this.normalizeAreaList(res)
        })
      }
      if (this.form.merRegionId) {
        getAreaSelector(this.form.merRegionId).then(res => {
          this.areaList = this.normalizeAreaList(res)
        })
      }
      if (this.form.corLegProvince) {
        getAreaSelector(this.form.corLegProvince).then(res => {
          this.legCityList = this.normalizeAreaList(res)
        })
      }
      if (this.form.corLegCity) {
        getAreaSelector(this.form.corLegCity).then(res => {
          this.legAreaList = this.normalizeAreaList(res)
        })
      }
    },
    handleBankChange(val) {
      if (!val) {
        this.form.settBankBranchId = ''
        return
      }
      const bank = this.bankList.find(item => item.bank_name === val)
      if (bank) {
        this.form.settBankBranchId = bank.bank_code
      }
    },
    handleUpload(params, type, multiple = false) {
      const file = params.file
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isLt5M) {
        this.$message.error('上传文件大小不能超过 5MB!')
        return
      }

      const loading = this.$loading({
        lock: true,
        text: this.isWxPartner ? '正在上传...' : '正在上传并识别中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      upload('WebAnnexFile', uploadFormData).then(uploadRes => {
        const fileUrl = uploadRes.data.url || uploadRes.data
        if (!fileUrl) {
          throw new Error('文件上传失败，未获取到URL')
        }

        if (this.isWxPartner || this.isLocal) {
          loading.close()
          this.$message.success('上传成功')
          this.fillAttachment(type, fileUrl, null, file.name, multiple)
          return
        }

        const ocrFormData = new FormData()
        ocrFormData.append('file', file)
        ocrFormData.append('imageType', type)
        ocrFormData.append('serviceProviderId', this.form.serviceProviderId)
        ocrFormData.append('apiVersion', this.form.apiVersion || 'v1.0')

        return imgInfoDiscern(ocrFormData).then(ocrRes => {
          return { ocrData: ocrRes.data || ocrRes, fileUrl }
        })
      }).then(result => {
        if (!result) return
        const { ocrData, fileUrl } = result
        loading.close()
        if (ocrData) {
          this.$message.success('识别成功')
          this.fillFormData(ocrData, type)
          this.fillAttachment(type, fileUrl, ocrData, file.name, false)
        } else {
          this.$message.warning('未能识别到有效信息')
        }
      }).catch(err => {
        loading.close()
        console.error('操作失败', err)
        this.$message.error('操作失败，请检查网络或稍后重试')
      })
    },
    fillAttachment(type, fileUrl, ocrData, fileName, multiple = false) {
      const attach = {
        fileName: fileName,
        fileType: parseInt(type, 10),
        busTradeMerNo: this.form.busTradeMerNo,
        fileUrl: fileUrl
      }
      if (ocrData && ocrData.fileBatchId) {
        attach.fileBatchId = ocrData.fileBatchId
      }
      if (!multiple) {
        this.form.attchList = this.form.attchList.filter(item => Number(item.fileType) !== parseInt(type, 10))
      }
      this.$set(this.form, 'attchList', [...this.form.attchList, attach])

      if (type === '04') this.form.corLicenseImg = fileUrl
      if (type === '01') this.form.corLegIdFaceImg = fileUrl
      if (type === '02') this.form.corLegIdBackImg = fileUrl
      if (type === '05') this.form.storeEntranceImg = fileUrl
      if (type === '06') this.form.storeInteriorImg = fileUrl
    },
    fillFormData(data, type) {
      // 04: 营业执照
      if (type === '04') {
        if (data.fileBatchId) this.form.corLicenseBatchNo = data.fileBatchId
        if (data.bsnCreditCode) this.form.merCertNo = data.bsnCreditCode
        if (data.corporationName) this.form.merName = data.corporationName
        if (data.legalClientName) this.form.corLegName = data.legalClientName
        if (data.employerAdd) this.form.merAddress = data.employerAdd
        if (data.licenceDateEnd) {
          // 尝试格式化日期，假设返回格式可能多样，这里做简单处理或者直接赋值如果格式匹配
          // 假设返回 yyyy年MM月dd日 或 yyyy-MM-dd
          let dateStr = data.licenceDateEnd.replace(/年|月/g, '-').replace(/日/g, '')
          // 如果是 "长期"，可能需要特殊处理，这里暂且保留原值或者设为特定值
          if (dateStr.includes('长期')) {
             // Handle long term if needed, maybe leave empty or set a far future date
             // this.form.corIdExaDate = '9999-12-31'
          } else {
             this.form.corIdExaDate = dateStr
          }
        }
        if (data.regCapitalS) {
          // 提取数字，单位默认为万元
          const num = parseFloat(data.regCapitalS)
          if (!isNaN(num)) {
            this.form.corCapital = num
          }
        }
      }
      // 01: 身份证正面
      else if (type === '01') {
        if (data.fileBatchId) this.form.corLegIdFaceImgBatchNo = data.fileBatchId
        if (data.clientName) this.form.corLegName = data.clientName
        if (data.globalId) this.form.corLegIdNo = data.globalId
        if (data.address) this.form.corLegAddress = data.address
        // 身份证正面通常不包含有效期，只有出生日期 birthDate
      }
      // 02: 身份证反面
      else if (type === '02') {
        if (data.fileBatchId) this.form.corLegIdBackImgBatchNo = data.fileBatchId
        if (data.exDate) {
          // 身份证有效期通常是 "yyyy.MM.dd-yyyy.MM.dd" 或 "yyyy.MM.dd-长期"
          // 这里假设返回的是结束日期
          let dateStr = data.exDate.replace(/\./g, '-')
          if (dateStr.includes('长期')) {
             // Handle long term
          } else {
             // 如果是范围，取后半部分
             if (dateStr.includes('-')) {
               const parts = dateStr.split('-')
               if (parts.length > 1) {
                 dateStr = parts[1]
               }
             }
             this.form.corLegIdExaDate = dateStr
             // 同时也可以尝试提取开始日期赋值给 corLegIdEffectDate
             if (data.exDate.includes('-')) {
                const parts = data.exDate.split('-')
                if (parts.length > 0) {
                   this.form.corLegIdEffectDate = parts[0].replace(/\./g, '-')
                }
             }
          }
        }
      }
    },
    fetchData(id) {
      getTradeEntryDetail(id).then(response => {
        const detail = (response && response.data) || response || {}
        const tradeEntry = detail.tradeEntry || detail
        const attchList = detail.attchList || []
        const { tradeEntryWx, ...tradeEntryFields } = tradeEntry
        Object.assign(this.form, tradeEntryFields)
        const wxExt = detail.tradeEntryWx || tradeEntryWx
        if (wxExt) {
          this.form.tradeEntryWx = flattenTradeEntryWx(wxExt)
        }
        this.applyChannelRules()
        this.$set(this.form, 'attchList', Array.isArray(attchList) ? attchList : [])
        this.corIdExaDateForever = String(this.form.corIdExaDate || '') === '9999-12-31'
        this.corLegIdExaDateForever = String(this.form.corLegIdExaDate || '') === '9999-12-31'
        this.mapAttachmentsFromAttchList(this.form.attchList)
        this.loadAreaOptionsForCurrentForm()
      }).catch(err => {
        console.error(err)
      })
    },
    handleTradeMerTypeChange(val) {
      if (val === '2') {
        this.form.merCertType = '22'
      } else {
        this.form.merCertType = '11'
      }
    },
    next() {
      if (this.active++ > 2) this.active = 0
    },
    prev() {
      if (this.active-- < 0) this.active = 0
    },
    cancel() {
      this.$confirm('确认取消操作？表单内容将清空。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.form.resetFields()
        this.$router.push('/tradeEntry/list')
      }).catch(() => {})
    },
    save() {
      if (this.isWxPartner) {
        if (!this.form.managerEmail) {
          this.$message.error('请输入联系邮箱')
          return
        }
        if (!this.form.tradeEntryWx.settlementId) {
          this.$message.error('请输入结算规则 ID')
          return
        }
        if (!this.form.tradeEntryWx.qualificationType) {
          this.$message.error('请输入所属行业')
          return
        }
        const requiredTypes = ["4", "1", "2"]
        const uploaded = (this.form.attchList || []).map(a => a.fileType)
        const missing = requiredTypes.filter(t => !uploaded.includes(t))
        if (missing.length) {
          const labels = { "4": '营业执照', "1": '身份证正面', "2": '身份证反面' }
          this.$message.error('请上传：' + missing.map(t => labels[t]).join('、'))
          return
        }
        const sceneError = this.validateWxScenes()
        if (sceneError) {
          this.$message.error(sceneError)
          return
        }
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          const isUpdate = !!this.form.id || this.isEdit
          const request = isUpdate ? updateTradeEntry : addTradeEntry
          const payload = { ...this.form }
          if (!this.isWxPartner) {
            delete payload.tradeEntryWx
          }
          request(payload).then(res => {
            this.loading = false
            if (res && res.code === 200) {
              const data = (res && res.data) || {}
              const merNoFromResp =
                (data && typeof data === 'string' ? data : '') ||
                (data && data.busTradeMerNo) ||
                (data && data.tradeEntry && data.tradeEntry.busTradeMerNo) || ''
              if (merNoFromResp) this.$set(this.form, 'busTradeMerNo', merNoFromResp)
              this.$message({
                message: '保存成功，请等待平台审核通过后再提交进件',
                type: 'success',
                duration: 5000
              })
              this.$router.push('/tradeEntry/list')
            } else {
              this.$message.error((res && res.msg) || '保存失败')
            }
          }).catch(() => {
            this.loading = false
            this.$message.error('请求失败')
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.ocr-upload-container {
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.ocr-uploader >>> .el-upload-dragger {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.ocr-uploader >>> .el-upload {
  width: 100%;
  display: block;
}

.ocr-tip-text {
  margin-top: 10px;
  color: #909399;
  font-size: 13px;
}

.ocr-preview {
  margin-top: 12px;
}

.scene-type-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
}

.scene-type-checkboxes {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
}

.scene-type-tip {
  color: #909399;
  font-size: 13px;
  line-height: 1.4;
  white-space: nowrap;
}

.scene-upload-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.scene-thumb {
  width: 72px;
  height: 72px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: #fafafa;
}

.scene-thumb >>> .el-image {
  width: 72px;
  height: 72px;
  display: block;
}

.scene-uploader >>> .el-upload {
  width: auto;
  display: inline-block;
  line-height: normal;
}

.scene-upload-btn {
  width: 72px;
  height: 72px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  background: #fafafa;
  transition: border-color 0.2s, color 0.2s;
  box-sizing: border-box;
}

.scene-upload-btn:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.scene-upload-btn i {
  font-size: 18px;
  margin-bottom: 2px;
}

.ocr-preview-image {
  width: 200px;
  height: 120px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

.ocr-preview-label {
  margin-top: 6px;
  color: #606266;
  font-size: 12px;
}

.ocr-preview-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #c0c4cc;
  background: #f5f7fa;
}
</style>
