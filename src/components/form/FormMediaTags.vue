<script>
import {cloneDeep} from "lodash";

export default {
  name: "Common",
  props: ['showModal', 'item', 'title', 'listTopic', 'listCategory'],
  data: () => ({
    isEdit: false,
    isLoader: false,
    dataForm: {
      name: "",
      category: {},
      topic: {},
      description: "",
    },
    topics: [],
    categories: [],
  }),
  beforeUpdate() {
    if(!this.showModal) {
      this.isLoader = false;
      return;
    }
    const ser = {_id: null, name: '-- Please select --'}
    if(!this.isEdit && this.item.isEdit) {
      this.isEdit = true;
      this.dataForm = cloneDeep(this.item);
      if(!this.item.category)
        this.dataForm.category = {...ser}
      if(!this.item.topic)
        this.dataForm.topic = {...ser}
      if(this.item.category && this.item.category._id) {
        this.topics = this.listTopic.filter(val => val.categoryId === this.item.category._id);
        this.topics.unshift({...ser});
      }
      if(this.item.topic && this.item.topic._id){
        const idx = this.topics.findIndex(val => val._id === this.item.topic._id)
        if(idx === -1) this.dataForm.topic = {...ser}
      }
    }
    if(!this.dataForm.category.name && !this.item.isEdit)
      this.dataForm.category = {...ser}
    if(!this.dataForm.topic.name && !this.item.isEdit)
      this.dataForm.topic = {...ser}
    if(!this.isLoader && this.topics.length === 0) {
      this.topics = cloneDeep(this.listTopic);
      this.topics.unshift({...ser});
    }
    if(!this.isLoader && this.categories.length === 0) {
      this.categories = cloneDeep(this.listCategory);
      this.categories.unshift({...ser});
    }
    if(!this.isLoader) this.isLoader = true;
  },
  methods: {
    handleClosed() {
      this.onReset();
      this.$emit('closed');
    },
    handleSubmit() {
      const data = {...this.dataForm}
      data.categoryId = this.dataForm.category._id
      data.topicId = this.dataForm.topic._id
      this.onReset();
      this.$emit("onSubmit", data);
    },
    onReset() {
      this.dataForm = {
        name: "",
        category: {},
        topic: {},
        description: "",
      };
      this.isEdit = false
      this.topics = [];
      this.categories = [];
    },
    handleCategory(id) {
      const ser = {_id: null, name: '-- Please select --'}
      const idx = this.categories.findIndex(value => value._id === id)
      if(idx > -1) this.dataForm.category = this.categories[idx];
      if(this.categories[idx]._id && this.categories[idx]._id !== this.dataForm.topic.categoryId) {
        this.topics = this.listTopic.filter(val => val.categoryId === this.categories[idx]._id);
        this.topics.unshift({...ser});
        this.dataForm.topic = {...ser};
      }
      if(!this.categories[idx]._id) {
        this.topics = cloneDeep(this.listTopic);
        this.topics.unshift({...ser});
      }
    },
    handleTopic(id) {
      const idx = this.topics.findIndex(val => val._id === id);
      if(idx > -1) this.dataForm.topic = this.topics[idx];
    }
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
          label="Category:"
          label-for="formrow-inputState"
        >
          <b-form-select
            class="form-select"
            :value="dataForm.category._id"
            :options="categories"
            text-field="name"
            value-field="_id"
            @input="handleCategory"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="col-24 mb-2">
        <b-form-group
          label="Topic:"
        >
          <b-form-select
            class="form-select"
            :value="dataForm.topic._id"
            :options="topics"
            text-field="name"
            value-field="_id"
            @change="handleTopic"
          ></b-form-select>
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
