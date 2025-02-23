<template>
  <div class="card">
    <input
      id="fileUpload"
      type="file"
      accept=".zip,.json"
      hidden
      v-on:change="fileUploaded"
    />
    <v-btn
      v-on:click.stop="uploadFile()"
      color="primary"
      size="large"
      append-icon="mdi-import"
    >
      Import Data
    </v-btn>
    <p>
      <i class="text-accent-darker"
        >last import:
        <b>{{ data_lastImportDate ? data_lastImportDate : "N/A" }}</b></i
      >
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
    };
  },
  methods: {
    ...mapActions(useDataStore, ["data_storeData"]),
    async uploadFile() {
      document.getElementById("fileUpload").click();
    },

    async fileUploaded(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Reset any previous data
      this.jsonData = null;
      this.imagesBase64 = [];

      // Determine file extension
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (fileExtension === "json") {
        this.jsonData = await processJsonFile(file);
      } else if (fileExtension === "zip") {
        const result = await processZipFile(file);
        this.jsonData = result.jsonData;
        this.imagesBase64 = result.imagesBase64;
      }

      this.storeDataInPinia();
    },
    storeDataInPinia() {
      console.log("storing data in pinia");
      this.data_storeData(this.jsonData, this.imagesBase64);
    },
  },
  computed: {
    ...mapState(useDataStore, ["data_lastImportDate"]),
  },
};
</script>
