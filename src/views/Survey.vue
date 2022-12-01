<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import DialogDelete from "@/components/DialogDelete";
import FormSurvey from "@/components/FormSurvey";

/**
 * Customers component
 */
export default {
  page: {
    title: "Survey",
    meta: [
      {
        name: "Survey",
        content: "appConfig.description",
      },
    ],
  },
  components: {DialogDelete, Loading, PageHeader, FormSurvey},
  computed: {
    ...mapState('surveys', ['totalItems', 'totalPages', 'itemsInPage']),
  },
  created() {
    this.loading = true
    this.getInitList({page: this.currentPage, itemsPage: this.itemsPage}).finally(() => {
      this.loading = false
    });
  },
  data() {
    return {
      title: "Survey",
      items: [],
      numberPageMax: 0,
      currentPage: 0,
      itemsPage: 15,
      loading: false,
      status: "all",
      currentStatus: true,
      isFilter: false,
      filter: {
        field: '',
        value: ''
      },
      itemDraft: {},
      showModalDel: false,
      showModalEdit: false,
      showModalForm: false,
      submitted: false,
      customer: {},
    };
  },
  methods: {
    ...mapActions('surveys', [
      'getInitList',
      'getListItem',
      'updateItem',
      'deleteById',
      'createItem',
    ]),
    formatDate(value) {
      if (value) {
        return moment(value).format('YYYY-MM-DD hh:mm')
      }
    },
    changeFilter() {
      this.loading = true
      this.currentPage = 0;
      this.numberPageMax = 0;
      this.getInitList({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        [`${this.filter.key}`]: this.filter.value,
      }).finally(() => {
        this.loading = false
        this.filter = {}
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
      this.loading = true
      const nextPage = page - 1;
      this.getListItem({
          preMaxPage: this.numberPageMax,
          nextPage: nextPage,
          itemsPage: this.itemsPage,
        }
      ).finally(() => {
        this.loading = false
      });
      if (this.numberPageMax < nextPage) {
        this.numberPageMax = nextPage
      }
      this.currentPage = page
    },
  },
};
</script>

<template>
  <Loading :loading="loading">
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-12 pa-0">
        <div class="card">
          <div class="card-body">
            <b-navbar variant="faded" type="light">
              <div class="col-sm-4">
                <div class="search-box me-2 mb-2 d-inline-block">
                  <div class="position-relative">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search..."
                    />
                    <i class="bx bx-search-alt search-icon"></i>
                  </div>
                </div>
              </div>
              <v-spacer></v-spacer>
              <div class="col-sm-4 d-flex flex-row-reverse">
                <button
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 120px"
                  @click="showModalForm = true"
                >
                  <i class="mdi mdi-plus me-1"></i> Add
                </button>
              </div>
            </b-navbar>
            <DialogDelete
              :is-open="showModalDel"
              :label="itemDraft.name"
              title="Delete survey"
              @onClose="handleClosedDel"
              @onSubmit="handleSubmitDel"
            />
            <FormSurvey
              :item="itemDraft"
              :showModal="showModalForm"
              title="survey"
              @closed="handleClosedForm"
              @onSubmit="handleSubmitForm"
            />
            <div class="table-responsive" style="padding-left: 10px">
              <table class="table table-centered table-nowrap align-middle">
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Questions</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in itemsInPage" :key="item._id">
                  <td>{{ item.name }}</td>
                  <td>{{ item.status }}</td>
                  <td>
                    <b-card no-body v-for="qt in item.questions" :key="qt._id" class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button block v-b-toggle="`accordion-${qt._id}`" variant="outline-info">{{ qt.numberOfAnswers + ". " + qt.question}}</b-button>
                      </b-card-header>
                      <b-collapse :id="`accordion-${qt._id}`" visible accordion="my-accordion" role="tabpanel">
                        <b-card-body>
                          <b-card-text v-for="op in qt.options" :key="op">{{ op }}</b-card-text>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                  </td>
                  <td>{{ formatDate(item.startDate) }}</td>
                  <td>{{ formatDate(item.endDate) }}</td>
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
                      v-model="currentPage"
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
