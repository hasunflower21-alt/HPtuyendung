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
 * Phiên bản: Chống phát hiện (Stealth Mode) + Dùng trực tiếp Chrome thật
 * -------------------------------------------------------------
 * NICK FACEBOOK: ${profileName}
 * PROFILE CHROME: ${chromeProfileDir}
 * -------------------------------------------------------------
 */

const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const os = require('os');

// TỰ ĐỘNG TÌM ĐƯỜNG DẪN GOOGLE CHROME THẬT TRÊN MÁY TÍNH
function getRealChromeUserDataDir() {
  if (process.env.CHROME_USER_DATA) return process.env.CHROME_USER_DATA;
  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome');
  }
  return path.join(os.homedir(), '.config', 'google-chrome');
}

function getChromeExecutablePath() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  if (process.platform === 'win32') {
    const paths = [
      'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
      'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else if (process.platform === 'darwin') {
    const p = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

// CẤU HÌNH THỜI GIAN & PROFILE NICK FACEBOOK
const CONFIG = {
  userDataDir: getRealChromeUserDataDir(),
  profileDirectory: '${chromeProfileDir}',
  profileName: '${profileName.replace(/'/g, "\\'")}',
  executablePath: getChromeExecutablePath(),
  minDelaySec: ${config.minDelaySeconds},
  maxDelaySec: ${config.maxDelaySeconds},
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function runAutoPoster() {
  console.log('========================================================');
  console.log('🚀 FB ĐẨY BÀI - KHỞI ĐỘNG TỰ ĐỘNG HÓA GOOGLE CHROME');
  console.log('👤 NICK FACEBOOK: ' + CONFIG.profileName);
  console.log('📂 Chrome Profile: ' + CONFIG.profileDirectory);
  console.log('📋 Thư mục dữ liệu Chrome: ' + CONFIG.userDataDir);
  console.log('🎯 Tổng số nhóm mục tiêu: ' + TARGET_GROUPS.length);
  console.log('========================================================\\n');

  const launchArgs = [
    '--disable-blink-features=AutomationControlled',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--disable-notifications',
  ];

  if (CONFIG.profileDirectory && CONFIG.profileDirectory !== 'Default') {
    launchArgs.push(\`--profile-directory=\${CONFIG.profileDirectory}\`);
  }

  let context;
  try {
    context = await chromium.launchPersistentContext(CONFIG.userDataDir, {
      headless: false,
      executablePath: CONFIG.executablePath,
      args: launchArgs,
      viewport: { width: 1280, height: 850 },
    });
  } catch (launchErr) {
    console.warn('⚠️ Không thể mở trực tiếp profile gốc (có thể Chrome đang mở). Thử mở chế độ độc lập...');
    context = await chromium.launchPersistentContext('./chrome-auto-session', {
      headless: false,
      executablePath: CONFIG.executablePath,
      args: launchArgs,
      viewport: { width: 1280, height: 850 },
    });
  }

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

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
    console.log(\`📌 [\${i + 1}/\${TARGET_GROUPS.length}] Đang mở nhóm: \${group.name}\`);
    console.log(\`🌐 URL: \${group.url}\`);

    let isSuccess = false;
    let groupContent = '';
    let status = 'error';
    let note = '';

    try {
      await page.goto(group.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await sleep(randomDelay(3000, 5000));

      // Lướt nhẹ
      await page.mouse.wheel(0, randomDelay(200, 500));
      await sleep(1500);

      groupContent = resolveSpintax(SPINTAX_CONTENT);
      console.log(\`📝 Nội dung chuẩn bị đăng:\n"\${groupContent.substring(0, 75)}..."\`);

      // 1. Tìm nút mở ô soạn thảo bài viết
      const writePostSelectors = [
        'div[role="button"]:has-text("Bạn đang nghĩ gì")',
        'div[role="button"]:has-text("Bạn viết gì đi")',
        'div[role="button"]:has-text("Viết bài thảo luận")',
        'div[role="button"]:has-text("Tạo bài viết công khai")',
        'div[role="button"]:has-text("Write something")',
        'div[role="button"]:has-text("Create a public post")',
        'div[role="region"] div[role="button"][tabindex="0"]',
      ];

      let writeBtn = null;
      for (const sel of writePostSelectors) {
        try {
          writeBtn = await page.waitForSelector(sel, { timeout: 4000 });
          if (writeBtn) break;
        } catch (e) {}
      }

      if (!writeBtn) {
        console.warn('⚠️ Không tìm thấy ô đăng bài (chưa tham gia nhóm hoặc nhóm tắt đăng tự do).');
        skippedCount++;
        status = 'blocked';
        note = 'Không tìm thấy ô đăng bài hoặc chưa tham gia nhóm';
      } else {
        await writeBtn.click();
        await sleep(2500);

        // 2. Tìm ô nhập nội dung
        const editorSelector = 'div[role="dialog"] div[role="textbox"][contenteditable="true"], div[role="textbox"][contenteditable="true"], div[data-lexical-editor="true"]';
        const editorBox = await page.waitForSelector(editorSelector, { timeout: 8000 });

        if (editorBox) {
          await editorBox.click();
          await sleep(500);
          // Gõ nội dung chuẩn xác bằng keyboard native event
          await page.keyboard.insertText(groupContent);
          await sleep(2500);

          // 3. Tìm và click nút Đăng
          const postBtnSelectors = [
            'div[role="dialog"] div[aria-label="Đăng"]',
            'div[role="dialog"] div[aria-label="Post"]',
            'div[role="dialog"] div[role="button"]:has-text("Đăng")',
            'div[role="dialog"] div[role="button"]:has-text("Post")',
            'div[aria-label="Đăng"][role="button"]',
          ];

          let postButton = null;
          for (const btnSel of postBtnSelectors) {
            try {
              postButton = await page.waitForSelector(btnSel, { timeout: 3000 });
              if (postButton) break;
            } catch (e) {}
          }

          if (postButton) {
            await postButton.click();
            await sleep(5000);
            console.log(\`✅ [THÀNH CÔNG] Đã gửi bài vào: \${group.name}\`);
            successCount++;
            isSuccess = true;
            status = 'success';
            note = 'Đã gửi bài thành công';
          } else {
            console.warn('⚠️ Không bấm được nút Đăng trong popup.');
            status = 'error';
            note = 'Không tìm thấy nút bấm Đăng';
          }
        }
      }
    } catch (err) {
      console.error(\`❌ Lỗi xử lý nhóm \${group.name}:\`, err.message);
      status = 'error';
      note = err.message;
    }

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

    try {
      fs.writeFileSync('post_results.json', JSON.stringify(postReports, null, 2), 'utf-8');
    } catch (e) {}

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
  console.log(\`📁 Kết quả chi tiết đã được lưu tại file: post_results.json\`);
  console.log(\`========================================================\`);

  await sleep(3000);
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
  let base64Payload = "";
  if (groups && spintax && config) {
    const fullScript = generatePlaywrightScript(groups, spintax, config, activeProfile);
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

echo ===================================================================
echo   FB AUTO POST - CONG CU TU DONG DANG BAI FACEBOOK TREN CHROME
echo ===================================================================
echo.

${
  base64Payload
    ? `echo [*] Dang tao file script tu dong hoa...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$b64 = '${base64Payload}'; $bytes = [System.Convert]::FromBase64String($b64); $js = [System.Text.Encoding]::UTF8.GetString($bytes); [System.IO.File]::WriteAllText('fb_auto_post.js', $js, [System.Text.Encoding]::UTF8)"
`
    : `if not exist fb_auto_post.js (
    echo [!] Khong tim thay file fb_auto_post.js!
    pause
    exit /b 1
)`
}

REM Kiem tra neu Chrome dang chay, thong bao dong de mo dung Profile Nick Facebook
tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I /N "chrome.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo.
    echo [Luu y]: Google Chrome dang mo tren may.
    echo De Bot co the truy cap Nick Facebook da dang nhap tren Chrome,
    echo Chrome can duoc dong lai truoc khi Bot mo cua so tu dong.
    echo.
    set /p CLOSE_CHROME="Ban co muon tu dong dong Chrome de Bot bat dau ngay? (Y/N, mac dinh Y): "
    if "!CLOSE_CHROME!"=="" set CLOSE_CHROME=Y
    if /i "!CLOSE_CHROME!"=="Y" (
        taskkill /F /IM chrome.exe >nul 2>nul
        timeout /t 2 /nobreak >nul
        echo [OK] Da dong Chrome san sang cho Bot!
    )
)

REM Kiem tra moi truong Node.js
set "NODE_CMD="
where node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
    echo [OK] Da phat hien Node.js tren he thong.
) else (
    echo [*] May tinh cua ban chua co Node.js.
    echo [*] Dang thu cai dat Node.js tu dong bang Windows Package Manager...
    where winget >nul 2>nul
    if !errorlevel! equ 0 (
        echo [*] Dang cai dat Node.js LTS tu dong... Vui long doi khoang 1 phut...
        winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
        timeout /t 3 /nobreak >nul
    ) else (
        echo [*] Dang tai trinh cai dat Node.js chinh thuc...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { (New-Object System.Net.WebClient).DownloadFile('https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi', 'node_setup.msi'); Write-Host '[OK] Dang cai dat Node.js...'; Start-Process msiexec.exe -ArgumentList '/i node_setup.msi /passive /norestart' -Wait; Remove-Item 'node_setup.msi' -ErrorAction SilentlyContinue } catch { Write-Host '[!] Khong the tai tu dong: ' $_.Exception.Message }"
    )
    where node >nul 2>nul
    if !errorlevel! equ 0 (
        set "NODE_CMD=node"
    )
)

if "%NODE_CMD%"=="" (
    REM Thu tim node trong cac duong dan mac dinh
    if exist "%ProgramFiles%\nodejs\node.exe" (
        set "NODE_CMD=%ProgramFiles%\nodejs\node.exe"
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    ) else if exist "%LocalAppData%\Programs\node\node.exe" (
        set "NODE_CMD=%LocalAppData%\Programs\node\node.exe"
        set "PATH=%LocalAppData%\Programs\node;%PATH%"
    )
)

if "%NODE_CMD%"=="" (
    echo.
    echo ===================================================================
    echo [!] CHUA TIM THAY NODE.JS TREN MAY TINH!
    echo Vui long cai dat Node.js mien phi (chinh chu):
    echo 1. Trinh duyet dang mo trang tai: https://nodejs.org/
    echo 2. Bap tai ban LTS (khuyen nghi), cai dat xong hay mo lai file nay!
    echo ===================================================================
    start https://nodejs.org/
    pause
    exit /b 1
)

REM Kiem tra thu vien playwright-core
if not exist node_modules\playwright-core (
    echo [*] Dang chuan bi thu vien dieu khien Chrome (playwright-core)...
    call npm init -y >nul 2>nul
    call npm install playwright-core --no-audit --no-fund >nul 2>nul
    if not exist node_modules\playwright-core (
        echo [*] Dang thu tai playwright-core qua npx...
        call npx playwright-core --version >nul 2>nul
    )
    echo [OK] Da chuan bi xong thu vien!
    echo.
)

echo.
echo [*] DANG KHOI CHAY GOOGLE CHROME DE BAT DAU DANG BAI...
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

  return `javascript:(async function(){
  if(window.__FB_AUTO_POSTER_ACTIVE){
    alert('FB Auto Poster đang hoạt động trên trang này!');
    return;
  }
  window.__FB_AUTO_POSTER_ACTIVE = true;

  const spintax = ${spintaxEscaped};
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
  banner.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999999;background:#0f172a;color:#f8fafc;padding:18px;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.6);font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;max-width:380px;border:2px solid #3b82f6;';
  banner.innerHTML = '<div style="font-weight:bold;color:#60a5fa;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:14px;">⚡ TỰ ĐỘNG ĐĂNG BÀI FACEBOOK</span><button id="fb-auto-close" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-weight:bold;font-size:16px;">✕</button></div><div id="fb-auto-status" style="line-height:1.5;color:#e2e8f0;">Đang tìm ô đăng bài trên nhóm hiện tại...</div><div id="fb-auto-btn-box" style="margin-top:12px;display:flex;gap:8px;"><button id="fb-auto-run-now" style="background:#2563eb;color:#fff;border:none;padding:8px 14px;border-radius:8px;font-weight:bold;cursor:pointer;flex:1;">✍️ Đăng Bài Ngay</button></div>';
  document.body.appendChild(banner);

  document.getElementById('fb-auto-close').onclick = function(){
    banner.remove();
    window.__FB_AUTO_POSTER_ACTIVE = false;
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function triggerPostOnCurrentGroup(){
    const statusEl = document.getElementById('fb-auto-status');
    const content = resolveSpin(spintax);
    statusEl.innerHTML = '⏳ Đang mở ô soạn thảo bài viết...';

    // 1. Find composer trigger
    const triggers = Array.from(document.querySelectorAll('div[role="button"], div[role="region"] div[tabindex="0"]')).filter(el => {
      const t = el.innerText || '';
      return t.includes('Bạn đang nghĩ gì') || t.includes('Viết bài thảo luận') || t.includes('Tạo bài viết') || t.includes('Write something') || t.includes('Bạn viết gì đi');
    });

    if(triggers.length === 0){
      statusEl.innerHTML = '<span style="color:#f87171;">⚠️ Không tìm thấy ô đăng bài. Hãy chắc chắn bạn đã vào một Nhóm Facebook và tài khoản đã được duyệt vào nhóm!</span>';
      return;
    }

    triggers[0].click();
    await sleep(2500);

    // 2. Find editable textbox
    const editor = document.querySelector('div[role="dialog"] div[role="textbox"][contenteditable="true"], div[role="textbox"][contenteditable="true"], div[data-lexical-editor="true"]');
    if(!editor){
      statusEl.innerHTML = '<span style="color:#f87171;">⚠️ Đã mở popup nhưng không tìm thấy khung nhập văn bản.</span>';
      return;
    }

    statusEl.innerHTML = '📝 Đang nhập nội dung bài viết...';
    editor.focus();
    await sleep(400);
    document.execCommand('insertText', false, content);
    await sleep(2500);

    // 3. Find Post button
    const postBtns = Array.from(document.querySelectorAll('div[role="dialog"] div[aria-label="Đăng"], div[role="dialog"] div[aria-label="Post"], div[role="dialog"] div[role="button"]')).filter(el => {
      const t = (el.innerText || el.getAttribute('aria-label') || '').trim();
      return t === 'Đăng' || t === 'Post';
    });

    if(postBtns.length > 0){
      statusEl.innerHTML = '🚀 Đang bấm nút Đăng...';
      postBtns[0].click();
      await sleep(3000);
      statusEl.innerHTML = '<span style="color:#4ade80;font-weight:bold;">🎉 ĐÃ GỬI BÀI ĐĂNG THÀNH CÔNG!</span><br><span style="font-size:11px;color:#94a3b8;">Bạn có thể mở nhóm tiếp theo và bấm "Đăng Bài Ngay".</span>';
    } else {
      statusEl.innerHTML = '<span style="color:#facc15;">Đã điền nội dung xong. Bạn có thể bấm nút <b>Đăng</b> màu xanh trên Facebook.</span>';
    }
  }

  document.getElementById('fb-auto-run-now').onclick = triggerPostOnCurrentGroup;
  triggerPostOnCurrentGroup();
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


