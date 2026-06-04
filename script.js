// ข้อมูลห้องพัก (เปลี่ยนเป็น V5 เพื่อล้างความจำเดิม และเพิ่มชุดรูปภาพ Gallery)
let rooms = JSON.parse(localStorage.getItem('resortRoomsV5')) || [
    { 
        id: 101, type: 'Standard', price: 1200, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80', // รูปห้องน้ำ
            'https://images.unsplash.com/photo-1533633310920-cc9bf1e7f9b0?w=800&q=80'  // รูปวิว
        ]
    },
    { 
        id: 102, type: 'Standard', price: 1200, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80',
        gallery: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80']
    },
    { 
        id: 103, type: 'Standard', price: 1200, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://payaahotel.com/wp-content/uploads/2024/05/DELUXE-GRAND-DOUBLE-ROOM-03-768x575.jpg',
        gallery: ['https://payaahotel.com/wp-content/uploads/2024/05/DELUXE-GRAND-DOUBLE-ROOM-03-768x575.jpg']
    },
    { 
        id: 104, type: 'Standard', price: 1200, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&q=80',
        gallery: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80']
    },
    { 
        id: 105, type: 'Standard', price: 1200, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80',
        gallery: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80']
    },
    { 
        id: 201, type: 'Deluxe', price: 2500, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
        ]
    },
    { 
        id: 202, type: 'Deluxe', price: 2500, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80',
        gallery: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80']
    },
    { 
        id: 203, type: 'Deluxe', price: 2500, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80',
        gallery: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80']
    },
    { 
        id: 301, type: 'VIP Suite', price: 4500, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
            'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
            'https://images.unsplash.com/photo-1574873215043-44119461cb3b?w=800&q=80'
        ]
    },
    { 
        id: 302, type: 'VIP Suite', price: 4500, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=500&q=80',
        gallery: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80']
    },
    { 
        id: 303, type: 'VIP Suite', price: 4500, isFull: false, customer: '', phone: '', checkIn: '', checkOut: '', 
        img: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&q=80',
        gallery: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80']
    }
];

let currentBookingRoomId = null;
let currentFilter = 'All';

// ==========================================
// ส่วนของการแสดง Gallery รูปภาพเพิ่มเติม (ระบบใหม่)
// ==========================================
function openGalleryModal(id) {
    const room = rooms.find(r => r.id === id);
    document.getElementById('galleryRoomTitle').innerText = `รูปภาพห้อง ${room.id} (${room.type})`;
    
    const mainImg = document.getElementById('mainGalleryImg');
    const thumbContainer = document.getElementById('thumbnailContainer');
    
    // ตั้งรูปหลักเป็นรูปแรกเสมอ
    mainImg.src = room.gallery[0];
    thumbContainer.innerHTML = '';

    // วนลูปสร้างรูปเล็ก (Thumbnails)
    room.gallery.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'thumb-img';
        if(index === 0) img.classList.add('active'); // วงกรอบเขียวให้รูปแรก
        
        // เมื่อกดรูปเล็ก ให้เปลี่ยนรูปหลัก
        img.onclick = function() {
            mainImg.src = src;
            // ลบกรอบเขียวออกจากทุกรูป แล้วใส่ให้รูปที่ถูกกด
            document.querySelectorAll('.thumb-img').forEach(el => el.classList.remove('active'));
            img.classList.add('active');
        };
        
        thumbContainer.appendChild(img);
    });

    document.getElementById('galleryModal').style.display = 'flex';
}

function closeGalleryModal() {
    document.getElementById('galleryModal').style.display = 'none';
}


// ==========================================
// ฟังก์ชันพื้นฐานอื่นๆ
// ==========================================
function filterRooms(type, btnElement) {
    currentFilter = type;
    let buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    renderCustomerView();
}

function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkInDate').min = today;
    document.getElementById('checkOutDate').min = today;
}

function setMinCheckOut() {
    const checkInVal = document.getElementById('checkInDate').value;
    if(checkInVal) document.getElementById('checkOutDate').min = checkInVal;
}

function revealAdminLogin() { showPage('login'); }

function showPage(pageId) {
    document.getElementById('customerPage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('adminPage').classList.add('hidden');
    document.getElementById(pageId + 'Page').classList.remove('hidden');
    if(pageId === 'customer') renderCustomerView();
    if(pageId === 'admin') renderAdminView();
}

function login() {
    const pass = document.getElementById('adminPass').value;
    if(pass === '1234') {
        sessionStorage.setItem('isAdmin', 'true');
        document.getElementById('logoutBtn').classList.remove('hidden');
        showPage('admin');
        document.getElementById('adminPass').value = '';
    } else { alert('รหัสผ่านไม่ถูกต้องครับ'); }
}

function logout() {
    sessionStorage.removeItem('isAdmin');
    document.getElementById('logoutBtn').classList.add('hidden');
    showPage('customer');
}

// อัปเดต HTML ของการ์ดห้องพัก ให้มีปุ่มกดดูรูปภาพ
function renderCustomerView() {
    const container = document.getElementById('roomDisplay');
    container.innerHTML = '';

    const filteredRooms = currentFilter === 'All' ? rooms : rooms.filter(room => room.type === currentFilter);

    filteredRooms.forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';
        card.innerHTML = `
            <div class="room-img-container" onclick="openGalleryModal(${room.id})">
                <img src="${room.img}" class="room-img">
                <div class="view-more-btn"><i class="fa-solid fa-images"></i> ดูรูปทั้งหมด (${room.gallery.length})</div>
            </div>
            <div class="room-info">
                <span class="status-tag ${room.isFull ? 'status-full' : 'status-available'}">
                    ${room.isFull ? 'ห้องไม่ว่าง' : 'ห้องว่าง'}
                </span>
                <h3>ห้อง ${room.id} (${room.type})</h3>
                <p style="color:#666; margin-bottom:10px; font-size:0.9rem;">สิ่งอำนวยความสะดวกครบครัน พร้อมอาหารเช้า</p>
                <div style="font-size:1.2rem; font-weight:600; color:var(--accent); margin-bottom:15px;">
                    ฿${room.price.toLocaleString()} / คืน
                </div>
                <button class="btn-booking" ${room.isFull ? 'disabled' : ''} onclick="openBookingModal(${room.id})">
                    ${room.isFull ? 'จองเต็มแล้ว' : 'จองห้องนี้'}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function openBookingModal(id) {
    currentBookingRoomId = id;
    document.getElementById('bookingRoomName').innerText = 'จองห้องพักหมายเลข ' + id;
    setMinDates();
    document.getElementById('bookingModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('custName').value = '';
    document.getElementById('custPhone').value = '';
    document.getElementById('checkInDate').value = '';
    document.getElementById('checkOutDate').value = '';
}

function submitBooking() {
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const checkIn = document.getElementById('checkInDate').value;
    const checkOut = document.getElementById('checkOutDate').value;

    if(!name || !phone || !checkIn || !checkOut) return alert('กรุณากรอกข้อมูลและเลือกวันที่ให้ครบถ้วนครับ');
    if(new Date(checkIn) >= new Date(checkOut)) return alert('วันที่เช็คเอาท์ต้องอยู่หลังจากวันที่เช็คอินนะครับ');

    const index = rooms.findIndex(r => r.id === currentBookingRoomId);
    rooms[index].isFull = true; rooms[index].customer = name; rooms[index].phone = phone; rooms[index].checkIn = checkIn; rooms[index].checkOut = checkOut;
    saveAndRefresh(); closeModal(); alert('ระบบบันทึกการจองของคุณเรียบร้อยแล้ว ขอบคุณครับ!');
}

function renderAdminView() {
    const tableBody = document.getElementById('adminRoomList');
    tableBody.innerHTML = '';
    let availCount = 0; let bookedCount = 0;

    rooms.forEach(room => {
        if(room.isFull) bookedCount++; else availCount++;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>ห้อง ${room.id}</strong></td>
            <td>${room.type}</td>
            <td><span class="status-tag ${room.isFull ? 'status-full' : 'status-available'}">${room.isFull ? 'ไม่ว่าง' : 'ว่าง'}</span></td>
            <td>${room.isFull ? `<div>${room.customer}</div><small style="color:#666;"><i class="fa-solid fa-phone"></i> ${room.phone}</small>` : '-'}</td>
            <td>${room.isFull ? `<span style="font-size:0.9rem; color:#475569;">📅 ${formatDate(room.checkIn)} ถึง ${formatDate(room.checkOut)}</span>` : '-'}</td>
            <td>
                <button class="btn-status" style="background:#f1f5f9; color: ${room.isFull ? 'var(--danger)' : 'var(--accent)'}" onclick="toggleRoom(${room.id})">
                    ${room.isFull ? '🧹 เคลียร์ห้องว่าง' : '🔒 ทำเครื่องหมายว่าเต็ม'}
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    document.getElementById('statAvailable').innerText = availCount;
    document.getElementById('statBooked').innerText = bookedCount;
}

function formatDate(dateStr) {
    if(!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
}

function toggleRoom(id) {
    const index = rooms.findIndex(r => r.id === id);
    if(rooms[index].isFull) {
        if(confirm(`คุณต้องการยกเลิกการจองหรือเคลียร์ห้อง ${id} ใช่หรือไม่?`)) {
            rooms[index].isFull = false; rooms[index].customer = ''; rooms[index].phone = ''; rooms[index].checkIn = ''; rooms[index].checkOut = '';
        }
    } else {
        rooms[index].isFull = true; rooms[index].customer = 'แอดมิน (ปิดล็อกห้อง)'; rooms[index].phone = '-';
        rooms[index].checkIn = new Date().toISOString().split('T')[0]; rooms[index].checkOut = new Date().toISOString().split('T')[0];
    }
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('resortRoomsV5', JSON.stringify(rooms));
    renderCustomerView(); renderAdminView();
}

// โหลดหน้าแรก
renderCustomerView();