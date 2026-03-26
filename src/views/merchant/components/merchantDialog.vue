<template>
  <div>
    <!-- <el-button style="margin: 15px 0;" type="primary" @click="openDialog">
      {{ isEdit? '编辑':'新增' }} 
    </el-button> -->
    <el-dialog :title="title" :visible.sync="dialogVisible" @close="dialogVisible = false" :append-to-body="true" :destroy-on-close="true" width="50%">
      <el-steps :active="currentStep - 1" align-center style="margin: 0 80px 20px;">
        <el-step title="商户属性" />
        <el-step title="经营属性" />
      </el-steps>
      <el-form ref="form" v-show="currentStep === 1" :model="form" :rules="rules" label-width="120px" label-position="left" style="width: 680px; margin-left:80px;">
        <el-form-item label="商户名称" prop="name">
          <el-input v-model="form.name" placeholder="中文,英文,数字(长度1-30字数),不可重复" :disabled="isDetail" maxlength="30"></el-input>
        </el-form-item>
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司名称" :disabled="isDetail"></el-input>
        </el-form-item>
        <el-form-item label="归属地区" prop="areaPath">
          <el-cascader
            :key="cascaderKey"
            v-model="form.areaPath"
            :options="areaOptions"
            :props="areaCascaderProps"
            :disabled="isDetail"
            clearable
            filterable
            style="width: 100%"
            @change="handleAreaPathChange"
          />
        </el-form-item>
        <el-form-item label="统一社会信用码" prop="socialCreditCode">
          <el-input v-model="form.socialCreditCode" placeholder="请输入统一社会信用代码" :disabled="isDetail"></el-input>
          <!-- <div style="color:#409EFF;margin-top:6px;">温馨提示：请认真核对营业执照上的18位编码</div> -->
        </el-form-item>
        <el-form-item label="商户管理员" prop="manageName">
          <el-input v-model="form.manageName" placeholder="请输入租户管理员" :disabled="isDetail"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="contactInfo">
          <el-input v-model="form.contactInfo" placeholder="请输入联系方式" :disabled="isDetail"></el-input>
        </el-form-item>
        <el-form-item label="角色类型" prop="roleType">
          <el-select v-model="form.roleType" multiple filterable clearable placeholder="请选择角色类型" style="width: 100%;" :disabled="isDetail">
            <el-option v-for="item in roleTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form v-show="currentStep === 2" :model="form" :rules="rules" label-width="120px" label-position="left" style="width: 680px; margin-left:80px;">
        <el-form-item label="开票种类" prop="invoiceType">
          <el-radio-group v-model="form.invoiceType" :disabled="isDetail">
            <el-radio :label="0">不开票</el-radio>
            <el-radio :label="1">普票</el-radio>
            <el-radio :label="2">专票</el-radio>
            <el-radio :label="3">普票和专票</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="营业执照" prop="businessLicence">
          <div style="display:flex;align-items:center;gap:20px;">
            <el-upload
              action=""
              :show-file-list="false"
              :http-request="handleBusinessUpload"
              accept=".jpg,.jpeg,.png">
              <el-button size="small" type="primary" :disabled="isDetail">上传图片</el-button>
            </el-upload>
            <el-image v-if="form.businessLicence" :src="form.businessLicence" style="width:80px;height:80px;" fit="contain">
              <div slot="error" style="width:80px;height:80px;background:#f5f7fa;display:flex;align-items:center;justify-content:center;">无</div>
            </el-image>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" :disabled="isDetail"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="!isDetail && currentStep === 1" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="!isDetail && currentStep === 2" @click="prevStep">上一步</el-button>
        <el-button v-if="!isDetail && currentStep === 2" type="primary" @click="saveOrUpdate">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
  
<script>
  import {
    addMerchant,
		updateMerchant
	} from '@/api/merchant/merchant.js'
  import { getAreaSelector } from '@/api/area/index'
  import { upload } from '@/api/upload/file'
  export default {
    props:{
        row_data:{
            type:Object
        }
	  },
    data() {
      let checkPhone = (rule, value, callback) => {
        if (!(/^(?:1[3-9]\d{9}|0\d{2,3}[-#]?\d{7,8}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$/.test(value))) {
          callback(new Error('手机号码格式有误，请重填'))
          return false;
        } else {
          callback()
        }
      };
      let checkNameLength = (rule, value, callback) => {
        if (value.length > 30) {
          callback(new Error('中文,英文,数字(长度1-30字数),不可重复'))
          return false;
        } else {
          callback()
        }
      };
      let checkSocialCreditCodeLength = (rule, value, callback) => {
        if (value.length < 18) {
          callback(new Error('英文,数字(长度不能低于18位字数),不可重复'))
          return false;
        } else {
          callback()
        }
      }
      return {
        cascaderKey: 1,
        dialogVisible: false,
        visibleStep: true,
        rules: {
					name: [{
						required: true,
						message: '请输入商户名称',
						trigger: 'blur'
					}, {
						validator: checkNameLength,
						trigger: 'blur'
					}],
					companyName: [{
						required: true,
						message: '请输入公司名称',
						trigger: 'blur'
					}],
          areaPath: [{
            type: 'array',
            required: true,
            message: '请选择归属地区',
            trigger: 'change'
          }],
          socialCreditCode: [{
						required: true,
						message: '请输入统一社会信用代码',
						trigger: 'blur'
					}, {
						validator: checkSocialCreditCodeLength,
						trigger: 'blur'
					}],
          manageName: [{
						required: true,
						message: '请输入管理员名称',
						trigger: 'blur'
					}],
          contactInfo: [{
						required: true,
						message: '请输入联系方式',
						trigger: 'blur'
					}, {
						validator: checkPhone,
						trigger: 'blur'
					}],
          roleType: [{
						required: true,
						validator: (rule, value, callback) => {
              if (!Array.isArray(value) || value.length === 0) callback(new Error('请选择角色类型'))
              else callback()
            },
						trigger: 'change'
					}],
          invoiceType: [{
						required: true,
						message: '请选择开票类型',
						trigger: 'blur'
					}],
          businessLicence: [{
            required: false,
            trigger: 'change'
          }]
        },
        currentStep: 1,
        isDetail: false,
        isSave: false,
        title: '新增',
        areaOptions: [],
        areaCascaderProps: {
          value: 'id',
          label: 'fullName',
          children: 'children',
          emitPath: true,
          lazy: true,
          lazyLoad: (node, resolve) => {
            if (!node) {
              resolve([])
              return
            }
            this.loadAreaChildren(node, resolve)
          }
        },
        roleTypeOptions: [{
          label: '运营商',
          value: 'OPERATOR'
        }, {
          label: '投资人',
          value: 'INVESTOR'
        }, {
          label: '场地方',
          value: 'LANDLORD'
        }, {
          label: '分账主体',
          value: 'SETTLE'
        }],
        form: {
          id: '',
          typq: 1,
          name: '',
          companyName: '',
          provinceId: '',
          regionId: '',
          countyId: '',
          areaPath: [],
          socialCreditCode: '',
          manageName: '',
          contactInfo: '',
          roleType: [],
          invoiceType: '',
          businessLicence: '',
          remark: ''
        },
      };
    },
    methods: {
      nextStep() {
        const fs = ['name', 'companyName', 'areaPath', 'socialCreditCode', 'manageName', 'contactInfo', 'roleType']
        const tasks = fs.map(f => new Promise(resolve => {
          this.$refs['form'].validateField(f, (errorMessage) => {
            resolve(errorMessage === '')
          })
        }))
        Promise.all(tasks).then((results) => {
          if (results.every(res => res)) {
            this.currentStep = 2
          }
        })
      },
      prevStep() {
        this.currentStep = 1
      },
      handleBusinessUpload(params) {
        const file = params.file
        const formData = new FormData()
        formData.append('file', file)
        upload('WebAnnexFile', formData).then(res => {
          const url = res && res.data && (res.data.url || res.data)
          this.form.businessLicence = url || res.data
          this.$message.success('上传成功')
        }).catch(() => {
          this.$message.error('上传失败')
        })
      },
      normalizeAreaList(res) {
        const data = res && res.data
        const list = Array.isArray(data) ? data : (data && Array.isArray(data.list) ? data.list : (Array.isArray(res) ? res : []))
        return list.map(item => ({
          ...item,
          id: item && item.id != null ? String(item.id) : item.id
        }))
      },
      loadAreaChildren(node, resolve) {
        if (!node) {
          resolve([])
          return
        }
        const level = node.level
        const parentId = level === 0 ? '-1' : (node.value != null ? String(node.value) : '')
        getAreaSelector(parentId).then(res => {
          const nodes = this.normalizeAreaList(res).map(item => ({
            ...item,
            leaf: level >= 2
          }))
          resolve(nodes)
        }).catch(() => {
          resolve([])
        })
      },
      handleAreaPathChange(val) {
        const path = Array.isArray(val) ? val.map(v => String(v)) : []
        this.$set(this.form, 'areaPath', path)
        this.form.provinceId = path[0] || ''
        this.form.regionId = path[1] || ''
        this.form.countyId = path[2] || ''
        this.$refs['form'].validateField('areaPath')
      },
      normalizeAreaIdsInForm() {
        this.form.provinceId = this.form.provinceId != null && this.form.provinceId !== '' ? String(this.form.provinceId) : ''
        this.form.regionId = this.form.regionId != null && this.form.regionId !== '' ? String(this.form.regionId) : ''
        this.form.countyId = this.form.countyId != null && this.form.countyId !== '' ? String(this.form.countyId) : ''
      },
      getProvinceList() {
        return getAreaSelector('-1').then(res => {
          this.areaOptions = this.normalizeAreaList(res).map(item => ({
            ...item,
            leaf: false
          }))
        }).catch(() => {
          this.areaOptions = []
        })
      },
      loadAreaOptionsForCurrentForm() {
        const provinceId = this.form.provinceId
        const regionId = this.form.regionId
        const countyId = this.form.countyId
        return getAreaSelector('-1').then(res => {
          const provinces = this.normalizeAreaList(res)
          provinces.forEach(p => { p.leaf = false })
          this.areaOptions = provinces
          if (!provinceId) return Promise.resolve()
          const provinceNode = this.areaOptions.find(p => String(p.id) === String(provinceId))
          if (!provinceNode) return Promise.resolve()
          if (!regionId) return Promise.resolve()
          return getAreaSelector(provinceId).then(res2 => {
            const cities = this.normalizeAreaList(res2)
            cities.forEach(c => { c.leaf = false })
            this.$set(provinceNode, 'children', cities)
            const cityNode = cities.find(c => String(c.id) === String(regionId))
            if (!cityNode || !countyId) return Promise.resolve()
            return getAreaSelector(regionId).then(res3 => {
              const counties = this.normalizeAreaList(res3)
              counties.forEach(a => { a.leaf = true })
              this.$set(cityNode, 'children', counties)
            })
          })
        }).catch(() => {
          this.areaOptions = []
        })
      },
      normalizeRoleType(val) {
        if (Array.isArray(val)) return val
        if (val === null || val === undefined || val === '') return []
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean)
        return []
      },
      openDialog(formData,isDetail) {
        this.dialogVisible = true;
        this.areaOptions = []
        
        const defaultForm = {
          id: '',
          type: 1,
          name: '',
          companyName: '',
          provinceId: '',
          regionId: '',
          countyId: '',
          areaPath: [],
          socialCreditCode: '',
          manageName: '',
          contactInfo: '',
          roleType: [],
          invoiceType: '',
          businessLicence: '',
          remark: ''
        }

        if(formData == null){
          this.isDetail = false
          this.visibleStep = true
          this.isSave = true
          this.title = '新增'
          this.currentStep = 1
          this.form = { ...defaultForm }
          this.getProvinceList().then(() => {
            this.cascaderKey++
          })
          this.$nextTick(() => {
            this.$refs['form'] && this.$refs['form'].clearValidate()
          })
        } else if (!isDetail) {
          this.title = '编辑'
          this.currentStep = 1
          this.isDetail = false
          this.visibleStep = false
          this.isSave = false
          this.form = Object.assign({}, defaultForm, JSON.parse(JSON.stringify(formData)));
          this.form.roleType = this.normalizeRoleType(this.form.roleType)
          this.normalizeAreaIdsInForm()
          const areaPath = [this.form.provinceId, this.form.regionId, this.form.countyId].filter(Boolean)
          this.form.areaPath = areaPath
          this.loadAreaOptionsForCurrentForm().then(() => {
            this.cascaderKey++
            this.$nextTick(() => {
              this.$set(this.form, 'areaPath', areaPath)
              this.$refs['form'] && this.$refs['form'].clearValidate()
            })
          })
        } else {
          this.title = '详情'
          this.currentStep = 1
          this.isDetail = true
          this.visibleStep = false
          this.isSave = false
          this.form = Object.assign({}, defaultForm, JSON.parse(JSON.stringify(formData)));
          this.form.roleType = this.normalizeRoleType(this.form.roleType)
          this.normalizeAreaIdsInForm()
          const areaPath = [this.form.provinceId, this.form.regionId, this.form.countyId].filter(Boolean)
          this.form.areaPath = areaPath
          this.loadAreaOptionsForCurrentForm().then(() => {
            this.cascaderKey++
            this.$nextTick(() => {
              this.$set(this.form, 'areaPath', areaPath)
            })
          })
        }
      },
      saveOrUpdate(){
        let isValid = false;
        this.$refs['form'].validate(valid => {
					isValid = valid
				})
        let data = this.form
        console.log("表单数据:",data)
        if(data.id){
          if (data.id == '' || data.id == null || data.id == undefined){
            this.$message.error('ID不能为空')
            return false
          }
          if( isValid ) this.update(data)
        }else{
          if( isValid ) this.save(data)
        }
      },
      save(data) {
        addMerchant(data).then(res => {
        	if (res.code == 200) {
            this.dialogVisible = false;
            this.$refs['form'].resetFields();
            this.$emit('getLists')
            this.$message.success(res.msg)
        	} else {
            this.dialogVisible = true;
        		this.$message.error(res.msg)
        	}
        })
      },
      update(data) {
        updateMerchant(data).then(res => {
        	if (res.code == 200) {
            this.dialogVisible = false;
        		this.$message.success(res.msg)
            this.$emit('getLists')
        	} else {
            this.dialogVisible = true;
        		this.$message.error(res.msg)
        	}
        })
      }
    }
  };
</script>

<style lang="scss" scoped>
>>> .el-form {
  .el-form-item {
    display: flex;
    width: 100%;
    padding-right: 10px;
    margin-bottom: 20px;

    .el-form-item__label-wrap {
      margin-left: 0;
    }

    .el-date-editor,
    .el-select,
    .el-form-item__content {
      width: 100%;
      flex: 1;
    }
  }
}
</style>
  
