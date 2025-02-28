import { setActivePinia, createPinia } from "pinia";
import useFiltersStore from "@/stores/filters";
import moment from "moment";

describe("filter store", () => {
  //Create an instance of pinia and set it to the active pinia
  //instace before each test.
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("set filters", async () => {
    const store = useFiltersStore();
    const locations = [
      { id: 1, name: "Location 1" },
      { id: 2, name: "Location 2" },
    ];
    const selectedLocation = locations[1];
    const selectedDateRange = {
      start: new Date(moment().subtract(1, "y")),
      end: new Date(moment()),
    };

    expect(store.filter_locations).toBe(null);
    expect(store.filter_selectedLocation).toBe(null);
    expect(store.filter_dateRange.start).toBe(null);
    expect(store.filter_dateRange.end).toBe(null);

    await store.filter_setFilters(
      locations,
      selectedLocation,
      selectedDateRange
    );

    expect(store.filter_locations).toStrictEqual(locations);
    expect(store.filter_selectedLocation).toStrictEqual(selectedLocation);
    expect(store.filter_dateRange.start).toBe(selectedDateRange.start);
    expect(store.filter_dateRange.end).toBe(selectedDateRange.end);
  });
});
