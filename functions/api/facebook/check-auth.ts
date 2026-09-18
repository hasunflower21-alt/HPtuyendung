export async function onRequestPost(context: any) {
  try {
    const { request } = context;
    const body = await request.json();
    const { tokenOrCookie } = body;

    if (!tokenOrCookie || typeof tokenOrCookie !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Vui lòng nhập Access Token (EAA...) hoặc Cookie Facebook.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cleanInput = tokenOrCookie.trim();

    // 1. Check if input is Cookie containing c_user
    const cUserMatch = cleanInput.match(/c_user=(\d+)/);
    if (cUserMatch) {
      const fbUid = cUserMatch[1];
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: fbUid,
            name: `Facebook User (${fbUid})`,
            avatarUrl: `https://graph.facebook.com/${fbUid}/picture?type=large`,
          },
          groups: [],
          message: `Đã nhận diện Cookie hợp lệ cho UID: ${fbUid}!`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Check if input is a Graph API Access Token (starts with EAA)
    if (cleanInput.startsWith("EAA")) {
      const userRes = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name,picture.width(150).height(150)&access_token=${encodeURIComponent(cleanInput)}`
      );
      const userData = (await userRes.json()) as any;

      if (userData.error) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              userData.error.message ||
              "Token Facebook không hợp lệ hoặc đã hết hạn. Vui lòng lấy Token mới (bắt đầu bằng EAA...).",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      let userGroups: any[] = [];
      try {
        const groupRes = await fetch(
          `https://graph.facebook.com/v19.0/me/groups?fields=id,name,privacy,member_count&limit=100&access_token=${encodeURIComponent(cleanInput)}`
        );
        const groupData = (await groupRes.json()) as any;
        if (groupData.data && Array.isArray(groupData.data)) {
          userGroups = groupData.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            url: `https://www.facebook.com/groups/${g.id}`,
            category: "discussion",
            privacy: g.privacy ? g.privacy.toLowerCase() : "public",
            memberCount: g.member_count ? `${g.member_count} thành viên` : undefined,
            isActive: true,
            shift: "all",
            isVerifiedSafe: true,
            autoApprove: true,
          }));
        }
      } catch (e) {
        console.warn("Không thể lấy danh sách nhóm qua Token:", e);
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: userData.id,
            name: userData.name,
            avatarUrl: userData.picture?.data?.url || `https://graph.facebook.com/${userData.id}/picture?type=large`,
          },
          groups: userGroups,
          message: `Đã kết nối thành công tài khoản "${userData.name}"!`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Định dạng Token hoặc Cookie không đúng. Token thường bắt đầu bằng EAA...",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Lỗi kết nối tới máy chủ Facebook: " + (error.message || "Không xác định"),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
