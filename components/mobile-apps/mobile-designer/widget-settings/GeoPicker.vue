<template>
  <div>
    <a-input
      placeholder="Pick geopoint"
      allowClear
      :value="geo"
      :size="size"
      @change="emitChange($event.target.value)"
      @click="openMapModal"
    />

    <a-modal v-model="showMapModal" title="Pick geo point" @ok="save">
      <l-map
        ref="LMapRef"
        :zoom="1"
        :destroyOnClose="true"
        style="height: 300px"
        @click="pickGeo"
      >
        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        <l-marker v-if="markerLatlng.lat && markerLatlng.lng" :lat-lng="markerLatlng"/>
      </l-map>
    </a-modal>
  </div>
</template>

<script>
  import {Icon} from "leaflet";
  import 'leaflet/dist/leaflet.css';
  import {LMap, LMarker, LTileLayer} from "vue2-leaflet";

  delete Icon.Default.prototype._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });

  export default {
    name: "GeoPicker",
    components: {
      LMap,
      LTileLayer,
      LMarker,
    },
    model: {
      prop: 'geo',
      event: 'change'
    },
    props: {
      geo: String,
      size: String
    },
    data() {
      return {
        showMapModal: false,
        markerSet: false,
        markerLatlng: {
          lat: 0,
          lng: 0
        }
      }
    },
    methods: {
      parseGeoToLatLng(geo) {
        return {
          lat: geo.split(', ')[0],
          lng: geo.split(', ')[1],
        }
      },
      emitChange(e) {
        this.$emit('change', e)
      },
      openMapModal() {
        this.showMapModal = true
        if (this.geo?.length) {
          this.markerLatlng = this.parseGeoToLatLng(this.geo)
        }
      },
      pickGeo(e) {
        this.markerLatlng = e.latlng
      },
      save() {
        if (this.markerLatlng.lat && this.markerLatlng.lng) {
          this.emitChange(`${this.markerLatlng.lat}, ${this.markerLatlng.lng}`)
        }
        this.showMapModal = false
      }
    }
  }
</script>
