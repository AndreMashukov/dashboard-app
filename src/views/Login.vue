<script>
import { required, email } from "vuelidate/lib/validators";
import { mapState, mapActions } from 'vuex';
import {localData} from '@/config'

export default {
  page: {
    title: "Login",
    meta: [
      {
        name: "description",
        content: "appConfig.description",
      },
    ],
  },
  data () {
    return {
      username: '',
      password: '',
      submitted: false
    }
  },
  computed: {
    ...mapState('account', ['status'])
  },
  created () {
    // reset login status
    const {redirect_url} = this.$route.query;
    if(redirect_url) localData.setRedirect(redirect_url);
    this.logout();
  },
  validations: {
    username: {
      required,
      email,
    },
    password: {
      required,
    },
  },
  methods: {
    ...mapActions('account', ['login', 'logout', 'getUser']),
    handleSubmit () {
      this.submitted = true;
      this.$v.$touch();

      if (this.$v.$invalid) return;
      const { username, password } = this;
      if (this.username && this.password) this.login({username, password});
    }
  },
};
</script>

<template>
  <div class="account-pages my-5 pt-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-16 col-lg-12 col-xl-10">
          <div class="card overflow-hidden">
            <div class="bg-soft bg-primary">
              <div class="row">
                <div class="col-14">
                  <div class="text-primary p-4">
                    <h5 class="text-primary">Welcome Back !</h5>
                    <p>Sign in to continue to Marika Day.</p>
                  </div>
                </div>
                <div class="col-10 align-self-end">
                  <img
                      src="@/assets/images/profile-img.png"
                      alt
                      class="img-fluid"
                  />
                </div>
              </div>
            </div>
            <div class="card-body pt-0">
              <div>
                <router-link to="/">
                  <div class="avatar-md profile-user-wid mb-4">
                  <span class="avatar-title rounded-circle bg-light">
                    <img src="@/assets/logo_black.png" alt height="28" />
                  </span>
                  </div>
                </router-link>
              </div>

              <b-form class="p-2" @submit.prevent="handleSubmit">
                <b-form-group
                    class="mb-3"
                    id="input-group-1"
                    label="Email"
                    label-for="input-1"
                >
                  <b-form-input
                      id="input-1"
                      v-model="username"
                      type="text"
                      placeholder="Enter email"
                      :class="{ 'is-invalid': submitted && $v.username.$error }"
                  ></b-form-input>
                  <div
                      v-if="submitted && $v.username.$error"
                      class="invalid-feedback"
                  >
                    <span v-if="!$v.username.required">Email is required.</span>
                    <span v-if="!$v.username.email">Please enter valid email.</span>
                  </div>
                </b-form-group>

                <b-form-group
                    class="mb-3"
                    id="input-group-2"
                    label="Password"
                    label-for="input-2"
                >
                  <b-form-input
                      id="input-2"
                      v-model="password"
                      type="password"
                      placeholder="Enter password"
                      :class="{ 'is-invalid': submitted && $v.password.$error }"
                  >
                    <div
                        v-if="submitted && !$v.password.required"
                        class="invalid-feedback"
                    >
                      Password is required.
                    </div>
                  </b-form-input>
                </b-form-group>
                <div class="mt-3 d-grid">
                  <b-button type="submit" variant="primary" class="btn-block">
                    Log In
                  </b-button>
                </div>
              </b-form>
            </div>
            <!-- end card-body -->
          </div>
          <div class="mt-5 text-center">
            <p>
              © {{ new Date().getFullYear() }} Marika Day
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
