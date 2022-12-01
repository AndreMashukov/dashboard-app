<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import Loading from "@/components/Loader";
import {RECIPE} from "@/common/apiUrls";
import axios from "axios";
import PageHeader from "@/components/PageHeader";
import InputSearchImage from "@/components/InputSearchImage";
import FormRecipes from "@/components/form/FormRecipes";

/**
 * Customers component
 */
export default {
  page: {
    title: "Recipes",
  },
  // eslint-disable-next-line vue/no-unused-components
  components: {Loading, PageHeader, InputSearchImage, FormRecipes},
  computed: {
    ...mapState('recipes',
      ['totalItems', 'totalPages', 'itemsInPage',
        'recipeMeals', 'ingredients', 'imagesMedia',
        'recipeType', 'recipeCategory', 'recipeDietary',
        'recipeTags'
      ]),
  },
  async created() {
    this.loading = true
    await Promise.all([
      this.getInitList({page: this.currentPage, itemsPage: this.itemsPage}),
      this.getInitRecipeMeal(),
      this.getInitIngredient(),
      this.getInitImageMedia(),
      this.getInitRecipeType(),
      this.getInitRecipeCategory(),
      this.getInitRecipeDietary(),
      this.getInitRecipeTags(),
    ])
    this.loading = false
  },
  data() {
    return {
      title: "Recipes",
      items: [],
      numberPageMax: 0,
      currentPage: 0,
      nextPage: 0,
      itemsPage: 15,
      loading: false,
      idItem: '',
      currentStatus: true,
      isFilter: false,
      filter: {
        name: '',
        tags: [],
        mealId: '',
        dietaryId: ''
      },
      countFilterTags: 1,
      usernameItem: '',
      showModalDel: false,
      showModalEdit: false,
      submitted: false,
      customer: {},
      showModal: false,
      qty: [0],
      valueNutri: [""],
      fieldNutri: [""],
      stepsMethod: [""],
      contentsMethod: [""],
      count: {
        countNutri: 1,
        countDetary: 1,
        countIngredients: 1,
        countTags: 1,
        countMethods: 1,
      },
      imageSelect: {},
      ingredientsSelect: [],
      timerDebounce: null,
    };
  },
  methods: {
    ...mapActions('recipes', {
      getInitList: 'getInitList',
      getListItem: 'getListItem',
      getInitRecipeMeal: 'getInitRecipeMeal',
      updateItem: 'updateItem',
      deleteById: 'deleteById',
      getInitIngredient: 'getInitIngredient',
      getInitImageMedia: 'getInitImageMedia',
      getInitRecipeType: 'getInitRecipeType',
      getInitRecipeCategory: 'getInitRecipeCategory',
      getInitRecipeDietary: 'getInitRecipeDietary',
      getInitRecipeTags: 'getInitRecipeTags',
      createItem: 'createItem',
      findImage: 'findImage',
    }),
    clearState() {
      this.qty = [0]
      this.valueNutri = [""]
      this.fieldNutri = [""]
      this.stepsMethod = [""]
      this.contentsMethod = [""]
      this.count = {
        countNutri: 1,
        countDetary: 1,
        countIngredients: 1,
        countTags: 1,
        countMethods: 1,
      }
      this.imageSelect = {}
      this.ingredientsSelect = []
    },
    formatDate(value) {
      if (value) {
        return moment(value).format('YYYY-MM-DD hh:mm')
      }
    },
    changePage(page) {
      page--;
      this.currentPage = page;
      this.loading = true;
      this.getListItem({
        preMaxPage: this.numberPageMax,
        nextPage: page,
        itemsPage: this.itemsPage,
        filter: this.filter,
      }).finally(() => {
        this.loading = false;
        if (this.numberPageMax < page)
          this.numberPageMax = page;
      });
    },
    async changeStatus() {
      try {
        if (!this.idItem) return null;
        let newStatus = this.customer.status === 'published' ? 'draft' : "published"
        const res = await axios.put(`${RECIPE}/${this.idItem}`, {status: newStatus})
        if (res.data && res.data._id) {
          const idx = this?.itemsInPage?.findIndex(u => u._id === this.idItem);
          if (idx === -1) return null;
          this.itemsInPage[idx].status = res?.data?.status
        }
      } catch (e) {
        console.log(e)
      } finally {
        this.idItem = ''
        this.customer = {}
      }
    },
    async handleSubmitDel() {
      try {
        if (!this.idItem) return null;
        this.deleteById({id: this.idItem})
        this.idItem = ''
        this.usernameItem = ''
        this.showModalDel = false
      } catch (e) {
        console.log(e)
      }
    },
    async handleSubmitCreate(data) {
      try {
        const result = await this.createItem(data);
        if (result.status && result.status === "OK") {
          this.showModal = false
          this.clearState()
          this.customer = {}
        }
      } catch (e) {
        console.log("handleSubmitCreate error:", e);
      } 
    },
    async handleSubmitUpdate(data) {
      try {
        const result = await this.updateItem(data);
        if (result.status && result.status === "OK") {
          this.showModal = false
          this.clearState()
          this.customer = {}
        }
      } catch (e) {
        console.log("handleSubmitCreate error:", e);
      } 
    },
    handlerFilter() {
      this.loading = true
      this.currentPage = 0;
      this.numberPageMax = 0;

      this.getInitList({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        filter: this.filter
      }).finally(() => {
        this.loading = false
        // this.filter = {}
      });
    },
    onChangeTextSearch() {
      if(this.filter.name === '') delete this.filter.name
      clearTimeout(this.timerDebounce);
      this.timerDebounce = setTimeout(this.handlerFilter, 1000);
    },
  },
};
</script>

<template>
  <Loading :loading="loading">
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-24 pa-0">
        <div class="card">
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-sm-8">
                <div class="search-box me-2 mb-2 d-inline-block">
                  <div class="position-relative">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search name..."
                      v-model="filter.name"
                      v-on:input="onChangeTextSearch"
                    />
                    <i class="bx bx-search-alt search-icon"></i>
                  </div>
                </div>
              </div>
              <b-modal
                v-model="showModalDel"
                title="Delete recipes"
                hide-footer
                title-class="text-black font-18"
                body-class="p-3"
              >
                <label> You sure delete : <b>{{ usernameItem }}</b></label>
                <form @submit.prevent="handleSubmitDel">
                  <div class="text-end pt-5 mt-3">
                    <b-button variant="light" @click="showModalDel = false">Close</b-button>
                    <b-button type="submit" class="ms-1" variant="danger">
                      Delete
                    </b-button>
                  </div>
                </form>
              </b-modal>
              <form-recipes
                :is-open="showModal"
                :object-data="customer"
                :list-meal="recipeMeals"
                :list-ingredients="ingredients"
                :list-category="recipeCategory"
                :list-type="recipeType"
                :list-tags="recipeTags"
                :list-dietary="recipeDietary"
                :images-media="imagesMedia"
                @onFindImage="findImage"
                @closed="showModal = false"
                @onSubmit="!$event.isEdit ? handleSubmitCreate($event) : handleSubmitUpdate($event)"
              />
              <div class="col-sm-4" style="position: absolute; right: 180px; max-width: 150px;">
                <button
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 120px"
                  @click="clearState();showModal=true;customer={};"
                >
                  <i class="mdi mdi-plus me-1"></i> New Recipe
                </button>
              </div>
              <div class="col-sm-4" style="position: absolute; right: 50px; max-width: 150px;">
                <button
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 120px"
                  @click="isFilter = true"
                >
                  <i class="fas fa-filter"></i> Filter
                </button>
                <b-modal
                  v-model="isFilter"
                  title="Choose options filter"
                  title-class="text-black font-18"
                  body-class="p-3"
                  hide-footer
                >
                  <form @submit.prevent="handlerFilter();">
                    <div class="col-24 mb-2">
                      <div>
                        <label>Name</label>
                        <input
                          id="filtername"
                          v-model="filter.name"
                          type="text"
                          class="form-control"
                          placeholder="search name"
                        />
                      </div>
                    </div>
                    <div class="col-24 mb-2">
                      <label class="col-22">Tags</label>
                      <b-button class="col-2" @click="countFilterTags++;">

                        <i class="mdi mdi-plus me-1"></i>
                      </b-button>
                      <div v-for="num in countFilterTags" :key="num">
                        <select class="form-control" @change="filter.tags[num-1]=$event.target.value"
                                v-if="filter.tags" :value="filter.tags[num-1]">
                          <option :value="null">-- None --</option>
                          <option v-for="item in recipeTags" :key="item._id" :value="item._id">{{
                              item.name
                            }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-24 mb-2">
                      <div>
                        <label>Meal</label>
                        <select class="form-control" @change="filter.mealId=$event.target.value"
                                :value="filter.mealId">
                          <!-- inline object literal -->
                          <option :value="null">-- None --</option>
                          <option v-for="meal in recipeMeals" :key="meal._id" :value="meal._id">{{
                              meal.name
                            }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-24 mb-2">
                      <div>
                        <label>Category</label>
                        <select class="form-control" @change="filter.categoryId=$event.target.value"
                                :value="filter.categoryId">
                          <!-- inline object literal -->
                          <option :value="null">-- None --</option>
                          <option v-for="item in recipeCategory" :key="item._id" :value="item._id">{{
                              item.name
                            }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <!--                      Filter-->
                    <div class="text-end mt-3">
                      <b-button variant="light" @click="isFilter=false;">Close</b-button>
                      <b-button type="submit" variant="success" class="ms-1"
                      >Filter Data
                      </b-button>
                    </div>
                  </form>

                </b-modal>
              </div>
            </div>
            <div class="table-responsive" style="padding-left: 10px">
              <table class="table table-centered table-nowrap align-middle">
                <thead>
                <tr>
                  <th>{{ "Name" }}</th>
                  <th>{{ "Price" }}</th>
                  <th>{{ "Time" }}</th>
                  <th>{{ "Serves" }}</th>
                  <th>{{ "Meal" }}</th>
                  <th>{{ "Media" }}</th>
                  <th>{{ "Status" }}</th>
                  <th>{{ "Edit" }}</th>
                  <th>{{ "Delete" }}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in itemsInPage" :key="item._id">
                  <td>{{ item.name }}</td>
                  <td>{{ item.price }}</td>
                  <td>{{ item.time }}</td>
                  <td>{{ item.serves }}</td>
                  <td>{{ item.meal ? item.meal.name : '' }}</td>
                  <td>
                    <v-avatar size="30" color="primary">
                      <img
                        v-if="item.media"
                        v-bind:src="item.media.thumbnail"
                        alt=""
                      >
                    </v-avatar>
                  </td>
                  <td>
                    <toggle-button
                      :value="item.status === 'published'"
                      color="#82C7EB"
                      :labels="true"
                      v-on:change="idItem=item._id;customer=item;changeStatus()"
                    />
                  </td>
                  <td
                    style="cursor: pointer"
                    @click="showModal=true; customer={...item, isEdit: true};"
                  >
                    <i class="fas fa-edit text-danger me-1"></i>
                  </td>
                  <td
                    style="cursor: pointer"
                    @click="showModalDel=true; idItem=item._id; usernameItem=item.name"
                  >
                    <i class="fas fa-trash-alt text-danger me-1"></i>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div class="row">
              <div class="col">
                <div class="dataTables_paginate paging_simple_numbers float-end">
                  <ul class="pagination pagination-rounded mb-0">
                    <b-pagination
                      :value="currentPage + 1"
                      :total-rows="totalItems"
                      :per-page="itemsPage"
                      @change="changePage"
                    ></b-pagination>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- end row -->
  </Loading>
</template>

