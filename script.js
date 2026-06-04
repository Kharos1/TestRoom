const SUPABASE_URL = 'https://cstbakhzinzvkimaxzom.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdGJha2h6aW56dmtpbWF4em9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTU3NjAsImV4cCI6MjA5NjEzMTc2MH0.pMBC93JDOaoHf3RJlmmwDrcltP0kFNTxno3V2kqGSEY';
 
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
 
// ============================================================
// State
// ============================================================
let allRooms = [];
let currentFilter = 'All';
let currentBookingRoomId = null;
let pendingImages = []; // { file, previewUrl, existingUrl }
 
// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadRooms();
  setupDragDrop();
});
 
// ============================================================
// DATA — Supabase
// ============================================================
async function loadRooms() {
  showLoading(true);
  const { data: rooms, error } = await sb
    .from('rooms')
    .select(`*, room_images(*)`)
    .order('room_number');
 
  if (error) { showToast('โหลดข้อมูลไม่สำเร็จ: ' + error.message, 'error'); showLoading(false); return; }
  allRooms = rooms || [];
  renderCustomerView();
  if (sessionStorage.getItem('isAdmin') === 'true') renderAdminView();
  showLoading(false);
}
 
function showLoading(on) {
  const el = document.getElementById('roomDisplay');
  if (on) el.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...</div>';
}
 
// ============================================================
// CUSTOMER VIEW
// ============================================================
function filterRooms(type, btn) {
  currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCustomerView();
}
 
function renderCustomerView() {
  const container = document.getElementById('roomDisplay');
  const list = currentFilter === 'All' ? allRooms : allRooms.filter(r => r.type === currentFilter);
 
  if (!list.length) {
    container.innerHTML = '<div class="loading-state">ไม่พบห้องพักที่ค้นหา</div>';
    return;
  }
 
  container.innerHTML = list.map(room => {
    const imgs = room.room_images || [];
    const primary = imgs.find(i => i.is_primary) || imgs[0];
    const thumb = primary ? primary.url : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80';
    return `
      <div class="room-card">
        <div class="room-img-container" onclick="openGalleryModal(${room.id})">
          <img src="${thumb}" class="room-img" alt="ห้อง ${room.room_number}" onerror="this.src='https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80'">
          <div class="view-more-btn"><i class="fa-solid fa-images"></i> ดูรูปทั้งหมด (${imgs.length})</div>
        </div>
        <div class="room-info">
          <span class="status-tag ${room.is_full ? 'status-full' : 'status-available'}">
            ${room.is_full ? 'ห้องไม่ว่าง' : 'ห้องว่าง'}
          </span>
          <h3>ห้อง ${room.room_number} <span class="type-badge">${room.type}</span></h3>
          <p style="color:#666;margin-bottom:10px;font-size:.9rem;">${room.description || 'สิ่งอำนวยความสะดวกครบครัน'}</p>
          <div style="font-size:1.2rem;font-weight:600;color:var(--accent);margin-bottom:15px;">
            ฿${room.price.toLocaleString()} / คืน
          </div>
          <button class="btn-booking" ${room.is_full ? 'disabled' : ''} onclick="openBookingModal(${room.id})">
            ${room.is_full ? 'จองเต็มแล้ว' : 'จองห้องนี้'}
          </button>
        </div>
      </div>`;
  }).join('');
}
 
// ============================================================
// GALLERY
// ============================================================
function openGalleryModal(roomId) {
  const room = allRooms.find(r => r.id === roomId);
  const imgs = (room.room_images || []);
  document.getElementById('galleryRoomTitle').innerText = `ห้อง ${room.room_number} (${room.type})`;
  const mainImg = document.getElementById('mainGalleryImg');
  const thumbs = document.getElementById('thumbnailContainer');
 
  const fallback = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80';
  const primary = imgs.find(i => i.is_primary) || imgs[0];
  mainImg.src = primary ? primary.url : fallback;
  thumbs.innerHTML = '';
 
  if (!imgs.length) {
    mainImg.src = fallback;
  } else {
    imgs.forEach((img, i) => {
      const el = document.createElement('img');
      el.src = img.url;
      el.className = 'thumb-img' + (i === 0 ? ' active' : '');
      el.onclick = () => {
        mainImg.src = img.url;
        document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
      };
      thumbs.appendChild(el);
    });
  }
  document.getElementById('galleryModal').style.display = 'flex';
}
 
// ============================================================
// BOOKING
// ============================================================
function openBookingModal(roomId) {
  currentBookingRoomId = roomId;
  const room = allRooms.find(r => r.id === roomId);
  document.getElementById('bookingRoomName').innerText = `จองห้อง ${room.room_number} (${room.type})`;
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('checkInDate').min = today;
  document.getElementById('checkOutDate').min = today;
  document.getElementById('bookingModal').style.display = 'flex';
}
 
function setMinCheckOut() {
  const val = document.getElementById('checkInDate').value;
  if (val) document.getElementById('checkOutDate').min = val;
}
 
async function submitBooking() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const checkIn = document.getElementById('checkInDate').value;
  const checkOut = document.getElementById('checkOutDate').value;
 
  if (!name || !phone || !checkIn || !checkOut) return showToast('กรุณากรอกข้อมูลให้ครบ', 'error');
  if (new Date(checkIn) >= new Date(checkOut)) return showToast('วันเช็คเอาท์ต้องหลังจากวันเช็คอิน', 'error');
 
  const btn = document.querySelector('#bookingModal .btn-booking');
  btn.disabled = true; btn.textContent = 'กำลังบันทึก...';
 
  const { error: bookErr } = await sb.from('bookings').insert({
    room_id: currentBookingRoomId, customer: name, phone, check_in: checkIn, check_out: checkOut
  });
  if (bookErr) { showToast('เกิดข้อผิดพลาด: ' + bookErr.message, 'error'); btn.disabled = false; btn.textContent = 'ยืนยันการจอง'; return; }
 
  const { error: roomErr } = await sb.from('rooms').update({ is_full: true }).eq('id', currentBookingRoomId);
  if (roomErr) { showToast('อัปเดตสถานะไม่สำเร็จ', 'error'); btn.disabled = false; btn.textContent = 'ยืนยันการจอง'; return; }
 
  showToast('จองห้องสำเร็จ! ขอบคุณครับ 🎉', 'success');
  closeModal('bookingModal');
  ['custName','custPhone','checkInDate','checkOutDate'].forEach(id => document.getElementById(id).value = '');
  btn.disabled = false; btn.textContent = 'ยืนยันการจอง';
  await loadRooms();
}
 
// ============================================================
// ADMIN VIEW
// ============================================================
async function renderAdminView() {
  const tbody = document.getElementById('adminRoomList');
  tbody.innerHTML = '';
  let avail = 0, booked = 0;
 
  for (const room of allRooms) {
    room.is_full ? booked++ : avail++;
    let bookingInfo = '-', dateInfo = '-';
 
    if (room.is_full) {
      const { data: bk } = await sb.from('bookings').select('*').eq('room_id', room.id).order('created_at', { ascending: false }).limit(1);
      if (bk && bk[0]) {
        bookingInfo = `<div>${bk[0].customer}</div><small style="color:#666;"><i class="fa-solid fa-phone"></i> ${bk[0].phone}</small>`;
        dateInfo = `<span style="font-size:.9rem;color:#475569;">📅 ${formatDate(bk[0].check_in)} ถึง ${formatDate(bk[0].check_out)}</span>`;
      }
    }
 
    const imgs = room.room_images || [];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>ห้อง ${room.room_number}</strong></td>
      <td>${room.type}</td>
      <td>฿${room.price.toLocaleString()}</td>
      <td><span class="status-tag ${room.is_full ? 'status-full' : 'status-available'}">${room.is_full ? 'ไม่ว่าง' : 'ว่าง'}</span></td>
      <td>${bookingInfo}</td>
      <td>${dateInfo}</td>
      <td class="action-cell">
        <button class="btn-action btn-edit" onclick="openEditRoomModal(${room.id})" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-action btn-img" onclick="openGalleryModal(${room.id})" title="รูปภาพ (${imgs.length})"><i class="fa-solid fa-images"></i> ${imgs.length}</button>
        <button class="btn-action ${room.is_full ? 'btn-clear' : 'btn-lock'}" onclick="toggleRoom(${room.id})" title="${room.is_full ? 'เคลียร์ห้อง' : 'ล็อคห้อง'}">
          ${room.is_full ? '<i class="fa-solid fa-broom"></i>' : '<i class="fa-solid fa-lock"></i>'}
        </button>
        <button class="btn-action btn-delete" onclick="deleteRoom(${room.id})" title="ลบห้อง"><i class="fa-solid fa-trash"></i></button>
      </td>`;
    tbody.appendChild(tr);
  }
 
  document.getElementById('statAvailable').textContent = avail;
  document.getElementById('statBooked').textContent = booked;
  document.getElementById('statTotal').textContent = allRooms.length;
}
 
// ============================================================
// TOGGLE ROOM STATUS
// ============================================================
async function toggleRoom(roomId) {
  const room = allRooms.find(r => r.id === roomId);
  if (room.is_full) {
    if (!confirm(`เคลียร์ห้อง ${room.room_number} ใช่หรือไม่?`)) return;
    await sb.from('rooms').update({ is_full: false }).eq('id', roomId);
    showToast('เคลียร์ห้องเรียบร้อยแล้ว', 'success');
  } else {
    if (!confirm(`ล็อคห้อง ${room.room_number} (ทำเครื่องหมายไม่ว่าง) ใช่หรือไม่?`)) return;
    await sb.from('rooms').update({ is_full: true }).eq('id', roomId);
    await sb.from('bookings').insert({
      room_id: roomId, customer: 'แอดมิน (ปิดล็อค)', phone: '-',
      check_in: new Date().toISOString().split('T')[0],
      check_out: new Date().toISOString().split('T')[0]
    });
    showToast('ล็อคห้องเรียบร้อยแล้ว', 'success');
  }
  await loadRooms();
}
 
// ============================================================
// DELETE ROOM
// ============================================================
async function deleteRoom(roomId) {
  const room = allRooms.find(r => r.id === roomId);
  if (!confirm(`ลบห้อง ${room.room_number} และข้อมูลทั้งหมดออกจากระบบ?\n(ไม่สามารถกู้คืนได้)`)) return;
 
  // ลบรูปจาก storage ก่อน
  const imgs = room.room_images || [];
  for (const img of imgs) {
    const path = img.url.split('/room-images/')[1];
    if (path) await sb.storage.from('room-images').remove([decodeURIComponent(path)]);
  }
 
  const { error } = await sb.from('rooms').delete().eq('id', roomId);
  if (error) { showToast('ลบห้องไม่สำเร็จ: ' + error.message, 'error'); return; }
  showToast(`ลบห้อง ${room.room_number} เรียบร้อยแล้ว`, 'success');
  await loadRooms();
}
 
// ============================================================
// ADD / EDIT ROOM MODAL
// ============================================================
function openAddRoomModal() {
  document.getElementById('roomModalTitle').textContent = 'เพิ่มห้องใหม่';
  document.getElementById('saveRoomBtnText').textContent = 'บันทึกห้อง';
  document.getElementById('editRoomId').value = '';
  document.getElementById('roomNumber').value = '';
  document.getElementById('roomType').value = 'Standard';
  document.getElementById('roomPrice').value = '';
  document.getElementById('roomDesc').value = '';
  pendingImages = [];
  renderImagePreviews();
  document.getElementById('roomModal').style.display = 'flex';
}
 
async function openEditRoomModal(roomId) {
  const room = allRooms.find(r => r.id === roomId);
  document.getElementById('roomModalTitle').textContent = `แก้ไขห้อง ${room.room_number}`;
  document.getElementById('saveRoomBtnText').textContent = 'บันทึกการแก้ไข';
  document.getElementById('editRoomId').value = roomId;
  document.getElementById('roomNumber').value = room.room_number;
  document.getElementById('roomType').value = room.type;
  document.getElementById('roomPrice').value = room.price;
  document.getElementById('roomDesc').value = room.description || '';
 
  // โหลดรูปเดิมเข้า pendingImages
  pendingImages = (room.room_images || []).map(img => ({
    file: null,
    previewUrl: img.url,
    existingUrl: img.url,
    existingId: img.id,
    isPrimary: img.is_primary
  }));
  renderImagePreviews();
  document.getElementById('roomModal').style.display = 'flex';
}
 
// ============================================================
// IMAGE HANDLING
// ============================================================
function handleImageSelect(e) {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} ใหญ่เกิน 5MB`, 'error'); return; }
    const previewUrl = URL.createObjectURL(file);
    pendingImages.push({ file, previewUrl, existingUrl: null, isPrimary: pendingImages.length === 0 });
  });
  renderImagePreviews();
  e.target.value = '';
}
 
function renderImagePreviews() {
  const grid = document.getElementById('imagePreviewGrid');
  if (!pendingImages.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = pendingImages.map((img, i) => `
    <div class="preview-item ${img.isPrimary ? 'is-primary' : ''}">
      <img src="${img.previewUrl}" alt="preview">
      <div class="preview-overlay">
        <button type="button" onclick="setPrimaryImage(${i})" title="ตั้งเป็นรูปหลัก">
          <i class="fa-solid fa-star"></i>
        </button>
        <button type="button" onclick="removeImage(${i})" title="ลบรูปนี้">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
      ${img.isPrimary ? '<div class="primary-badge">รูปหลัก</div>' : ''}
    </div>`).join('');
}
 
function setPrimaryImage(index) {
  pendingImages.forEach((img, i) => img.isPrimary = i === index);
  renderImagePreviews();
}
 
async function removeImage(index) {
  const img = pendingImages[index];
  // ถ้าเป็นรูปที่มีอยู่แล้วใน db ให้ลบออก
  if (img.existingId) {
    const path = img.existingUrl.split('/room-images/')[1];
    if (path) await sb.storage.from('room-images').remove([decodeURIComponent(path)]);
    await sb.from('room_images').delete().eq('id', img.existingId);
  }
  pendingImages.splice(index, 1);
  if (pendingImages.length && !pendingImages.some(i => i.isPrimary)) pendingImages[0].isPrimary = true;
  renderImagePreviews();
}
 
function setupDragDrop() {
  const area = document.getElementById('uploadArea');
  if (!area) return;
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault(); area.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} ใหญ่เกิน 5MB`, 'error'); return; }
      pendingImages.push({ file, previewUrl: URL.createObjectURL(file), existingUrl: null, isPrimary: pendingImages.length === 0 });
    });
    renderImagePreviews();
  });
}
 
// ============================================================
// SAVE ROOM (Add/Edit)
// ============================================================
async function saveRoom() {
  const editId = document.getElementById('editRoomId').value;
  const number = document.getElementById('roomNumber').value.trim();
  const type = document.getElementById('roomType').value;
  const price = parseInt(document.getElementById('roomPrice').value);
  const desc = document.getElementById('roomDesc').value.trim();
 
  if (!number || !price) return showToast('กรุณากรอกหมายเลขห้องและราคา', 'error');
 
  const btn = document.querySelector('#roomModal .btn-booking');
  btn.disabled = true;
  document.getElementById('saveRoomBtnText').textContent = 'กำลังบันทึก...';
 
  let roomId = editId ? parseInt(editId) : null;
 
  // Insert หรือ Update ข้อมูลห้อง
  if (editId) {
    const { error } = await sb.from('rooms').update({ room_number: number, type, price, description: desc }).eq('id', editId);
    if (error) { showToast('บันทึกไม่สำเร็จ: ' + error.message, 'error'); btn.disabled = false; document.getElementById('saveRoomBtnText').textContent = 'บันทึกการแก้ไข'; return; }
  } else {
    const { data, error } = await sb.from('rooms').insert({ room_number: number, type, price, description: desc }).select().single();
    if (error) { showToast('เพิ่มห้องไม่สำเร็จ: ' + error.message, 'error'); btn.disabled = false; document.getElementById('saveRoomBtnText').textContent = 'บันทึกห้อง'; return; }
    roomId = data.id;
  }
 
  // อัปโหลดรูปภาพใหม่
  for (const img of pendingImages) {
    if (!img.file) continue; // รูปเดิม ข้ามได้
    const ext = img.file.name.split('.').pop();
    const path = `room-${roomId}/${Date.now()}-${Math.random().toString(36).substr(2,6)}.${ext}`;
    const { error: upErr } = await sb.storage.from('room-images').upload(path, img.file, { upsert: false });
    if (upErr) { showToast('อัปโหลดรูปไม่สำเร็จ: ' + upErr.message, 'error'); continue; }
    const { data: urlData } = sb.storage.from('room-images').getPublicUrl(path);
    await sb.from('room_images').insert({ room_id: roomId, url: urlData.publicUrl, is_primary: img.isPrimary });
  }
 
  // อัปเดต is_primary ของรูปเดิม
  for (const img of pendingImages) {
    if (!img.existingId) continue;
    await sb.from('room_images').update({ is_primary: img.isPrimary }).eq('id', img.existingId);
  }
 
  showToast(editId ? 'แก้ไขห้องเรียบร้อยแล้ว ✅' : 'เพิ่มห้องใหม่เรียบร้อยแล้ว ✅', 'success');
  closeModal('roomModal');
  btn.disabled = false;
  document.getElementById('saveRoomBtnText').textContent = editId ? 'บันทึกการแก้ไข' : 'บันทึกห้อง';
  await loadRooms();
}
 
// ============================================================
// NAVIGATION & AUTH
// ============================================================
function revealAdminLogin() { showPage('login'); }
 
function showPage(pageId) {
  ['customer','login','admin'].forEach(p => document.getElementById(p + 'Page').classList.add('hidden'));
  document.getElementById(pageId + 'Page').classList.remove('hidden');
  if (pageId === 'customer') renderCustomerView();
  if (pageId === 'admin') renderAdminView();
}
 
function login() {
  const pass = document.getElementById('adminPass').value;
  if (pass === '7704') {
    sessionStorage.setItem('isAdmin', 'true');
    document.getElementById('logoutBtn').classList.remove('hidden');
    showPage('admin');
    document.getElementById('adminPass').value = '';
  } else {
    showToast('รหัสผ่านไม่ถูกต้อง', 'error');
  }
}
 
function logout() {
  sessionStorage.removeItem('isAdmin');
  document.getElementById('logoutBtn').classList.add('hidden');
  showPage('customer');
}
 
// ============================================================
// HELPERS
// ============================================================
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
  if (id === 'roomModal') { pendingImages = []; renderImagePreviews(); }
}
 
function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
}
 
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 3500);
}