// Firebase v9 SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getDatabase, ref, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
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
      selectedRequest: null,
      editData: {
        fio: "",
        phone: "",
        summa: "",
        status: "active",
      },
      isUpdating: false,
      isDeleting: false,
      firebaseReady: firebaseReady,
    }
  },
  async mounted() {
    console.log("🚀 Details App ishga tushdi")
    await this.checkAuth()
    this.loadSelectedRequest()
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

    loadSelectedRequest() {
      const requestData = localStorage.getItem("selectedRequest")
      if (!requestData) {
        console.log("❌ Tanlangan ma'lumot topilmadi, bosh sahifaga yo'naltirilmoqda...")
        window.location.href = "home.html"
        return
      }

      this.selectedRequest = JSON.parse(requestData)
      this.editData = {
        fio: this.selectedRequest.fio,
        phone: this.selectedRequest.phone,
        summa: this.selectedRequest.summa,
        status: this.selectedRequest.status,
      }

      console.log("✅ Tanlangan ma'lumot yuklandi:", this.selectedRequest.fio)
    },

    async updateData() {
      if (!this.firebaseReady || this.isUpdating || !this.selectedRequest) return

      this.isUpdating = true
      console.log("🔄 Ma'lumot yangilanmoqda...")

      try {
        const itemRef = ref(database, `requests/${this.selectedRequest.id}`)
        const updatedData = {
          fio: this.editData.fio.trim(),
          phone: this.editData.phone.trim(),
          summa: Number.parseInt(this.editData.summa),
          status: this.editData.status,
          updatedAt: new Date().toISOString(),
          updatedBy: this.getUserDisplayName(),
        }

        await update(itemRef, updatedData)

        console.log("✅ Ma'lumot yangilandi:", updatedData)
        alert("Ma'lumot muvaffaqiyatli yangilandi!")

        // Update local selectedRequest
        Object.assign(this.selectedRequest, updatedData)
        localStorage.setItem("selectedRequest", JSON.stringify(this.selectedRequest))
      } catch (error) {
        console.error("❌ Ma'lumot yangilashda xatolik:", error)
        alert("Ma'lumot yangilashda xatolik yuz berdi: " + error.message)
      } finally {
        this.isUpdating = false
      }
    },

    async deleteDataFromDetails(id) {
      if (!this.firebaseReady || this.isDeleting) return

      this.isDeleting = true

      try {
        const itemRef = ref(database, `requests/${id}`)
        await remove(itemRef)
        console.log("🗑️ Ma'lumot o'chirildi:", id)
        alert("Ma'lumot muvaffaqiyatli o'chirildi!")
        this.goBack()
      } catch (error) {
        console.error("❌ Ma'lumot o'chirishda xatolik:", error)
        alert("O'chirishda xatolik yuz berdi: " + error.message)
      } finally {
        this.isDeleting = false
      }
    },

    resetEditForm() {
      if (this.selectedRequest) {
        this.editData = {
          fio: this.selectedRequest.fio,
          phone: this.selectedRequest.phone,
          summa: this.selectedRequest.summa,
          status: this.selectedRequest.status,
        }
      }
    },

    goBack() {
      window.location.href = "home.html"
    },

    getUserDisplayName() {
      if (!this.currentUser) return "Foydalanuvchi"
      return this.currentUser.displayName || this.currentUser.email?.split("@")[0] || "Foydalanuvchi"
    },

    getUserInitials() {
      const name = this.getUserDisplayName()
      return name.charAt(0).toUpperCase()
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

    printDetails() {
      if (!this.selectedRequest) return

      const printContent = `
                MA'LUMOT TAFSILOTLARI
                =====================
                
                F.I.O: ${this.selectedRequest.fio}
                Telefon: ${this.selectedRequest.phone}
                Summa: ${this.formatNumber(this.selectedRequest.summa)} so'm
                Status: ${this.getStatusText(this.selectedRequest.status)}
                
                QO'SHIMCHA MA'LUMOTLAR
                ======================
                
                Qo'shgan: ${this.selectedRequest.createdBy || "Noma'lum"}
                Email: ${this.selectedRequest.createdByEmail || "Noma'lum"}
                UID: ${this.selectedRequest.createdByUID || "Noma'lum"}
                Qo'shilgan: ${this.formatDate(this.selectedRequest.createdAt)}
                ${this.selectedRequest.updatedAt ? `Oxirgi o'zgarish: ${this.formatDate(this.selectedRequest.updatedAt)}` : ""}
                
                Chop etilgan: ${this.formatDate(new Date().toISOString())}
            `

      const printWindow = window.open("", "_blank")
      printWindow.document.write(`
                <html>
                    <head>
                        <title>Ma'lumot tafsilotlari</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            pre { white-space: pre-wrap; }
                        </style>
                    </head>
                    <body>
                        <pre>${printContent}</pre>
                    </body>
                </html>
            `)
      printWindow.document.close()
      printWindow.print()
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

    formatNumber(number) {
      return new Intl.NumberFormat("uz-UZ").format(number)
    },

    toggleSidebar() {
      console.log("Sidebar toggle")
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
        alert("Chiqishda xatolik yuz berdi: " + error.message)
      }
    },
  },
}).mount("#app")
