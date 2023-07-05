const fs = require("fs");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../utils/cloudinary");

const uploadImages = asyncHandler(async (req, res) => {
  try {
    let images;
    const urls = [];
    const files = Array.isArray(req.files) ? req.files : [req.files];
    for (const file of files) {
      if (file.path) { // Check if file.path exists before destructuring
        const { path } = file;
        const result = await cloudinary.uploader.upload(path); // Upload the image to Cloudinary
        urls.push(result)
        images = urls.map((file) => {
          return { secure_url: file.secure_url, public_id: file.public_id };
        });
        // fs.unlinkSync(path);
      }
    }
    res.json(images); // Respond with the array of image URLs
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
});

const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleter = cloudinary.uploader.destroy(id, "images");

    res.json({ msd: "Deleted" });
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  uploadImages,
  deleteImages,
};
