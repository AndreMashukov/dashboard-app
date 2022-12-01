<script>
import Drawer from "vue-simple-drawer";
import {cloneDeep} from "lodash";

export default {
  name: "Common",
  props: ['item', 'showModal', 'title', 'meals', 'recipes', 'dietaries'],
  components: {Drawer},
  data: () => ({
    dataForm: {
      name: "",
      numberOfSnack: 1,
      dietary: {},
      data: [],
    },
    theWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    listStatus: [0, 1, 2, 3, 4, 5],
    isEdit: false,
    listRecipes: [],
  }),
  beforeUpdate() {
    const ser = {_id: null, name: '-- Please select --'}
    if (this.showModal && this.listRecipes.length === 0) {
      this.listRecipes = cloneDeep(this.recipes);
      this.listRecipes.unshift({...ser});
    }
    if (this.showModal && !this.isEdit && this.item.isEdit) {
      this.isEdit = true;
      this.dataForm = cloneDeep(this.item);
      for (let val of this.dataForm.data) {
        for (let menu of val.menuFood) {
          if (!menu.meal) menu.meal = this.meals[0];
          if (!menu.recipe) menu.recipe = this.listRecipes[0];
        }
      }
    }
    if (this.showModal && this.dataForm.data.length === 0) {
      this.dataForm.dietary = this.dietaries[0];
      const menuFood = {meal: this.meals[0], recipe: this.listRecipes[0]};
      const week = this.theWeek.map(value => ({day: value, menuFood: [{...menuFood}]}));
      this.dataForm.data.push(...week);
    }
  },
  methods: {
    handleClosed() {
      this.onReset();
      this.$emit('closed');
    },
    handleSubmit() {
      const data = this.dataForm.data.map((value) => ({
        ...value,
        menuFood: value.menuFood.map(val => {
          const mf = {
            _id: val._id,
            swap: false,
            mealId: val.meal._id,
          };
          if (val.recipe._id) mf.recipe = val.recipe._id;
          return mf;
        })
      }))
      const mealPlan = {
        name: this.dataForm.name,
        description: this.dataForm.description,
        numberOfSnack: this.dataForm.numberOfSnack,
        dietaryId: this.dataForm.dietary._id,
        data,
      };
      if (this.isEdit) {
        mealPlan._id = this.dataForm._id;
        mealPlan.isEdit = this.isEdit;
      }
      this.onReset();
      this.$emit("onSubmit", mealPlan);
    },
    onReset() {
      this.dataForm = {
        name: "",
        status: "1",
        dietary: {},
        data: [],
      };
      this.isEdit = false
    },
    handleDietary(event) {
      const idx = this.dietaries.findIndex(value => value._id === event);
      this.dataForm.dietary = this.dietaries[idx];
    },
    addWeek() {
      const menuFood = {meal: this.meals[0], recipe: this.listRecipes[0]};
      const week = this.theWeek.map(value => ({day: value, menuFood: [{...menuFood}]}));
      this.dataForm.data.push(...week);
    },
    addMenuFood(index) {
      const menuFood = {meal: this.meals[0], recipe: this.listRecipes[0]};
      this.dataForm.data[index].menuFood.push({...menuFood});
    },
    handleMeal(event, idxData, idxMenu) {
      const idx = this.meals.findIndex(value => value._id === event);
      if (idx > -1 && this.isEdit && this.dataForm.data[idxData].menuFood[idxMenu]._id) {
        let isLoop = this.checkLoop(idxData, idxMenu);
        if (isLoop) this.dataForm.data[idxData].menuFood[idxMenu]._id = null;
      }
      this.dataForm.data[idxData].menuFood[idxMenu].meal = this.meals[idx];
    },
    handleRecipe(event, idxData, idxMenu) {
      const idx = this.listRecipes.findIndex(value => value._id === event);
      if (idx > -1 && this.isEdit && this.dataForm.data[idxData].menuFood[idxMenu]._id) {
        let isLoop = this.checkLoop(idxData, idxMenu);
        if (isLoop) this.dataForm.data[idxData].menuFood[idxMenu]._id = null;
      }
      this.dataForm.data[idxData].menuFood[idxMenu].recipe = this.listRecipes[idx];
    },
    checkLoop(idxData, idxMenu) {
      for (let i = 0, length = this.dataForm.data.length; i < length; i++) {
        const val = this.dataForm.data[i].menuFood;
        for (let j = 0, leg = val.length; j < leg; j++) {
          if (i === idxData && j === idxMenu) continue;
          let m = val[j];
          if (m._id === this.dataForm.data[idxData].menuFood[idxMenu]._id) return true;
        }
      }
      return false;
    },
  },
}
</script>

<template>
  <Drawer
    :align="'down'"
    :closeable="true"
    :maskClosable="true"
    :zIndex="1002"
    @close="handleClosed"
  >
    <div v-if="showModal" class="container-fluid" style="height: 90vh; min-width: 1366px">
      <b-form @submit.prevent="handleSubmit" @reset="onReset">
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
            id="input-group-1"
            label="Description:"
            label-for="input-1"
          >
            <b-form-input
              id="input-1"
              v-model="dataForm.description"
              placeholder="Enter description"
              required
            ></b-form-input>
          </b-form-group>
        </div>
        <div class="mb-3">
          <b-form-group
            class="mb-3 form-label"
            id="input-group-2"
            label="number of snack:"
            label-for="formrow-inputState"
          >
            <b-form-select
              class="form-select"
              id="formrow-inputState"
              v-model="dataForm.numberOfSnack"
              :options="listStatus"
              type="number"
            ></b-form-select>
          </b-form-group>
        </div>
        <div class="mb-3">
          <b-form-group
            class="mb-3 form-label"
            id="input-group-4"
            label="dietary:"
            label-for="formrow-inputState"
          >
            <b-form-select
              class="form-select"
              :value="dataForm.dietary._id"
              :options="dietaries"
              text-field="name"
              value-field="_id"
              @input="handleDietary($event)"
            ></b-form-select>
          </b-form-group>
        </div>
        <div class="mb-3 mb-0">
          <div class="row">
            <label class="col-20">Data: (*required)</label>
            <div class="col-4 d-flex justify-content-end">
              <b-button variant="info" @click="addWeek">
                <i class="mdi mdi-plus me-1"></i>
              </b-button>
            </div>
          </div>
          <div class="row">
            <div
              v-for="(item, index) in dataForm.data"
              :key="index"
              class="my-col"
            >
              <div v-if="index % 7 !== 0" class="row my-col-height pb-3">
                <div class="col-16">
                  <h3>
                    <b-badge
                      :variant="(index + 2) % 7 !== 0 && (index + 1) % 7 !== 0 ? 'secondary' : (index + 2) % 7 === 0 ? 'warning' : 'danger'"
                    >
                      {{ item.day }}
                    </b-badge>
                  </h3>
                </div>
                <div class="col-8 d-flex justify-content-end pt-0 pb-0">
                  <b-button variant="info" @click="addMenuFood(index)">
                    <i class="mdi mdi-plus me-1"></i>
                  </b-button>
                </div>
              </div>
              <div v-if="index % 7 !== 0" class="row m-0">
                <div class="col-8 p-0" style="padding-left: calc(var(--bs-gutter-x) * 0.5) !important;">
                  Meal:
                </div>
                <div class="col-16 p-0" style="padding-left: calc(var(--bs-gutter-x) * 0.5) !important;">
                  Recipe:
                </div>
              </div>
              <div v-if="index % 7 !== 0">
                <div class="row" v-for="(menu, idx) in item.menuFood" :key="idx">
                  <div class="col-24 p-1">
                    <div class="input-group">
                      <b-form-select
                        class="form-select"
                        :value="menu.meal._id"
                        :options="meals"
                        text-field="name"
                        value-field="_id"
                        @input="handleMeal($event, index, idx)"
                        style="max-width: 100px"
                      ></b-form-select>
                      <b-form-select
                        class="form-select"
                        :value="menu.recipe._id"
                        :options="listRecipes"
                        text-field="name"
                        value-field="_id"
                        @input="handleRecipe($event, index, idx)"
                      ></b-form-select>
                      <b-button
                        v-if="item.menuFood.length > 1"
                        variant="warning"
                        @click="item.menuFood.splice(idx, 1);"
                      >
                        <i class="dripicons-minus"></i>
                      </b-button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="index % 7 === 0" class="row">
                <div class="my-col-header">
                  <div class="row">
                    <div class="pa-0 pe-0" style="width: 99px">
                      <h2>
                        <b-badge variant="info" style="width: 98px">
                          {{ `Week: ${(index / 7) + 1}` }}
                        </b-badge>
                      </h2>
                    </div>
                    <div class="my-col-header-button d-flex justify-content-start">
                      <b-button
                        v-if="dataForm.data.length/7 > 1"
                        variant="warning"
                        @click="dataForm.data.splice(index, 7);"
                      >
                        <i class="dripicons-minus"></i>
                      </b-button>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="row pb-3">
                    <div class="col-16">
                      <h3>
                        <b-badge :variant="(index + 2) % 7 !== 0 ? 'secondary' : 'warning'">{{ item.day }}</b-badge>
                      </h3>
                    </div>
                    <div class="col-4 d-flex justify-content-end pt-0 pb-0">
                      <b-button variant="info" @click="() => addMenuFood(index)">
                        <i class="mdi mdi-plus me-1"></i>
                      </b-button>
                    </div>
                  </div>
                  <div class="row m-0">
                    <div class="col-8 p-0" style="padding-left: calc(var(--bs-gutter-x) * 0.5) !important;">
                      Meal:
                    </div>
                    <div class="col-16 p-0" style="padding-left: calc(var(--bs-gutter-x) * 0.5) !important;">
                      Recipe:
                    </div>
                  </div>
                  <div>
                    <div class="row" v-for="(menu, idx) in item.menuFood" :key="idx">
                      <div class="col-24 p-1">
                        <div class="input-group">
                          <b-form-select
                            class="form-select"
                            :value="menu.meal._id"
                            :options="meals"
                            text-field="name"
                            value-field="_id"
                            @input="handleMeal($event, index, idx)"
                            style="max-width: 100px"
                          ></b-form-select>
                          <b-form-select
                            class="form-select"
                            :value="menu.recipe._id"
                            :options="listRecipes"
                            text-field="name"
                            value-field="_id"
                            @input="handleRecipe($event, index, idx)"
                          ></b-form-select>
                          <b-button
                            v-if="item.menuFood.length > 1"
                            variant="warning"
                            @click="item.menuFood.splice(idx, 1);"
                          >
                            <i class="dripicons-minus"></i>
                          </b-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pb-5 mb-0 justify-content-end d-flex">
          <div>
            <button type="submit" class="btn btn-primary">Submit</button>
            <button type="reset" class="btn btn-secondary ms-1" @click="handleClosed">
              Cancel
            </button>
          </div>
        </div>
      </b-form>
    </div>
  </Drawer>
</template>

<style>
.badge-secondary {
  color: #fff;
  background-color: #6c757d;
}

.badge-info {
  color: #fff;
  background-color: #17a2b8;
}

.badge-danger {
  color: #fff;
  background-color: #dc3545;
}

.badge-warning {
  color: #212529;
  background-color: #ffc107;
}

.my-col {
  -webkit-box-flex: 0;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  width: 14.2857% !important;
  padding-bottom: 40px;
}

.my-col-height {
  padding-top: 50px;
}

.my-col-header {
  height: 50px;
}

.my-col-header-button {
  width: 47px !important;
  height: 32px;
  margin-top: 2px !important;
  padding: 0 0 0 6px !important;
}
</style>
