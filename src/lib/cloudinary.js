const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'el5bm2tm';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Mawrid';

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export function mediaTypeFromUrl(url) {
  const clean = (url || '').split('?')[0].toLowerCase();
  if (/\.(mp4|webm|mov|m4v|ogv)$/.test(clean)) return 'video';
  if (/\.(mp3|wav|ogg|m4a|aac|flac)$/.test(clean)) return 'audio';
  return 'image';
}

export function cloudinaryThumb(url) {
  if (!url || !url.includes('/video/upload/')) return '';
  return url
    .replace('/video/upload/', '/video/upload/so_0/')
    .replace(/\.[a-z0-9]+$/i, '.jpg');
}

export function uploadToCloudinary(file, { onProgress } = {}) {
  if (!isCloudinaryConfigured) {
    return Promise.reject(new Error('CLOUDINARY_NOT_CONFIGURED'));
  }
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let payload = {};
      try { payload = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300 && payload.secure_url) {
        resolve({
          url: payload.secure_url,
          resourceType: payload.resource_type || mediaTypeFromUrl(payload.secure_url),
        });
      } else {
        reject(new Error(payload.error?.message || `Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error('NETWORK'));
    xhr.send(form);
  });
}