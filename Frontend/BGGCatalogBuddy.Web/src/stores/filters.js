import { defineStore } from "pinia";

export default defineStore("filters", {
  state: () => ({
    filter_locations: null,
    filter_selectedLocation: null,
    filter_dateRange: {
      start: null,
      end: null,
    },
  }),
  persist: false,
  actions: {
    filter_setFilters(locations, selectedLocation, selectedDateRange) {
      this.filter_locations = locations;
      this.filter_selectedLocation = selectedLocation;
      this.filter_dateRange = selectedDateRange;
    },
  },
});
