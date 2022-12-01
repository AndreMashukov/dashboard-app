<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import axios from "axios";
import {AIA_CODE, CODE_TYPE_URL, PROMO_CODE} from "@/common/apiUrls";

/**
 * Customers component
 */
export default {
  page: {
    title: "Code",
  },
  // eslint-disable-next-line vue/no-unused-components
  components: {Loading, PageHeader},
  computed: {
    ...mapState('codes', ['totalItems', 'totalPages', 'itemsInPage']),
  },
  created() {
    this.loading = true
    this.getInitList({page: this.currentPage, itemsPage: this.itemsPage}).finally(() => {
      this.loading = false
    });
  },
  data() {
    return {
      title: "Code",
      items: [],
      search: '',
      typeCode: 'promo',
      numberPageMax: 0,
      currentPage: 0,
      nextPage: 0,
      itemsPage: 15,
      loading: false,
      idItem: '',
      itemAudioPlay: '',
      audioLink: '',
      currentStatus: true,
      isFilter: false,
      filter: {},
      nameItem: '',
      showModalDel: false,
      showModalEdit: false,
      showModal: false,
      submitted: false,
      typeModel: 'create',
      customer: {},
      dfCodePromo: {
        autoGenerate: true,
        percent: 0,
        price: 5,
        promoCode: '',
      },
      dfCodeAIA: {
        autoGenerate: true,
        price: 5,
        email: 'example@gmail.com'
      }
    };
  },
  methods: {
    ...mapActions('codes', {
      getInitList: 'getInitList',
      getListItem: 'getListItem',
      setItemsInPage: 'setItemsInPage',
      updateItem: 'updateItem',
      deleteById: 'deleteById',
      searchName: 'searchName',
    }),
    formatDate(value) {
      if (value) {
        return moment(value).format('YYYY-MM-DD hh:mm')
      }
    },
    changeTab(numberTab = 0) {
      if (numberTab === 0 && this.typeCode === 'promo') return null
      if (numberTab === 1 && this.typeCode === 'aia') return null
      this.loading = true;
      this.currentPage = 0;
      this.numberPageMax = 0;
      this.typeCode = !numberTab ? "promo" : "aia";
      this.getInitList({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        type: this.typeCode
      }).finally(() => {
        this.loading = false
        this.filter = {}
      });
    },
    changePage(page) {
      page--;
      this.currentPage = page;
      this.loading = true;
      this.getListItem({
        preMaxPage: this.numberPageMax,
        nextPage: page,
        itemsPage: this.itemsPage,
        type: this.typeCode,
        filter: this.filter
      }).finally(() => {
        this.loading = false;
        if (this.numberPageMax < page)
          this.numberPageMax = page;
      });
    },
    async changeStatus() {
      try {
        if (!this.idItem) return null;
        let newStatus = this.customer.status ? 0 : 1
        // console.log({newStatus})
        const res = await axios.put(`${CODE_TYPE_URL(this.typeCode)}/${this.idItem}`, {status: newStatus})
        if (res.data && res.data._id) {
          const idx = this?.itemsInPage?.findIndex(u => u._id === this.idItem);
          if (idx === -1) return null;
          this.itemsInPage[idx].status = res?.data?.status
        }
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
        this.deleteById({id: this.idItem, type: this.typeCode})
      } catch (e) {
        console.log(e)
      } finally {
        this.idItem = ''
        this.nameItem = ''
        this.showModalDel = false
      }
    },
    selected(event) {
      this.customer.autoGenerate = event.target.value || false
    },
    async handleSubmitCreate() {
      try {
        this.submitted = true;
        this.loading = true
        if (this.typeCode === 'promo') {
          await axios.post(PROMO_CODE, this.customer);
          await this.getInitList({page: 0, itemsPage: this.itemsPage, type: this.typeCode})
        } else {
          await axios.post(AIA_CODE, this.customer);
          await this.getInitList({page: 0, itemsPage: this.itemsPage, type: this.typeCode})
        }
      } catch (e) {
        console.log(e)
      } finally {
        this.showModal = false
        this.loading = false
        this.submitted = false
      }
    },
    async handleSubmitUpdate() {
      try {
        await this.updateItem({code: this.customer, type: this.typeCode})
        this.submitted = false
      } catch (e) {
        console.log(e)
      } finally {
        this.showModal = false
        this.clearState()
        this.customer = {}
      }
    },
    getTitle() {
      let tit = ''
      if (this.typeModel === 'create') {
        tit += "Create " + this.typeCode
      } else if (this.typeModel === 'edit') {
        this.typeCode === 'aia' ? tit += "Edit " + this.typeCode + " name: " + this.customer.code : tit += "Edit " + this.typeCode + " name: " + this.customer.promoCode
      }
      return tit;
    },
    handlerFilter() {
      try {
        this.loading = true
        this.currentPage = 0;
        this.numberPageMax = 0;
        this.getInitList({
          page: this.currentPage,
          itemsPage: this.itemsPage,
          type: this.typeCode,
          filter: this.filter,
        })
      } catch (e) {
        console.log(e)
      }finally {
        this.loading = false
        this.isFilter = false
      }
    },
    onChangeTextSearch(){
      // if(this.typeCode === 'aia' && this.filter.email === '')
      //   delete this.filter.email
      if(this.filter.code === '')
        delete this.filter.code
      clearTimeout(this.timerDebounce);
      this.timerDebounce = setTimeout(this.handlerFilter, 500);
    }
  },
};
</script>

<template>
    <Loading :loading="loading">
      <PageHeader :title="title" :items="items"/>
      <!--      {{ itemsInPage }}}-->
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
                        placeholder="Search code..."
                        v-model="filter.code"
                        v-on:input="onChangeTextSearch();"
                      />
<!--                      <input-->
<!--                        v-if="typeCode === 'aia'"-->
<!--                        type="text"-->
<!--                        class="form-control"-->
<!--                        placeholder="Search email..."-->
<!--                        v-model="filter.email"-->
<!--                        v-on:input="onChangeTextSearch();"-->
<!--                      />-->
                      <i class="bx bx-search-alt search-icon"></i>
                    </div>
                  </div>
                </div>
                <b-modal v-model="showModalDel"
                         title="Delete Customer"
                         hide-footer
                         title-class="text-black font-18"
                         body-class="p-3">
                  <label> You sure delete : <b>{{ nameItem }}</b></label>
                  <form @submit.prevent="handleSubmitDel">
                    <div class="text-end pt-5 mt-3">
                      <b-button variant="light" @click="showModalDel = false">Close</b-button>
                      <b-button type="submit" class="ms-1" variant="danger">
                        Delete
                      </b-button>
                    </div>
                  </form>
                </b-modal>
                <b-modal
                  v-model="showModal"
                  :title="getTitle()"
                  title-class="text-black font-18"
                  body-class="p-3"
                  hide-footer
                >
                  <form @submit.prevent="typeModel === 'create' ?handleSubmitCreate() : handleSubmitUpdate()">
                    <div class="row">
                      <div class="col-24" v-if="typeModel==='create'">
                        <div class="mb-3">
                          <label>Auto generate code</label>
                          <select class="form-control" @change="selected($event)" :value=customer.autoGenerate>
                            <!-- inline object literal -->
                            <option v-bind:value="false" v-if="typeCode === 'promo'">false</option>
                            <option v-bind:value="true">true</option>
                          </select>
                        </div>
                      </div>
                      <div class="col-24" v-if="typeCode === 'promo' && typeModel==='create'">
                        <div class="mb-3">
                          <label for="promoCode">Code</label>
                          <input
                            id="promoCode"
                            :disabled="false"
                            v-model="customer.promoCode"
                            type="text"
                            class="form-control"
                            placeholder="If you choose don't auto=> insert code here"
                            :class="{
                                'is-invalid':
                                  submitted && $v.customer.promoCode.$error,
                              }"
                          />
                          <div
                            v-if="submitted && !$v.customer.promoCode.required"
                            class="invalid-feedback"
                          >
                            This value is required.
                          </div>
                        </div>
                      </div>
                      <div class="col-24">
                        <div class="mb-3">
                          <label for="percent">Percent(%)</label>
                          <input
                            id="percent"
                            min="0"
                            v-model="customer.percent"
                            type="number"
                            class="form-control"
                            placeholder="Insert percent"
                            onchange="if(customer.percent < 0) {customer.percent = 0}"
                            :class="{
                                'is-invalid':
                                  submitted && $v.customer.percent.$error,
                              }"
                          />
                          <div
                            v-if="submitted && !$v.customer.percent.required"
                            class="invalid-feedback"
                          >
                            This value is required.
                          </div>
                        </div>
                      </div>
                      <div class="col-24" v-if="typeCode === 'aia' && typeModel==='create'">
                        <div class="mb-3">
                          <label for="email">Email</label>
                          <input
                            id="email"
                            v-model="customer.email"
                            type="email"
                            class="form-control"
                            placeholder="Insert email"
                            :class="{
                                'is-invalid':
                                  submitted && $v.customer.email.$error,
                              }"
                          />
                          <div
                            v-if="submitted && !$v.customer.email.required"
                            class="invalid-feedback"
                          >
                            This value is required.
                          </div>
                        </div>
                      </div>
                      <div class="col-24" v-if="typeCode === 'promo'">
                        <div class="mb-3">
                          <label for="price">Price($)</label>
                          <input
                            id="price"
                            v-model="customer.price"
                            type="number"
                            min="0"
                            class="form-control"
                            placeholder="Insert price"
                            :class="{
                                'is-invalid':
                                  submitted && $v.customer.price.$error,
                              }"
                          />
                          <div
                            v-if="submitted && !$v.customer.price.required"
                            class="invalid-feedback"
                          >
                            This value is required.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="text-end pt-5 mt-3">
                      <b-button variant="light" @click="showModal = false">Close</b-button>
                      <b-button type="submit" variant="success" class="ms-1"
                      >Submit
                      </b-button
                      >
                    </div>
                  </form>
                </b-modal>
                <div class="col-sm-4" style="position: absolute; right: 0px; max-width: 150px;">
                  <button
                    type="button"
                    class="btn btn-success btn-rounded mb-2 me-2"
                    style="min-width: 120px"
                    @click="typeCode === 'promo' ? customer={...dfCodePromo} : customer={...dfCodeAIA} ;showModal=true;typeModel='create';"
                  >
                    <i class="mdi mdi-plus me-1"></i> New Code
                  </button>
                </div>
              </div>
              <!--              tabs-->
              <b-tabs content-class="mt-3">
                <b-tab title="PROMO CODE" active @click="changeTab(0)"></b-tab>
                <b-tab title="AIA CODE" @click="changeTab(1)"></b-tab>
              </b-tabs>
              <div class="table-responsive" style="padding-left: 10px">
                <table class="table table-centered table-nowrap align-middle">
                  <thead>
                  <tr>
                    <th>{{ "Code" }}</th>
                    <th v-if="typeCode==='promo'">{{ "Price" }}</th>
                    <th>{{ "Percent" }}</th>
                    <th v-if="typeCode==='promo'">{{ "NumberOfUse" }}</th>
                    <th v-if="typeCode==='aia'">{{ "Email" }}</th>
                    <th>{{ "Stripe Coupon Id" }}</th>
                    <th>{{ "Stripe Code Id" }}</th>
                    <th>{{ "Created At" }}</th>
                    <th v-if="typeCode==='aia'">{{ "Status" }}</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                  </thead>

                  <tbody v-if="typeCode === 'promo'">
                  <tr v-for="item in itemsInPage" :key="item._id">
                    <td>{{ item.promoCode }}</td>
                    <td>{{ item.price }}</td>
                    <td>{{ item.percent }}</td>
                    <td>{{ item.numberOfUse }}</td>
                    <td>{{ item.couponId }}</td>
                    <td>{{ item.codeId }}</td>
                    <td>{{ formatDate(item.createdAt) }}</td>


                    <td style="cursor: pointer"
                        @click="showModal=true;customer={...item};typeModel='edit';">
                      <i class="fas fa-edit text-danger me-1"></i>
                    </td>


                    <td style="cursor: pointer"
                        @click="showModalDel=true; idItem=item._id; nameItem=item.promoCode">
                      <i class="fas fa-trash-alt text-danger me-1"></i>
                    </td>
                  </tr>
                  </tbody>
                  <tbody v-else-if="typeCode === 'aia'">
                  <tr v-for="item in itemsInPage" :key="item._id">
                    <td>{{ item.code }}</td>
                    <td>{{ item.percent }}</td>
                    <td>{{ item.email }}</td>
                    <td>{{ item.couponId }}</td>
                    <td>{{ item.codeId }}</td>
                    <td>{{ formatDate(item.createdAt) }}</td>
                    <td>
                      <toggle-button :value="item.status" color="#82C7EB" :labels="true"
                                     v-on:change="idItem=item._id;customer=item;changeStatus()"/>
                    </td>

                    <td style="cursor: pointer"
                        @click="showModal=true;customer={...item};typeModel='edit';">
                      <i class="fas fa-edit text-danger me-1"></i>
                    </td>


                    <td style="cursor: pointer" @click="showModalDel=true; idItem=item._id; nameItem=item.code">
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
      <!-- end row -->
    </Loading>
</template>
