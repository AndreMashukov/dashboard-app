<script>
import axios from "axios";
export default {
  props: {
    videoId: {type: String},
    height: {
      type: String,
      default: '320',
    },
    width: {
      type: String,
      default: '640',
    },
  },
  created() {
    if(this.videoId) {
      let url = `https://vimeo.com/api/oembed.json`
      url += `?url=https%3A%2F%2Fvimeo.com%2F${this.videoId}`
      url += `&height=${this.height}`
      url += `&width=${this.width}`
      url += `&loop=false`
      url += `&autoplay=false`
      url += `&controls=true`
      url += `&id=${this.videoId}`
      axios.get(url).then(res => {this.html = res.html;}).catch(err => console.log(err))
      .finally(() => {
        setTimeout(() => {this.isPlaceholder = false}, 2000)
      })
    }
  },
  data: () => ({
    html: null,
    isPlaceholder: true,
  })
}
</script>

<template>
  <div v-html="html" :class="{'placeholder': isPlaceholder}" :style="`width: ${width}px; height: ${height}px`" />
</template>
