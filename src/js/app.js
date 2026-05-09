import firebaseConfig from "./firebase-config.js";

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();
const { createApp } = Vue;


const app = createApp({
  data() {
    return {
      user: null,
      description: '',
      posts: [],
      selectedFile: null,
      previewUrl: null,
      toasts: [],
      toastId: 0,
      email: '',
      password: '',
      uploading: false,
      isMobile: false
    };
  },
  methods: {
    handleFile(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);

      this.selectedFile = file;
      this.previewUrl = URL.createObjectURL(file);
    },

    clearPreview() {
      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
      this.selectedFile = null;
    },

    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = timestamp.toDate();
      return date.toLocaleString("pl-PL");
    },

    showToast(type, message) {
      const id = this.toastId++;
      this.toasts.push({ id, type, message });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 3500);
    },

    buzz(pattern) {
      if (navigator.vibrate) navigator.vibrate(pattern);
    },

    closeModal(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const m = bootstrap.Modal.getInstance(el);
      if (m) m.hide();
    },

    openModal(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const m = bootstrap.Modal.getOrCreateInstance(el);
      m.show();
    },

    switchToRegister() {
      this.closeModal("loginModal");
      setTimeout(() => this.openModal("registerModal"), 300);
    },

    switchToLogin() {
      this.closeModal("registerModal");
      setTimeout(() => this.openModal("loginModal"), 300);
    },

    async addPost() {
      if (!this.user) {
        this.showToast("danger", "Zaloguj się najpierw!");
        this.buzz(200);
        return;
      }

      if (!this.selectedFile) {
        this.showToast("danger", "Wybierz zdjęcie!");
        return;
      }

      this.uploading = true;

      const file = this.selectedFile;
      const fileName = Date.now() + "_" + file.name;

      const storageRef = storage.ref("images/" + fileName);
      await storageRef.put(file);

      const imageUrl = await storageRef.getDownloadURL();

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();

        const locationName = data.display_name;

        await db.collection("posts").add({
          imageUrl: imageUrl,
          description: this.description,
          lat: lat,
          lng: lng,
          userId: this.user.uid,
          userName: this.user.displayName || this.user.email,
          userPhoto: this.user.photoURL,
          createdAt: new Date(),
          locationName: locationName
        });

        this.showToast("success", "Dodano posta 🔥");
        this.buzz([100, 50, 100]);

        this.description = "";
        this.clearPreview();
        this.uploading = false;

        this.fetchPosts();
      }, () => {
        this.uploading = false;
        this.showToast("danger", "Nie udało się pobrać lokalizacji");
      });
    },

    async fetchPosts() {
      const snapshot = await db
        .collection("posts")
        .orderBy("createdAt", "desc")
        .get();

      this.posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        likesCount: 0,
        likedByUser: false,
        comments: [],
        newComment: ""
      }));

      this.posts.forEach(post => {
        this.loadLikes(post);
        this.loadComments(post);
      });

      this.$nextTick(() => {
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(el => {
          new bootstrap.Carousel(el);
        });
      });
    },

    async loadComments(post) {
      const snapshot = await db
        .collection("posts")
        .doc(post.id)
        .collection("comments")
        .orderBy("createdAt", "desc")
        .get();

      post.comments = snapshot.docs.map(doc => doc.data());
    },

    async addComment(post) {
      if (!this.user) {
        this.showToast("danger", "Zaloguj się, aby komentować!");
        this.buzz(200);
        return;
      }

      if (!post.newComment.trim()) return;

      await db
        .collection("posts")
        .doc(post.id)
        .collection("comments")
        .add({
          text: post.newComment,
          userName: this.user.displayName || this.user.email,
          userPhoto: this.user.photoURL,
          createdAt: new Date()
        });

      post.newComment = "";

      this.loadComments(post);
    },

    async loadLikes(post) {
      const snapshot = await db
        .collection("posts")
        .doc(post.id)
        .collection("likes")
        .get();

      post.likesCount = snapshot.size;

      if (this.user) {
        post.likedByUser = snapshot.docs.some(doc => doc.id === this.user.uid);
      }
    },

    async toggleLike(post) {
      if (!this.user) {
        this.showToast("danger", "Musisz się zalogować, żeby lajkować!");
        this.buzz(200);
        return;
      }

      const likeRef = db
        .collection("posts")
        .doc(post.id)
        .collection("likes")
        .doc(this.user.uid);

      if (post.likedByUser) {
        await likeRef.delete();
        post.likesCount--;
        this.buzz(50);
      } else {
        await likeRef.set({
          userId: this.user.uid
        });
        post.likesCount++;
        this.buzz(50);
      }

      post.likedByUser = !post.likedByUser;
    },

    async login() {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        this.closeModal("loginModal");
        this.closeModal("registerModal");
        this.showToast("success", "Zalogowano przez Google!");
      } catch (e) {
        this.showToast("danger", "Logowanie anulowane");
      }
    },

    logout() {
      auth.signOut();
      this.showToast("info", "Wylogowano");
    },

    async register() {
      if (!this.email || !this.password) {
        this.showToast("danger", "Podaj email i hasło");
        return;
      }
      try {
        await auth.createUserWithEmailAndPassword(this.email, this.password);
        this.closeModal("registerModal");
        this.email = "";
        this.password = "";
        this.showToast("success", "Konto utworzone!");
      } catch (e) {
        this.showToast("danger", e.message);
        this.buzz(200);
      }
    },

    async loginEmail() {
      if (!this.email || !this.password) {
        this.showToast("danger", "Podaj email i hasło");
        return;
      }
      try {
        await auth.signInWithEmailAndPassword(this.email, this.password);
        this.closeModal("loginModal");
        this.email = "";
        this.password = "";
        this.showToast("success", "Zalogowano!");
      } catch (e) {
        this.showToast("danger", "Błąd logowania");
        this.buzz(200);
      }
    }

  },
  mounted() {
    const checkMobile = () => {
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const ua = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      return coarse || touch || ua;
    };

    this.isMobile = checkMobile();

    const mq = window.matchMedia('(pointer: coarse)');
    mq.addEventListener('change', () => {
      this.isMobile = checkMobile();
    });

    auth.onAuthStateChanged((user) => {
      this.user = user;
      this.posts.forEach(post => this.loadLikes(post));
    });

    this.fetchPosts();

    document.addEventListener('slid.bs.carousel', (e) => {
      const carousel = e.target;

      if (!carousel.id) return;

      const index = carousel.id.split('-')[1];
      const mapId = "map-" + index;

      const mapElement = document.getElementById(mapId);
      if (!mapElement) return;

      const post = this.posts[index];
      if (!post) return;

      const dots = carousel.querySelectorAll('.gp-dot');
      const activeIdx = e.to;
      dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));

      if (mapElement._leaflet_map) {
        mapElement._leaflet_map.invalidateSize();
        return;
      }

      const map = L.map(mapId).setView([post.lat, post.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      L.marker([post.lat, post.lng]).addTo(map);

      mapElement._leaflet_map = map;
    });
  }
}).mount("#app");
