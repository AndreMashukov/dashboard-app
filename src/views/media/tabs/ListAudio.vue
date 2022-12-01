<script>
export default {
  props: {
    items: {type: Array},
    totalItems: {type: Number},
    itemsPage: {type: Number},
    currentPage: {type: Number},
  },
  data: () => ({
    itemAudioPlay: '',
    audioLink: '',
  }),
  methods: {
    handlePage(page) {
      this.$emit('handlePage', page)
    },
    handleEdit(item) {
      this.$emit('handleEdit', item)
    },
    playSound(sound) {
      if (sound && !this.itemAudioPlay) {
        this.itemAudioPlay = new Audio(sound);
        this.itemAudioPlay.play();
        this.audioLink = sound
      } else if (sound && this.itemAudioPlay) {
        this.itemAudioPlay.pause();
        if (this.audioLink === sound) return this.audioLink = ''
        this.itemAudioPlay = new Audio(sound);
        this.itemAudioPlay.play();
        this.audioLink = sound
      }
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
          <th>Audio</th>
          <th>Thumbnail</th>
          <th>Topic</th>
          <th>Duration</th>
          <th>Tags</th>
          <th>Sub type</th>
          <th>Status</th>
          <th>Edit</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in items" :key="item._id">
          <td>{{ item.name || item.title }}</td>
          <td>
            <span style="cursor: pointer" v-if="!audioLink || audioLink !== item.audio">
              <i class="fas fa-play" @click.prevent="() => playSound(item.audio)"/>
            </span>
            <span style="cursor: pointer" v-if="audioLink && audioLink === item.audio">
              <i class="fas fa-pause" @click.prevent="() => playSound(item.audio)"/>
            </span>
          </td>
          <td>
            <v-avatar size="56" color="primary">
              <img v-if="item.thumbnail" v-bind:src="item.thumbnail"/>
            </v-avatar>
          </td>
          <td>{{ item.topic ? item.topic.name : '' }}</td>
          <td>{{ item.duration }}</td>
          <td>{{ item.tags ? item.tags.map(t => t.name).toString() : '' }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.status }}</td>
          <td style="cursor: pointer" @click="handleEdit(item)">
            <i class="fas fa-edit text-danger me-1"></i>
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
