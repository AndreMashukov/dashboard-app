<script>
import {
  required,
  email,
  minLength,
  sameAs,
  numeric,
  url,
  alphaNum,
} from "vuelidate/lib/validators";

/**
 * Form validation component
 */
export default {
  page: {
    title: "Form Validation",
    meta: [{ name: "media", content: "" }],
  },
  data() {
    return {
      title: "Form Validation",
      items: [
        {
          text: "Forms",
          href: "/",
        },
        {
          text: "Form Validation",
          active: true,
        },
      ],
      range: {
        minlen: "",
        maxlength: "",
        between: "",
        minval: "",
        maxval: "",
        rangeval: "",
        expr: "",
      },
      typeform: {
        name: "",
        password: "",
        confirmPassword: "",
        email: "",
        url: "",
        digit: "",
        number: "",
        alphanum: "",
        textarea: "",
      },
      submit: false,
      typesubmit: false,
    };
  },
  validations: {
    typeform: {
      name: { required },
      password: { required, minLength: minLength(6) },
      confirmPassword: { required, sameAsPassword: sameAs("password") },
      email: { required, email },
      url: { required, url },
      digit: { required, numeric },
      number: { required, numeric },
      alphanum: { required, alphaNum },
      textarea: { required },
    },
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    formSubmit(e) {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
    },

    tooltipForm() {
      this.submitform = true;
      this.$v.$touch();
    },

    /**
     * Range validation form submit
     */
    // eslint-disable-next-line no-unused-vars
    rangeform(e) {
      this.submit = true;
      // stop here if form is invalid
      this.$v.$touch();
    },
    /**
     * Validation type submit
     */
    // eslint-disable-next-line no-unused-vars
    typeForm(e) {
      this.typesubmit = true;
      // stop here if form is invalid
      this.$v.$touch();
    },
  },
};
</script>

<template>
  <div class="col-lg-6">
    <div class="card">
      <div class="card-body">
        <h4 class="card-title">Range validation</h4>
        <p class="card-title-desc">
          Parsley is a javascript form validation library. It helps you
          provide your users with feedback on their form submission before
          sending it to your server.
        </p>

        <form action="#" @submit.prevent="rangeform">
          <div class="mb-3">
            <label>Min Length</label>
            <div>
              <input
                v-model="range.minlen"
                type="text"
                name="minlen"
                class="form-control"
                :class="{ 'is-invalid': submit && $v.range.minlen.$error }"
                placeholder="Min 6 chars."
              />
              <div
                v-if="submit && $v.range.minlen.$error"
                class="invalid-feedback"
              >
                    <span v-if="!$v.range.minlen.required"
                    >This value is required.</span
                    >
                <span v-if="!$v.range.minlen.minLength"
                >This value is too short. It should have 6 characters or
                      more.</span
                >
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label>Max Length</label>
            <div>
              <input
                v-model="range.maxlength"
                type="text"
                class="form-control"
                name="maxlength"
                :class="{
                      'is-invalid': submit && $v.range.maxlength.$error,
                    }"
                placeholder="Max 6 chars."
              />
              <div
                v-if="submit && $v.range.maxlength.$error"
                class="invalid-feedback"
              >
                    <span v-if="!$v.range.maxlength.required"
                    >This value is required.</span
                    >
                <span v-if="!$v.range.maxlength.maxLength"
                >This value is too long. It should have 6 characters or
                      fewer.</span
                >
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label>Range Length</label>
            <div>
              <input
                v-model="range.between"
                type="text"
                class="form-control"
                name="between"
                :class="{ 'is-invalid': submit && $v.range.between.$error }"
                placeholder="Text between 5 - 10 chars length"
              />
              <div
                v-if="submit && $v.range.between.$error"
                class="invalid-feedback"
              >
                    <span v-if="!$v.range.between.required"
                    >This value is required.</span
                    >
                <span v-if="!$v.range.between.maxLength"
                >This value length is invalid. It should be between 5 and
                      10 characters long.</span
                >
                <span v-if="!$v.range.between.minLength"
                >This value length is invalid. It should be between 5 and
                      10 characters long.</span
                >
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label>Min Value</label>
            <div>
              <input
                v-model="range.minval"
                type="text"
                name="minval"
                class="form-control"
                :class="{ 'is-invalid': submit && $v.range.minval.$error }"
                placeholder="Min value is 6"
              />
              <div
                v-if="submit && $v.range.minval.$error"
                class="invalid-feedback"
              >
                    <span v-if="!$v.range.minval.required"
                    >This value is required.</span
                    >
                <span v-if="!$v.range.minval.minValue"
                >This value should be greater than or equal to 6.</span
                >
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label>Max Value</label>
            <div>
              <input
                v-model="range.maxval"
                type="text"
                class="form-control"
                name="maxval"
                :class="{ 'is-invalid': submit && $v.range.maxval.$error }"
                placeholder="Max value is 6"
              />
              <div
                v-if="submit && $v.range.maxval.$error"
                class="invalid-feedback"
              >
                    <span v-if="!$v.range.maxval.required"
                    >This value is required.</span
                    >
                <span v-if="!$v.range.maxval.maxValue"
                >This value should be lower than or equal to 6.</span
                >
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label>Range Value</label>
            <div>
              <input
                v-model="range.rangeval"
                type="text"
                class="form-control"
                name="rangeval"
                :class="{
                      'is-invalid': submit && $v.range.rangeval.$error,
                    }"
                placeholder="Number between 6 - 100"
              />
              <div
                v-if="submit && $v.range.rangeval.$error"
                class="invalid-feedback"
              >
                    <span v-if="!$v.range.rangeval.required"
                    >This value is required.</span
                    >
                <span v-if="!$v.range.rangeval.minValue"
                >This value should be between 6 and 100.</span
                >
                <span v-if="!$v.range.rangeval.maxValue"
                >This value should be between 6 and 100.</span
                >
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label>Regular Exp</label>
            <div>
              <input
                v-model="range.expr"
                type="text"
                class="form-control"
                name="expr"
                :class="{ 'is-invalid': submit && $v.range.expr.$error }"
                placeholder="Hex. Color"
              />
              <div
                v-if="submit && $v.range.expr.$error"
                class="invalid-feedback"
              >
                    <span v-if="!$v.range.expr.required"
                    >This value is required.</span
                    >
              </div>
            </div>
          </div>

          <div class="mb-3 mb-0">
            <div>
              <button type="submit" class="btn btn-primary">Submit</button>
              <button type="reset" class="btn btn-secondary ms-1">
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    <!-- end card -->
  </div>
</template>
