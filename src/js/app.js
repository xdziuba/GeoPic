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

        const imageUrl = URL.createObjectURL(this.selectedFile);

        navigator.geolocation.getCurrentPosition((pos) => {
            const location = `Lat: ${pos.coords.latitude.toFixed(3)}, Lng: ${pos.coords.longitude.toFixed(3)}`;

            this.posts.unshift({
            imageUrl: imageUrl,
            description: this.description,
            location: location
            });
            
            this.description = "";
            this.selectedFile = null;
        });
    }
  }
}).mount("#app");