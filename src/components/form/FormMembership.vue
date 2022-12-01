<script>
export default {
  name: "Common",
  props: ['showModal', 'item', 'title', 'membershipType'],
  data: () => ({
    isEdit: false,
    dataForm: {
      name: "",
      type: "month",
      time: "",
      price: "",
      description: "",
      typeMembershipId: null,
      start: null,
      end: null
    },
    types: [
      "day",
      "week",
      "month",
      "year",
    ],
  }),
  beforeUpdate() {
    if (!this.isEdit && this.item.isEdit) {
      this.isEdit = true;
      this.dataForm = {...this.item};
    }
    if (!this.dataForm.typeMembershipId)
      this.dataForm.typeMembershipId = this.membershipType[0]._id
  },
  methods: {
    handleClosed() {
      this.onReset();
      this.$emit('closed');
    },
    handleSubmit() {
      const data = {...this.dataForm}
      this.onReset();
      this.$emit("onSubmit", data);
    },
    onReset() {
      this.dataForm = {
        name: "",
        type: "month",
        time: "",
        price: "",
        description: "",
        start: null,
        end: null
      };
      this.isEdit = false
    },
  },
}
</script>

<template>
  <b-modal
    :visible="showModal"
    :title="(dataForm.isEdit ? 'Edit' : 'Add new') + ' ' + title"
    title-class="text-black font-18"
    body-class="p-3"
    hide-footer
    @hidden="handleClosed"
  >

    <b-form @submit.prevent="handleSubmit" @reset="onReset" v-if="showModal">
      <div class="mb-3">
        <b-form-group
          id="input-group-1"
          label="Name:"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            v-model="dataForm.name"
            placeholder="Enter name"
            required
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          class="mb-3 form-label"
          id="input-group-2"
          label="Format time:"
          label-for="formrow-inputState"
        >
          <b-form-select
            :disabled="isEdit"
            class="form-select"
            id="formrow-inputState"
            v-model="dataForm.type"
            :options="types"
            type="text"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          id="input-group-3"
          label="Time (Maximum 1 year, 12 months, or 52 weeks): "
          label-for="input-3"
        >
          <b-form-input
            id="input-3"
            :disabled="isEdit"
            v-model="dataForm.time"
            placeholder="Enter time"
            required
            type="number"
            min="0"
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          id="input-group-4"
          label="Price:"
          label-for="input-4"
        >
          <b-form-input
            id="input-4"
            :disabled="isEdit"
            v-model="dataForm.price"
            placeholder="Enter price"
            required
            type="float"
            min="0"
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          id="input-group-14"
          label="Membership type:"
          label-for="input-14"
        >
          <b-form-select
            class="form-select"
            id="formrow-memberType"
            v-model="dataForm.typeMembershipId"
            :options="membershipType"
            text-field="name"
            value-field="_id"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          id="input-group-4"
          label="Amount Of Saving:"
          label-for="input-4"
        >
          <b-form-input
            id="input-4"
            v-model="dataForm.amountOfSaving"
            placeholder="Enter amountOfSaving"
            required
            type="float"
            min="0"
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <label>Description:</label>
        <textarea
          id="dataFormDescription"
          class="form-control"
          :maxlength="225"
          rows="3"
          placeholder="This description has a limit of 225 chars."
          v-model="dataForm.description"
        ></textarea>
        <div class="text-center">
          <p
            v-if="dataForm.description"
            class="badge position-absolute"
            :class="{
              'bg-success': dataForm.description.length !== 225,
               'bg-danger': dataForm.description.length === 225
            }"
          >
            {{ dataForm.description.length }} /
            225
          </p>
        </div>
      </div>
      <div class="mb-3 mb-0 justify-content-end d-flex">
        <div>
          <button type="submit" class="btn btn-primary">Submit</button>
          <button class="btn btn-secondary ms-1" @click="handleClosed">
            Cancel
          </button>
        </div>
      </div>
    </b-form>
  </b-modal>
</template>
