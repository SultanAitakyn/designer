<template>
  <div
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    style="align-self: stretch; overflow: hidden; display: flex; flex-direction: column"
    :style="{
      minWidth: '12px',
      minHeight: '12px',
      ...sizes,
      ...margins,
      ...paddings,
      ...borderRadiuses,
      border: border ||  (!isRootStack && '1px dashed rgba(0,0,0,.25)'),
    }"
  >
    <l-map
      :zoom="1"
      :max-zoom="1"
      :options="mapOptions"
      style="flex-grow: 1; min-height: 300px"
    >
      <l-tile-layer :url="url"/>
    </l-map>
    <draggable
      class="mobile-scrollbar"
      style="min-height: 32px; max-height: 50%; overflow-y: auto"
      :list="elem.model.children"
      :group="{ name: 'elements', put: (to, from ,el) => el.dataset.elemType === 'ma-geopin' }"
      :disabled="$store.state.globalDragDisabled || disableDrag"
    >
      <component
        v-for="ch in elem.model.children"
        :disableDrag="disableDrag"
        :parentScreenKey="parentScreenKey"
        :key="ch.model.key"
        :elem="ch"
        :is="widgetTypes.find(x=> x.enum_id===ch.type) ? widgetTypes.find(x=> x.enum_id===ch.type).type : ''"
      />
    </draggable>
  </div>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";
  import { LMap, LTileLayer, LMarker } from "vue2-leaflet";
  import 'leaflet/dist/leaflet.css';
  import draggable from "vuedraggable";
  import { Icon } from 'leaflet';
  import maGeopin from "@/components/mobile-apps/mobile-designer/widgets/ma-geopin";

  delete Icon.Default.prototype._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });

  export default {
    name: "ma-map",

    mixins: [BaseWidget],

    components: {
      LMap,
      LTileLayer,
      LMarker,
      draggable,
      maGeopin,
    },

    data() {
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        mapOptions: {
          dragging: false,
          zoomControl: false,
          doubleClickZoom: false,
          boxZoom: false,
          zoomSnap: 0
        },
      }
    },
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
  }

  >>> .ant-drawer-wrapper-body::-webkit-scrollbar {
    width: 8px;
  }

  >>> .ant-drawer-wrapper-body::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, .25);
  }
</style>
