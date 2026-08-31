<template>
  <div>
    <el-form-item v-if="ctx.canChooseInitiator" label="发起方" prop="activityInitiator">
      <el-radio-group v-model="form.activityInitiator" @change="onInitiatorChange">
        <el-radio
          v-for="item in visibleInitiatorOptions"
          :key="item.value"
          :label="item.value"
        >{{ item.label }}</el-radio>
      </el-radio-group>
    </el-form-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getMarketingInitiatorContext } from '../utils/marketingActivityAuth'
import { loadActivityInitiatorOptions } from '../constants/activityTypes'

export default {
  name: 'ActivityInitiatorFields',
  props: {
    form: { type: Object, required: true }
  },
  data() {
    return {
      initiatorOptions: []
    }
  },
  computed: {
    ...mapGetters(['adminUser']),
    ctx() {
      return getMarketingInitiatorContext(this.adminUser)
    },
    visibleInitiatorOptions() {
      const list = this.initiatorOptions || []
      if (this.ctx.canChoosePlatformInitiator) return list
      return list.filter(o => String(o.value) !== '1')
    }
  },
  created() {
    loadActivityInitiatorOptions().then(list => { this.initiatorOptions = list || [] })
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
