<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import DialogDelete from "@/components/DialogDelete";
import FormMealPlan from "@/components/form/FormMealPlan";

/**
 * Customers component
 */
export default {
  page: {
    title: "Meal Plan",
    meta: [
      {
        name: "Meal Plan",
        content: "appConfig.description",
      },
    ],
  },
  components: {DialogDelete, Loading, PageHeader, FormMealPlan},
  computed: {
    ...mapState('mealPlan', [
      'totalItems',
      'totalPages',
      'itemsInPage',
      'listMeal',
      'listRecipe',
      'listDietary',
      // 'itemDetail',
    ]),
  },
  created() {
    this.loading = true
    Promise.all([
      this.getRecipeList(),
      this.getMealList(),
      this.getInitList({page: this.currentPage, itemsPage: this.itemsPage}),
      this.getDietaryList(),
    ]).finally(() => {
      this.loading = false
    });
  },
  data() {
    return {
      title: "Meal Plan",
      items: [],
      search: '',
      numberPageMax: 0,
      currentPage: 0,
      itemsPage: 15,
      loading: false,
      status: "all",
      currentStatus: true,
      isFilter: false,
      filter: {
        name: '',
        dietaryId: ''
      },
      itemDraft: {},
      showModalDel: false,
      showModalEdit: false,
      showModalForm: false,
      submitted: false,
      customer: {},
      timerDebounce: null,
    };
  },
  methods: {
    ...mapActions('mealPlan', [
      'getInitList',
      'getListItem',
      'updateItem',
      'deleteById',
      'createItem',
      'getRecipeList',
      'getMealList',
      'getDietaryList',
      'getItemDetail',
    ]),
    formatDate(value) {
      if (value) {
        return moment(value).format('YYYY-MM-DD hh:mm')
      }
    },
    handlerFilter() {
      try {
        this.loading = true
        this.currentPage = 0;
        this.numberPageMax = 0;
        this.getInitList({
          page: this.currentPage,
          itemsPage: this.itemsPage,
          filter: this.filter,
        })
      } catch (e) {
        console.log(e)
      }finally {
        this.loading = false
        this.isFilter = false
      }
    },
    handleSubmitDel() {
      if (!this.itemDraft._id) return null;
      this.deleteById(this.itemDraft._id)
      this.itemDraft = {};
      this.showModalDel = false
    },
    handleClosedDel() {
      this.itemDraft = {};
      this.showModalDel = false
    },
    handleDelete(item) {
      this.itemDraft = item;
      this.showModalDel = true;
    },
    async handleEdit(item) {
      this.loading = true
      const result = await this.getItemDetail(item._id);
      if(!result) return;
      result.isEdit = true
      this.itemDraft = result
      this.showModalForm = true;
      this.loading = false
    },
    handleSubmitForm(data) {
      this.loading = true
      if (!data.isEdit) this.createItem(data).finally(() => {this.loading = false})
      else this.updateItem(data).finally(() => {this.loading = false})
      this.itemDraft = {};
      this.showModalForm = false
    },
    handleClosedForm() {
      this.itemDraft = {}
      this.showModalForm = false
    },
    onFilter() {
      this.isFilter = true
    },
    closeFilter() {
      this.isFilter = false
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
    onChangeTextSearch(){
      if(this.filter.name === '') delete this.filter.name
      clearTimeout(this.timerDebounce);
      this.timerDebounce = setTimeout(this.handlerFilter, 1000);
    }
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
            <b-navbar variant="faded" type="light">
              <div class="col-sm-8">
                <div class="search-box me-2 mb-2 d-inline-block">
                  <div class="position-relative">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search name..."
                      v-model="filter.name"
                      v-on:input="onChangeTextSearch();"
                    />
                    <i class="bx bx-search-alt search-icon"></i>
                  </div>
                </div>
              </div>
              <v-spacer></v-spacer>
              <div class="col-sm-8 d-flex flex-row-reverse">
                <button
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 120px"
                  @click="isFilter = true"
                >
                  <i class="fas fa-filter"></i> Filter
                </button>
                <button
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 120px"
                  @click="showModalForm = true"
                >
                  <i class="mdi mdi-plus me-1"></i> Add
                </button>
                <b-modal
                  v-model="isFilter"
                  title="Choose options filter "
                  title-class="text-black font-18"
                  body-class="p-3"
                  hide-footer
                >
                  <form @submit.prevent="handlerFilter();">
                    <div class="col-24">
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

                    <div class="col-24">
                      <div>
                        <label>Dietary </label>
                        <select class="form-control" @change="filter.dietaryId=$event.target.value"
                                :value="filter.dietaryId">
                          <!-- inline object literal -->
                          <option :value="null">-- None --</option>
                          <option v-for="die in listDietary" :key="die._id" :value="die._id">
                            {{ die.name }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <!--                      Filter-->
                    <div class="text-end pt-5 mt-3">
                      <b-button variant="light" @click="isFilter=false;">Close</b-button>
                      <b-button type="submit" variant="success" class="ms-1"
                      >Filter Data
                      </b-button>
                    </div>
                  </form>

                </b-modal>
              </div>
            </b-navbar>
            <dialog-delete
              :is-open="showModalDel"
              :label="itemDraft.name"
              title="Delete meal plan"
              @onClose="handleClosedDel"
              @onSubmit="handleSubmitDel"
            />
            <form-meal-plan
              :showModal="showModalForm"
              :meals="listMeal"
              :recipes="this.listRecipe"
              :dietaries="this.listDietary"
              :item="itemDraft"
              title="meal plan"
              @closed="handleClosedForm"
              @onSubmit="handleSubmitForm"
            />
            <div class="table-responsive" style="padding-left: 10px">
              <table class="table table-centered table-nowrap align-middle">
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Dietary</th>
                  <th>Snack</th>
                  <th>Created at</th>
                  <th>Updated at</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in itemsInPage" :key="item._id">
                  <td>{{ item.name }}</td>
                  <td>{{ item.dietary.name }}</td>
                  <td>{{ item.numberOfSnack }}</td>
                  <td>{{ formatDate(item.createdAt) }}</td>
                  <td>{{ formatDate(item.updatedAt) }}</td>
                  <td style="cursor: pointer" @click="handleEdit(item)">
                    <i class="fas fa-edit text-danger me-1"></i>
                  </td>
                  <td style="cursor: pointer" @click="() => handleDelete(item)">
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
  </Loading>
</template>
