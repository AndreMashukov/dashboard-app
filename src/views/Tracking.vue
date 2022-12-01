<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import Loading from "../components/Loader";
import FormTracking from "../components/form/FormTracking";
import PageHeader from "../components/PageHeader";
import DialogDelete from "../components/DialogDelete";

/**
 * Customers component
 */
export default {
  page: {
    title: "Tracking Topics",
    meta: [
      {
        name: "TrackingTopic",
        content: "appConfig.description",
      },
    ],
  },
  components: {DialogDelete, FormTracking, Loading, PageHeader},
  computed: {
    ...mapState('trackings', ['totalItems', 'totalPages', 'itemsInPage', 'topics', 'listUsers']),
  },
  created() {
    this.loading = true
    this.getInitList({
      page: this.currentPage,
      itemsPage: this.itemsPage,
      typeTracking: this.typeTracking
    }).finally(() => {
      this.loading = false
    });
  },
  data() {
    return {
      title: "Tracking Topics",
      typeTracking: 'topic',
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
        topicId: '',
        userId: '',
        start: '',
        end: '',
        dateRange: '',

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
    ...mapActions('trackings', [
      'getInitList',
      'getListItem',
      'updateItem',
      'deleteById',
      'createItem',
      'searchName'
    ]),
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
        typeTracking: this.typeTracking,
        filter: this.filter
      }).finally(() => {
        this.loading = false;
        if (this.numberPageMax < page)
          this.numberPageMax = page;
      });
    },
    handlerFilter() {
      try {
        this.loading = true
        this.currentPage = 0;
        this.numberPageMax = 0;
        if(this.filter.dateRange){
          this.filter.start = moment().subtract(1,this.filter.dateRange).utc().format()
          this.filter.end = moment().utc().format()
        }else{
          delete this.filter.start
          delete this.filter.end
        }
        this.getInitList({
          page: this.currentPage,
          itemsPage: this.itemsPage,
          typeTracking: this.typeTracking,
          filter: this.filter
        })
      } catch (e) {
        console.log(e)
      } finally {
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
    changeTab(tab) {
      if (tab === 0) this.typeTracking = "topic"
      else if (tab === 1) this.typeTracking = "answer"
      this.loading = true
      this.currentPage = 0;
      this.numberPageMax = 0;
      this.loading = true
      this.getInitList({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        typeTracking: this.typeTracking,
        filter: this.filter
      }).finally(() => {
        this.loading = false
        this.filter = {}
      });
    },
    onChangeTextSearch(){
      if(this.filter.name === '')
        delete this.filter.name
      clearTimeout(this.timerDebounce);
      this.timerDebounce = setTimeout(this.handlerFilter, 500);
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
                  <div class="position-relative"
                       v-if="typeTracking === 'topic'">
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
                  v-if="this.typeTracking === 'topic'"
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 120px; cursor: pointer"
                  @click="showModalForm = true"
                >
                  <i class="mdi mdi-plus me-1"></i> Add
                </button>
                <button
                  v-if="typeTracking === 'answer'"
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 120px"
                  id="popover-reactive-1"
                  @click="isFilter = true"
                >
                  <i class="fas fa-filter"></i> Filter
                </button>
              </div>

              <div class="col-sm-24; right: 0px">
                <b-modal
                  v-model="isFilter"
                  title="Choose options filter "
                  title-class="text-black font-18"
                  body-class="p-3"
                  hide-footer
                >
                  <form @submit.prevent="handlerFilter();">

                    <div class="col-24 mb-3">
                      <div>
                        <label>Users</label>
                        <select class="form-control" @change="filter.userId=$event.target.value"
                                :value="filter.userId">
                          <!-- inline object literal -->
                          <option :value="null">-- None --</option>
                          <option v-for="top in listUsers" :key="top._id" :value="top._id">{{
                              top.email
                            }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-24 mb-3">
                      <div>
                        <label>Topic</label>
                        <select
                          class="form-control"
                          @change="filter.topicId=$event.target.value"
                          :value="filter.topicId"
                        >
                          <option :value="null">-- None --</option>
                          <option v-for="top in topics" :key="top._id" :value="top._id">{{
                              top.name
                            }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-24">
                      <div>
                        <label>Date Time</label>
                        <select class="form-control" @change="filter.dateRange=$event.target.value"
                                :value="filter.dateRange">
                          <!-- inline object literal -->
                          <option :value="null">-- None --</option>
                          <option :value="'week'">Week</option>
                          <option :value="'month'">Month</option>
                        </select>
                      </div>
                    </div>


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
            <b-tabs content-class="mt-3">
              <b-tab title="TRACKING TOPIC" active @click="changeTab(0)"></b-tab>
              <b-tab title="TRACKING ANSWER" @click="changeTab(1)"></b-tab>
            </b-tabs>
            <DialogDelete
              :is-open="showModalDel"
              :label="itemDraft.name"
              title="Delete Customer"
              @onClose="handleClosedDel"
              @onSubmit="handleSubmitDel"
            />
            <FormTracking
              :item="itemDraft"
              :showModal="showModalForm"
              @closed="handleClosedForm"
              @onSubmit="handleSubmitForm"
            />
            <div class="table-responsive" style="padding-left: 10px" v-if="typeTracking === 'topic'">
              <table class="table table-centered table-nowrap align-middle">
                <thead>
                <tr>
                  <th>Index</th>
                  <th>Name</th>
                  <th>Question</th>
                  <th>Type</th>
                  <th>Options</th>
                  <th>Description</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in itemsInPage" :key="item._id">
                  <td>{{ item.index }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.question }}</td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.options.map(op => " " + op.value).toString() }}</td>
                  <td>{{ item.description }}</td>
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
            <div class="table-responsive" style="padding-left: 10px" v-else>
              <table class="table table-centered table-nowrap align-middle">
                <thead>
                <tr>
                  <th>Question</th>
                  <th>Type</th>
                  <th>User</th>
                  <th>Answer</th>
                  <th>Date Answer</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in itemsInPage" :key="item._id">
                  <td>{{ item.dataTopic ? item.dataTopic.question : "" }}</td>
                  <td>{{ item.dataTopic ? item.dataTopic.type : "" }}</td>
                  <td>{{ item.profile ? item.profile.email : "" }}</td>
                  <td>{{ item.dataTopic ? item.dataTopic.answer : "" }}</td>
                  <td>{{ formatDate(item.createdAt) }}</td>
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
