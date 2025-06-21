<template>
  <div class="login-bg">
    <div class="login-box-wrap">
      <div class="login-logo img">
      </div>
      <!-- 国际化 -->
      <!-- <div class="login-logo lang">
        <lang-select class="set-language" />
      </div> -->
      <div class="login-form-item">
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" autocomplete="on" label-position="left">
          <!-- 标题 -->
          <div class="title-container">
            <h3 class="title" style="color:#4d8cfd;font-size: 24px;line-height: 33px">
              {{ $t('login.systemTitle') }}
            </h3>
          </div>
          <!--账号-->
          <el-form-item prop="account" style="background-color: #FFFFFF;border-radius: 5px;">
            <el-input ref="account" v-model="loginForm.account" :placeholder="$t('login.username')" name="account"
              type="text" tabindex="1" autocomplete="off">
              <template slot="prepend">
                <svg-icon icon-class="user" />
              </template>
            </el-input>
          </el-form-item>
          <!--密码-->
          <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual
            style="background-color: #FFFFFF;border-radius: 5px;">
            <el-form-item prop="password">
              <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
                :placeholder="$t('login.password')" name="password" tabindex="2" autocomplete="on"
                @keyup.native="checkCapslock" @blur="capsTooltip = false" @keyup.enter.native="handleLogin">
                <template slot="prepend">
                  <svg-icon icon-class="password" />
                </template>
                <span class="show-pwd" @click="showPwd" slot="append">
                  <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                </span>
              </el-input>
            </el-form-item>
          </el-tooltip>
          <!-- 记住我 @change="checked=>isCheckRow(checked)"-->
          <el-form-item prop="rememberMe">
            <el-checkbox v-model="loginForm.rememberMe" class="rememberMe">{{ $t('login.rememberMe') }}</el-checkbox>
          </el-form-item>
          
          <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;background-color: #4d8cfd;color: #FFFFFF;border: none;height: 45px;font-size: 16px;"
            @click.native.prevent="handleLogin">
            {{ $t('login.logIn') }}
          </el-button>
        </el-form>
      </div>
    </div>
    <div style="color: #000;font-size: 14px; position: absolute; bottom: 0; background: rgba(0, 0,0, 0.1); width: 100%; text-align: center; line-height: 3">
      {{Copyright}}
    </div>
  </div>
</template>

<script>
  import {
    validUsername
  } from '@/utils/validate'
  import LangSelect from '@/components/LangSelect'
  import SocialSign from './components/SocialSignin'
  import Frame from '@/components/Common/Frame'
  import {
    getRouter
  } from '@/api/user'
  export default {
    name: 'Login',
    components: {
      LangSelect,
      SocialSign,
      Frame
    },
    data() {
      return {
        SystemTitle: '智慧充电综合管理平台',
        Copyright: 'Copyright© 2021 深圳市云创智城科技有限公司 All Rights Reserved 粤ICP备2022076347号',
        loginForm: {
          account: '',
          password: '',
          rememberMe: false,
          grant_type: "password"
        },
        loginRules: {
          account: [{
            required: true,
            trigger: 'blur',
            message: '请填写账户',
          }],
          password: [{
            required: true,
            trigger: 'blur',
            message: '请填写密码',
          }]
        },
        passwordType: 'password',
        capsTooltip: false,
        loading: false,
        showDialog: false,
        redirect: undefined,
        otherQuery: {}
      }
    },
    watch: {
      $route: {
        handler: function (route) {
          const query = route.query
          if (query) {
            this.redirect = query.redirect
            this.otherQuery = this.getOtherQuery(query)
          }
        },
        immediate: true
      }
    },
    created() {

    },
    mounted() {
      // if (this.loginForm.username === '') {
      // 	this.$refs.userName.focus()
      // } else if (this.loginForm.password === '') {
      // 	this.$refs.passWord.focus()
      // }
    },
    destroyed() {

    },
    methods: {
      // isCheckRow(checked){
      //   // this.loginForm.rememberMe = checked
      //   // console.log(this.loginForm)
      // },
      checkCapslock(e) {
        const {
          key
        } = e
        this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
      },
      showPwd() {
        if (this.passwordType === 'password') {
          this.passwordType = ''
        } else {
          this.passwordType = 'password'
        }
        this.$nextTick(() => {
          this.$refs.password.focus()
        })
      },
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = false
            let loginForm = {
              account: this.loginForm.account.trim(),
              password: this.loginForm.password.trim(),
              rememberMe: this.loginForm.rememberMe,
              grant_type: this.loginForm.grant_type.trim(),
            }
            this.$store.dispatch('user/login', loginForm)
              .then((res) => {
                this.loading = false
                window.sessionStorage.setItem("activeMenu", "");
                window.sessionStorage.setItem("pActiveMenu", "首页");
                getRouter().then(res => {
                  if (res.code == 200) {
                    let menuList = res.data.menuList
                    let flag = false
                    menuList.forEach((item, index) => {
                      if (item.href === '/dashboard') {
                        flag = true
                      }
                    })
                    if (flag) {
                      this.$router.push({
                        path: '/'
                      })
                    } else {
                      let path = menuList[0].children[0].href || '/'
                      console.log(path)
                      this.$router.push({
                        path: path
                      })
                    }
                  } else {
                  }
                })
              })
          } else {
            console.log('error submit!!')
            return false
          }
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

<style lang="scss">
  /* 修复input 背景不协调 和光标变色 */
  /* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

  $bg:#283443;
  $light_gray:#000;
  $cursor: #000;

  @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .login-container .el-input input {
      color: $cursor;
    }
  }

  .login-container .el-input input {
    color: #000 !important;
  }

  .inputBox {
    background-color: rgba(0, 0, 0, 0.3);

  }

  .url {
    position: absolute;
    left: 50%;
    bottom: 80px;
    transform: translateX(-50%);
    color: #FFFFFF;
    font-weight: bolder;
  }

  .url:hover {
    color: blue;
  }

  /* reset element-ui css */
  .login-container {
    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;

      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;
      }
    }

    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
      margin-bottom: 40px;
    }
  }

</style>

<style lang="scss" scoped>
  $bg:#2d3a4b;
  $dark_gray:#889aa4;
  $light_gray:#eee;

  .login-bg {
    width: 100vw;
    min-width: 1366px;
    height: 100vh;
    overflow: hidden;
    background-image: url("../../assets/login/bg1.png");
    background-repeat: no-repeat;
    background-position: 50%;
    background-size: cover;
  }

  .login-bg .login-box-wrap {
    position: relative;
    width: 83%;
    height: 76%;
    min-height: 646px;
    background-image: url("../../assets/login-box-bg.png");
    background-size: 100% 100%;
    background-position: 50%;
    margin: 5% auto 0;
    background-repeat: no-repeat;
    position: relative;
  }

  .login-bg .login-box-wrap .login-logo {
    position: absolute;
    margin: 5.8% 0 0 12.8%;
  }

  .login-bg .login-box-wrap .login-logo.lang {
      color: #fff;
      position: absolute;
      top: 0px;
      right: 180px;
      cursor: pointer;
  }

  .login-bg .login-box-wrap .login-logo.img {
    width: 60px;
    height: 60px;
    background-image: url("../../assets/logo-yc.png");
    background-repeat: no-repeat;
    background-size: 60px;
  }

  .login-form-item {
    position: absolute;
    top: 16%;
    right: 16%;
    width: 360px;
    height: 500px;
  }

  .title-container {
    position: relative;

    .titles {
      font-size: 15px;
      color: rgb(25, 126, 220);
      margin: 0px auto 0px auto;
      text-align: center;
      font-weight: bold;
    }

    // .set-language {
    //   color: #fff;
    //   position: absolute;
    //   top: 3px;
    //   font-size: 18px;
    //   right: 0px;
    //   cursor: pointer;
    // }
  }

  // .login-container {
  // 	width: 100%;
  // 	height: 100%;
  // 	// background-image: url("../../assets/login/20230110161727.png");
  // 	background-image: url("../../assets/login/bg.png");
  // 	background-size: cover;
  // 	background-position: center;
  // 	position: absolute;

  // 	.header {
  // 		position: absolute;
  // 		top: 50%;
  // 		left: 80%;
  // 		transform: translate(-80%, -50%);
  // 		display: flex;
  // 	}

  // 	.bgLeftBox {
  // 		position: absolute;
  // 		top: 45%;
  // 		left: 22%;
  // 		transform: translate(-22%, -40%);
  // 	}

  // 	.bgLeft {
  // 		width: 844px;
  // 		height: 512px;
  // 	}

  // 	.bgLeft img {
  // 		width: 100%;
  // 		height: 100%;
  // 	}

  // 	.login-form {
  // 		max-width: 100%;
  // 		padding: 45px;
  // 		margin: 0 auto;
  // 		overflow: hidden;
  // 		background-color: #FFFFFF;
  // 		display: flex;
  // 		justify-content: center;
  // 		align-items: center;
  // 		border-radius: 14px;
  // 	}

  // 	.loginForm {
  // 		width: 320px;
  // 	}

  // 	.borderBg {
  // 		width: 100%;
  // 		height: 1px;
  // 		background-color: #EEEEEE;
  // 	}

  // 	.tips {
  // 		font-size: 14px;
  // 		color: #fff;
  // 		margin-bottom: 10px;

  // 		span {
  // 			&:first-of-type {
  // 				margin-right: 16px;
  // 			}
  // 		}
  // 	}
  .el-input__prefix {
    display: flex !important;
    align-items: center !important;
  }

  .svg-container {
    // padding: 6px 5px 6px 15px;
    color: $dark_gray;
    // vertical-align: middle;
    // width: 30px;
    // display: inline-block;
  }

  // 	.title-container {
  // 		position: relative;

  // 		.title {
  // 			font-size: 26px;
  // 			color: #108FEB;
  // 			margin: 0px auto 40px auto;
  // 			text-align: center;
  // 			font-weight: bold;
  // 		}

  // 		.set-language {
  // 			color: #fff;
  // 			position: absolute;
  // 			top: 3px;
  // 			font-size: 18px;
  // 			right: 0px;
  // 			cursor: pointer;
  // 		}
  // 	}

  // 	.show-pwd {
  // 		position: absolute;
  // 		right: 10px;
  // 		top: 7px;
  // 		font-size: 16px;
  // 		color: $dark_gray;
  // 		cursor: pointer;
  // 		user-select: none;
  // 	}

  // 	.thirdparty-button {
  // 		position: absolute;
  // 		right: 0;
  // 		bottom: 6px;
  // 	}

  // 	@media only screen and (max-width: 470px) {
  // 		.thirdparty-button {
  // 			display: none;
  // 		}
  // 	}
  // }

</style>
