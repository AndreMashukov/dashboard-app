<script>
import {required} from "vuelidate/lib/validators";
import {mapActions, mapState} from "vuex";
import Avatar from "@/components/Avatar.vue"
import FormChangePassword from "@/components/form/FormChangePassword.vue"
import {isEqual} from "lodash";
import axios from "axios";
import {PROFILE_INFO} from "@/common/apiUrls";

export default {
  name: "UserProfile",
  data: () => ({
    avatar: {},
    form: {},
    edit: true,
    submitted: false,
    editor: false,
    showChangePass: false,
    adminCustomer: {},
    items: [
      {
        text: "UserProfile",
        active: true,
      },
    ],
  }),
  computed: {
    ...mapState('account', ['user']),
  },
  beforeUpdate() {
    if(!this.adminCustomer._id) this.adminCustomer = this.user
  },
  components: {Avatar, FormChangePassword},
  validations: {
    customers: {
      email: {required},
    },
  },
  methods: {
    ...mapActions('account', ['upAvatar', 'getUser','logout']),
    handleUploadAvatar(file) {
      this.avatar = file;
    },
    selected(event) {
      this.adminCustomer.sex = event.target.value || 'other'
    },
    clearAvatar() {
      this.avatar = {}
    },
    async uploadAvatar() {
      const result = await this.upAvatar(this.avatar)
      if (result) setTimeout(() => this.avatar = {}, 200)
    },
    async handlerSubmit() {
      try {
        if (!this.adminCustomer && isEqual(this.adminCustomer, this.user)) {
          this.editor = false
          return null
        }
        const dataUpdate = {}
        dataUpdate.name = this.adminCustomer.name || "";
        dataUpdate.sex = this.adminCustomer.sex || "other";
        dataUpdate.phone = this.adminCustomer.phone || "";
        dataUpdate.address = this.adminCustomer.address || "";
        dataUpdate.city = this.adminCustomer.city || "";
        dataUpdate.birthday = this.adminCustomer.birthday || '';
        await axios.put(PROFILE_INFO, dataUpdate);
        // this.user = {...this.user, ...updateUser?.data}
        await this.getUser()
      } catch (e) {
        console.log(e)
      } finally {
        this.editor = false
      }
    }
  }
};
</script>

<template>
  <v-container>
    <div class="container py-5">
      <div class="row">
        <div class="col-lg-16" v-if="user">
          <div class="card mb-4">
            <div class="card-body text-center shadow-sm">
              <Avatar
                :profile="{name: user.name, avatar: avatar.imageURL || user.avatar}"
                size="150"
                @click="handleUploadAvatar"
              />
              <h5 class="my-3">{{ user.name || 'Marikday' }}</h5>
              <div v-if="avatar.imageURL" class="d-flex justify-content-center mb-2">
                <button @click="uploadAvatar" type="button" class="btn btn-primary">save</button>
                <button @click="clearAvatar" type="button" class="btn btn-outline-primary ms-1">cancel</button>
              </div>
              <ul class="list-group list-group-flush rounded-3">
                <li class="list-group-item d-flex justify-content-between align-items-center p-3">
                  <i class="fas fa-globe fa-lg text-warning"></i>
                  <p class="mb-0">https://marikaday.com</p>
                </li>
                <li v-if="user.phone" class="list-group-item d-flex justify-content-between align-items-center p-3">
                  <i class="fas fa-phone fa-lg" style="color: #333333;"></i>
                  <p class="mb-0">{{ user.phone }}</p>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center p-3">
                    <div class="col-16"></div>
                    <button class="btn btn-outline-primary col-8" @click="showChangePass=!showChangePass;">CHANGE PASSWORD</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <form-change-password
          :showModal="showChangePass"
          title="CHANGE PASSWORD"
          @closed="showChangePass = false"
          @onSubmit="showChangePass = false"
        />
        <div class="col-lg-16" v-if="user">
          <form @submit.prevent="handlerSubmit">
            <div class="row">
              <div class="col-22">
                <div class="mb-3">
                  <label v-if="editor">Update profile</label>
                </div>
              </div>
              <div
                style="cursor: pointer"
                class="col-2 col-sm-2"
                @click="editor=!editor;adminCustomer={...user}"
              >
                <i :size="30" class="far fa-edit"></i>
              </div>
              <div class="col-24">
                <div class="mb-3">
                  <label for="name">Name</label>
                  <input
                    id="name"
                    v-model="adminCustomer.name"
                    type="text"
                    class="form-control"
                    :disabled="!editor"
                    placeholder="Insert name"
                    :class="{'is-invalid':submitted && $v.adminCustomer.name.$error,}"
                  />
                </div>
              </div>
              <div class="col-24">
                <div class="mb-3">
                  <label for="phone">Phone</label>
                  <input
                    id="phone"
                    v-model="adminCustomer.phone"
                    type="text"
                    class="form-control"
                    :disabled="!editor"
                    placeholder="Insert phone"
                    :class="{
                                'is-invalid':
                                  submitted && $v.adminCustomer.phone.$error,
                              }"
                  />
                </div>
              </div>
              <div class="col-24">
                <div class="mb-3">
                  <label for="email">Email</label>
                  <input
                    id="email"
                    v-model="adminCustomer.email"
                    type="email"
                    required="true"
                    class="form-control"
                    :disabled="true"
                    placeholder="Insert email"
                    :class="{
                                'is-invalid':
                                  submitted && $v.adminCustomer.email.$error,
                              }"
                  />
                  <div
                    v-if="submitted && !$v.adminCustomer.email.required"
                    class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </div>
              </div>
              <div class="col-24">
                <div class="mb-3">
                  <label for="address">Address</label>
                  <input
                    id="address"
                    v-model="adminCustomer.address"
                    type="text"
                    :disabled="!editor"
                    class="form-control"
                    placeholder="Insert address">
                </div>
              </div>
              <div class="col-24">
                <div class="mb-3">
                  <label for="address">City</label>
                  <input
                    id="city"
                    v-model="adminCustomer.city"
                    type="text"
                    :disabled="!editor"
                    class="form-control"
                    placeholder="Insert city">
                </div>
              </div>
              <div class="col-24">
                <div class="mb-3">
                  <label>Sex</label>
                  <select class="form-control" @change="selected($event)" :value="adminCustomer.sex"
                          :disabled="!editor">
                    <!-- inline object literal -->
                    <option v-bind:value="'other'">Other</option>
                    <option v-bind:value="'male'">Male</option>
                    <option v-bind:value="'female'">Female</option>
                  </select>
                </div>
              </div>
              <div class="col-24">
                <div class="mb-3">
                  <label for="balance">Birthday</label>
                  <input
                    id="balance"
                    v-model="adminCustomer.birthday"
                    type="text"
                    class="form-control"
                    :disabled="!editor"
                    placeholder="Insert birthday"
                    :class="{
                                'is-invalid':
                                  submitted && $v.adminCustomer.birthday.$error,
                              }"
                  />
                </div>
              </div>
            </div>
            <div class="text-end pt-5 mt-3" v-if="editor">
              <b-button type="submit" variant="success" class="ms-1"
              >Save change
              </b-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </v-container>
</template>
