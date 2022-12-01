<script>
import VimeoEmbed from "@/components/VimeoEmbed";
import MySwitch from "@/components/MySwitch";
export default {
  components: {VimeoEmbed, MySwitch},
  props: {
    items: {type: Array},
    totalItems: {type: Number},
    itemsPage: {type: Number},
    currentPage: {type: Number},
  },
  methods: {
    handlePage(page) {
      this.$emit('handlePage', page);
    },
    handleEdit(item) {
      this.$emit('handleEdit', item);
    },
    handleDelete(item) {
      this.$emit('handleDelete', item);
    },
    handleStatus(item) {
      this.$emit('handleStatus', item);
    },
    getVimeoId(link) {
      if (!link) return ''
      return link.split('https://vimeo.com/')[1]
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
          <th>Video / Image</th>
          <th>Topic</th>
          <th>Series</th>
          <th>Episode</th>
          <th>Tags</th>
          <th>Detail</th>
          <th>Status</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in items" :key="item._id">
          <td>{{ item.name }}</td>
          <td>
            <vimeo-embed
              :video-id="getVimeoId(item.urlFile)"
              height="100"
              width="200"
            />
          </td>
          <td>{{ item.topic ? item.topic.name : '' }}</td>
          <td>{{ item.series ? item.series.name : item.series }}</td>
          <td>{{ item.episode ? item.episode : "" }}</td>
          <td>{{ item.tags ? item.tags.map(t => t.name).toString() : '' }}</td>
          <td style="max-width: 200px;overflow: hidden;">{{ item.detailInfo }}</td>
          <td>
            <my-switch
              :is-toggle="item.status === 'published'"
              @click="handleStatus(item)"
            />
          </td>
          <td style="cursor: pointer" @click="handleEdit(item)">
            <i class="fas fa-edit text-danger me-1"></i>
          </td>
          <td style="cursor: pointer" @click="handleDelete(item)">
            <i class="fas fa-trash-alt text-danger me-1"></i>
          </td>
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
