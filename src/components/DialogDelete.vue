<script>
export default {
  name: "dialog-delete",
  props: {
    isOpen: {type: Boolean, required: true, default: false},
    title: {type: String},
    label: {type: String},
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
    @ok="onSubmit"
  >
    <label> You sure delete : <b>{{ label }}</b></label>
  </b-modal>
</template>
