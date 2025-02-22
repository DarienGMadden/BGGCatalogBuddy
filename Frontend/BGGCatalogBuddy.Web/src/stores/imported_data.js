import { defineStore } from "pinia";
import moment from "moment";

export default defineStore("imported_data", {
  state: () => ({
    data_lastImportDate: null,
    data_jsonFile: null,
    data_playerImages: [],
    // data_test: "",
  }),
  persist: true,
  actions: {
    data_storeData(jsonFile, playerImages) {
      this.data_lastImportDate = moment().format("DD/MM/YYYY HH:mm");
      this.data_jsonFile = jsonFile;
      console.log(playerImages);
      this.data_playerImages = [];
      playerImages.map((x) => {
        this.data_playerImages.push(x);
      });
      console.log("Data stored");
      this.$emitter.emit("dataImported");
    },
  },
});
