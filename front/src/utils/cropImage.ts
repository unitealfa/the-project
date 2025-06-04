// src/utils/cropImage.ts
export async function getCroppedImg(
  file: File,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Impossible de créer le contexte 2D');

  // On dessine la portion recadrée de l’image sur le canvas
  ctx.drawImage(
    imageBitmap,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    // On convertit le canvas en Blob (image/jpeg ou png selon le input)
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Erreur lors de la génération du Blob'));
      } else {
        resolve(blob);
      }
    }, file.type);
  });
}
