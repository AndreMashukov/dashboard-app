<template>
  <div class="d-none">
    {{alert.message}}
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Toast',
  updated() {
    if (this.alert.message) this.showToast();
  },
  methods: {
    ...mapActions({
      clearAlert: 'alert/clear'
    }),
    showToast() {
      this.$toast[this.alert.type](this.alert.message, {});
      this.clearAlert();
    }
  },
  computed: {
    ...mapState({
      alert: state => state.alert
    })
  }
}
</script>
