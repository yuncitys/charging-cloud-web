<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      :destroy-on-close="true"
      width="50%"
      @close="dialogVisible = false"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="80px"
        label-position="left"
        style="width: 600px; margin-left:80px;"
      >
        <el-form-item label="主体名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="中文,英文,数字(长度1-30字数),不可重复"
            :disabled="isDetail"
            maxlength="30"
          />
        </el-form-item>
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司名称" :disabled="isDetail" />
        </el-form-item>
        <el-form-item label="信用代码" prop="socialCreditCode">
          <el-input v-model="form.socialCreditCode" placeholder="请输入统一社会信用代码" :disabled="isDetail" />
        </el-form-item>
        <el-form-item label="管理员" prop="manageName">
          <el-input v-model="form.manageName" placeholder="请输入租户管理员" :disabled="isDetail" />
        </el-form-item>
        <el-form-item label="联系方式" prop="contactInfo">
          <el-input v-model="form.contactInfo" placeholder="请输入联系方式" :disabled="isDetail" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="!isDetail" type="primary" @click="saveOrUpdate">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addOperator, updateOperator } from '@/api/operator/operator.js'

export default {
  props: {
    row_data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const checkPhone = (_rule, value, callback) => {
      if (!(/^(?:1[3-9]\d{9}|0\d{2,3}[-#]?\d{7,8}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$/.test(value))) {
        callback(new Error('手机号码格式有误，请重填'))
        return
      }
      callback()
    }
    const checkNameLength = (_rule, value, callback) => {
      if (value.length > 30) {
        callback(new Error('中文,英文,数字(长度1-30字数),不可重复'))
        return
      }
      callback()
    }
    const checkSocialCreditCodeLength = (_rule, value, callback) => {
      if (value.length < 18) {
        callback(new Error('英文,数字(长度不能低于18位字数),不可重复'))
        return
      }
      callback()
    }

    return {
      dialogVisible: false,
      rules: {
        name: [
          { required: true, message: '请输入商户名称', trigger: 'blur' },
          { validator: checkNameLength, trigger: 'blur' }
        ],
        companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
        socialCreditCode: [
          { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
          { validator: checkSocialCreditCodeLength, trigger: 'blur' }
        ],
        manageName: [{ required: true, message: '请输入管理员名称', trigger: 'blur' }],
        contactInfo: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      isDetail: false,
      title: '新增',
      form: {
        operatorId: '',
        name: '',
        companyName: '',
        socialCreditCode: '',
        manageName: '',
        contactInfo: ''
      }
    }
  },
  methods: {
    openDialog(formData, isDetail) {
      this.dialogVisible = true
      if (formData == null) {
        this.isDetail = false
        this.title = '新增'
        this.form = {
          operatorId: '',
          name: '',
          companyName: '',
          socialCreditCode: '',
          manageName: '',
          contactInfo: ''
        }
        return
      }

      if (!isDetail) {
        this.title = '编辑'
        this.isDetail = false
        this.form = JSON.parse(JSON.stringify(formData))
        return
      }

      this.title = '详情'
      this.isDetail = true
      this.form = formData
    },
    saveOrUpdate() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const data = this.form
        if (data.operatorId) {
          this.update(data)
        } else {
          this.save(data)
        }
      })
    },
    save(data) {
      addOperator(data).then(res => {
        if (res && res.code === 200) {
          this.dialogVisible = false
          this.$refs.form.resetFields()
          this.$emit('getLists')
          this.$message.success(res.msg)
        } else {
          this.dialogVisible = true
          this.$message.error((res && res.msg) || '保存失败')
        }
      }).catch(() => {
        this.dialogVisible = true
        this.$message.error('保存失败')
      })
    },
    update(data) {
      updateOperator(data).then(res => {
        if (res && res.code === 200) {
          this.dialogVisible = false
          this.$message.success(res.msg)
          this.$emit('getLists')
        } else {
          this.dialogVisible = true
          this.$message.error((res && res.msg) || '保存失败')
        }
      }).catch(() => {
        this.dialogVisible = true
        this.$message.error('保存失败')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-form {
  .el-form-item {
    display: flex;
    width: 100%;
    padding-right: 10px;

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
