// TUN DEVELOPED - Google authentication (Firebase Authentication)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Replace these values with your Firebase Web App configuration.
// Firebase web config is public by design. Never put service-account keys here.
const firebaseConfig = {
  apiKey: "AIzaSyBrJuPKFjGF817DMW8aqn4FapStzbNjd_g",
  authDomain: "tun-developed.firebaseapp.com",
  projectId: "tun-developed",
  storageBucket: "tun-developed.firebasestorage.app",
  messagingSenderId: "1086769342563",
  appId: "1:1086769342563:web:6b78e24aa7865f1a943056",
  measurementId: "G-DZT6T4RNRW"
};
const ADMIN_EMAIL = "tundeveloped@gmail.com";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const loginPanel = document.getElementById("authGate");
const loginButton = document.getElementById("googleLogin");
const message = document.getElementById("authMessage");
const adminEmail = document.getElementById("adminEmail");
const logoutButton = document.getElementById("googleLogout");

function showMessage(text, error = false) {
  message.textContent = text;
  message.classList.toggle("error", error);
}
function revealAdmin(user) {
  document.body.classList.add("admin-authorized");
  loginPanel.hidden = true;
  adminEmail.textContent = user.email || ADMIN_EMAIL;
  window.dispatchEvent(new CustomEvent("tun-admin-authorized", {
    detail: { email: user.email }
  }));
}
function lockAdmin() {
  document.body.classList.remove("admin-authorized");
  loginPanel.hidden = false;
  adminEmail.textContent = "";
}

loginButton.addEventListener("click", async () => {
  loginButton.disabled = true;
  showMessage("Đang mở cửa sổ đăng nhập Google...");
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    showMessage("Đăng nhập không thành công: " + (error.message || error.code), true);
  } finally {
    loginButton.disabled = false;
  }
});
logoutButton.addEventListener("click", async () => {
  try { await signOut(auth); showMessage("Bạn đã đăng xuất."); }
  catch (error) { showMessage("Không thể đăng xuất: " + error.message, true); }
});

onAuthStateChanged(auth, async user => {
  if (!user) {
    lockAdmin();
    return;
  }
  const email = (user.email || "").trim().toLowerCase();
  if (email !== ADMIN_EMAIL || !user.emailVerified) {
    await signOut(auth);
    lockAdmin();
    showMessage("Tài khoản này không có quyền quản trị. Chỉ " + ADMIN_EMAIL + " được phép truy cập.", true);
    return;
  }
  revealAdmin(user);
});
