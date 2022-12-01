<script>
import DatePicker from 'vue2-datepicker';
import moment from "moment";

export default {
  name: "Common",
  props: ['showModal', 'item', 'title'],
  data: () => ({
    isEdit: false,
    dataForm: {
      name: "",
      status: "1",
      numberOfAnswers: 1,
      questions: [{question: "", options: [""]}],
      dateRange: [new Date(), new Date()],
    },
    listStatus: [
      "0",
      "1",
    ],
  }),
  components: {DatePicker},
  beforeUpdate() {
    if(!this.isEdit && this.item.isEdit) {
      this.isEdit = true;
      this.dataForm = {...this.item};
      this.dataForm.dateRange = [
        new Date(this.item.startDate),
        new Date(this.item.endDate)
      ]
    }
  },
  methods: {
    handleClosed() {
      this.onReset();
      this.$emit('closed');
    },
    handleSubmit() {
      const data = {...this.dataForm}
      data.questions = data.questions.map((value, index) => ({...value, numberOfAnswers: index + 1}))
      data.startDate = moment(data.dateRange[0]).format("YYYY-MM-DD");
      data.endDate = moment(data.dateRange[1]).format("YYYY-MM-DD");
      this.onReset();
      this.$emit("onSubmit", data);
    },
    onReset() {
      this.dataForm = {
        name: "",
        status: "1",
        numberOfAnswers: 1,
        questions: [{question: "", options: [""]}],
        dateRange: [new Date(), new Date()],
      };
      this.isEdit = false
    },
    addQuestion() {
      const item = { question: '', options: [""],}
      this.dataForm.questions.push(item);
    },
    handleQuestion(index, value) {
      this.dataForm.questions[index].question = value;
    },
    addOption(index) {
      this.dataForm.questions[index].options.push("")
    },
    handleOption(index, idx, value) {
      this.dataForm.questions[index].options[idx] = value;
    },
    clearDatePicker() {
      this.dataForm.dateRange = [new Date(), new Date()];
    },
  },
}
</script>

<template>
  <b-modal
    v-model="showModal"
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
          label="Name:"
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
      <div class="mb-3">
        <b-form-group
          class="mb-3 form-label"
          id="input-group-2"
          label="Type:"
          label-for="formrow-inputState"
        >
          <b-form-select
            class="form-select"
            id="formrow-inputState"
            v-model="dataForm.status"
            :options="listStatus"
            type="text"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="mb-3 mb-0">
        <div class="row">
          <label class="col-10">Questions: (*required)</label>
          <div class="col-2 d-flex justify-content-end">
            <b-button variant="info" @click="addQuestion">
              <i class="mdi mdi-plus me-1"></i>
            </b-button>
          </div>
        </div>
        <div v-for="(data, index) in dataForm.questions" :key="index">
          <div class="row">
            <div class="col-8">
              <b-form-input
                placeholder="Enter question"
                required
                :value="data.question"
                @update="(val) => handleQuestion(index, val)"
              ></b-form-input>
            </div>
            <div class="col-2 d-flex justify-content-end">
              <b-button variant="info" @click="() => addOption(index)">
                <i class="mdi mdi-plus me-1"></i>
              </b-button>
            </div>
            <div class="col-2 d-flex justify-content-end">
              <b-button v-if="dataForm.questions.length > 1" variant="warning"
                        @click="dataForm.questions.splice(index, 1);">
                <i class="dripicons-minus"></i>
              </b-button>
            </div>
          </div>
          <div v-for="(option, idx) in data.options" :key="idx">
            <div class="row">
              <div class="col-1"></div>
              <div class="col-9">
                <b-form-input
                  placeholder="Enter option"
                  required
                  :value="option"
                  @update="(val) => handleOption(index, idx, val)"
                ></b-form-input>
              </div>
              <div class="col-2 d-flex justify-content-end">
                <b-button v-if="dataForm.questions[index].options.length > 1" variant="warning"
                          @click="dataForm.questions[index].options.splice(idx, 1);">
                  <i class="dripicons-minus"></i>
                </b-button>
              </div>
            </div>
          </div>
          <div class="row">
            <b-form-group
              label="Number of answers:"
            >
              <b-form-input
                v-model="dataForm.numberOfAnswers"
                placeholder="Enter number of answers"
                type="number"
                :min="0"
                :max="dataForm.questions.length - 1"
                required
              ></b-form-input>
            </b-form-group>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <b-form-group
          class="mb-3 form-label"
          id="input-group-4"
          label="Date range:"
          label-for="formrow-inputState"
        >
        <date-picker v-model="dataForm.dateRange" @clear="clearDatePicker" range append-to-body lang="en" confirm></date-picker>
        </b-form-group>
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
