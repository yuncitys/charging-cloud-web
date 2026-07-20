import { getMerchant } from '@/api/merchant/merchant'

/** 活动抽屉：归属商户下拉选项 */
export default {
  data() {
    return {
      merchantOptions: []
    }
  },
  computed: {
    showMerchantField() {
      return String(this.form.activityInitiator) === '2'
    }
  },
  methods: {
    loadMerchantOptions() {
      return getMerchant({ roleType: 'OPERATOR', type: 1 }).then(res => {
        this.merchantOptions = (res && res.code === 200) ? (res.data || []) : []
      }).catch(() => {
        this.merchantOptions = []
      })
    }
  }
}
