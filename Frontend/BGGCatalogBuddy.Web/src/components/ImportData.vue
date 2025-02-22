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
      <i style="color: #705221"
        >last import:
        <b>{{ data_lastImportDate ? data_lastImportDate : "N/A" }}</b></i
      >
    </p>
  </div>
</template>

<script>
import JSZip from "jszip";
import imageCompression from "browser-image-compression";
import { mapState, mapActions } from "pinia";
import useDataStore from "../stores/imported_data";
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
        await this.processJsonFile(file);
      } else if (fileExtension === "zip") {
        await this.processZipFile(file);
      }

      this.storeDataInPinia();
    },
    storeDataInPinia() {
      console.log("storing data in pinia");
      this.data_storeData(this.jsonData, this.imagesBase64);
    },

    //#region Process File Methods
    async processJsonFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.jsonData = JSON.parse(e.target.result);
          console.log("JSON Data:", this.jsonData);
        } catch (error) {
          console.error("Invalid JSON file", error);
        }
      };
      await reader.readAsText(file);
    },
    async processZipFile(file) {
      const zip = new JSZip();
      try {
        const zipContents = await zip.loadAsync(file);

        for (const filename in zipContents.files) {
          const ext = filename.split(".").pop().toLowerCase();

          if (ext === "json") {
            const fileData = await zipContents.files[filename].async("text");
            this.jsonData = JSON.parse(fileData);
            console.log("Extracted JSON Data:", this.jsonData);
          } else if (["jpg", "jpeg", "png"].includes(ext)) {
            const blob = await zipContents.files[filename].async("blob");
            try {
              const resizedBase64 = await this.compressAndResizeImage(
                blob,
                filename,
                150,
                150,
                0.85
              );
              this.imagesBase64.push({
                base64: resizedBase64,
                filename: filename,
              });
            } catch (error) {
              console.error(`Error processing image ${filename}:`, error);
            }
          }
        }

        console.log("Extracted Images:", this.imagesBase64);
      } catch (error) {
        console.error("Error processing ZIP file", error);
      }
    },
    async compressAndResizeImage(
      blob,
      filename,
      maxWidth,
      maxHeight,
      quality = 0.7
    ) {
      // Ensure MIME type is set
      const fileType = blob.type || "image/jpeg"; // Default to JPEG if unknown

      // Convert Blob to File
      const file = new File([blob], filename, { type: fileType });

      // Ensure it's an image before compression
      if (!file.type.startsWith("image/")) {
        throw new Error("The file given is not an image");
      }

      const options = {
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        initialQuality: quality,
        useWebWorker: true, // Faster processing
      };

      const compressedBlob = await imageCompression(file, options);
      const base64 = await this.blobToBase64(compressedBlob);
      return base64;
    },
    async blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },
    //#endregion
  },
  computed: {
    ...mapState(useDataStore, ["data_lastImportDate"]),
  },
};
</script>
