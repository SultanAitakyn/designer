<template>
  <div style="margin-top: 30px;">
    <a-row>
      <a-col :span="4" v-for="(action, index) in model.Actions" :key="index" class="action-card">
        <a-row style="margin-bottom: 12px;">
          <a-col :span="24" style="display: flex; justify-content: flex-end">
            <a-icon type="close" @click="removeAction(index)" />
          </a-col>
        </a-row>
        <a-row style="margin-bottom: 12px;">
          Type
          <a-col :span="24">
            <a-select
              v-model="action.Type"
              @change="setActionType(action, $event)"
              style="width: 100%"
            >
              <a-select-option v-for="type in actionTypes" :key="type.value">
                {{type.name}}
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">Endpoint</a-col>
        </a-row>
        <a-row style="margin-bottom: 12px;" :gutter="12">
          <a-col :span="12">
            URL
            <a-select
              v-model="action.Endpoint.url"
              allowClear
              style="width: 100%"
            >
<!--              <a-select-option-->
<!--                v-for="(endpoint) in "-->
<!--              >-->
<!---->
<!--              </a-select-option>-->
            </a-select>
          </a-col>
          <a-col :span="12">
            Method
            <a-select
              v-model="action.Endpoint.method"
              @change="setEndpointMethod(action, $event)"
              style="width: 100%"
            >
              <a-select-option v-for="method in endpointMethods" :key="method.value">
                {{method.name}}
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">Screen</a-col>
        </a-row>
        <a-row :gutter="12" style="margin-bottom: 12px;">
          <a-col :span="12">
            Title
            <a-input
              v-model="action.Screen.model.Title"
            />
          </a-col>
          <a-col :span="12">
            Type
            <a-select
              v-model="action.Screen.type"
              @change="setScreenType(action, $event)"
              style="width: 100%"
            >
              <a-select-option v-for="type in screenTypes" :key="type.value">
                {{type.name}}
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">Icon</a-col>
          <a-col :span="24">
            Name
            <a-input
              v-model="action.Icon.Name"
            />
          </a-col>
        </a-row>
        <a-row :gutter="12" style="margin-bottom: 12px;">
          <a-col :span="12">
            Width
            <a-input-number
              :min="0"
              v-model="action.Icon.Width.Size"
              style="width: 100%"
            />
          </a-col>
          <a-col :span="12">
            Height
            <a-input-number
              :min="0"
              v-model="action.Icon.Height.Size"
              style="width: 100%"
            />
          </a-col>
        </a-row>
      </a-col>
      <a-col
        :span="4"
        class="dashed-card"
      >
        <div class="add-btn" @click="addAction">
          <a-icon type="plus" />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import uuidv4 from "uuid/v4";

export default {
  name: "Actions",
  props: {
    screen: Object,
    model: Object
  },
  mounted() {

  },
  data() {
    return {
      actionTypes: [
        {"value": 1, name: 'Tap'},
        {"value": 2, name: 'DoubleTap'},
        {"value": 3, name: 'LongTap'},
        {"value": 4, name: 'SwipeLeft'},
        {"value": 5, name: 'SwipeRight'},
        {"value": 6, name: 'SwipeUp'},
        {"value": 7, name: 'SwipeDown'},
        {"value": 8, name: 'Pinch'},
        {"value": 9, name: 'Scroll'},
        {"value": 10, name: 'Menu'},
        {"value": 11, name: 'MainAction'},
      ],
      endpointMethods: [
        {"value": 'GET', name: 'GET'},
        {"value": 'POST', name: 'POST'},
        {"value": 'PUT', name: 'PUT'},
        {"value": 'DELETE', name: 'DELETE'},
      ],
      screenTypes: [
        {"value": 'list', name: 'List'},
        {"value": 'breadcrumbs_list', name: 'Breadcrumbs'},
        {"value": 'view', name: 'View'},
        {"value": 'modal', name: 'Modal'},
        {"value": 'bottom_sheet', name: 'Bottom Sheet'},
        {"value": 'tab', name: 'Tab'},
        {"value": 'map', name: 'Map'},
      ]
    }
  },
  methods: {
    setActionType(action, val) {
      action.Type = val
    },
    setEndpointMethod(action, val) {
      action.Endpoint.method = val
    },
    setScreenType(action, val) {
      action.Screen.type = val
    },
    removeAction(index) {
      this.model.Actions.splice(index, 1);
    },
    addAction() {
      this.model.Actions.push(this.newAction())
    },
    newAction() {
      return {
        Endpoint: {
          url: "",
          method: "GET"
        },
        Icon: {
          Width: {
            Unit: 0,
            Size: 16,
          },
          Height: {
            Unit: 0,
            Size: 16,
          },
          Name: ""
        },
        Screen: {
          type: "list",
          model: {
            Title: ""
          }
        },
        Type: 1,
      }
    },
  }
};
</script>

<style scoped>
.dashed-card {
  border: rgba(0, 0, 0, 0.12) 1px dashed;
  display: flex;
  padding: 12px;
  min-height: 428px;
}
.action-card {
  padding: 12px;
  border: rgba(0, 0, 0, 0.12) 1px solid;
  margin-right: 8px;
}
.add-btn {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.add-btn:hover {
  cursor: pointer;
  background-color: #e5e5e5;
}

</style>
