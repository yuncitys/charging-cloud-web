<template>
  <el-dialog title="同步二维码" :close-on-click-modal="false" :visible.sync="visible"
    class="smart-dialog smart-dialog_center" lock-scroll width="600px">
    <el-form label-position="top" label-width="80px">
      <el-form-item label="设备编号">
          <el-input v-model="deviceCodes" placeholder="需同步的设备编号" disabled clearable></el-input>
      </el-form-item>
      <el-form-item label="二维码类型">
        <el-radio-group v-model="qrType">
          <el-radio :label="0">主界面码</el-radio>
          <el-radio :label="1">枪二维码</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="二维码前缀">
        <el-input v-model="qrPrefix" placeholder="请输入二维码前缀" clearable></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible=false">取 消</el-button>
      <el-button type="primary" @click="syncQRCode">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      qrType: 0,
      qrPrefix: "",
      deviceCodeList: [],
      deviceCodes: ""
    }
  },
  methods: {
    init(deviceCodeList) {
      this.visible = true
      this.deviceCodeList = deviceCodeList
      this.deviceCodes = deviceCodeList.join(',')
    },
    syncQRCode() {
      console.log("开始同步二维码信息")
      this.$emit('syncQRCode', { deviceCodes: this.deviceCodeList, type: this.qrType, link: this.qrPrefix })
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 20px !important;
}
</style>
