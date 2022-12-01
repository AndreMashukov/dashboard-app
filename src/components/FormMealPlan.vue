<script>
import moment from "moment";

export default {
  name: "Common",
  props: ['showModal', 'title', 'meals', 'recipes', 'dietaries'],
  data: () => ({
    reset: false,
    dataForm: {
      name: "",
      status: "1",
      dietary: {},
      data: [],
    },
    theWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    listStatus: ['0', '1'],
    isEdit: false,
  }),
  beforeUpdate() {
    if(this.reset) this.onReset();
    // if(!this.isEdit && this.item.isEdit) {
    //   this.isEdit = true;
    //   this.dataForm = {...this.item};
    // }
    if(this.dataForm.data.length === 0) {
      this.dataForm.dietary = this.dietaries[0];
      const menuFood = {meal: this.meals[0], recipe: this.recipes[0]};
      const week = this.theWeek.map(value => ({day: value, menuFood: [{...menuFood}]}));
      this.dataForm.data.push(...week);
    }
  },
  methods: {
    handleClosed() {
      this.reset = true;
      this.$emit('closed');
    },
    handleSubmit() {
      if(!this.isEdit) {
        this.reset = true;
        this.$emit('closed');
      }
      let day = moment().clone().weekday(1);
      const data = this.dataForm.data.map((value, index) => ({
          ...value,
          menuFood: value.menuFood.map(val => ({
            date: day.add(index, 'day').format('YYYY-MM-DD'),
            swap: true,
            mealId: val.meal._id,
            recipe: val.recipe._id,
          }))
        })
      )
      this.dataForm.dietaryId = this.dataForm.dietary._id;
      const mealPlan = {...this.dataForm, data};
      this.reset = true;
      return this.$emit("onSubmit", mealPlan);
    },
    onReset() {
      this.dataForm = {
        name: "",
        status: "1",
        dietary: {},
        data: [],
      };
      this.theWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      this.listStatus = ['0', '1'];
      this.isEdit = false
      this.reset = false
    },
    addWeek() {
      const menuFood = {meal: this.meals[0], recipe: this.recipes[0]};
      const week = this.theWeek.map(value => ({day: value, menuFood: [{...menuFood}]}));
      this.dataForm.data.push(...week);
    },
    handleQuestion(index, value) {
      this.dataForm.questions[index].question = value;
    },
    addMenuFood(index) {
      const menuFood = {meal: this.meals[0], recipe: this.recipes[0]};
      this.dataForm.data[index].menuFood.push({...menuFood});
    },
  },
}
</script>

<template>
  <b-modal
    v-model="showModal"
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
          label="Type:"
          label-for="formrow-inputState"
        >
          <b-form-select
            class="form-select"
            id="formrow-inputState"
            v-model="dataForm.status"
            :options="listStatus"
            type="text"
          ></b-form-select>
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
            :value="dataForm.dietary._id"
            :options="dietaries"
            text-field="name"
            value-field="_id"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="mb-3 mb-0">
        <div class="row">
          <label class="col-10">Data: (*required)</label>
          <div class="col-2 d-flex justify-content-end">
            <b-button variant="info" @click="addWeek">
              <i class="mdi mdi-plus me-1"></i>
            </b-button>
          </div>
        </div>
        <div v-for="(item, index) in dataForm.data" :key="index">
          <div class="row">
            <div class="col-8">
              <h3><b-badge variant="secondary">{{ item.day }}</b-badge></h3>
            </div>
            <div class="col-2 d-flex justify-content-end">
              <b-button variant="info" @click="() => addMenuFood(index)">
                <i class="mdi mdi-plus me-1"></i>
              </b-button>
            </div>
            <div v-if="index % 7 === 0" class="col-2 d-flex justify-content-end">
              <b-button v-if="dataForm.data.length/7 > 1" variant="warning"
                        @click="dataForm.data.splice(index, 7);">
                <i class="dripicons-minus"></i>
              </b-button>
            </div>
          </div>
          <div class="row m-0">
            <div class="col-4 p-0" style="padding-left: calc(var(--bs-gutter-x) * 0.5) !important;">
              Meal:
            </div>
            <div class="col-4 p-0" style="padding-left: calc(var(--bs-gutter-x) * 0.5) !important;">
              Recipe:
            </div>
          </div>
          <div v-for="(menu, idx) in item.menuFood" :key="idx">
            <div class="row">
              <div class="col-4 p-2">
                    <b-form-select
                      class="form-select"
                      :value="menu.meal._id"
                      :options="meals"
                      text-field="name"
                      value-field="_id"
                    ></b-form-select>
              </div>
              <div class="col-6 p-2">
                    <b-form-select
                      class="form-select"
                      :value="menu.recipe._id"
                      :options="recipes"
                      text-field="name"
                      value-field="_id"
                    ></b-form-select>
              </div>
              <div class="col-2 d-flex justify-content-end p-2">
                <b-button v-if="item.menuFood.length > 1" variant="warning"
                          @click="item.menuFood.splice(idx, 1);">
                  <i class="dripicons-minus"></i>
                </b-button>
              </div>
            </div>
          </div>
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

<style>
.badge-secondary {
  color: #fff;
  background-color: #6c757d;
}
</style>
