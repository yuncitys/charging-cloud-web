<template>
  <div>
    <el-form-item v-if="ctx.canChooseInitiator" label="发起方" prop="activityInitiator">
      <el-radio-group v-model="form.activityInitiator" @change="onInitiatorChange">
        <el-radio v-if="ctx.canChoosePlatformInitiator" label="1">平台</el-radio>
        <el-radio label="2">商户</el-radio>
      </el-radio-group>
    </el-form-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getMarketingInitiatorContext } from '../utils/marketingActivityAuth'

export default {
  name: 'ActivityInitiatorFields',
  props: {
    form: { type: Object, required: true }
  },
  computed: {
    ...mapGetters(['adminUser']),
    ctx() {
      return getMarketingInitiatorContext(this.adminUser)
    }
  },
  methods: {
    onInitiatorChange(val) {
      if (val === '1') {
        this.$set(this.form, 'activityInitiatorId', '0')
      } else {
        this.$set(this.form, 'activityInitiatorId', '')
      }
      this.$emit('initiator-change', val)
    }
  }
}
</script>
