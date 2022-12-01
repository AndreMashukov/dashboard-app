<script>
import moment from "moment";

export default {
  props: {
    items: {type: Array},
    totalItems: {type: Number},
    itemsPage: {type: Number},
    currentPage: {type: Number},
    typeTab: {type: String},
  },
  data: () => ({
    itemAudioPlay: '',
    audioLink: '',
  }),
  methods: {
    formatDate(value) {
      if (value) {
        return moment(value).format('YYYY-MM-DD hh:mm')
      }
    },
    handlePage(page) {
      this.$emit('handlePage', page)
    },
  },
}
</script>

<template>
  <div>
    <div class="table-responsive" style="padding-left: 10px">
      <table class="table table-centered table-nowrap align-middle">
        <thead>
        <tr>
          <th>Email</th>
          <th>Survey Name</th>
          <th>Survey Answer</th>
          <th>Success</th>
          <th>Date</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in items" :key="item._id">
          <td>{{ item.email }}</td>
          <td>{{ item.survey ? item.survey.name : "" }}</td>
          <td>
            <ul v-if="item.result">
              <li v-for="(res, idx) in item.result" :key="idx">
                <span v-if="res.question" class="list-group-item list-group-item-danger">
                  Question {{idx+ 1}}: {{(res.question.question && res.question.question.length > 100) ? res.question.question.substr(0,100) + "...?" : res.question.question || ""}}
                </span>
                <ul>
                  <li v-for="(ans, idx2) in res.answers" :key="idx2" class="list-group-item list-group-item-info">
                    {{"Answer: " + ans}}
                  </li>
                </ul>
              </li>
            </ul>
          </td>
          <td>{{ item.isSuccess }}</td>
          <td>{{ formatDate(item.date) }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="row">
      <div class="col">
        <div class="dataTables_paginate paging_simple_numbers float-end">
          <ul class="pagination pagination-rounded mb-0">
            <b-pagination
              :value="currentPage + 1"
              :total-rows="totalItems"
              :per-page="itemsPage"
              @change="handlePage"
            ></b-pagination>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
