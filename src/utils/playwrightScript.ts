import { FacebookGroup, ScheduleConfig, FacebookProfile } from "../types";

export function generatePlaywrightScript(
  groups: FacebookGroup[],
  spintax: string,
  config: ScheduleConfig,
  activeProfile?: FacebookProfile
): string {
  const activeGroups = groups.filter((g) => g.isActive);
  const profileName = activeProfile?.name || "Nick Mặc Định";
  const chromeProfileDir = activeProfile?.chromeProfileName || "Default";

  return `/**
 * FB ĐẨY BÀI - PLAYWRIGHT AUTOMATION ENGINE
 * Phiên bản: Chống phát hiện (Stealth Mode) + Giữ Session Chrome thật
 * -------------------------------------------------------------
 * NICK FACEBOOK THỰC HIỆN: ${profileName}
 * PROFILE CHROME: ${chromeProfileDir}
 * -------------------------------------------------------------
 * HƯỚNG DẪN CHẠY:
 * 1. Mở Terminal / PowerShell và cài thư viện:
 *    npm install playwright-core
 * 
 * 2. Đường dẫn User Data của Google Chrome trên máy bạn:
 *    - Windows: C:\\\\Users\\\\<Tên_May_Ban>\\\\AppData\\\\Local\\\\Google\\\\Chrome\\\\User Data
 *    - Mac: /Users/<Tên_May_Ban>/Library/Application Support/Google/Chrome
 * 
 * 3. Chạy script để Chrome tự động mở và đăng bài thật:
 *    node fb_auto_post.js
 */

const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

// CẤU HÌNH THỜI GIAN & PROFILE NICK FACEBOOK
const CONFIG = {
  // Thay đổi đường dẫn này trỏ tới thư mục Chrome User Data của bạn nếu cần:
  userDataDir: process.env.CHROME_USER_DATA || './chrome-fb-profile',
  profileDirectory: '${chromeProfileDir}', // Thư mục profile con: Default, Profile 1, Profile 2...
  profileName: '${profileName.replace(/'/g, "\\'")}',
  executablePath: process.env.CHROME_BIN || undefined, // Tự tìm Chrome mặc định nếu không khai báo
  minDelaySec: ${config.minDelaySeconds}, // Nghỉ tối thiểu ${Math.round(config.minDelaySeconds / 60)} phút giữa các nhóm
  maxDelaySec: ${config.maxDelaySeconds}, // Nghỉ tối đa ${Math.round(config.maxDelaySeconds / 60)} phút
  typingMinMs: ${config.typingDelayMinMs},
  typingMaxMs: ${config.typingDelayMaxMs},
};

// DANH SÁCH ${activeGroups.length} NHÓM MỤC TIÊU ĐÃ CHỌN
const TARGET_GROUPS = ${JSON.stringify(
    activeGroups.map((g) => ({ id: g.id, name: g.name, url: g.url })),
    null,
    2
  )};

// NỘI DUNG BÀI ĐĂNG (CÚ PHÁP SPINTAX)
const SPINTAX_CONTENT = \`${spintax.replace(/`/g, "\\`").replace(/\${/g, "\\${")}\`;

// HÀM GIẢI MÃ SPINTAX THÀNH BIẾN THỂ ĐỘC BẢN CHO TỪNG NHÓM
function resolveSpintax(text) {
  let spin = text;
  const regex = /\\{([^{}]+)\\}/;
  while (regex.test(spin)) {
    spin = spin.replace(regex, (_, choicesStr) => {
      const choices = choicesStr.split('|');
      return choices[Math.floor(Math.random() * choices.length)];
    });
  }
  return spin;
}

// HÀM NGỦ RANDOM (COOLDOWN)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// MÔ PHỎNG GÕ PHÍM NGƯỜI THẬT
async function humanType(element, text) {
  for (const char of text) {
    await element.type(char, { delay: randomDelay(CONFIG.typingMinMs, CONFIG.typingMaxMs) });
  }
}

async function runAutoPoster() {
  console.log('========================================================');
  console.log('🚀 FB ĐẨY BÀI - KHỞI ĐỘNG PLAYWRIGHT AUTOMATION');
  console.log('👤 NICK FACEBOOK THỰC HIỆN: ' + CONFIG.profileName);
  console.log('📂 Chrome Profile Directory: ' + CONFIG.profileDirectory);
  console.log('📋 Tổng số nhóm mục tiêu: ' + TARGET_GROUPS.length);
  console.log('========================================================\\n');

  const launchArgs = [
    '--disable-blink-features=AutomationControlled',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
  ];

  if (CONFIG.profileDirectory && CONFIG.profileDirectory !== 'Default') {
    launchArgs.push(\`--profile-directory=\${CONFIG.profileDirectory}\`);
  }

  const context = await chromium.launchPersistentContext(CONFIG.userDataDir, {
    headless: false, // Mở cửa sổ Chrome thật để bạn trực tiếp theo dõi bài đăng
    executablePath: CONFIG.executablePath,
    args: launchArgs,
    viewport: { width: 1280, height: 800 },
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  // Kiểm tra đăng nhập
  console.log('🔍 Đang kết nối Facebook để kiểm tra trạng thái đăng nhập...');
  await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  const postReports = [];
  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < TARGET_GROUPS.length; i++) {
    const group = TARGET_GROUPS[i];
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');

    console.log(\`\\n--------------------------------------------------------\`);
    console.log(\`📌 [\${i + 1}/\${TARGET_GROUPS.length}] Nhóm: \${group.name}\`);
    console.log(\`👤 Nick thực hiện: \${CONFIG.profileName}\`);
    console.log(\`🌐 Đường dẫn: \${group.url}\`);

    let isSuccess = false;
    let groupContent = '';
    let status = 'error';
    let note = '';

    try {
      await page.goto(group.url, { waitUntil: 'networkidle', timeout: 45000 });
      await sleep(randomDelay(3000, 6000));

      // Cuộn trang nhẹ nhàng như người lướt tin thật
      await page.mouse.wheel(0, randomDelay(300, 700));
      await sleep(2000);

      // Tạo biến thể nội dung độc bản cho nhóm này
      groupContent = resolveSpintax(SPINTAX_CONTENT);
      console.log(\`📝 Biến thể bài viết độc bản:\n"\${groupContent.substring(0, 80)}..."\`);

      // Tìm nút "Bạn viết gì đi..." hoặc "Viết bài thảo luận..."
      const writePostSelector = [
        'div[role="button"]:has-text("Bạn đang nghĩ gì")',
        'div[role="button"]:has-text("Viết bài thảo luận")',
        'div[role="button"]:has-text("Tạo bài viết công khai")',
        'div[role="button"]:has-text("Write something...")'
      ].join(',');

      const writeBtn = await page.waitForSelector(writePostSelector, { timeout: 15000 });
      if (!writeBtn) {
        console.warn('⚠️ Không tìm thấy ô tạo bài viết (có thể cần duyệt vào nhóm hoặc nhóm chỉ admin được đăng).');
        skippedCount++;
        status = 'blocked';
        note = 'Không tìm thấy ô đăng bài hoặc chưa tham gia nhóm';
      } else {
        await writeBtn.click();
        await sleep(2000);

        // Tìm ô soạn bài
        const editorBox = await page.waitForSelector('div[role="textbox"][contenteditable="true"]', { timeout: 10000 });
        if (editorBox) {
          await humanType(editorBox, groupContent);
          await sleep(2000);

          // Bấm nút Đăng
          const postButton = await page.$('div[aria-label="Đăng"], div[aria-label="Post"], div[role="button"]:has-text("Đăng")');
          if (postButton) {
            await postButton.click();
            await sleep(4000);
            console.log(\`✅ [THÀNH CÔNG] Nick "\${CONFIG.profileName}" đã gửi bài vào: \${group.name}\`);
            successCount++;
            isSuccess = true;
            status = 'success';
            note = 'Đã gửi bài thành công';
          }
        }
      }
    } catch (err) {
      console.error(\`❌ Lỗi xử lý nhóm \${group.name}:\`, err.message);
      status = 'error';
      note = err.message;
    }

    // Lưu kết quả vào mảng báo cáo
    postReports.push({
      groupId: group.id,
      groupName: group.name,
      groupUrl: group.url,
      profileName: CONFIG.profileName,
      timestamp,
      status,
      contentSnippet: groupContent.substring(0, 100),
      note,
    });

    // Xuất file báo cáo JSON ngay sau mỗi nhóm
    try {
      fs.writeFileSync('post_results.json', JSON.stringify(postReports, null, 2), 'utf-8');
    } catch (e) {}

    // Nghỉ ngơi hạ nhiệt Anti-Spam nếu chưa phải nhóm cuối
    if (i < TARGET_GROUPS.length - 1) {
      const waitSec = randomDelay(CONFIG.minDelaySec, CONFIG.maxDelaySec);
      console.log(\`⏳ [ANTI-SPAM] Nghỉ an toàn \${Math.floor(waitSec / 60)} phút \${waitSec % 60} giây trước khi chuyển nhóm...\`);
      await sleep(waitSec * 1000);
    }
  }

  console.log(\`\\n========================================================\`);
  console.log(\`🎉 HOÀN THÀNH TOÀN BỘ CA ĐĂNG BÀI!\`);
  console.log(\`👤 Nick thực hiện: \${CONFIG.profileName}\`);
  console.log(\`✅ Thành công: \${successCount}/\${TARGET_GROUPS.length} nhóm. Bỏ qua/Lỗi: \${skippedCount}\`);
  console.log(\`📁 Kết quả đã được lưu tại file: post_results.json\`);
  console.log(\`========================================================\`);

  await context.close();
}

runAutoPoster().catch(console.error);
`;
}

export function generateWindowsBatchFile(): string {
  return `@echo off
chcp 65001 >nul
title FB ĐẨY BÀI - TỰ ĐỘNG ĐĂNG NHÓM FACEBOOK
color 0b

echo ===================================================================
echo   🚀 FB ĐẨY BÀI - CÔNG CỤ TỰ ĐỘNG ĐĂNG BÀI FACEBOOK TRÊN CHROME THẬT
echo ===================================================================
echo.

:: 1. Kiem tra moi truong Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [!] CHUA TIM THAY NODE.JS TREN MAY TINH CUA BAN!
    echo.
    echo De chay duoc cong cu tu dong hoa, ban chi can cai dat Node.js mot lan:
    echo 1. Tai ban LTS mien phi tai: https://nodejs.org/
    echo 2. Cai dat (bam Next lien tuc)
    echo 3. Nhap dup chuot lai vao file nay de chay!
    echo.
    echo Dang tu dong mo trang tai Node.js cho ban...
    start https://nodejs.org/
    echo ===================================================================
    pause
    exit /b
)

echo [✓] Da phat hien Node.js tren may:
node -v
echo.

:: 2. Kiem tra va tu dong cai dat thu vien playwright-core neu chua co
if not exist node_modules\\playwright-core (
    echo [*] Dang chuan bi moi truong va thu vien dieu khien Chrome (Playwright)...
    echo Qua trinh nay chi tai mot lan dau (khoang 10-20 giay)...
    call npm init -y >nul 2>nul
    call npm install playwright-core >nul
    echo [✓] Da cai dat xong thu vien tu dong hoa!
    echo.
)

:: 3. Kiem tra file script fb_auto_post.js
if not exist fb_auto_post.js (
    color 0c
    echo [!] KHONG TIM THAY FILE 'fb_auto_post.js' TRONG CUNG THU MUC!
    echo.
    echo Vui long dam bao ban da tai file 'fb_auto_post.js' tu web app
    echo va de chung cung mot thu muc (vi du: ngoai Desktop hoac mot thu muc bat ky) voi file BAT nay.
    echo ===================================================================
    pause
    exit /b
)

:: 4. Khoi chay script tu dong hoa
echo [*] DANG KHOI CHAY GOOGLE CHROME THAT DE DANG BAI...
echo [!] Ban co the thu nho cua so nay de cong cu tu chay ngam theo lich trinh.
echo -------------------------------------------------------------------
node fb_auto_post.js

echo.
echo ===================================================================
echo [✓] TIEN TRINH DANG BAI DA KET THUC HOAC TAM DUNG.
echo File bao cao ket qua: post_results.json
echo ===================================================================
pause
`;
}

export function generateMacLinuxScript(): string {
  return `#!/bin/bash
echo "==================================================================="
echo "  🚀 FB ĐẨY BÀI - TỰ ĐỘNG ĐĂNG NHÓM FACEBOOK (MAC / LINUX)"
echo "==================================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[!] Không tìm thấy Node.js. Vui lòng cài đặt Node.js tại https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules/playwright-core" ]; then
    echo "[*] Đang cài đặt thư viện playwright-core..."
    npm init -y > /dev/null 2>&1
    npm install playwright-core
fi

echo "[*] Đang chạy script tự động hóa..."
node fb_auto_post.js
`;
}

