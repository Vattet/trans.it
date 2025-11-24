// lib/file-store.ts

let files: File[] = [];

// Fonction pour déposer les fichiers (depuis QuickUpload)
export const setFilesToTransfer = (newFiles: File[]) => {
  files = newFiles;
};

// Fonction pour récupérer les fichiers (depuis FileUploadForm)
export const getFilesToTransfer = () => {
  const temp = files;
  files = []; // On vide la boîte après avoir pris les fichiers
  return temp;
};
