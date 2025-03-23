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
import { XMLParser } from "fast-xml-parser";

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

      if (fileExtension === "json") {
        this.jsonData = await processJsonFile(file);
      } else if (fileExtension === "zip") {
        const result = await processZipFile(file);
        this.jsonData = result.jsonData;
        this.imagesBase64 = result.imagesBase64;
      }

      this.importMessage = "Getting additional game data from BGG...";
      await this.getAdditionalGameDataFromBGGAPI();

      this.importMessage = "Finishing up...";
      this.storeDataInPinia();

      this.loading = false
    },
    async getAdditionalGameDataFromBGGAPI() {
      const parser = new XMLParser({
        ignoreAttributes: false, // Don't ignore attributes
        parseNodeValue: true, // Parse node values
        parseAttributeValue: true, // Parse attribute values
        trimValues: true, // Trim spaces from the values
      });

      const gameIDs = this.jsonData.games.map((x) => x.bggId);
      const splitArrays = this.splitArray(gameIDs, 20);

      // Create an array of API call promises
      const promises = splitArrays.map(async (element) => {
        const gameIDsToString = element.join(',');

        return this.$bgg.get(`thing?id=${gameIDsToString}&stats=1`).then((response) => {
          let xmlString = response.data; // Get XML string from response
          if (response.data.contents) {
            xmlString = response.data.contents
          }

          const jsonObj = parser.parse(xmlString); // Convert XML to JSON
          if (jsonObj && jsonObj.items && Array.isArray(jsonObj.items.item)) {
            jsonObj.items.item.forEach(item => {
              // Now you can access the item properties, such as:
              const gameId = item['@_id']; // Board game ID
              const categories = item.link
                .filter(link => link["@_type"] === "boardgamecategory")
                .map(link => link["@_value"]);
              const mechanics = item.link
                .filter(link => link["@_type"] === "boardgamemechanic")
                .map(link => link["@_value"]);

              const importedGameData = this.jsonData.games.find(game => game.bggId === gameId);
              if (importedGameData) {
                importedGameData.mechanics = mechanics;
                importedGameData.categories = categories;
              }
            });
          }
        })
          .catch(error => console.error("Error:", error))
      });

      // Wait for all API calls to complete
      await Promise.all(promises);
    },
    splitArray(arr, chunkSize = 20) {
      let result = [];
      for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
      }
      return result;
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
