import firebaseConfig from "./firebase-config.js";

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();
const { createApp } = Vue;

createApp({
  data() {
    return {
      description: '',
      posts: [],
      selectedFile: null
    };
  },
  methods: {
    handleFile(e) {
      this.selectedFile = e.target.files[0];
    },

    async addPost() {
      if (!this.selectedFile) return;

      const file = this.selectedFile;
      const fileName = Date.now() + "_" + file.name;

      const storageRef = storage.ref("images/" + fileName);
      await storageRef.put(file);

      const imageUrl = await storageRef.getDownloadURL();

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const location = `Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)}`;

        await db.collection("posts").add({
          imageUrl: imageUrl,
          description: this.description,
          lat: lat,
          lng: lng,
          createdAt: new Date()
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
    }
  },
  mounted() {
    this.fetchPosts();
  }
}).mount("#app");