<template>
  <div
    v-if="screen"
    style="display: grid"
    :style="{background, gridTemplateRows: !hideHeader ? 'auto 1fr' : '1fr'}"
  >
    <ScreenHeader v-if="!hideHeader" :screen="screen"/>

    <div class="mobile-scrollbar" style="overflow-y: auto">
      <l-map
        :zoom="0"
        :max-zoom="0"
        :options="mapOptions"
        style="min-height: 156px; height: auto"
      >
        <l-tile-layer :url="url"/>
      </l-map>
      <draggable
        class="mobile-scrollbar"
        style="min-height: 32px; max-height: 50%; overflow-y: auto; border: dashed 1px rgba(0,0,0,.25)"
        :list="screen.model.model.children"
        :group="{ name: 'elements', put: (to, from ,el) => el.dataset.elemType === 'ma-geopin' }"
        :disabled="$store.state.globalDragDisabled"
      >
        <component
          v-for="elem in screen.model.model.children"
          :is="widgetTypes.find(x=> x.enum_id===elem.type) ? widgetTypes.find(x=> x.enum_id===elem.type).type : ''"
          :parentScreenKey="screen.model.model.key"
          :elem="elem"
          :key="elem.model.key"
        />
      </draggable>
    </div>
  </div>
</template>

<script>
  import BaseScreen from "@/components/mobile-apps/mobile-designer/screens/BaseScreen";
  import ScreenHeader from "@/components/mobile-apps/mobile-designer/screens/ScreenHeader";
  import maGeopin from "@/components/mobile-apps/mobile-designer/widgets/ma-geopin";
  import {LMap, LMarker, LTileLayer} from "vue2-leaflet";
  import draggable from "vuedraggable";


  export default {
    name: "mas-map",
    mixins: [BaseScreen],
    components: {
      ScreenHeader,
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
