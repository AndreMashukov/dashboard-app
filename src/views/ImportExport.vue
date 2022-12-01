<script>
import {mapActions, mapState} from "vuex";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";

/**
 * Customers component
 */
export default {
  page: {
    title: "Import Export Database",
  },
  components: {Loading, PageHeader},
  computed: {
    ...mapState('databases', ['']),
  },
  created() {
    this.loading = false
  },
  data() {
    return {
      title: "Import Export Database",
      items: [],
      typeAction: '',
      loading: false,
      data: {}
    };
  },
  methods: {
    ...mapActions('databases', ['checkStatusAction']),
    handlerAction() {
      if (!this.typeAction) return null
      this.checkStatusAction({typeAction: this.typeAction, data: this.data})
    },

    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length)
        return;
      this.data.file = files[0];
      // this.handlerAction()
    },
  },
};
</script>

<template>
  <Loading :loading="loading">
    <PageHeader :title="title" :items="items"/>
    <!--      {{ itemsInPage }}}-->
    <div class="row">
      <div class="col-12 pa-0">
        <div class="card">
          <div class="card-body">
            <div class="col-12">
              <div class="col-6">
                <button
                  type="button"
                  class="btn btn-outline-pink btn-rounded mb-10 me-10"
                  style="min-width: 250px"
                  @click="typeAction='export';handlerAction();"
                >
                  <i class="mdi mdi-plus me-1"></i> EXPORT DATABASE
                </button>
              </div>
              <div class="col-6">
                <div>
                  <button
                    type="button"
                    class="btn btn-outline-dark btn-rounded mb-2 me-2"
                    style="min-width: 250px"
                    disabled="true"
                  >
                    IMPORT DATABASE (*.xlsx)
                  </button>

                </div>
                <div class="col-12">
                  <input
                    id="fileMediaImage"
                    type="file"
                    @change="onFileChange;"
                    class="form-control"
                    placeholder="IMPORT DATABASE"
                  />
                </div>
                {{ data.file }}
                <button
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 150px"
                  @click="typeAction='import';handlerAction()"
                >
                  SUBMIT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- end row -->
  </Loading>
</template>
