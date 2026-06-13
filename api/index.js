const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const path = require("path");

dotenv.config();

// MongoDB Bağlantısı [1, 2]
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err);
  });

// Resimlerin dış dünyaya açılması (Static Files) [3]
// Bu satır sayesinde "http://localhost:8800/images/resim.png" şeklinde resimlere erişilebilir.
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Middleware (Ara Yazılımlar) [1, 3]
app.use(express.json()); // JSON gövdelerini okumak için
app.use(helmet());       // Güvenlik başlıkları için
app.use(morgan("common")); // İstek loglarını terminalde görmek için

// Multer ile Resim Yükleme Ayarları [4]
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Resimlerin kaydedileceği klasör [4]
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name); // Frontend'den gönderilen dosya ismini kullan [4]
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfully");
  } catch (error) {
    console.error(error);
  }
});

// Rotalar (Routes) [1, 3]
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

// Sunucuyu Başlat [3, 5]
app.listen(8800, () => {
  console.log("Backend server is running!");
});