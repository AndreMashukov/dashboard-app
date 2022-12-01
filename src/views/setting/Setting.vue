<script>
import {mapActions, mapState} from "vuex";
import Multiselect from 'vue-multiselect';
import {cloneDeep,} from "lodash";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import MembershipType from "@/views/setting/MembershipType";

/**
 * Customers component
 */
export default {
  page: {
    title: "Setting",
  },
  components: {Loading, PageHeader, Multiselect, MembershipType},
  computed: {
    ...mapState('databases', ['collections']),
    ...mapState('system', ['settings']),
  },
  created() {
    this.loading = false
    Promise.all([
      this.getCollections(),
      this.getListSystem(),
    ]).finally(() => {
      this.collectionsData = this.collections.map(col => ({name: col, checked: true}))
    })
  },
  data: () => ({
    title: "Setting",
    items: [],
    typeAction: '',
    loading: false,
    dataFile: null,
    collectionsData: [],
    isAll: true,
    showModal: false,
    redirectUri: '',
    originRedirectUri: null,
    surveyMealPlan: null,
    originSurveyMealPlan: null,
    surveyDietary: null,
    originSurveyDietary: null,
    mailChimp: {
      apiKey: '',
      dc: '',
      version: '',
      listId: null,
      lists: [],
      tags: [],
    },
    originMailChimp: null,
    welcomeList: {tags: [], status: "subscribed"},
    welcomeProgram: {tags: [], status: "subscribed"},
    surveyCompletion: {tags: [], status: "subscribed"},
    memberCancelsSub: {tags: [], status: "subscribed"},
    AIASignUp: {tags: [], status: "subscribed"},
    membershipType: [],
    status: [
      "subscribed",
      "unsubscribed",
      "cleaned",
      "pending",
      "transactional",
    ],
  }),
  methods: {
    ...mapActions('databases', ['importAction', 'exportAction', 'getCollections']),
    ...mapActions('system', ['getListSystem', 'createSystem', 'updateSystem', 'upMailChimp']),
    ...mapActions(['updateMemberSetting']),
    onClickCheckAll() {
      this.isAll = !this.isAll
      if (this.isAll)
        this.collectionsData = this.collections.map(col => ({name: col, checked: true}))
      else
        this.collectionsData = this.collections.map(col => ({name: col, checked: false}))
    },
    handlerImportAction() {
      if (!this.typeAction) return null
      this.loading = true;
      this.importAction({
        typeAction: this.typeAction,
        dataFile: this.dataFile,
      }).finally(() => {
        this.loading = false;
      })
    },
    handlerExportAction() {
      if (!this.typeAction) return null
      this.loading = true;
      this.exportAction({
        typeAction: this.typeAction,
        data: this.collectionsData.filter(x => x?.checked).map(x => x?.name) || [],
        isAll: this.isAll
      }).finally(() => {
        this.loading = false;
        this.showModal = false
      })
    },
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (files) {
        this.dataFile = files[0];
      }
    },
    handleRedirectUri({target}) {
      if (!this.originRedirectUri) this.originRedirectUri = this.redirectUri
      this.redirectUri = target.value
    },
    updateRedirectUri() {
      this.updateSystem({field: 'redirect_uri', value: this.redirectUri})
        .finally(() => {
          this.originRedirectUri = null;
        })
    },
    restoreRedirectUri() {
      this.redirectUri = this.originRedirectUri;
      this.originRedirectUri = null;
    },
    handleSurveyMealPlan({target}) {
      if (!this.originSurveyMealPlan) this.originSurveyMealPlan = this.surveyMealPlan
      this.surveyMealPlan = target.value
    },
    updateSurveyMealPlan() {
      this.updateSystem({field: 'survey_meal_plan', value: this.surveyMealPlan})
        .finally(() => {
          this.originSurveyMealPlan = null;
        })
    },
    restoreSurveyMealPlan() {
      this.surveyMealPlan = this.originSurveyMealPlan;
      this.originSurveyMealPlan = null;
    },
    handleSurveyDietary({target}) {
      if (!this.originSurveyDietary) this.originSurveyDietary = this.surveyDietary
      this.surveyDietary = target.value
    },
    updateSurveyDietary() {
      this.updateSystem({field: 'survey_dietary', value: this.surveyDietary})
        .finally(() => {
          this.originSurveyDietary = null;
        })
    },
    restoreSurveyDietary() {
      this.surveyDietary = this.originSurveyDietary;
      this.originSurveyDietary = null;
    },
    handleMailChimp(type, value) {
      this.mailChimp[type] = value;
      if (!this.originMailChimp)
        this.originMailChimp = true;
    },
    handleConfigMail(type, field, value) {
      this[type][field] = value;
      if (!this.originMailChimp) this.originMailChimp = true;
    },
    handleMultiSelect() {
      if (!this.originMailChimp) this.originMailChimp = true;
    },
    submitMailChimp() {
      this.originMailChimp = false
      const data = cloneDeep(this.mailChimp);
      const handleTags = (type, value) => {
        data[type] = value
      }
      handleTags('welcomeList', this.welcomeList);
      handleTags('welcomeProgram', this.welcomeProgram);
      handleTags('surveyCompletion', this.surveyCompletion);
      handleTags('memberCancelsSub', this.memberCancelsSub);
      handleTags('AIASignUp', this.AIASignUp);
      this.upMailChimp(data)
        .then(() => {
        })
        .catch(() => {
          this.originMailChimp = true
        });
    },
    restoreMailChimp() {
      const idx = this.settings.findIndex(val => val.field === 'mailChimp');
      if (idx > -1) {
        this.mailChimp = {...JSON.parse(this.settings[idx].value), _id: this.settings[idx]._id,};
        if (this.mailChimp.lists.length === 0)
          this.mailChimp.lists.push({id: null, name: '-- Please select --'});
        if (this.mailChimp.welcomeList)
          this.welcomeList = this.mailChimp.welcomeList;
        if (this.mailChimp.welcomeProgram)
          this.welcomeProgram = this.mailChimp.welcomeProgram;
        if (this.mailChimp.surveyCompletion)
          this.surveyCompletion = this.mailChimp.surveyCompletion;
        if (this.mailChimp.memberCancelsSub)
          this.memberCancelsSub = this.mailChimp.memberCancelsSub;
        if (this.mailChimp.AIASignUp)
          this.AIASignUp = this.mailChimp.AIASignUp;
      }
      this.originMailChimp = false;
    },
  },
  watch: {
    settings() {
      for (let obj of this.settings) {
        switch (obj.field) {
          case 'redirect_uri':
            this.redirectUri = obj.value;
            break;
          case 'mailChimp':
            this.restoreMailChimp()
            break;
          case 'survey_meal_plan':
            this.surveyMealPlan = obj.value;
            break;
          case 'survey_dietary':
            this.surveyDietary = obj.value;
            break;
          default:
            break;
        }
      }
    },
  },
};
</script>

<template>
  <Loading :loading="loading">
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-xl-24 pa-0">
        <div class="card">
          <div class="card-body" style="border: 0px">
            <div class="row">
              <div class="col-xl-3 pt-0">
                <label>EXPORT DATABASE</label>
                <b-button
                  type="button"
                  variant="light"
                  class="btn btn-outline-success btn-rounded"
                  style="width: 100%; height: 37px; line-height: 0"
                  @click="showModal=true;"
                >
                  <i class="mdi mdi-download label-icon font-size-16"></i>
                  DOWNLOAD
                </b-button>
                <b-modal
                  v-model="showModal"
                  title="Choose collections export"
                  title-class="text-black font-18"
                  body-class="p-3"
                  hide-footer
                >
                  <form @submit.prevent="typeAction='export';handlerExportAction();">
                    <div class="col-12">
                      <div>
                        <label>Select collection (*required)</label>
                      </div>
                    </div>
                    <div class="col-12">
                      <tr>
                        <th><input style="cursor: pointer; " type="checkbox" v-model="isAll" @click="onClickCheckAll()">
                        </th>
                        <div class="p-2"> All collections ( * )</div>
                      </tr>
                      <hr/>
                      <tr v-for="(col, idx) in collectionsData" :key="idx">
                        <th><input style="cursor: pointer;" v-model="col.checked" type="checkbox"></th>
                        <div class="p-2"> {{ col.name }}</div>
                      </tr>
                    </div>
                    <div class="text-end pt-5 mt-3">
                      <b-button variant="light" @click="showModal = false;">Close</b-button>
                      <b-button type="submit" variant="success" class="ms-1"
                      >Export data
                      </b-button>
                    </div>
                  </form>
                </b-modal>
              </div>
              <div class="col-xl-9 pt-0">
                <label>IMPORT DATABASE</label>
                <div class="input-group">
                  <input
                    type="file"
                    class="form-control"
                    aria-label="Upload"
                    accept=".xlsx, .csv"
                    @change="onFileChange"
                  />
                  <b-button
                    class="btn btn-label"
                    variant="success"
                    type="button"
                    :disabled="!dataFile"
                    @click="typeAction='import';handlerImportAction()"
                  >
                    <i class="mdi mdi-upload label-icon font-size-16"></i> UPLOAD
                  </b-button>
                </div>
              </div>
              <div class="col-xl-12 pt-0">
                <label>REDIRECT URI</label>
                <div class="input-group">
                  <button
                    class="btn btn-warning"
                    type="button"
                    :disabled="!originRedirectUri"
                    @click="restoreRedirectUri"
                  >
                    RESTORE
                  </button>
                  <input
                    :value="redirectUri"
                    type="text"
                    class="form-control"
                    @input="handleRedirectUri"
                  />
                  <button
                    class="btn btn-success"
                    type="button"
                    :disabled="!originRedirectUri"
                    @click="updateRedirectUri"
                  >
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-24 pa-0">
        <div class="card">
          <div class="card-body" style="border: 0px">
            <form @submit.prevent="submitMailChimp" class="form-horizontal" role="form">
              <div class="row">
                <div class="col-xl-8 pt-0 pb-0">
                  <label>MAIL CHIMP SETTING</label>
                  <b-form-group
                    class="my-chimp"
                    id="example text"
                    label-cols-lg="6"
                    label="Api key:"
                    label-for="text"
                  >
                    <b-form-input
                      for="text"
                      :value="mailChimp.apiKey"
                      placeholder="Your API key"
                      @input="handleMailChimp('apiKey', $event)"
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    class="my-chimp"
                    id="example text"
                    label-cols-lg="6"
                    label="DC:"
                    label-for="text"
                  >
                    <b-form-input
                      for="text"
                      :value="mailChimp.dc"
                      placeholder="The DC part is the server prefix. example: us13"
                      @input="handleMailChimp('dc', $event)"
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    class="mb-3 my-chimp"
                    id="example text"
                    label-cols-lg="6"
                    label="Version:"
                    label-for="text"
                  >
                    <b-form-input
                      for="text"
                      :value="mailChimp.version"
                      placeholder="The API version. example: 3.0"
                      @input="handleMailChimp('version', $event)"
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    class="my-chimp"
                    id="example text"
                    label-cols-lg="6"
                    label="Item of list:"
                    label-for="text"
                  >
                    <b-form-select
                      class="form-select"
                      :value="mailChimp.listId"
                      :options="mailChimp.lists"
                      text-field="name"
                      value-field="id"
                      type="text"
                      @change="handleMailChimp('listId', $event)"
                    ></b-form-select>
                  </b-form-group>
                </div>
                <div class="col-xl-16">
                  <label>CONFIG MAIL MARKETING</label>
                  <b-form-group
                    class="my-chimp"
                    id="example text"
                    label-cols-lg="8"
                    label="Welcome to list:"
                    label-for="text"
                  >
                    <div class="row">
                      <div class="col-18">
                        <multiselect
                          v-model="welcomeList.tags"
                          :options="mailChimp.tags"
                          :multiple="true"
                          :close-on-select="false"
                          :clear-on-select="false"
                          :preserve-search="true"
                          placeholder="Pick some"
                          label="name"
                          track-by="name"
                          :preselect-first="true"
                          :disabled="mailChimp.tags.length === 1"
                          @input="handleMultiSelect"
                        >
                          <template slot="selection" slot-scope="{ values, search, isOpen }">
                            <span class="multiselect__single" v-if="values.length &amp;&amp; !isOpen">
                              {{ values.length }} options selected
                            </span>
                          </template>
                        </multiselect>
                      </div>
                      <div class="col-6 p-0">
                        <b-form-select
                          :disabled="mailChimp.tags.length === 1"
                          class="form-select"
                          :value="welcomeList.status"
                          :options="status"
                          type="text"
                          @change="handleConfigMail('welcomeList', 'status', $event)"
                        ></b-form-select>
                      </div>
                    </div>
                  </b-form-group>
                  <b-form-group
                    class="my-chimp"
                    id="example text"
                    label-cols-lg="8"
                    label="Welcome to program:"
                    label-for="text"
                  >
                    <div class="row">
                      <div class="col-18">
                        <multiselect
                          v-model="welcomeProgram.tags"
                          :options="mailChimp.tags"
                          :multiple="true"
                          :close-on-select="false"
                          :clear-on-select="false"
                          :preserve-search="true"
                          placeholder="Pick some"
                          label="name"
                          track-by="name"
                          :preselect-first="true"
                          :disabled="mailChimp.tags.length === 1"
                          @input="handleMultiSelect"
                        >
                          <template slot="selection" slot-scope="{ values, search, isOpen }">
                            <span class="multiselect__single" v-if="values.length &amp;&amp; !isOpen">
                              {{ values.length }} options selected
                            </span>
                          </template>
                        </multiselect>
                      </div>
                      <div class="col-6 p-0">
                        <b-form-select
                          :disabled="mailChimp.tags.length === 1"
                          class="form-select"
                          :value="welcomeProgram.status"
                          :options="status"
                          type="text"
                          @change="handleConfigMail('welcomeProgram', 'status', $event)"
                        ></b-form-select>
                      </div>
                    </div>
                  </b-form-group>
                  <b-form-group
                    class="my-chimp"
                    id="example text"
                    label-cols-lg="8"
                    label="Survey completion:"
                    label-for="text"
                  >
                    <div class="row">
                      <div class="col-18">
                        <multiselect
                          v-model="surveyCompletion.tags"
                          :options="mailChimp.tags"
                          :multiple="true"
                          :close-on-select="false"
                          :clear-on-select="false"
                          :preserve-search="true"
                          placeholder="Pick some"
                          label="name"
                          track-by="name"
                          :preselect-first="true"
                          :disabled="mailChimp.tags.length === 1"
                          @input="handleMultiSelect"
                        >
                          <template slot="selection" slot-scope="{ values, search, isOpen }">
                            <span class="multiselect__single" v-if="values.length &amp;&amp; !isOpen">
                              {{ values.length }} options selected
                            </span>
                          </template>
                        </multiselect>
                      </div>
                      <div class="col-6 p-0">
                        <b-form-select
                          :disabled="mailChimp.tags.length === 1"
                          class="form-select"
                          :value="surveyCompletion.status"
                          :options="status"
                          type="text"
                          @change="handleConfigMail('surveyCompletion', 'status', $event)"
                        ></b-form-select>
                      </div>
                    </div>
                  </b-form-group>
                  <b-form-group
                    class="my-chimp"
                    id="example text"
                    label-cols-lg="8"
                    label="Member cancels subscription:"
                    label-for="text"
                  >
                    <div class="row">
                      <div class="col-18">
                        <multiselect
                          v-model="memberCancelsSub.tags"
                          :options="mailChimp.tags"
                          :multiple="true"
                          :close-on-select="false"
                          :clear-on-select="false"
                          :preserve-search="true"
                          placeholder="Pick some"
                          label="name"
                          track-by="name"
                          :preselect-first="true"
                          :disabled="mailChimp.tags.length === 1"
                          @input="handleMultiSelect"
                        >
                          <template slot="selection" slot-scope="{ values, search, isOpen }">
                            <span class="multiselect__single" v-if="values.length &amp;&amp; !isOpen">
                              {{ values.length }} options selected
                            </span>
                          </template>
                        </multiselect>
                      </div>
                      <div class="col-6 p-0">
                        <b-form-select
                          :disabled="mailChimp.tags.length === 1"
                          class="form-select"
                          :value="memberCancelsSub.status"
                          :options="status"
                          type="text"
                          @change="handleConfigMail('memberCancelsSub', 'status', $event)"
                        ></b-form-select>
                      </div>
                    </div>
                  </b-form-group>
                  <b-form-group
                    class="my-chimp"
                    id="example text"
                    label-cols-lg="8"
                    label="AIA member sign up:"
                    label-for="text"
                  >
                    <div class="row">
                      <div class="col-18">
                        <multiselect
                          v-model="AIASignUp.tags"
                          :options="mailChimp.tags"
                          :multiple="true"
                          :close-on-select="false"
                          :clear-on-select="false"
                          :preserve-search="true"
                          placeholder="Pick some"
                          label="name"
                          track-by="name"
                          :preselect-first="true"
                          :disabled="mailChimp.tags.length === 1"
                          @input="handleMultiSelect"
                        >
                          <template slot="selection" slot-scope="{ values, search, isOpen }">
                            <span class="multiselect__single" v-if="values.length &amp;&amp; !isOpen">
                              {{ values.length }} options selected
                            </span>
                          </template>
                        </multiselect>
                      </div>
                      <div class="col-6 p-0">
                        <b-form-select
                          :disabled="mailChimp.tags.length === 1"
                          class="form-select"
                          :value="AIASignUp.status"
                          :options="status"
                          type="text"
                          @change="handleConfigMail('AIASignUp', 'status', $event)"
                        ></b-form-select>
                      </div>
                    </div>
                  </b-form-group>
                </div>
                <div class="d-flex mb-3 mt-3 justify-content-end">
                  <button
                    :disabled="!originMailChimp"
                    type="submit"
                    class="btn btn-primary"
                  >
                    Submit
                  </button>
                  <button
                    :disabled="!originMailChimp"
                    type="button"
                    @click="restoreMailChimp"
                    class="btn btn-warning ms-1"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-xl-24 pa-0">
        <membership-type />
      </div>
      <div class="col-xl-24 pa-0">
        <div class="card">
          <div class="card-body" style="border: 0px">
            <div class="row">
              <div class="col-xl-12 pt-0">
                <label>SURVEY MEAL PLAN</label>
                <div class="input-group">
                  <button
                    class="btn btn-warning"
                    type="button"
                    :disabled="!originSurveyMealPlan"
                    @click="restoreSurveyMealPlan"
                  >
                    RESTORE
                  </button>
                  <input
                    :value="surveyMealPlan"
                    type="text"
                    class="form-control"
                    @input="handleSurveyMealPlan"
                  />
                  <button
                    class="btn btn-success"
                    type="button"
                    :disabled="!originSurveyMealPlan"
                    @click="updateSurveyMealPlan"
                  >
                    SAVE
                  </button>
                </div>
              </div>
              <div class="col-xl-12 pt-0">
                <label>SURVEY DIETARY</label>
                <div class="input-group">
                  <button
                    class="btn btn-warning"
                    type="button"
                    :disabled="!originSurveyDietary"
                    @click="restoreSurveyDietary"
                  >
                    RESTORE
                  </button>
                  <input
                    :value="surveyDietary"
                    type="text"
                    class="form-control"
                    @input="handleSurveyDietary"
                  />
                  <button
                    class="btn btn-success"
                    type="button"
                    :disabled="!originSurveyDietary"
                    @click="updateSurveyDietary"
                  >
                    SAVE
                  </button>
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

<style>
.my-chimp label {
  align-items: center;
  display: flex;
}
</style>
