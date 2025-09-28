<template>
<el-dialog :title="param.title" :visible.sync="param.propVisible" :before-close="close">
<el-form class="dialog-form" ref="form" :model="form" :rules="rules" :inline="false" label-width="auto">
  <el-form-item label="发票流水" prop="serialNo">
    <el-input :value="form.serialNo" disabled></el-input>
  </el-form-item>
  <el-form-item label="冲红原因" prop="backRemarks">
    <el-input type="textarea" v-model="form.backRemarks" placeholder="请输入冲红原因"></el-input>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" :loading="loading" @click="submitRedApplyInvoice">申请冲红</el-button>
  </el-form-item>
</el-form>
</el-dialog>
</template>

<script>
import { RedApplyInvoice } from '@/api/invoice'
import qs from 'qs'
export default {
  name: 'redApplyInvoice',
  data(){
    return {
      loading: false,
      param: {
        title: '发票冲红',
        propVisible: false
      },
      form:{
        serialNo: null,
        backRemarks: null
      },
      rules: {
        serialNo: [
          {required: true, message: '发票流水不能为空', trigger: 'blur'}
        ],
        backRemarks: [
          {required: true, message: '冲红原因不能为空', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    close(){

    },
    submitRedApplyInvoice(){
      const vm = this
      vm.$refs.form.validate((valid) => {
        if (valid) {
          RedApplyInvoice(vm.form).then(res => {
            if(res.code === 200){
              vm.$message.success(res.msg)
              setTimeout(()=>{
                vm.param.propVisible = false
                vm.$parent.search()
              }, 1000)
            }else{
              this.$message.error(res.msg)
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
