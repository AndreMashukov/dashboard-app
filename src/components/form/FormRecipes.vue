<script>
import Vue from 'vue';
import Multiselect from "vue-multiselect";
import InputSearchImage from "@/components/InputSearchImage";
import {cloneDeep} from "lodash";

export default {
  name: "dialog-recipes",
  components: {Multiselect, InputSearchImage},
  props: {
    isOpen: {type: Boolean, default: false},
    objectData: {type: Object, required: true},
    listMeal: {type: Array},
    listIngredients: {type: Array},
    listCategory: {type: Array},
    listType: {type: Array},
    listTags: {type: Array},
    listDietary: {type: Array},
    imagesMedia: {type: Array},
  },
  beforeUpdate() {
    const ser = {_id: null, name: '-- Please select --'};
    if(this.isOpen && this.objectData.isEdit && !this.isEdit) {
      this.isEdit = true;
      this.dataForm = cloneDeep(this.objectData);
      if(!this.objectData.media)
        this.dataForm.media = {};
      if(!this.objectData.mediaMobile)
        this.dataForm.mediaMobile = {};
      if(!this.objectData.category)
        this.dataForm.category = ser;
      if(!this.objectData.type)
        this.dataForm.type = ser;
      if(this.objectData.tags.length === 0)
        this.dataForm.tags.push({...ser});
      if(this.objectData.dietary.length === 0)
        this.dataForm.dietary.push({...ser});
      if(this.objectData.ingredients.length === 0)
        this.dataForm.ingredients.push({...ser, qty: 0});
      if(this.objectData.nutritionInformation.length === 0)
        this.dataForm.nutritionInformation.push({field: '', value: ''});
      if(this.objectData.method.length === 0)
        this.dataForm.method.push({step: 0, value: ''});
      if(!this.objectData.meal)
        this.dataForm.meal = this.listMeal[0];
        this.dataForm.ingredients = this.dataForm.ingredients.map(item=>{
                item.label = (item.unit)?item.name +'('+item.unit+')':item.name
              return item
            })
            console.log( this.dataForm.ingredients)
    }
    if(this.isOpen && !this.objectData.isEdit && !this.dataForm.meal._id) {
      this.dataForm.meal = this.listMeal[0];
      this.dataForm.ingredients.push({...ser, qty: 0});
      this.dataForm.nutritionInformation.push({field: '', value: ''});
      this.dataForm.method.push({step: 0, value: ''});
      this.dataForm.category = {...ser};
      this.dataForm.type = {...ser};
      this.dataForm.tags.push({...ser});
      this.dataForm.dietary.push({...ser});
    }
    if(this.isOpen && this.categories.length === 0){
      this.categories = this.listCategory.map(value => value);
      this.categories.unshift({...ser});
    }
    if(this.isOpen && this.types.length === 0){
      this.types = this.listType.map(value => value);
      this.types.unshift({...ser});
    }
    if(this.isOpen && this.tags.length === 0){
      this.tags = this.listTags.map(value => value);
      this.tags.unshift({...ser});
    }
    if(this.isOpen && this.dietaries.length === 0){
      this.dietaries = this.listDietary.map(value => value);
      this.dietaries.unshift({...ser});
    }
    if(this.isOpen && this.ingredients.length === 0){
      this.ingredients = this.listIngredients.map(value => {
        value.label = (value.unit)?value.name +'('+value.unit+')':value.name
        return value
      });
      this.ingredients.unshift({...ser});
    }
  },
  data: () => ({
    isEdit: false,
    dataForm: {
      name: '',
      status: "draft",
      meal: {},
      ingredients: [],
      nutritionInformation: [],
      method: [],
      category: {},
      type: {},
      tags: [],
      dietary: [],
      time: '',
      serves: '',
      media: {},
      mediaMobile: {},
      size: '',
      description: "",
      note: "",
    },
    status: ["draft", "published"],
    tags: [],
    dietaries: [],
    categories: [],
    types: [],
    ingredients: [],
  }),
  methods: {
    addIngredients() {
      const ser = {_id: null, name: '-- Please select --', qty: 0};
      this.dataForm.ingredients.push(ser);
    },
    handleIngredients(event, index, type) {
      if(type === 'ingredients') {
        const obj = cloneDeep(event);
        obj.qty = this.dataForm.ingredients[index].qty;
        Vue.set(this.dataForm.ingredients, index, obj);
      } else if(type === 'qty') {
        const obj = cloneDeep(this.dataForm.ingredients[index]);
        const qty = event.target.value
        this.dataForm.ingredients[index] = {...obj, qty}
      }else if(type === 'displayQty') {
        const obj = cloneDeep(this.dataForm.ingredients[index]);
        const displayQty = event.target.value
        this.dataForm.ingredients[index] = {...obj, displayQty}
      }
    },
    addNutInfo() {
      this.dataForm.nutritionInformation.push({field: '', value: ''})
    },
    handleNutInfo({target}, index, type){
      const obj = {...this.dataForm.nutritionInformation[index]};
      this.dataForm.nutritionInformation[index] = {...obj, [type]: target.value};
    },
    addMethod() {
      this.dataForm.method.push({step: 0, value: ''})
    },
    handleMethod({target}, index, type){
      const obj = {...this.dataForm.method[index]};
      this.dataForm.method[index] = {...obj, [type]: target.value};
    },
    removeMethod(idx) {
      this.dataForm.method.splice(idx, 1);
    },
    addTag() {
      const ser = {_id: null, name: '-- Please select --'};
      this.dataForm.tags.push(ser);
    },
    handleTagIds(index, id) {
      const idx = this.tags.findIndex(val => val._id === id);
      if(idx > -1) this.dataForm.tags[index] = this.tags[idx];
    },
    addDietary() {
      const ser = {_id: null, name: '-- Please select --'};
      this.dataForm.dietary.push(ser);
    },
    handleDietary(index, id) {
      const idx = this.dietaries.findIndex(val => val._id === id);
      if(idx > -1) this.dataForm.dietary[index] = this.dietaries[idx];
    },
    handleMeal(id) {
      const idx = this.listMeal.findIndex(val => val._id === id);
      if(idx > -1) this.dataForm.meal = this.listMeal[idx];
    },
    handleCategory(id) {
      const idx = this.categories.findIndex(val => val._id === id);
      if(idx > -1) this.dataForm.category = this.categories[idx];
    },
    handleType(id) {
      const idx = this.types.findIndex(val => val._id === id);
      if(idx > -1) this.dataForm.type = this.types[idx];
    },
    selectImage(image) {
      this.dataForm.media = image
    },
    selectImageMobile(image) {
      this.dataForm.mediaMobile = image
    },
    removeMediaSelect() {
      this.dataForm.media = {};
    },
    removeMediaMobileSelect() {
      this.dataForm.mediaMobile = {};
    },
    onSearch(value) {
      this.$emit('onFindImage', value)
    },
    handleSubmit() {
      const data = cloneDeep(this.dataForm);
      data.ingredients = [];
      this.dataForm.ingredients.forEach(value => {
        if(value._id) data.ingredients.push({
          _id: value._id,
          qty: value.qty === "" ? null : value.qty,
          displayQty: value.displayQty === "" ? null : value.displayQty,
        })
      })
      data.mealId = this.dataForm.meal._id;
      if(data.category._id)
        data.categoryId = this.dataForm.category._id;
      if(data.type._id)
        data.typeId = this.dataForm.type._id;
      data.tags = [];
      this.dataForm.tags.forEach(value => {
        if(value._id) data.tags.push(value._id);
      })
      data.dietary = [];
      this.dataForm.dietary.forEach(value => {
        if(value._id) data.dietary.push(value._id);
      })
      if(!data.size && data.size !== 0) data.size = null;
      if(!data.note) data.note = '';
      if(!data.description) data.description = '';
      // this.onReset();
      this.$emit("onSubmit", data);
    },
    handleClosed() {
      this.onReset();
      this.$emit('closed');
    },
    onReset() {
      this.dataForm = {
        name: '',
        status: "draft",
        meal: {},
        ingredients: [],
        nutritionInformation: [],
        method: [],
        category: {},
        type: {},
        tags: [],
        dietary: [],
        time: '',
        serves: '',
        media: {},
        mediaMobile: {},
        size: '',
        description: "",
        note: "",
      };
      this.isEdit = false;
      this.tags = [];
      this.dietaries = [];
      this.categories = [];
      this.types = [];
    },
  },
}
</script>

<template>
  <b-modal
    :visible="isOpen"
    :title="!isEdit ? 'Add New' : 'Edit name: '+ objectData.name"
    title-class="text-black font-18"
    body-class="p-3"
    hide-footer
    @hidden="handleClosed"
  >
    <form @submit.prevent="handleSubmit">
      <div class="col-24 mb-2">
        <div>
          <label>Name (*required)</label>
          <input
            id="name"
            required="true"
            v-model="dataForm.name"
            type="text"
            class="form-control"
            placeholder="Insert name"
          />
        </div>
      </div>
      <div class="col-24 mb-2">
        <b-form-group
          label="status:"
        >
          <b-form-select
            class="form-select"
            v-model="dataForm.status"
            :options="status"
            type="text"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="col-24 mb-2">
        <b-form-group
          label="Meal:"
        >
          <b-form-select
            class="form-select"
            :value="dataForm.meal._id"
            :options="listMeal"
            text-field="name"
            value-field="_id"
            @change="handleMeal"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="col-24 mb-2">
        <div class="row">
          <label class="col-20">Ingredients: </label>
          <div class="col-4 d-flex justify-content-end">
            <b-button
              v-if="dataForm.ingredients.length < ingredients.length"
              variant="info"
              @click="addIngredients"
            >
              <i class="mdi mdi-plus me-1"></i>
            </b-button>
          </div>
        </div>
        <div class="row mt-0" v-for="(ingredient, idx) in dataForm.ingredients" :key="idx">
          <div class="col-10 p-2">
            <multiselect
              :value="ingredient"
              :options="ingredients"
              label="label"
              track-by="label"
              class="helo"
              @select="handleIngredients($event, idx, 'ingredients')"
            />
          </div>
          <div class="col-4 p-2">
            <input
              :value="ingredient.qty"
              type="float"
              min="0"
              class="form-control"
              placeholder="qty"
              @input="handleIngredients($event, idx, 'qty')"
            />
          </div>
          <div class="col-6 p-2">
            <input
              :value="ingredient.displayQty"
              type="float"
              min="0"
              class="form-control"
              placeholder="Display Qty"
              @input="handleIngredients($event, idx, 'displayQty')"
            />
          </div>
          <div v-if="dataForm.ingredients.length > 0" class="col-4 p-2">
            <b-button variant="warning" @click="dataForm.ingredients.splice(idx, 1);">
              <i class="dripicons-minus"></i>
            </b-button>
          </div>
        </div>
      </div>
      <div class="col-24 mb-2">
        <div>
          <label for="price">Price (*required)</label>
          <input
            id="price"
            type="float"
            v-model="dataForm.price"
            min="0"
            required='true'
            class="form-control"
            placeholder="Insert price"
          />
        </div>
      </div>
      <div class="col-24 mb-2">
        <div class="row">
          <label class="col-20">Nutrition Information: </label>
          <div class="col-4 d-flex justify-content-end">
            <b-button
              variant="info"
              @click="addNutInfo"
            >
              <i class="mdi mdi-plus me-1"></i>
            </b-button>
          </div>
        </div>
        <div class="row mt-0" v-for="(nut, idx) in dataForm.nutritionInformation" :key="idx">
          <div class="col-14 p-2">
            <input
              required="true"
              :value="nut.field"
              type="text"
              class="form-control"
              placeholder="field"
              @input="handleNutInfo($event, idx, 'field')"
            />
          </div>
          <div class="col-6 p-2">
            <input
              required="true"
              :value="nut.value"
              type="text"
              class="form-control"
              placeholder="value"
              @input="handleNutInfo($event, idx, 'value')"
            />
          </div>
          <div v-if="dataForm.nutritionInformation.length > 0" class="col-4 p-2">
            <b-button variant="warning" @click="dataForm.nutritionInformation.splice(idx, 1);">
              <i class="dripicons-minus"></i>
            </b-button>
          </div>
        </div>
      </div>
      <div class="col-24 mb-2">
        <div class="row">
          <label class="col-20">Method: </label>
          <div class="col-4 d-flex justify-content-end">
            <b-button
              variant="info"
              @click="addMethod"
            >
              <i class="mdi mdi-plus me-1"></i>
            </b-button>
          </div>
        </div>
        <div class="row mt-0" v-for="(met, idx) in dataForm.method" :key="idx">
          <div class="col-4 p-2">
            <input
              required="true"
              :value="met.step"
              type="text"
              class="form-control"
              placeholder="value"
              @input="handleMethod($event, idx, 'step')"
            />
          </div>
          <div class="col-16 p-2">
            <input
              required="true"
              :value="met.content"
              type="text"
              class="form-control"
              placeholder="value"
              @input="handleMethod($event, idx, 'content')"
            />
          </div>
          <div v-if="dataForm.method.length > 0" class="col-4 p-2">
            <b-button variant="warning" @click="removeMethod(idx)">
              <i class="dripicons-minus"></i>
            </b-button>
          </div>
        </div>
      </div>
      <div class="col-24 mb-2">
        <b-form-group
          label="Category:"
        >
          <b-form-select
            class="form-select"
            :value="dataForm.category._id"
            :options="categories"
            text-field="name"
            value-field="_id"
            @change="handleCategory"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="col-24 mb-2">
        <b-form-group
          label="Type:"
        >
          <b-form-select
            class="form-select"
            :value="dataForm.type._id"
            :options="types"
            text-field="name"
            value-field="_id"
            @change="handleType"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="col-24 mb-2">
        <div class="row">
          <label class="col-20">Tags: </label>
          <div class="col-4 d-flex justify-content-end">
            <b-button v-if="dataForm.tags.length < this.listTags.length" variant="info" @click="addTag">
              <i class="mdi mdi-plus me-1"></i>
            </b-button>
          </div>
        </div>
        <div v-for="(tag, idx) in dataForm.tags" :key="idx">
          <div class="row">
            <div class="col-20">
              <b-form-select
                class="form-select"
                :value="tag._id"
                :options="tags"
                text-field="name"
                value-field="_id"
                @change="(val) => handleTagIds(idx, val)"
              ></b-form-select>
            </div>
            <div class="col-4 d-flex justify-content-end">
              <b-button variant="warning" @click="dataForm.tags.splice(idx, 1);">
                <i class="dripicons-minus"></i>
              </b-button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-24 mb-2">
        <div class="row">
          <label class="col-20">Dietary: </label>
          <div class="col-4 d-flex justify-content-end">
            <b-button v-if="dataForm.dietary.length < listDietary.length" variant="info" @click="addDietary">
              <i class="mdi mdi-plus me-1"></i>
            </b-button>
          </div>
        </div>
        <div v-for="(die, idx) in dataForm.dietary" :key="idx">
          <div class="row">
            <div class="col-20">
              <b-form-select
                class="form-select"
                :value="die._id"
                :options="dietaries"
                text-field="name"
                value-field="_id"
                @change="handleDietary(idx, $event)"
              ></b-form-select>
            </div>
            <div class="col-4 d-flex justify-content-end">
              <b-button variant="warning" @click="dataForm.dietary.splice(idx, 1);">
                <i class="dripicons-minus"></i>
              </b-button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-24 mb-2">
        <div>
          <label>Time:</label>
          <input
            v-model="dataForm.time"
            type="text"
            class="form-control"
            placeholder="Insert time"
          />
        </div>
      </div>
      <div class="col-24 mb-2">
        <div>
          <label>Serves:</label>
          <input
            v-model="dataForm.serves"
            type="text"
            class="form-control"
            placeholder="Insert serves"
          />
        </div>
      </div>
      <div class="col-24 mb-2" :style="dataForm.media._id ? 'padding-bottom: 0': ''">
        <label>Thumbnail:</label>
        <input-search-image
          :items="imagesMedia"
          @onSearch="onSearch"
          @selectItem="selectImage"
          field-image="thumbnail"
          field-text="name"
        />
      </div>
      <div
        v-if="dataForm.media._id"
        class="col-24 mb-2"
        style="padding-top: 0; padding-bottom: 0"
      >
        <div class="d-flex align-items-center">
          <div class="col-sm-4 p-2">
            <img :src="dataForm.media.thumbnail" :alt="dataForm.media.name" width="35">
          </div>
          <div class="col-sm-16 p-2">
            <input
              type="text"
              v-model="dataForm.media.name"
              class="form-control"
              placeholder="Image name"
              :disabled="!dataForm.media.isUploadFile"
            />
          </div>
          <div class="col-sm-4 p-2">
            <b-button-group size="sm" class="mr-1">
              <b-button variant="warning" @click="removeMediaSelect">X</b-button>
            </b-button-group>
          </div>
        </div>
      </div>
      <div class="col-24 mb-2" :style="dataForm.mediaMobile._id ? 'padding-bottom: 0': ''">
        <label>Thumbnail mobile:</label>
        <input-search-image
          :items="imagesMedia"
          @onSearch="onSearch"
          @selectItem="selectImageMobile"
          field-image="thumbnail"
          field-text="name"
        />
      </div>
      <div
        v-if="dataForm.mediaMobile._id"
        class="col-24 mb-2"
        style="padding-top: 0; padding-bottom: 0"
      >
        <div class="d-flex align-items-center">
          <div class="col-sm-4 p-2">
            <img :src="dataForm.mediaMobile.thumbnail" :alt="dataForm.mediaMobile.name" width="35">
          </div>
          <div class="col-sm-16 p-2">
            <input
              type="text"
              v-model="dataForm.mediaMobile.name"
              class="form-control"
              placeholder="Image name"
              :disabled="!dataForm.mediaMobile.isUploadFile"
            />
          </div>
          <div class="col-sm-4 p-2">
            <b-button-group size="sm" class="mr-1">
              <b-button variant="warning" @click="removeMediaMobileSelect">X</b-button>
            </b-button-group>
          </div>
        </div>
      </div>
      <div class="col-24 mb-2">
        <div>
          <label>Size:</label>
          <input
            v-model="dataForm.size"
            type="text"
            class="form-control"
            placeholder="Insert size"
          />
        </div>
      </div>
      <div class="col-24 mb-2">
        <div>
          <label>Description:</label>
          <textarea
            id="description"
            v-model="dataForm.description"
            :maxlength="300"
            rows="3"
            type="text"
            class="form-control"
            placeholder="This description has a limit of 300 chars."
          />
        </div>
        <div class="text-center">
          <p
            v-if="dataForm.description"
            class="badge position-absolute"
            :class="{
              'bg-success': dataForm.description.length !== 300,
              'bg-danger': dataForm.description.length === 300
            }"
          >
            {{ dataForm.description.length }} / 300
          </p>
        </div>
      </div>
      <div class="col-24 mb-2">
        <div>
          <label>Note:</label>
          <textarea
            id="note"
            :maxlength="225"
            rows="3"
            placeholder="This note has a limit of 225 chars."
            v-model="dataForm.note"
            class="form-control"
          />
        </div>
        <div class="text-center">
          <p
            v-if="dataForm.note"
            class="badge position-absolute"
            :class="{
              'bg-success': dataForm.note.length !== 225,
               'bg-danger': dataForm.note.length === 225
            }"
          >
            {{ dataForm.note.length }} / 225
          </p>
        </div>
      </div>
      <div class="text-end mt-3">
        <b-button variant="light" @click="handleClosed">Close</b-button>
        <b-button type="submit" variant="success" class="ms-1">Submit</b-button>
      </div>
    </form>
  </b-modal>
</template>
