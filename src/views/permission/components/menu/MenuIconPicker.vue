<template>
  <div class="menu-icon-picker">
    <el-select
      :value="value"
      filterable
      clearable
      placeholder="搜索图标，如 setting、finance"
      style="width: 320px"
      @input="$emit('input', $event || '')"
    >
      <el-option
        v-for="icon in iconOptions"
        :key="icon"
        :label="menuIconLabel(icon)"
        :value="icon"
      >
        <span class="menu-icon-picker__option">
          <i :class="icon" />
          <span>{{ menuIconLabel(icon) }}</span>
        </span>
      </el-option>
    </el-select>
    <i v-if="value" :class="value" class="menu-icon-picker__preview" />
  </div>
</template>

<script>
import { MENU_ICONS, menuIconLabel, withCurrentMenuIcon } from '@/views/permission/constants/menuIcons'

export default {
  name: 'MenuIconPicker',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconOptions() {
      return withCurrentMenuIcon(this.value)
    }
  },
  methods: {
    menuIconLabel
  }
}
</script>

<style scoped>
.menu-icon-picker {
  display: flex;
  align-items: center;
}

.menu-icon-picker__option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-icon-picker__option i {
  font-size: 20px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.menu-icon-picker__preview {
  font-size: 26px;
  margin-left: 16px;
  color: #51c53b;
}
</style>
