<script>
export default {
  name: "dialog-delete",
  props: {
    isOpen: {type: Boolean, required: true, default: false},
    title: {type: String},
    label: {type: String},
    dataItems: []
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
        <label>{{ title }}</label>
        <select class="form-control">
          <!-- inline object literal :value=""  @change="" -->
          <option :value="null">-- None --</option>
          <option v-for="item in dataItems" :key="item._id" :value="item._id">{{
              item.name
            }}
          </option>
        </select>
      </div>
    </div>

  </b-modal>
</template>
