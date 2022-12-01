<script>
import moment from "moment";
import {mapActions, mapState} from "vuex";
import Loading from "@/components/Loader";
import DialogDelete from "@/components/DialogDelete";
import FormCommon from "@/components/form/FormCommon";

export default {
  components: {DialogDelete, Loading, FormCommon},
  computed: {
    ...mapState('membershipType', ['totalItems', 'totalPages', 'itemsInPage']),
  },
  created() {
    this.loading = true
    this.getInitList({page: this.currentPage, itemsPage: this.itemsPage}).finally(() => {
      this.loading = false
    });
  },
  data() {
    return {
      title: "type of Membership",
      items: [],
      search: '',
      numberPageMax: 0,
      currentPage: 0,
      itemsPage: 15,
      loading: false,
      status: "all",
      currentStatus: true,
      filter: {},
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
    ...mapActions('membershipType', [
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
  },
}
</script>

<template>
  <Loading :loading="loading">
    <div class="card">
      <div class="card-body" style="border: 0px">
        <b-navbar variant="faded" type="light">
          <div class="col-sm-8">
            <label style="margin-bottom: 0">MEMBERSHIP TYPE </label>
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
        </b-navbar>
        <DialogDelete
          :is-open="showModalDel"
          :label="itemDraft.name"
          title="Delete type of membership"
          @onClose="handleClosedDel"
          @onSubmit="handleSubmitDel"
        />
        <FormCommon
          :item="itemDraft"
          :showModal="showModalForm"
          title="type of membership"
          @closed="handleClosedForm"
          @onSubmit="handleSubmitForm"
        />
        <div class="row">
          <div class="col-xl-24 pb-2">
            <div class="table-responsive" style="padding-left: 10px">
              <table class="table table-centered table-nowrap align-middle">
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created at</th>
                  <th>Updated at</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in itemsInPage" :key="item._id">
                  <td>{{ item.name }}</td>
                  <td>{{ item.description }}</td>
                  <td>{{ formatDate(item.createdAt) }}</td>
                  <td>{{ formatDate(item.updatedAt) }}</td>
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
          </div>
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
  </Loading>
</template>
