<script>

export default {
  props: {
    isOpen: {type: Boolean, default: false},
    typeTab: {type: String, default: 'survey'}
  },
  beforeUpdate() {
    if(this.typeTab !== this.type) this.onReset();
  },
  data: () => ({
    type: 'survey',
    dataForm: {
      name: '',
      email: '',
    },
  }),
  methods: {
    clearDatePicker() {
      this.dataForm.dateRange = [];
    },
    handleSubmit() {
      const {name, email} = this.dataForm;
      this.$emit("onSubmit", {name, email})
    },
    handleClosed() {
      this.$emit("onClosed")
    },
    onReset() {
      this.type = this.typeTab;
      this.dataForm = {
        name: '',
        email: '',
      }
    }
  }
}
</script>
<template>
  <b-modal
    :visible="isOpen"
    title="filter survey"
    title-class="text-black font-18"
    body-class="p-3"
    hide-footer
    @hidden="handleClosed"
  >
    <form @submit.prevent="handleSubmit">
      <div class="col-24 mb-2">
        <div>
          <label>Filter name:</label>
          <input
            type="text"
            class="form-control"
            placeholder="Insert name survey"
            v-model="dataForm.name"
          />
        </div>
      </div>
      <div v-if="typeTab !== 'survey'" class="col-24 mb-2">
        <div>
          <label>Filter Email:</label>
          <input
            type="text"
            class="form-control"
            placeholder="Insert email"
            v-model="dataForm.email"
          />
        </div>
      </div>
      <div class="text-end mt-3">
        <b-button variant="light" @click="handleClosed">Close</b-button>
        <b-button type="submit" variant="success" class="ms-1">Submit</b-button>
      </div>
    </form>
  </b-modal>
</template>
