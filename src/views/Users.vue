<script>
import {required} from "vuelidate/lib/validators";
import {mapActions, mapState} from "vuex";
import moment from "moment";
import axios from "axios";
import {USER} from "@/common/apiUrls";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";

/**
 * Customers component
 */
export default {
  page: {
    title: "Users",
  },
  validations: {
    customer: {
      email: {required},
    },
  },
  // eslint-disable-next-line vue/no-unused-components
  components: {Loading, PageHeader},
  computed: {
    ...mapState('users', ['data', 'totalItems', 'totalPages', 'usersInPage', 'dataMembership']),
  },
  async created() {
    try {
      this.loading = true
      await Promise.all([
        this.getInitListUsers({page: this.currentPage, itemsPage: this.itemsPage}),
        this.getInitMembership()
      ])
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  },
  data() {
    return {
      title: "Users",
      items: [],
      numberPageMax: 0,
      currentPage: 0,
      itemsPage: 15,
      loading: false,
      idItem: '',
      currentStatus: true,
      isFilter: false,
      filter: {
        name: '',
        email: '',
        membershipId: '',
        program: '',
      },
      status: 'all',
      usernameItem: '',
      showModalDel: false,
      showModalEdit: false,
      submitted: false,
      customer: {
        id: '',
        avatar: '',
        username: '',
        email: '',
        roles: '',
        status: '',
        address: '',
      },
      timerDebounce: null,
    };
  },
  methods: {
    ...mapActions('users', {
      getInitListUsers: 'getInitListUsers',
      getListUsers: 'getListUsers',
      updateUser: 'updateUser',
      deleteById: 'deleteById',
      setUsersInPage: 'setUsersInPage',
      getInitMembership: 'getInitMembership',
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
      this.getListUsers({
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
      this.loading = true
      this.currentPage = 0;
      this.numberPageMax = 0;

      this.getInitListUsers({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        filter: this.filter,
      }).finally(() => {
        this.loading = false
      });
    },
    async changeStatus() {
      try {
        const result = await axios.put(`${USER}/${this.idItem}`, {status: !this.customer.status})
        if (result && result?.data?._id) {
          const idx = this?.data?.users?.findIndex(u => u._id === this.idItem);
          if (idx === -1) return null;
          this.data.users[idx].status = result?.data?.status
        }
      } catch (e) {
        console.log(e);
      } finally {
        this.idItem = ''
        this.customer = {}
      }
    },
    async handleSubmitDel() {
      try {
        if (!this.idItem) return null;
        this.submitted = true;
        this.showModalDel = false;
        this.customer = {};
        await axios.delete(`${USER}/${this.idItem}`);
        this.idItem = ''
        this.usernameItem = ''
      } catch (e) {
        console.log(e)
      }
    },
    async handleSubmitEdit() {
      try {
        this.submitted = true;
        this.$v.$touch();
        if (this.$v.$invalid) {
          return null;
        } else {
          if (!this.customer) return null;
          this?.data?.users?.find(u => u._id === this.customer._id);
          const dataProfile = {
            _id: this.customer._id,
            myProgram: this.customer.myProgram || '',
            email: this.customer.email || '',
            showNutritional: this.customer.showNutritional || '',
            address: this.customer.address || '',
          }
          await this.updateUser(dataProfile, this.data.users)
          this.showModalEdit = false;
          this.customer = {};
          this.submitted = false
        }
      } catch (e) {
        console.log(e)
      }
    },
    onChangeTextSearch() {
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
            <b-navbar variant="faded" type="light">
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
                      <div class="mb-3">
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
                      <div class="mb-3">
                        <label>Email</label>
                        <input
                          id="filteremail"
                          v-model="filter.email"
                          type="text"
                          class="form-control"
                          placeholder="search name"
                        />
                      </div>
                    </div>
                    <div class="col-24">
                      <div class="mb-3">
                        <label>Program</label>
                        <input
                          id="filterProgram"
                          v-model="filter.program"
                          type="text"
                          class="form-control"
                          placeholder="search name"
                        />
                      </div>
                    </div>
                    <div class="col-24">
                      <div class="mb-3">
                        <label>Membership</label>
                        <select
                          class="form-control"
                          @change="filter.membershipId=$event.target.value"
                          :value="filter.membershipId"
                        >
                          <option :value="null">-- None --</option>
                          <option v-for="mem in dataMembership" :key="mem._id" :value="mem._id">
                            {{ mem.name }}
                          </option>
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
              <b-modal
                v-model="showModalDel"
                title="Delete Customer"
                hide-footer
                title-class="text-black font-18"
                body-class="p-3"
              >
                <label> You sure delete username : <b>{{ usernameItem }}</b></label>
                <form @submit.prevent="handleSubmitDel">
                  <div class="text-end pt-5 mt-3">
                    <b-button variant="light" @click="showModalDel = false">Close</b-button>
                    <b-button type="submit" class="ms-1" variant="danger">
                      Delete
                    </b-button>
                  </div>
                </form>
              </b-modal>
            </b-navbar>
            <div class="table-responsive" style="padding-left: 10px">
              <table class="table table-centered table-nowrap align-middle">
                <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Username</th>
                  <th>Phone / Email</th>
                  <th>Address</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Date Register</th>
                  <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="customers in usersInPage" :key="customers._id">
                  <td>
                    <v-avatar size="56" color="primary">
                      <img
                        v-if="customers.avatar"
                        v-bind:src="customers.avatar"
                      >
                      <span v-if="!customers.avatar" class="white--text text-h5">
                        {{ customers.username.split("")[0].toUpperCase() }}
                      </span>
                    </v-avatar>
                  </td>
                  <td>{{ customers.username }}</td>
                  <td>
                    <p class="mb-0">{{ customers.email }}</p>
                  </td>
                  <td style="max-width: 200px;overflow: hidden;">{{ customers.address }}</td>
                  <td>{{ customers.roles }}</td>
                  <td>
                    <toggle-button
                      :value="customers.status"
                      color="#82C7EB"
                      :labels="true"
                      :disabled="customers.roles === 'admin'"
                      v-on:change="idItem=customers._id;customer=customers;changeStatus()"/>
                  </td>
                  <td>{{ formatDate(customers.createdAt) }}</td>
                  <td style="cursor: pointer" v-if="customers.roles !== 'admin'"
                      @click="showModalDel=true; idItem=customers._id; usernameItem=customers.username">
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
