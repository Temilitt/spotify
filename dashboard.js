// ===== FIREBASE CONFIGURATION =====
// Import and configure Firebase
// (Make sure to include Firebase SDK in your HTML file)
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
// import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyA5Xa1Ug5OYgQM_xX8065SrmtuRO_GSzVs",
  authDomain: "spotify-81475.firebaseapp.com",
  projectId: "spotify-81475",
  storageBucket: "spotify-81475.firebasestorage.app",
  messagingSenderId: "807183090685",
  appId: "1:807183090685:web:40e8fcc4fe5e9e5a6b4f94",
  measurementId: "G-ESR4TG8TQB"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.firestore();

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log(' User authenticated:', user.email);
        document.getElementById('username-display').textContent = user.email;
        
        loadPlaylists()
        loadFavorites()
        loadRecentlyPlayed()
        fetchSongs()
    } else {
        console.log('No user authenticated, redirecting...');
        window.location.href = 'index.html';
    }
});

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Logout error:', error);
        });
    }
}



const menuItems = document.querySelectorAll('.menu-item')
const contentSections = document.querySelectorAll('.content-section')

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(menu => menu.classList.remove('active'));
    
        item.classList.add('active');
        
        contentSections.forEach(section => section.classList.remove('active'));
        
        const sectionId = item.getAttribute('data-section') + '-section';
        document.getElementById(sectionId).classList.add('active');
    });
});

const audioPlayer = document.getElementById('audio-player')
const playPauseBtn = document.getElementById('play-pause-btn')
const prevBtn = document.getElementById('prev-btn')
const nextBtn = document.getElementById('next-btn')
const progressBar = document.getElementById('progress-bar')
const volumeBar = document.getElementById('volume-bar')
const currentTimeEl = document.getElementById('current-time')
const totalTimeEl = document.getElementById('total-time')
const playerTitle = document.getElementById('player-title')
const playerArtist = document.getElementById('player-artist')
const playerCover = document.getElementById('player-cover')


let currentPlaylist = []
let currentSongIndex = 0

// Play/Pause button
playPauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.textContent = '⏸'
    } else {
        audioPlayer.pause();
        playPauseBtn.textContent = '▶'
    }
})

// Previous button
prevBtn.addEventListener('click', () => {
    if (currentSongIndex > 0) {
        currentSongIndex--
        loadSong(currentPlaylist[currentSongIndex])
        audioPlayer.play()
    }
})



// Next button
nextBtn.addEventListener('click', () => {
    if (currentSongIndex < currentPlaylist.length - 1) {
        currentSongIndex++;
        loadSong(currentPlaylist[currentSongIndex]);
        audioPlayer.play();
    }
});

// Update progress bar as song plays
audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = progress || 0;
    
    // Update time display
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
});

// Seek when clicking progress bar
progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
});

// Volume control
volumeBar.addEventListener('input', () => {
    audioPlayer.volume = volumeBar.value / 100;
});

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Load a song into the player
function loadSong(song) {
    // Jamendo songs have their audio URL in song.audio or song.audiodownload
    const audioUrl = song.audio || song.audiodownload;
    
    console.log('Loading song:', song.name, 'Audio URL:', audioUrl);
    
    audioPlayer.src = audioUrl;
    playerTitle.textContent = song.name;
    playerArtist.textContent = song.artist_name;
    playerCover.src = song.image || 'https://via.placeholder.com/60';
    playPauseBtn.textContent = '⏸';

    // Save to recently played
    saveToRecentlyPlayed(song);
}
// ===== NEXT: WE'LL ADD JAMENDO API =====
console.log('Dashboard loaded! Navigation and basic player ready.');

// async function fetchSongs() {
//     const clientId = '40aa9fd3'; 
//     const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=200&include=musicinfo&audioformat=mp32`;

//     try {
//         const response = await fetch(url);
//         const data = await response.json();
        
//         // Debug: Check what we got
//         console.log('API Response:', data);
//         console.log('First song:', data.results[0]);
        
//         if (data.results && data.results.length > 0) {
//             displaySongs(data.results);
//         } else {
//             console.error('No songs found in response');
//         }
//     } catch (error) {
//         console.error('Error fetching songs:', error);
//     }
// }
// Fetch multiple genres mixed together
async function fetchSongs() {
    const clientId = '40aa9fd3'; 
    
    // 🎵 GENRES YOU WANT - Add or remove as you like
    const genres = ['hiphop', 'gospel'];  
    const songsPerGenre = 50;  // 50 songs from each genre
    
    try {
        let allSongs = [];
        
        // Fetch songs from each genre
        for (const genre of genres) {
            const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=${songsPerGenre}&tags=${genre}&include=musicinfo&audioformat=mp32`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log(`Fetched ${data.results.length} ${genre} songs`);
            allSongs = [...allSongs, ...data.results];
        }
        
        // Shuffle the songs so they're mixed
        allSongs = shuffleArray(allSongs);
        
        console.log(`Total songs loaded: ${allSongs.length}`);
        displaySongs(allSongs);
        
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

// Helper function to shuffle array (randomize order)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
 
// Display playlists (CORRECT FUNCTION)
function displayPlaylists(playlistDocs) {
    console.log('displayPlaylists called with', playlistDocs.length, 'playlists');
    
    playlistsContainer.innerHTML = '';
    
    playlistDocs.forEach(doc => {
        const playlist = doc.data();
        const playlistId = doc.id;
        
        console.log('Displaying playlist:', playlist.name, 'ID:', playlistId);
        
        const playlistCard = document.createElement('div');
        playlistCard.className = 'playlist-card';
        
        playlistCard.innerHTML = `
            <div class="playlist-cover">
                <img src="https://via.placeholder.com/150?text=${encodeURIComponent(playlist.name)}" alt="${playlist.name}">
                <button class="play-btn" onclick="playPlaylist('${playlistId}')">▶</button>
            </div>
            <div class="playlist-info">
                <h3 class="playlist-title">${playlist.name}</h3>
                <p class="playlist-count">${playlist.songs ? playlist.songs.length : 0} songs</p>
            </div>
            <div class="playlist-actions">
                <button class="action-btn" onclick="viewPlaylist('${playlistId}')">View</button>
                <button class="action-btn delete-btn" onclick="deletePlaylist('${playlistId}')">Delete</button>
            </div>
        `;
        
        playlistsContainer.appendChild(playlistCard);
    });
    
    console.log('Playlists displayed successfully');
}

// Play song from library
function playSongFromLibrary(index) {
    currentSongIndex = index;
    loadSong(currentPlaylist[currentSongIndex]);
    audioPlayer.play();
}


// Toggle like/unlike song
async function toggleLike(songId) {
    const user = auth.currentUser;
    
    if (!user) {
        alert('You must be logged in to like songs');
        return;
    }
    
    try {
        // Reference to user's favorites document
        const favoritesRef = database.collection('favorites').doc(user.uid);
        const doc = await favoritesRef.get();
        
        let favorites = [];
        if (doc.exists) {
            favorites = doc.data().songs || [];
        }
        
        // Check if song is already liked
        const songIndex = favorites.findIndex(s => s.id === songId);
        
        if (songIndex > -1) {
            // Song is liked, so unlike it
            favorites.splice(songIndex, 1);
            console.log('Song removed from favorites');
            
            // Update button to empty heart
            updateLikeButton(songId, false);
        } else {
            // Song is not liked, so like it
            const song = currentPlaylist.find(s => s.id === songId);
            
            if (song) {
                favorites.push({
                    id: song.id,
                    name: song.name,
                    artist_name: song.artist_name,
                    audio: song.audio || song.audiodownload,
                    image: song.image,
                    likedAt: new Date()
                });
                console.log('Song added to favorites');
                
                // Update button to filled heart
                updateLikeButton(songId, true);
            }
        }
        
        // Save to Firebase
        await favoritesRef.set({
            songs: favorites,
            userId: user.uid,
            updatedAt: new Date()
        });
        
        // Refresh favorites display if we're on that page
        loadFavorites();
        
    } catch (error) {
        console.error('Error toggling like:', error);
        alert('Failed to update favorites: ' + error.message);
    }
}

// Update like button appearance
function updateLikeButton(songId, isLiked) {
    const likeButtons = document.querySelectorAll(`button[onclick*="${songId}"]`);
    likeButtons.forEach(btn => {
        if (btn.classList.contains('like-btn')) {
            btn.textContent = isLiked ? '❤️' : '♡';
            btn.style.color = isLiked ? 'red' : '';
        }
    });
}

// Call fetchSongs when page loads
window.addEventListener('DOMContentLoaded', () => {
    fetchSongs();
});

// Load user's favorite songs
async function loadFavorites() {
    const user = auth.currentUser;
    
    if (!user) {
        console.log('No user logged in');
        return;
    }
    
    const favoritesContainer = document.getElementById('favorites-container');
    
    try {
        const doc = await database.collection('favorites').doc(user.uid).get();
        
        if (!doc.exists || !doc.data().songs || doc.data().songs.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="empty-state">
                    <p>No liked songs yet</p>
                    <p>Songs you like will appear here</p>
                </div>
            `;
            return;
        }
        
        const favorites = doc.data().songs;
        console.log('Loaded favorites:', favorites.length);
        
        displayFavorites(favorites);
        
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

// Display favorite songs
function displayFavorites(favorites) {
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = '';
    
    favorites.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        
        songItem.innerHTML = `
            <img src="${song.image || 'https://via.placeholder.com/50'}" alt="${song.name}">
            <div class="song-details">
                <h4>${song.name}</h4>
                <p>${song.artist_name}</p>
            </div>
            <button class="play-btn-small" onclick="playFavoriteSong(${index})">▶</button>
            <button class="like-btn liked" onclick="toggleLike('${song.id}')">❤️</button>
        `;
        
        favoritesContainer.appendChild(songItem);
    });
}

// Play song from favorites
async function playFavoriteSong(index) {
    const user = auth.currentUser;
    
    if (!user) return;
    
    try {
        const doc = await database.collection('favorites').doc(user.uid).get();
        const favorites = doc.data().songs;
        
        currentPlaylist = favorites;
        currentSongIndex = index;
        loadSong(currentPlaylist[currentSongIndex]);
        audioPlayer.play();
    } catch (error) {
        console.error('Error playing favorite:', error);
    }
}

// Search functionality
const searchInput = document.getElementById('search-input');
const searchBtn = document.querySelector('.search-btn');
const searchResults = document.getElementById('search-results');

// Search when button is clicked
searchBtn.addEventListener('click', () => {
    performSearch();
});

// Search when user presses Enter
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Optional: Search as user types (real-time search)
searchInput.addEventListener('input', () => {
    performSearch();
});

function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    // If search is empty, show message
    if (query === '') {
        searchResults.innerHTML = '<p class="empty-state">Search for songs, artists, or albums</p>';
        return;
    }
    
    // Filter songs from currentPlaylist
    const filteredSongs = currentPlaylist.filter(song => {
        const songName = song.name.toLowerCase();
        const artistName = song.artist_name.toLowerCase();
        const albumName = song.album_name ? song.album_name.toLowerCase() : '';
        
        return songName.includes(query) || 
               artistName.includes(query) || 
               albumName.includes(query);
    });
    
    // Display filtered results
    displaySearchResults(filteredSongs, query);
}

function displaySearchResults(songs, query) {
    searchResults.innerHTML = '';
    
    if (songs.length === 0) {
        searchResults.innerHTML = `<p class="empty-state">No results found for "${query}"</p>`;
        return;
    }
    
    songs.forEach((song, index) => {
        const actualIndex = currentPlaylist.indexOf(song);
        
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        
        songCard.innerHTML = `
            <div class="song-cover">
                <img src="${song.image || 'https://via.placeholder.com/150'}" alt="${song.name}">
                <button class="play-btn" onclick="playSongFromLibrary(${actualIndex})">▶</button>
            </div>
            <div class="song-info">
                <h3 class="song-title">${song.name}</h3>
                <p class="song-artist">${song.artist_name}</p>
            </div>
            <div class="song-actions">
                <button class="like-btn" onclick="toggleLike('${song.id}')">♡</button>
                <button class="add-playlist-btn" onclick='addSongToPlaylist(${JSON.stringify(song).replace(/'/g, "&#39;")})'>+ Playlist</button>
            </div>
        `;
        
        searchResults.appendChild(songCard);
    });
}


// ===== PLAYLIST FUNCTIONALITY =====

const createPlaylistBtn = document.querySelector('.create-playlist-btn');
const playlistsContainer = document.getElementById('playlists-container');

// Create new playlist
createPlaylistBtn.addEventListener('click', () => {
    const playlistName = prompt('Enter playlist name:');
    
    if (playlistName && playlistName.trim() !== '') {
        createPlaylist(playlistName.trim());
    }
});

// Create playlist in Firebase
async function createPlaylist(name) {
    const user = auth.currentUser;
    
    if (!user) {
        alert('You must be logged in to create a playlist');
        return;
    }
    
    try {
        const playlist = {
            name: name,
            userId: user.uid,
            songs: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const docRef = await database.collection('playlists').add(playlist);
        console.log('Playlist created with ID:', docRef.id);
        
        alert('Playlist created successfully! Go to "Your Playlists" to see it.');
        
        // DON'T auto-switch - let user stay where they are
        // Just reload playlists in background
        loadPlaylists();
        
    } catch (error) {
        console.error('Error creating playlist:', error);
        alert('Failed to create playlist: ' + error.message);
    }
}

// Load user's playlists from Firebase
async function loadPlaylists() {
    const user = auth.currentUser;
    
    console.log('Loading playlists for user:', user?.uid);
    
    if (!user) {
        console.log(' No user logged in');
        return;
    }
    
    try {
        // Remove .orderBy() to avoid index requirement
        const snapshot = await database.collection('playlists')
            .where('userId', '==', user.uid)
            .get();
        
        console.log(' Query complete. Found', snapshot.size, 'playlists');
        
        if (snapshot.empty) {
            console.log('No playlists found');
            playlistsContainer.innerHTML = `
                <div class="empty-state">
                    <p>You don't have any playlists yet</p>
                    <p>Create your first playlist to get started!</p>
                </div>
            `;
            return;
        }
        
        // Log each playlist found
        snapshot.docs.forEach(doc => {
            console.log('Playlist:', doc.id, doc.data());
        });
        
        displayPlaylists(snapshot.docs);
    } catch (error) {
        console.error(' Error loading playlists:', error);
        console.error('Error details:', error.code, error.message);
        alert('Error loading playlists: ' + error.message);
    }
}

// Display songs in the library (KEEP THIS ONE!)
async function displaySongs(songs) {
    const libraryContainer = document.getElementById('library-container');
    libraryContainer.innerHTML = '';
    
    currentPlaylist = songs;
    
    // Get user's favorites to check which songs are liked
    const user = auth.currentUser;
    let likedSongIds = [];
    
    if (user) {
        try {
            const favDoc = await database.collection('favorites').doc(user.uid).get();
            if (favDoc.exists && favDoc.data().songs) {
                likedSongIds = favDoc.data().songs.map(s => s.id);
            }
        } catch (error) {
            console.log('Could not load favorites');
        }
    }
    
    songs.forEach((song, index) => {
        const isLiked = likedSongIds.includes(song.id);
        
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        
        songCard.innerHTML = `
            <div class="song-cover">
                <img src="${song.image || 'https://via.placeholder.com/150'}" alt="${song.name}">
                <button class="play-btn" onclick="playSongFromLibrary(${index})">▶</button>
            </div>
            <div class="song-info">
                <h3 class="song-title">${song.name}</h3>
                <p class="song-artist">${song.artist_name}</p>
            </div>
            <div class="song-actions">
                <button class="like-btn" onclick="toggleLike('${song.id}')" style="color: ${isLiked ? 'red' : ''}">
                    ${isLiked ? '❤️' : '♡'}
                </button>
                <button class="add-playlist-btn" onclick='addSongToPlaylist(${JSON.stringify(song).replace(/'/g, "&#39;")})'>+ Playlist</button>
            </div>
        `;
        
        libraryContainer.appendChild(songCard);
    });
}
// Add song to playlist
async function addSongToPlaylist(song) {
    const user = auth.currentUser;
    
    if (!user) {
        alert('You must be logged in');
        return;
    }
    
    try {
        console.log('Adding song to playlist:', song);
        
        // Get user's playlists from Firebase
        const snapshot = await database.collection('playlists')
            .where('userId', '==', user.uid)
            .get();
        
        if (snapshot.empty) {
            alert('Create a playlist first!');
            return;
        }
        
        // Create a list of playlists for user to choose
        let playlistOptions = 'Select a playlist:\n\n';
        const playlists = [];
        
        snapshot.docs.forEach((doc, index) => {
            const playlist = doc.data();
            playlists.push({ id: doc.id, name: playlist.name });
            playlistOptions += `${index + 1}. ${playlist.name}\n`;
        });
        
        // Ask user to select a playlist
        const selection = prompt(playlistOptions + '\nEnter playlist number:');
        const playlistIndex = parseInt(selection) - 1;
        
        if (playlistIndex >= 0 && playlistIndex < playlists.length) {
            const selectedPlaylist = playlists[playlistIndex];
            
            // Check if song already exists in playlist
            const playlistDoc = await database.collection('playlists')
                .doc(selectedPlaylist.id)
                .get();
            const playlistData = playlistDoc.data();
            
            const songExists = playlistData.songs.some(s => s.id === song.id);
            
            if (songExists) {
                alert('This song is already in the playlist!');
                return;
            }
            
            // Add song to playlist
            await database.collection('playlists')
                .doc(selectedPlaylist.id)
                .update({
                    songs: firebase.firestore.FieldValue.arrayUnion({
                        id: song.id,
                        name: song.name,
                        artist_name: song.artist_name,
                        audio: song.audio || song.audiodownload,
                        image: song.image
                    }),
                    updatedAt: new Date()
                });
            
            alert(`"${song.name}" added to "${selectedPlaylist.name}"!`);
            loadPlaylists(); // Refresh playlists
        }
    } catch (error) {
        console.error('Error adding to playlist:', error);
        alert('Failed to add song to playlist: ' + error.message);
    }
}

// Delete playlist
async function deletePlaylist(playlistId) {
    if (!confirm('Are you sure you want to delete this playlist?')) {
        return;
    }
    
    try {
        await database.collection('playlists').doc(playlistId).delete();
        console.log('Playlist deleted');
        loadPlaylists(); // Refresh display
    } catch (error) {
        console.error('Error deleting playlist:', error);
        alert('Failed to delete playlist');
    }
}

// View playlist details
async function viewPlaylist(playlistId) {
    try {
        const doc = await database.collection('playlists').doc(playlistId).get();
        
        if (!doc.exists) {
            alert('Playlist not found');
            return;
        }
        
        const playlist = doc.data();
        
        // Switch to playlists section and display songs
        document.querySelector('[data-section="playlists"]').click();
        
        // Display playlist songs
        const playlistsContainer = document.getElementById('playlists-container');
        playlistsContainer.innerHTML = `
            <button class="back-btn" onclick="loadPlaylists()">← Back to Playlists</button>
            <h2>${playlist.name}</h2>
            <div class="songs-list" id="playlist-songs">
                ${playlist.songs.length === 0 ? 
                    '<p class="empty-state">No songs in this playlist yet</p>' : 
                    ''}
            </div>
        `;
        
        if (playlist.songs.length > 0) {
            const songsContainer = document.getElementById('playlist-songs');
            playlist.songs.forEach((song, index) => {
                const songItem = document.createElement('div');
                songItem.className = 'song-item';
                songItem.innerHTML = `
                    <img src="${song.image || 'https://via.placeholder.com/50'}" alt="${song.name}">
                    <div class="song-details">
                        <h4>${song.name}</h4>
                        <p>${song.artist_name}</p>
                    </div>
                    <button class="play-btn-small" onclick="playSongFromPlaylist('${playlistId}', ${index})">▶</button>
                    <button class="remove-btn" onclick="removeSongFromPlaylist('${playlistId}', '${song.id}')">✕</button>
                `;
                songsContainer.appendChild(songItem);
            });
        }
    } catch (error) {
        console.error('Error viewing playlist:', error);
    }
}

// Play song from playlist
async function playSongFromPlaylist(playlistId, songIndex) {
    try {
        const doc = await database.collection('playlists').doc(playlistId).get();
        const playlist = doc.data();
        
        currentPlaylist = playlist.songs;
        currentSongIndex = songIndex;
        loadSong(currentPlaylist[currentSongIndex]);
        audioPlayer.play();
    } catch (error) {
        console.error('Error playing song:', error);
    }
}

// Remove song from playlist
async function removeSongFromPlaylist(playlistId, songId) {
    if (!confirm('Remove this song from the playlist?')) {
        return;
    }
    
    try {
        const doc = await database.collection('playlists').doc(playlistId).get();
        const playlist = doc.data();
        
        const updatedSongs = playlist.songs.filter(song => song.id !== songId);
        
        await database.collection('playlists').doc(playlistId).update({
            songs: updatedSongs,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        viewPlaylist(playlistId); // Refresh view
    } catch (error) {
        console.error('Error removing song:', error);
    }
}

// Play entire playlist
async function playPlaylist(playlistId) {
    try {
        const doc = await database.collection('playlists').doc(playlistId).get();
        const playlist = doc.data();
        
        if (playlist.songs.length === 0) {
            alert('This playlist is empty');
            return;
        }
        
        currentPlaylist = playlist.songs;
        currentSongIndex = 0;
        loadSong(currentPlaylist[0]);
        audioPlayer.play();
    } catch (error) {
        console.error('Error playing playlist:', error);
    }
}

// Load playlists when page loads
window.addEventListener('DOMContentLoaded', () => {
    fetchSongs();
    loadPlaylists(); // Add this line
});



// Save song to recently played
async function saveToRecentlyPlayed(song) {
    const user = auth.currentUser;
    
    if (!user) return;
    
    try {
        const recentRef = database.collection('recent').doc(user.uid);
        const doc = await recentRef.get();
        
        let recentSongs = [];
        if (doc.exists) {
            recentSongs = doc.data().songs || [];
        }
        
        // Remove song if it already exists (to avoid duplicates)
        recentSongs = recentSongs.filter(s => s.id !== song.id);
        
        // Add song to the beginning of the array (most recent first)
        recentSongs.unshift({
            id: song.id,
            name: song.name,
            artist_name: song.artist_name,
            audio: song.audio || song.audiodownload,
            image: song.image,
            playedAt: new Date()
        });
        
        // Keep only the last 50 songs
        if (recentSongs.length > 50) {
            recentSongs = recentSongs.slice(0, 50);
        }
        
        // Save to Firebase
        await recentRef.set({
            songs: recentSongs,
            userId: user.uid,
            updatedAt: new Date()
        });
        
        console.log('Song saved to recently played');
        
    } catch (error) {
        console.error('Error saving to recently played:', error);
    }
}

// Load recently played songs
async function loadRecentlyPlayed() {
    const user = auth.currentUser;
    
    if (!user) {
        console.log('No user logged in');
        return;
    }
    
    const recentContainer = document.getElementById('recent-container');
    
    try {
        const doc = await database.collection('recent').doc(user.uid).get();
        
        if (!doc.exists || !doc.data().songs || doc.data().songs.length === 0) {
            recentContainer.innerHTML = `
                <div class="empty-state">
                    <p>No recent activity</p>
                    <p>Start playing music to see your history</p>
                </div>
            `;
            return;
        }
        
        const recentSongs = doc.data().songs;
        console.log('Loaded recently played:', recentSongs.length);
        
        displayRecentlyPlayed(recentSongs);
        
    } catch (error) {
        console.error('Error loading recently played:', error);
    }
}

// Display recently played songs
function displayRecentlyPlayed(recentSongs) {
    const recentContainer = document.getElementById('recent-container');
    recentContainer.innerHTML = '';
    
    recentSongs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        
        // Format the played time
        const playedAt = song.playedAt ? new Date(song.playedAt.seconds * 1000 || song.playedAt) : new Date();
        const timeAgo = getTimeAgo(playedAt);
        
        songItem.innerHTML = `
            <img src="${song.image || 'https://via.placeholder.com/50'}" alt="${song.name}">
            <div class="song-details">
                <h4>${song.name}</h4>
                <p>${song.artist_name}</p>
                <span class="time-ago">${timeAgo}</span>
            </div>
            <button class="play-btn-small" onclick="playRecentSong(${index})">▶</button>
            <button class="like-btn" onclick="toggleLike('${song.id}')">♡</button>
        `;
        
        recentContainer.appendChild(songItem);
    });
}

// Helper function to show "5 minutes ago", "2 hours ago", etc.
function getTimeAgo(date) {
    const now = new Date();
    const secondsAgo = Math.floor((now - date) / 1000);
    
    if (secondsAgo < 60) return 'Just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`;
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)} days ago`;
    return date.toLocaleDateString();
}

// Play song from recently played
async function playRecentSong(index) {
    const user = auth.currentUser;
    
    if (!user) return;
    
    try {
        const doc = await database.collection('recent').doc(user.uid).get();
        const recentSongs = doc.data().songs;
        
        currentPlaylist = recentSongs;
        currentSongIndex = index;
        loadSong(currentPlaylist[currentSongIndex]);
        audioPlayer.play();
    } catch (error) {
        console.error('Error playing recent song:', error);
    }
}







