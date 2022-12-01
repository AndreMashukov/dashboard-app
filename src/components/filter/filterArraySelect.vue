<script>
export default {
  name: "dialog-delete",
  props: {
    isOpen: {type: Boolean, required: true, default: false},
    title: {type: String},
    label: {type: String},
    dataItems: [],
    countSelect: {type: Number, default: 1},
  },
  methods: {
    onClose() {
      this.$emit('onClose')
    },
    onSubmit() {
      this.$emit('onSubmit')
    },
  },
}
</script>

<template>
  <b-modal
    :visible="isOpen"
    :title="title"
    title-class="text-black font-18"
    body-class="p-3"
    @hidden="onClose"
    hide-footer
  >
    <div class="col-12">
      <div>
        <label class="col-11">{{ title }}</label>
        <b-button class="col-1" @click="countSelect++;">
          <i class="mdi mdi-plus me-1"></i>
        </b-button>
        <div v-for="num in countSelect" :key="num">
          <select class="form-control">
            <!-- inline object literal -->
            <option :value="null">-- Please select --</option>
            <option v-for="item in dataItems" :key="item._id" :value="item._id">{{ item.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </b-modal>
</template>
