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
