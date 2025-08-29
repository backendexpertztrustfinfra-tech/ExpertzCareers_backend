const multer = require("multer");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

// Multer Upload Middleware
const upload = multer({ storage });

module.exports = upload; // ✅ Direct export as an object, no `{}` needed