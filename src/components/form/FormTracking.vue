<script>
export default {
  name: "TrackingModal",
  props: ['showModal', 'item'],
  data: () => ({
    isEdit: false,
    dataForm: {
      name: "",
      type: "input",
      options: [""],
      description: "",
    },
    types: [
      "input",
      "radio",
      "checkbox",
    ],
  }),
  beforeUpdate() {
    if(!this.isEdit && this.item.isEdit) {
      this.isEdit = true;
      this.dataForm = {...this.item};
      this.dataForm.options = this.item.options.map(value => value.value)
    }
  },
  methods: {
    handleClosed() {
      this.onReset();
      this.$emit('closed');
    },
    handleSubmit() {
      if (this.dataForm.type === "input") this.dataForm.options = []
      else if (this.dataForm.type === "checkbox") this.dataForm.options = [{index: 1, value: "yes"}, {index: 2, value: "no"}]
      else this.dataForm.options = this.dataForm.options.map((value, index) => ({index: index + 1 , value}))
      const data = {...this.dataForm}
      this.onReset();
      this.$emit("onSubmit", data);
    },
    onReset() {
      this.dataForm = {
        name: "",
        type: "input",
        options: [""],
        description: "",
      }
      this.isEdit = false
    },
    handleOption(index, value) {
      this.dataForm.options[index] = value;
    },
  },
}
</script>

<template>
  <b-modal
    :visible="showModal"
    :title="(dataForm.isEdit ? 'Edit' : 'Add new') + ' Tracking-Topic'"
    title-class="text-black font-18"
    body-class="p-3"
    hide-footer
    @hidden="handleClosed"
  >
    <b-form @submit.prevent="handleSubmit" @reset="onReset" v-if="showModal">
      <div class="mb-3">
        <b-form-group
          id="input-group-1"
          label="Index of topic:"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            v-model="dataForm.index"
            type="number"
            ref="indexTracking"
            placeholder="Default last index"
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          id="input-group-1"
          label="Name: (*required)"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            v-model="dataForm.name"
            ref="nameTracking"
            placeholder="Enter name Tracking topic"
            required
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          id="input-group-2"
          label="Question: (*required)"
          label-for="input-2"
        >
          <b-form-input
            id="input-2"
            v-model="dataForm.question"
            placeholder="Enter question"
            required
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          class="mb-3 form-label"
          id="input-group-3"
          label="Type: (*required)"
          label-for="formrow-inputState"
        >
          <b-form-select
            class="form-select"
            id="formrow-inputState"
            v-model="dataForm.type"
            :options="types"
            type="text"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="mb-3 mb-0" v-if="dataForm.type === 'radio'">
        <div class="row">
          <label class="col-20">Option: (*required)</label>
          <div class="col-4 d-flex justify-content-end">
            <b-button variant="info" @click="dataForm.options.push('');">
              <i class="mdi mdi-plus me-1"></i>
            </b-button>
          </div>
        </div>
        <div v-for="(option, index) in dataForm.options" :key="index">
          <div class="row">
            <div class="col-20">
              <b-form-input
                id="input-1"
                placeholder="Enter option select"
                required
                :value="option"
                @update="(val) => handleOption(index, val)"
              ></b-form-input>
            </div>
            <div class="col-4 d-flex justify-content-end">
              <b-button v-if="dataForm.options.length > 1" variant="warning"
                        @click="dataForm.options.splice(index, 1);">
                <i class="dripicons-minus"></i>
              </b-button>
            </div>
          </div>
        </div>
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
