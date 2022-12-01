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
    handleEdit(item) {
      this.$emit('handleEdit', item)
    },
    handleDelete(item) {
      this.$emit('handleDelete', item)
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
          <th>Name</th>
          <th>Status</th>
          <th>Questions</th>
          <th>Start date</th>
          <th>End date</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in items" :key="item._id">
          <td>{{ item.name }}</td>
          <td>{{ item.status }}</td>
          <td>
            <b-card no-body v-for="qt in item.questions" :key="qt._id" class="mb-1">
              <b-card-header header-tag="header" class="p-1" role="tab">
                <b-button block v-b-toggle="`accordion-${qt._id}`" variant="outline-info">{{ qt.numberOfAnswers + ". " + qt.question}}</b-button>
              </b-card-header>
              <b-collapse :id="`accordion-${qt._id}`" visible accordion="my-accordion" role="tabpanel">
                <b-card-body>
                  <b-card-text v-for="op in qt.options" :key="op">{{ op }}</b-card-text>
                </b-card-body>
              </b-collapse>
            </b-card>
          </td>
          <td>{{ formatDate(item.startDate) }}</td>
          <td>{{ formatDate(item.endDate) }}</td>
          <td style="cursor: pointer" @click="() => handleEdit(item)">
            <i class="fas fa-edit text-danger me-1"></i>
          </td>
          <td style="cursor: pointer" @click="() => handleDelete(item)">
            <i class="fas fa-trash-alt text-danger me-1"></i>
          </td>
<!--          <td style="cursor: pointer"-->
<!--              @click="handleEdit(item)">-->
<!--            <i class="fas fa-edit text-danger me-1"></i>-->
<!--          </td>-->
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
