const multer = require("multer")
const path = require("path")

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, "-")
    cb(null, Date.now() + "-" + cleanName)
  },
})


const upload = multer({ storage })

module.exports = upload;
