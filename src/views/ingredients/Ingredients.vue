<script>
import {mapActions, mapState} from "vuex";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import DialogDelete from "@/components/DialogDelete";
import FormIngredients from "@/components/form/FormIngredients";

/**
 * Customers component
 */
export default {
  page: {
    title: "Ingredients",
    meta: [
      {
        name: "Ingredients",
        content: "appConfig.description",
      },
    ],
  },
  components: {DialogDelete, Loading, PageHeader, FormIngredients},
  computed: {
    ...mapState('ingredients', ['totalItems', 'totalPages', 'itemsInPage', 'listCategory',]),
  },
  created() {
    this.loading = true
    this.getInitList({page: this.currentPage, itemsPage: this.itemsPage}).finally(() => {
      this.loading = false
    });
    this.getListCategory();
  },
  data() {
    return {
      title: "Ingredients",
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
        categoryId: '',
        type: ''
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
    ...mapActions('ingredients', [
      'getInitList',
      'getListItem',
      'updateItem',
      'deleteById',
      'createItem',
      'getListCategory',
    ]),
    async handlerFilter() {
      // console.log("filter....", this.filter)
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
        this.isFilter = false
      });
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
    handleEdit(item) {
      this.itemDraft = item
      this.itemDraft.isEdit = true
      this.showModalForm = true;
    },
    handleSubmitForm(data) {
      if (!data.isEdit) this.createItem(data)
      else this.updateItem(data)
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
      this.loading = true;
      this.currentPage = page;
      this.getListItem({
        preMaxPage: this.numberPageMax,
        nextPage: page,
        itemsPage: this.itemsPage,
        filter: this.filter
      }).finally(() => {
        this.loading = false;
        if (this.numberPageMax < page) {
          this.numberPageMax = page;
        }
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
<!--    {{listCategory}}-->
    <div class="row">
      <div class="col-24 pa-0">
        <div class="card">
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-sm-16">
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
              <div class="col-sm-8 d-flex flex-row-reverse">
                <button
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 120px"
                  id="popover-reactive-1"
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
                  title="Choose options filter"
                  title-class="text-black font-18"
                  body-class="p-3"
                  hide-footer
                >
                  <form @submit.prevent="handlerFilter();">
                    <div class="col-24 mb-3">
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
                    <div class="col-24 mb-3">
                      <div>
                        <label>Type</label>
                        <select
                          class="form-control"
                          @change="filter.type=$event.target.value"
                          :value="filter.type"
                        >
                          <option :value="null||''">-- None --</option>
                          <option :value="'normal'">Normal</option>
                          <option :value="'toServe'">ToServe</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-24 mb-3">
                      <div>
                        <label>Category</label>
                        <select
                          class="form-control"
                          @change="filter.categoryId=$event.target.value"
                          :value="filter.categoryId"
                        >
                          <option :value="null">-- None --</option>
                          <option v-for="item in listCategory" :key="item._id" :value="item._id">{{
                              item.name
                            }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="text-end mt-3">
                      <b-button variant="light" @click="isFilter=false;">Close</b-button>
                      <b-button type="submit" variant="success" class="ms-1"
                      >Filter Data
                      </b-button>
                    </div>
                  </form>
                </b-modal>
              </div>
              <DialogDelete
                :is-open="showModalDel"
                :label="itemDraft.name"
                title="Delete ingredients"
                @onClose="handleClosedDel"
                @onSubmit="handleSubmitDel"
              />
              <FormIngredients
                :item="itemDraft"
                :showModal="showModalForm"
                :categories="this.listCategory"
                @closed="handleClosedForm"
                @onSubmit="handleSubmitForm"
              />
              <div class="table-responsive" style="padding-left: 10px">
                <table class="table table-centered table-nowrap align-middle">
                  <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Unit</th>
                    <th>Category</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="item in itemsInPage" :key="item._id">
                    <td>{{ item.name }}</td>
                    <td>{{ item.type }}</td>
                    <td>{{ item.unit }}</td>
                    <td>{{ item.category ? item.category.name : '' }}</td>
                    <td style="cursor: pointer" @click="() => handleEdit(item)">
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
    </div>
  </Loading>
</template>
