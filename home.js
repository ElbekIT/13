// Firebase v9 SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import Vue from "https://cdn.jsdelivr.net/npm/vue@2" // Declare Vue variable

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

let app, database, auth
let firebaseReady = false

try {
  app = initializeApp(firebaseConfig)
  database = getDatabase(app)
  auth = getAuth(app)
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
      currentUser: null,
      requests: [],
      filteredRequests: [],
      formData: {
        fio: "",
        phone: "",
        summa: "",
        status: "active",
      },
      loading: true,
      isSubmitting: false,
      isDeleting: false,
      firebaseReady: firebaseReady,
      searchQuery: "",
      statusFilter: "",
      showAddModal: false,
      sidebarOpen: false,
      generalMessage: "",
      generalMessageType: "",
      messageTimeout: null,
      notifications: [],
    }
  },
  async mounted() {
    console.log("🚀 Home App ishga tushdi")
    await this.checkAuth()
    this.loadData()
    this.addWelcomeNotification()
  },
  methods: {
    async checkAuth() {
      const userData = localStorage.getItem("currentUser")
      if (!userData) {
        console.log("❌ Foydalanuvchi ma'lumotlari topilmadi, login sahifasiga yo'naltirilmoqda...")
        window.location.href = "index.html"
        return
      }

      this.currentUser = JSON.parse(userData)
      console.log("✅ Foydalanuvchi ma'lumotlari yuklandi:", this.currentUser.email)
    },

    addWelcomeNotification() {
      this.addNotification(
        "Xush kelibsiz!",
        `Salom ${this.getUserDisplayName()}, tizimga muvaffaqiyatli kirdingiz`,
        "info",
      )
    },

    addNotification(title, message, type = "info", edited = false, editedTime = null) {
      const notification = {
        id: Date.now() + Math.random(),
        title: title,
        message: message,
        type: type,
        time: new Date(),
        edited: edited,
        editedTime: editedTime,
      }

      this.notifications.unshift(notification)

      // Auto remove after 10 seconds
      setTimeout(() => {
        this.removeNotification(notification.id)
      }, 10000)
    },

    removeNotification(id) {
      const index = this.notifications.findIndex((n) => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },

    formatTime(date) {
      return new Date(date).toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      })
    },

    loadData() {
      if (!this.firebaseReady) return

      console.log("📊 Ma'lumotlarni Firebase'dan yuklash...")

      try {
        const requestsRef = ref(database, "requests")

        onValue(
          requestsRef,
          (snapshot) => {
            const data = snapshot.val()

            if (data && Object.keys(data).length > 0) {
              this.requests = Object.keys(data).map((key) => ({
                id: key,
                ...data[key],
              }))

              console.log("✅ Firebase'dan ma'lumotlar yuklandi:", this.requests.length, "ta")
            } else {
              this.requests = []
              console.log("📭 Firebase'da ma'lumot yo'q")
            }

            this.performSearch()
            this.loading = false
          },
          (error) => {
            console.error("❌ Firebase'dan ma'lumot olishda xatolik:", error)
            this.loading = false
            this.showGeneralMessage("Ma'lumotlarni yuklashda xatolik: " + error.message, "error")
          },
        )
      } catch (error) {
        console.error("❌ loadData funksiyasida xatolik:", error)
        this.loading = false
        this.showGeneralMessage("Ma'lumotlarni yuklashda kutilmagan xatolik: " + error.message, "error")
      }
    },

    performSearch() {
      let filtered = [...this.requests]

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter((request) => request.fio.toLowerCase().includes(query))
      }

      if (this.statusFilter) {
        filtered = filtered.filter((request) => request.status === this.statusFilter)
      }

      this.filteredRequests = filtered
    },

    clearSearch() {
      this.searchQuery = ""
      this.statusFilter = ""
      this.performSearch()
    },

    openAddModal() {
      this.showAddModal = true
      this.resetForm()
    },

    closeAddModal() {
      this.showAddModal = false
      this.resetForm()
    },

    async addData() {
      if (!this.firebaseReady || this.isSubmitting) return

      this.isSubmitting = true
      console.log("➕ Yangi ma'lumot qo'shish boshlandi...")

      try {
        const requestsRef = ref(database, "requests")
        const newRequest = {
          fio: this.formData.fio.trim(),
          phone: this.formData.phone.trim(),
          summa: Number.parseInt(this.formData.summa),
          status: this.formData.status,
          createdBy: this.getUserDisplayName(),
          createdByEmail: this.currentUser.email,
          createdByUID: this.currentUser.uid,
          createdAt: new Date().toISOString(),
        }

        await push(requestsRef, newRequest)

        console.log("✅ Yangi ma'lumot qo'shildi:", newRequest)
        this.showGeneralMessage("Ma'lumot muvaffaqiyatli saqlandi!", "success")
        this.addNotification("Ma'lumot qo'shildi", `${newRequest.fio} uchun yangi ma\'lumot saqlandi`, "info")
        this.resetForm()
        this.closeAddModal()
      } catch (error) {
        console.error("❌ Ma'lumot saqlashda xatolik:", error)
        this.showGeneralMessage("Ma'lumot saqlashda xatolik yuz berdi: " + error.message, "error")
        this.addNotification("Xatolik", "Ma'lumot saqlashda muammo yuz berdi", "alert")
      } finally {
        this.isSubmitting = false
      }
    },

    async deleteData(id) {
      if (!this.firebaseReady || this.isDeleting) return

      this.isDeleting = true

      try {
        const itemRef = ref(database, `requests/${id}`)
        await remove(itemRef)
        console.log("🗑️ Ma'lumot o'chirildi:", id)
        this.showGeneralMessage("Ma'lumot muvaffaqiyatli o'chirildi!", "success")
        this.addNotification("Ma'lumot o'chirildi", "Ma'lumot muvaffaqiyatli o'chirildi", "alert")
      } catch (error) {
        console.error("❌ Ma'lumot o'chirishda xatolik:", error)
        this.showGeneralMessage("O'chirishda xatolik yuz berdi: " + error.message, "error")
      } finally {
        this.isDeleting = false
      }
    },

    async clearAllData() {
      try {
        const requestsRef = ref(database, "requests")
        await remove(requestsRef)
        console.log("🧹 Barcha ma'lumotlar o'chirildi")
        this.showGeneralMessage("Barcha ma'lumotlar muvaffaqiyatli o'chirildi!", "success")
        this.addNotification("Barcha ma'lumotlar o'chirildi", "Database tozalandi", "alert")
      } catch (error) {
        console.error("❌ Ma'lumotlarni o'chirishda xatolik:", error)
        this.showGeneralMessage("Barcha ma'lumotlarni o'chirishda xatolik yuz berdi: " + error.message, "error")
      }
    },

    viewDetails(request) {
      // Store selected request data
      localStorage.setItem("selectedRequest", JSON.stringify(request))
      window.location.href = "details.html"
    },

    resetForm() {
      this.formData = {
        fio: "",
        phone: "",
        summa: "",
        status: "active",
      }
    },

    getUserDisplayName() {
      if (!this.currentUser) return "Foydalanuvchi"
      return this.currentUser.displayName || this.currentUser.email?.split("@")[0] || "Foydalanuvchi"
    },

    getUserInitials() {
      const name = this.getUserDisplayName()
      return name.charAt(0).toUpperCase()
    },

    getAuthProvider() {
      if (!this.currentUser) return "Noma'lum"
      const provider = this.currentUser.provider
      if (provider === "google.com") return "Google"
      if (provider === "password") return "Email/Password"
      if (provider === "special-login") return "Maxsus Login"
      return provider || "Email/Password"
    },

    getStatusClass(status) {
      const classes = {
        active: "status-badge status-active",
        yuborilmogda: "status-badge status-yuborilmogda",
        tasdiqlanmogda: "status-badge status-tasdiqlanmogda",
        qaytarildi: "status-badge status-qaytarildi",
        tugallandi: "status-badge status-tugallandi",
      }
      return classes[status] || "status-badge status-active"
    },

    getStatusText(status) {
      const texts = {
        active: "Faol",
        yuborilmogda: "Yuborilmogda",
        tasdiqlanmogda: "Tasdiqlanmogda",
        qaytarildi: "Qaytarildi",
        tugallandi: "Tugallandi",
      }
      return texts[status] || "Faol"
    },

    getStatusCount(status) {
      return this.requests.filter((request) => request.status === status).length
    },

    formatDate(dateString) {
      if (!dateString) return "Noma'lum"
      const date = new Date(dateString)
      return date.toLocaleString("uz-UZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    },

    formatNumber(number) {
      return new Intl.NumberFormat("uz-UZ").format(number)
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },

    closeSidebar() {
      this.sidebarOpen = false
    },

    showGeneralMessage(message, type = "success", duration = 3000) {
      this.generalMessage = message
      this.generalMessageType = type
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout)
      }
      this.messageTimeout = setTimeout(() => {
        this.generalMessage = ""
        this.generalMessageType = ""
      }, duration)
    },

    async logout() {
      try {
        if (this.currentUser && this.currentUser.provider === "special-login") {
          localStorage.removeItem("currentUser")
          localStorage.removeItem("selectedRequest")
          console.log("✅ Maxsus foydalanuvchi tizimdan chiqdi")
          window.location.href = "index.html"
        } else {
          await signOut(auth)
          localStorage.removeItem("currentUser")
          localStorage.removeItem("selectedRequest")
          console.log("✅ Tizimdan chiqish muvaffaqiyatli")
          window.location.href = "index.html"
        }
      } catch (error) {
        console.error("❌ Chiqishda xatolik:", error)
        this.showGeneralMessage("Chiqishda xatolik yuz berdi: " + error.message, "error")
      }
    },
  },
}).mount("#app")
