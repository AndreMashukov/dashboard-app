<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import DialogDelete from "@/components/DialogDelete";
import FormCampaign from "@/components/form/FormCampaign";

/**
 * Customers component
 */
export default {
  page: {
    title: "Campaign",
    meta: [
      {
        name: "Campaign",
        content: "appConfig.description",
      },
    ],
  },
  components: {DialogDelete, Loading, PageHeader, FormCampaign},
  computed: {
    ...mapState('campaign', ['totalItems', 'totalPages', 'itemsInPage', 'listMembership']),
  },
  created() {
    this.loading = true
    this.getInitList({page: this.currentPage, itemsPage: this.itemsPage})
      .finally(() => {
        this.loading = false
      });
    this.getListMembership()
  },
  data() {
    return {
      title: "Campaigns",
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
      showModalEdit: false,
      showModalForm: false,
      submitted: false,
      customer: {},
      timerDebounce: null,
    };
  },
  methods: {
    ...mapActions('campaign', [
      'getInitList',
      'getListItem',
      'updateItem',
      'deleteById',
      'createItem',
      "getListMembership"
    ]),
    formatDate(value, isDate) {
      if (!moment(value)) return null
      if (isDate)
        return moment(value).format('YYYY-MM-DD')
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
        filter: this.filter,
      }).finally(() => {
        this.loading = false
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
      if (!data.isEdit)
        this.createItem(data)
      else
        this.updateItem(data)
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
      if (this?.filter?.name === '') delete this.filter.name;
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
              title="Delete Campaign"
              @onClose="handleClosedDel"
              @onSubmit="handleSubmitDel"
            />
            <FormCampaign
              :item="itemDraft"
              :showModal="showModalForm"
              :listMembership="listMembership"
              title="Campaign"
              @closed="handleClosedForm"
              @onSubmit="handleSubmitForm"
            />
            <div class="table-responsive" style="padding-left: 10px">
              <table class="table table-centered table-nowrap align-middle">
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Memberships</th>
                  <th>Time campaign</th>
                  <th>CreatedAt</th>
                  <th>UpdatedAt</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in itemsInPage" :key="item._id">
                  <td>{{ item.name }}</td>
                  <td>
                    <div v-if="item.idsMembership.length">
                    {{
                        item.idsMembership.map(i => {
                          return listMembership.find(e => e._id === i) ? listMembership.find(e => e._id === i).name : ""
                        }).toString()
                      }}
                    </div>

                  </td>
                  <td>{{ item.start ? formatDate(item.start, true) + " - " : '' }}
                    {{ item.end ? formatDate(item.end, true) : '' }}
                  </td>
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
