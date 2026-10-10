const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const root = __dirname;
const storePath = path.join(root, "data", "store.json");
const port = Number(process.env.PORT) || 3000;
const colors = ["#dce8f7", "#f3dfd7", "#e1dff2", "#d9eee2", "#f4e7cc", "#e7dfea", "#cce6ff", "#ffd6e0"];

function readStore() {
  if (!fs.existsSync(storePath)) {
    throw new Error("Store file not found.");
  }
  return JSON.parse(fs.readFileSync(storePath, "utf8"));
}

function writeStore(store) {
  recomputeSummary(store);
  const temporaryPath = `${storePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  fs.renameSync(temporaryPath, storePath);
}

function recomputeSummary(store) {
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
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        reject(Object.assign(new Error("Request body is too large."), { status: 413 }));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(Object.assign(new Error("Request body must be valid JSON."), { status: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function validateText(value, field, maxLength = 100, optional = false) {
  if (optional && (value === undefined || value === null || String(value).trim() === "")) {
    return "";
  }
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw Object.assign(new Error(`${field} is required (maximum ${maxLength} characters).`), { status: 400 });
  }
  return value.trim();
}

function updateStudentStatus(student) {
  student.amount = Math.max(0, Number(student.amount) || 0);
  if (student.amount === 0) {
    student.status = "Paid";
  } else if (student.status === "Overdue") {
    student.status = "Overdue";
  } else {
    student.status = "Partial";
  }
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson(response, 200, { ok: true, timestamp: new Date().toISOString() });
  }

  const store = readStore();

  // Bootstrap
  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    recomputeSummary(store);
    return sendJson(response, 200, store);
  }

  // Authentication Route
  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readBody(request);
    const role = (body.role || "").toLowerCase();
    const username = (body.username || "").trim();
    const password = (body.password || "").trim();

    if (!username || !password) {
      throw Object.assign(new Error("Please enter both name/username and password."), { status: 400 });
    }

    // 1. Admin Login
    if (role === "admin" || username.toLowerCase() === "admin") {
      if (password === "admin123" || password === "admin" || password === "123456") {
        return sendJson(response, 200, {
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
        });
      }
      throw Object.assign(new Error("Invalid password for Admin. Try 'admin123'."), { status: 401 });
    }

    // 2. Teacher Login
    const cleanUsername = username.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "").trim().toLowerCase();
    if (role === "teacher" || (!role && (store.teachers || []).some(t => t.name.toLowerCase().includes(cleanUsername)))) {
      const teacher = (store.teachers || []).find(t => {
        const cleanTName = t.name.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "").trim().toLowerCase();
        return t.name.toLowerCase() === username.toLowerCase() ||
               cleanTName === cleanUsername ||
               t.name.toLowerCase().includes(cleanUsername) ||
               t.email.toLowerCase() === username.toLowerCase() ||
               t.id.toLowerCase() === username.toLowerCase();
      });
      if (!teacher) {
        throw Object.assign(new Error(`No faculty member found with name "${username}".`), { status: 404 });
      }
      const validPass = teacher.password || "teacher123";
      if (password === validPass || password === "123456" || password === "teacher123") {
        return sendJson(response, 200, {
          ok: true,
          user: {
            role: "teacher",
            id: teacher.id,
            name: teacher.name,
            initials: teacher.initials,
            email: teacher.email,
            phone: teacher.phone,
            color: teacher.color,
            avatar: teacher.avatar || null,
            qualification: teacher.qualification,
            subjects: teacher.subjects,
            availability: teacher.availability,
            status: teacher.status
          }
        });
      }
      throw Object.assign(new Error("Invalid password for Faculty. Try 'teacher123'."), { status: 401 });
    }

    // 3. Student Login
    if (role === "student" || (!role && (store.students || []).some(s => s.name.toLowerCase().includes(cleanUsername)))) {
      const student = (store.students || []).find(s => {
        const cleanSName = s.name.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "").trim().toLowerCase();
        return s.name.toLowerCase() === username.toLowerCase() ||
               cleanSName === cleanUsername ||
               s.name.toLowerCase().includes(cleanUsername) ||
               s.email.toLowerCase() === username.toLowerCase() ||
               (s.phone && s.phone.replace(/\D/g, "") === username.replace(/\D/g, "")) ||
               s.id.toLowerCase() === username.toLowerCase();
      });
      if (!student) {
        throw Object.assign(new Error(`No enrolled student found with name "${username}".`), { status: 404 });
      }
      const validPass = student.password || "student123";
      if (password === validPass || password === "123456" || password === "student123") {
        return sendJson(response, 200, {
          ok: true,
          user: {
            role: "student",
            id: student.id,
            name: student.name,
            initials: student.initials,
            class: student.class || "Class 12",
            school: student.school || "Delhi Public School",
            course: student.course,
            email: student.email,
            phone: student.phone,
            address: student.address || "Mumbai",
            parentName: student.parentName,
            parentPhone: student.parentPhone,
            totalFee: student.totalFee,
            due: student.due,
            amount: student.amount,
            status: student.status,
            color: student.color,
            avatar: student.avatar || null,
            lastRemindedAt: student.lastRemindedAt
          }
        });
      }
      throw Object.assign(new Error("Invalid password for Student. Try 'student123'."), { status: 401 });
    }

    throw Object.assign(new Error("Account not found. Please check username and selected role."), { status: 404 });
  }

  // Notifications
  if (request.method === "GET" && url.pathname === "/api/notifications") {
    return sendJson(response, 200, store.notifications || []);
  }
  if (request.method === "POST" && url.pathname === "/api/notifications/read") {
    (store.notifications || []).forEach(n => { n.read = true; });
    writeStore(store);
    return sendJson(response, 200, { ok: true });
  }

  // Students Routes
  const studentMatch = url.pathname.match(/^\/api\/students(?:\/([^/]+))?$/);
  if (studentMatch) {
    const studentId = studentMatch[1];

    if (request.method === "GET" && !studentId) {
      return sendJson(response, 200, store.students);
    }
    if (request.method === "GET" && studentId) {
      const student = (store.students || []).find(s => s.id === studentId);
      return student ? sendJson(response, 200, student) : sendJson(response, 404, { error: "Student not found." });
    }

    // CREATE STUDENT
    if (request.method === "POST" && !studentId) {
      const body = await readBody(request);
      const name = validateText(body.name, "Student name", 80);
      const course = validateText(body.course, "Course", 100);
      const due = validateText(body.due, "Due date", 40);
      const phone = validateText(body.phone, "Phone", 25, true);
      const email = validateText(body.email, "Email", 120, true);
      const parentName = validateText(body.parentName, "Parent/Guardian name", 80, true);
      const parentPhone = validateText(body.parentPhone, "Parent phone", 25, true);
      const amount = Number(body.amount);
      const totalFee = Number(body.totalFee) || (amount > 0 ? amount * 4 : 40000);

      if (!Number.isSafeInteger(amount) || amount < 0 || amount > 10_000_000) {
        throw Object.assign(new Error("Fee balance must be a whole number between 0 and 10,000,000."), { status: 400 });
      }

      const studentClass = validateText(body.class, "Class / Grade", 50, true) || "Class 12";
      const school = validateText(body.school, "School name", 120, true) || "Delhi Public School";
      const address = validateText(body.address, "Address", 200, true) || "Mumbai";

      const initials = name.split(/\s+/).slice(0, 2).map(part => part[0].toUpperCase()).join("");
      const avatar = typeof body.avatar === "string" && body.avatar.trim() ? body.avatar.trim() : null;
      const student = {
        id: `stu-${Date.now().toString().slice(-4)}`,
        name,
        initials,
        avatar,
        color: colors[store.students.length % colors.length],
        class: studentClass,
        school,
        course,
        phone: phone || "+91 98200 00000",
        email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        address: address || "Mumbai",
        parentName: parentName || "Parent / Guardian",
        parentPhone: parentPhone || "+91 98200 11111",
        enrolledDate: new Date().toISOString().slice(0, 10),
        totalFee,
        due,
        amount,
        status: amount === 0 ? "Paid" : "Partial",
        lastRemindedAt: null
      };

      store.students.unshift(student);
      writeStore(store);
      return sendJson(response, 201, student);
    }

    // UPDATE STUDENT
    if (request.method === "PUT" && studentId) {
      const body = await readBody(request);
      const index = (store.students || []).findIndex(s => s.id === studentId);
      if (index === -1) {
        throw Object.assign(new Error("Student not found."), { status: 404 });
      }
      const existing = store.students[index];
      const name = validateText(body.name || existing.name, "Student name", 80);
      const studentClass = body.class !== undefined ? validateText(body.class, "Class", 50, true) : existing.class;
      const school = body.school !== undefined ? validateText(body.school, "School", 120, true) : (existing.school || "Delhi Public School");
      const course = validateText(body.course || existing.course, "Course", 100);
      const due = validateText(body.due || existing.due, "Due date", 40);
      const phone = validateText(body.phone !== undefined ? body.phone : existing.phone, "Phone", 25, true);
      const email = validateText(body.email !== undefined ? body.email : existing.email, "Email", 120, true);
      const address = body.address !== undefined ? validateText(body.address, "Address", 200, true) : existing.address;
      const parentName = validateText(body.parentName !== undefined ? body.parentName : existing.parentName, "Parent name", 80, true);
      const parentPhone = validateText(body.parentPhone !== undefined ? body.parentPhone : existing.parentPhone, "Parent phone", 25, true);
      const amount = body.amount !== undefined ? Number(body.amount) : existing.amount;
      const status = body.status || existing.status;
      const avatar = body.avatar !== undefined ? (body.avatar || null) : existing.avatar;

      if (!Number.isSafeInteger(amount) || amount < 0) {
        throw Object.assign(new Error("Valid fee balance required."), { status: 400 });
      }

      const initials = name.split(/\s+/).slice(0, 2).map(part => part[0].toUpperCase()).join("");
      const updated = {
        ...existing,
        name,
        initials,
        avatar,
        class: studentClass || existing.class || "Class 12",
        school: school || existing.school || "Delhi Public School",
        course,
        due,
        phone,
        email,
        address: address || existing.address || "Mumbai",
        parentName,
        parentPhone,
        amount,
        status: amount === 0 ? "Paid" : status
      };

      store.students[index] = updated;
      writeStore(store);
      return sendJson(response, 200, updated);
    }

    // DELETE STUDENT
    if (request.method === "DELETE" && studentId) {
      const index = (store.students || []).findIndex(s => s.id === studentId);
      if (index === -1) {
        throw Object.assign(new Error("Student not found."), { status: 404 });
      }
      const removed = store.students.splice(index, 1)[0];
      writeStore(store);
      return sendJson(response, 200, { success: true, removed });
    }
  }

  // Teachers Routes
  const teacherRoute = url.pathname.match(/^\/api\/teachers(?:\/([^/]+))?$/);
  if (teacherRoute) {
    const teacherId = teacherRoute[1];

    if (request.method === "GET" && !teacherId) {
      return sendJson(response, 200, store.teachers || []);
    }
    if (request.method === "GET" && teacherId) {
      const teacher = (store.teachers || []).find(item => item.id === teacherId);
      return teacher ? sendJson(response, 200, teacher) : sendJson(response, 404, { error: "Teacher not found." });
    }

    // CREATE / UPDATE TEACHER
    if ((request.method === "POST" && !teacherId) || (request.method === "PUT" && teacherId)) {
      const body = await readBody(request);
      const existingTeacher = request.method === "PUT" ? (store.teachers || []).find(item => item.id === teacherId) : null;
      if (request.method === "PUT" && !existingTeacher) {
        throw Object.assign(new Error("Teacher not found."), { status: 404 });
      }
      const name = validateText(body.name, "Teacher name", 80);
      const phone = validateText(body.phone, "Phone number", 24);
      const email = validateText(body.email, "Email", 120).toLowerCase();
      const qualification = validateText(body.qualification, "Qualification", 120);
      const availability = validateText(body.availability, "Availability", 100);
      const experienceYears = Number(body.experienceYears);
      const status = validateText(body.status, "Teacher status", 20);
      const subjects = Array.isArray(body.subjects) ? body.subjects : [];

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw Object.assign(new Error("Enter a valid email address."), { status: 400 });
      }
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 8 || digits.length > 15) {
        throw Object.assign(new Error("Enter a phone number with 8 to 15 digits."), { status: 400 });
      }
      if ((store.teachers || []).some(teacher => teacher.id !== existingTeacher?.id && teacher.email.toLowerCase() === email)) {
        throw Object.assign(new Error("A teacher with this email address already exists."), { status: 409 });
      }
      if (!Number.isSafeInteger(experienceYears) || experienceYears < 0 || experienceYears > 60) {
        throw Object.assign(new Error("Teaching experience must be a whole number from 0 to 60."), { status: 400 });
      }
      if (!["Active", "On leave", "Inactive"].includes(status)) {
        throw Object.assign(new Error("Select a valid teacher status."), { status: 400 });
      }
      if (subjects.length < 1 || subjects.length > 10 || subjects.some(subject => typeof subject !== "string" || !subject.trim())) {
        throw Object.assign(new Error("Add between 1 and 10 valid subjects."), { status: 400 });
      }

      const initials = name.split(/\s+/).slice(0, 2).map(part => part[0].toUpperCase()).join("");
      const avatar = body.avatar !== undefined ? (body.avatar || null) : (existingTeacher ? existingTeacher.avatar : null);
      const teacher = {
        id: existingTeacher ? existingTeacher.id : `tch-${Date.now().toString().slice(-4)}`,
        name,
        initials,
        avatar,
        color: existingTeacher ? existingTeacher.color : colors[(store.teachers || []).length % colors.length],
        phone,
        email,
        qualification,
        subjects: [...new Set(subjects.map(subject => subject.trim()))],
        experienceYears,
        availability,
        status
      };

      store.teachers = store.teachers || [];
      if (existingTeacher) {
        store.teachers = store.teachers.map(item => item.id === existingTeacher.id ? teacher : item);
        (store.classes || []).forEach(item => {
          if (item.teacher === existingTeacher.name) item.teacher = teacher.name;
        });
      } else {
        store.teachers.unshift(teacher);
      }
      writeStore(store);
      return sendJson(response, existingTeacher ? 200 : 201, teacher);
    }

    // DELETE TEACHER
    if (request.method === "DELETE" && teacherId) {
      const index = (store.teachers || []).findIndex(t => t.id === teacherId);
      if (index === -1) {
        throw Object.assign(new Error("Teacher not found."), { status: 404 });
      }
      const removed = store.teachers.splice(index, 1)[0];
      (store.classes || []).forEach(c => {
        if (c.teacher === removed.name) c.teacher = "Unassigned";
      });
      writeStore(store);
      return sendJson(response, 200, { success: true, removed });
    }
  }

  // Classes & Schedule Routes
  const classRoute = url.pathname.match(/^\/api\/classes(?:\/([^/]+))?$/);
  if (classRoute) {
    const classId = classRoute[1];

    if (request.method === "GET" && !classId) {
      return sendJson(response, 200, store.classes || []);
    }
    if (request.method === "GET" && classId) {
      const cls = (store.classes || []).find(item => item.id === classId);
      return cls ? sendJson(response, 200, cls) : sendJson(response, 404, { error: "Class not found." });
    }

    // CREATE CLASS
    if (request.method === "POST" && !classId) {
      const body = await readBody(request);
      const name = validateText(body.name, "Class name", 80);
      const course = validateText(body.course, "Course / Grade", 60);
      const time = validateText(body.time, "Schedule time", 40);
      const location = validateText(body.location, "Location / Room", 60);
      const teacher = validateText(body.teacher, "Assigned teacher", 80);
      const studentsCount = Number(body.students) || 0;
      const days = Array.isArray(body.days) && body.days.length > 0 ? body.days : ["Mon", "Wed", "Fri"];

      const newClass = {
        id: `cls-${Date.now().toString().slice(-4)}`,
        name,
        course,
        time,
        location,
        teacher,
        students: studentsCount,
        live: Boolean(body.live),
        days
      };

      store.classes = store.classes || [];
      store.classes.push(newClass);
      writeStore(store);
      return sendJson(response, 201, newClass);
    }

    // UPDATE CLASS (including live status toggle)
    if (request.method === "PUT" && classId) {
      const body = await readBody(request);
      const index = (store.classes || []).findIndex(item => item.id === classId);
      if (index === -1) {
        throw Object.assign(new Error("Class not found."), { status: 404 });
      }
      const existing = store.classes[index];
      const updated = {
        ...existing,
        name: body.name !== undefined ? validateText(body.name, "Class name", 80) : existing.name,
        course: body.course !== undefined ? validateText(body.course, "Course / Grade", 60) : existing.course,
        time: body.time !== undefined ? validateText(body.time, "Schedule time", 40) : existing.time,
        location: body.location !== undefined ? validateText(body.location, "Location", 60) : existing.location,
        teacher: body.teacher !== undefined ? validateText(body.teacher, "Teacher", 80) : existing.teacher,
        students: body.students !== undefined ? Number(body.students) : existing.students,
        live: body.live !== undefined ? Boolean(body.live) : existing.live,
        days: Array.isArray(body.days) && body.days.length > 0 ? body.days : existing.days
      };
      store.classes[index] = updated;
      writeStore(store);
      return sendJson(response, 200, updated);
    }

    // DELETE CLASS
    if (request.method === "DELETE" && classId) {
      const index = (store.classes || []).findIndex(item => item.id === classId);
      if (index === -1) {
        throw Object.assign(new Error("Class not found."), { status: 404 });
      }
      const removed = store.classes.splice(index, 1)[0];
      writeStore(store);
      return sendJson(response, 200, { success: true, removed });
    }
  }

  // Attendance Routes
  if (url.pathname === "/api/attendance") {
    if (request.method === "GET") {
      return sendJson(response, 200, store.attendance || []);
    }
    if (request.method === "POST") {
      const body = await readBody(request);
      const classId = validateText(body.classId, "Class ID", 50);
      const date = validateText(body.date, "Attendance date", 10);
      const records = Array.isArray(body.records) ? body.records : [];
      const targetClass = (store.classes || []).find(c => c.id === classId);

      const attendanceEntry = {
        id: `att-${date}-${classId}`,
        date,
        classId,
        className: targetClass ? targetClass.name : (body.className || "Class"),
        teacher: targetClass ? targetClass.teacher : "Staff",
        records: records.map(r => ({
          studentId: r.studentId,
          studentName: r.studentName,
          status: ["Present", "Absent", "Late"].includes(r.status) ? r.status : "Present"
        }))
      };

      store.attendance = store.attendance || [];
      const existingIdx = store.attendance.findIndex(a => a.date === date && a.classId === classId);
      if (existingIdx !== -1) {
        store.attendance[existingIdx] = attendanceEntry;
      } else {
        store.attendance.unshift(attendanceEntry);
      }

      writeStore(store);
      return sendJson(response, 201, attendanceEntry);
    }
  }

  // Payments Route
  if (request.method === "GET" && url.pathname === "/api/payments") {
    return sendJson(response, 200, store.payments || []);
  }

  if (request.method === "POST" && url.pathname === "/api/payments") {
    const body = await readBody(request);
    const student = (store.students || []).find(item => item.id === body.studentId);
    if (!student) throw Object.assign(new Error("Student not found."), { status: 404 });

    const amount = Number(body.amount);
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > student.amount) {
      throw Object.assign(new Error(`Enter an amount from ₹1 to ₹${student.amount.toLocaleString("en-IN")}.`), { status: 400 });
    }

    const method = validateText(body.method, "Payment method", 40);
    const date = validateText(body.date, "Payment date", 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00`))) {
      throw Object.assign(new Error("Payment date must be a valid date."), { status: 400 });
    }
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 120) : "";

    const payment = {
      receipt: `NSA-${Date.now().toString().slice(-7)}`,
      studentId: student.id,
      student: student.name,
      course: student.course,
      amount,
      date: new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      method,
      note,
      collectedBy: "Alex Morgan"
    };

    student.amount -= amount;
    updateStudentStatus(student);
    store.payments = store.payments || [];
    store.payments.push(payment);

    // Add a notification
    store.notifications = store.notifications || [];
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: "Fee Payment Logged",
      message: `Recorded payment of ₹${amount.toLocaleString("en-IN")} from ${student.name}.`,
      time: "Just now",
      type: "success",
      read: false
    });

    writeStore(store);
    return sendJson(response, 201, { payment, student, summary: store.summary });
  }

  // Reminders API
  if (request.method === "POST" && url.pathname === "/api/reminders") {
    const body = await readBody(request);
    const student = (store.students || []).find(item => item.id === body.studentId);
    if (!student) throw Object.assign(new Error("Student not found."), { status: 404 });

    const phone = body.phone || student.phone || student.parentPhone;
    const method = body.method || "whatsapp";
    const nowStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    student.lastRemindedAt = `Today at ${nowStr}`;

    store.notifications = store.notifications || [];
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: "Fee Reminder Dispatched",
      message: `Sent ${method.toUpperCase()} reminder to ${student.name} (${phone}) for ₹${student.amount.toLocaleString("en-IN")}.`,
      time: "Just now",
      type: "info",
      read: false
    });

    writeStore(store);
    return sendJson(response, 200, { ok: true, student, phone, method, lastRemindedAt: student.lastRemindedAt });
  }

  if (request.method === "POST" && url.pathname === "/api/reminders/batch") {
    const owing = (store.students || []).filter(s => s.amount > 0);
    const nowStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    owing.forEach(s => {
      s.lastRemindedAt = `Today at ${nowStr}`;
    });

    store.notifications = store.notifications || [];
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: "Batch Reminders Sent",
      message: `Dispatched payment reminders to all ${owing.length} students with outstanding balances.`,
      time: "Just now",
      type: "info",
      read: false
    });

    writeStore(store);
    return sendJson(response, 200, { ok: true, count: owing.length });
  }

  // Testimonials API
  if (url.pathname === "/api/testimonials") {
    if (request.method === "GET") {
      return sendJson(response, 200, store.testimonials || []);
    }
    if (request.method === "POST") {
      const body = await readBody(request);
      const name = validateText(body.name, "Name", 80);
      const achievement = validateText(body.achievement, "Achievement / Class", 100);
      const school = validateText(body.school, "School name", 120, true) || "Divine Coaching";
      const quote = validateText(body.quote, "Testimonial review", 1000);
      const category = validateText(body.category || "iit-jee", "Category", 40);
      const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
      const role = validateText(body.role || "Student", "Role", 40);
      const avatar = body.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

      const newTestimonial = {
        id: `test-${Date.now()}`,
        name,
        role,
        achievement,
        school,
        category,
        rating,
        year: "2025-26",
        avatar,
        quote,
        date: "Just now",
        verified: true
      };

      store.testimonials = store.testimonials || [];
      store.testimonials.unshift(newTestimonial);
      writeStore(store);
      return sendJson(response, 201, newTestimonial);
    }
  }

  // Photo Gallery API
  if (url.pathname === "/api/gallery") {
    if (request.method === "GET") {
      return sendJson(response, 200, store.gallery || []);
    }
    if (request.method === "POST") {
      const body = await readBody(request);
      const title = validateText(body.title, "Photo Title", 100);
      const category = validateText(body.category || "classrooms", "Category", 40);
      const categoryLabel = validateText(body.categoryLabel || "Campus & Classrooms", "Category Label", 80);
      const image = validateText(body.image, "Image URL or Base64", 10_000_000);
      const caption = validateText(body.caption, "Caption", 500, true) || "";

      const newPhoto = {
        id: `gal-${Date.now()}`,
        title,
        category,
        categoryLabel,
        image,
        caption,
        date: "Today",
        featured: Boolean(body.featured)
      };

      store.gallery = store.gallery || [];
      store.gallery.unshift(newPhoto);
      writeStore(store);
      return sendJson(response, 201, newPhoto);
    }
  }

  return sendJson(response, 404, { error: "API route not found." });
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function serveStatic(request, response, url) {
  let relativePath = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\//, "");
  // sanitize path
  const safePath = path.normalize(path.join(root, relativePath));
  if (!safePath.startsWith(root)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    return response.end("Access denied");
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return response.end("404 Not Found");
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(safePath, (readErr, content) => {
      if (readErr) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        return response.end("Server error reading file.");
      }
      response.writeHead(200, {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff"
      });
      response.end(content);
    });
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
    } else {
      serveStatic(request, response, url);
    }
  } catch (error) {
    if (!response.headersSent) {
      sendJson(response, error.status || 500, {
        error: error.status ? error.message : "The server could not complete this request."
      });
    }
    if (!error.status) console.error("Request failed:", error);
  }
});

server.listen(port, () => console.log(`Divine Coaching is running at http://localhost:${port}`));
