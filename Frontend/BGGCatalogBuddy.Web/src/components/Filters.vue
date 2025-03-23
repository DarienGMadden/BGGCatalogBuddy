<template>
  <v-row class="mt-0">
    <v-col cols="6" class="pt-0">
      <v-select
        v-model="selectedLocation"
        :items="locations"
        item-title="name"
        item-value="id"
        label="Select a Location"
        outlined
        @update:modelValue="updateSelectedLocation"
      ></v-select
    ></v-col>
    <v-col cols="6" class="pt-0">
      <v-menu
        v-model="menu"
        transition="scale-transition"
        :close-on-content-click="false"
      >
        <template #activator="{ props }">
          <v-text-field
            v-bind="props"
            v-model="dateRangeText"
            label="Select Date Range"
            readonly
            outlined
          ></v-text-field>
        </template>
        <DatePicker
          v-model="dateRange"
          is-range
          @update:modelValue="updateDateRange"
        />
      </v-menu>
    </v-col>
  </v-row>
</template>

<script>
import { mapActions, mapState } from "pinia";
import useDataStore from "../stores/imported_data";
import useFilterStore from "../stores/filters";

import { DatePicker } from "v-calendar";
import "v-calendar/style.css";
import moment from "moment";

export default {
  name: "Filters",
  components: {
    DatePicker,
  },
  data: function () {
    return {
      locations: [],
      selectedLocation: null,
      dateRange: {
        start: null,
        end: null,
      },
      menu: false,
    };
  },
  mounted() {
    this.setFilterData();
  },
  methods: {
    ...mapActions(useFilterStore, ["filter_setFilters"]),
    setFilterData() {
      if (this.filter_locations == null) {
        this.locations = this.data_jsonFile.locations;
      } else {
        this.locations = this.filter_locations;
      }

      if (this.filter_selectedLocation == null) {
        this.selectedLocation = this.locations[0].id;
      } else {
        this.selectedLocation = this.filter_selectedLocation;
      }

      if (
        this.filter_dateRange.start == null ||
        this.filter_dateRange.end == null
      ) {
        this.dateRange.start = new Date(moment().subtract(6, "months"));
        this.dateRange.end = new Date(moment());
      } else {
        this.dateRange.start = this.filter_dateRange.start;
        this.dateRange.end = this.filter_dateRange.end;
      }

      this.filter_setFilters(
        this.locations,
        this.selectedLocation,
        this.dateRange
      );
    },
    updateSelectedLocation(value) {
      this.selectedLocation = value;
      this.filter_setFilters(
        this.locations,
        this.selectedLocation,
        this.dateRange
      );
      this.$emitter.emit("filterUpdated");
    },
    updateDateRange(value) {
      this.dateRange = value;
      if (value.start && value.end) {
        this.menu = false;

        this.filter_setFilters(
          this.locations,
          this.selectedLocation,
          this.dateRange
        );
        this.$emitter.emit("filterUpdated");
      }
    },
  },
  computed: {
    ...mapState(useDataStore, ["data_jsonFile"]),
    ...mapState(useFilterStore, [
      "filter_locations",
      "filter_selectedLocation",
      "filter_dateRange",
    ]),
    dateRangeText() {
      const { start, end } = this.dateRange;
      if (start && end) {
        return `${moment(start).format("DD/MM/YYYY")} - ${moment(end).format("DD/MM/YYYY")}`;
      }
      return "";
    },
  },
};
</script>

<style>
.v-app-bar {
  background-color: transparent !important;
  box-shadow: none;
}
</style>
