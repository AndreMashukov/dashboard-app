<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import PageHeader from "@/components/PageHeader";
import Loading from "../components/Loader";
import DetailsPayment from "../components/DetailsPayment";
import DatePicker from 'vue2-datepicker';

/**
 * Customers component
 */
export default {
  page: {
    title: "Payments",
  },
  // eslint-disable-next-line vue/no-unused-components
  components: {Loading, DetailsPayment, DatePicker, PageHeader},
  computed: {
    ...mapState('payments', ['totalItems', 'totalPages', 'itemsInPage', 'dataMembership']),
  },
  created() {
    // console.log("Created....")
    this.loading = true
    this.getInitList({page: this.currentPage, itemsPage: this.itemsPage}).finally(() => {
      this.loading = false
    });
    this.getInitMembership()
  },
  data() {
    return {
      title: "Payment",
      items: [],
      search: '',
      numberPageMax: 0,
      currentPage: 0,
      itemsPage: 15,
      loading: false,
      idItem: '',
      currentStatus: true,
      isFilter: false,
      filter: {
        email: '',
        membership: '',
        start: '',
        end: '',
      },
      daterange: [],
      usernameItem: '',
      showModalDel: false,
      showModalEdit: false,
      submitted: false,
      customer: {},
      timerDebounce: null,
    };
  },
  methods: {
    ...mapActions('payments', {
      getInitList: 'getInitList',
      getListItem: 'getListItem',
      getInitMembership: 'getInitMembership',
      updateItem: 'updateItem',
      deleteById: 'deleteById',
    }),
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
    handlerFilter() {
      try {
        this.loading = true
        this.currentPage = 0;
        this.numberPageMax = 0;
        if (this.daterange?.length && this.daterange[0] && this.daterange[1]) {
          this.filter.start = moment(this.daterange[0]).format('YYYY-MM-DD')
          this.filter.end = moment(this.daterange[1]).add(1, 'day').format('YYYY-MM-DD')
        }
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
    async changeStatus() {
      try {
        if (!this.idItem) return null;
        // let newStatus = this.customer.status ? 0 : 1
        // const res = await axios.put(`${}/${this.idItem}`, {status: newStatus})
        // if (res.data && res.data._id) {
        //   const idx = this?.itemsInPage?.findIndex(u => u._id === this.idItem);
        //   if (idx === -1) return null;
        //   this.itemsInPage[idx].status = res?.data?.status
        // }
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
    onChangeTextSearch(){
      if(this.filter.email === '') delete this.filter.email
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
              <div class="row mb-3">
                <div class="col-sm-8">
                  <div class="search-box me-2 mb-2 d-inline-block">
                    <div class="position-relative">
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Search email..."
                        v-model="filter.email"
                        v-on:input="onChangeTextSearch();"
                      />
                      <i class="bx bx-search-alt search-icon"></i>
                    </div>
                  </div>
                </div>

                <div class="col-sm-24" style="position: absolute; right: 0px; max-width: 150px;">
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
                    <form @submit.prevent="handlerFilter();">
                      <div class="col-24">
                        <div>
                          <label>Email</label>
                          <input
                            id="filteremail"
                            v-model="filter.email"
                            type="text"
                            class="form-control"
                            placeholder="search email"
                          />
                        </div>
                      </div>
                      <div class="col-24">
                        <label>Date Range</label>
                        <br/>
                        <date-picker v-model="daterange" range append-to-body lang="en" confirm></date-picker>
                      </div>


                      <div class="col-24">
                        <div>
                          <label>Status</label>
                          <select class="form-control" @change="filter.status = $event.target.value;"
                                  :value=filter.status>
                            <!-- inline object literal -->
                            <option v-bind:value="null">-- None ---</option>
                            <option v-bind:value="'succeeded'">Succeeded</option>
                            <option v-bind:value="'pending'">Pending</option>
                          </select>
                        </div>
                      </div>

                      <div class="col-24">
                        <div>
                          <label>Membership</label>
                          <select class="form-control" @change="filter.membershipId=$event.target.value"
                                  :value="filter.membershipId">
                            <!-- inline object literal -->
                            <option :value="null">-- None --</option>
                            <option v-for="mem in dataMembership" :key="mem._id" :value="mem._id">{{
                                mem.name
                              }}
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

              </div>
              <div class="table-responsive" style="padding-left: 10px">
                <table class="table table-centered table-nowrap align-middle">
                  <thead>
                  <tr>
                    <th>{{ "Payment Id" }}</th>
                    <th>{{ "User" }}</th>
                    <th>{{ "Membership" }}</th>
                    <th>{{ "Promo/AIA" }}</th>
                    <th>{{ "Price" }}</th>
                    <th>{{ "Status" }}</th>
                    <th>{{ "Date" }}</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="item in itemsInPage" :key="item._id">
                    <td>{{ item._id }}</td>
                    <td>
                      <v-avatar size="30" color="primary">
                        <img
                          v-if="item.profile.avatar"
                          v-bind:src="item.profile.avatar"
                        >
                        <span v-if="!item.profile.avatar" class="white--text text-h5">
                        {{ item.profile.email.split("")[0].toUpperCase() }}
                      </span>
                      </v-avatar>
                      <span style="padding-left: 5px">{{ " " + item.profile.email }}</span>
                    </td>
                    <td><span v-if="item.membership">
                      {{ item.membership.name }} -
                    </span>
                      <span v-if="item.membership">
                      (${{ item.membership.price }})
                    </span>
                    </td>
                    <td>{{ item.promoCode || item.aiaCode || '' }}</td>
                    <td>{{ item.price }}</td>
                    <td>{{ item.status }}</td>
                    <td v-if="item.createdAt">{{ formatDate(item.createdAt) }}</td>
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
