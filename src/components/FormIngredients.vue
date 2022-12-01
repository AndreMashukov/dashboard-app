<script>
export default {
  name: "Ingredients",
  props: ['showModal', 'item', 'categories'],
  data: () => ({
    isEdit: false,
    dataForm: {
      name: "",
      type: "normal",
      unit: "",
      category: {},
    },
    types: [
      "normal",
      "toServe",
    ],
  }),
  beforeUpdate() {
    if(!this.dataForm.category.name && !this.isEdit)
      this.dataForm.category = this.categories[0]
    if(!this.isEdit && this.item.isEdit) {
      this.isEdit = true;
      this.dataForm = {...this.item};
    }
  },
  methods: {
    handleClosed() {
      this.onReset();
      this.$emit('closed');
    },
    handleSubmit() {
      const data = {...this.dataForm}
      data.categoryId = data.category._id
      this.onReset();
      this.$emit("onSubmit", data);
    },
    onReset() {
      this.dataForm = {
        name: "",
        type: "normal",
        unit: "",
        category: {},
      };
      this.isEdit = false
    },
    changeCategory(id) {
      const idx = this.categories.findIndex(value => value._id === id)
      if(idx > -1) this.dataForm.category = this.categories[idx];
    }
  },
}
</script>

<template>
  <b-modal
    v-model="showModal"
    :title="(dataForm.isEdit ? 'Edit' : 'Add new') + ' Ingredients'"
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
            placeholder="Enter name Ingredients"
            required
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          class="mb-3 form-label"
          id="input-group-2"
          label="Type:"
          label-for="formrow-inputState"
        >
          <b-form-select
            class="form-select"
            v-model="dataForm.type"
            :options="types"
            type="text"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          id="input-group-3"
          label="Unit:"
          label-for="input-3"
        >
          <b-form-input
            id="input-3"
            v-model="dataForm.unit"
            placeholder="Enter unit of ingredients"
            required
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="mb-3">
        <b-form-group
          class="mb-3 form-label"
          id="input-group-4"
          label="Type:"
          label-for="formrow-inputState"
        >
          <b-form-select
            class="form-select"
            :value="dataForm.category._id"
            :options="categories"
            text-field="name"
            value-field="_id"
            @input="changeCategory"
          ></b-form-select>
        </b-form-group>
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
