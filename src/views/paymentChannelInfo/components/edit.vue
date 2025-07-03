<template>
  <div>
    <el-dialog :title="param.title" :visible.sync="propVisible" :before-close="close" width="33%">
      <el-form class="dialog-form" ref="form" :model="form" :inline="true" label-width="auto">
        <el-row>
          <el-col :span="24">
            <el-form-item label="支付方式渠道">
              <el-select v-model="form.channelId" clearable placeholder="请选择支付渠道" style="width: 370px;">
                <el-option v-for="(item,index) in channelList" :key="index" :label="item.channelName" :value="item.id + ''"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="支付方式名称">
              <el-input v-model="form.methodName" placeholder="请输入支付方式名称" clearable style="width: 370px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="支付方式代码">
              <el-input v-model="form.methodCode" placeholder="请输入支付方式代码" clearable style="width: 370px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-switch v-model="form.enabledmark" inactive-value="0" active-value="1"></el-switch>
            </el-form-item>
          </el-col>
        </el-row> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { update, save, getInfo } from '@/api/channelPaymentInfo'
import { getList as getChannel } from '@/api/channelConfigInfo'
export default {
  name: 'channelPaymentInfoEdit',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    param: {
      type: Object,
      default: () => { }
    }
  },
  computed: {
    propVisible: {
      get () {
        return this.visible
      },
      set () {
      }
    }
  },
  data () {
    return {
      form: {
        'channelId': '',
        'methodCode': '',
        'methodName': '',
        'serviceProviderId': ''
      },
      channelList: []
    }
  },
  created () {
    if (this.param.id) {
      getInfo(this.param.id).then(res => {
        this.form = res.data
      })
    }
    this.init()
  },
  methods: {
    async init () {
      await getChannel().then(res => {
        this.channelList = res.data
      })
    },
    close () {
      this.$emit('update:visible', false)
    },
    confirm () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.param.id) {
            update(this.param.id, this.form).then(response => {
              if (response.code == 200){
                this.$message.success(response.msg)
                this.$emit('search')
                this.close()
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            save(this.form).then(response => {
              if (response.code == 200){
                this.$message.success(response.msg)
                this.$emit('search')
                this.close()
              } else {
                this.$message.error(response.msg)
              }
            })
          }
        }
      })
    }
  }
}
</script>
