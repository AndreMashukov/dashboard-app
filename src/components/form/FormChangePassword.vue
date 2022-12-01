<script>
import {mapActions} from "vuex";

export default {
  name: "Common",
  props: ['showModal', 'title'],
  data: () => ({
    dataForm: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  }),
  methods: {
    ...mapActions('account', ['changePassword','toastError']),
    handleClosed() {
      this.onReset();
      this.$emit('closed');
    },
    onReset() {
      this.dataForm = {
        oldPassword: "",
        password: "",
        confirmPassword: "",
      }
    },
    async handleSubmit() {
      try {
        const data = await this.changePassword(this.dataForm)
        if(data?.validation) return null
        this.onReset();
        this.$emit("onSubmit");
      } catch (e) {
        return null;
      }
    },
  },
}
</script>

<template>
  <b-modal
    :visible="showModal"
    title="Change password"
    title-class="text-black font-18"
    body-class="p-3"
    hide-footer
    @hidden="handleClosed"
  >
    <b-form v-if="showModal">
      <div class="mb-3">
        <b-form-group
          id="input-group-old"
          label="Old Password:"
          label-for="input-1"
        >
          <b-form-input
            id="input-old"
            v-model="dataForm.oldPassword"
            type="password"
            placeholder="Enter old password"
            required
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          id="input-group-new"
          label="New Password:"
          label-for="input-1"
        >
          <b-form-input
            id="input-new"
            v-model="dataForm.password"
            type="password"
            placeholder="Enter new password"
            required
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          id="input-group-confirm"
          label="Confirm Password:"
          label-for="input-1"
        >
          <b-form-input
            id="input-confirm"
            v-model="dataForm.confirmPassword"
            type="password"
            placeholder="Enter confirm new password"
            required
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3 mb-0 justify-content-end d-flex">
        <div>
          <button type="button" class="btn btn-primary" @click="handleSubmit">Submit</button>
          <button class="btn btn-secondary ms-1" @click="handleClosed">
            Cancel
          </button>
        </div>
      </div>
    </b-form>
  </b-modal>
</template>
