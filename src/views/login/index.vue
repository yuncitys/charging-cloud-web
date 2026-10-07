<template>
  <div class="login-page">
    <div class="login-orbit" />
    <header class="login-header">
      <img class="login-header__logo" :src="config.logo" alt="logo">
      <span v-if="config.brandName" class="login-header__name">{{ config.brandName }}</span>
    </header>

    <section class="login-hero">
      <h1 v-if="sloganWords.length" class="login-hero__title">
        <template v-for="item in sloganWords">
          <i v-if="item.index > 0" :key="'dot' + item.index" class="login-hero__dot" />
          <span :key="'word' + item.index" class="login-hero__word" :class="item.cls">{{ item.text }}</span>
        </template>
      </h1>
      <p v-if="config.subTitle" class="login-hero__sub">{{ config.subTitle }}</p>
      <img class="login-hero__art" :src="config.illustration" alt="">
    </section>

    <div class="login-card">
      <section class="login-panel">
        <div class="login-panel__head">
          <h2 class="login-panel__title">{{ config.panelTitle }}</h2>
          <p v-if="config.panelSubTitle" class="login-panel__sub">{{ config.panelSubTitle }}</p>
        </div>

        <el-form ref="loginForm" class="login-form" :model="loginForm" :rules="loginRules" autocomplete="on" @submit.native.prevent>
          <el-form-item prop="account">
            <el-input
              ref="account"
              v-model="loginForm.account"
              placeholder="请输入账号"
              name="account"
              type="text"
              tabindex="1"
              autocomplete="off"
              @keyup.enter.native="focusPassword"
            >
              <svg-icon slot="prefix" icon-class="user" class="login-form__icon" />
            </el-input>
          </el-form-item>

          <el-tooltip v-model="capsTooltip" content="大写锁定已开启" placement="right" manual>
            <el-form-item prop="password">
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="请输入密码"
                name="password"
                tabindex="2"
                autocomplete="on"
                @keyup.native="checkCapslock"
                @blur="capsTooltip = false"
                @keyup.enter.native="handleLogin"
              >
                <svg-icon slot="prefix" icon-class="password" class="login-form__icon" />
                <span slot="suffix" class="login-form__eye" @click="showPwd">
                  <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                </span>
              </el-input>
            </el-form-item>
          </el-tooltip>

          <div class="login-form__extra">
            <el-checkbox v-model="loginForm.rememberMe">7 天内自动登录</el-checkbox>
          </div>

          <el-button :loading="loading" type="primary" class="login-form__submit" @click.native.prevent="handleLogin">
            {{ loading ? '登录中…' : '登录' }}
          </el-button>
        </el-form>
      </section>
    </div>

    <footer v-if="config.copyright" class="login-footer">{{ config.copyright }}</footer>
  </div>
</template>

<script>
import { getRouter } from '@/api/user'
import { findFirstLeafHref } from '@/utils/menuNav'
import defaultLogo from '@/assets/logo.png'
import defaultIllustration from '@/assets/login/login_content.jpg'

const DEFAULT_CONFIG = {
  brandName: '云创智城',
  logo: defaultLogo,
  slogan: ['万桩互联', '智慧运营'],
  subTitle: '欢迎使用智慧充电综合管理平台',
  illustration: defaultIllustration,
  panelTitle: '欢迎登录',
  panelSubTitle: '请使用管理员分配的账号登录',
  copyright: 'Copyright© 2021 深圳市云创智城科技有限公司 All Rights Reserved 粤ICP备2022076347号'
}

// 合并 public/BaseConfig.js 中的 VUE_LOGIN，空值回退默认
function resolveLoginConfig() {
  const custom = (window.BaseConfig && window.BaseConfig.VUE_LOGIN) || {}
  return Object.keys(DEFAULT_CONFIG).reduce((acc, key) => {
    const value = custom[key]
    const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)
    acc[key] = empty ? DEFAULT_CONFIG[key] : value
    return acc
  }, {})
}

export default {
  name: 'Login',
  data() {
    return {
      config: resolveLoginConfig(),
      loginForm: {
        account: '',
        password: '',
        rememberMe: false,
        grant_type: 'password'
      },
      loginRules: {
        account: [{ required: true, trigger: 'blur', message: '请填写账户' }],
        password: [{ required: true, trigger: 'blur', message: '请填写密码' }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  computed: {
    sloganWords() {
      const words = [].concat(this.config.slogan).filter(Boolean)
      return words.map((text, index) => ({
        text,
        index,
        cls: words.length > 1 && index === words.length - 1 ? 'login-hero__word--brand' : ''
      }))
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      const target = this.loginForm.account ? this.$refs.password : this.$refs.account
      target && target.focus()
    })
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      this.passwordType = this.passwordType === 'password' ? '' : 'password'
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    focusPassword() {
      this.$refs.password.focus()
    },
    handleLogin() {
      if (this.loading) return
      this.$refs.loginForm.validate(valid => {
        if (!valid) return false
        this.loading = true
        const loginForm = {
          account: this.loginForm.account.trim(),
          password: this.loginForm.password.trim(),
          rememberMe: this.loginForm.rememberMe,
          grant_type: this.loginForm.grant_type.trim()
        }
        this.$store.dispatch('permission/resetPermission')
        this.$store.dispatch('user/login', loginForm)
          .then(() => {
            window.localStorage.setItem('pActiveMenu', '首页')
            window.localStorage.setItem('activeMenu', '')
            window.localStorage.setItem('leftMeunList', '')
            return getRouter()
          })
          .then(res => {
            if (Number(res.code) !== 200) return
            const menuList = res.data.menuList
            const hasDashboard = menuList.some(item => item.href === '/dashboard')
            if (hasDashboard || !menuList.length) {
              this.$router.push({ path: '/' })
            } else {
              this.$router.push({ path: findFirstLeafHref(menuList[0]) || '/' })
            }
          })
          .catch(() => {})
          .then(() => {
            this.loading = false
          })
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
$primary: #0184ff;
$primary-2: #1fc7d6;
$text: #1f2d3d;
$muted: #8a94a6;
$card-width: 420px;
$card-right: 8vw;
$card-center-x: calc(100% - #{$card-right} - #{$card-width} / 2);

.login-page {
  position: relative;
  display: flex;
  align-items: center;
  width: 100vw;
  min-width: 1200px;
  height: 100vh;
  min-height: 680px;
  overflow: hidden;
  background:
    radial-gradient(circle at #{$card-center-x} 50%, rgba(1, 132, 255, 0.16) 0, rgba(1, 132, 255, 0) 420px),
    radial-gradient(ellipse 46vw 38vh at 30% 64%, rgba(35, 214, 222, 0.16) 0, rgba(35, 214, 222, 0) 100%),
    linear-gradient(135deg, #f7faff 0%, #eef5ff 48%, #e5efff 100%);

  // 点阵纹理，四周淡出
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(1, 132, 255, 0.14) 1px, transparent 1.4px);
    background-size: 22px 22px;
    -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%);
    mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%);
    pointer-events: none;
  }
}

// 以登录卡片为圆心的两道细环，把卡片和背景连成一体
.login-orbit {
  position: absolute;
  top: 50%;
  right: calc(#{$card-right} + #{$card-width} / 2);
  width: 680px;
  height: 680px;
  border: 1px solid rgba(1, 132, 255, 0.12);
  border-radius: 50%;
  transform: translate(50%, -50%);
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    inset: -110px;
    border: 1px dashed rgba(35, 214, 222, 0.22);
    border-radius: 50%;
  }
}

.login-header {
  position: absolute;
  top: 28px;
  left: 4.5vw;
  display: flex;
  align-items: center;

  &__logo {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(1, 132, 255, 0.2);
  }

  &__name {
    margin-left: 10px;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 2px;
    color: #12324a;
  }
}

/* 左侧主视觉 */
.login-hero {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 0 0 0 4.5vw;

  &__title {
    display: flex;
    align-items: center;
    margin: 0;
    font-family: "PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC", "Microsoft YaHei", sans-serif;
    font-size: 54px;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: 6px;
    transform: skewX(-6deg);
    transform-origin: left bottom;
  }

  &__word {
    color: #0d2b45;
    text-shadow: 0 6px 18px rgba(13, 43, 69, 0.12);

    &--brand {
      background: linear-gradient(90deg, $primary 0%, #12b5e0 55%, $primary-2 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: none;
      filter: drop-shadow(0 6px 14px rgba(1, 132, 255, 0.22));
    }
  }

  &__dot {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    margin: 0 18px 0 12px;
    border-radius: 50%;
    background: $primary-2;
    box-shadow: 0 0 0 5px rgba(31, 199, 214, 0.18), 0 0 14px rgba(31, 199, 214, 0.6);
  }

  &__sub {
    display: flex;
    align-items: center;
    margin: 18px 0 0;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 3px;
    color: #3a5068;

    &::before {
      content: '';
      width: 28px;
      height: 4px;
      margin-right: 12px;
      border-radius: 2px;
      background: $primary;
    }
  }

  &__art {
    display: block;
    width: min(54vw, 860px);
    margin: 2vh 0 0 -1vw;
    // 插画是白底，正片叠底后白色与背景融合
    mix-blend-mode: multiply;
    user-select: none;
    pointer-events: none;
  }
}

.login-card {
  position: relative;
  z-index: 1;
  flex: 0 0 $card-width;
  margin-right: $card-right;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px);
  box-shadow:
    0 30px 70px rgba(1, 92, 200, 0.14),
    0 0 0 8px rgba(255, 255, 255, 0.35);
}

/* 右侧表单区 */
.login-panel {
  padding: 44px 40px 40px;

  &__title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: $text;
  }

  &__sub {
    margin: 10px 0 0;
    font-size: 14px;
    color: $muted;
  }
}

.login-form {
  margin-top: 36px;

  ::v-deep .el-form-item {
    margin-bottom: 24px;
  }

  ::v-deep .el-input__inner {
    height: 48px;
    line-height: 48px;
    padding-left: 44px;
    border-radius: 10px;
    border-color: #e4e8f0;
    background: #f7f9fc;
    font-size: 15px;
    color: $text;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: #c9d6f2;
    }

    &:focus {
      border-color: $primary-2;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(77, 140, 253, 0.15);
    }
  }

  ::v-deep .el-input__prefix,
  ::v-deep .el-input__suffix {
    display: flex;
    align-items: center;
  }

  ::v-deep .el-input__prefix {
    left: 14px;
  }

  ::v-deep .el-input__suffix {
    right: 12px;
  }

  &__icon {
    font-size: 18px;
    color: #a0aec0;
  }

  &__eye {
    display: flex;
    align-items: center;
    padding: 4px;
    font-size: 16px;
    color: #a0aec0;
    cursor: pointer;
    user-select: none;

    &:hover {
      color: $primary-2;
    }
  }

  &__extra {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: -4px 0 28px;
  }

  // 全局把 .el-button--primary 设成了带 !important 的主题绿，这里需要同样用 !important 覆盖
  &__submit.el-button--primary {
    width: 100%;
    height: 48px;
    border: none !important;
    border-radius: 10px;
    font-size: 16px;
    letter-spacing: 2px;
    background: $primary !important;
    box-shadow: 0 10px 24px rgba(1, 132, 255, 0.26);
    transition: transform 0.15s, box-shadow 0.15s, background-color 0.15s;

    &:hover,
    &:focus {
      background: #1a92ff !important;
      box-shadow: 0 12px 28px rgba(1, 132, 255, 0.34);
      transform: translateY(-1px);
    }

    &:active {
      background: #0070db !important;
      transform: translateY(0);
    }
  }
}

.login-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 18px;
  text-align: center;
  font-size: 12px;
  color: rgba(31, 45, 61, 0.55);
}
</style>
