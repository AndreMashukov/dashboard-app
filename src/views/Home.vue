<script>
import PageHeader from "../components/PageHeader";
import Profile from "../components/widgets/Profile";
import {mapActions, mapState} from "vuex";
import ChartTracking from "../components/widgets/ChartTracking";

export default {
  name: 'Home',
  data: () => ({
    title: "Dashboard Marika Day",
    items: [],
  }),
  created() {
    this.getReportTracking();
    this.countUser();
    this.revenueMonth();
  },
  methods: {
    ...mapActions("reports", ["getReportTracking", 'countUser', "revenueMonth"]),
  },
  computed: {
    ...mapState("reports", ["trackingAnswer", "totalUser", "revenue"]),
    ...mapState("account", ["user"]),
  },
  components: {ChartTracking, Profile, PageHeader},
}
</script>

<template>
  <div>
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-xl-8">
        <Profile :updating="false" :profile="user" :count="totalUser" :revenue="revenue"/>
      </div>
      <div class="col-xl-16">
        <ChartTracking :series="this.trackingAnswer"/>
      </div>
    </div>
  </div>
</template>
