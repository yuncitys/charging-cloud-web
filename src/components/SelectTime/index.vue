<template>
  <div class="select-container">
    <el-select v-model="st_value" :clearable="true" @focus="selectFouce(0)" @change="onSelectedTime(0)" placeholder="请选择开始时间">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.label"
        :disabled="item.disabled"
      >
      </el-option>
    </el-select>
    <div class="time-interval">至</div>
    <el-select :clearable="true" v-model="en_value" @focus="selectFouce(1)"  @change="onSelectedTime(1)" placeholder="请选择结束时间">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.label"
        :disabled="item.disabled"
      >
      </el-option>
    </el-select>
  </div>

</template>
<script>
export default {
  name: 'selectTIme',
  props: ['disabledItems','stTime','enTime','itemIndex'],
  data() {
    return {
      st_value:'',
      en_value:'',
      parentIndex:'',
      option: [{
        value: 0,
        label: '00:00'
      }, {
        value: 1,
        label: '00:30',
      }, {
        value: 2,
        label: '01:00'
      }, {
        value: 3,
        label: '01:30'
      }, {
        value: 4,
        label: '02:00'
      }, {
        value: 5,
        label: '02:30'
      }, {
        value: 6,
        label: '03:00'
      }, {
        value: 7,
        label: '03:30'
      }, {
        value: 8,
        label: '04:00'
      }, {
        value: 9,
        label: '04:30'
      }, {
        value: 10,
        label: '05:00'
      }, {
        value: 11,
        label: '05:30'
      }, {
        value: 12,
        label: '06:00'
      }, {
        value: 13,
        label: '06:30'
      }, {
        value: 14,
        label: '07:00'
      }, {
        value: 15,
        label: '07:30'
      }, {
        value: 16,
        label: '08:00'
      }, {
        value: 17,
        label: '08:30'
      }, {
        value: 18,
        label: '09:00'
      }, {
        value: 19,
        label: '09:30'
      }, {
        value: 20,
        label: '10:00'
      }, {
        value: 21,
        label: '10:30'
      }, {
        value: 22,
        label: '11:00'
      }, {
        value: 23,
        label: '11:30'
      }, {
        value: 24,
        label: '12:00'
      },{
        value: 25,
        label: '12:30'
      }, {
        value: 26,
        label: '13:00',
      }, {
        value: 27,
        label: '13:30'
      }, {
        value: 28,
        label: '14:00'
      }, {
        value: 29,
        label: '14:30'
      }, {
        value: 30,
        label: '15:00'
      }, {
        value: 31,
        label: '15:30'
      }, {
        value: 32,
        label: '16:00'
      }, {
        value: 33,
        label: '16:30'
      }, {
        value: 34,
        label: '17:00'
      }, {
        value: 35,
        label: '17:30'
      }, {
        value: 36,
        label: '18:00'
      }, {
        value: 37,
        label: '18:30'
      }, {
        value: 38,
        label: '19:00'
      }, {
        value: 39,
        label: '19:30'
      }, {
        value: 40,
        label: '20:00'
      }, {
        value: 41,
        label: '20:30'
      }, {
        value: 42,
        label: '21:00'
      }, {
        value: 43,
        label: '21:30'
      }, {
        value: 44,
        label: '22:00'
      }, {
        value: 45,
        label: '22:30'
      }, {
        value: 46,
        label: '23:00'
      }, {
        value: 47,
        label: '23:30'
      }, {
        value: 48,
        label: '24:00'
      }]
    }
  },
  watch:{
    stTime(news,old){
      this.st_value = news
    },
    enTime(news,old){
      this.en_value = news
    },
    itemIndex(news,old){
      this.parentIndex = news
    }
  },
  mounted(){
    this.st_value = this.stTime
    this.en_value = this.enTime,
      this.parentIndex = this.itemIndex
  },
  computed: {
    options() {
      if(!this.disabledItems){
        return this.option
      }

      var options = []
      this.option.forEach((item, index) => {
        delete item.disabled
        this.disabledItems.forEach((_item, _index) => {
          if (_item == item.label) {
            item.disabled = true
          }
        })
        options.push(item)
      })
      return options
    }
  }
  , methods: {
    selectFouce(value){
      let data = {itemIndex:this.parentIndex,selecterIndex:value}
      this.$emit('selectFouce',data)
    },
    onSelectedTime(value){
      var data ={st_time:this.st_value,en_time:this.en_value,itemIndex:this.parentIndex,selecterIndex:value}
      this.$emit('onSelectedTime',data)
    }
  }
}
</script>
<style lang="scss">
.select-container{
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.time-interval{
  display: inline-block;
  padding: 10px;
}
</style>
