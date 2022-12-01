<script>
export default {
  name: "dialog-delete",
  props: {
    isOpen: {type: Boolean, required: true, default: false},
    title: {type: String},
    label: {type: String},
    searchTxt: {type: String}
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
        <input
          id="filterText"
          v-model="searchTxt"
          type="text"
          class="form-control"
          placeholder="search text"
        />
      </div>
    </div>
  </b-modal>
</template>
