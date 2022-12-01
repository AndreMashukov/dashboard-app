<script>
export default {
  props: {
    isToggle: {type: Boolean, default: false}
  },
  data: () => ({
    timer: null,
  }),
  methods: {
    handleStatus() {
      clearTimeout(this.timer);
      this.timer = setTimeout( () => {
        this.$emit('click');
        this.isClick = false;
      }, 0);
    },
  }
}
</script>

<template>
  <label class="my-switch toggled" @click="handleStatus">
    <input type="checkbox" class="my-switch-input" :value="isToggle">
    <div :class="{'my-switch-core': true, 'my-switch-off': !isToggle, 'my-switch-on': isToggle}">
      <div :class="{'my-switch-button': true, 'toggled': isToggle, 'un-toggle': !isToggle}"/>
    </div>
    <span data-v-25adc6c0="" :class="{'my-switch-label': true, 'my-left': isToggle, 'my-right': !isToggle}" style="line-height: 22px;">
      {{ isToggle ? "on" : "off" }}
    </span>
  </label>
</template>

<style>
.my-switch {
  display: inline-block;
  position: relative;
  vertical-align: middle;
  user-select: none;
  font-size: 10px;
  cursor: pointer;
}
.my-switch .my-switch-input {
  opacity: 0;
  position: absolute;
  width: 1px;
  height: 1px;
  display: none;
}
.my-switch .my-switch-core {
  display: block;
  position: relative;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  transition: border-color .3s,background-color .3s;
  user-select: none;
}
.my-switch .my-switch-core .my-switch-button {
  display: block;
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  border-radius: 100%;
  background-color: #fff;
  z-index: 2;
}
.my-switch .my-switch-label {
  position: absolute;
  top: 0;
  font-weight: 600;
  color: #fff;
  z-index: 1;
}
.my-switch .my-left {
  left: 10px;
}
.my-switch .my-right {
  right: 10px;
}
.my-switch .toggled {
  width: 16px;
  height: 16px;
  transition: transform 300ms ease 0s;
  transform: translate3d(31px, 3px, 0px);
}
.my-switch .un-toggle {
  width: 16px;
  height: 16px;
  transition: transform 300ms ease 0s;
  transform: translate3d(3px, 3px, 0px);
}
.my-switch .my-switch-off {
  width: 50px;
  height: 22px;
  background-color: rgb(191, 203, 217);
  border-radius: 11px;
}
.my-switch .my-switch-on {
  width: 50px;
  height: 22px;
  background-color: rgb(130, 199, 235);
  border-radius: 11px;
}
</style>
