<script>/**
 * Preloader component
 */

export default {
  data() {
    return {};
  },
  props: {
    payment: {},
  },
};
</script>

<template>
  <b-modal
    title="Detail payment"
    title-class="text-black font-18"
    body-class="p-3"
    hide-footer
  >
    <div class="row">
      <div class="col-24">
        <div class="mb-3">
          <label>Auto generate code</label>
        </div>
      </div>
      <div class="col-24">
        <div class="mb-3">
          <label>Code</label>
        </div>
      </div>
      <div class="col-24">
        <div class="mb-3">
          <label>Percent(%)</label>
        </div>
      </div>
      <div class="col-24">
        <div class="mb-3">
          <label>Email</label>
        </div>
      </div>
      <div class="col-24">
        <div class="mb-3">
          <label>Price($)</label>

        </div>
      </div>
    </div>

    <div class="text-end pt-5 mt-3">
      <b-button variant="light">Close</b-button>
    </div>
  </b-modal>
</template>
