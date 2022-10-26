const cloudinary = require("cloudinary").v2;

function getCloud() {
    const env = {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    }
    cloudinary.config(env);
    return cloudinary;
}

module.exports = getCloud;
