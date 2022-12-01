<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import DialogDelete from "@/components/DialogDelete";
import FormMembership from "@/components/form/FormMembership";

/**
 * Customers component
 */
export default {
  page: {
    title: "Membership",
    meta: [
      {
        name: "Membership",
        content: "appConfig.description",
      },
    ],
  },
  components: {DialogDelete, Loading, PageHeader, FormMembership},
  computed: {
    ...mapState('membership', ['totalItems', 'totalPages', 'itemsInPage', 'membershipType']),
  },
  created() {
    this.loading = true
    Promise.all([
      this.getInitList({page: this.currentPage, itemsPage: this.itemsPage}),
      this.getMembershipType(),
    ]).finally(() => {
      this.loading = false
    })
  },
  data() {
    return {
      title: "Membership",
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
      checkFoundation: "-- Please select --",
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
    ...mapActions('membership', [
      'getInitList',
      'getListItem',
      'getMembershipType',
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
      const dataSearch = this.membershipType.find(e => e.name === this.checkFoundation)
      if (dataSearch) {
        this.filter.typeMembershipId = dataSearch._id
      } else {
        delete this.filter.typeMembershipId
      }
      this.getInitList({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        filter: this.filter,
      }).finally(() => {
        this.loading = false
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
    onChangeTextSearch() {
      if (this.filter.name === '') delete this.filter.name
      clearTimeout(this.timerDebounce);
      this.timerDebounce = setTimeout(this.changeFilter, 1000);
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
                  @click="showModalForm = true"
                >
                  <i class="mdi mdi-plus me-1"></i> Add
                </button>
              </div>
              <div class="col-sm-24" style="position: absolute; right: 120px; max-width: 150px;">
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
                  title="Choose options filter "
                  title-class="text-black font-18"
                  body-class="p-3"
                  hide-footer
                >
                  <form @submit.prevent="changeFilter();">
                    <div class="col-24">
                      <div class="mb-3">
                        <label>Membership type</label>
                        <b-form-select
                          class="form-select"
                          v-model="checkFoundation"
                          :options="membershipType.length ? ['-- Please select --'].concat([...membershipType].map(e => e.name)) : ['-- Please select --']"
                        ></b-form-select>
                      </div>
                    </div>
                    <div class="text-end pt-5 mt-3">
                      <b-button variant="light" @click="isFilter=false;">Close</b-button>
                      <b-button type="submit" variant="success" class="ms-1"
                      >Filter
                      </b-button>
                    </div>
                  </form>
                </b-modal>
              </div>

            </b-navbar>
            <DialogDelete
              :is-open="showModalDel"
              :label="itemDraft.name"
              title="Delete membership"
              @onClose="handleClosedDel"
              @onSubmit="handleSubmitDel"
            />
            <FormMembership
              :item="itemDraft"
              :showModal="showModalForm"
              :membershipType="membershipType"
              title="membership"
              @closed="handleClosedForm"
              @onSubmit="handleSubmitForm"
            />
            <div class="table-responsive" style="padding-left: 10px">
              <table class="table table-centered table-nowrap align-middle">
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Type Name </th>
                  <th>Type Time</th>
                  <th>Time</th>
                  <th>Price</th>
                  <th>Number Of Use</th>
                  <th>Amount Of Saving</th>
                  <th>Description</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in itemsInPage" :key="item._id">
                  <td>{{ item.name }}</td>
                  <td>{{ item.typeName }}</td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.time }}</td>
                  <td>{{ item.price }}</td>
                  <td>{{ item.count }}</td>
                  <td>{{ item.amountOfSaving }}</td>
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
