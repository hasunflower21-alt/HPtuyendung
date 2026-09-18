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

export function generateWindowsBatchFile(
  groups?: FacebookGroup[],
  spintax?: string,
  config?: ScheduleConfig,
  activeProfile?: FacebookProfile
): string {
  // If params are passed, embed the script directly as Base64 so user only needs 1 file
  let base64Payload = "";
  if (groups && spintax && config) {
    const fullScript = generatePlaywrightScript(groups, spintax, config, activeProfile);
    // Convert to UTF-8 Base64
    const utf8Bytes = new TextEncoder().encode(fullScript);
    let binary = "";
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    base64Payload = btoa(binary);
  }

  return `@echo off
setlocal EnableDelayedExpansion
title FB AUTO POST - TU DONG DANG NHOM FACEBOOK
cls

REM ===================================================================
REM   FB AUTO POST - CONG CU TU DONG DANG BAI FACEBOOK TREN CHROME THAT
REM ===================================================================
echo ===================================================================
echo   FB AUTO POST - CONG CU TU DONG DANG BAI FACEBOOK TREN CHROME
echo ===================================================================
echo.

REM 1. Tao file script fb_auto_post.js tu dong
${
  base64Payload
    ? `echo [*] Dang tao file script tu dong hoa...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$b64 = '${base64Payload}'; $bytes = [System.Convert]::FromBase64String($b64); $js = [System.Text.Encoding]::UTF8.GetString($bytes); [System.IO.File]::WriteAllText('fb_auto_post.js', $js, [System.Text.Encoding]::UTF8)"
`
    : `if not exist fb_auto_post.js (
    echo [!] Khong tim thay file fb_auto_post.js trong cung thu muc!
    echo Vui long dam bao ban da tai file fb_auto_post.js tu web app.
    pause
    exit /b 1
)`
}

REM 2. Kiem tra moi truong Node.js
set "NODE_CMD="
where node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
    echo [OK] Da phat hien Node.js tren he thong.
) else (
    if exist node.exe (
        set "NODE_CMD=node.exe"
        echo [OK] Da tim thay node.exe portable.
    ) else (
        echo [*] May tinh cua ban chua co Node.js.
        echo [*] Dang tu dong tai moi truong chay portable (khoang 5-10 giay)...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $wc = New-Object System.Net.WebClient; try { $wc.DownloadFile('https://nodejs.org/dist/v20.11.1/win-x64/node.exe', 'node.exe'); Write-Host '[OK] Da tai thanh cong node.exe!' } catch { Write-Host '[!] Khong the tai tu dong node.exe: ' $_.Exception.Message }"
        if exist node.exe (
            set "NODE_CMD=node.exe"
        )
    )
)

if "%NODE_CMD%"=="" (
    echo.
    echo ===================================================================
    echo [!] CHUA TIM THAY NODE.JS TREN MAY TINH!
    echo Vui long cai dat Node.js mien phi theo 2 buoc:
    echo 1. Trinh duyet dang mo trang tai: https://nodejs.org/
    echo 2. Tai ban LTS, cai dat va chay lai file nay!
    echo ===================================================================
    start https://nodejs.org/
    pause
    exit /b 1
)

REM 3. Kiem tra thu vien playwright-core
if not exist node_modules\\playwright-core (
    echo [*] Dang chuan bi thu vien dieu khien Chrome (Playwright)...
    echo Qua trinh nay chi chay mot lan duy nhat (khoang 10-15 giay)...
    call npm init -y >nul 2>nul
    call npm install playwright-core >nul 2>nul
    echo [OK] Da chuan bi xong thu vien!
    echo.
)

REM 4. Khoi chay tien trinh dang bai tren Chrome
echo.
echo [*] DANG KHOI CHAY GOOGLE CHROME DE BAT DAU DANG BAI...
echo [!] Ban co the thu nho cua so nay de bot tu dong chay ngam.
echo -------------------------------------------------------------------
%NODE_CMD% fb_auto_post.js

echo.
echo ===================================================================
echo [OK] TIEN TRINH DANG BAI DA HOAN TAT HOAC TAM DUNG.
echo Bao cao ket qua duoc luu tai file: post_results.json
echo ===================================================================
pause
`;
}

export function generateBookmarkletCode(
  groups: FacebookGroup[],
  spintax: string,
  config: ScheduleConfig
): string {
  const activeGroups = groups.filter((g) => g.isActive);
  const queueData = JSON.stringify(
    activeGroups.map((g) => ({ id: g.id, name: g.name, url: g.url }))
  );
  const spintaxEscaped = JSON.stringify(spintax);

  return `javascript:(function(){
  if(window.__FB_AUTO_RUNNING){ alert('FB Auto Post đang chạy trên tab này!'); return; }
  window.__FB_AUTO_RUNNING = true;
  
  const groups = ${queueData};
  const spintax = ${spintaxEscaped};
  const minDelay = ${config.minDelaySeconds};
  const maxDelay = ${config.maxDelaySeconds};
  
  function resolveSpin(text){
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
  
  const banner = document.createElement('div');
  banner.id = 'fb-auto-banner';
  banner.style = 'position:fixed;top:16px;right:16px;z-index:999999;background:#1e293b;color:#fff;padding:16px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:sans-serif;font-size:13px;max-width:340px;border:2px solid #3b82f6;';
  banner.innerHTML = '<div style="font-weight:bold;color:#60a5fa;margin-bottom:6px;display:flex;justify-content:space-between;"><span>🚀 FB Tự Động Đăng Bài</span><button id="fb-auto-close" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-weight:bold;">✕</button></div><div id="fb-auto-status" style="line-height:1.4;">Đã tải ' + groups.length + ' nhóm. Đang chuẩn bị bài đăng...</div><div id="fb-auto-progress" style="margin-top:8px;font-size:11px;color:#cbd5e1;"></div>';
  document.body.appendChild(banner);
  
  document.getElementById('fb-auto-close').onclick = function(){
    banner.remove();
    window.__FB_AUTO_RUNNING = false;
  };

  let currentIndex = 0;
  
  function processNextGroup(){
    if(currentIndex >= groups.length){
      document.getElementById('fb-auto-status').innerHTML = '<span style="color:#4ade80;font-weight:bold;">🎉 ĐÃ HOÀN TẤT ĐĂNG TẤT CẢ ' + groups.length + ' NHÓM!</span>';
      return;
    }
    const g = groups[currentIndex];
    const postContent = resolveSpin(spintax);
    document.getElementById('fb-auto-status').innerHTML = '<b>[' + (currentIndex + 1) + '/' + groups.length + ']</b> Đang đăng vào nhóm:<br><span style="color:#93c5fd;">' + g.name + '</span>';
    document.getElementById('fb-auto-progress').innerText = 'Nội dung: "' + postContent.substring(0, 50) + '..."';
    
    // Copy content to clipboard automatically
    navigator.clipboard.writeText(postContent);
    
    // Open group
    window.open(g.url, '_blank');
    currentIndex++;
    
    const waitTime = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    let remaining = waitTime;
    const timer = setInterval(() => {
      remaining--;
      if(remaining <= 0){
        clearInterval(timer);
        processNextGroup();
      } else {
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        document.getElementById('fb-auto-progress').innerText = '⏳ Nghỉ chống Checkpoint: ' + (min > 0 ? min + 'p ' : '') + sec + 's...';
      }
    }, 1000);
  }
  
  processNextGroup();
})();`;
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


