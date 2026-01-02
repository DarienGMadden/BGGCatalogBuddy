<template>
  <div class="card">
    <input id="fileUpload" type="file" accept=".zip,.json" hidden v-on:change="fileUploaded" />
    <v-btn v-on:click.stop="uploadFile()" color="primary" size="large" append-icon="mdi-import" :loading="loading">
      Import Data
    </v-btn>
    <p v-if="loading">
      <i class="text-accent-darker">import status:
        <b>{{ importMessage }}</b></i>
    </p>
    <p>
      <i class="text-accent-darker">last import:
        <b>{{ data_lastImportDate ? data_lastImportDate : "N/A" }}</b></i>
    </p>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import useDataStore from "../stores/imported_data";
import { processJsonFile, processZipFile } from "@/utils/importUtils";

export default {
  name: "ImportData",
  data: function () {
    return {
      jsonData: null,
      imagesBase64: [],
      loading: false,
      importMessage: ''
    };
  },
  methods: {
    ...mapActions(useDataStore, ["data_storeData"]),
    async uploadFile() {
      document.getElementById("fileUpload").click();
    },

    async fileUploaded(event) {
      this.loading = true;
      this.importMessage = "Reading uploaded file...";

      const file = event.target.files[0];
      if (!file) return;

      // Reset any previous data
      this.jsonData = null;
      this.imagesBase64 = [];

      // Determine file extension
      const fileExtension = file.name.split(".").pop().toLowerCase();
      let replaceImages = false;

      if (fileExtension === "json") {
        this.jsonData = await processJsonFile(file);
      } else if (fileExtension === "zip") {
        const result = await processZipFile(file);
        this.jsonData = result.jsonData;
        this.imagesBase64 = result.imagesBase64;
        replaceImages = true;
      }

      this.importMessage = "Finishing up...";
      this.storeDataInPinia(replaceImages);

      this.loading = false
    },
    storeDataInPinia(replaceImages) {
      console.log("storing data in pinia");
      this.data_storeData(this.jsonData, this.imagesBase64, replaceImages);
    },
  },
  computed: {
    ...mapState(useDataStore, ["data_lastImportDate"]),
  },
};
</script>
