import { setActivePinia, createPinia, getActivePinia } from "pinia";
import useImportedDataStore from "@/stores/imported_data";
import mitt from "mitt";

vi.mock("");
describe("imported data store", () => {
  let emitter;

  //Create an instance of pinia and set it to the active pinia
  //instace before each test.
  beforeEach(() => {
    setActivePinia(createPinia());

    // Create a mock emitter
    emitter = mitt();
    emitter.emit = vi.fn(); // Spy on the emit function

    getActivePinia()._a = {
      config: {
        globalProperties: {
          $emitter: emitter,
        },
      },
    };
  });

  test("set theme", async () => {
    const store = useImportedDataStore();
    const jsonFile = { game: { id: 1, name: "7 Wonders" } };
    const playerImages = [{ base64: "", filename: "player_1.jpg" }];

    expect(store.data_lastImportDate).toBe(null);
    expect(store.data_jsonFile).toBe(null);
    expect(store.data_playerImages.length).toBe(0);

    await store.data_storeData(jsonFile, playerImages);

    expect(store.data_lastImportDate).not.toBe(null);
    expect(store.data_jsonFile).toStrictEqual(jsonFile);
    expect(store.data_playerImages).toStrictEqual(playerImages);
    expect(emitter.emit).toHaveBeenCalledWith("dataImported");
  });
});
