<template>
  <el-dialog :title="param.title" :visible.sync="propVisible" :before-close="close">
    <el-form class="dialog-form" ref="form" :model="form" :rules="rules" :inline="true" label-width="auto">
      <el-row>
        <el-col :span="12">
          <el-form-item label="发票抬头" prop="taxName">
            <el-input v-model="form.taxName" placeholder="请输入发票抬头" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="买方税号" prop="taxNum">
            <el-input v-model="form.taxNum" placeholder="请输入买方税号" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" maxlength="11" placeholder="请输入手机号" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="开户行">
            <el-input v-model="form.bank" placeholder="请输入开户行" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="银行卡号">
            <el-input v-model="form.bankNum" placeholder="请输入卡号" oninput="value=value.replace(/[^\d]/g,'')"  clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="地址">
            <el-input v-model="form.address" placeholder="请输入地址" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发票性质">
            <el-select v-model="form.property" placeholder="发票性质">
              <el-option v-for="(item, index) in property" :key="index" :label="item.label"
                         :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <!-- <el-col :span="12">
            <el-form-item label="绑定车主">
                <el-select v-model="form.customerid" filterable placeholder="请选择车主">
                    <el-option v-for="(item, index) in customerList" :key="index" :label="item.username"
                            :value="item.id"></el-option>
                </el-select>
            </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="设为默认">
            <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { get,saveOrUpdate } from '@/api/customerInvoice/invoice'
export default {
  name: 'customerInvoiceEdit',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    param: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    propVisible: {
      get() {
        return this.visible
      },
      set() {
      }
    }
  },
  data() {
    return {
      form: {
        address: '',
        bank: '',
        bankNum: '',
        email: '',
        isDefault: '0',
        phone: '',
        property: "1",
        taxName: '',
        taxNum: '',
        userId: ''
      },
      property: [
        { label: '个人', value: "1" },
        { label: '企业', value: "2" }
      ],
      customerList: [],
      rules: {
        taxname: [{ required: true, message: '请输入发票抬头' }],
        taxnum: [{ required: true, message: '请输入发票税号' }],
        phone: [{ message: '请输入手机号' }],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  created() {
    if (this.param.id) {
      get(this.param.id).then((res) => {
        this.form = res.data
      })
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    confirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          saveOrUpdate(this.form).then((res) => {
            this.$message({ message: res.msg, type: 'success' })
          })
          this.$parent.search()
          this.close()
        } else {
          this.$message({ message: 'error submit!!', type: 'error' })
          return false
        }
      })
    }
  }
}
</script>
