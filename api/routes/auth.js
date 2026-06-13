const router = require("express").Router();
const User = require("../models/User"); // Kullanıcı şeması [3]
const bcrypt = require("bcrypt"); // Şifreleme için [4]

// KAYIT OL (REGISTER)
router.post("/register", async (req, res) => {
  try {
    // 1. Yeni şifreyi oluştur ve hashle (şifrele) [1]
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 2. Yeni kullanıcıyı oluştur
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // 3. Kullanıcıyı kaydet ve yanıt dön
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GİRİŞ YAP (LOGIN)
router.post("/login", async (req, res) => {
  try {
    // 1. Kullanıcıyı email üzerinden bul [2, 5]
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("kullanıcı bulunamadı");

    // 2. Şifreyi doğrula
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json("hatalı şifre");

    // 3. Giriş başarılıysa kullanıcı verisini gönder [5, 6]
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;