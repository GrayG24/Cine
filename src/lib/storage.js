/**
 * Safe Storage Utilities
 * Protects against QuotaExceededError and localStorage/sessionStorage failures.
 */

export const safeLocalStorageGet = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (e) {
    console.warn('safeLocalStorageGet error:', e);
    return fallback;
  }
};

export const safeLocalStorageGetJSON = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
};

export const safeLocalStorageSet = (key, value) => {
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, str);
    return true;
  } catch (e) {
    console.warn(`safeLocalStorageSet caught quota/storage error on key "${key}":`, e);
    // Attempt emergency cleanup of non-essential cache keys
    try {
      localStorage.removeItem('recent_apps_list');
      localStorage.removeItem('classroom9x_quests_v1');
      localStorage.removeItem('classroom9x_quest_date');
      const str = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, str);
      return true;
    } catch (retryErr) {
      // Gracefully ignore quota exceeded to prevent crashing
      return false;
    }
  }
};

export const safeLocalStorageRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // Ignore error
  }
};

export const safeSessionStorageGet = (key, fallback = null) => {
  try {
    const val = sessionStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (e) {
    return fallback;
  }
};

export const safeSessionStorageSet = (key, value) => {
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, str);
    return true;
  } catch (e) {
    // Gracefully ignore quota error
    return false;
  }
};

/**
 * Specifically cleanses user profile before saving into localStorage
 * Strips huge base64 customAvatars or excessively large properties to keep profile < 15KB.
 */
export const safeStoreUserProfile = (user) => {
  if (!user) return;
  try {
    const userCopy = { ...user };
    // If customAvatar is a giant data URI (> 50KB), don't store it in localStorage (it lives in Firestore/memory)
    if (userCopy.customAvatar && typeof userCopy.customAvatar === 'string' && userCopy.customAvatar.length > 50000) {
      userCopy.customAvatar = null;
    }
    safeLocalStorageSet('classroom9x_local_profile_v4', userCopy);
  } catch (e) {
    // Silently ignore to prevent QuotaExceededError
  }
};

/**
 * Compresses and resizes an uploaded image file before storing as base64.
 * Keeps image well under 40KB to avoid localStorage and Firestore document size/quota errors.
 */
export const resizeImageToBase64 = (file, maxWidth = 256, maxHeight = 256, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
