<script>
import {mapActions} from "vuex";

export default {
  props: {
    items: {type: Array},
    fieldImage: {
      type: String,
      default: "thumbnail",
    },
    fieldText: {
      type: String,
      default: "name",
    },
  },
  data: () => ({
    search: "",
    showDrop: false,
    maxSize: 10240,
  }),
  methods: {
    ...mapActions('alert', ['error']),
    dropOutSide() {
      this.showDrop = false;
    },
    inputFocus() {
      this.showDrop = true;
    },
    onSearchItem(event) {
      this.$emit("onSearch", event.target.value)
    },
    selectItem(item) {
      this.showDrop = false;
      this.$emit("selectItem", item)
    },
    launchFilePicker(){
      this.$refs.fileImage.click();
    },
    onFileChange(file) {
      const { maxSize } = this
      let imageFile = file[0]
      if (file.length > 0) {
        let size = imageFile.size / maxSize / maxSize
        if (!imageFile.type.match('image.*')) {
          this.error('Please choose an image file')
        } else if (size > 1) {
          this.error('Your file is too big! Please select an image under 10MB')
        } else {
          let imageURL = URL.createObjectURL(imageFile)
          const item = {}
          item[`${this.fieldImage}`] = imageURL
          item[`${this.fieldText}`] = imageFile.name
          item.file = imageFile;
          item.isUploadFile = true;
          item._id = Date.now();
          this.$emit('selectItem', item);
        }
      }
    }
  }
}
</script>

<template>
  <div v-click-outside="dropOutSide" style="position: relative;">
    <div class="input-group">
      <input
        v-model="search"
        type="text"
        class="form-control"
        placeholder="Search image"
        @click="inputFocus"
        ref="searchImage"
        id="inputGroupFile03"
        aria-describedby="inputGroupFileAddon03"
        v-on:input="onSearchItem"
        autocomplete="off"
      />
      <button
        class="btn btn-primary"
        type="button"
        id="inputGroupFileAddon03"
        @click="launchFilePicker"
      >
        Upload
      </button>
    </div>
    <input
      accept="image/png, image/jpeg"
      type="file"
      ref="fileImage"
      @change="onFileChange($event.target.files)"
      style="display:none"
    >
    <ul role="menu" tabindex="-1"
        :class="{
          'dropdown-menu': true,
          'show': showDrop === true,
          'my-drop-custom': showDrop === true,
        }"
        x-placement="bottom-start"
    >
      <li
        v-for="item in items"
        :key="item._id"
        role="presentation"
        class="d-flex align-items-center"
        @click="selectItem(item)"
      >
        <a role="menuitem" href="#" target="_self" class="dropdown-item d-flex">
          <div class="col-sm-6 p-2"><img
            :src="item[`${fieldImage}`]"
            :alt="item[`${fieldText}`]" height="40"></div>
          <div class="col-sm-18 p-2"><h6 class="my-text-wrap" style="margin-bottom: 0">{{ item[`${fieldText}`] }}</h6></div>
        </a>
      </li>
    </ul>
  </div>
</template>

<style>
.my-drop-custom {
  position: absolute;
  will-change: transform;
  top: 0px !important;
  left: 0px;
  transform: translate3d(0px, 54px, 0px);
  min-width: 90% !important;
}
.my-text-wrap {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre-wrap;
}
</style>
