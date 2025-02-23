import JSZip from "jszip";
import imageCompression from "browser-image-compression";

export async function processJsonFile(file) {
  let jsonData = null;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      jsonData = JSON.parse(e.target.result);
      console.log("JSON Data:", jsonData);
    } catch (error) {
      console.error("Invalid JSON file", error);
    }
  };
  await reader.readAsText(file);
  return jsonData;
}
export async function processZipFile(file) {
  let jsonData = null;
  let imagesBase64 = [];
  const zip = new JSZip();
  try {
    const zipContents = await zip.loadAsync(file);

    for (const filename in zipContents.files) {
      const ext = filename.split(".").pop().toLowerCase();

      if (ext === "json") {
        const fileData = await zipContents.files[filename].async("text");
        jsonData = JSON.parse(fileData);
        console.log("Extracted JSON Data:", jsonData);
      } else if (["jpg", "jpeg", "png"].includes(ext)) {
        const blob = await zipContents.files[filename].async("blob");
        try {
          const resizedBase64 = await compressAndResizeImage(
            blob,
            filename,
            150,
            150,
            0.85
          );
          imagesBase64.push({
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

  return { jsonData, imagesBase64 };
}
async function compressAndResizeImage(
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
  const base64 = await blobToBase64(compressedBlob);
  return base64;
}
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
