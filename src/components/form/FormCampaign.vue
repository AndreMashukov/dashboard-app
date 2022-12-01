<script>
import DatePicker from 'vue2-datepicker';

export default {
  name: "FormCampaign",
  props: ['showModal', 'item', 'title', 'listMembership'],
  components: {DatePicker},
  data: () => ({
    isEdit: false,
    dateRange: [],
    membershipSelect: [],
    dataForm: {
      name: "",
      idsMembership: [],
      start: null,
      end: null,
    },
  }),
  beforeUpdate() {
    if (!this.isEdit && this?.item?.isEdit) {
      this.isEdit = true;
      this.membershipSelect = [...this?.item?.idsMembership].map(e => ({
        _id: e,
        name: ([...this.listMembership].find(m => m?._id === e))?.name
      }));
      this.dateRange = (this.item.start && this.item.end) ? [new Date(this.item.start), new Date(this.item.end)] : []
      this.dataForm = {...this.item};
    }
    if(this.membershipSelect.length === 0)
      this.addMem()

  },
  methods: {
    handleClosed() {
      this.onReset();
      this.$emit('closed');
    },
    handleSubmit() {
      const data = {...this.dataForm}
      if(this.dateRange[0] && this.dateRange[1]){
        data.start = this.dateRange[0]
        data.end = this.dateRange[1]
      }
      if(this.membershipSelect.length){
        data.idsMembership = this.membershipSelect.map(e => e._id)
      }
      this.onReset();
      this.$emit("onSubmit", data);
    },
    onReset() {
      this.dataForm = {
        name: "",
        idsMembership: [],
        start: null,
        end: null,
      }
      this.dateRange = []
      this.membershipSelect = []
      this.isEdit = false
    },
    clearDatePicker() {
      this.dateRange = [];
    },
    addMem() {
      this.membershipSelect.push({...this.listMembership[0]})
    },
    dropItemMem(idx) {
      this.membershipSelect.splice(idx, 1)
      if (!this?.membershipSelect?.length) {
        this.membershipSelect = [{...this.listMembership[0]}]
      }
    },
  },
  watch: {
  }
}
</script>

<template>
  <b-modal
    :visible="showModal"
    :title="(dataForm.isEdit ? 'Edit' : 'Add new') + ' ' + title"
    title-class="text-black font-18"
    body-class="p-3"
    hide-footer
    @hidden="handleClosed"
  >
    <b-form @submit.prevent="handleSubmit" @reset="onReset" v-if="showModal">
      <div class="mb-3">
        <b-form-group
          id="input-group-1"
          label="Name: (required *)"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            v-model="dataForm.name"
            placeholder="Enter name"
            required
          ></b-form-input>
        </b-form-group>
      </div>

      <div class="mb3 mb-3">
        <div class="row">
          <label class="col-14 mt-3">Select membership for campaign: (required *)</label>
          <div class="col-1">
            <b-button
              variant="info"
              @click="addMem"
            >
              <i class="mdi mdi-plus"></i>
            </b-button>
          </div>
        </div>
        <b-form-group>
          <div class="row" v-for="(mem, idx) in membershipSelect" :key="idx">
            <div class="col-12">
              <b-form-select
                class="form-select"
                id="formrow-inputState"
                v-model="membershipSelect[idx]._id"
                :options="listMembership.map(e=> ({value: e._id, text: e.name}))"
                type="text"
                required
              ></b-form-select>
            </div>
            <div class="col-3">
              <b-button
                v-if="membershipSelect.length > 1"
                variant="warning"
                @click="()=>dropItemMem(idx)"
              >
                <i class="dripicons-minus"></i>
              </b-button>
            </div>
          </div>
        </b-form-group>
      </div>
      <div class="mb-3">
        <label>Date Start -> End</label>
        <br/>
        <date-picker require="true" v-model="dateRange" range append-to-body lang="en" confirm></date-picker>
      </div>
      <div class="mb-3 mb-0 justify-content-end d-flex">
        <div>
          <button type="submit" class="btn btn-primary">Submit</button>
          <button class="btn btn-secondary ms-1" @click="handleClosed">
            Cancel
          </button>
        </div>
      </div>
    </b-form>
  </b-modal>
</template>
