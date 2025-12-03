// Default avatar URL từ server (URL mặc định trong database)
const SERVER_DEFAULT_AVATAR_URL = "https://res.cloudinary.com/dbynglvwk/image/upload/v1650182653/NHANLAPTOP/istockphoto-666545204-612x612_yu3gcq.jpg";

// Default avatar URL local (file trong public folder)
const DEFAULT_AVATAR_URL = "/avatar.jpg";

/**
 * Kiểm tra xem avatar có phải là avatar mặc định từ server không
 * @param {Object|null|undefined} avatar - Object avatar từ API {url: string, publicId: string}
 * @returns {boolean} true nếu là avatar mặc định
 */
const isDefaultServerAvatar = (avatar) => {
  if (!avatar || !avatar.url) return true;
  // Nếu URL là default từ server, coi như là default. Không giả định "publicId" là bắt buộc
  if (avatar.url === SERVER_DEFAULT_AVATAR_URL) {
    return true;
  }
  return false;
};

/**
 * Lấy URL avatar với logic: 
 * - Nếu là avatar mặc định từ server hoặc chưa có avatar -> dùng /avatar.jpg
 * - Nếu đã cập nhật avatar (có publicId) -> dùng avatar từ server
 * @param {Object|null|undefined} avatar - Object avatar từ API {url: string, publicId: string}
 * @returns {string} URL của avatar
 */
export const getAvatarUrl = (avatar) => {
  // Nếu là avatar mặc định từ server hoặc chưa có avatar
  if (isDefaultServerAvatar(avatar)) {
    return DEFAULT_AVATAR_URL;
  }
  // Nếu đã cập nhật avatar (có publicId), dùng avatar từ server
  return avatar.url;
};

export default getAvatarUrl;

