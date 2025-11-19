// Connect to server
const socket = io();

// DOM Elements
const sosBtn = document.getElementById('sosBtn');
const mapBtn = document.getElementById('mapBtn');
const chatBtn = document.getElementById('chatBtn');
const sosModal = document.getElementById('sosModal');
const confirmSOS = document.getElementById('confirmSOS');
const cancelSOS = document.getElementById('cancelSOS');
const userCount = document.getElementById('userCount');
const sosCount = document.getElementById('sosCount');
const sosList = document.getElementById('sosList');

let sosSignals = [];

// Event Listeners
sosBtn.addEventListener('click', () => {
    sosModal.style.display = 'block';
});

mapBtn.addEventListener('click', () => {
    window.location.href = 'map.html';
});

chatBtn.addEventListener('click', () => {
    window.location.href = 'chat.html';
});

confirmSOS.addEventListener('click', sendSOS);
cancelSOS.addEventListener('click', () => {
    sosModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === sosModal) {
        sosModal.style.display = 'none';
    }
});

// Functions
function sendSOS() {
    // Get location if available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const location = {
                coordinates: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                location: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
            };
            socket.emit('sendSOS', location);
        }, () => {
            // If location fails, send without coordinates
            socket.emit('sendSOS', { location: 'Location access denied' });
        });
    } else {
        socket.emit('sendSOS', { location: 'Location not supported' });
    }
    
    sosModal.style.display = 'none';
    
    // Show confirmation
    alert('🚨 SOS signal sent! Help is on the way.');
}

// Socket event handlers
socket.on('userCount', (count) => {
    userCount.textContent = count;
});

socket.on('sosHistory', (signals) => {
    sosSignals = signals;
    updateSOSList();
    sosCount.textContent = signals.length;
});

socket.on('newSOS', (sosData) => {
    sosSignals.push(sosData);
    updateSOSList();
    sosCount.textContent = sosSignals.length;
    
    // Show notification
    showNotification(`New SOS: ${sosData.location}`);
});

function updateSOSList() {
    if (sosSignals.length === 0) {
        sosList.innerHTML = '<div class="empty-state">No active SOS signals</div>';
        return;
    }
    
    // Show latest 3 SOS signals
    const recentSOS = sosSignals.slice(-3).reverse();
    sosList.innerHTML = recentSOS.map(sos => `
        <div class="sos-item">
            <div class="sos-location">🚨 EMERGENCY SOS</div>
            <div>${sos.location}</div>
            <div class="sos-time">${sos.timestamp}</div>
        </div>
    `).join('');
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Notify server that user joined
socket.emit('userJoin', 'Survivor');