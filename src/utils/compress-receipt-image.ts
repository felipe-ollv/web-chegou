// Keep enough resolution for package labels without uploading full camera photos.
export async function compressReceiptImage(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar a imagem.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    // JPEG has no transparency; composite transparent areas onto white.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("Falha ao comprimir imagem.")),
        "image/jpeg",
        0.9,
      );
    });
    if (blob.type !== "image/jpeg") {
      throw new Error("Não foi possível converter a imagem para JPG.");
    }
    // Keep an already smaller JPEG only when it also meets the size limit.
    const output = file.type === "image/jpeg" && scale === 1 && file.size <= blob.size
      ? file : blob;
    return new File([output], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
