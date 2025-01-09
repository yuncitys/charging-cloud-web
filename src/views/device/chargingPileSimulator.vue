<template>
  <div>
    <!-- 顶部选项卡 -->
    <el-tabs v-model="activeMainTab" type="card" @tab-click="handleMainTabClick">
      <el-tab-pane label="充电桩" name="chargingPile"></el-tab-pane>
      <el-tab-pane label="充电枪1" name="gun1"></el-tab-pane>
      <el-tab-pane label="充电枪2" name="gun2"></el-tab-pane>
      <el-tab-pane label="连接设置" name="connection"></el-tab-pane>
    </el-tabs>

    <el-row :gutter="20">
      <!-- 主内容区域 -->
      <el-col :span="16">
        <!--连接设置选项卡-->
        <div v-if="activeMainTab === 'connection'">
          <el-col :span="16">
            <el-card>
              <h3>连接设置</h3>
              <el-form ref="form" :model="form" label-width="150px">
                <!-- OCPP Server -->
                <el-form-item label="ChargePoint Server">
                  <el-input v-model="form.chargePointServer"></el-input>
                </el-form-item>

                <!-- ChargePoint ID -->
                <el-form-item label="ChargePoint ID">
                  <el-input v-model="form.chargePointId"></el-input>
                </el-form-item>

                <!-- OCPP Version -->
                <el-form-item label="ChargePoint Model">
                  <el-select v-model="form.chargePointModel" placeholder="请选择">
                    <el-option label="Direct Current" value="0"></el-option>
                    <el-option label="Alternating Current" value="1"></el-option>
                  </el-select>
                </el-form-item>

                <!-- Charge Point Version -->
                <el-form-item label="ChargePoint Version">
                  <el-input v-model="form.chargePointVersion"></el-input>
                </el-form-item>

                <!-- Firmware Version -->
                <el-form-item label="Firmware Version">
                  <el-input v-model="form.firmwareVersion"></el-input>
                </el-form-item>

                <!-- Charge Point Vendor -->
                <!-- <el-form-item label="ChargePoint Vendor">
                  <el-input v-model="form.chargePointVendor"></el-input>
                </el-form-item> -->

                <!-- RFID Tag -->
                <!-- <el-form-item label="RFID Tag">
                  <el-input v-model="form.rfidTag"></el-input>
                </el-form-item> -->

                <!-- ICC Id -->
                <!-- <el-form-item label="ICC Id">
                  <el-input v-model="form.iccId"></el-input>
                </el-form-item> -->

                <!-- Meter Type -->
                <!-- <el-form-item label="Meter Type">
                  <el-input v-model="form.meterType"></el-input>
                </el-form-item> -->

                <!-- Meter Serial Number -->
                <!-- <el-form-item label="Meter Serial Number">
                  <el-input v-model="form.meterSerialNumber"></el-input>
                </el-form-item> -->

                <!-- Vendor Id -->
                <!-- <el-form-item label="Vendor Id">
                  <el-input v-model="form.vendorId"></el-input>
                </el-form-item> -->

                <!-- Reservation Id -->
                <!-- <el-form-item label="Reservation Id">
                  <el-input v-model="form.reservationId"></el-input>
                </el-form-item> -->

                <!-- 保存按钮 -->
                <el-form-item>
                  <el-button type="primary" @click="saveForm">Save</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </div>

        <!--充电桩选项卡-->
        <div v-if="activeMainTab === 'chargingPile'">
          <!-- 充电桩选项卡内容 -->
          <el-col :span="16">
            <el-card>
              <el-form label-width="180px">
                <!-- Server Status -->
                <el-form-item label="Server Status:">
                  <span :style="{ color: serverConnected ? 'green' : 'red' }">
                    {{ serverConnected ? "Connected" : "Disconnected" }}
                  </span>
                </el-form-item>

                <!-- Charge Point Availability -->
                <el-form-item label="Charge Point Availability:">
                  <el-select v-model="chargePointAvailability" placeholder="Select">
                    <el-option
                      v-for="item in availabilityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- Charge Point Status -->
                <el-form-item label="Charge Point Status:">
                  <el-select v-model="chargePointStatus" placeholder="Select">
                    <el-option
                      v-for="item in statusOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- Meter Value -->
                <el-form-item label="Meter value -> SampledValue:">
                  <el-input-number
                    v-model="meterValue"
                    :min="0"
                    :max="100"
                    label="Meter Value"
                  ></el-input-number>
                </el-form-item>

                <!-- SampledValue -> Context -->
                <el-form-item label="SampledValue -> Context:">
                  <el-select v-model="sampledContext" placeholder="Select">
                    <el-option
                      v-for="item in contextOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- SampledValue -> Measurand -->
                <el-form-item label="SampledValue -> Measurand:">
                  <el-select v-model="sampledMeasurand" placeholder="Select">
                    <el-option
                      v-for="item in measurandOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <!-- 连接按钮 -->
                <el-form-item>
                  <el-button
                    :type="serverConnected ? 'success' : 'primary'"
                    @click="toggleConnection"
                  >
                    {{ serverConnected ? "Connected" : "Connect" }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </div>

        <!-- 其他选项卡内容 -->
        <!-- <div v-else>
          <el-card>
            <h3>{{ activeMainTab }} 的内容</h3>
            <p>该选项卡的详细功能待补充。</p>
          </el-card>
        </div> -->

        <!-- 右侧日志-->
        <div><!-- top: 60px; height: calc(100vh - 80px)-->
          <el-col :span="16" style="position: fixed; right: 20px; width: 48%;">
            <el-card style="height: 100%;">
              <el-tabs v-model="activeLogTab">
                <el-tab-pane label="交互日志" name="interaction">
                  <div class="log-content">
                    <p>交互日志显示区域。</p>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="清空日志" name="clear">
                  <div class="log-content">
                    <p>日志已清空。</p>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </el-col>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeMainTab: "connection", // 主选项卡默认显示连接设置
      activeLogTab: "interaction", // 日志选项卡默认显示交互日志
      form: {
        chargePointServer: "tcp://127.0.0.1:9000",
        chargePointId: "24102413849856",
        chargePointModel: "0",
        chargePointVersion: "J1.9M107",
        firmwareVersion: "0.9.87",
        chargePointVendor: "Elmo",
        rfidTag: "DEADBEEF",
        iccId: "",
        meterType: "ELM NQC-ACDC",
        meterSerialNumber: "elm.001.13.1.0",
        vendorId: "vendorId",
        reservationId: "10110",
      },

      serverConnected: false, // 模拟服务器连接状态
      chargePointAvailability: "Operative",
      chargePointStatus: "",
      meterValue: 30,
      sampledContext: "Sample.Periodic",
      sampledMeasurand: "Current.Import",
      availabilityOptions: [
        { label: "Operative", value: "Operative" },
        { label: "Inoperative", value: "Inoperative" },
      ],
      statusOptions: [
        { label: "Available", value: "Available" },
        { label: "Occupied", value: "Occupied" },
        { label: "Faulted", value: "Faulted" },
      ],
      contextOptions: [
        { label: "Sample.Periodic", value: "Sample.Periodic" },
        { label: "Sample.Event", value: "Sample.Event" },
      ],
      measurandOptions: [
        { label: "Current.Import", value: "Current.Import" },
        { label: "Energy.Export", value: "Energy.Export" },
      ],
    };
  },
  methods: {
    handleMainTabClick(tab) {
      console.log("切换到选项卡:", tab.name);
    },
    saveForm() {
      console.log("表单数据:", this.form);
    },
    toggleConnection() {
      this.serverConnected = !this.serverConnected;
    },
    incrementValue() {
      this.meterValue += 1;
    },
  },
};
</script>

<style scoped>
  /* 日志内容样式 */
  .log-content {
    width: 100%; /* 宽度适配父容器 */
    height: 540px; /* 高度占满父容器 */
    overflow-y: auto; /* 滚动条支持 */
    padding: 10px;
    background-color: #f5f5f5;
    border: 1px solid #dcdfe6;
    border-radius: 5px;
  }

  /* el-card 样式 */
  .el-card {
    display: flex;
    flex-direction: column;
  }
</style>
