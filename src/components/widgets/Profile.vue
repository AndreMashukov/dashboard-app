<script>
import Loader from "../Loader";
/**
 * Profile component
 */
export default {
  components: {
    Loader,
  },
  data: () => ({
    month: ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
  }),
  mounted() {},
  props: {
    updating: {
      type: Boolean,
    },
    profile: {
      type: Object,
    },
    count: {
      type: Number,
    },
    revenue: {
      type: Number,
    },
  },
};
</script>
<template>
  <Loader :loading="updating">
    <div class="card overflow-hidden">
      <div class="bg-soft bg-primary">
        <div class="row">
          <div class="col-14">
            <div class="text-primary p-3">
              <h5 class="text-primary">Welcome Back !</h5>
              <p>Marika Day dashboard</p>
            </div>
          </div>
          <div class="col-10 align-self-end">
            <img src="@/assets/images/profile-img.png" alt class="img-fluid" />
          </div>
        </div>
      </div>
      <div class="card-body pt-0">
        <div class="row">
          <div class="col-sm-10">
            <div class="avatar-md profile-user-wid mb-4">
              <v-img
                contain
                aspect-ratio="1"
                v-if="profile"
                v-bind:src="profile.avatar || '@/assets/images/companies/img-4.png'"
                v-bind:alt="profile.name || 'Marika Day'"
                class="img-thumbnail rounded-circle"
              />
            </div>
            <h5 v-if="profile" class="font-size-15 text-truncate">{{profile.name || 'Marika Day'}}</h5>
            <p class="text-muted mb-0 text-truncate">Build healthy habits</p>
          </div>
          <div class="col-sm-14">
            <div class="pt-4">
              <div class="row">
                <div class="col-8 p-3">
                  <h5 class="font-size-15">{{ count }}</h5>
                  <p class="text-muted mb-0">Users</p>
                </div>
                <div class="col-16 p-3">
                  <h5 class="font-size-15">${{revenue}}</h5>
                  <p class="text-muted mb-0">Revenue in {{month[new Date().getMonth()]}}</p>
                </div>
              </div>
              <div class="mt-4">
                <a href="javascript: void(0);" @click="$router.push('/profile')" class="btn btn-outline-primary btn-sm">
                  View Profile
                  <i class="mdi mdi-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- end card-body -->
    </div>
    <!-- end card -->
  </Loader>
</template>
