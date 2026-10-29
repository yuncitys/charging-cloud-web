<template>
  <div class="summary-cards">
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="summary-card"
      :class="'summary-card--' + item.variant"
    >
      <div class="summary-label">{{ item.label }}</div>
      <div class="summary-value">{{ item.value }}</div>
      <div class="summary-card-icon" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsSummaryCards',
  props: {
    items: {
      type: Array,
      default() {
        return []
      }
    }
  }
}
</script>

<style scoped>
.summary-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 24px;
  margin: 12px 0 24px;
}

.summary-card {
  position: relative;
  flex: 0 0 260px;
  height: 94px;
  border-radius: 15px;
  padding: 14px 18px;
  box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
  color: #ffffff;
  overflow: hidden;
}

.summary-card-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 80px;
  height: 80px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.summary-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 6px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
}

.summary-card--service-count {
  background: linear-gradient(135deg, #2ecc71, #1abc9c);
}
.summary-card--amount {
  background: linear-gradient(135deg, #409EFF, #2d8cf0);
}
.summary-card--power {
  background: linear-gradient(135deg, #00c9ff, #92fe9d);
}
.summary-card--duration {
  background: linear-gradient(135deg, #a855f7, #6366f1);
}
.summary-card--electric {
  background: linear-gradient(135deg, #f97316, #fb923c);
}
.summary-card--servicefee {
  background: linear-gradient(135deg, #14b8a6, #06b6d4);
}
.summary-card--placeholder {
  background: linear-gradient(135deg, #f97373, #fb7185);
}

.summary-card--service-count .summary-card-icon {
  background-image: url(../../../assets/home-panel/user-panel.png);
}
.summary-card--amount .summary-card-icon {
  background-image: url(../../../assets/home-panel/trade-panel.png);
}
.summary-card--power .summary-card-icon {
  background-image: url(../../../assets/home-panel/device-panel.png);
}
.summary-card--duration .summary-card-icon {
  background-image: url(../../../assets/home-panel/order-panel.png);
}
.summary-card--electric .summary-card-icon {
  background-image: url(../../../assets/home-panel/trade-panel.png);
}
.summary-card--servicefee .summary-card-icon {
  background-image: url(../../../assets/home-panel/trade-panel.png);
}
</style>
