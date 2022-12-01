<script>
import {mapActions, mapState} from "vuex";
import Avatar from "@/components/Avatar";
/**/
export default {
  name: 'app-bar',
  data: () => ({
    fav: true,
    menu: false,
    message: false,
    hints: true,
    dialog: false,
    avatar: {},
    profile: null,
  }),
  created() {
    this.loadCurrentUser();
  },
  beforeUpdate() {
    if (!this.profile) this.profile = {...this.user};
    if (this.avatar.imageURL) this.profile.avatar = this.avatar.imageURL;
  },
  methods: {
    ...mapActions('account', ['loadCurrentUser', 'logout', "upAvatar"]),
    ...mapActions('slide_bar', ['onToggleCollapse']),
    onToggle() {
      this.onToggleCollapse('app-bar')
    },
    handleUploadFile(file) {
      this.avatar = file;
    },
    async uploadAvatar() {
      const result = await this.upAvatar(this.avatar)
      this.avatar = {};
      if (result) setTimeout(() => this.menu = false, 500)
      else this.profile = {...this.user};
    },
    handleClosed() {
      this.avatar = {};
      setTimeout(() => this.profile = {...this.user}, 500);
      this.menu = false
    },
    toProfile() {
      this.handleClosed();
      this.$router.push("/profile")
    },
    toLogout() {
      this.avatar = {};
      this.menu = false
      this.logout();
    },
    onLogoClick() {
      if(this.$route.name !== "Home") this.$router.push("/")
    },
  },
  computed: {
    ...mapState('account', ['user', 'status']),
  },
  components: {Avatar},
}
</script>

<template>
  <b-navbar v-if="user && status.loggedIn" style="padding-top: 0; padding-bottom: 0" toggleable="lg" type="dark"
            variant="info">
    <button
      id="vertical-menu-btn"
      type="button"
      class="btn btn-sm px-3 font-size-16 header-item white--text"
      @click="onToggle"
    >
      <i class="fa fa-fw fa-bars"></i>
    </button>
    <div @click="onLogoClick" class="d-flex align-center header-item px-3">
      <v-img
        alt="Vuetify Logo"
        class="shrink mr-2"
        contain
        src="@/assets/logo.png"
        transition="scale-transition"
        width="85"
      />
    </div>
    <v-spacer></v-spacer>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-width="100"
      offset-y
      nudge-left="175"
      nudge-bottom="10"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn dark justify-end exact icon color="green" class="mr-5" v-bind="attrs" v-on="on">
          <v-avatar
            color="grey lighten-2"
            size="56"
          >
            <span v-if="!user.avatar" class="white--text text-h5">
              {{ user.name ? user.name.split("")[0].toUpperCase() : "" }}
            </span>
            <v-img
              contain
              aspect-ratio="1"
              v-if="user.avatar"
              v-bind:src="user.avatar"
              v-bind:alt="user.name"
            ></v-img>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar
              color="grey lighten-2"
              style="justify-content:center"
            >
              <Avatar
                :profile="{name: profile.name, avatar: profile.avatar}"
                @click="handleUploadFile"
              />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ user.name }}</v-list-item-title>
              <v-list-item-title>{{ user.email }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider class="divider-margin"></v-divider>
        <v-btn block text @click="toProfile">profile</v-btn>
        <v-divider class="divider-margin" inset></v-divider>
        <v-btn block text @click="toLogout">Logout</v-btn>
        <v-divider class="divider-margin"></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            title
            @click="handleClosed"
          >
            Close
          </v-btn>
          <v-btn
            v-if="avatar.imageURL"
            title
            color="primary"
            @click="uploadAvatar"
          >
            save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </b-navbar>
</template>

<style scoped>
.divider-margin {
  margin-bottom: 5px;
  margin-top: 5px;
}
</style>
