<template>
	<div class="app-container">
    <div class="filter-container">
      <el-card class="box-card">
        <el-steps :active="active">
          <el-step title="填写资料" icon="el-icon-edit"></el-step>
          <el-step title="资料审核" icon="el-icon-loading"></el-step>
          <el-step title="证件上传" icon="el-icon-upload"></el-step>
          <el-step title="确认绑卡(私卡) / 小额打款确认(公卡)" icon="el-icon-s-check"></el-step>
          <el-step title="完成" icon="el-icon-success"></el-step>
        </el-steps>
        <el-button style="margin-top: 12px;" @click="next">下一步</el-button>
      </el-card>

      <div v-if="active==0">
        <el-form ref="form" :model="form" label-width="auto" style="margin-top: 40px">
          <div style="text-align: center;margin-top: 40px;"><h3 style="margin-bottom: auto;">基础信息</h3></div>
          <!-- <el-divider content-position="left"><span id="form-title">基础信息</span></el-divider> -->
          <div id="form-border">
            <el-row>
              <el-col :span="8">
                <el-form-item label="开户类型：" >
                  <span>个体开户</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="小程序：" >
                  <span>云创快充</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="appid：" >
                  <span>wx13a4855b6ab80639</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="申请邮箱：" >
                  <el-input placeholder="请填写真实邮箱，用于接收注册邮件" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="联系手机：">
                  <el-input placeholder="联系手机" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- <el-divider content-position="left"><span id="form-title">企业信息</span></el-divider> -->
          <div style="text-align: center;margin-top: 40px;"><h3 style="margin-bottom: auto;">企业信息</h3></div>
          <div id="form-border">
            <el-row>
              <el-col :span="8">
                <el-form-item label="企业名称：" >
                  <el-input placeholder="请填写真实企业名称" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="企业地址：">
                  <el-input placeholder="经营场所或注册地址" style="width: 400px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="统一社会信用代码：" >
                  <el-input placeholder="统一社会信用代码或组织机构代码" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="经营范围：">
                  <el-input
                    type="textarea"
                    placeholder="实际经营范围"
                    v-model="textarea"
                    maxlength="500"
                    show-word-limit
                    style="width: 400px; height: 50px;">
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="组成形式：">
                    <el-select v-model="form.region" placeholder="请选择绑定类型">
                      <el-option lable= "个人经营" value="0"></el-option>
                      <el-option lable= "家庭经营" value="1"></el-option>
                    </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="所属行业编码：">
                    <el-select v-model="form.region" placeholder="请选择所属行业">
                      <el-option label="农、林、牧、渔业" value="A0000"></el-option>
                      <el-option label="采矿业" value="B0000"></el-option >
                      <el-option label="制造业" value="C0000"></el-option>
                      <el-option label="电力、热力、燃气及水生产和供应业" value="D0000"></el-option>
                      <el-option label="建筑业" value="E0000"></el-option>
                      <el-option label="批发和零售业" value="F0000"></el-option>
                      <el-option label="交通运输、仓储和邮政业" value="G0000"></el-option>
                      <el-option label="住宿和餐饮业" value="H0000"></el-option>
                      <el-option label="信息传输、软件和信息技术服务业" value="I0000"></el-option>
                      <el-option label="金融业" value="J0000"></el-option>
                      <el-option label="房地产业" value="K0000"></el-option>
                      <el-option label="租赁和商务服务业" value="L0000"></el-option>
                      <el-option label="科学研究和技术服务业" value="M0000"></el-option>
                      <el-option label="水利、环境和公共设施管理业" value="N0000"></el-option>
                      <el-option label="居民服务、修理和其他服务业" value="O0000"></el-option>
                      <el-option label="教育" value="P0000"></el-option>
                      <el-option label="卫生和社会工作" value="Q0000"></el-option>
                      <el-option label="文化、体育和娱乐业" value="R0000"></el-option>
                      <el-option label="公共管理、社会保障和社会组织" value="S0000"></el-option>
                      <el-option label="国际组织" value="T0000"></el-option>
                    </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="营业执照注册日期：">
                  <el-date-picker
                        v-model="value1"
                        type="date"
                        placeholder="选择日期时间">
                  </el-date-picker>
                  <el-checkbox-group v-model="form.region">
                      <el-checkbox label="长期"></el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="营业执照有效期：">
                  <el-date-picker
                        v-model="value1"
                        type="date"
                        placeholder="选择日期时间">
                  </el-date-picker>
                  <el-checkbox-group v-model="form.region">
                      <el-checkbox label="长期"></el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- <el-divider content-position="left"><span id="form-title">经营者信息</span></el-divider> -->
          <div style="text-align: center;margin-top: 40px;"><h3 style="margin-bottom: auto;">经营者信息</h3></div>
          <div id="form-border">
            <el-row>
              <el-col :span="8">
                <el-form-item label="经营者姓名：">
                  <el-input placeholder="经营者姓名" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="经营者身份证号：">
                  <el-input placeholder="经营者身份证号" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="经营者身份证有效期：">
                  <el-date-picker
                        v-model="value1"
                        type="date"
                        placeholder="选择日期时间">
                  </el-date-picker>
                  <el-checkbox-group v-model="form.region">
                      <el-checkbox label="长期"></el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- <el-divider content-position="left"><span id="form-title">银行账户信息</span></el-divider> -->
          <div style="text-align: center;margin-top: 40px;"><h3 style="margin-bottom: auto;">银行账户信息</h3></div>
          <div id="form-border">
            <el-row>
              <el-col :span="8">
                <el-form-item label="绑定银行卡类型：">
                    <el-select v-model="form.region" placeholder="请选择绑定类型">
                      <el-option value="0" lable= "对私卡" ></el-option>
                      <el-option value="1" lable= "对公卡" ></el-option>
                    </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="银行账号：">
                  <el-input placeholder="银行账号" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="开户绑定手机：">
                  <el-input placeholder="开户绑定手机" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="开户名称：">
                  <el-input placeholder="开户名称" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="开户银行：">
                  <el-input placeholder="开户银行" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="开户银行支行名称：">
                  <el-input placeholder="开户银行支行名称" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="开户银行所在省市：">
                  <el-cascader
                      placeholder="搜索开户银行所在省市"
                      :options="options"
                      filterable>
                  </el-cascader>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- <el-divider content-position="left"><span id="form-title">填写人信息</span></el-divider> -->
          <div style="text-align: center;margin-top: 40px;"><h3 style="margin-bottom: auto;">填写人信息</h3></div>
          <div id="form-border">
            <el-row>
              <el-col :span="8">
                <el-form-item label="是否法人：">
                  <el-radio v-model="radio" label="1">是</el-radio>
                  <el-radio v-model="radio" label="0">否</el-radio>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="代理人姓名：">
                  <el-input placeholder="代理人姓名" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="代理人证件类型：">
                    <el-select v-model="form.region" placeholder="请选择代理人证件类型">
                      <el-option value="ID" lable= "身份证" ></el-option>
                    </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="代理人身份证号：">
                  <el-input placeholder="代理人身份证号" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="代理人联系电话：">
                  <el-input placeholder="代理人联系电话" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- <el-divider content-position="left"><span id="form-title">受益人信息</span></el-divider> -->
          <div style="text-align: center;margin-top: 40px;"><h3 style="margin-bottom: auto;">受益人信息</h3></div>
          <div id="form-border">
            <el-row>
              <el-col :span="8">
                <el-form-item label="受益人是否实际控制人：">
                  <el-radio v-model="radio" label="1">是</el-radio>
                  <el-radio v-model="radio" label="0">否</el-radio>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="受益人姓名：">
                  <el-input placeholder="受益人姓名" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="受益人/经营者地址：">
                  <el-input placeholder="受益人/经营者地址" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="受益人身份证号：">
                  <el-input placeholder="受益人身份证号" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="经营者身份证有效期：">
                  <el-date-picker
                        v-model="value1"
                        type="date"
                        placeholder="选择日期时间">
                  </el-date-picker>
                  <el-checkbox-group v-model="form.region">
                      <el-checkbox label="长期"></el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- <el-divider content-position="left"><span id="form-title">实际控制人信息</span></el-divider> -->
          <div style="text-align: center;margin-top: 40px;"><h3 style="margin-bottom: auto;">实际控制人信息</h3></div>
          <div id="form-border">
            <el-row>
              <el-col :span="8">
                <el-form-item label="法人是否实际控制人：">
                  <el-radio v-model="radio" label="1">是</el-radio>
                  <el-radio v-model="radio" label="0">否</el-radio>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="实际控制人类型：">
                    <el-select v-model="form.region" placeholder="请选择实际控制人类型">
                      <el-option value="0" lable= "个人" ></el-option>
                      <el-option value="1" lable= "企业" ></el-option>
                    </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="实际控制人姓名：">
                  <el-input placeholder="实际控制人姓名" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="实际控制人身份证号：">
                  <el-input placeholder="实际控制人身份证号" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="实际控制人身份证有效期：">
                  <el-date-picker
                        v-model="value1"
                        type="date"
                        placeholder="选择日期时间">
                  </el-date-picker>
                  <el-checkbox-group v-model="form.region">
                      <el-checkbox label="长期"></el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <el-form-item>
              <el-button type="primary" @click="onSubmit">提交申请</el-button>
              <el-button>取消</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="active==1">
        <div>
          <h2>
            审核中
          </h2>
          <p>信息审核中请耐心等待</p>
        </div>
      </div>

      <div v-if="active==2">
        <el-form ref="form" :model="form" label-width="auto" style="margin-top: 40px">
          <div style="text-align: center;margin-top: 40px;"><h3 style="margin-bottom: auto;">证件照</h3></div>
          <div  id="form-border">
            <el-row>
              <el-col :span="8">
                <el-form-item label="营业执照图片：">
                  <SingleImageUpload></SingleImageUpload>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="法人身份证头像图片：">
                  <SingleImageUpload></SingleImageUpload>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="法人身份证国徽图片：">
                  <SingleImageUpload></SingleImageUpload>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="代理人身份证头像图片：">
                  <SingleImageUpload></SingleImageUpload>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="代理人身份证国徽图片：">
                  <SingleImageUpload></SingleImageUpload>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div style="text-align: center;margin-top: 40px;"><h3 style="margin-bottom: auto;">委托书</h3></div>
          <div id="form-border">
            <el-row>
              <el-col :span="8">
                <el-form-item label="代理人委托书：">
                  <SingleImageUpload></SingleImageUpload>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="特殊资质证书：">
                  <SingleImageUpload></SingleImageUpload>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <el-form-item>
              <el-button type="primary" @click="onSubmit">提交</el-button>
              <el-button>取消</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="active==3">
        <el-form ref="form" :model="form" label-width="auto" style="margin-top: 40px">
          <!-- <div id="form-border">
            <el-row>
              <el-col :span="8">
                <el-form-item label="对公银行卡号：">
                  <el-input placeholder="对公银行卡号" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="开户名称：">
                  <el-input placeholder="开户名称" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="开户银行：">
                  <el-input placeholder="开户银行" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="开户银行支行名称：">
                  <el-input placeholder="开户银行支行名称" style="width: 300px; margin-right: 10px"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="开户银行所在省市：">
                  <el-cascader
                      placeholder="搜索开户银行所在省市"
                      :options="options"
                      filterable>
                  </el-cascader>
                </el-form-item>
              </el-col>
            </el-row>
          </div> -->

          <div id="form-border">
            <el-row :gutter="2">
              <el-col :span="10">
                <div style="height: 300px; width: 200px;">
                  <el-steps direction="vertical" :active="active_binding">
                    <el-step title="获取短信验证码"></el-step>
                    <el-step title="确认绑卡"></el-step>
                    <el-step title="设置密码"></el-step>
                  </el-steps>
                </div>
              </el-col>
              <el-col :span="10">
                <div v-if="active_binding==0" style="height: 300px; width: 350px;">
                  <el-form-item label="姓名：">
                    <el-input placeholder="请输入真实姓名"></el-input>
                  </el-form-item>
                  <el-form-item label="身份证号：">
                    <el-input placeholder="请输入身份号"></el-input>
                  </el-form-item>
                  <el-form-item label="银行卡号：">
                    <el-input placeholder="请输入银行卡号"></el-input>
                  </el-form-item>
                  <el-form-item label="银行预留手机号：">
                    <el-input placeholder="银行预留手机号"></el-input>
                  </el-form-item>
                </div>
                <div v-if="active_binding==1" style="height: 300px; width: 350px;">
                  <el-form-item label="预绑卡关联号：">
                    <el-input placeholder="预绑卡关联号" :disabled = "true"></el-input>
                  </el-form-item>
                  <el-form-item label="短信验证码：">
                    <el-input placeholder="请输入短信验证码"></el-input>
                  </el-form-item>
                </div>
                <div v-if="active_binding==2" style="height: 300px; width: 350px;">
                  <el-form-item label="设置密码URL：">
                    <el-input placeholder="设置密码URL" :disabled = "true"></el-input>
                  </el-form-item>
                </div>
                <div style="height: 100px; width: 350px; margin-top: 50px; text-align: center;">
                  <el-button type="primary" @click="onSubmit">提交</el-button>
                  <el-button>取消</el-button>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>

    </div>
  </div>
</template>


<script>
  import SingleImageUpload from '@/components/Upload/SingleImage2.vue'
  export default {
    name: 'IndividualAccount',
    components: {
    	SingleImageUpload,
    },
    data() {
      return {
        active: 0,
        active_binding: 2,
        form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        }
      };
    },

    methods: {
      next() {
        if (this.active++ > 4) this.active = 0;
      }
    }
  }
</script>

<style>
  #form-border{
    border: 2.5px solid #eee;
    padding: 30px;
    border-radius: 8px;
    margin-bottom: 10px;
    margin-top: 10px;
  }
  #form-title{
    font-weight: bold;
    font-size: 23px;
  }
</style>
