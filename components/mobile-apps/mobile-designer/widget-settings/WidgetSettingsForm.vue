<template>
  <a-form-model :model="widget.model" layout='vertical' class="widget-settings-form">

    <!-- Name -->
    <a-form-model-item>
      <template v-if="widget.type === 5">
        <template slot="label">
          Icon
          <a-tooltip>
            <template slot="title">
              Select icon from the list of predefined icon set
            </template>
            <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
          </a-tooltip>
        </template>
        <a-select style="width: 180px" size="small" v-model="widget.model.name">
          <a-select-option v-for="icon in mobIcons" :key="icon.value" :value="icon.value">
            <a-icon :type="icon.label"/>
            {{ icon.label }}
          </a-select-option>
        </a-select>
      </template>
      <template v-else>
        <template slot="label">
          Name
          <a-tooltip>
            <template slot="title">
              Name will be used to identify your element in Designer interface
            </template>
            <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
          </a-tooltip>
        </template>
        <a-input v-model="widget.model.name" size="small"/>
      </template>
    </a-form-model-item>

    <!-- Data source & Static value -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('data_field_id') && [3,6,7,14,29,21,23,30,18,20].includes(widget.type)">
      <template slot="label">
        Data Source
        <a-tooltip>
          <template slot="title">
            Widget can show static value or get data dynamically from endpoint field
          </template>
          <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
        </a-tooltip>

        <a-radio-group
          v-model="dataSource"
          button-style="solid"
          size="small"
          style="margin-left: 10px;"
          @change="changeDataSource"
        >
          <a-radio-button key="1" :value="false">
            Static value
          </a-radio-button>
          <a-radio-button key="2" :value="true">
            Endpoint Field
          </a-radio-button>
        </a-radio-group>
      </template>

      <!-- Data Source -->
      <a-tree-select
        v-if="dataSource"
        v-model="widget.model.data_field_id"
        :disabled="!getSelectedScreen.model.model.data_endpoint_id"
        showSearch
        :placeholder="getSelectedScreen.model.model.data_endpoint_id ? 'Select field' : 'No Endpoint set in screen settings'"
        size="small"
        dropdownMatchSelectWidth
      >
        <a-tree-select-node
          v-for="field in screenFields"
          :key="field.name"
          :value="field.id"
          :title="field.name"
        >
          <template v-if="field.relationModelId">
            <a-tree-select-node
              v-for="rmf in endpoints.find(ep => ep.method === 1 && ep.fields.some(f => f.modelId === field.relationModelId)).fields.filter(x => x.dir === 2)"
              :key="rmf.id"
              :value="rmf.id"
              :title="rmf.name"
            />
          </template>
        </a-tree-select-node>
      </a-tree-select>

      <!-- Static Value -->
      <div v-else>

        <a-input v-if="[3].includes(widget.type)" v-model="widget.model.title" size="small"/>

        <GeoPicker v-if="[14].includes(widget.type)" v-model="widget.model.geo" size="small"/>

        <a-input v-if="[29, 21].includes(widget.type)" v-model="widget.model.value" size="small"/>

        <a-select v-if="[23].includes(widget.type)" v-model="widget.model.value" size="small">
          <a-select-option v-for="(value, key) in widget.model.values" :key="key" :value="value">
            {{ value }}
          </a-select-option>
        </a-select>

        <a-input-number
          v-if="[18, 20].includes(widget.type)"
          v-model="widget.model.value"
          :min="0"
          :max="widget.model.cap"
          size="small"
        />

        <a-textarea
          v-if="[30].includes(widget.type)"
          v-model="widget.model.value"
          size="small"
          :rows="widget.model.lines"
          :auto-size="{ minRows: widget.model.lines }"
        />

        <DatetimePicker v-if="[7].includes(widget.type)" v-model="widget.model.from" :format="widget.model.format" size="small"/>

        <!-- Image -->
        <a-upload
          v-if="[6].includes(widget.type)"
          name="image"
          list-type="picture-card"
          class="image-uploader"
          :show-upload-list="false"
          :customRequest="handleUpload"
          :before-upload="beforeUpload"
        >
          <img
            ref="imageElem"
            v-if="imageURI || widget.model.thumb_url"
            :src="imageURI || widget.model.thumb_url"
            style="max-width: 100%; height: auto;"
            alt=""
          />
          <div v-else>
            <a-icon :type="loading ? 'loading' : 'plus'"/>
            <div class="ant-upload-text">Upload</div>
          </div>
        </a-upload>

      </div>
    </a-form-model-item>

    <!-- Data source -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('data_field_id') && ![3,6,7,14,29,21,23,30,18,20].includes(widget.type)">
      <template slot="label">
        Data Source
        <a-tooltip>
          <template slot="title">
            Widget can show static value or get data dynamically from endpoint field
          </template>
          <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
        </a-tooltip>
      </template>

      <a-tree-select
        v-model="widget.model.data_field_id"
        :disabled="!getSelectedScreen.model.model.data_endpoint_id"
        showSearch
        :placeholder="getSelectedScreen.model.model.data_endpoint_id ? 'Select field' : 'No Endpoint set in screen settings'"
        size="small"
        dropdownMatchSelectWidth
      >
        <a-tree-select-node
          v-for="field in screenFields"
          :key="field.name"
          :value="field.id"
          :title="field.name"
        >
          <template v-if="field.relationModelId">
            <a-tree-select-node
              v-for="rmf in endpoints.find(ep => ep.method === 1 && ep.fields.some(f => f.modelId === field.relationModelId)).fields.filter(x => x.dir === 2)"
              :key="rmf.id"
              :value="rmf.id"
              :title="rmf.name"
            />
          </template>
        </a-tree-select-node>
      </a-tree-select>
    </a-form-model-item>

    <!-- Target screen -->
    <a-form-model-item v-if="[11, 19].includes(widget.type)">
      <template slot="label">
        Target Screen
        <a-tooltip>
          <template slot="title">
            The selected screen will be rendered inside of widget screen after the user clicks the button.
          </template>
          <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
        </a-tooltip>
      </template>

      <a-select
        size="small"
        placeholder="Select screen"
        @change="changeScreen"
        v-model="widget.model.actions[0].screen.model.key"
      >
        <a-select-option
          v-for="s in availableScreens"
          :key="s.model.model.key"
          :value="s.model.model.key"
        >
          <a-icon
            :type="screenTypes.find(x=> x.enum_id===s.model.type).icon"
            v-if="screenTypes.find(x=> x.enum_id===s.model.type)"
          />
          {{ s.model.model.navigation.title ? s.model.model.navigation.title : '(' + s.name + ')' }}
        </a-select-option>
      </a-select>
    </a-form-model-item>

    <!--
    Specific
    -->

    <!-- Label -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('title') && ![3].includes(widget.type)" label="Label">
      <a-input v-model="widget.model.title" size="small"/>
    </a-form-model-item>

    <!-- Label from .data -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('data')" label="Label">
      <a-input v-model="widget.model.data" size="small"/>
    </a-form-model-item>

    <!-- Icon -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('icon')" label="icon">
      <a-select style="width: 180px" size="small" v-model="widget.model.icon.name">
        <a-select-option v-for="icon in mobIcons" :key="icon.value" :value="icon.value">
          <a-icon :type="icon.label"/>
          {{ icon.label }}
        </a-select-option>
      </a-select>
    </a-form-model-item>

    <!-- Description -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('description')" label="Description">
      <a-input v-model="widget.model.description" size="small"/>
    </a-form-model-item>

    <!-- Format string -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('format')" label="Format string">
      <DatetimeFormatSelectSetting v-model="widget.model.format" :datetime="widget.model.from" size="small"/>
    </a-form-model-item>

    <!-- Thumbnail only -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('thumbnail_only')" label="Thumbnail only">
      <a-switch v-model="widget.model.thumbnail_only"/>
    </a-form-model-item>

    <!-- Max lines -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('max_lines')" label="Max lines">
      <a-input-number v-model.number="widget.model.max_lines" :min="0" style="width: 70px;" size="small"/>
    </a-form-model-item>

    <!-- Cap -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('cap')" label="Cap">
      <a-input-number v-model="widget.model.cap" size="small"/>
    </a-form-model-item>

    <!-- HTML markup -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('is_html')">
      <template slot="label">
        HTML Markup
        <a-tooltip :mouseEnterDelay="1">
          <template slot="title">
            Check this selector if you want include HTML tags inside of text widget
          </template>
          <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
        </a-tooltip>
      </template>
      <a-switch v-model="widget.model.is_html"/>
    </a-form-model-item>

    <!--
    Forms
    -->

    <!-- Endpoint -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('endpoint')" label="Endpoint">
      <a-select
        showSearch
        :placeholder="!endpointsReady ? 'Preparing..' : 'Select endpoint'"
        v-model="widget.model.endpoint.id"
        optionFilterProp="children"
        size="small"
        @change="changeEndpoint"
        :disabled="!endpointsReady"
      >
        <a-select-opt-group v-for="group in endpointGroups" :key="group.id">
          <span slot="label">
            <a-icon type="api"/>
            {{ group.name }}
          </span>
          <a-select-option
            v-for="endpoint in endpoints.filter(x => x.groupId===group.id && (x.method === 2 || x.method === 3))"
            :value="endpoint.id"
            :key="endpoint.id"
          >
            {{ group.name }} => {{ getMethodForEndpoint(endpoint.method) }} {{ endpoint.path }}
          </a-select-option>
        </a-select-opt-group>
      </a-select>
    </a-form-model-item>

    <!-- Send name -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('send_name')" label="Send name">
      <a-select v-model="widget.model.send_name" size="small">
        <a-select-option
          v-for="field in formFields.filter(f => f.dir === 1)"
          :key="field.id"
          :value="field.name"
        >
          {{ field.name }}
        </a-select-option>
      </a-select>
    </a-form-model-item>

    <!-- Placeholder -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('placeholder')" label="Placeholder">
      <a-input v-model="widget.model.placeholder" size="small"/>
    </a-form-model-item>

    <!-- Value Type and Required -->
    <a-row
      type="flex"
      :gutter="16"
      v-if="widgetModel.model.hasOwnProperty('value_type') || widgetModel.model.hasOwnProperty('required')"
    >

      <!-- Value type -->
      <a-col flex="0 1 200px" v-if="widgetModel.model.hasOwnProperty('value_type')">
        <a-form-model-item label="Value type">
          <a-select v-model="widget.model.value_type" size="small">
            <a-select-option :value="0">String</a-select-option>
            <a-select-option :value="1">Number</a-select-option>
            <a-select-option :value="2">Integer</a-select-option>
            <a-select-option :value="3">Email</a-select-option>
            <a-select-option :value="4">Phone</a-select-option>
            <a-select-option :value="5">Password</a-select-option>
          </a-select>
        </a-form-model-item>
      </a-col>

      <!-- Required -->
      <a-col>
        <a-form-model-item label="Required" v-if="widgetModel.model.hasOwnProperty('required')">
          <a-switch v-model="widget.model.required" :default-checked="requiredDefault"/>
        </a-form-model-item>
      </a-col>
    </a-row>

    <!-- Length -->
    <a-form-model-item
      v-if="widgetModel.model.hasOwnProperty('min_length') && widgetModel.model.hasOwnProperty('max_length')"
      label="Min and max sybmols length"
    >
      <a-form-model-item style="display: inline-block;">
        <a-input-number
          v-model.number="widget.model.min_length"
          :min="-1"
          :formatter="value => value < 0 ? 'auto' : `${value}`"
          size="small"
        />
      </a-form-model-item>
      <span :style="{ display: 'inline-block', width: '24px', textAlign: 'center' }">
        -
      </span>
      <a-form-model-item style="display: inline-block;" class="m-bottom">
        <a-input-number
          v-model.number="widget.model.max_length"
          :min="-1"
          :formatter="value => value < 0 ? 'auto' : `${value}`"
          size="small"
        />
      </a-form-model-item>
    </a-form-model-item>

    <!-- Lines -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('lines')" label="Lines">
      <a-input-number v-model.number="widget.model.lines" :min="1" size="small"/>
    </a-form-model-item>

    <!-- Enums -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('values')" label="Enums">
      <a-select size="small" @select="enumsGroupSelected">
        <a-select-option v-for="enumsGroup in enumsGroups" :key="enumsGroup.id" :value="enumsGroup.id">
          {{ enumsGroup.name }}
        </a-select-option>
      </a-select>
    </a-form-model-item>

    <a-list
      v-if="widgetModel.model.hasOwnProperty('values') && widget.model.values"
      :data-source="enumsDataSource"
      size="small"
      bordered
      style="margin-bottom: 16px;"
    >
      <a-list-item slot="renderItem" slot-scope="item">
        {{ item[1] }}
        <a slot="actions" style="color: red" @click.prevent="deleteValue(item[0])">
          <a-icon type="delete"/>
        </a>
      </a-list-item>
    </a-list>
    <!--    <table-enum-elements-2 v-if="widgetModel.model.hasOwnProperty('values')" :enums="enums" @change="updateEnums"/>-->

    <!-- Datepicker type -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('picker_type')" label="Picker type">
      <a-select v-model="widget.model.picker_type" :default-value="0" defaultActiveFirstOption size="small">
        <a-select-option :value="0">datetime</a-select-option>
        <a-select-option :value="1">date</a-select-option>
        <a-select-option :value="2">time</a-select-option>
      </a-select>
    </a-form-model-item>

    <!-- Datetime Range from -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('from') && ![7].includes(widget.type)" label="Range from">
      <DatetimePicker
        v-model="widget.model.from"
        :format="datetimeFormats[widget.model.picker_type || 0].value"
        :secondStep="widget.model.time_step"
        size="small"
      />
    </a-form-model-item>

    <!-- Datetime Range to -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('to') && ![7].includes(widget.type)" label="Range to">
      <DatetimePicker
        v-model="widget.model.to"
        :format="datetimeFormats[widget.model.picker_type || 0].value"
        :secondStep="widget.model.time_step"
        size="small"
      />
    </a-form-model-item>

    <!-- Time step -->
    <a-form-model-item
      v-if="widgetModel.model.hasOwnProperty('time_step') && widget.model.picker_type !== 1"
      label="Time step"
    >
      <a-input-number v-model="widget.model.time_step" size="small"/>
    </a-form-model-item>

    <!-- Files Types and Max Files -->
    <a-row
      type="flex"
      :gutter="16"
      v-if="widgetModel.model.hasOwnProperty('file_types') || widgetModel.model.hasOwnProperty('max_files')"
    >

      <!-- Files type -->
      <a-col flex="0 1 200px">
        <a-form-model-item label="File types">
          <FileTypesSetting v-model="widget.model.file_types" size="small"/>
        </a-form-model-item>
      </a-col>

      <!-- Max Files -->
      <a-col>
        <a-form-model-item label="Max files">
          <a-input-number v-model="widget.model.max_files" :min="0" size="small"/>
        </a-form-model-item>
      </a-col>
    </a-row>

    <!-- Range -->
    <a-form-model-item
      v-if="widgetModel.model.hasOwnProperty('min_value') && widgetModel.model.hasOwnProperty('max_value')"
      label="Range"
    >
      <a-form-model-item style="display: inline-block;">
        <a-input-number
          v-model.number="widget.model.min_value"
          :min="-1"
          :formatter="value => value < 0 ? 'auto' : `${value}`"
          size="small"
        />
      </a-form-model-item>
      <span :style="{ display: 'inline-block', width: '24px', textAlign: 'center' }">-</span>
      <a-form-model-item style="display: inline-block;">
        <a-input-number
          v-model.number="widget.model.max_value"
          :min="-1"
          :formatter="value => value < 0 ? 'auto' : `${value}`"
          size="small"
        />
      </a-form-model-item>
    </a-form-model-item>

    <!--
    Styles
    -->

    <!-- Direction -->
    <a-form-model-item
      v-if="widgetModel.model.hasOwnProperty('direction') && widgetModel.type !== 16"
      label="Direction"
    >
      <a-radio-group v-model="widget.model.direction" button-style="solid" size="small">
        <a-radio-button v-for="val in flexDirections" :key="val.value" :value="val.value">
          {{ val.label }}
        </a-radio-button>
      </a-radio-group>
    </a-form-model-item>

    <!-- Alignments -->
    <a-form-model-item
      v-if="widgetModel.model.hasOwnProperty('horizontal_align') || widget.model.hasOwnProperty('vertical_align')"
      label="Alignments"
    >
      <div style="display: flex; justify-content: flex-start;align-items: center;">
        <a-select
          v-if="widget.model.hasOwnProperty('horizontal_align')"
          v-model="widget.model.horizontal_align"
          size="small"
          style="width: 50%;margin-right: 6px;"
          :style="{order: widget.model.direction}"
        >
          <a-select-option v-for="val in horizontalAlignValues" :key="val.value">
            {{ val.label }}
          </a-select-option>
        </a-select>

        <a-select
          v-if="widget.model.hasOwnProperty('vertical_align')"
          v-model="widget.model.vertical_align"
          size="small"
          style="width: 50%;margin-right: 6px;"
        >
          <a-select-option v-for="val in verticalAlignValues" :key="val.value">
            {{ val.label }}
          </a-select-option>
        </a-select>
      </div>
    </a-form-model-item>

    <!-- Grid cols -->
    <a-form-model-item v-if="widgetModel.type === 15" label="Columns">
      <a-input-number
        v-model.number="widget.model.width"
        size="small"
        :min="2"
        :max="8"
      />
    </a-form-model-item>

    <a-space
      size="middle"
      v-if="widgetModel.model.hasOwnProperty('col_spacing') || widgetModel.model.hasOwnProperty('row_spacing')"
    >
      <!-- Column spacing -->
      <a-form-model-item v-if="widgetModel.model.hasOwnProperty('col_spacing')" label="Column spacing">
        <a-input-number
          v-model.number="widget.model.col_spacing"
          size="small"
          :min="0"
        />
      </a-form-model-item>

      <!-- Rows spacing -->
      <a-form-model-item v-if="widgetModel.model.hasOwnProperty('row_spacing')" label="Rows spacing">
        <template slot="label">
          Rows spacing
        </template>
        <a-input-number
          v-model.number="widget.model.row_spacing"
          size="small"
          :min="0"
        />
      </a-form-model-item>
    </a-space>

    <!-- Sizes -->
    <a-form-model-item
      v-if="(widgetModel.model.hasOwnProperty('width') && widgetModel.type !== 15) || widgetModel.model.hasOwnProperty('height')"
      label="Sizes"
    >
      <a-col
        v-if="widgetModel.model.hasOwnProperty('width')"
        :span="12"
        style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: center;"
      >
        <a-icon type="column-width" style="width: 18px;margin-right: 4px; margin-left: 4px;"/>
        <SizeSetting v-model="widget.model.width"/>
      </a-col>

      <a-col
        v-if="widgetModel.model.hasOwnProperty('height')"
        :span="12"
        style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: center;"
      >
        <a-icon type="column-height" style="width: 18px;margin-right: 4px; margin-left: 4px;"/>
        <SizeSetting v-model="widget.model.height"/>
      </a-col>
    </a-form-model-item>

    <!-- Margins -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('margin')" label="Margins">
      <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
        <a-icon type="border-left" style="width: 18px; height: 18px; margin-right: 2px;"/>
        <a-input-number
          v-model.number="widget.model.margin[3]"
          :min="0"
          style="width: 60px;"
          size="small"
        />
      </a-col>

      <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
        <a-icon type="border-top" style="width: 18px; height: 18px;margin-right: 2px; margin-left: 4px;"/>
        <a-input-number
          v-model.number="widget.model.margin[0]"
          :min="0"
          style="width: 60px;"
          size="small"
        />
      </a-col>

      <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
        <a-icon type="border-right" style="width: 18px; height: 18px;margin-right: 2px; margin-left: 4px;"/>
        <a-input-number
          v-model.number="widget.model.margin[1]"
          :min="0"
          style="width: 60px;"
          size="small"
        />
      </a-col>

      <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
        <a-icon type="border-bottom" style="width: 18px; height: 18px;margin-right: 2px; margin-left: 4px;"/>
        <a-input-number
          v-model.number="widget.model.margin[2]"
          :min="0"
          style="width: 60px;"
          size="small"
        />
      </a-col>
    </a-form-model-item>

    <!-- Paddings -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('padding')" label="Paddings">
      <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
        <a-icon type="border-left" style="width: 18px; height: 18px; margin-right: 2px;"/>
        <a-input-number
          v-model.number="widget.model.padding[3]"
          :min="0"
          style="width: 60px;"
          size="small"
        />
      </a-col>

      <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
        <a-icon type="border-top" style="width: 18px; height: 18px; margin-right: 2px; margin-left: 4px;"/>
        <a-input-number
          v-model.number="widget.model.padding[0]"
          :min="0"
          style="width: 60px;"
          size="small"
        />
      </a-col>

      <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
        <a-icon type="border-right" style="width: 18px; height: 18px; margin-right: 2px; margin-left: 4px;"/>
        <a-input-number
          v-model.number="widget.model.padding[1]"
          :min="0"
          style="width: 60px;"
          size="small"
        />
      </a-col>

      <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
        <a-icon type="border-bottom" style="width: 18px; height: 18px; margin-right: 2px; margin-left: 4px;"/>
        <a-input-number
          v-model.number="widget.model.padding[2]"
          :min="0"
          style="width: 60px;"
          size="small"
        />
      </a-col>
    </a-form-model-item>

    <!-- Font -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('font') && widgetModel.type !== 22" label="Font">
      <div style="display: flex; justify-content: flex-start;align-items: center;">
        <a-input-number
          v-model.number="widget.model.font.size"
          :min="1"
          style="width: 60px;"
          size="small"
        />
        <a-select
          style="width: 130px; margin-right: 6px;"
          size="small"
          v-model="widget.model.font.weight"
          placeholder="Select weight"
        >
          <a-select-option
            v-for="param in fontWeights"
            :key="param.value"
            :value="param.value"
          >{{ param.label }}
          </a-select-option>
        </a-select>
        <a-switch v-model="widget.model.font.italic">
          <a-icon slot="checkedChildren" type="check"/>
          <a-icon slot="unCheckedChildren" type="close"/>
        </a-switch>
      </div>
    </a-form-model-item>

    <!-- Color -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('color')" label="Color">
      <ColorSetting v-model="widget.model.color" size="small"/>
    </a-form-model-item>

    <!-- Background -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('background')" label="Background Color">
      <ColorSetting v-model="widget.model.background.color" size="small"/>
    </a-form-model-item>

    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('background')" label="Background Image">
      <ImageSetting v-model="widget.model.background.file_id"/>
    </a-form-model-item>

    <!-- Border -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('border')" label="Border line">
      <a-space>
        <a-input-number
          v-model.number="widget.model.border.width"
          :min="0"
          :step="1"
          style="width: 60px;"
          size="small"
        />
        <ColorSetting v-model="widget.model.border.color" size="small"/>
      </a-space>
    </a-form-model-item>

    <!-- Border Radiuses -->
    <a-form-model-item v-if="widgetModel.model.hasOwnProperty('border')" label="Border radius">
      <a-row style="margin-bottom: 8px;">
        <a-col :span="12" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
          <a-icon type="radius-upleft" style="width: 18px; height: 18px;margin-right: 2px;"/>
          <a-input-number
            v-model="widget.model.border.radius[0].size"
            :min="0"
            style="width: 70px;"
            size="small"
          />
          <a-select :default-value="0" style="width: 60px" size="small" v-model="widget.model.border.radius[0].unit">
            <a-select-option
              v-for="unit in sizeUnits"
              :key="unit.value"
              :value="unit.value"
            >
              {{ unit.label }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="12" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
          <a-icon type="radius-upright" style="width: 18px; height: 18px;margin-right: 2px; margin-left: 4px;"/>
          <a-input-number
            v-model="widget.model.border.radius[1].size"
            :min="0"
            style="width: 70px;"
            size="small"
          />
          <a-select :default-value="0" style="width: 60px" size="small" v-model="widget.model.border.radius[1].unit">
            <a-select-option
              v-for="unit in sizeUnits"
              :key="unit.value"
              :value="unit.value"
            >
              {{ unit.label }}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="12" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
          <a-icon type="radius-bottomleft" style="width: 18px; height: 18px;margin-right: 2px;"/>
          <a-input-number
            v-model.number="widget.model.border.radius[3].size"
            :min="0"
            style="width: 70px;"
            size="small"
          />
          <a-select :default-value="0" style="width: 60px" size="small" v-model="widget.model.border.radius[3].unit">
            <a-select-option
              v-for="unit in sizeUnits"
              :key="unit.value"
              :value="unit.value"
            >{{ unit.label }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="12" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
          <a-icon type="radius-bottomright" style="width: 18px; height: 18px;margin-right: 2px; margin-left: 4px;"/>
          <a-input-number
            v-model.number="widget.model.border.radius[2].size"
            :min="0"
            style="width: 70px;"
            size="small"
          />
          <a-select :default-value="0" style="width: 60px" size="small" v-model="widget.model.border.radius[2].unit">
            <a-select-option
              v-for="unit in sizeUnits"
              :key="unit.value"
              :value="unit.value"
            >{{ unit.label }}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>
    </a-form-model-item>

  </a-form-model>
</template>

<script>
  import ColorSetting from "@/components/mobile-apps/mobile-designer/widget-settings/ColorSetting";
  import DatetimePicker from "@/components/mobile-apps/mobile-designer/widget-settings/DatetimePicker";
  import FileTypesSetting from "@/components/mobile-apps/mobile-designer/widget-settings/FileTypesSetting";
  import GeoPicker from "@/components/mobile-apps/mobile-designer/widget-settings/GeoPicker";
  import ImageSetting from "@/components/mobile-apps/mobile-designer/widget-settings/ImageSetting";
  import SizeSetting from "@/components/mobile-apps/mobile-designer/widget-settings/SizeSetting";
  import DatetimeFormatSelectSetting from "@/components/mobile-apps/mobile-designer/widget-settings/DatetimeFormatSelectSetting.vue";
  import {uploadFiles} from "@/requests/MobileApps";
  import {getBase64} from "@/utils/boutils";
  import isObject from "lodash-es/isObject";
  import {getMethodForEndpoint, makeUuid} from "@/utils/common";
  import {
    fontWeights,
    flexDirections,
    getElementByKey,
    horizontalAlignValues,
    mobIcons,
    sizeUnits,
    verticalAlignValues, createNewElement, widgetTypes, screenTypes, datetimeFormats
  } from "@/utils/mautils";
  import {mapGetters, mapState} from "vuex";


  export default {
    name: "WidgetSettingsForm",

    components: {
      GeoPicker,
      DatetimePicker,
      ImageSetting,
      ColorSetting,
      SizeSetting,
      FileTypesSetting,
      DatetimeFormatSelectSetting
    },

    props: {
      widget: Object
    },

    data() {
      return {
        mobIcons,
        screenTypes,
        fontWeights,
        widgetTypes,
        flexDirections,
        horizontalAlignValues,
        verticalAlignValues,
        sizeUnits,
        getMethodForEndpoint,
        getElementByKey,
        dataSource: false,
        loading: false,
        imageURI: '',
        showTextColorPicker: false,
        showBackgroundColorPicker: false,
        showBorderColorPicker: false,
        datetimeFormats
      }
    },

    computed: {
      ...mapState(['endpointsReady', 'endpoints', 'endpointGroups', 'enums']),
      ...mapState('mobileDesigner', ['app', 'screens', 'childScreen']),
      ...mapGetters('mobileDesigner', ['getSelectedScreen']),

      widgetModel() {
        return createNewElement(widgetTypes.find(w => w.enum_id === this.widget.type).type)
      },
      formFields() {
        if (this.endpoints.find(e => e.id === getElementByKey(this.widget.model.form_key).model.endpoint.id)) {
          return this.endpoints.find(e => e.id === getElementByKey(this.widget.model.form_key).model.endpoint.id).fields
        } else {
          return []
        }
      },
      enumsGroups() {
        return this.enums
      },
      enumsDataSource() {
        return Object.entries(this.widget.model.values)
      },
      availableScreens() {
        return this.screens.filter(s => screenTypes.find(x => x.enum_id === this.getSelectedScreen.model.type).wrp.includes(s.model.type) && s.model.model.key !== this.getSelectedScreen.model.model.key);
      },
      screenFields() {
        if (this.getSelectedScreen.model.model.data_field_id) {
          return this.endpoints.find(x => x.id === this.getSelectedScreen.model.model.data_endpoint_id).fields.find(z => z.id.toString() === this.getSelectedScreen.model.model.data_field_id).fields
        } else {
          if (this.getSelectedScreen.model.model.data_endpoint_id) {
            return this.endpoints.find(x => x.id === this.getSelectedScreen.model.model.data_endpoint_id).fields.filter(x => x.dir === 2)
          } else {
            return []
          }
        }
      },
      requiredDefault() {
        if (this.endpointsReady) {
          return (this.screenFields.find(f => f.id === this.widget.model.data_field_id) ? this.screenFields.find(f => f.id === this.widget.model.data_field_id).required : false)
        } else return false;
      },
      colorSchemeParams() {
        return Object.keys(this.app.colors).map(key => {
          return {
            name: key,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
            hex: this.app.colors[key]
          }
        });
      },
    },

    created() {
      const defaultsDeepWithSet = (targetObj, sourceObj) => {
        for (let prop in sourceObj) {
          if (sourceObj.hasOwnProperty(prop)) {
            if (!targetObj.hasOwnProperty(prop)) {
              let value = undefined;
              switch (typeof sourceObj[prop]) {
                /*case "number":
                  value = 0
                  break
                case "string":
                  value = ""
                  break
                case "boolean":
                  value = false
                  break*/
                case "object":
                  value = sourceObj[prop] instanceof Array ? [] : sourceObj[prop] === null ? null : {}
                  break
              }
              this.$set(targetObj, prop, value)
            }
            if (isObject(sourceObj[prop])) {
              defaultsDeepWithSet(targetObj[prop], sourceObj[prop])
            }
          }
        }
      }
      defaultsDeepWithSet(this.widget, this.widgetModel)

      this.dataSource = !!this.widget.model.data_field_id

      // if (this.widget.type === 6) {
      //   if (this.widget.model.image_url || this.widget.model.data_field_id) {
      //     this.dataSource = 0
      //   } else {
      //     this.dataSource = 1
      //   }
      // }

      /*if (this.widget.type === 23) {
        if (this.widget.model.data_field_id) {
          this.enums = this.$store.state.enums.find(e => e.id === this.formFields.find(f => f.id === this.widget.model.data_field_id).enumId).values
          this.widget.model.values = {}
          this.enums.forEach(v => this.widget.model.values[v.value] = v.label)
        } else {
          for (let prop in this.widget.model.values) {
            if (!this.widget.model.values.hasOwnProperty(prop)) {
              this.enums.push({
                "value": +prop,
                "label": this.widget.model.values[prop],
                "icon": '',
                "default_order": 5000,
              })
            }
          }
        }
      }*/

      if (this.widget.type === 11 || this.widget.type === 19) {
        if (!this.widget.model.actions.find(a => a.trigger === 11 && a.type === 1)) {
          this.widget.model.actions.push(
            {
              key: makeUuid(),
              trigger: 11,
              type: 1,
              target: "default",
              endpoint: {
                url: "",
                method: 0,
                id: null,
                params: []
              },
              screen: {
                type: 0,
                model: {
                  key: null
                },
              },
              actions: [],
              icon: null,
              label: "",
              float_left: false,
              success_actions: [],
              error_actions: [],
            });
        }

        if (!this.widget.model.actions.find(a => a.trigger === 11 && a.type === 1).screen || !this.widget.model.actions.find(a => a.trigger === 11 && a.type === 1).screen.model) {
          this.widget.model.actions.find(a => a.trigger === 11 && a.type === 1).screen = {
            type: 0,
            model: {key: null}
          };
        }
      }
    },

    methods: {

      changeDataSource() {
        if (!this.dataSource) {
          this.widget.model.data_field_id = undefined
        } else {
          if (this.widget.model.value) {
            this.widget.model.value = undefined
          }
          if (this.widget.model.from) {
            this.widget.model.from = undefined
          }
        }
      },

      /*updateEnums(value) {
        this.enums = value
        this.widget.model.values = {}
        value.forEach(v => this.widget.model.values[v.value] = v.label)
      },*/

      changeEndpoint(value) {
        this.widget.model.endpoint.id = value;
        this.widget.model.endpoint.url = this.endpoints.find(x => x.id === value).path;
        this.widget.model.endpoint.method = this.endpoints.find(x => x.id === value).method;
        this.widget.model.endpoint.params = [];
        //Calculate fields
        // this.widget.model.children = this.endpoints.find(x => x.id === value).fields.filter(x => x.dir === 1 && !x.generated && x.name !== 'id');
      },

      enumsGroupSelected(e) {
        this.widget.model.values = this.enumsGroups.find(eg => eg.id === e).values.reduce((obj, item) => {
          obj[item.value] = item.label
          return obj
        }, {})
      },

      deleteValue(key) {
        delete this.widget.model.values[key]
        this.widget.model.values = {...this.widget.model.values}
      },

      beforeUpload(file) {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
        if (!isJpgOrPng) {
          this.$message.error('You can only upload a jpg, png or gif file!');
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          this.$message.error('Image must smaller than 2MB!');
        }

        return isJpgOrPng && isLt2M;
      },

      handleUpload({file}) {
        this.loading = true;
        uploadFiles(file.name, file)
          .then(res => {
            if (res.status === "success") {
              this.widget.model.file_id = res.id
              getBase64(file, image => this.imageURI = this.widget.model.imageURI = image)
            }
            this.loading = false;
          })
          .catch(e => {
            this.loading = false;
            this.$message.error('Upload error')
          })
      },

      changeScreen(v) {
        if (v) {
          this.widget.model.actions[0].screen.type = this.screens.find(x => x.model.model.key === v).model.type;
          this.widget.model.actions[0].screen.model.key = v;
          this.widget.model.actions[0].endpoint.params = [];
        }
      },
    }
  }
</script>

<style>
  .widget-settings-form .ant-form-item {
    margin-bottom: 4px;
  }
</style>
