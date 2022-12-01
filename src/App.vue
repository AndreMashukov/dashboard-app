<script>
import SideBar from "@/views/layout/SideBar";
import AppBar from "@/views/layout/AppBar";
import Toast from "@/views/layout/Toast";
import Footer from "@/views/layout/Footer";

export default {
  name: 'App',
  components: {AppBar, SideBar, Toast, Footer},
}

</script>
<template>
  <SideBar>
    <Toast/>
    <v-app>
      <AppBar/>
      <!-- Start Content-->
      <div class="container-fluid" style="background: #f8f8fb">
        <router-view/>
      </div>
      <Footer />
    </v-app>
  </SideBar>
</template>
