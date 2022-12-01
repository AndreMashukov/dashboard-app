<script>
export default {
  name: "Avatar",
  data: () => ({
    uploadFieldName: 'file',
    errorDialog: null,
    errorText: '',
    maxSize: 1024,
  }),
  props: ['profile', 'size'],
  methods: {
    launchFilePicker(){
      this.$refs.fileAvatar.click();
    },
    onFileChange(fieldName, file) {
      const { maxSize } = this
      let imageFile = file[0]
      if (file.length > 0) {
        let size = imageFile.size / maxSize / maxSize
        if (!imageFile.type.match('image.*')) {
          this.errorDialog = true
          this.errorText = 'Please choose an image file'
        } else if (size > 1) {
          this.errorDialog = true
          this.errorText = 'Your file is too big! Please select an image under 1MB'
        } else {
          let imageURL = URL.createObjectURL(imageFile)
          this.$emit('click', {fieldName, imageFile, imageURL});
        }
      }
    }
  }
}
</script>

<template>
    <v-avatar
      color="grey lighten-2"
      :size="size || 56"
    >
    <v-btn style="width: 100%; height: 100%" dark exact icon color="green" @click="launchFilePicker">
      <span v-if="profile && !profile.avatar" class="white--text text-h5">
        {{profile.name ? profile.name.split("")[0].toUpperCase() : "" }}
      </span>
      <v-icon v-if="!profile" dark>
        mdi-account-circle
      </v-icon>
      <v-img
        contain
        aspect-ratio="1"
        v-if="profile && profile.avatar"
        v-bind:src="profile.avatar"
        v-bind:alt="profile.name"
      ></v-img>
    </v-btn>
    <input
      accept="image/png, image/jpeg"
      type="file"
      ref="fileAvatar"
      :name="uploadFieldName"
      @change="onFileChange($event.target.name, $event.target.files)"
      style="display:none">
    </v-avatar>
</template>
