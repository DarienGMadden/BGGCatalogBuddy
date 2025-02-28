import { setActivePinia, createPinia } from "pinia";
import useGlobalsStore from "@/stores/global";

describe("global store", () => {
  //Create an instance of pinia and set it to the active pinia
  //instace before each test.
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("set theme", async () => {
    const store = useGlobalsStore();
    const selectedTheme = "darkTheme";

    expect(store.global_selectedTheme).toBe(null);
    await store.global_selectTheme(selectedTheme);
    expect(store.global_selectedTheme).toBe(selectedTheme);
  });
});
