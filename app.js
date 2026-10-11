/**
 * Northstar Academy — Complete Web Application Logic
 * Full-stack Client Controller & Modern UX
 */

// Global Application State
const state = {
  students: [],
  teachers: [],
  classes: [],
  payments: [],
  attendance: [],
  notifications: [],
  summary: {
    collected: 284500,
    outstanding: 23000,
    paymentCount: 23,
    target: 395000,
    attendance: 94.8,
    classesToday: 5
  },
  activePage: "dashboard",
  studentFilter: "all",
  teacherFilter: "all",
  classDayFilter: "all",
  testimonialFilter: "all",
  galleryFilter: "all",
  testimonials: [],
  gallery: [],
  feeSubtab: "balances",
  chartPeriod: "6m",
  selectedAttendanceClassId: null,
  selectedAttendanceDate: new Date().toISOString().slice(0, 10),
  activeAttendanceDraft: {},
  pendingDeleteAction: null,
  currentUser: JSON.parse(localStorage.getItem("northstar_user") || "null") || {
    role: "admin",
    name: "Alex Morgan",
    email: "admin@northstar.edu",
    initials: "AM",
    color: "#4f46e5",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    title: "Center Director & Admin"
  }
};

// Utilities
const rupees = value => "₹" + Number(value || 0).toLocaleString("en-IN");

const escapeHTML = str => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
};

// Curated Round Avatar Presets
const STUDENT_AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
];

const TEACHER_AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=200&q=80"
];

function getAvatarHTML(person, size = 36) {
  if (person && person.avatar) {
    return `<span class="student-avatar" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;flex-shrink:0;"><img src="${escapeHTML(person.avatar)}" alt="${escapeHTML(person.name || 'Photo')}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;"></span>`;
  }
  const initials = person && person.initials ? person.initials : "ST";
  const color = person && person.color ? person.color : "#e0e7ff";
  return `<span class="student-avatar" style="width:${size}px;height:${size}px;border-radius:50%;background:${escapeHTML(color)};flex-shrink:0;">${escapeHTML(initials)}</span>`;
}

// Controller for round photo display while enrolling
let studentPhotoController = null;
let teacherPhotoController = null;

function setupPhotoEnrollment(config) {
  const {
    fileInputId,
    imgId,
    initialsId,
    randomBtnId,
    clearBtnId,
    avatarHiddenId,
    nameInputId,
    presets,
    defaultInitials = "ST"
  } = config;

  let presetIndex = 0;

  function updatePhotoDisplay(url, initials = null) {
    const imgEl = document.getElementById(imgId);
    const initialsEl = document.getElementById(initialsId);
    const clearBtn = document.getElementById(clearBtnId);
    const avatarHidden = document.getElementById(avatarHiddenId);
    const nameInput = document.getElementById(nameInputId);

    if (!imgEl || !initialsEl) return;

    if (url) {
      imgEl.src = url;
      imgEl.style.display = "block";
      initialsEl.style.display = "none";
      if (clearBtn) clearBtn.style.display = "inline-flex";
      if (avatarHidden) avatarHidden.value = url;
    } else {
      imgEl.src = "";
      imgEl.style.display = "none";
      initialsEl.style.display = "block";
      const name = nameInput ? nameInput.value.trim() : "";
      const derivedInitials = initials || (name ? name.split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join("") : defaultInitials);
      initialsEl.textContent = derivedInitials;
      if (clearBtn) clearBtn.style.display = "none";
      if (avatarHidden) avatarHidden.value = "";
    }
  }

  const fileInput = document.getElementById(fileInputId);
  if (fileInput) {
    fileInput.addEventListener("change", e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        notify("Please select an image file (PNG, JPG, WebP).", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 220;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          const min = Math.min(image.width, image.height);
          const sx = (image.width - min) / 2;
          const sy = (image.height - min) / 2;
          ctx.drawImage(image, sx, sy, min, min, 0, 0, size, size);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          updatePhotoDisplay(dataUrl);
          notify("Photo loaded into circular preview.");
        };
        image.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const randomBtn = document.getElementById(randomBtnId);
  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      const chosen = presets[presetIndex % presets.length];
      presetIndex++;
      updatePhotoDisplay(chosen);
      notify("Selected avatar preset.");
    });
  }

  const clearBtn = document.getElementById(clearBtnId);
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      updatePhotoDisplay("");
      const fi = document.getElementById(fileInputId);
      if (fi) fi.value = "";
    });
  }

  const nameInput = document.getElementById(nameInputId);
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      const avatarHidden = document.getElementById(avatarHiddenId);
      if (!avatarHidden || !avatarHidden.value) {
        const name = nameInput.value.trim();
        const initials = name ? name.split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join("") : defaultInitials;
        const initialsEl = document.getElementById(initialsId);
        if (initialsEl) initialsEl.textContent = initials;
      }
    });
  }

  return { updatePhotoDisplay };
}


// Toast Notifications
let toastTimer = null;
function notify(message, type = "success") {
  const toast = document.getElementById("toastNotice");
  const text = document.getElementById("toastNoticeText");
  if (!toast || !text) return;
  text.textContent = message;
  toast.className = `toast-notice show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// REST API & Static Deployment Storage Adapter
let isOfflineOrStatic = false;

async function getLocalStore() {
  const cached = localStorage.getItem("northstar_store_v1");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.students)) return parsed;
    } catch (_) { }
  }
  try {
    const res = await fetch("./data/store.json");
    const data = await res.json();
    localStorage.setItem("northstar_store_v1", JSON.stringify(data));
    return data;
  } catch (err) {
    console.error("Failed to load ./data/store.json fallback:", err);
    return { students: [], teachers: [], classes: [], payments: [], attendance: [], notifications: [], testimonials: [], gallery: [], summary: {} };
  }
}

function saveLocalStore(store) {
  store.summary = store.summary || {};
  const students = store.students || [];
  const payments = store.payments || [];
  const classes = store.classes || [];
  const attendanceRecords = store.attendance || [];

  store.summary.outstanding = students.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const sumPayments = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  store.summary.collected = 244300 + sumPayments;
  store.summary.paymentCount = payments.length;
  store.summary.classesToday = classes.length;
  store.summary.target = 450000;

  if (attendanceRecords.length > 0) {
    let totalPresent = 0;
    let totalRoster = 0;
    attendanceRecords.forEach(att => {
      if (Array.isArray(att.records)) {
        att.records.forEach(r => {
          totalRoster++;
          if (r.status === "Present" || r.status === "Late") totalPresent++;
        });
      }
    });
    if (totalRoster > 0) {
      store.summary.attendance = Number(((totalPresent / totalRoster) * 100).toFixed(1));
    }
  } else {
    store.summary.attendance = 94.8;
  }
  localStorage.setItem("northstar_store_v1", JSON.stringify(store));
}

async function handleLocalApi(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const url = new URL(endpoint, window.location.origin);
  const pathname = url.pathname;
  const store = await getLocalStore();

  if (pathname === "/api/bootstrap") {
    return store;
  }

  if (pathname === "/api/health") {
    return { ok: true, timestamp: new Date().toISOString() };
  }

  // Auth Login
  if (pathname === "/api/auth/login" && method === "POST") {
    const role = (body.role || "").toLowerCase();
    const username = (body.username || "").trim();
    const password = (body.password || "").trim();

    if (role === "admin" || username.toLowerCase() === "admin") {
      if (password === "admin123" || password === "admin" || password === "123456") {
        return {
          ok: true,
          user: {
            role: "admin",
            name: "Alex Morgan",
            email: "admin@northstar.edu",
            initials: "AM",
            color: "#4f46e5",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            title: "Super Admin & Center Director"
          }
        };
      }
      throw new Error("Invalid password for Admin. Try 'admin123'.");
    }

    const cleanUsername = username.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "").trim().toLowerCase();
    if (role === "teacher" || (!role && (store.teachers || []).some(t => t.name.toLowerCase().includes(cleanUsername)))) {
      const teacher = (store.teachers || []).find(t => {
        const cleanTName = t.name.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "").trim().toLowerCase();
        return t.name.toLowerCase() === username.toLowerCase() ||
          cleanTName === cleanUsername ||
          t.name.toLowerCase().includes(cleanUsername) ||
          t.email.toLowerCase() === username.toLowerCase();
      });
      if (teacher) {
        if (password === "teacher123" || password === "admin123" || password === "password" || password === "123456") {
          return { ok: true, user: { role: "teacher", ...teacher } };
        }
        throw new Error("Invalid password for Teacher. Try 'teacher123'.");
      }
    }

    if (role === "student" || (!role && (store.students || []).some(s => s.name.toLowerCase().includes(cleanUsername)))) {
      const student = (store.students || []).find(s => {
        return s.name.toLowerCase() === username.toLowerCase() ||
          s.name.toLowerCase().includes(cleanUsername) ||
          (s.phone && s.phone.replace(/\D/g, "").includes(username.replace(/\D/g, "")));
      });
      if (student) {
        if (password === "student123" || password === "admin123" || password === "password" || password === "123456") {
          return { ok: true, user: { role: "student", ...student } };
        }
        throw new Error("Invalid password for Student. Try 'student123'.");
      }
    }

    // Default demo login fallback
    return {
      ok: true,
      user: {
        role: role || "admin",
        name: username || "Demo User",
        email: "demo@northstar.edu",
        initials: "DU",
        color: "#4f46e5",
        title: "Staff Member"
      }
    };
  }

  // Students CRUD
  if (pathname === "/api/students") {
    if (method === "GET") return store.students || [];
    if (method === "POST") {
      const newStudent = {
        id: `stu-${Date.now()}`,
        name: body.name || "New Student",
        class: body.class || "Class 11",
        school: body.school || "High School",
        course: body.course || "General Science",
        due: body.due || "End of Month",
        phone: body.phone || "+91 98200 00000",
        email: body.email || "student@northstar.edu",
        address: body.address || "Mumbai, India",
        parentName: body.parentName || "Guardian",
        parentPhone: body.parentPhone || "+91 98200 00001",
        amount: Number(body.amount) || 0,
        totalFee: Number(body.totalFee) || Number(body.amount) || 30000,
        status: (Number(body.amount) || 0) === 0 ? "Paid" : "Partial",
        initials: (body.name || "NS").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
        color: "#4f46e5",
        avatar: body.avatar || "",
        enrolledDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      };
      store.students = store.students || [];
      store.students.unshift(newStudent);
      saveLocalStore(store);
      return newStudent;
    }
  }

  const studentMatch = pathname.match(/^\/api\/students\/([^/]+)$/);
  if (studentMatch) {
    const studentId = decodeURIComponent(studentMatch[1]);
    const idx = (store.students || []).findIndex(s => s.id === studentId);
    if (idx === -1) throw new Error("Student not found.");
    if (method === "DELETE") {
      const removed = store.students.splice(idx, 1)[0];
      saveLocalStore(store);
      return { success: true, removed };
    }
    if (method === "PUT") {
      const updated = { ...store.students[idx], ...body };
      store.students[idx] = updated;
      saveLocalStore(store);
      return updated;
    }
  }

  // Teachers CRUD
  if (pathname === "/api/teachers") {
    if (method === "GET") return store.teachers || [];
    if (method === "POST") {
      const newTeacher = {
        id: `tch-${Date.now()}`,
        ...body,
        initials: (body.name || "TC").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
        color: "#06b6d4"
      };
      store.teachers = store.teachers || [];
      store.teachers.push(newTeacher);
      saveLocalStore(store);
      return newTeacher;
    }
  }

  const teacherMatch = pathname.match(/^\/api\/teachers\/([^/]+)$/);
  if (teacherMatch) {
    const tchId = decodeURIComponent(teacherMatch[1]);
    const idx = (store.teachers || []).findIndex(t => t.id === tchId);
    if (idx === -1) throw new Error("Teacher not found.");
    if (method === "DELETE") {
      const removed = store.teachers.splice(idx, 1)[0];
      saveLocalStore(store);
      return { success: true, removed };
    }
    if (method === "PUT") {
      const updated = { ...store.teachers[idx], ...body };
      store.teachers[idx] = updated;
      saveLocalStore(store);
      return updated;
    }
  }

  // Classes CRUD
  if (pathname === "/api/classes") {
    if (method === "GET") return store.classes || [];
    if (method === "POST") {
      const newClass = { id: `cls-${Date.now()}`, ...body };
      store.classes = store.classes || [];
      store.classes.push(newClass);
      saveLocalStore(store);
      return newClass;
    }
  }

  const classMatch = pathname.match(/^\/api\/classes\/([^/]+)$/);
  if (classMatch) {
    const clsId = decodeURIComponent(classMatch[1]);
    const idx = (store.classes || []).findIndex(c => c.id === clsId);
    if (idx === -1) throw new Error("Class not found.");
    if (method === "DELETE") {
      const removed = store.classes.splice(idx, 1)[0];
      saveLocalStore(store);
      return { success: true, removed };
    }
    if (method === "PUT") {
      const updated = { ...store.classes[idx], ...body };
      store.classes[idx] = updated;
      saveLocalStore(store);
      return updated;
    }
  }

  // Attendance
  if (pathname === "/api/attendance") {
    if (method === "GET") return store.attendance || [];
    if (method === "POST") {
      const attendanceEntry = {
        id: `att-${body.date}-${body.classId}`,
        ...body
      };
      store.attendance = store.attendance || [];
      const exIdx = store.attendance.findIndex(a => a.date === body.date && a.classId === body.classId);
      if (exIdx !== -1) {
        store.attendance[exIdx] = attendanceEntry;
      } else {
        store.attendance.unshift(attendanceEntry);
      }
      saveLocalStore(store);
      return attendanceEntry;
    }
  }

  // Payments
  if (pathname === "/api/payments") {
    if (method === "GET") return store.payments || [];
    if (method === "POST") {
      const student = (store.students || []).find(s => s.id === body.studentId);
      const amount = Number(body.amount) || 0;
      const payment = {
        receipt: `NSA-${Date.now().toString().slice(-7)}`,
        studentId: body.studentId,
        student: student ? student.name : "Student",
        course: student ? student.course : "Course",
        amount,
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        method: body.method || "UPI",
        note: body.note || "",
        collectedBy: "Alex Morgan"
      };
      if (student) {
        student.amount = Math.max(0, (student.amount || 0) - amount);
        student.status = student.amount === 0 ? "Paid" : "Partial";
      }
      store.payments = store.payments || [];
      store.payments.push(payment);
      saveLocalStore(store);
      return { payment, student, summary: store.summary };
    }
  }

  // Reminders
  if (pathname === "/api/reminders") {
    if (method === "POST") {
      const student = (store.students || []).find(s => s.id === body.studentId);
      if (student) {
        student.lastRemindedAt = `Today at ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
      }
      saveLocalStore(store);
      return { ok: true };
    }
  }

  if (pathname === "/api/reminders/batch") {
    let count = 0;
    const nowStr = `Today at ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    (store.students || []).forEach(s => {
      if ((s.amount || 0) > 0) {
        s.lastRemindedAt = nowStr;
        count++;
      }
    });
    saveLocalStore(store);
    return { ok: true, count };
  }

  // Share Web Application Link
  if (pathname === "/api/share-app") {
    if (method === "POST") {
      store.notifications = store.notifications || [];
      store.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: "App Link Shared",
        message: `Shared portal link via ${(body.method || "whatsapp").toUpperCase()} with ${body.recipient || "Contact"} (${body.phone || ""}).`,
        time: "Just now",
        type: "info",
        read: false
      });
      saveLocalStore(store);
      return { ok: true };
    }
  }

  // Testimonials
  if (pathname === "/api/testimonials") {
    if (method === "GET") return store.testimonials || [];
    if (method === "POST") {
      const t = { id: `test-${Date.now()}`, ...body };
      store.testimonials = store.testimonials || [];
      store.testimonials.unshift(t);
      saveLocalStore(store);
      return t;
    }
  }

  // Gallery
  if (pathname === "/api/gallery") {
    if (method === "GET") return store.gallery || [];
    if (method === "POST") {
      const g = { id: `gal-${Date.now()}`, ...body };
      store.gallery = store.gallery || [];
      store.gallery.unshift(g);
      saveLocalStore(store);
      return g;
    }
  }

  // Notifications
  if (pathname === "/api/notifications/read") {
    (store.notifications || []).forEach(n => { n.read = true; });
    saveLocalStore(store);
    return { ok: true };
  }

  return { ok: true };
}

// REST API Helper
async function api(endpoint, options = {}) {
  if (isOfflineOrStatic) {
    return handleLocalApi(endpoint, options);
  }
  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
    if (res.status === 404 || res.status === 405) {
      isOfflineOrStatic = true;
      return handleLocalApi(endpoint, options);
    }
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload.error || `HTTP error ${res.status}`);
    }
    return payload;
  } catch (err) {
    console.warn(`Server unreachable on ${endpoint}, switching to static storage adapter:`, err.message);
    isOfflineOrStatic = true;
    return handleLocalApi(endpoint, options);
  }
}

// Data Fetch & Bootstrap
async function refreshData() {
  try {
    const data = await api("/api/bootstrap");
    state.students = data.students || [];
    state.teachers = data.teachers || [];
    state.classes = data.classes || [];
    state.payments = data.payments || [];
    state.attendance = data.attendance || [];
    state.notifications = data.notifications || [];
    state.testimonials = data.testimonials || [];
    state.gallery = data.gallery || [];
    state.summary = data.summary || state.summary;
    updateNavBadges();
    renderActivePage();
  } catch (err) {
    notify(`Could not connect to server: ${err.message}`, "error");
  }
}

// Badges update
function updateNavBadges() {
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setText("studentsBadge", state.students.length);
  setText("teachersBadge", state.teachers.length);
  setText("classesBadge", state.classes.length);
  setText("attendanceBadge", state.classes.length);
  setText("feesBadge", state.payments.length);
  setText("reportsBadge", state.classes.length);
  setText("testimonialsBadge", (state.testimonials || []).length);
  setText("galleryBadge", (state.gallery || []).length);

  const notifDot = document.getElementById("notifDot");
  const unreadNotifs = state.notifications.filter(n => !n.read).length;
  if (notifDot) {
    notifDot.style.display = unreadNotifs > 0 ? "block" : "none";
  }
}

// Theme Toggle
function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const savedTheme = localStorage.getItem("northstar_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const updateIcon = theme => {
    if (themeIcon) {
      themeIcon.innerHTML = theme === "dark"
        ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  };
  updateIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("northstar_theme", next);
      updateIcon(next);
      notify(`Switched to ${next} mode`);
    });
  }
}

// Page Navigation
function setPage(pageId) {
  const role = (state.currentUser?.role || "admin").toLowerCase();
  const roleAllowedPages = {
    admin: ["dashboard", "students", "teachers", "classes", "attendance", "fees", "reports", "teacher-portal", "student-portal", "testimonials", "gallery"],
    teacher: ["teacher-portal", "classes", "attendance", "students", "testimonials", "gallery"],
    student: ["student-portal", "classes", "attendance", "testimonials", "gallery"]
  };

  if (!roleAllowedPages[role]?.includes(pageId)) {
    const fallback = role === "teacher" ? "teacher-portal" : (role === "student" ? "student-portal" : "dashboard");
    pageId = fallback;
  }

  state.activePage = pageId;
  const pageTitles = {
    dashboard: "Overview",
    students: "Students",
    teachers: "Teachers & Faculty",
    classes: "Classes & Timetable",
    attendance: "Daily Attendance",
    fees: "Fees & Ledger",
    reports: "Reports & Analytics",
    "teacher-portal": "Faculty Hub",
    "student-portal": "Student Portal",
    testimonials: "Testimonials & Success Stories",
    gallery: "Photo Gallery & Campus Tour"
  };

  document.querySelectorAll(".page-view").forEach(el => el.classList.remove("active"));
  const viewMap = {
    "teacher-portal": "teacherPortalView",
    "student-portal": "studentPortalView"
  };
  const targetId = viewMap[pageId] || `${pageId}View`;
  const targetView = document.getElementById(targetId) || document.getElementById(`${pageId}View`);
  if (targetView) targetView.classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });

  const breadcrumb = document.getElementById("activeBreadcrumb");
  if (breadcrumb) breadcrumb.textContent = pageTitles[pageId] || "Overview";
  document.title = `${pageTitles[pageId] || "Portal"} — Divine Coaching`;

  // Update mobile bottom nav active state
  document.querySelectorAll(".bottom-nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.bottomPage === pageId);
  });

  // Close mobile drawer if open
  closeMobileDrawer();

  renderActivePage();
}

function renderActivePage() {
  switch (state.activePage) {
    case "dashboard":
      renderDashboard();
      break;
    case "students":
      renderStudents();
      break;
    case "teachers":
      renderTeachers();
      break;
    case "classes":
      renderClasses();
      break;
    case "attendance":
      renderAttendance();
      break;
    case "fees":
      renderFees();
      break;
    case "reports":
      renderReports();
      break;
    case "teacher-portal":
      renderTeacherPortal();
      break;
    case "student-portal":
      renderStudentPortal();
      break;
    case "testimonials":
      renderTestimonials();
      break;
    case "gallery":
      renderGallery();
      break;
  }
}

// =========================================================================
// 1. DASHBOARD VIEW
// =========================================================================
function renderDashboard() {
  // Stat cards
  const elTotalStu = document.getElementById("statTotalStudents");
  const elFeesCol = document.getElementById("statFeesCollected");
  const elOut = document.getElementById("statOutstanding");
  const elOwing = document.getElementById("statOwingCount");
  const elAtt = document.getElementById("statAttendance");

  if (elTotalStu) elTotalStu.textContent = state.students.length;
  if (elFeesCol) elFeesCol.textContent = rupees(state.summary.collected);
  if (elOut) elOut.textContent = rupees(state.summary.outstanding);
  const owingCount = state.students.filter(s => s.amount > 0).length;
  if (elOwing) elOwing.textContent = `${owingCount} students`;
  if (elAtt) elAtt.textContent = `${state.summary.attendance}%`;

  // Target widget
  const targetPct = Math.min(100, Math.round((state.summary.collected / (state.summary.target || 395000)) * 100));
  const elProgressPct = document.getElementById("targetProgressPct");
  const elProgressBar = document.getElementById("targetProgressBar");
  const elTargetCaption = document.getElementById("targetCaptionText");
  if (elProgressPct) elProgressPct.textContent = `${targetPct}% Completed`;
  if (elProgressBar) elProgressBar.style.width = `${targetPct}%`;
  const remaining = Math.max(0, (state.summary.target || 395000) - state.summary.collected);
  if (elTargetCaption) elTargetCaption.textContent = `${rupees(state.summary.collected)} collected • ${rupees(remaining)} to target`;

  // Render Bar Chart
  renderFeeBarChart();

  // Render Table Preview
  const previewBody = document.getElementById("dashStudentsTableBody");
  if (previewBody) {
    const list = state.students.slice(0, 5);
    previewBody.innerHTML = list.map(student => `
      <tr>
        <td>
          <div class="student-col" onclick="viewStudentProfile('${student.id}')" title="Click to view student profile">
            <span class="student-avatar" style="background:${escapeHTML(student.color)}">${escapeHTML(student.initials)}</span>
            <div class="student-meta">
              <strong>${escapeHTML(student.name)}</strong>
              <span>${student.amount > 0 ? "Pending dues" : "Fully paid"}</span>
            </div>
          </div>
        </td>
        <td>${escapeHTML(student.course)}</td>
        <td>${escapeHTML(student.due)}</td>
        <td><strong>${student.amount ? rupees(student.amount) : "—"}</strong></td>
        <td><span class="status-pill status-${student.status.toLowerCase()}">${escapeHTML(student.status)}</span></td>
        <td>
          ${student.amount > 0
        ? `<button class="btn btn-sm btn-primary" onclick="openPaymentModal('${student.id}')">Pay</button>`
        : `<button class="btn btn-sm btn-secondary" onclick="viewStudentLatestReceipt('${student.id}')">Receipt</button>`
      }
        </td>
      </tr>
    `).join("");
  }

  // Today's classes
  const classesList = document.getElementById("dashTodayClasses");
  if (classesList) {
    classesList.innerHTML = state.classes.slice(0, 4).map(cls => `
      <div class="session-row">
        <div class="session-time">${escapeHTML(cls.time.split(" - ")[0])}</div>
        <div class="session-indicator ${cls.live ? "live" : ""}"></div>
        <div class="session-content">
          <div class="session-title">
            <span>${escapeHTML(cls.name)}</span>
            ${cls.live ? '<span class="live-chip">LIVE</span>' : ""}
          </div>
          <div class="session-meta">
            <span>${escapeHTML(cls.location)}</span>
            <span>&bull;</span>
            <span>${escapeHTML(cls.teacher)}</span>
            <span>&bull;</span>
            <span>${cls.students} students</span>
          </div>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="quickJumpAttendance('${cls.id}')">Attendance</button>
      </div>
    `).join("");
  }

  // Reminders list
  const remindersList = document.getElementById("dashRemindersList");
  if (remindersList) {
    const owing = state.students.filter(s => s.amount > 0).slice(0, 3);
    remindersList.innerHTML = owing.length ? owing.map(s => {
      const isOverdue = s.status === "Overdue";
      return `
        <div class="alert-row">
          <div class="alert-icon ${isOverdue ? "tint-rose" : "tint-amber"}">${isOverdue ? "!" : "◷"}</div>
          <div class="alert-info">
            <strong>${escapeHTML(s.name)} (${escapeHTML(s.course)})</strong>
            <span>${isOverdue ? "Fee overdue" : `Due on ${s.due}`} &bull; Parent: ${escapeHTML(s.parentPhone || s.phone)}</span>
          </div>
          <div class="alert-amount">${rupees(s.amount)}</div>
          <button class="btn btn-sm btn-secondary" onclick="openReminderPrompt('${s.id}')">Remind</button>
        </div>
      `;
    }).join("") : `<div style="padding:20px;text-align:center;color:var(--ink-400);">All student fee accounts are fully settled.</div>`;
  }
}

// Chart Render
function renderFeeBarChart() {
  const chartWrap = document.getElementById("chartBarsWrap");
  if (!chartWrap) return;
  const is6m = state.chartPeriod === "6m";
  const months6 = [
    { label: "May", prev: 45, curr: 60 },
    { label: "Jun", prev: 50, curr: 55 },
    { label: "Jul", prev: 48, curr: 72 },
    { label: "Aug", prev: 65, curr: 70 },
    { label: "Sep", prev: 62, curr: 84 },
    { label: "Oct", prev: 70, curr: 92 }
  ];
  const months12 = [
    { label: "Nov", prev: 40, curr: 45 },
    { label: "Dec", prev: 55, curr: 52 },
    { label: "Jan", prev: 60, curr: 65 },
    { label: "Feb", prev: 50, curr: 58 },
    { label: "Mar", prev: 65, curr: 75 },
    { label: "Apr", prev: 70, curr: 72 },
    ...months6
  ];
  const activeMonths = is6m ? months6 : months12;

  chartWrap.innerHTML = activeMonths.map(m => `
    <div class="chart-col">
      <div class="bar-pair">
        <span class="bar prev" style="height:${m.prev}%;" title="Prev Year: ${m.prev}%"></span>
        <span class="bar curr" style="height:${m.curr}%;" title="Current Year: ${m.curr}%"></span>
      </div>
      <span class="chart-label">${m.label}</span>
    </div>
  `).join("");
}

// =========================================================================
// 2. STUDENTS VIEW
// =========================================================================
function renderStudents() {
  const isAdmin = (state.currentUser?.role || "admin").toLowerCase() === "admin";
  const search = (document.getElementById("studentSearchInput")?.value || "").toLowerCase();
  const filter = state.studentFilter;

  // Filter counters
  const elAll = document.getElementById("countAllStudents");
  const elOverdue = document.getElementById("countOverdueStudents");
  const elPartial = document.getElementById("countPartialStudents");
  const elPaid = document.getElementById("countPaidStudents");

  if (elAll) elAll.textContent = state.students.length;
  if (elOverdue) elOverdue.textContent = state.students.filter(s => s.status === "Overdue").length;
  if (elPartial) elPartial.textContent = state.students.filter(s => s.status === "Partial").length;
  if (elPaid) elPaid.textContent = state.students.filter(s => s.status === "Paid").length;

  let filtered = state.students.filter(s => {
    if (filter === "overdue" && s.status !== "Overdue") return false;
    if (filter === "partial" && s.status !== "Partial") return false;
    if (filter === "paid" && s.status !== "Paid") return false;
    if (search) {
      const haystack = [s.name, s.course, s.phone, s.email, s.parentName, s.parentPhone].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const tbody = document.getElementById("studentsTableBody");
  if (tbody) {
    tbody.innerHTML = filtered.length ? filtered.map(student => `
      <tr>
        <td>
          <div class="student-col" onclick="viewStudentProfile('${student.id}')" title="Click to view student profile">
            ${getAvatarHTML(student, 34)}
            <div class="student-meta">
              <strong>${escapeHTML(student.name)} <span class="tag-pill" style="margin-left:4px;font-size:10px;">${escapeHTML(student.class || "Class 12")}</span></strong>
              <span style="font-size:11px;">${escapeHTML(student.email || student.phone)}</span>
            </div>
          </div>
        </td>
        <td>
          <div style="font-size:12px;font-weight:600;color:var(--ink-800);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHTML(student.school || "Delhi Public School")}">🏫 ${escapeHTML(student.school || "Delhi Public School")}</div>
        </td>
        <td><span class="tag-pill" style="white-space:nowrap;">${escapeHTML(student.course)}</span></td>
        <td>
          <a href="tel:${escapeHTML((student.phone || "").replace(/\D/g, ""))}" class="contact-pill">📱 ${escapeHTML(student.phone || "—")}</a>
        </td>
        <td>
          <div style="font-size:12px;font-weight:600;white-space:nowrap;">${escapeHTML(student.parentName || "Guardian")}</div>
          <a href="tel:${escapeHTML((student.parentPhone || student.phone || "").replace(/\D/g, ""))}" class="contact-pill" style="margin-top:2px;">👨‍👩‍👧 ${escapeHTML(student.parentPhone || student.phone || "—")}</a>
        </td>
        <td>
          <div style="font-size:11px;color:var(--ink-600);line-height:1.3;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHTML(student.address || "")}">📍 ${escapeHTML(student.address || "Mumbai")}</div>
        </td>
        <td><span style="white-space:nowrap;">${escapeHTML(student.due)}</span></td>
        <td><strong style="white-space:nowrap;">${student.amount ? rupees(student.amount) : "₹0"}</strong></td>
        <td><span class="status-pill status-${student.status.toLowerCase()}">${escapeHTML(student.status)}</span></td>
        <td>
          <div class="actions-cell-group" style="display:inline-flex;align-items:center;gap:4px;flex-wrap:nowrap;white-space:nowrap;">
            ${student.amount > 0 ? `<button class="btn btn-xs btn-whatsapp" onclick="openFeeReminderModal('${student.id}')" title="Send WhatsApp/SMS Fee Reminder">💬 Remind</button>` : ""}
            ${isAdmin && student.amount > 0 ? `<button class="btn btn-xs btn-primary" onclick="openPaymentModal('${student.id}')">Pay</button>` : ""}
            ${isAdmin ? `<button class="btn btn-xs btn-secondary" onclick="editStudentModal('${student.id}')" title="Edit student">Edit</button>` : ""}
            ${isAdmin ? `<button class="btn btn-xs btn-danger" onclick="confirmDeleteStudent('${student.id}')" title="Delete" style="padding:0 6px;">✕</button>` : ""}
          </div>
        </td>
      </tr>
    `).join("") : `<tr><td colspan="10" style="text-align:center;padding:36px;color:var(--ink-400);">No students match your criteria.</td></tr>`;
  }

  const foot = document.getElementById("studentsFootInfo");
  if (foot) foot.textContent = `Showing ${filtered.length} of ${state.students.length} students`;
}

// Student Modal & Operations
function initStudentPhotoController() {
  if (!studentPhotoController) {
    studentPhotoController = setupPhotoEnrollment({
      fileInputId: "stuPhotoFileInput",
      imgId: "stuPhotoImg",
      initialsId: "stuPhotoInitials",
      randomBtnId: "stuRandomPhotoBtn",
      clearBtnId: "stuClearPhotoBtn",
      avatarHiddenId: "stuAvatar",
      nameInputId: "stuName",
      presets: STUDENT_AVATAR_PRESETS,
      defaultInitials: "ST"
    });
  }
}

function openStudentModal(studentId = null) {
  initStudentPhotoController();
  const form = document.getElementById("studentForm");
  form.reset();
  document.getElementById("studentFormError").classList.remove("show");
  document.getElementById("editStudentId").value = studentId || "";

  const title = document.getElementById("studentModalTitle");
  const saveBtn = document.getElementById("saveStudentBtn");

  if (studentId) {
    const s = state.students.find(item => item.id === studentId);
    if (!s) return;
    title.textContent = "Edit Student Profile";
    saveBtn.textContent = "Save Changes";
    document.getElementById("stuName").value = s.name;
    document.getElementById("stuClass").value = s.class || "Class 12";
    const stuSchoolEl = document.getElementById("stuSchool");
    if (stuSchoolEl) stuSchoolEl.value = s.school || "Delhi Public School";
    document.getElementById("stuCourse").value = s.course;
    document.getElementById("stuAddress").value = s.address || "";
    document.getElementById("stuPhone").value = s.phone || "";
    document.getElementById("stuEmail").value = s.email || "";
    document.getElementById("stuParentName").value = s.parentName || "";
    document.getElementById("stuParentPhone").value = s.parentPhone || "";
    document.getElementById("stuDue").value = s.due ? new Date(s.due).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    document.getElementById("stuAmount").value = s.amount;
    studentPhotoController.updatePhotoDisplay(s.avatar || "", s.initials || "ST");
  } else {
    title.textContent = "Enroll New Student";
    saveBtn.textContent = "Enroll Student";
    document.getElementById("stuClass").value = "Class 12";
    const stuSchoolEl = document.getElementById("stuSchool");
    if (stuSchoolEl) stuSchoolEl.value = "Delhi Public School";
    document.getElementById("stuDue").value = new Date().toISOString().slice(0, 10);
    document.getElementById("stuAmount").value = "4500";
    studentPhotoController.updatePhotoDisplay("", "ST");
  }

  openModal("studentModal");
}

window.editStudentModal = openStudentModal;

async function handleStudentSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById("studentFormError");
  errEl.classList.remove("show");

  const id = document.getElementById("editStudentId").value;
  const name = document.getElementById("stuName").value.trim();
  const studentClass = document.getElementById("stuClass").value.trim();
  const school = document.getElementById("stuSchool")?.value.trim() || "Delhi Public School";
  const course = document.getElementById("stuCourse").value.trim();
  const address = document.getElementById("stuAddress").value.trim();
  const phone = document.getElementById("stuPhone").value.trim();
  const email = document.getElementById("stuEmail").value.trim();
  const parentName = document.getElementById("stuParentName").value.trim();
  const parentPhone = document.getElementById("stuParentPhone").value.trim();
  const dueRaw = document.getElementById("stuDue").value;
  const dueFormatted = new Date(`${dueRaw}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const amount = Number(document.getElementById("stuAmount").value);
  const avatar = document.getElementById("stuAvatar").value.trim() || null;

  const payload = {
    name,
    class: studentClass,
    school,
    course,
    address,
    phone,
    email,
    parentName,
    parentPhone,
    due: dueFormatted,
    amount,
    avatar
  };

  try {
    if (id) {
      await api(`/api/students/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      notify("Student profile updated.");
    } else {
      await api("/api/students", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      notify("New student enrolled with school & contact details.");
    }
    closeModal("studentModal");
    await refreshData();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add("show");
  }
}

function confirmDeleteStudent(studentId) {
  const s = state.students.find(item => item.id === studentId);
  if (!s) return;
  document.getElementById("deleteConfirmMessage").textContent = `Are you sure you want to unenroll and remove student "${s.name}"?`;
  state.pendingDeleteAction = async () => {
    try {
      await api(`/api/students/${encodeURIComponent(studentId)}`, { method: "DELETE" });
      notify(`Student ${s.name} removed.`);
      closeModal("confirmDeleteModal");
      await refreshData();
    } catch (err) {
      notify(`Failed to remove: ${err.message}`, "error");
    }
  };
  openModal("confirmDeleteModal");
}
window.confirmDeleteStudent = confirmDeleteStudent;

// Student Profile Drawer
function viewStudentProfile(studentId) {
  const s = state.students.find(item => item.id === studentId);
  if (!s) return;
  const container = document.getElementById("studentProfileBody");
  const studentPayments = state.payments.filter(p => p.studentId === studentId || p.student === s.name);

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border-subtle);">
      ${getAvatarHTML(s, 56)}
      <div>
        <h3 style="font-size:18px;margin:0;">${escapeHTML(s.name)}</h3>
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px;flex-wrap:wrap;">
          <span class="tag-pill" style="font-size:11px;">${escapeHTML(s.class || "Class 12")}</span>
          <span class="tag-pill" style="font-size:11px;">🏫 ${escapeHTML(s.school || "Delhi Public School")}</span>
          <span class="tag-pill" style="font-size:11px;">${escapeHTML(s.course)}</span>
        </div>
      </div>
      <div style="margin-left:auto;text-align:right;">
        <span class="status-pill status-${s.status.toLowerCase()}">${escapeHTML(s.status)}</span>
        ${s.amount > 0 ? `<div style="margin-top:6px;"><button class="btn btn-sm btn-whatsapp" onclick="closeModal('studentProfileModal');openFeeReminderModal('${s.id}')">💬 Send Reminder</button></div>` : ""}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:var(--bg-card-subtle);padding:14px;border-radius:var(--radius-md);margin-bottom:20px;font-size:12px;">
      <div><span style="color:var(--ink-400);">Student Contact</span><div style="font-weight:700;"><a href="tel:${escapeHTML(s.phone)}" style="color:inherit;text-decoration:none;">📱 ${escapeHTML(s.phone || "—")}</a></div></div>
      <div><span style="color:var(--ink-400);">Student Email</span><div style="font-weight:700;">${escapeHTML(s.email || "—")}</div></div>
      <div><span style="color:var(--ink-400);">Guardian Name</span><div style="font-weight:700;">${escapeHTML(s.parentName || "—")}</div></div>
      <div><span style="color:var(--ink-400);">Guardian Contact Number</span><div style="font-weight:700;"><a href="tel:${escapeHTML(s.parentPhone || s.phone)}" style="color:inherit;text-decoration:none;">👨‍👩‍👧 ${escapeHTML(s.parentPhone || s.phone || "—")}</a></div></div>
      <div style="grid-column:1/-1;"><span style="color:var(--ink-400);">School / College Name</span><div style="font-weight:700;">🏫 ${escapeHTML(s.school || "Delhi Public School")}</div></div>
      <div style="grid-column:1/-1;"><span style="color:var(--ink-400);">Residential Address</span><div style="font-weight:700;">📍 ${escapeHTML(s.address || "Mumbai")}</div></div>
      <div><span style="color:var(--ink-400);">Current Balance</span><div style="font-weight:800;color:var(--danger-text);font-size:14px;">${rupees(s.amount)}</div></div>
      <div><span style="color:var(--ink-400);">Next Due Date</span><div style="font-weight:700;">${escapeHTML(s.due)}</div></div>
      <div style="grid-column:1/-1;"><span style="color:var(--ink-400);">Last Reminder Dispatched</span><div style="font-weight:700;color:var(--primary);">${s.lastRemindedAt ? `🕒 ${escapeHTML(s.lastRemindedAt)}` : "None yet"}</div></div>
    </div>

    <div>
      <h4 style="font-size:13px;margin-bottom:10px;">Payment History (${studentPayments.length})</h4>
      <div style="max-height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">
        ${studentPayments.length ? studentPayments.map(p => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);font-size:12px;">
            <div>
              <strong>${escapeHTML(p.receipt)}</strong>
              <div style="font-size:10px;color:var(--ink-400);">${escapeHTML(p.date)} &bull; ${escapeHTML(p.method)}</div>
            </div>
            <div style="text-align:right;">
              <strong style="color:var(--success);">${rupees(p.amount)}</strong>
              <button class="text-btn" style="display:block;font-size:10px;" onclick="viewReceiptByData('${encodeURIComponent(JSON.stringify(p))}')">Receipt</button>
            </div>
          </div>
        `).join("") : `<div style="font-size:12px;color:var(--ink-400);">No payments logged yet.</div>`}
      </div>
    </div>
  `;

  const payBtn = document.getElementById("profilePayBtn");
  if (payBtn) {
    payBtn.onclick = () => {
      closeModal("studentProfileModal");
      openPaymentModal(studentId);
    };
  }

  openModal("studentProfileModal");
}
window.viewStudentProfile = viewStudentProfile;

// =========================================================================
// 3. TEACHERS VIEW
// =========================================================================
function renderTeachers() {
  const search = (document.getElementById("teacherSearchInput")?.value || "").toLowerCase();
  const filter = state.teacherFilter;

  // Counters
  const elAll = document.getElementById("countAllTeachers");
  const elActive = document.getElementById("countActiveTeachers");
  if (elAll) elAll.textContent = state.teachers.length;
  if (elActive) elActive.textContent = state.teachers.filter(t => t.status === "Active").length;

  let filtered = state.teachers.filter(t => {
    if (filter === "active" && t.status !== "Active") return false;
    if (filter === "leave" && t.status !== "On leave") return false;
    if (search) {
      const haystack = [t.name, t.phone, t.email, t.qualification, t.subjects.join(" ")].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const grid = document.getElementById("teachersGrid");
  if (grid) {
    grid.innerHTML = filtered.length ? filtered.map(t => {
      const assigned = state.classes.filter(c => c.teacher === t.name);
      return `
        <article class="teacher-card">
          <div class="teacher-top">
            <div onclick="openTeacherModal('${t.id}')" style="cursor:pointer;" title="Click to view/edit teacher profile">
              ${getAvatarHTML(t, 48)}
            </div>
            <span class="status-pill status-${t.status === "Active" ? "paid" : "partial"}">${escapeHTML(t.status)}</span>
          </div>

          <h3 onclick="openTeacherModal('${t.id}')" style="cursor:pointer;" title="Click to view/edit teacher profile">${escapeHTML(t.name)}</h3>
          <div class="teacher-qual">${escapeHTML(t.qualification)}</div>

          <div class="tag-list">
            ${t.subjects.map(sub => `<span class="tag-pill">${escapeHTML(sub)}</span>`).join("")}
          </div>

          <div class="teacher-contact-row">
            <div class="teacher-contact-item">
              <span>☎</span>
              <a href="tel:${escapeHTML(t.phone.replace(/[^+\d]/g, ""))}">${escapeHTML(t.phone)}</a>
            </div>
            <div class="teacher-contact-item">
              <span>✉</span>
              <a href="mailto:${escapeHTML(t.email)}">${escapeHTML(t.email)}</a>
            </div>
            <div class="teacher-contact-item">
              <span>◷</span>
              <span>${t.experienceYears} Years Exp &bull; ${escapeHTML(t.availability)}</span>
            </div>
          </div>

          <div class="teacher-foot">
            <span style="font-size:11px;font-weight:700;color:var(--primary);">${assigned.length} assigned ${assigned.length === 1 ? "class" : "classes"}</span>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="openTeacherModal('${t.id}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="confirmDeleteTeacher('${t.id}')">✕</button>
            </div>
          </div>
        </article>
      `;
    }).join("") : `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--ink-400);">No faculty members found.</div>`;
  }
}

function initTeacherPhotoController() {
  if (!teacherPhotoController) {
    teacherPhotoController = setupPhotoEnrollment({
      fileInputId: "tchPhotoFileInput",
      imgId: "tchPhotoImg",
      initialsId: "tchPhotoInitials",
      randomBtnId: "tchRandomPhotoBtn",
      clearBtnId: "tchClearPhotoBtn",
      avatarHiddenId: "tchAvatar",
      nameInputId: "tchName",
      presets: TEACHER_AVATAR_PRESETS,
      defaultInitials: "TC"
    });
  }
}

function openTeacherModal(teacherId = null) {
  initTeacherPhotoController();
  const form = document.getElementById("teacherForm");
  form.reset();
  document.getElementById("teacherFormError").classList.remove("show");
  document.getElementById("editTeacherId").value = teacherId || "";

  const title = document.getElementById("teacherModalTitle");
  const saveBtn = document.getElementById("saveTeacherBtn");

  if (teacherId) {
    const t = state.teachers.find(item => item.id === teacherId);
    if (!t) return;
    title.textContent = "Edit Faculty Profile";
    saveBtn.textContent = "Save Changes";
    document.getElementById("tchName").value = t.name;
    document.getElementById("tchPhone").value = t.phone;
    document.getElementById("tchEmail").value = t.email;
    document.getElementById("tchQualification").value = t.qualification;
    document.getElementById("tchSubjects").value = t.subjects.join(", ");
    document.getElementById("tchExperience").value = t.experienceYears;
    document.getElementById("tchStatus").value = t.status;
    document.getElementById("tchAvailability").value = t.availability;
    teacherPhotoController.updatePhotoDisplay(t.avatar || "", t.initials || "TC");
  } else {
    title.textContent = "Add Faculty Member";
    saveBtn.textContent = "Add Teacher";
    document.getElementById("tchStatus").value = "Active";
    document.getElementById("tchExperience").value = "5";
    document.getElementById("tchAvailability").value = "Mon–Sat · 9:00 am–6:00 pm";
    teacherPhotoController.updatePhotoDisplay("", "TC");
  }

  openModal("teacherModal");
}
window.openTeacherModal = openTeacherModal;

async function handleTeacherSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById("teacherFormError");
  errEl.classList.remove("show");

  const id = document.getElementById("editTeacherId").value;
  const name = document.getElementById("tchName").value.trim();
  const phone = document.getElementById("tchPhone").value.trim();
  const email = document.getElementById("tchEmail").value.trim();
  const qualification = document.getElementById("tchQualification").value.trim();
  const subjects = document.getElementById("tchSubjects").value.split(",").map(s => s.trim()).filter(Boolean);
  const experienceYears = Number(document.getElementById("tchExperience").value);
  const status = document.getElementById("tchStatus").value;
  const availability = document.getElementById("tchAvailability").value.trim();
  const avatar = document.getElementById("tchAvatar").value.trim() || null;

  const payload = {
    name,
    phone,
    email,
    qualification,
    subjects,
    experienceYears,
    status,
    availability,
    avatar
  };

  try {
    if (id) {
      await api(`/api/teachers/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      notify("Teacher profile updated.");
    } else {
      await api("/api/teachers", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      notify("Teacher added to faculty with round photo.");
    }
    closeModal("teacherModal");
    await refreshData();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add("show");
  }
}

function confirmDeleteTeacher(teacherId) {
  const t = state.teachers.find(item => item.id === teacherId);
  if (!t) return;
  document.getElementById("deleteConfirmMessage").textContent = `Are you sure you want to remove teacher "${t.name}" from faculty?`;
  state.pendingDeleteAction = async () => {
    try {
      await api(`/api/teachers/${encodeURIComponent(teacherId)}`, { method: "DELETE" });
      notify(`Teacher ${t.name} removed.`);
      closeModal("confirmDeleteModal");
      await refreshData();
    } catch (err) {
      notify(`Removal failed: ${err.message}`, "error");
    }
  };
  openModal("confirmDeleteModal");
}
window.confirmDeleteTeacher = confirmDeleteTeacher;

// =========================================================================
// 4. CLASSES & TIMETABLE VIEW
// =========================================================================
function renderClasses() {
  const search = (document.getElementById("classSearchInput")?.value || "").toLowerCase();
  const dayFilter = state.classDayFilter;

  let filtered = state.classes.filter(c => {
    if (dayFilter !== "all" && Array.isArray(c.days) && !c.days.includes(dayFilter)) {
      return false;
    }
    if (search) {
      const haystack = [c.name, c.course, c.location, c.teacher].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const role = (state.currentUser?.role || "admin").toLowerCase();
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  const grid = document.getElementById("classesGrid");
  if (grid) {
    grid.innerHTML = filtered.length ? filtered.map(c => `
      <article class="class-card">
        <div class="class-card-top">
          <span class="class-time-badge">${escapeHTML(c.time)}</span>
          ${isStudent ? (c.live ? '<span class="live-chip">● LIVE NOW</span>' : '') : (c.live
        ? `<button class="btn btn-sm btn-danger" onclick="toggleClassLive('${c.id}', false)">● LIVE NOW (Stop)</button>`
        : `<button class="btn btn-sm btn-secondary" onclick="toggleClassLive('${c.id}', true)">Start Live</button>`
      )}
        </div>

        <h3>${escapeHTML(c.name)}</h3>
        <div class="class-location">
          <span>📍</span>
          <span>${escapeHTML(c.location)} &bull; ${escapeHTML(c.course)}</span>
        </div>

        <div class="class-details-grid">
          <div>
            <div class="class-detail-label">Faculty Member</div>
            <div class="class-detail-val">${escapeHTML(c.teacher)}</div>
          </div>
          <div>
            <div class="class-detail-label">Enrolled Seats</div>
            <div class="class-detail-val">${c.students} Students</div>
          </div>
        </div>

        <div class="class-days-row">
          ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => {
        const isActive = Array.isArray(c.days) && c.days.includes(d);
        return `<span class="day-badge ${isActive ? "active" : ""}">${d}</span>`;
      }).join("")}
        </div>

        <div class="class-card-actions">
          ${isStudent ? `
            <div style="font-size:12px;color:var(--ink-600);padding:4px 0;width:100%;text-align:center;">
              Class Room: <strong>${escapeHTML(c.location)}</strong> &bull; Regular Attendance Required
            </div>
          ` : `
            <button class="btn btn-sm btn-primary" onclick="quickJumpAttendance('${c.id}')" style="flex:1;">Mark Attendance</button>
            ${isAdmin ? `<button class="btn btn-sm btn-secondary" onclick="openClassModal('${c.id}')">Edit</button>` : ""}
            ${isAdmin ? `<button class="btn btn-sm btn-danger" onclick="confirmDeleteClass('${c.id}')">✕</button>` : ""}
          `}
        </div>
      </article>
    `).join("") : `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--ink-400);">No batches found for this selection.</div>`;
  }
}

async function toggleClassLive(classId, isLive) {
  try {
    await api(`/api/classes/${encodeURIComponent(classId)}`, {
      method: "PUT",
      body: JSON.stringify({ live: isLive })
    });
    notify(isLive ? "Class session is now LIVE!" : "Live session ended.");
    await refreshData();
  } catch (err) {
    notify(`Failed to update status: ${err.message}`, "error");
  }
}
window.toggleClassLive = toggleClassLive;

function openClassModal(classId = null) {
  const form = document.getElementById("classForm");
  form.reset();
  document.getElementById("classFormError").classList.remove("show");
  document.getElementById("editClassId").value = classId || "";

  // Populate Teachers dropdown
  const teacherSelect = document.getElementById("clsTeacher");
  teacherSelect.innerHTML = state.teachers.map(t => `<option value="${escapeHTML(t.name)}">${escapeHTML(t.name)} (${t.subjects[0] || "Faculty"})</option>`).join("");

  const title = document.getElementById("classModalTitle");
  const saveBtn = document.getElementById("saveClassBtn");

  if (classId) {
    const c = state.classes.find(item => item.id === classId);
    if (!c) return;
    title.textContent = "Edit Batch Schedule";
    saveBtn.textContent = "Save Changes";
    document.getElementById("clsName").value = c.name;
    document.getElementById("clsCourse").value = c.course;
    document.getElementById("clsTime").value = c.time;
    document.getElementById("clsLocation").value = c.location;
    document.getElementById("clsTeacher").value = c.teacher;
    document.getElementById("clsStudents").value = c.students;
    document.getElementById("clsLive").checked = Boolean(c.live);

    // Check days
    document.querySelectorAll('input[name="clsDay"]').forEach(cb => {
      cb.checked = Array.isArray(c.days) && c.days.includes(cb.value);
    });
  } else {
    title.textContent = "Schedule Class / Batch";
    saveBtn.textContent = "Create Class";
    document.getElementById("clsTime").value = "10:00 - 11:30";
    document.getElementById("clsLocation").value = "Room 01 (Main Wing)";
    document.getElementById("clsStudents").value = "20";
    document.querySelectorAll('input[name="clsDay"]').forEach(cb => {
      cb.checked = ["Mon", "Wed", "Fri"].includes(cb.value);
    });
  }

  openModal("classModal");
}
window.openClassModal = openClassModal;

async function handleClassSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById("classFormError");
  errEl.classList.remove("show");

  const id = document.getElementById("editClassId").value;
  const name = document.getElementById("clsName").value.trim();
  const course = document.getElementById("clsCourse").value.trim();
  const time = document.getElementById("clsTime").value.trim();
  const location = document.getElementById("clsLocation").value.trim();
  const teacher = document.getElementById("clsTeacher").value;
  const students = Number(document.getElementById("clsStudents").value);
  const live = document.getElementById("clsLive").checked;

  const days = [];
  document.querySelectorAll('input[name="clsDay"]:checked').forEach(cb => days.push(cb.value));

  const payload = {
    name,
    course,
    time,
    location,
    teacher,
    students,
    live,
    days: days.length ? days : ["Mon", "Wed", "Fri"]
  };

  try {
    if (id) {
      await api(`/api/classes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      notify("Class schedule updated.");
    } else {
      await api("/api/classes", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      notify("New class scheduled.");
    }
    closeModal("classModal");
    await refreshData();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add("show");
  }
}

function confirmDeleteClass(classId) {
  const c = state.classes.find(item => item.id === classId);
  if (!c) return;
  document.getElementById("deleteConfirmMessage").textContent = `Are you sure you want to remove the class schedule "${c.name}"?`;
  state.pendingDeleteAction = async () => {
    try {
      await api(`/api/classes/${encodeURIComponent(classId)}`, { method: "DELETE" });
      notify(`Class ${c.name} deleted.`);
      closeModal("confirmDeleteModal");
      await refreshData();
    } catch (err) {
      notify(`Removal failed: ${err.message}`, "error");
    }
  };
  openModal("confirmDeleteModal");
}
window.confirmDeleteClass = confirmDeleteClass;

// =========================================================================
// 5. ATTENDANCE TRACKER
// =========================================================================
function quickJumpAttendance(classId) {
  state.selectedAttendanceClassId = classId;
  setPage("attendance");
}
window.quickJumpAttendance = quickJumpAttendance;

function renderAttendance() {
  const classSelect = document.getElementById("attClassSelect");
  const dateInput = document.getElementById("attDateInput");

  if (!state.selectedAttendanceClassId && state.classes.length > 0) {
    state.selectedAttendanceClassId = state.classes[0].id;
  }

  // Populate Select
  if (classSelect) {
    classSelect.innerHTML = state.classes.map(c => `
      <option value="${c.id}" ${c.id === state.selectedAttendanceClassId ? "selected" : ""}>
        ${escapeHTML(c.name)} (${escapeHTML(c.course)} · ${escapeHTML(c.teacher)})
      </option>
    `).join("");

    classSelect.onchange = () => {
      state.selectedAttendanceClassId = classSelect.value;
      loadAttendanceDraft();
    };
  }

  if (dateInput) {
    dateInput.value = state.selectedAttendanceDate;
    dateInput.onchange = () => {
      state.selectedAttendanceDate = dateInput.value;
      loadAttendanceDraft();
    };
  }

  loadAttendanceDraft();
}

function loadAttendanceDraft() {
  const classId = state.selectedAttendanceClassId;
  const date = state.selectedAttendanceDate;
  const targetClass = state.classes.find(c => c.id === classId);

  const metaLabel = document.getElementById("attClassMetaLabel");
  if (metaLabel && targetClass) {
    metaLabel.textContent = `${targetClass.name} • ${targetClass.location} • Teacher: ${targetClass.teacher}`;
  }

  // Find if already recorded in server data
  const existingRecord = state.attendance.find(a => a.classId === classId && a.date === date);

  // Initialize draft
  state.activeAttendanceDraft = {};
  state.students.forEach(student => {
    if (existingRecord && Array.isArray(existingRecord.records)) {
      const found = existingRecord.records.find(r => r.studentId === student.id);
      state.activeAttendanceDraft[student.id] = found ? found.status : "Present";
    } else {
      state.activeAttendanceDraft[student.id] = "Present";
    }
  });

  renderAttendanceRoster();
}

function renderAttendanceRoster() {
  const tbody = document.getElementById("attendanceRosterBody");
  if (!tbody) return;

  const total = state.students.length;
  let present = 0;
  let absent = 0;
  let late = 0;

  Object.values(state.activeAttendanceDraft).forEach(status => {
    if (status === "Present") present++;
    if (status === "Late") late++;
    if (status === "Absent") absent++;
  });

  const rate = total > 0 ? (((present + late) / total) * 100).toFixed(1) : 0;

  document.getElementById("attTotalRoster").textContent = total;
  document.getElementById("attPresentCount").textContent = present;
  document.getElementById("attAbsentCount").textContent = absent;
  document.getElementById("attRatePct").textContent = `${rate}%`;

  tbody.innerHTML = state.students.map(s => {
    const currentStatus = state.activeAttendanceDraft[s.id] || "Present";
    return `
      <tr>
        <td>
          <div class="student-col">
            <span class="student-avatar" style="background:${escapeHTML(s.color)}">${escapeHTML(s.initials)}</span>
            <div class="student-meta">
              <strong>${escapeHTML(s.name)}</strong>
              <span>Roll: ${escapeHTML(s.id)}</span>
            </div>
          </div>
        </td>
        <td>${escapeHTML(s.course)}</td>
        <td>
          <strong>${escapeHTML(s.parentName || "Guardian")}</strong>
          <div style="font-size:11px;color:var(--ink-500);">${escapeHTML(s.parentPhone || s.phone)}</div>
        </td>
        <td>
          <div class="att-toggle-group">
            <button class="att-toggle-btn ${currentStatus === "Present" ? "active present" : ""}" onclick="setStudentAttendance('${s.id}', 'Present')">Present</button>
            <button class="att-toggle-btn ${currentStatus === "Late" ? "active late" : ""}" onclick="setStudentAttendance('${s.id}', 'Late')">Late</button>
            <button class="att-toggle-btn ${currentStatus === "Absent" ? "active absent" : ""}" onclick="setStudentAttendance('${s.id}', 'Absent')">Absent</button>
          </div>
        </td>
        <td>
          ${currentStatus === "Absent" ? `<button class="btn btn-sm btn-secondary" onclick="openAbsenteeNotice('${s.id}')">Send SMS</button>` : "—"}
        </td>
      </tr>
    `;
  }).join("");
}

function setStudentAttendance(studentId, status) {
  state.activeAttendanceDraft[studentId] = status;
  renderAttendanceRoster();
}
window.setStudentAttendance = setStudentAttendance;

function markAllPresent() {
  state.students.forEach(s => {
    state.activeAttendanceDraft[s.id] = "Present";
  });
  renderAttendanceRoster();
  notify("All students marked Present.");
}

async function saveAttendanceSheet() {
  const classId = state.selectedAttendanceClassId;
  const date = state.selectedAttendanceDate;
  const records = state.students.map(s => ({
    studentId: s.id,
    studentName: s.name,
    status: state.activeAttendanceDraft[s.id] || "Present"
  }));

  try {
    await api("/api/attendance", {
      method: "POST",
      body: JSON.stringify({
        classId,
        date,
        records
      })
    });
    notify(`Attendance for ${date} saved.`);
    await refreshData();
  } catch (err) {
    notify(`Failed to save attendance: ${err.message}`, "error");
  }
}

function notifyAbsentees() {
  const absentees = state.students.filter(s => state.activeAttendanceDraft[s.id] === "Absent");
  if (!absentees.length) {
    notify("No absentees in today's class.");
    return;
  }
  notify(`SMS & WhatsApp absentee alerts prepared for ${absentees.length} students' guardians.`);
}

function openAbsenteeNotice(studentId) {
  const s = state.students.find(item => item.id === studentId);
  if (!s) return;
  notify(`Absentee notification sent to ${s.parentName || "Parent"} (${s.parentPhone || s.phone}).`);
}
window.openAbsenteeNotice = openAbsenteeNotice;

// =========================================================================
// 6. FEES & PAYMENTS VIEW
// =========================================================================
function renderFees() {
  const search = (document.getElementById("feeSearchInput")?.value || "").toLowerCase();

  // Metrics
  document.getElementById("feesCollectedTotal").textContent = rupees(state.summary.collected);
  document.getElementById("feesOutstandingTotal").textContent = rupees(state.summary.outstanding);
  const overdueCount = state.students.filter(s => s.status === "Overdue" && s.amount > 0).length;
  document.getElementById("feesOverdueTotal").textContent = overdueCount;
  document.getElementById("feesTransactionsTotal").textContent = state.payments.length;
  document.getElementById("feesOwingStudentsCount").textContent = `${state.students.filter(s => s.amount > 0).length} students have balance`;

  const balancesWrap = document.getElementById("feeBalancesWrap");
  const txWrap = document.getElementById("feeTransactionsWrap");

  if (state.feeSubtab === "balances") {
    balancesWrap.style.display = "block";
    txWrap.style.display = "none";

    const filteredStudents = state.students.filter(s => {
      if (!search) return true;
      return [s.name, s.course, s.status].join(" ").toLowerCase().includes(search);
    });

    const tbody = document.getElementById("feeBalancesBody");
    if (tbody) {
      tbody.innerHTML = filteredStudents.length ? filteredStudents.map(s => `
        <tr>
          <td>
            <div class="student-col">
              <span class="student-avatar" style="background:${escapeHTML(s.color)}">${escapeHTML(s.initials)}</span>
              <div class="student-meta">
                <strong>${escapeHTML(s.name)}</strong>
                <span>${escapeHTML(s.email || s.phone)}</span>
              </div>
            </div>
          </td>
          <td>${escapeHTML(s.course)}</td>
          <td>${escapeHTML(s.due)}</td>
          <td><strong>${s.amount ? rupees(s.amount) : "₹0"}</strong></td>
          <td><span class="status-pill status-${s.status.toLowerCase()}">${escapeHTML(s.status)}</span></td>
          <td>
            ${s.amount > 0
          ? `<button class="btn btn-sm btn-primary" onclick="openPaymentModal('${s.id}')">Record Payment</button>`
          : `<button class="btn btn-sm btn-secondary" onclick="viewStudentLatestReceipt('${s.id}')">Receipt</button>`
        }
          </td>
        </tr>
      `).join("") : `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--ink-400);">No records found.</td></tr>`;
    }
  } else {
    balancesWrap.style.display = "none";
    txWrap.style.display = "block";

    const filteredPayments = [...state.payments].reverse().filter(p => {
      if (!search) return true;
      return [p.receipt, p.student, p.method, p.date].join(" ").toLowerCase().includes(search);
    });

    const tbody = document.getElementById("feeTransactionsBody");
    if (tbody) {
      tbody.innerHTML = filteredPayments.length ? filteredPayments.map(p => `
        <tr>
          <td><strong>${escapeHTML(p.receipt)}</strong></td>
          <td>${escapeHTML(p.student)}</td>
          <td>${escapeHTML(p.course || "Coaching Course")}</td>
          <td>${escapeHTML(p.date)}</td>
          <td><span class="tag-pill">${escapeHTML(p.method)}</span></td>
          <td><strong style="color:var(--success);">${rupees(p.amount)}</strong></td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="viewReceiptByData('${encodeURIComponent(JSON.stringify(p))}')">View Receipt</button>
          </td>
        </tr>
      `).join("") : `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--ink-400);">No transactions found.</td></tr>`;
    }
  }
}

// Payment Modal
function openPaymentModal(studentId = null) {
  const form = document.getElementById("paymentForm");
  form.reset();
  document.getElementById("payFormError").classList.remove("show");

  const select = document.getElementById("payStudentSelect");
  const owingStudents = state.students.filter(s => s.amount > 0);

  if (!owingStudents.length) {
    select.innerHTML = state.students.map(s => `<option value="${s.id}">${escapeHTML(s.name)} (Cleared)</option>`).join("");
  } else {
    select.innerHTML = owingStudents.map(s => `
      <option value="${s.id}">${escapeHTML(s.name)} &bull; ${escapeHTML(s.course)} (${rupees(s.amount)} due)</option>
    `).join("");
  }

  if (studentId) {
    select.value = studentId;
  }

  const selected = state.students.find(s => s.id === select.value);
  const amountInput = document.getElementById("payAmountInput");
  amountInput.value = selected && selected.amount > 0 ? selected.amount : 4500;
  amountInput.max = selected && selected.amount > 0 ? selected.amount : "";

  select.onchange = () => {
    const cur = state.students.find(s => s.id === select.value);
    amountInput.value = cur && cur.amount > 0 ? cur.amount : "";
    amountInput.max = cur && cur.amount > 0 ? cur.amount : "";
  };

  document.getElementById("payDateInput").value = new Date().toISOString().slice(0, 10);
  openModal("paymentModal");
}
window.openPaymentModal = openPaymentModal;

async function handlePaymentSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById("payFormError");
  errEl.classList.remove("show");

  const studentId = document.getElementById("payStudentSelect").value;
  const amount = Number(document.getElementById("payAmountInput").value);
  const method = document.getElementById("payMethodSelect").value;
  const date = document.getElementById("payDateInput").value;
  const note = document.getElementById("payNoteInput").value.trim();

  try {
    const res = await api("/api/payments", {
      method: "POST",
      body: JSON.stringify({
        studentId,
        amount,
        method,
        date,
        note
      })
    });
    closeModal("paymentModal");
    notify(`Payment of ${rupees(amount)} recorded for ${res.payment.student}.`);
    await refreshData();
    // Open receipt modal directly!
    showReceiptModal(res.payment);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add("show");
  }
}

// Receipt Modal display
function showReceiptModal(payment) {
  document.getElementById("rcptNumber").textContent = payment.receipt;
  document.getElementById("rcptStudent").textContent = payment.student;
  document.getElementById("rcptCourse").textContent = payment.course || "Coaching Course";
  document.getElementById("rcptDate").textContent = payment.date;
  document.getElementById("rcptMethod").textContent = payment.method;
  document.getElementById("rcptAmountTable").textContent = rupees(payment.amount);
  document.getElementById("rcptTotalAmount").textContent = rupees(payment.amount);
  document.getElementById("rcptCollector").textContent = payment.collectedBy || "Alex Morgan";

  openModal("receiptModal");
}

function viewReceiptByData(encodedPaymentJson) {
  try {
    const payment = JSON.parse(decodeURIComponent(encodedPaymentJson));
    showReceiptModal(payment);
  } catch (err) {
    console.error("Receipt parsing error:", err);
  }
}
window.viewReceiptByData = viewReceiptByData;

function viewStudentLatestReceipt(studentId) {
  const payment = [...state.payments].reverse().find(p => p.studentId === studentId);
  if (payment) {
    showReceiptModal(payment);
  } else {
    notify("No recorded payment receipt found for this student.", "error");
  }
}
window.viewStudentLatestReceipt = viewStudentLatestReceipt;

// Print Receipt
function printReceipt() {
  window.print();
}

// =========================================================================
// MULTI-ROLE AUTHENTICATION (ADMIN / TEACHER / STUDENT)
// =========================================================================
function formatRole(r) {
  if (!r) return "Admin";
  return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
}

function getFirstName(fullName) {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 1 && /^(dr\.?|mr\.?|mrs\.?|ms\.?|prof\.?)$/i.test(parts[0])) {
    return parts[1];
  }
  return parts[0];
}

function updateUserUI() {
  const u = state.currentUser || { role: "admin", name: "Alex Morgan", initials: "AM", title: "Admin" };
  const role = (u.role || "admin").toLowerCase();
  const displayRole = formatRole(role);

  // Topbar Profile (First Name Only)
  const topName = document.getElementById("topUserName");
  const topRole = document.getElementById("topUserRole");
  const topAvatar = document.getElementById("topUserAvatar");
  const firstName = getFirstName(u.name);
  if (topName) topName.textContent = firstName || u.name;
  if (topRole) topRole.textContent = displayRole;
  if (topAvatar) {
    if (u.avatar) {
      topAvatar.innerHTML = `<img src="${escapeHTML(u.avatar)}" alt="${escapeHTML(u.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      topAvatar.textContent = u.initials || "AM";
      topAvatar.style.background = u.color || "var(--primary)";
    }
  }

  // Sidebar Footer
  const sideName = document.getElementById("sidebarUserName");
  const sideRole = document.getElementById("sidebarUserRole");
  const sideAvatar = document.getElementById("sidebarUserAvatar");
  if (sideName) sideName.textContent = u.name;
  if (sideRole) sideRole.textContent = `${displayRole} • ${u.class || u.qualification || "Divine Coaching"}`;
  if (sideAvatar) {
    if (u.avatar) {
      sideAvatar.innerHTML = `<img src="${escapeHTML(u.avatar)}" alt="${escapeHTML(u.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      sideAvatar.textContent = u.initials || "AM";
      sideAvatar.style.background = u.color || "var(--primary)";
    }
  }

  // Dynamic Workspace Heading
  const navHeading = document.getElementById("sidebarNavHeading");
  if (navHeading) {
    if (role === "admin") {
      navHeading.textContent = "Admin Workspace";
    } else if (role === "teacher") {
      navHeading.textContent = "Faculty Workspace";
    } else if (role === "student") {
      navHeading.textContent = "Student Workspace";
    }
  }

  // Role-Based Navigation Links Visibility
  // ADMIN: Sees EVERYTHING (all 9 workspace sections)
  // TEACHER: Sees My Faculty Hub, Classes & Timetable, Attendance, and Students Roster
  // STUDENT: Sees My Student Portal, My Timetable, and My Attendance
  const navDashboard = document.getElementById("nav-dashboard");
  const navStudents = document.getElementById("nav-students");
  const navTeachers = document.getElementById("nav-teachers");
  const navClasses = document.getElementById("nav-classes");
  const navAttendance = document.getElementById("nav-attendance");
  const navFees = document.getElementById("nav-fees");
  const navReports = document.getElementById("nav-reports");
  const navTeacher = document.getElementById("nav-teacher-portal");
  const navStudent = document.getElementById("nav-student-portal");

  const setNavLabel = (btn, text) => {
    if (!btn) return;
    const span = btn.querySelector("span:not(.nav-badge)");
    if (span) span.textContent = text;
  };

  if (role === "admin") {
    // Admin sees everything
    if (navDashboard) navDashboard.style.display = "flex";
    if (navStudents) navStudents.style.display = "flex";
    if (navTeachers) navTeachers.style.display = "flex";
    if (navClasses) navClasses.style.display = "flex";
    if (navAttendance) navAttendance.style.display = "flex";
    if (navFees) navFees.style.display = "flex";
    if (navReports) navReports.style.display = "flex";
    if (navTeacher) {
      navTeacher.style.display = "flex";
      setNavLabel(navTeacher, "Faculty Hub");
    }
    if (navStudent) {
      navStudent.style.display = "flex";
      setNavLabel(navStudent, "Student Portal");
    }
    setNavLabel(navStudents, "Students");
    setNavLabel(navClasses, "Classes & Timetable");
    setNavLabel(navAttendance, "Attendance");
  } else if (role === "teacher") {
    // Teacher navigation
    if (navDashboard) navDashboard.style.display = "none";
    if (navTeachers) navTeachers.style.display = "none";
    if (navFees) navFees.style.display = "none";
    if (navReports) navReports.style.display = "none";
    if (navStudent) navStudent.style.display = "none";

    if (navTeacher) {
      navTeacher.style.display = "flex";
      setNavLabel(navTeacher, "My Faculty Hub");
    }
    if (navClasses) {
      navClasses.style.display = "flex";
      setNavLabel(navClasses, "Classes & Timetable");
    }
    if (navAttendance) {
      navAttendance.style.display = "flex";
      setNavLabel(navAttendance, "Mark Attendance");
    }
    if (navStudents) {
      navStudents.style.display = "flex";
      setNavLabel(navStudents, "Students Roster");
    }
  } else if (role === "student") {
    // Student navigation
    if (navDashboard) navDashboard.style.display = "none";
    if (navStudents) navStudents.style.display = "none";
    if (navTeachers) navTeachers.style.display = "none";
    if (navFees) navFees.style.display = "none";
    if (navReports) navReports.style.display = "none";
    if (navTeacher) navTeacher.style.display = "none";

    if (navStudent) {
      navStudent.style.display = "flex";
      setNavLabel(navStudent, "My Student Portal");
    }
    if (navClasses) {
      navClasses.style.display = "flex";
      setNavLabel(navClasses, "My Timetable");
    }
    if (navAttendance) {
      navAttendance.style.display = "flex";
      setNavLabel(navAttendance, "My Attendance");
    }
  }

  // Topbar and quick action permissions
  const topRecordPayBtn = document.getElementById("topRecordPaymentBtn");
  if (topRecordPayBtn) {
    topRecordPayBtn.style.display = role === "admin" ? "inline-flex" : "none";
  }

  const addStudentBtn = document.getElementById("addStudentBtn");
  if (addStudentBtn) {
    addStudentBtn.style.display = role === "admin" ? "inline-flex" : "none";
  }

  const addTeacherBtn = document.getElementById("addTeacherBtn");
  if (addTeacherBtn) {
    addTeacherBtn.style.display = role === "admin" ? "inline-flex" : "none";
  }

  const addClassBtn = document.getElementById("addClassBtn");
  if (addClassBtn) {
    addClassBtn.style.display = role === "admin" ? "inline-flex" : "none";
  }

  const markAllBtn = document.getElementById("markAllPresentBtn");
  const saveAttBtn = document.getElementById("saveAttendanceBtn");
  const notifyAbsBtn = document.getElementById("notifyAbsenteesBtn");
  if (markAllBtn) markAllBtn.style.display = role === "student" ? "none" : "inline-flex";
  if (saveAttBtn) saveAttBtn.style.display = role === "student" ? "none" : "inline-flex";
  if (notifyAbsBtn) notifyAbsBtn.style.display = role === "student" ? "none" : "inline-flex";

  updateMobileBottomNav();
}

// Mobile Bottom Navigation Bar Controller
function updateMobileBottomNav() {
  const role = (state.currentUser?.role || "admin").toLowerCase();
  const navWrap = document.getElementById("mobileBottomNav");
  if (!navWrap) return;

  if (role === "teacher") {
    navWrap.innerHTML = `
      <button class="bottom-nav-item" data-bottom-page="teacher-portal" id="bnav-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
        <span>Faculty Hub</span>
      </button>
      <button class="bottom-nav-item" data-bottom-page="classes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>Classes</span>
      </button>
      <button class="bottom-nav-item" data-bottom-page="attendance">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <span>Attendance</span>
      </button>
      <button class="bottom-nav-item" data-bottom-page="students">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>Students</span>
      </button>
      <button class="bottom-nav-item" id="bnav-menu" title="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span>Menu</span>
      </button>
    `;
  } else if (role === "student") {
    navWrap.innerHTML = `
      <button class="bottom-nav-item" data-bottom-page="student-portal" id="bnav-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <span>My Portal</span>
      </button>
      <button class="bottom-nav-item" data-bottom-page="classes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>Timetable</span>
      </button>
      <button class="bottom-nav-item" data-bottom-page="attendance">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <span>Attendance</span>
      </button>
      <button class="bottom-nav-item" data-bottom-page="gallery">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Campus</span>
      </button>
      <button class="bottom-nav-item" id="bnav-menu" title="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span>Menu</span>
      </button>
    `;
  } else {
    // Admin
    navWrap.innerHTML = `
      <button class="bottom-nav-item" data-bottom-page="dashboard" id="bnav-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="9" rx="1.5"/>
          <rect x="14" y="3" width="7" height="5" rx="1.5"/>
          <rect x="14" y="12" width="7" height="9" rx="1.5"/>
          <rect x="3" y="16" width="7" height="5" rx="1.5"/>
        </svg>
        <span>Overview</span>
      </button>
      <button class="bottom-nav-item" data-bottom-page="students">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>Students</span>
      </button>
      <button class="bottom-nav-item" data-bottom-page="classes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>Classes</span>
      </button>
      <button class="bottom-nav-item" data-bottom-page="fees">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        <span>Fees</span>
      </button>
      <button class="bottom-nav-item" id="bnav-menu" title="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span>Menu</span>
      </button>
    `;
  }

  // Bind clicks
  navWrap.querySelectorAll("[data-bottom-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      setPage(btn.dataset.bottomPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  navWrap.querySelector("#bnav-menu")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("open");
    document.getElementById("drawerOverlay")?.classList.toggle("open");
  });

  // Highlight active
  navWrap.querySelectorAll(".bottom-nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.bottomPage === state.activePage);
  });
}

function openLoginModal(targetRole = "admin") {
  const roleTabs = document.querySelectorAll("#loginRoleTabs .tab-btn");
  roleTabs.forEach(tab => {
    tab.classList.toggle("active", tab.dataset.loginRole === targetRole);
  });

  const hiddenRole = document.getElementById("loginActiveRole");
  if (hiddenRole) hiddenRole.value = targetRole;

  updateLoginRoleUI(targetRole);
  document.getElementById("loginError")?.classList.remove("show");
  openModal("loginModal");
}
window.openLoginModal = openLoginModal;

function updateLoginRoleUI(role) {
  const roleDesc = document.getElementById("loginRoleDesc");
  const usernameLabel = document.getElementById("loginUsernameLabel");
  const usernameInput = document.getElementById("loginUsername");
  const passwordInput = document.getElementById("loginPassword");
  const demoChipsContainer = document.getElementById("loginDemoChips");

  const descs = {
    admin: "<strong>👑 Admin Access (Full System):</strong> Sees all 9 workspaces in navbar — Overview, Students, Faculty, Classes & Timetable, Attendance, Fees & Ledger, Reports & Analytics, and Portals.",
    teacher: "<strong>👩‍🏫 Teacher Access:</strong> Visible Navbar — My Faculty Hub, Classes & Timetable, Attendance, and Students Roster. (Admin ledgers & financial stats hidden).",
    student: "<strong>🎓 Student Access:</strong> Visible Navbar — My Student Portal (profile, school, address, fee dues, verified receipts), My Timetable, and Attendance. (Sensitive academy records hidden)."
  };

  const labels = {
    admin: "Admin Username or Name",
    teacher: "Teacher / Faculty Name or Email",
    student: "Student Full Name, Email, or Phone"
  };

  if (roleDesc) roleDesc.innerHTML = descs[role] || descs.admin;
  if (usernameLabel) usernameLabel.textContent = labels[role] || labels.admin;

  // Demo accounts per role
  let demos = [];
  if (role === "admin") {
    demos = [
      { label: "👑 Alex Morgan (Admin)", user: "admin", pass: "admin123" }
    ];
  } else if (role === "teacher") {
    demos = [
      { label: "👩‍🏫 Dr. Priya Menon", user: "Dr. Priya Menon", pass: "teacher123" },
      { label: "👨‍🏫 Rahul Desai", user: "Rahul Desai", pass: "teacher123" },
      { label: "👩‍🏫 Nisha Rao", user: "Nisha Rao", pass: "teacher123" }
    ];
  } else {
    demos = [
      { label: "🎓 Riya Sharma (Class 12)", user: "Riya Sharma", pass: "student123" },
      { label: "🎓 Arjun Patel (Class 12)", user: "Arjun Patel", pass: "student123" },
      { label: "🎓 Meera Nair (Class 11)", user: "Meera Nair", pass: "student123" }
    ];
  }

  if (demoChipsContainer) {
    demoChipsContainer.innerHTML = demos.map(d => `
      <button type="button" class="demo-chip" onclick="autofillLogin('${escapeHTML(d.user)}', '${escapeHTML(d.pass)}')">
        <span>${escapeHTML(d.label)}</span>
      </button>
    `).join("");
  }

  // Pre-fill default
  if (demos[0] && usernameInput && passwordInput) {
    usernameInput.value = demos[0].user;
    passwordInput.value = demos[0].pass;
  }
}

function autofillLogin(user, pass) {
  const usernameInput = document.getElementById("loginUsername");
  const passwordInput = document.getElementById("loginPassword");
  if (usernameInput) usernameInput.value = user;
  if (passwordInput) passwordInput.value = pass;
}
window.autofillLogin = autofillLogin;

async function handleLoginSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById("loginError");
  errEl.classList.remove("show");

  const role = document.getElementById("loginActiveRole")?.value || "admin";
  const username = document.getElementById("loginUsername")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  try {
    const res = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ role, username, password })
    });

    state.currentUser = res.user;
    localStorage.setItem("northstar_user", JSON.stringify(res.user));
    updateUserUI();
    closeModal("loginModal");
    notify(`Signed in as ${res.user.name} (${formatRole(res.user.role)})`);

    // Jump to role portal
    if (res.user.role === "student") {
      setPage("student-portal");
    } else if (res.user.role === "teacher") {
      setPage("teacher-portal");
    } else {
      setPage("dashboard");
    }
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add("show");
  }
}

function logout() {
  localStorage.removeItem("northstar_user");
  state.currentUser = {
    role: "admin",
    name: "Alex Morgan",
    email: "admin@northstar.edu",
    initials: "AM",
    color: "#4f46e5",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    title: "Center Director & Admin"
  };
  updateUserUI();
  notify("Switched to Admin workspace.");
  setPage("dashboard");
}
window.logout = logout;


// =========================================================================
// TEACHER FACULTY PORTAL RENDERER
// =========================================================================
function renderTeacherPortal() {
  const currentUser = state.currentUser;
  let teacher = null;
  if (currentUser && currentUser.role === "teacher") {
    teacher = state.teachers.find(t => t.id === currentUser.id || t.name === currentUser.name) || currentUser;
  } else {
    teacher = state.teachers[0] || currentUser;
  }

  if (!teacher) return;

  const tpName = document.getElementById("tpName");
  const tpStatus = document.getElementById("tpStatus");
  const tpQual = document.getElementById("tpQualification");
  const tpSubjects = document.getElementById("tpSubjectsTags");
  const tpPhone = document.getElementById("tpPhone");
  const tpEmail = document.getElementById("tpEmail");
  const tpAvail = document.getElementById("tpAvailability");
  const tpAvatarImg = document.getElementById("tpAvatarImg");
  const tpAvatarInitials = document.getElementById("tpAvatarInitials");

  if (tpName) tpName.textContent = teacher.name;
  if (tpStatus) tpStatus.textContent = teacher.status || "Active Faculty";
  if (tpQual) tpQual.textContent = teacher.qualification || "Faculty Member";
  if (tpPhone) tpPhone.textContent = teacher.phone || "+91 90000 00001";
  if (tpEmail) tpEmail.textContent = teacher.email || "faculty@northstar.edu";
  if (tpAvail) tpAvail.textContent = teacher.availability || "Mon–Sat";

  if (tpSubjects && teacher.subjects) {
    tpSubjects.innerHTML = teacher.subjects.map(sub => `<span class="tag-pill">${escapeHTML(sub)}</span>`).join("");
  }

  // Round Avatar Display
  if (tpAvatarImg && tpAvatarInitials) {
    if (teacher.avatar) {
      tpAvatarImg.src = teacher.avatar;
      tpAvatarImg.style.display = "block";
      tpAvatarInitials.style.display = "none";
    } else {
      tpAvatarImg.style.display = "none";
      tpAvatarInitials.style.display = "block";
      tpAvatarInitials.textContent = teacher.initials || "TC";
    }
  }

  // Assigned classes
  const assigned = state.classes.filter(c => c.teacher === teacher.name);
  const classCountEl = document.getElementById("tpClassCount");
  if (classCountEl) classCountEl.textContent = `${assigned.length} assigned ${assigned.length === 1 ? "class" : "classes"}`;

  const classesList = document.getElementById("tpClassesList");
  if (classesList) {
    classesList.innerHTML = assigned.length ? assigned.map(cls => `
      <div class="session-row">
        <div class="session-time">${escapeHTML(cls.time)}</div>
        <div class="session-indicator ${cls.live ? "live" : ""}"></div>
        <div class="session-content">
          <div class="session-title">
            <strong>${escapeHTML(cls.name)}</strong>
            ${cls.live ? '<span class="live-chip">LIVE</span>' : ""}
          </div>
          <div class="session-meta">
            <span>${escapeHTML(cls.course)}</span>
            <span>&bull;</span>
            <span>${escapeHTML(cls.location)}</span>
            <span>&bull;</span>
            <span>${cls.students} students enrolled</span>
          </div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="quickJumpAttendance('${cls.id}')">Mark Attendance</button>
      </div>
    `).join("") : `<div style="padding:20px;text-align:center;color:var(--ink-400);">No batches currently assigned.</div>`;
  }

  // Enrolled students in teacher's subject
  const enrolledStudents = state.students.filter(s => {
    return (teacher.subjects || []).some(sub => (s.course || "").toLowerCase().includes(sub.toLowerCase())) || true;
  }).slice(0, 8);

  const tbody = document.getElementById("tpStudentsTableBody");
  if (tbody) {
    tbody.innerHTML = enrolledStudents.map(s => `
      <tr>
        <td>
          <div class="student-col">
            ${getAvatarHTML(s, 32)}
            <div class="student-meta">
              <strong>${escapeHTML(s.name)}</strong>
              <span>${escapeHTML(s.email)}</span>
            </div>
          </div>
        </td>
        <td><span class="tag-pill">${escapeHTML(s.class || "Class 12")}</span></td>
        <td>${escapeHTML(s.course)}</td>
        <td><a href="tel:${escapeHTML(s.phone)}" class="contact-pill">📱 ${escapeHTML(s.phone)}</a></td>
      </tr>
    `).join("");
  }
}


// =========================================================================
// STUDENT PERSONAL PORTAL RENDERER
// =========================================================================
function renderStudentPortal() {
  const currentUser = state.currentUser;
  let student = null;
  if (currentUser && currentUser.role === "student") {
    student = state.students.find(s => s.id === currentUser.id || s.name === currentUser.name) || currentUser;
  } else {
    student = state.students[0] || currentUser;
  }

  if (!student) return;

  const spName = document.getElementById("spName");
  const spClass = document.getElementById("spClassBadge");
  const spStatus = document.getElementById("spFeeStatusPill");
  const spCourse = document.getElementById("spCourse");
  const spAddress = document.getElementById("spAddress");
  const spPhone = document.getElementById("spPhone");
  const spEmail = document.getElementById("spEmail");
  const spGuardian = document.getElementById("spGuardian");
  const spAvatarImg = document.getElementById("spAvatarImg");
  const spAvatarInitials = document.getElementById("spAvatarInitials");

  if (spName) spName.textContent = student.name;
  if (spClass) spClass.textContent = student.class || "Class 12";
  const spSchool = document.getElementById("spSchool");
  if (spSchool) spSchool.textContent = student.school || "Delhi Public School";
  if (spCourse) spCourse.textContent = student.course || "Senior Secondary Coaching";
  if (spAddress) spAddress.textContent = student.address || "Mumbai, Maharashtra";
  if (spPhone) spPhone.textContent = student.phone || "+91 98200 00000";
  if (spEmail) spEmail.textContent = student.email || "student@example.com";
  if (spGuardian) spGuardian.textContent = `${student.parentName || "Guardian"} (${student.parentPhone || student.phone || "—"})`;

  if (spStatus) {
    spStatus.className = `status-pill status-${(student.status || "paid").toLowerCase()}`;
    spStatus.textContent = student.status || "Paid";
  }

  // Round Avatar
  if (spAvatarImg && spAvatarInitials) {
    if (student.avatar) {
      spAvatarImg.src = student.avatar;
      spAvatarImg.style.display = "block";
      spAvatarInitials.style.display = "none";
    } else {
      spAvatarImg.style.display = "none";
      spAvatarInitials.style.display = "block";
      spAvatarInitials.textContent = student.initials || "ST";
    }
  }

  // Financial figures
  const pendingEl = document.getElementById("spPendingAmount");
  const dueEl = document.getElementById("spDueDateText");
  const paidEl = document.getElementById("spPaidAmount");
  const totalEl = document.getElementById("spTotalFee");

  const totalFee = student.totalFee || 45000;
  const balance = Number(student.amount) || 0;
  const paidToDate = Math.max(0, totalFee - balance);

  if (pendingEl) pendingEl.textContent = rupees(balance);
  if (dueEl) dueEl.textContent = balance > 0 ? `Next Due Date: ${student.due}` : "All dues settled";
  if (paidEl) paidEl.textContent = rupees(paidToDate);
  if (totalEl) totalEl.textContent = rupees(totalFee);

  // Pay button
  const payBtn = document.getElementById("spPayNowBtn");
  if (payBtn) {
    payBtn.style.display = balance > 0 ? "inline-flex" : "none";
    payBtn.onclick = () => openPaymentModal(student.id);
  }

  // Schedule list
  const scheduleList = document.getElementById("spScheduleList");
  if (scheduleList) {
    const relevantClasses = state.classes.filter(c => {
      const courseSub = (student.course || "").split("·")[0].trim().toLowerCase();
      return (c.name || "").toLowerCase().includes(courseSub) || (c.course || "").toLowerCase().includes((student.class || "").toLowerCase());
    });

    const activeList = relevantClasses.length ? relevantClasses : state.classes.slice(0, 3);
    scheduleList.innerHTML = activeList.map(cls => `
      <div class="session-row">
        <div class="session-time">${escapeHTML(cls.time)}</div>
        <div class="session-indicator ${cls.live ? "live" : ""}"></div>
        <div class="session-content">
          <div class="session-title">
            <strong>${escapeHTML(cls.name)}</strong>
            ${cls.live ? '<span class="live-chip">LIVE NOW</span>' : ""}
          </div>
          <div class="session-meta">
            <span>Faculty: ${escapeHTML(cls.teacher)}</span>
            <span>&bull;</span>
            <span>${escapeHTML(cls.location)}</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  // Payment receipts
  const receiptsList = document.getElementById("spReceiptsList");
  if (receiptsList) {
    const myPayments = state.payments.filter(p => p.studentId === student.id || p.student === student.name);
    receiptsList.innerHTML = myPayments.length ? myPayments.map(p => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-md);font-size:13px;">
        <div>
          <strong style="color:var(--ink-900);">${escapeHTML(p.receipt)}</strong>
          <div style="font-size:11px;color:var(--ink-500);margin-top:2px;">${escapeHTML(p.date)} &bull; Mode: ${escapeHTML(p.method)}</div>
        </div>
        <div style="text-align:right;">
          <strong style="color:var(--success);font-size:14px;">${rupees(p.amount)}</strong>
          <button class="btn btn-sm btn-secondary" style="margin-top:4px;display:block;" onclick="viewReceiptByData('${encodeURIComponent(JSON.stringify(p))}')">📄 View Receipt</button>
        </div>
      </div>
    `).join("") : `
      <div style="padding:20px;text-align:center;background:var(--bg-card-subtle);border-radius:var(--radius-md);color:var(--ink-500);font-size:13px;">
        No fee payment receipts recorded yet for this session.
      </div>
    `;
  }
}


// =========================================================================
// FEE REMINDERS VIA WHATSAPP & SMS MODAL
// =========================================================================
function openFeeReminderModal(studentId) {
  const s = state.students.find(item => item.id === studentId);
  if (!s) return;

  document.getElementById("remindStudentId").value = s.id;
  document.getElementById("remindStudentName").textContent = `${s.name} (${s.class || "Class 12"})`;
  document.getElementById("remindStudentCourse").textContent = s.course;
  document.getElementById("remindStudentAmount").textContent = rupees(s.amount);
  document.getElementById("remindStudentDueDate").textContent = `Due Date: ${s.due}`;

  const statusEl = document.getElementById("remindStudentStatus");
  if (statusEl) {
    statusEl.className = `status-pill status-${s.status.toLowerCase()}`;
    statusEl.textContent = s.status;
  }

  // Populate recipient selector
  const contactSelect = document.getElementById("remindContactSelect");
  if (contactSelect) {
    contactSelect.innerHTML = `
      <option value="${escapeHTML(s.phone)}">📱 Student Phone: ${escapeHTML(s.phone)}</option>
      <option value="${escapeHTML(s.parentPhone || s.phone)}">👨‍👩‍👧 Parent Phone: ${escapeHTML(s.parentPhone || s.phone)}</option>
    `;
  }

  // Prefill personalized professional message template
  const messageBox = document.getElementById("remindMessageText");
  const template = `Dear ${s.name} (${s.class || "Class 12"}),\n\nGreetings from Divine Coaching. This is a payment reminder for your tuition fee installment of ${rupees(s.amount)} for ${s.course}, due on ${s.due}.\n\nKindly complete the payment via UPI or at our center admissions desk.\n\nHelpline: +91 90000 00000\nThank you!\nDivine Coaching Admin`;
  if (messageBox) messageBox.value = template;

  // Last sent text
  const lastSentEl = document.getElementById("remindLastSentText");
  if (lastSentEl) {
    lastSentEl.innerHTML = `<span>🕒 Last sent: ${s.lastRemindedAt ? escapeHTML(s.lastRemindedAt) : "Not yet dispatched"}</span>`;
  }

  // Bind Buttons
  const sendWhatsAppBtn = document.getElementById("sendReminderWhatsAppBtn");
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.onclick = async () => {
      const phone = contactSelect ? contactSelect.value : s.phone;
      const cleanDigits = phone.replace(/\D/g, "");
      const msg = messageBox ? messageBox.value : template;
      const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");

      // Log as sent on backend
      try {
        const res = await api("/api/reminders", {
          method: "POST",
          body: JSON.stringify({ studentId: s.id, phone, method: "whatsapp", message: msg })
        });
        s.lastRemindedAt = res.lastRemindedAt;
        notify(`WhatsApp reminder opened & logged for ${s.name}.`);
        closeModal("feeReminderModal");
        await refreshData();
      } catch (err) {
        notify(`Logged reminder: ${err.message}`, "info");
      }
    };
  }

  const sendSmsBtn = document.getElementById("sendReminderSmsBtn");
  if (sendSmsBtn) {
    sendSmsBtn.onclick = async () => {
      const phone = contactSelect ? contactSelect.value : s.phone;
      const cleanDigits = phone.replace(/\D/g, "");
      const msg = messageBox ? messageBox.value : template;
      window.location.href = `sms:${cleanDigits}?body=${encodeURIComponent(msg)}`;

      try {
        const res = await api("/api/reminders", {
          method: "POST",
          body: JSON.stringify({ studentId: s.id, phone, method: "sms", message: msg })
        });
        s.lastRemindedAt = res.lastRemindedAt;
        notify(`SMS reminder queued & logged for ${s.name}.`);
        closeModal("feeReminderModal");
        await refreshData();
      } catch (err) {
        console.error(err);
      }
    };
  }

  const copyTextBtn = document.getElementById("copyReminderTextBtn");
  if (copyTextBtn) {
    copyTextBtn.onclick = () => {
      const msg = messageBox ? messageBox.value : template;
      navigator.clipboard.writeText(msg).then(() => {
        notify("Reminder message copied to clipboard.");
      });
    };
  }

  const logBtn = document.getElementById("markReminderLoggedBtn");
  if (logBtn) {
    logBtn.onclick = async () => {
      const phone = contactSelect ? contactSelect.value : s.phone;
      const msg = messageBox ? messageBox.value : template;
      try {
        const res = await api("/api/reminders", {
          method: "POST",
          body: JSON.stringify({ studentId: s.id, phone, method: "direct", message: msg })
        });
        s.lastRemindedAt = res.lastRemindedAt;
        notify(`Payment reminder marked as sent for ${s.name}.`);
        closeModal("feeReminderModal");
        await refreshData();
      } catch (err) {
        notify(err.message, "error");
      }
    };
  }

  openModal("feeReminderModal");
}
window.openFeeReminderModal = openFeeReminderModal;
window.openReminderPrompt = openFeeReminderModal;

// Broadcast Reminders Modal
function openBatchRemindersModal() {
  const owing = state.students.filter(s => s.amount > 0);
  const totalOwing = owing.reduce((sum, s) => sum + s.amount, 0);

  const summaryEl = document.getElementById("batchOwingSummary");
  if (summaryEl) {
    summaryEl.textContent = `${owing.length} students with outstanding dues (${rupees(totalOwing)} total balance)`;
  }

  const tbody = document.getElementById("batchRemindersTableBody");
  if (tbody) {
    tbody.innerHTML = owing.map(s => `
      <tr>
        <td>
          <div class="student-col">
            ${getAvatarHTML(s, 28)}
            <strong>${escapeHTML(s.name)}</strong>
          </div>
        </td>
        <td><span class="tag-pill">${escapeHTML(s.class || "Class 12")}</span></td>
        <td><a href="tel:${escapeHTML(s.phone)}" class="contact-pill">📱 ${escapeHTML(s.phone)}</a></td>
        <td><a href="tel:${escapeHTML(s.parentPhone || s.phone)}" class="contact-pill">👨‍👩‍👧 ${escapeHTML(s.parentPhone || s.phone)}</a></td>
        <td><strong style="color:var(--danger-text);">${rupees(s.amount)}</strong></td>
        <td>
          <button class="btn btn-sm btn-whatsapp" onclick="closeModal('batchRemindersModal');openFeeReminderModal('${s.id}')">💬 Remind</button>
        </td>
      </tr>
    `).join("");
  }

  const copyPhonesBtn = document.getElementById("copyAllPhonesBtn");
  if (copyPhonesBtn) {
    copyPhonesBtn.onclick = () => {
      const numbers = [...new Set(owing.map(s => s.phone).concat(owing.map(s => s.parentPhone)).filter(Boolean))];
      navigator.clipboard.writeText(numbers.join(", ")).then(() => {
        notify(`Copied ${numbers.length} phone numbers to clipboard.`);
      });
    };
  }

  const broadcastBtn = document.getElementById("broadcastAllRemindersBtn");
  if (broadcastBtn) {
    broadcastBtn.onclick = async () => {
      try {
        const res = await api("/api/reminders/batch", { method: "POST" });
        notify(`Batch reminder sent to all ${res.count} students!`);
        closeModal("batchRemindersModal");
        await refreshData();
      } catch (err) {
        notify(`Batch error: ${err.message}`, "error");
      }
    };
  }

  openModal("batchRemindersModal");
}
window.blastReminders = openBatchRemindersModal;

// =========================================================================
// SHARE WEB APPLICATION VIA WHATSAPP (DIRECT MOBILE NUMBER)
// =========================================================================
const APP_SHARE_URL = "https://divinecoach.netlify.app/";

function getShareTemplateMessage(appUrl = APP_SHARE_URL) {
  return `Hello! 🌟\n\nHere is the link to access the Divine Coaching Portal:\n${appUrl}\n\nOpen this link to check class timetables, attendance records, study materials, and fee receipts directly on your phone or computer.\n\nSupport Helpline: +91 90000 00000\nDivine Coaching Admin`;
}

function openShareAppModal() {
  const modal = document.getElementById("shareAppModal");
  if (!modal) return;

  const urlInput = document.getElementById("shareAppLinkInput");
  if (urlInput) {
    urlInput.value = APP_SHARE_URL;
  }

  const phoneInput = document.getElementById("sharePhoneNumber");
  if (phoneInput) {
    phoneInput.value = "";
    setTimeout(() => phoneInput.focus(), 80);
  }

  const msgBox = document.getElementById("shareMessageText");
  if (msgBox) {
    msgBox.value = getShareTemplateMessage(APP_SHARE_URL);
  }

  openModal("shareAppModal");
}

function getSanitizedPhone(raw) {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  // If 10 digits (domestic Indian mobile), prepend 91
  if (digits.length === 10) {
    digits = "91" + digits;
  }
  return digits;
}

function sendShareViaWhatsApp() {
  const phoneInput = document.getElementById("sharePhoneNumber");
  const msgBox = document.getElementById("shareMessageText");

  const rawPhone = phoneInput ? phoneInput.value.trim() : "";
  if (!rawPhone) {
    notify("Please enter a mobile number to share.", "error");
    phoneInput?.focus();
    return;
  }

  const cleanDigits = getSanitizedPhone(rawPhone);
  if (!cleanDigits || cleanDigits.length < 10) {
    notify("Please enter a valid 10-digit mobile number.", "error");
    phoneInput?.focus();
    return;
  }

  const msg = msgBox ? msgBox.value.trim() : getShareTemplateMessage(APP_SHARE_URL);
  const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, "_blank");

  notify(`WhatsApp opened to share app link with ${rawPhone}!`);

  api("/api/share-app", {
    method: "POST",
    body: JSON.stringify({ recipient: rawPhone, phone: rawPhone, method: "whatsapp" })
  }).catch(() => { });
}

function copyShareLink() {
  const url = APP_SHARE_URL;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      notify("Web app URL copied to clipboard!");
    }).catch(() => {
      const urlInput = document.getElementById("shareAppLinkInput");
      urlInput?.select();
      document.execCommand("copy");
      notify("Web app URL copied!");
    });
  } else {
    const urlInput = document.getElementById("shareAppLinkInput");
    urlInput?.select();
    document.execCommand("copy");
    notify("Web app URL copied!");
  }
}

function copyShareMessage() {
  const msgBox = document.getElementById("shareMessageText");
  const msg = msgBox ? msgBox.value.trim() : "";
  if (!msg) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).then(() => {
      notify("Share message copied to clipboard!");
    }).catch(() => {
      msgBox?.select();
      document.execCommand("copy");
      notify("Share message copied!");
    });
  } else {
    msgBox?.select();
    document.execCommand("copy");
    notify("Share message copied!");
  }
}


// CSV Exports
function exportStudentsCSV() {
  const rows = [
    ["Student Name", "Course", "Phone", "Email", "Guardian Name", "Guardian Phone", "Next Due", "Balance (INR)", "Status"],
    ...state.students.map(s => [
      s.name, s.course, s.phone || "", s.email || "", s.parentName || "", s.parentPhone || "", s.due, s.amount, s.status
    ])
  ];
  downloadCSV("northstar-students.csv", rows);
  notify("Student roster exported as CSV.");
}

function exportLedgerCSV() {
  const rows = [
    ["Receipt", "Student", "Course", "Date", "Payment Method", "Amount (INR)", "Collected By"],
    ...state.payments.map(p => [
      p.receipt, p.student, p.course || "", p.date, p.method, p.amount, p.collectedBy || "Admin"
    ])
  ];
  downloadCSV("northstar-fee-ledger.csv", rows);
  notify("Fee ledger exported as CSV.");
}

function downloadCSV(filename, rows) {
  const content = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// =========================================================================
// 7. REPORTS & ANALYTICS VIEW
// =========================================================================
function renderReports() {
  document.getElementById("repAttendance").textContent = `${state.summary.attendance}%`;
  document.getElementById("repCollected").textContent = rupees(state.summary.collected);
  const targetPct = Math.min(100, Math.round((state.summary.collected / (state.summary.target || 395000)) * 100));
  document.getElementById("repTargetPct").textContent = `${targetPct}%`;
  document.getElementById("repBatches").textContent = state.classes.length;

  // Breakdown by subject area
  const subjectsMap = {
    "Mathematics": 115000,
    "Physics": 85000,
    "Chemistry": 52000,
    "English & Humanities": 32500
  };
  const totalRev = Object.values(subjectsMap).reduce((a, b) => a + b, 0);

  const breakdownContainer = document.getElementById("revenueBreakdownList");
  if (breakdownContainer) {
    breakdownContainer.innerHTML = Object.entries(subjectsMap).map(([sub, amt]) => {
      const pct = Math.round((amt / totalRev) * 100);
      return `
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
            <strong>${escapeHTML(sub)}</strong>
            <span>${rupees(amt)} (${pct}%)</span>
          </div>
          <div class="progress-track" style="margin:0;height:8px;">
            <div class="progress-fill" style="width:${pct}%;"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Payment method breakdown
  const methodMap = {
    "UPI": 64,
    "Bank Transfer": 22,
    "Cash": 10,
    "Card / Cheque": 4
  };
  const methodsContainer = document.getElementById("paymentMethodsBreakdown");
  if (methodsContainer) {
    methodsContainer.innerHTML = Object.entries(methodMap).map(([m, share]) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-card-subtle);border-radius:var(--radius-md);font-size:13px;">
        <span style="font-weight:600;">${m}</span>
        <span class="tag-pill">${share}% of Transactions</span>
      </div>
    `).join("");
  }
}

// =========================================================================
// 8. TESTIMONIALS VIEW
// =========================================================================
function renderTestimonials() {
  const search = (document.getElementById("testimonialSearchInput")?.value || "").toLowerCase().trim();
  const filter = state.testimonialFilter || "all";

  const countEl = document.getElementById("countAllTestimonials");
  if (countEl) countEl.textContent = (state.testimonials || []).length;

  let filtered = (state.testimonials || []).filter(t => {
    if (filter !== "all" && t.category !== filter) return false;
    if (search) {
      const haystack = [t.name, t.achievement, t.school, t.quote, t.category, t.role].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const grid = document.getElementById("testimonialsGrid");
  if (grid) {
    grid.innerHTML = filtered.length ? filtered.map(t => {
      const stars = "★".repeat(t.rating || 5) + "☆".repeat(5 - (t.rating || 5));
      const categoryBadges = {
        "iit-jee": "IIT-JEE Topper",
        "neet": "NEET / Medical",
        "boards": "Board Topper",
        "parents": "Parent's Feedback"
      };
      const catLabel = categoryBadges[t.category] || "Verified Review";

      return `
        <article class="testimonial-card">
          <div class="testimonial-card-top">
            <img src="${escapeHTML(t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')}" alt="${escapeHTML(t.name)}" class="testimonial-avatar">
            <div class="testimonial-meta">
              <h3>${escapeHTML(t.name)}</h3>
              <div class="testimonial-achievement">🏆 ${escapeHTML(t.achievement)}</div>
              <div class="testimonial-school">🏫 ${escapeHTML(t.school)}</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div class="testimonial-stars" title="${t.rating} Stars">${stars}</div>
            <span class="tag-pill" style="font-size:10px;">${escapeHTML(catLabel)}</span>
          </div>
          <p class="testimonial-quote">${escapeHTML(t.quote)}</p>
          <div class="testimonial-foot">
            <span class="verified-badge">✓ Verified ${escapeHTML(t.role || 'Student')}</span>
            <span>Batch of ${escapeHTML(t.year || '2026')}</span>
          </div>
        </article>
      `;
    }).join("") : `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--ink-400);">No testimonials found matching your filter.</div>`;
  }
}

async function handleTestimonialSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById("testimonialFormError");
  if (errEl) errEl.classList.remove("show");

  const name = document.getElementById("testName")?.value.trim();
  const role = document.getElementById("testRole")?.value;
  const achievement = document.getElementById("testAchievement")?.value.trim();
  const category = document.getElementById("testCategory")?.value;
  const school = document.getElementById("testSchool")?.value.trim();
  const rating = Number(document.getElementById("testRating")?.value) || 5;
  const quote = document.getElementById("testQuote")?.value.trim();

  try {
    await api("/api/testimonials", {
      method: "POST",
      body: JSON.stringify({ name, role, achievement, category, school, rating, quote })
    });
    notify("Thank you! Your testimonial has been published.");
    closeModal("testimonialModal");
    document.getElementById("testimonialForm")?.reset();
    await refreshData();
    renderTestimonials();
  } catch (err) {
    if (errEl) {
      errEl.textContent = err.message;
      errEl.classList.add("show");
    }
  }
}

// =========================================================================
// 9. PHOTO GALLERY VIEW
// =========================================================================
function renderGallery() {
  const search = (document.getElementById("gallerySearchInput")?.value || "").toLowerCase().trim();
  const filter = state.galleryFilter || "all";

  let filtered = (state.gallery || []).filter(g => {
    if (filter !== "all" && g.category !== filter) return false;
    if (search) {
      const haystack = [g.title, g.caption, g.category, g.categoryLabel, g.date].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const grid = document.getElementById("galleryGrid");
  if (grid) {
    grid.innerHTML = filtered.length ? filtered.map(item => `
      <div class="gallery-card" onclick="openPhotoLightbox('${item.id}')" title="Click to view full photo">
        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" loading="lazy">
        <div class="gallery-card-top">
          <span class="gallery-cat-badge">${escapeHTML(item.categoryLabel || item.category)}</span>
        </div>
        <div class="gallery-overlay">
          <h4 class="gallery-title">${escapeHTML(item.title)}</h4>
          <p class="gallery-caption">${escapeHTML(item.caption)}</p>
        </div>
      </div>
    `).join("") : `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--ink-400);">No photos found in this category.</div>`;
  }
}

function openPhotoLightbox(photoId) {
  const photo = (state.gallery || []).find(g => g.id === photoId);
  if (!photo) return;

  const imgEl = document.getElementById("lightboxImg");
  const titleEl = document.getElementById("lightboxTitle");
  const catEl = document.getElementById("lightboxCategory");
  const capEl = document.getElementById("lightboxCaption");

  if (imgEl) imgEl.src = photo.image;
  if (titleEl) titleEl.textContent = photo.title;
  if (catEl) catEl.textContent = photo.categoryLabel || photo.category;
  if (capEl) capEl.textContent = `${photo.caption} (${photo.date || 'Campus Archive'})`;

  openModal("photoLightboxModal");
}
window.openPhotoLightbox = openPhotoLightbox;

async function handlePhotoUploadSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById("photoFormError");
  if (errEl) errEl.classList.remove("show");

  const title = document.getElementById("photoTitle")?.value.trim();
  const category = document.getElementById("photoCategory")?.value;
  const caption = document.getElementById("photoCaption")?.value.trim();
  let image = document.getElementById("photoUrl")?.value.trim();
  const fileInput = document.getElementById("photoFileInput");

  const catLabels = {
    classrooms: "Campus & Classrooms",
    awards: "Felicitation & Awards",
    labs: "Science Labs",
    doubts: "Doubt Sessions",
    annual: "Annual Events & Sports"
  };

  const processUpload = async imgData => {
    try {
      await api("/api/gallery", {
        method: "POST",
        body: JSON.stringify({
          title,
          category,
          categoryLabel: catLabels[category] || "Campus Life",
          image: imgData,
          caption,
          featured: true
        })
      });
      notify("New photo added to the gallery!");
      closeModal("photoUploadModal");
      document.getElementById("photoUploadForm")?.reset();
      await refreshData();
      renderGallery();
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.add("show");
      }
    }
  };

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
      processUpload(ev.target.result);
    };
    reader.readAsDataURL(file);
  } else if (image) {
    processUpload(image);
  } else {
    if (errEl) {
      errEl.textContent = "Please select a file or provide an image URL.";
      errEl.classList.add("show");
    }
  }
}

// Notifications Drawer Logic
function toggleNotifDrawer() {
  const drawer = document.getElementById("notifDrawer");
  if (!drawer) return;
  drawer.classList.toggle("open");
  if (drawer.classList.contains("open")) {
    renderNotifications();
  }
}

function renderNotifications() {
  const list = document.getElementById("notifList");
  if (!list) return;
  list.innerHTML = state.notifications.length ? state.notifications.map(n => `
    <div class="notif-item ${n.read ? "" : "unread"}">
      <strong>${escapeHTML(n.title)}</strong>
      <p>${escapeHTML(n.message)}</p>
      <span>${escapeHTML(n.time)}</span>
    </div>
  `).join("") : `<div style="padding:24px;text-align:center;color:var(--ink-400);font-size:12px;">No notifications.</div>`;
}

async function markAllNotificationsRead() {
  try {
    await api("/api/notifications/read", { method: "POST" });
    state.notifications.forEach(n => { n.read = true; });
    updateNavBadges();
    renderNotifications();
    notify("All notifications marked as read.");
  } catch (err) {
    console.error(err);
  }
}

// Universal Modal Handlers
function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add("open");
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove("open");
}

function closeMobileDrawer() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("drawerOverlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
}

// Event Bindings
function bindEvents() {
  // Navigation
  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => setPage(btn.dataset.page));
  });

  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => setPage(btn.dataset.nav));
  });

  // Sidebar Expand / Collapse Toggle (Desktop collapse & Mobile drawer)
  function toggleSidebar() {
    if (window.innerWidth <= 900) {
      document.getElementById("sidebar")?.classList.toggle("open");
      document.getElementById("drawerOverlay")?.classList.toggle("open");
    } else {
      const isCollapsed = document.body.classList.toggle("sidebar-collapsed");
      localStorage.setItem("divine_sidebar_collapsed", isCollapsed ? "1" : "0");
      updateSidebarTooltips();
    }
  }

  function updateSidebarTooltips() {
    const isCollapsed = document.body.classList.contains("sidebar-collapsed");
    const label = isCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)";
    const topBtn = document.getElementById("sidebarToggleBtn");
    const innerBtn = document.getElementById("sidebarInnerToggle");
    if (topBtn) topBtn.title = label;
    if (innerBtn) innerBtn.title = label;
  }

  // Restore saved collapse state on desktop
  if (window.innerWidth > 900 && localStorage.getItem("divine_sidebar_collapsed") === "1") {
    document.body.classList.add("sidebar-collapsed");
    updateSidebarTooltips();
  }

  document.getElementById("sidebarToggleBtn")?.addEventListener("click", toggleSidebar);
  document.getElementById("sidebarInnerToggle")?.addEventListener("click", toggleSidebar);
  document.getElementById("menuToggle")?.addEventListener("click", toggleSidebar);
  document.getElementById("drawerOverlay")?.addEventListener("click", closeMobileDrawer);

  // Shortcut: Cmd/Ctrl + B to toggle sidebar
  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        toggleSidebar();
      }
    }
  });

  // Notifications
  document.getElementById("notifBtn")?.addEventListener("click", toggleNotifDrawer);
  document.getElementById("markAllReadBtn")?.addEventListener("click", markAllNotificationsRead);

  // Close modals
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
    });
  });

  document.querySelectorAll(".modal-overlay").forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.classList.remove("open");
    });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
      document.getElementById("notifDrawer")?.classList.remove("open");
      closeMobileDrawer();
    }
    // Search focus on "/"
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      document.getElementById("globalSearch")?.focus();
    }
  });

  // Global search input
  document.getElementById("globalSearch")?.addEventListener("input", e => {
    const val = e.target.value.toLowerCase().trim();
    if (!val) return;
    // Auto jump to students or filter active view
    if (state.activePage === "students") {
      document.getElementById("studentSearchInput").value = val;
      renderStudents();
    } else if (state.activePage === "teachers") {
      document.getElementById("teacherSearchInput").value = val;
      renderTeachers();
    } else if (state.activePage === "classes") {
      document.getElementById("classSearchInput").value = val;
      renderClasses();
    } else {
      // Default to students page when searching
      setPage("students");
      const stuSearch = document.getElementById("studentSearchInput");
      if (stuSearch) {
        stuSearch.value = val;
        renderStudents();
      }
    }
  });

  // Dashboard quick actions
  document.getElementById("qaRecordPayment")?.addEventListener("click", () => openPaymentModal());
  document.getElementById("qaAddStudent")?.addEventListener("click", () => openStudentModal());
  document.getElementById("qaScheduleClass")?.addEventListener("click", () => openClassModal());
  document.getElementById("qaTakeAttendance")?.addEventListener("click", () => setPage("attendance"));
  document.getElementById("topRecordPaymentBtn")?.addEventListener("click", () => openPaymentModal());
  document.getElementById("dashRecordPaymentBtn")?.addEventListener("click", () => openPaymentModal());
  document.getElementById("exportSummaryBtn")?.addEventListener("click", exportLedgerCSV);
  document.getElementById("blastRemindersBtn")?.addEventListener("click", blastReminders);
  document.getElementById("targetDetailsBtn")?.addEventListener("click", () => setPage("fees"));

  // Share Web App Bindings
  document.getElementById("topShareAppBtn")?.addEventListener("click", () => openShareAppModal());
  document.getElementById("sidebarShareBtn")?.addEventListener("click", () => openShareAppModal());
  document.getElementById("qaShareApp")?.addEventListener("click", () => openShareAppModal());
  document.getElementById("copyShareLinkBtn")?.addEventListener("click", copyShareLink);
  document.getElementById("copyShareMsgBtn")?.addEventListener("click", copyShareMessage);
  document.getElementById("sendShareWhatsAppBtn")?.addEventListener("click", sendShareViaWhatsApp);

  // Pressing Enter in phone input automatically triggers WhatsApp sharing
  document.getElementById("sharePhoneNumber")?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendShareViaWhatsApp();
    }
  });

  // Chart toggle
  document.querySelectorAll("#chartPeriodTabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#chartPeriodTabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.chartPeriod = btn.dataset.period;
      renderFeeBarChart();
    });
  });

  // Students Page Events
  document.getElementById("addStudentBtn")?.addEventListener("click", () => openStudentModal());
  document.getElementById("exportStudentsBtn")?.addEventListener("click", exportStudentsCSV);
  document.getElementById("studentSearchInput")?.addEventListener("input", renderStudents);
  document.querySelectorAll("#studentFilterTabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#studentFilterTabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.studentFilter = btn.dataset.filter;
      renderStudents();
    });
  });
  document.getElementById("studentForm")?.addEventListener("submit", handleStudentSubmit);

  // Teachers Page Events
  document.getElementById("addTeacherBtn")?.addEventListener("click", () => openTeacherModal());
  document.getElementById("teacherSearchInput")?.addEventListener("input", renderTeachers);
  document.querySelectorAll("#teacherFilterTabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#teacherFilterTabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.teacherFilter = btn.dataset.filter;
      renderTeachers();
    });
  });
  document.getElementById("teacherForm")?.addEventListener("submit", handleTeacherSubmit);

  // Classes Page Events
  document.getElementById("addClassBtn")?.addEventListener("click", () => openClassModal());
  document.getElementById("classSearchInput")?.addEventListener("input", renderClasses);
  document.querySelectorAll("#classDayFilterTabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#classDayFilterTabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.classDayFilter = btn.dataset.day;
      renderClasses();
    });
  });
  document.getElementById("classForm")?.addEventListener("submit", handleClassSubmit);

  // Attendance Page Events
  document.getElementById("markAllPresentBtn")?.addEventListener("click", markAllPresent);
  document.getElementById("saveAttendanceBtn")?.addEventListener("click", saveAttendanceSheet);
  document.getElementById("notifyAbsenteesBtn")?.addEventListener("click", notifyAbsentees);

  // Fees Page Events
  document.getElementById("feesRecordPaymentBtn")?.addEventListener("click", () => openPaymentModal());
  document.getElementById("exportLedgerBtn")?.addEventListener("click", exportLedgerCSV);
  document.getElementById("feeSearchInput")?.addEventListener("input", renderFees);
  document.querySelectorAll("#feeSubtabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#feeSubtabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.feeSubtab = btn.dataset.subtab;
      renderFees();
    });
  });
  document.getElementById("paymentForm")?.addEventListener("submit", handlePaymentSubmit);
  document.getElementById("printReceiptBtn")?.addEventListener("click", printReceipt);

  // Reports
  document.getElementById("printReportBtn")?.addEventListener("click", () => window.print());

  // Login & Multi-Role Events
  document.getElementById("topUserSwitchPill")?.addEventListener("click", () => openLoginModal());
  document.getElementById("openLoginModalBtn")?.addEventListener("click", () => openLoginModal());
  document.getElementById("sidebarUserSnippet")?.addEventListener("click", () => openLoginModal());
  document.getElementById("sidebarLogoutBtn")?.addEventListener("click", e => {
    e.stopPropagation();
    openLoginModal();
  });
  document.getElementById("tpSwitchBtn")?.addEventListener("click", () => openLoginModal("teacher"));
  document.getElementById("spSwitchBtn")?.addEventListener("click", () => openLoginModal("student"));
  document.getElementById("loginForm")?.addEventListener("submit", handleLoginSubmit);

  // Role Tab Switching inside Login Modal
  document.querySelectorAll("#loginRoleTabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#loginRoleTabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const role = btn.dataset.loginRole;
      const hidden = document.getElementById("loginActiveRole");
      if (hidden) hidden.value = role;
      updateLoginRoleUI(role);
    });
  });

  // Confirm Delete
  document.getElementById("confirmDeleteBtn")?.addEventListener("click", () => {
    if (typeof state.pendingDeleteAction === "function") {
      state.pendingDeleteAction();
    }
  });

  // Testimonials Events
  document.getElementById("openTestimonialModalBtn")?.addEventListener("click", () => openModal("testimonialModal"));
  document.getElementById("testimonialForm")?.addEventListener("submit", handleTestimonialSubmit);
  document.getElementById("testimonialSearchInput")?.addEventListener("input", renderTestimonials);
  document.querySelectorAll("#testimonialFilterTabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#testimonialFilterTabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.testimonialFilter = btn.dataset.testFilter;
      renderTestimonials();
    });
  });

  // Photo Gallery Events
  document.getElementById("openPhotoUploadBtn")?.addEventListener("click", () => openModal("photoUploadModal"));
  document.getElementById("photoUploadForm")?.addEventListener("submit", handlePhotoUploadSubmit);
  document.getElementById("gallerySearchInput")?.addEventListener("input", renderGallery);
  document.querySelectorAll("#galleryFilterTabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#galleryFilterTabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.galleryFilter = btn.dataset.galFilter;
      renderGallery();
    });
  });

  updateUserUI();
}

// Initial Bootstrapping
window.addEventListener("DOMContentLoaded", async () => {
  setupTheme();
  bindEvents();
  await refreshData();
  updateUserUI();

  // Route to role portal if logged in as student or teacher
  if (state.currentUser?.role === "student") {
    setPage("student-portal");
  } else if (state.currentUser?.role === "teacher") {
    setPage("teacher-portal");
  } else {
    setPage("dashboard");
  }
});
