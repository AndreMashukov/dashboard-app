<script>
import InputSearchImage from "@/components/InputSearchImage";
import {cloneDeep} from "lodash";

export default {
  name: "dialog-media",
  components: {InputSearchImage},
  props: {
    isOpen: {type: Boolean, default: false},
    isDisable: {type: Boolean, default: false},
    typeModel: {type: String, required: true},
    typeMedia: {type: String, required: true},
    objectData: {type: Object, required: true},
    listTopic: {type: Array},
    imagesMedia: {type: Array},
    listTags: {type: Array},
    listSeries: {type: Array},
  },
  beforeUpdate() {
    if(!this.isOpen) return;
    const ser = {_id: null, name: '-- Please select --'}
    if(this.objectData.isEdit && !this.isEdit){
      this.isEdit = true;
      this.dataForm = cloneDeep(this.objectData);
      if(!this.objectData.tags || this.objectData.tags.length === 0)
        this.dataForm.tags = [{...ser}];
      if(this.objectData.imageSelect)
        this.imageSelect = {...this.objectData.imageSelect};
      if(this.objectData.imageMobileSelect)
        this.imageMobileSelect = {...this.objectData.imageMobileSelect};
      if(!this.objectData.series || !this.objectData.series._id)
        this.dataForm.series = {...ser};
      if(!this.objectData.topic || !this.objectData.topic._id) {
        for (let val of this.listTopic) {
          if(val.type !== this.typeMedia) continue;
          this.dataForm.topic = {...val};
          break;
        }
      }
      if(this.objectData.tags && this.objectData.tags.length > 0)
        this.dataForm.tags = this.objectData.tags.map(tag => {
          const idx = this.listTags.findIndex(tg => tg._id === tag._id);
          if(idx === -1) return {...ser}
          if(!this.listTags[idx].topic || this.listTags[idx].topic._id === this.dataForm.topic._id)
            return tag
          return {...ser};
        })
    }
    if(this.typeModel === 'create' && !this.dataForm.topic._id) {
      this.dataForm.series = {...ser};
      this.dataForm.tags = [{...ser}];
      for (let val of this.listTopic) {
        if(val.type !== this.typeMedia) continue;
        this.dataForm.topic = {...val};
        break;
      }
    }
    if(this.tags.length === 0) {
      this.tags = this.listTags.filter(tag => !tag.topic || tag.topic._id === this.dataForm.topic._id);
      this.tags.unshift({...ser});
    }
    if(this.series.length === 0) {
      this.series = this.listSeries.map(value => value);
      this.series.unshift({...ser})
    }
    if(this.topics.length === 0) {
      for (let val of this.listTopic) {
        if(val.type !== this.typeMedia) continue;
        this.topics.push(val)
      }
    }
  },
  data: () => ({
    isEdit: false,
    dataForm: {
      name: "",
      status: "draft",
      topic: {},
      urlFile: "",
      mp4Link: "",
      tags: [],
      thumbnail: "",
      thumbnailMobile: "",
      series: {},
      episode: '',
      description: "",
      detailInfo: "",
    },
    status: ["draft", "published"],
    tags: [],
    series: [],
    topics: [],
    imageSelect: {},
    imageMobileSelect: {},
    valueSeries: '',
    valueTag: null,
  }),
  methods: {
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length)
        return;
      this.dataForm.urlFile = files[0];
    },
    handleTopic(id) {
      const ser = {_id: null, name: '-- Please select --'}
      const idx = this.listTopic.findIndex(val => val._id === id);
      if(idx === -1) return;
      this.dataForm.topic = this.listTopic[idx];
      this.tags = this.listTags.filter(val => !val.topic || val.topic._id === this.listTopic[idx]._id)
      this.tags.unshift({...ser});
      this.dataForm.tags = this.dataForm.tags.map(tag => {
        const idx = this.tags.findIndex(tg => tg._id === tag._id);
        if(idx === -1) return {...ser}
        return tag;
      });
    },
    onSearch(value) {
      this.$emit('onFindImage', value)
    },
    selectImage(image) {
      this.imageSelect = image;
      this.dataForm.mediaImageFile = image
    },
    selectImageMobile(image) {
      this.imageMobileSelect = image;
      this.dataForm.mediaMobileImageFile = image
    },
    removeMediaSelect() {
      this.imageSelect = {};
      this.dataForm.mediaImageFile = '';
      this.dataForm.thumbnail = null;
    },
    removeMediaMobileSelect() {
      this.imageMobileSelect = {};
      this.dataForm.mediaMobileImageFile = '';
      this.dataForm.thumbnailMobile = null;
    },
    addTag() {
      const ser = {_id: null, name: '-- Please select --'};
      this.dataForm.tags.push(ser);
      if(!this.valueTag) this.valueTag = ser.name;
      else this.valueTag = null;
    },
    handleTagIds(index, id) {
      const idx = this.tags.findIndex(val => val._id === id);
      if(idx > -1) this.dataForm.tags[index] = this.tags[idx];
    },
    handleSeries(id) {
      const ser = {_id: null, name: '-- Please select --'};
      const idx = this.listSeries.findIndex(val => val._id === id);
      if(idx > -1) {
        this.dataForm.series = this.listSeries[idx];
        this.valueSeries = this.listSeries[idx].name;
      }else {
        this.dataForm.series = ser;
        this.valueSeries = '';
      }
    },
    handleSubmit() {
      const data = cloneDeep(this.dataForm);
      data.typeModel = this.typeModel;
      data.typeMedia = this.typeMedia;
      data.type = this.typeMedia;
      data.categoryId = this.dataForm.topic.categoryId;
      data.topicId = this.dataForm.topic._id;
      data.tagIds = [];
      this.dataForm.tags.forEach(value => {
        if(value._id) data.tagIds.push(value._id);
      })
      if(!data.series._id) {
        data.episode = null;
        data.seriesId = null;
      } else {
        data.seriesId = data.series._id;
      }
      if(this.imageSelect._id) data.mediaImageFile = this.imageSelect;
      else delete data.mediaImageFile
      if(this.imageMobileSelect._id) data.mediaMobileImageFile = this.imageMobileSelect;
      else delete data.mediaMobileImageFile
      delete data.subtype
      if(data.description === null) data.description = ''
      if(data.detailInfo === null) data.detailInfo = ''
      this.onReset();
      this.$emit("onSubmit", data);
    },
    handleClosed() {
      this.onReset();
      this.$emit('closed');
    },
    onReset() {
      this.dataForm = {
        name: "",
        status: "draft",
        topic: {},
        urlFile: "",
        mp4Link: "",
        tags: [],
        thumbnail: "",
        thumbnailMobile: "",
        series: {},
        episode: '',
        description: "",
        detailInfo: "",
      };
      this.imageSelect = {};
      this.imageMobileSelect = {};
      this.tags = [];
      this.series = [];
      this.topics = [];
      this.isEdit = false;
      this.valueSeries = '';
      this.valueTag = null;
    },
  }
}
</script>

<template>
  <b-modal
    :visible="isOpen"
    :title="!isEdit ? 'Add New' : 'Edit name: '+ objectData.name"
    title-class="text-black font-18"
    body-class="p-3"
    hide-footer
    @hidden="handleClosed"
  >
    <form @submit.prevent="handleSubmit">
      <div class="col-24 mb-2">
        <div>
          <label>Name (*required)</label>
          <input
            id="name"
            required="true"
            v-model="dataForm.name"
            type="text"
            :disabled=isDisable
            class="form-control"
            placeholder="Insert name"
          />
        </div>
      </div>
      <div class="col-24 mb-2" v-if="typeMedia !== 'audio'">
        <b-form-group
          label="status:"
        >
          <b-form-select
            class="form-select"
            v-model="dataForm.status"
            :options="status"
            type="text"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="col-24 mb-2">
        <b-form-group
          label="Topic:"
        >
          <b-form-select
            class="form-select"
            :value="dataForm.topic._id"
            :options="topics"
            text-field="name"
            value-field="_id"
            @change="handleTopic"
          ></b-form-select>
        </b-form-group>
      </div>
      <div class="col-24 mb-2" v-if="typeMedia === 'video'">
        <div>
          <label>Video url (*required)</label>
          <input
            id="urlVideo"
            required="true"
            v-model="dataForm.urlFile"
            type="text"
            class="form-control"
            placeholder="Insert urlFile"
          />
        </div>
      </div>
      <div class="col-24 mb-2" v-if="typeMedia === 'video'">
        <div>
          <label>Mp4 link:</label>
          <input
            v-model="dataForm.mp4Link"
            type="text"
            class="form-control"
            placeholder="Insert mp4 link"
          />
        </div>
      </div>
      <div class="col-24 mb-2" v-if="typeMedia === 'image'">
        <div>
          <label>Image</label>
          <input
            id="fileMediaImage"
            type="file"
            @change="onFileChange"
            class="form-control"
            placeholder="Choose file"
          />
          <v-avatar size="56" color="primary" v-if="dataForm.thumbnail">
            <img v-bind:src="dataForm.thumbnail"/>
          </v-avatar>
        </div>
      </div>

      <!--                    tagIds, seriesId, episode, subtyoe-->
      <div class="col-24 mb-4">
        <div class="row">
          <label class="col-20">Tags: </label>
          <div class="col-4 d-flex justify-content-end">
            <b-button v-if="dataForm.tags.length < this.listTags.length" variant="info" @click="addTag">
              <i class="mdi mdi-plus me-1"></i>
            </b-button>
          </div>
          <input type="text" style="display: none" v-model="valueTag">
        </div>
        <div class="row pb-1" v-for="(tag, idx) in dataForm.tags" :key="idx">
          <div class="col-20">
            <b-form-select
              class="form-select"
              :value="tag._id"
              :options="tags"
              text-field="name"
              value-field="_id"
              @change="(val) => handleTagIds(idx, val)"
            ></b-form-select>
          </div>
          <div class="col-4 d-flex justify-content-end pb-0 pt-0">
            <b-button variant="warning" @click="dataForm.tags.splice(idx, 1);">
              <i class="dripicons-minus"></i>
            </b-button>
          </div>
        </div>
      </div>
      <div class="col-24 mb-2" :style="imageSelect._id ? 'padding-bottom: 0': ''" v-if="typeMedia !== 'image'">
        <label>Thumbnail:</label>
        <input-search-image
          :items="imagesMedia"
          @onSearch="onSearch"
          @selectItem="selectImage"
          field-image="thumbnail"
          field-text="name"
        />
      </div>
      <div
        v-if="imageSelect._id && typeMedia !== 'image'"
        class="col-24 mb-2"
        style="padding-top: 0; padding-bottom: 0"
      >
        <div class="d-flex align-items-center">
          <div class="col-sm-4 p-2">
            <img :src="imageSelect.thumbnail" :alt="imageSelect.name" width="35">
          </div>
          <div class="col-sm-16 p-2">
            <input
              type="text"
              v-model="imageSelect.name"
              class="form-control"
              placeholder="Image name"
              :disabled="!imageSelect.isUploadFile"
            />
          </div>
          <div class="col-sm-4 p-2">
            <b-button-group size="sm" class="mr-1">
              <b-button variant="warning" @click="removeMediaSelect">X</b-button>
            </b-button-group>
          </div>
        </div>
      </div>
      <div class="col-24 mb-2" :style="imageMobileSelect._id ? 'padding-bottom: 0': ''" v-if="typeMedia !== 'image'">
        <label>Thumbnail mobile:</label>
        <input-search-image
          :items="imagesMedia"
          @onSearch="onSearch"
          @selectItem="selectImageMobile"
          field-image="thumbnail"
          field-text="name"
        />
      </div>
      <div
        v-if="imageMobileSelect._id && typeMedia !== 'image'"
        class="col-24 mb-2"
        style="padding-top: 0; padding-bottom: 0"
      >
        <div class="d-flex align-items-center">
          <div class="col-sm-4 p-2">
            <img :src="imageMobileSelect.thumbnail" :alt="imageMobileSelect.name" width="35">
          </div>
          <div class="col-sm-16 p-2">
            <input
              type="text"
              v-model="imageMobileSelect.name"
              class="form-control"
              placeholder="Image name"
              :disabled="!imageMobileSelect.isUploadFile"
            />
          </div>
          <div class="col-sm-4 p-2">
            <b-button-group size="sm" class="mr-1">
              <b-button variant="warning" @click="removeMediaMobileSelect">X</b-button>
            </b-button-group>
          </div>
        </div>
      </div>
      <div class="col-24 mb-2">
        <b-form-group
          id="input-group-4"
          label="Series:"
          label-for="formrow-inputState"
        >
          <b-form-select
            class="form-select"
            :value="dataForm.series._id"
            :options="series"
            text-field="name"
            value-field="_id"
            @input="handleSeries"
          ></b-form-select>
        </b-form-group>
        <input type="text" style="display: none" v-model="valueSeries">
      </div>
      <div v-if="dataForm.series._id" class="col-24 mb-2">
        <b-form-group
          label="episode:"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            v-model="dataForm.episode"
            placeholder="Enter episode"
            required
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="col-24 mb-2" v-if="!isDisable">
        <div>
          <label>Description:</label>
          <textarea
            id="dataFormDescription"
            class="form-control"
            :maxlength="225"
            rows="3"
            placeholder="This description has a limit of 225 chars."
            v-model="dataForm.description"
          ></textarea>
        </div>
        <div class="text-center">
          <p
            v-if="dataForm.description"
            class="badge position-absolute"
            :class="{
              'bg-success': dataForm.description.length !== 225,
               'bg-danger': dataForm.description.length === 225
            }"
          >
            {{ dataForm.description.length }} / 225
          </p>
        </div>
      </div>
      <div class="col-24 mb-2" v-if="!isDisable">
        <div>
          <label>Detail Info:</label>
          <textarea
            id="dataFormDetailInfo"
            class="form-control"
            :maxlength="225"
            rows="3"
            placeholder="This detail info has a limit of 225 chars."
            v-model="dataForm.detailInfo"
          ></textarea>
        </div>
        <div class="text-center">
          <p
            v-if="dataForm.detailInfo"
            class="badge position-absolute"
            :class="{
              'bg-success': dataForm.detailInfo.length !== 225,
               'bg-danger': dataForm.detailInfo.length === 225
            }"
          >
            {{ dataForm.detailInfo.length }} / 225
          </p>
        </div>
      </div>
      <div class="text-end mt-3">
        <b-button variant="light" @click="handleClosed">Close</b-button>
        <b-button type="submit" variant="success" class="ms-1">Submit</b-button>
      </div>
    </form>
  </b-modal>
</template>
