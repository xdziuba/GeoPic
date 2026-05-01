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
      selectedFile: null
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
        alert("Zaloguj się najpierw!");
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

        alert("Dodano posta 🔥");

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

      this.posts = snapshot.docs.map(doc => doc.data());

      this.$nextTick(() => {
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(el => {
          new bootstrap.Carousel(el);
        });
      });
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