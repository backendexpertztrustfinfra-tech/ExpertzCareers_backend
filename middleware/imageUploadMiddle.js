// const multer = require("multer");

// // Multer Storage Configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname); 
//   },
// });

// // Multer Upload Middleware
// const upload = multer({ storage });

// module.exports = upload; 