// build_copy_start.js
const spawn = require("cross-spawn");
const fs = require("fs");
const path = require("path");

// ---------------------------
// แก้ path ให้ตรงกับโครงสร้างจริง
// ---------------------------
// สมมติโครงสร้าง:
// C:\Takiang2.0\takiang2.0  <-- client (Vite React)
// C:\Takiang2.0\server       <-- server (Node.js backend)
const clientDir = path.join(__dirname, "..", "takiang2.0"); // client folder จริง
const buildDir = path.join(clientDir, "dist");              // Vite build output
const serverPublicDir = path.join(__dirname, "public");    // server/public
const serverFile = path.join(__dirname, "server.js");      // server entry point

try {
  // ---------------------------
  // 1. Build ฝั่ง Client
  // ---------------------------
  console.log("🚀 กำลัง Build ฝั่ง Client...");
  const build = spawn.sync("npm", ["run", "build"], {
    cwd: clientDir,
    stdio: "inherit",
    shell: true
  });

  if (build.error) throw build.error;

  // ---------------------------
  // 2. ลบไฟล์เก่าใน server/public
  // ---------------------------
  console.log("🧹 ลบไฟล์เก่าใน server/public...");
  fs.rmSync(serverPublicDir, { recursive: true, force: true });

  // ---------------------------
  // 3. คัดลอกไฟล์ build ไป server/public
  // ---------------------------
  console.log("📂 คัดลอกไฟล์ build ไป server/public...");
  fs.cpSync(buildDir, serverPublicDir, { recursive: true });

  // ---------------------------
  // 4. Start Server ด้วย nodemon
  // ---------------------------
  console.log("▶️ กำลัง Start Server...");
  const serverProcess = spawn("nodemon", [serverFile], {
    stdio: "inherit",
    shell: true
  });

  serverProcess.on("close", (code) => {
    console.log(`🛑 เซิร์ฟเวอร์หยุดทำงาน (code ${code})`);
  });

} catch (err) {
  console.error("❌ เกิดข้อผิดพลาด:", err.message);
}
