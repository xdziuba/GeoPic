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
      alert: null
    };
  },
  methods: {
    handleFile(e) {
      this.selectedFile = e.target.files[0];
    },

    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = timestamp.toDate();
      return date.toLocaleString("pl-PL");
    },

    async addPost() {
      if (!this.user) {
        this.alert = {
          type: "danger",
          message: "Zaloguj się najpierw!"
        };

        setTimeout(() => this.alert = null, 3000);
        return;
      }

      if (!this.selectedFile) return;

      const file = this.selectedFile;
      const fileName = Date.now() + "_" + file.name;

      const storageRef = storage.ref("images/" + fileName);
      await storageRef.put(file);

      const imageUrl = await storageRef.getDownloadURL();

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        //const location = `Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)}`;
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
          userName: this.user.displayName,
          userPhoto: this.user.photoURL,
          createdAt: new Date(),
          locationName: locationName
        });

        this.alert = {
          type: "success",
          message: "Dodano posta 🔥"
        };
        setTimeout(() => this.alert = null, 3000);

        this.description = "";
        this.selectedFile = null;

        this.fetchPosts();
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
        likedByUser: false
      }));

      this.posts.forEach(post => this.loadLikes(post));

      this.$nextTick(() => {
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(el => {
          new bootstrap.Carousel(el);
        });
      });
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
        this.alert = {
          type: "danger",
          message: "Musisz się zalogować, żeby lajkować!"
        };
        setTimeout(() => this.alert = null, 3000);
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
      } else {
        await likeRef.set({
          userId: this.user.uid
        });
        post.likesCount++;
      }

      post.likedByUser = !post.likedByUser;
    },

    login() {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    },

    logout() {
      auth.signOut();
    }

  },
  mounted() {
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