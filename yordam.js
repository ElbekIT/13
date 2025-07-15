// Import Vue from Vue library
import Vue from "https://cdn.jsdelivr.net/npm/vue@2" // Declare Vue variable

// Vue App
const { createApp } = Vue

createApp({
  data() {
    return {
      currentUser: null,
      activeAccordion: null,
      notifications: [],
      helpItems: [
        {
          title: "Tizimdan qanday foydalanish kerak?",
          content: `
                        <p>Bu tizim orqali siz quyidagi ishlarni bajarishingiz mumkin:</p>
                        <ul>
                            <li>Email/Password yoki Google orqali xavfsiz kirish</li>
                            <li>Ma'lumot qo'shish va boshqarish</li>
                            <li>Qidiruv va filtrlash</li>
                            <li>Status o'zgartirish</li>
                            <li>Ma'lumotlarni ko'rish va o'chirish</li>
                        </ul>
                    `,
        },
        {
          title: "Autentifikatsiya tizimi",
          content: `
                        <h4>Tizimga kirish usullari:</h4>
                        <ul>
                            <li><strong>Email/Password:</strong> Email va parol bilan ro'yxatdan o'ting yoki kiring</li>
                            <li><strong>Google OAuth:</strong> Google hisobingiz orqali bir bosishda xavfsiz kiring</li>
                            <li>Parol kamida 6 ta belgidan iborat bo'lishi kerak</li>
                            <li>Xavfsizlik uchun kuchli parol ishlating</li>
                            <li>Sessiya avtomatik saqlanadi</li>
                        </ul>
                    `,
        },
        {
          title: "Ma'lumot qo'shish",
          content: `
                        <h4>Yangi ma'lumot qo'shish uchun:</h4>
                        <ul>
                            <li>"MA'LUMOT QO'SHISH" tugmasini bosing</li>
                            <li>FIO, telefon, summa va statusni kiriting</li>
                            <li>"Saqlash" tugmasini bosing</li>
                            <li>Ma'lumot Firebase bazasiga real-time saqlanadi</li>
                            <li>Barcha maydonlar to'ldirilishi shart</li>
                        </ul>
                    `,
        },
        {
          title: "Qidiruv va filtrlash",
          content: `
                        <h4>Qidiruv imkoniyatlari:</h4>
                        <ul>
                            <li>FIO bo'yicha real-time qidiruv</li>
                            <li>Status bo'yicha filtrlash</li>
                            <li>"TOZALASH" tugmasi barcha filtrlarni tozalaydi</li>
                            <li>Qidiruv natijalari soni ko'rsatiladi</li>
                            <li>Yozgan sayin natija yangilanadi</li>
                        </ul>
                    `,
        },
        {
          title: "Status turlari va ma'nolari",
          content: `
                        <h4>Mavjud statuslar:</h4>
                        <ul>
                            <li><strong>Faol</strong> - faol holatdagi ma'lumotlar (yashil)</li>
                            <li><strong>Yuborilmogda</strong> - yuborilayotgan ma'lumotlar (sariq)</li>
                            <li><strong>Tasdiqlanmogda</strong> - tasdiqlash kutilayotgan ma'lumotlar (ko'k)</li>
                            <li><strong>Qaytarildi</strong> - qaytarilgan ma'lumotlar (qizil)</li>
                            <li><strong>Tugallandi</strong> - tugallangan ma'lumotlar (yashil)</li>
                        </ul>
                        <p>Har bir status o'z rangiga ega va jadvalda ko'rsatiladi.</p>
                    `,
        },
        {
          title: "Bildirishnoma tizimi",
          content: `
                        <h4>Bildirishnomalar haqida:</h4>
                        <ul>
                            <li>Tizimga kirganda xush kelibsiz xabari</li>
                            <li>Ma'lumot qo'shilganda bildirishnoma</li>
                            <li>Ma'lumot o'chirilganda ogohlantirish</li>
                            <li>Xatoliklar haqida bildirishnomalar</li>
                            <li>Bildirishnomalar avtomatik yo'qoladi</li>
                            <li>Qo'lda yopish mumkin (× tugmasi)</li>
                        </ul>
                    `,
        },
      ],
    }
  },
  async mounted() {
    console.log("🚀 Yordam App ishga tushdi")
    await this.checkAuth()
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
        "Yordam sahifasi",
        "Yordam sahifasiga xush kelibsiz! Bu yerda tizim haqida barcha ma'lumotlarni topasiz",
        "info",
      )
    },

    addTestNotification() {
      const messages = [
        "Bu test bildirishnomasi",
        "Bildirishnoma tizimi ishlayapti",
        "Jsdagi alert chiqapti",
        "uni saytda chiqadigan qilish kerak",
        "notification lar yogdu",
      ]

      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      const types = ["info", "alert"]
      const randomType = types[Math.floor(Math.random() * types.length)]

      this.addNotification(
        "Test bildirishnoma",
        randomMessage,
        randomType,
        Math.random() > 0.5, // randomly set edited
        Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 60000) : null, // random edit time
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
        editedTime: editedTime || new Date(Date.now() - Math.random() * 60000),
      }

      this.notifications.unshift(notification)

      // Auto remove after 15 seconds
      setTimeout(() => {
        this.removeNotification(notification.id)
      }, 15000)
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

    getUserDisplayName() {
      if (!this.currentUser) return "Foydalanuvchi"
      return this.currentUser.displayName || this.currentUser.email?.split("@")[0] || "Foydalanuvchi"
    },

    getUserInitials() {
      const name = this.getUserDisplayName()
      return name.charAt(0).toUpperCase()
    },

    toggleAccordion(index) {
      if (this.activeAccordion === index) {
        this.activeAccordion = null
      } else {
        this.activeAccordion = index
      }
    },

    toggleSidebar() {
      // Sidebar functionality can be added here if needed
      console.log("Sidebar toggle")
    },

    async logout() {
      try {
        localStorage.removeItem("currentUser")
        localStorage.removeItem("selectedRequest")
        console.log("✅ Tizimdan chiqish muvaffaqiyatli")
        window.location.href = "index.html"
      } catch (error) {
        console.error("❌ Chiqishda xatolik:", error)
      }
    },
  },
}).mount("#app")
