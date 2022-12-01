<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import DialogDelete from "@/components/DialogDelete";
import FormSurvey from "@/components/form/FormSurvey";
import FilterSurvey from "@/components/filter/FilterSurvey";
import ListSurvey from "./tabs/ListSurvey";
import ListSurveyAnswer from "./tabs/ListSurveyAnswer";

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
  components: {
    DialogDelete,
    Loading,
    PageHeader,
    FormSurvey,
    ListSurvey,
    ListSurveyAnswer,
    FilterSurvey,
  },
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
      search: '',
      numberPageMax: 0,
      currentPage: 0,
      itemsPage: 15,
      loading: false,
      status: "all",
      currentStatus: true,
      isFilter: false,
      filter: {},
      itemDraft: {},
      showModalDel: false,
      showModalFilter: false,
      showModalEdit: false,
      showModalForm: false,
      submitted: false,
      customer: {},
      typeTab: 'survey',
      timerDebounce: null,
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
      // console.log({item})
      this.itemDraft = item
      this.itemDraft.isEdit = true
      this.showModalForm = true;
    },
    handleSubmitForm(data) {
      if (!data.isEdit) this.createItem(data)
      else this.updateItem(data)
      this.handleClosedForm()
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
        type: this.typeTab,
        search: this.filter,
      }).finally(() => {
        this.loading = false;
        if (this.numberPageMax < page)
          this.numberPageMax = page;
      });
    },
    changeTab(numberTab = 0) {
      if (numberTab === 0 && this.typeTab === 'survey') return null
      if (numberTab === 1 && this.typeTab === 'surveyAnswer') return null
      this.loading = true;
      this.currentPage = 0;
      this.numberPageMax = 0;
      this.typeTab = !numberTab ? "survey" : "surveyAnswer";
      this.getInitList({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        type: this.typeTab,
      }).finally(() => {
        this.loading = false
        this.filter = {}
      });
    },
    onChangeTextSearch() {
      clearTimeout(this.timerDebounce);
      this.timerDebounce = setTimeout(() => {
        this.handlerFilter({...this.filter})
      }, 1000);
    },
    handlerFilter(event) {
      this.loading = true
      this.currentPage = 0;
      this.numberPageMax = 0;
      this.filter = event;
      this.getInitList({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        type: this.typeTab,
        search: event,
      }).finally(() => {
        this.loading = false
      });
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
                  @click="showModalFilter = true"
                >
                  <i class="fas fa-filter"></i> Filter
                </button>
                <filter-survey
                  :is-open="showModalFilter"
                  :type-tab="typeTab"
                  @onClosed="showModalFilter = false;"
                  @onSubmit="handlerFilter"
                />
                <button
                  v-if="typeTab === 'survey'"
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
            <b-tabs content-class="mt-3">
              <b-tab title="SURVEY" active @click="changeTab(0)">
                <list-survey
                  :items="itemsInPage"
                  :total-items="totalItems"
                  :items-page="itemsPage"
                  :current-page="currentPage"
                  @handleEdit="handleEdit($event);"
                  @handleDelete="handleDelete($event)"
                  @handlePage="changePage"
                />
              </b-tab>
              <b-tab title="SURVEY ANSWER" @click="changeTab(1)">
                <ListSurveyAnswer
                  :items="itemsInPage"
                  :total-items="totalItems"
                  :items-page="itemsPage"
                  :current-page="currentPage"
                  @handlePage="changePage"
                />
              </b-tab>
            </b-tabs>
          </div>
        </div>
      </div>
    </div>
  </Loading>
</template>
