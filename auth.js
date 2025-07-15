// Firebase v9 SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import Vue from "https://cdn.jsdelivr.net/npm/vue@2"

// Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: "AIzaSyBv_jGPJeElF-EakNV7BY5hFANKdBkdAtA",
  authDomain: "vuejsdars.firebaseapp.com",
  databaseURL: "https://vuejsdars-default-rtdb.firebaseio.com",
  projectId: "vuejsdars",
  storageBucket: "vuejsdars.firebasestorage.app",
  messagingSenderId: "85172837101",
  appId: "1:85172837101:web:70ad5fffef81b3606f8ae4",
  measurementId: "G-8F902F5W6W",
}

let app, auth, googleProvider
let firebaseReady = false

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  googleProvider.addScope("email")
  googleProvider.addScope("profile")
  firebaseReady = true
  console.log("✅ Firebase muvaffaqiyatli ulandi!")
} catch (error) {
  console.error("❌ Firebase ulanishida xatolik:", error)
  firebaseReady = false
}

// Vue App
const { createApp } = Vue

createApp({
  data() {
    return {
      isLoggedIn: false,
      isAuthenticating: false,
      authMode: "email",
      isLoginMode: true,
      authData: {
        login: "",
        password: "",
      },
      authError: "",
      authSuccess: "",
      firebaseReady: firebaseReady,
    }
  },
  async mounted() {
    console.log("🚀 Auth App ishga tushdi")
    await this.initAuth()
  },
  methods: {
    async initAuth() {
      if (!this.firebaseReady) {
        console.log("❌ Firebase tayyor emas")
        return
      }

      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("✅ Foydalanuvchi tizimga kirdi, home.html ga yo'naltirilmoqda...")
          // Store user data in localStorage
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              provider: user.providerData[0]?.providerId,
              loginTime: new Date().toISOString(),
              emailVerified: user.emailVerified,
            }),
          )
          this.isLoggedIn = true
          setTimeout(() => {
            window.location.href = "home.html"
          }, 1000)
        }
      })
    },

    setAuthMode(mode) {
      this.authMode = mode
      this.clearAuthMessages()
      console.log("🔄 Auth mode o'zgartirildi:", mode)
    },

    toggleLoginMode() {
      this.isLoginMode = !this.isLoginMode
      this.clearAuthMessages()
      console.log("🔄 Login mode:", this.isLoginMode ? "Login" : "Register")
    },

    clearAuthMessages() {
      this.authError = ""
      this.authSuccess = ""
    },

    async registerWithEmail() {
      if (this.isAuthenticating) return

      this.isAuthenticating = true
      this.clearAuthMessages()

      console.log("📝 Ro'yxatdan o'tish boshlandi:", this.authData.login)

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          `${this.authData.login}@system.local`,
          this.authData.password,
        )

        console.log("✅ Ro'yxatdan o'tish muvaffaqiyatli:", userCredential.user.email)
        this.authSuccess = "Ro'yxatdan o'tish muvaffaqiyatli! Tizimga kirilmoqda..."
        this.authData.login = ""
        this.authData.password = ""
      } catch (error) {
        console.error("❌ Ro'yxatdan o'tishda xatolik:", error)
        this.authError = this.getAuthErrorMessage(error.code)
      } finally {
        this.isAuthenticating = false
      }
    },

    async loginWithEmail() {
      if (this.isAuthenticating) return

      this.isAuthenticating = true
      this.clearAuthMessages()

      console.log("🔑 Email bilan kirish boshlandi:", this.authData.login)

      // Maxsus login tekshiruvi
      if (this.authData.login.trim() === "Elbek" && this.authData.password === "178195327") {
        console.log("✅ Maxsus login muvaffaqiyatli")

        // Store special user data
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            uid: "special-user-123",
            email: "elbek@system.local",
            displayName: "Elbek",
            photoURL: null,
            provider: "special-login",
            loginTime: new Date().toISOString(),
            emailVerified: true,
          }),
        )

        this.authSuccess = "Maxsus login bilan muvaffaqiyatli kirildi!"
        this.authData.login = ""
        this.authData.password = ""
        this.isAuthenticating = false
        this.isLoggedIn = true

        setTimeout(() => {
          window.location.href = "home.html"
        }, 1000)
        return
      }

      try {
        const emailFormat = this.authData.login.includes("@")
          ? this.authData.login
          : `${this.authData.login}@system.local`

        const userCredential = await signInWithEmailAndPassword(auth, emailFormat, this.authData.password)

        console.log("✅ Email bilan kirish muvaffaqiyatli:", userCredential.user.email)
        this.authSuccess = "Muvaffaqiyatli kirildi!"
        this.authData.login = ""
        this.authData.password = ""
      } catch (error) {
        console.error("❌ Email bilan kirishda xatolik:", error)

        if (error.code === "auth/user-not-found") {
          this.authError = "Bu login bilan hisob topilmadi. Avval ro'yxatdan o'ting yoki loginni tekshiring."
        } else {
          this.authError = this.getAuthErrorMessage(error.code)
        }
      } finally {
        this.isAuthenticating = false
      }
    },

    async loginWithGoogle() {
      if (this.isAuthenticating) return

      this.isAuthenticating = true
      this.clearAuthMessages()

      console.log("🔍 Google bilan kirish boshlandi...")

      try {
        const result = await signInWithPopup(auth, googleProvider)
        console.log("✅ Google bilan kirish muvaffaqiyatli:", result.user.email)
      } catch (error) {
        console.error("❌ Google bilan kirishda xatolik:", error)
        if (error.code !== "auth/popup-closed-by-user") {
          this.authError = this.getAuthErrorMessage(error.code)
        }
      } finally {
        this.isAuthenticating = false
      }
    },

    getAuthErrorMessage(errorCode) {
      const errorMessages = {
        "auth/user-not-found": "Bunday foydalanuvchi topilmadi. Avval ro'yxatdan o'ting",
        "auth/wrong-password": "Noto'g'ri parol kiritildi",
        "auth/email-already-in-use": (() => {
          this.isLoginMode = true
          return 'Bu login allaqachon ishlatilmoqda. Login rejimiga o\'tkazildi - endi "KIRISH" tugmasini bosing'
        })(),
        "auth/weak-password": "Parol juda zaif (kamida 6 ta belgi)",
        "auth/invalid-email": "Noto'g'ri email format",
        "auth/too-many-requests": "Juda ko'p urinish. Keyinroq qayta urinib ko'ring",
        "auth/popup-closed-by-user": "Google kirish oynasi yopildi",
        "auth/cancelled-popup-request": "Google kirish bekor qilindi",
        "auth/network-request-failed": "Internet aloqasi bilan muammo",
        "auth/invalid-credential": "Login yoki parol noto'g'ri",
        "auth/user-disabled": "Bu foydalanuvchi hisobi bloklangan",
        "auth/operation-not-allowed": "Bu operatsiya ruxsat etilmagan",
        "auth/invalid-login-credentials": "Kirish ma'lumotlari noto'g'ri. Login va parolni tekshiring",
      }
      return errorMessages[errorCode] || `Xatolik: ${errorCode}. Login va parolni tekshiring yoki ro'yxatdan o'ting`
    },
  },
}).mount("#app")
