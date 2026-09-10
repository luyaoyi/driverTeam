const state = {
  page: "list",
  editing: null,
  readonly: false,
  mileageEnabled: false,
  tiers: [],
  activities: [
    { code: "DUO-202609-001", name: "金秋组队完单活动", begin: "2026-09-10 00:00:00", end: "2026-09-30 23:59:59", status: 1, modifier: "张运营", modified: "2026-09-03 16:28:10" },
    { code: "DUO-202608-002", name: "组队完单活动测试", begin: "2026-08-15 00:00:00", end: "2026-08-31 23:59:59", status: 0, modifier: "李产品", modified: "2026-08-14 11:06:32" },
  ],
  teams: [
    { teamId:"TEAM-09001286", code:"DUO-202609-001", mode:"自行邀请", formed:"2026-09-12 09:18:25", a:"10827361", ao:2, b:"10839175", bo:3, highest:"5单阶梯", reward:"部分失败" },
    { teamId:"TEAM-09001192", code:"DUO-202609-001", mode:"随机匹配", formed:"2026-09-11 18:36:02", a:"10762589", ao:4, ar:"86%", b:"10901822", bo:3, br:"82%", highest:"7单阶梯", reward:"发放成功" },
    { teamId:"TEAM-09001031", code:"DUO-202609-001", mode:"自行邀请", formed:"2026-09-10 12:08:44", a:"10663317", ao:0, b:"10877420", bo:4, highest:"未发放", reward:"未达条件" },
    { teamId:"TEAM-09000982", code:"DUO-202609-001", mode:"随机匹配", formed:"2026-09-10 08:42:19", a:"10552218", ao:1, ar:"91%", b:"10882901", bo:2, br:"88%", highest:"3单阶梯", reward:"发放成功" },
  ],
};

const main = document.querySelector("#main");
const modalRoot = document.querySelector("#modalRoot");

document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.page)));
document.querySelector("#navGroup").addEventListener("click", () => {
  const group = document.querySelector("#navGroup");
  const children = document.querySelector("#navGroupChildren");
  const expanded = group.getAttribute("aria-expanded") === "true";
  group.setAttribute("aria-expanded", String(!expanded));
  children.classList.toggle("collapsed", expanded);
  document.querySelector("#navGroupArrow").textContent = expanded ? "›" : "⌄";
});

function navigate(page) {
  state.page = page;
  document.querySelectorAll(".subnav-item").forEach(x => x.classList.toggle("active", x.dataset.page === (page === "edit" ? "list" : page)));
  modalRoot.innerHTML = "";
  render();
}

function render() {
  if (state.page === "list") renderList();
  if (state.page === "edit") renderEdit();
  if (state.page === "data") renderData();
}

function renderList() {
  main.innerHTML = `
    <div class="breadcrumb"><a>真车主组队完单活动</a><i>›</i><span>活动配置</span></div>
    <section class="panel">
      <div class="query-grid">
        <div class="form-field"><label>活动ID：</label><input id="qCode" placeholder="请输入" /></div>
        <div class="form-field"><label>活动名称：</label><input id="qName" placeholder="请输入" /></div>
        <div class="form-field"><label>活动状态：</label><select id="qStatus"><option value="">请选择</option><option value="1">有效</option><option value="0">无效</option></select></div>
      </div>
      <div class="query-actions">
        <button class="btn btn-primary" id="queryBtn">⌕ 查询</button>
        <button class="btn btn-primary" id="resetBtn">↻ 重置</button>
        <button class="btn btn-primary" id="newBtn">＋ 新建</button>
      </div>
    </section>
    <section>
      <div class="table-titlebar"><span class="table-title">活动配置列表</span><span style="color:#909399;font-size:12px">共 ${state.activities.length} 条</span></div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>活动ID</th><th>活动名称</th><th>活动类型</th><th>有效期</th><th>活动状态</th><th>更新人</th><th>更新时间</th><th>操作</th></tr></thead><tbody id="activityRows"></tbody></table></div>
      <div class="pagination"><span>共 ${state.activities.length} 条</span><select style="width:90px"><option>10条/页</option></select><span class="page-box">‹</span><span class="page-box active">1</span><span class="page-box">›</span><span>前往</span><input style="width:46px;height:28px" value="1"><span>页</span></div>
    </section>`;
  drawActivityRows(state.activities);
  document.querySelector("#queryBtn").onclick = filterActivities;
  document.querySelector("#resetBtn").onclick = () => { ["qCode","qName","qStatus"].forEach(id => document.querySelector(`#${id}`).value = ""); drawActivityRows(state.activities); };
  document.querySelector("#newBtn").onclick = () => openEdit(null, false);
}

function drawActivityRows(rows) {
  const body = document.querySelector("#activityRows");
  if (!rows.length) { body.innerHTML = `<tr><td colspan="9" class="empty">暂无数据</td></tr>`; return; }
  body.innerHTML = rows.map((x,i) => `<tr>
    <td>${i+1}</td><td>${x.code}</td><td>${x.name}</td><td>真车主组队完单活动</td><td>${x.begin} 至 ${x.end}</td>
    <td><span class="tag ${x.status ? "tag-success" : "tag-info"}">${x.status ? "有效" : "无效"}</span></td><td>${x.modifier}</td><td>${x.modified}</td>
    <td><button class="btn btn-text" data-view="${x.code}">查看</button><button class="btn btn-text" data-edit="${x.code}">编辑</button><button class="btn btn-text" data-log="${x.code}">日志</button></td>
  </tr>`).join("");
  body.querySelectorAll("[data-view]").forEach(b => b.onclick = () => openEdit(b.dataset.view, true));
  body.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openEdit(b.dataset.edit, false));
  body.querySelectorAll("[data-log]").forEach(b => b.onclick = () => showLogs(b.dataset.log));
}

function filterActivities() {
  const code = document.querySelector("#qCode").value.trim().toLowerCase();
  const name = document.querySelector("#qName").value.trim().toLowerCase();
  const status = document.querySelector("#qStatus").value;
  drawActivityRows(state.activities.filter(x => (!code || x.code.toLowerCase().includes(code)) && (!name || x.name.toLowerCase().includes(name)) && (status === "" || String(x.status) === status)));
}

function openEdit(code, readonly) {
  state.editing = code ? state.activities.find(x => x.code === code) : null;
  state.readonly = readonly;
  state.mileageEnabled = Boolean(code);
  state.tiers = code ? [
    { threshold:3, mode:"unified", commonPrizeType:"bonus", commonName:"3单达标奖励", commonCode:"PRIZE-DUO-3", commonImage:"https://example.com/prize-3.png", memberPrizeType:"", memberName:"", memberCode:"", memberImage:"", normalPrizeType:"", normalName:"", normalCode:"", normalImage:"" },
    { threshold:5, mode:"member", commonPrizeType:"", commonName:"", commonCode:"", commonImage:"", memberPrizeType:"membership", memberName:"会员5单奖励", memberCode:"PRIZE-M-5", memberImage:"https://example.com/member-prize-5.png", normalPrizeType:"bonus", normalName:"非会员5单奖励", normalCode:"PRIZE-N-5", normalImage:"https://example.com/normal-prize-5.png" },
    { threshold:7, mode:"unified", commonPrizeType:"bonus", commonName:"7单达标奖励", commonCode:"PRIZE-DUO-7", commonImage:"https://example.com/prize-7.png", memberPrizeType:"", memberName:"", memberCode:"", memberImage:"", normalPrizeType:"", normalName:"", normalCode:"", normalImage:"" },
  ] : [{ threshold:3, mode:"unified", commonPrizeType:"", commonName:"", commonCode:"", commonImage:"", memberPrizeType:"", memberName:"", memberCode:"", memberImage:"", normalPrizeType:"", normalName:"", normalCode:"", normalImage:"" }];
  state.page = "edit";
  render();
}

function renderEdit() {
  const x = state.editing || { code:"保存后生成", name:"", begin:"2026-09-10 00:00:00", end:"2026-09-30 23:59:59", status:1 };
  const frontStyle = {
    prizeValue: x.prizeValue ?? (state.editing ? "199" : ""),
    headerImage: x.headerImage ?? (state.editing ? "https://example.com/landing-header.png" : ""),
    unmatchedBackgroundImage: x.unmatchedBackgroundImage ?? x.backgroundImage ?? (state.editing ? "https://example.com/landing-unmatched-background.png" : ""),
    matchedBackgroundImage: x.matchedBackgroundImage ?? x.backgroundImage ?? (state.editing ? "https://example.com/landing-matched-background.png" : ""),
    appHomeHeaderImage: x.appHomeHeaderImage ?? (state.editing ? "https://example.com/app-home-header.png" : ""),
    miniProgramHomeHeaderImage: x.miniProgramHomeHeaderImage ?? (state.editing ? "https://example.com/mini-program-home-header.png" : ""),
    homePopupImage: x.homePopupImage ?? (state.editing ? "https://example.com/home-popup.png" : ""),
    orderDetailBannerImage: x.orderDetailBannerImage ?? x.orderDetailPageImage ?? (state.editing ? "https://example.com/order-detail-banner.png" : ""),
    activitySubtitle: x.activitySubtitle ?? (state.editing ? "邀请好友组队完单，携手赢取阶梯奖励" : ""),
    ruleDescription: x.ruleDescription ?? (state.editing ? "1. 两位司机组队成功后开始累计符合条件的订单。\n2. 双方均至少完成1单后，按团队总完单量发放最高满足阶梯的奖励。\n3. 组队成功后不支持退出、解散或更换队友。" : ""),
    shareTitle: x.shareTitle ?? (state.editing ? "邀你参加真车主组队完单活动" : ""),
    shareSubtitle: x.shareSubtitle ?? "",
    shareImage: x.shareImage ?? x.miniShareImage ?? "",
  };
  const messagePushNodes = Array.isArray(x.messagePushNodes) ? x.messagePushNodes : (state.editing ? ["team_success"] : []);
  const ro = state.readonly ? "disabled" : "";
  main.innerHTML = `
    <div class="breadcrumb"><a id="backList">真车主组队完单活动</a><i>›</i><a id="backList2">活动配置</a><i>›</i><span>${state.readonly ? "查看" : state.editing ? "编辑" : "新建"}</span></div>
    <div class="page-header"><div><h1>${state.readonly ? "查看组队完单活动" : state.editing ? "编辑组队完单活动" : "新建组队完单活动"}</h1><p>配置组队、订单累计、阶梯奖励、前端样式及消息推送</p></div><span class="tag ${x.status ? "tag-success" : "tag-info"}">${x.status ? "有效" : "无效"}</span></div>
    <form id="editForm">
      ${card("一、基础信息", `
        <div class="edit-grid">
          ${item("活动名称", `<input id="activityName" value="${x.name}" placeholder="请输入活动名称" ${ro}/><div class="error-text">请输入活动名称</div>`, true, "activityNameItem")}
          ${item("业务类型", `<select disabled><option>用车</option></select>`)}
          ${item("活动时间", `<div style="display:flex;align-items:center;gap:8px"><input id="begin" value="${x.begin}" ${ro}/><span>至</span><input id="end" value="${x.end}" ${ro}/></div><div class="error-text">请填写正确的活动时间；有效活动时间不可与其他有效活动重叠</div>`, true, "timeItem", "full")}
          ${item("活动状态", radios("status", [["1","有效"],["0","无效"]], String(x.status), ro), true)}
        </div>`)}
      ${card("二、组队配置", `
        <div class="edit-grid">
          ${item("支持组队方式", `<div class="radio-row"><label><input type="checkbox" checked disabled> 自行邀请</label><label><input type="checkbox" checked disabled> 随机匹配</label></div><div class="helper">两种方式固定同时支持；匹配阶段互斥，组队成功后不可退出、解散或更换队友</div>`, true, "", "full")}
          ${item("随机匹配时长", `<div style="display:flex;align-items:center;gap:8px"><input id="matchDuration" class="input-short" type="number" min="1" max="60" step="1" value="30" ${ro}/><span>分钟</span></div><div class="helper">取值 1～60；匹配阶段不允许主动取消，超时后可再次开启</div><div class="error-text">请输入 1～60 范围内的整数</div>`, true, "matchDurationItem")}
          ${item("接完率差值", `<div style="display:flex;align-items:center;gap:8px"><input id="rateDiff" class="input-short" type="number" min="0" max="100" step="1" value="10" ${ro}/><span>个百分点</span></div><div class="helper">接完率在开启匹配时查询并固定；查询失败则开启失败</div><div class="error-text">请输入 0～100 范围内的整数</div>`, true, "rateDiffItem")}
          <div class="module-tip">ⓘ 候选人优先选择开启随机匹配时间最接近的司机；时间相同时随机选择一人。</div>
        </div>`)}
      ${card("三、订单统计配置", `
        <div class="edit-grid">
          ${item("订单限制条件", `<div class="radio-row"><label><input id="limitMileage" type="checkbox" ${state.mileageEnabled ? "checked" : ""} ${ro}> 最低接单公里数</label></div><div class="helper">支持多选；未选择限制条件时，订单不受对应条件限制</div>`, false, "", "full")}
          ${item("最低接单公里数", `<div style="display:flex;align-items:center;gap:8px"><input id="minMileage" class="input-short" type="number" min="1" max="9999" step="1" value="5" ${ro}/><span>公里</span></div><div class="helper">接单公里数大于等于配置值，订单才可计入</div><div class="error-text">请输入 1～9999 范围内的整数</div>`, true, "mileageItem", "full")}
          <div class="module-tip">ⓘ 订单统计规则：仅处理活动时间内收到的订单解冻 MQ；反查订单详情后，接单时间须晚于组队成功时间；若订单乘客包含任一队员，则订单不计入；每个订单在同一活动下仅统计一次。</div>
        </div>`)}
      ${card("四、阶梯奖励配置", `
        <div style="margin-bottom:14px;color:#606266">双方均至少完成 1 单后，发放当前最高满足阶梯；此前跳过的低阶奖励不补发。每个阶梯向 A、B 各发放一份非现金奖励。</div>
        <div id="tiers"></div>
        ${state.readonly ? "" : `<button type="button" class="btn btn-primary" id="addTier">＋ 添加阶梯</button>`}`)}
      ${card("五、前端样式", `
        <div class="edit-grid">
          ${item("奖品价值", `<div class="inline-control"><input id="prizeValue" class="input-short" type="number" min="1" max="9999" step="0.01" value="${frontStyle.prizeValue}" placeholder="请输入奖品价值" ${ro}/><span>元</span></div><div class="error-text">请输入 1～9999 范围内的奖品价值</div>`, true, "prizeValueItem")}
          ${item("落地页头图", `${imageUpload("headerImage", frontStyle.headerImage, ro)}<div class="error-text">请上传落地页头图</div>`, true, "headerImageItem")}
          ${item("未组队背景图", `${imageUpload("unmatchedBackgroundImage", frontStyle.unmatchedBackgroundImage, ro)}<div class="error-text">请上传未组队背景图</div>`, true, "unmatchedBackgroundImageItem")}
          ${item("已组队背景图", `${imageUpload("matchedBackgroundImage", frontStyle.matchedBackgroundImage, ro)}<div class="error-text">请上传已组队背景图</div>`, true, "matchedBackgroundImageItem")}
          ${item("首页头图-APP", `${imageUpload("appHomeHeaderImage", frontStyle.appHomeHeaderImage, ro)}<div class="error-text">请上传首页头图-APP</div>`, true, "appHomeHeaderImageItem")}
          ${item("首页头图-小程序", `${imageUpload("miniProgramHomeHeaderImage", frontStyle.miniProgramHomeHeaderImage, ro)}<div class="error-text">请上传首页头图-小程序</div>`, true, "miniProgramHomeHeaderImageItem")}
          ${item("首页弹窗", `${imageUpload("homePopupImage", frontStyle.homePopupImage, ro)}<div class="error-text">请上传首页弹窗图片</div>`, true, "homePopupImageItem")}
          ${item("订单详情页 Banner", `${imageUpload("orderDetailBannerImage", frontStyle.orderDetailBannerImage, ro)}<div class="error-text">请上传订单详情页 Banner</div>`, true, "orderDetailBannerImageItem")}
          ${item("活动副标题", `<textarea id="activitySubtitle" class="multiline-input" placeholder="请输入活动副标题" ${ro}>${frontStyle.activitySubtitle}</textarea><div class="error-text">请输入活动副标题</div>`, true, "activitySubtitleItem", "full")}
          ${item("规则说明", `<textarea id="ruleDescription" class="multiline-input tall" placeholder="请输入活动规则说明" ${ro}>${frontStyle.ruleDescription}</textarea><div class="error-text">请输入规则说明</div>`, true, "ruleItem", "full")}
          ${item("分享主标题", `<input id="shareTitle" value="${frontStyle.shareTitle}" placeholder="请输入分享主标题" ${ro}/><div class="error-text">请输入分享主标题</div>`, true, "shareTitleItem")}
          ${item("分享副标题", `<input id="shareSubtitle" value="${frontStyle.shareSubtitle}" placeholder="请输入分享副标题" ${ro}/>`)}
          ${item("分享图", imageUpload("shareImage", frontStyle.shareImage, ro))}
        </div>`)}
      ${card("六、消息推送", `
        <div class="edit-grid">
          ${item("消息推送节点", `<div class="radio-row"><label><input id="pushTeamSuccess" type="checkbox" value="team_success" ${messagePushNodes.includes("team_success") ? "checked" : ""} ${ro}> 组队成功</label></div><div class="helper">支持多选；不选择则不配置消息推送</div>`, false, "", "full")}
        </div>`)}
      <div class="form-footer">${state.readonly ? "" : `<button type="button" class="btn btn-primary solid" id="saveBtn">✓ 确定</button>`}<button type="button" class="btn" id="closeBtn">× 关闭</button></div>
    </form>`;
  renderTiers();
  const mileageItem = document.querySelector("#mileageItem");
  mileageItem.style.display = state.mileageEnabled ? "grid" : "none";
  ["backList","backList2","closeBtn"].forEach(id => document.querySelector(`#${id}`).onclick = () => navigate("list"));
  if (!state.readonly) {
    document.querySelector("#limitMileage").onchange = event => {
      state.mileageEnabled = event.target.checked;
      mileageItem.style.display = state.mileageEnabled ? "grid" : "none";
    };
    document.querySelector("#addTier").onclick = () => { state.tiers.push({ threshold:"", mode:"unified", commonPrizeType:"", commonName:"", commonCode:"", commonImage:"", memberPrizeType:"", memberName:"", memberCode:"", memberImage:"", normalPrizeType:"", normalName:"", normalCode:"", normalImage:"" }); renderTiers(); };
    document.querySelector("#saveBtn").onclick = saveActivity;
  }
}

function card(title, body) { return `<section class="card"><div class="card-header"><span>${title}</span></div><div class="card-body">${body}</div></section>`; }
function item(label, control, required=false, id="", extra="") { return `<div class="edit-item ${extra}" ${id ? `id="${id}"` : ""}><div class="edit-label ${required ? "required" : ""}">${label}</div><div class="control">${control}</div></div>`; }
function radios(name, options, selected, disabled) { return `<div class="radio-row">${options.map(([v,l]) => `<label><input type="radio" name="${name}" value="${v}" ${v===selected?"checked":""} ${disabled}> ${l}</label>`).join("")}</div>`; }
function prizeTypeRadios(field, index, selected, disabled) { return `<div class="radio-row">${[["bonus","奖励金卡"],["membership","会员卡"]].map(([value,label]) => `<label><input type="radio" name="${field}${index}" value="${value}" data-prize-field="${field}" ${value===selected?"checked":""} ${disabled}> ${label}</label>`).join("")}</div>`; }
function imageUpload(id, value, disabled, tierIndex="", tierField="") {
  const fileName = value ? value.split("/").pop() : "";
  const tierMeta = tierField ? ` data-tier-image-index="${tierIndex}" data-tier-image-field="${tierField}"` : "";
  return `<div class="image-upload-control"><label class="image-upload-box ${value ? "has-image" : ""}" data-image-box="${id}"><input type="file" accept="image/*" data-image-file="${id}"${tierMeta} ${disabled}><span class="image-upload-icon">${value ? "✓" : "＋"}</span><span data-image-label="${id}">${value ? "已上传" : "上传图片"}</span><small data-image-name="${id}">${fileName}</small></label><input type="hidden" id="${id}" value="${value}">${disabled ? "" : `<button type="button" class="btn btn-text danger" data-clear-image="${id}"${tierMeta}>移除</button>`}</div>`;
}
function bindImageUploads() {
  document.querySelectorAll("[data-image-file]").forEach(input => input.onchange = () => {
    const id = input.dataset.imageFile;
    const file = input.files?.[0];
    if (!file) return;
    const value = `uploaded://${file.name}`;
    document.querySelector(`#${id}`).value = value;
    if (input.dataset.tierImageField) state.tiers[Number(input.dataset.tierImageIndex)][input.dataset.tierImageField] = value;
    const box = document.querySelector(`[data-image-box="${id}"]`);
    box.classList.add("has-image");
    box.querySelector(".image-upload-icon").textContent = "✓";
    box.querySelector(`[data-image-label="${id}"]`).textContent = "已上传";
    box.querySelector(`[data-image-name="${id}"]`).textContent = file.name;
  });
  document.querySelectorAll("[data-clear-image]").forEach(button => button.onclick = () => {
    const id = button.dataset.clearImage;
    document.querySelector(`#${id}`).value = "";
    if (button.dataset.tierImageField) state.tiers[Number(button.dataset.tierImageIndex)][button.dataset.tierImageField] = "";
    const box = document.querySelector(`[data-image-box="${id}"]`);
    box.classList.remove("has-image");
    box.querySelector(".image-upload-icon").textContent = "＋";
    box.querySelector(`[data-image-label="${id}"]`).textContent = "上传图片";
    box.querySelector(`[data-image-name="${id}"]`).textContent = "";
    box.querySelector("input[type=file]").value = "";
  });
}

function renderTiers() {
  const host = document.querySelector("#tiers");
  const ro = state.readonly ? "disabled" : "";
  host.innerHTML = state.tiers.map((t,i) => `
    <div class="tier" data-tier="${i}">
      <div class="tier-head"><div><span class="tier-index">${i+1}</span>阶梯 ${i+1}</div><div class="tier-actions">${!state.readonly && i > 0 ? `<button type="button" class="btn btn-text" data-copy-tier="${i}">复制上一阶梯奖励配置</button>` : ""}${!state.readonly && state.tiers.length > 1 ? `<button type="button" class="btn btn-text danger" data-remove="${i}">删除</button>` : ""}</div></div>
      <div class="tier-body">
        <div class="tier-row"><div class="edit-label required">团队总完单量</div><div class="control"><div style="display:flex;align-items:center;gap:8px"><input data-field="threshold" type="number" min="1" value="${t.threshold}" ${ro}><span>单</span></div></div></div>
        <div class="tier-row"><div class="edit-label required">奖励配置方式</div><div class="control">${radios(`mode${i}`, [["unified","统一奖励"],["member","区分会员/非会员"]], t.mode, ro)}</div></div>
        ${t.mode === "unified" ? `
          <div class="reward-subgrid"><div class="reward-group-title">统一奖励（A、B 各发放一份）</div>
          <div class="tier-row"><div class="edit-label required">奖品类型</div><div class="control">${prizeTypeRadios("commonPrizeType", i, t.commonPrizeType, ro)}</div></div>
          <div class="tier-row"><div class="edit-label required">奖励名称</div><div class="control"><input data-field="commonName" value="${t.commonName}" placeholder="用于前端呈现" ${ro}></div></div>
          <div class="tier-row"><div class="edit-label required">奖励领取Code</div><div class="control"><input data-field="commonCode" value="${t.commonCode}" placeholder="请选择或输入营销活动Code" ${ro}><div class="helper">复用营销平台 participate 非现金奖励发放</div></div></div>
          <div class="tier-row"><div class="edit-label">奖品图片</div><div class="control">${imageUpload(`tier-${i}-commonImage`, t.commonImage || "", ro, i, "commonImage")}</div></div></div>` : `
          <div class="reward-subgrid"><div class="reward-group-title">会员奖励</div>
          <div class="tier-row"><div class="edit-label required">奖品类型</div><div class="control">${prizeTypeRadios("memberPrizeType", i, t.memberPrizeType, ro)}</div></div>
          <div class="tier-row"><div class="edit-label required">奖励名称</div><div class="control"><input data-field="memberName" value="${t.memberName}" placeholder="用于前端呈现" ${ro}></div></div>
          <div class="tier-row"><div class="edit-label required">奖励领取Code</div><div class="control"><input data-field="memberCode" value="${t.memberCode}" placeholder="会员奖励Code" ${ro}></div></div>
          <div class="tier-row"><div class="edit-label">奖品图片</div><div class="control">${imageUpload(`tier-${i}-memberImage`, t.memberImage || "", ro, i, "memberImage")}</div></div>
          <div class="reward-group-title">非会员奖励</div>
          <div class="tier-row"><div class="edit-label required">奖品类型</div><div class="control">${prizeTypeRadios("normalPrizeType", i, t.normalPrizeType, ro)}</div></div>
          <div class="tier-row"><div class="edit-label required">奖励名称</div><div class="control"><input data-field="normalName" value="${t.normalName}" placeholder="用于前端呈现" ${ro}></div></div>
          <div class="tier-row"><div class="edit-label required">奖励领取Code</div><div class="control"><input data-field="normalCode" value="${t.normalCode}" placeholder="非会员奖励Code" ${ro}><div class="helper">会员查询失败时按非会员奖励发放</div></div></div>
          <div class="tier-row"><div class="edit-label">奖品图片</div><div class="control">${imageUpload(`tier-${i}-normalImage`, t.normalImage || "", ro, i, "normalImage")}</div></div></div>`}
      </div>
    </div>`).join("");
  if (state.readonly) return;
  bindImageUploads();
  host.querySelectorAll("[data-copy-tier]").forEach(button => button.onclick = () => {
    const index = Number(button.dataset.copyTier);
    const threshold = state.tiers[index].threshold;
    state.tiers[index] = { ...state.tiers[index - 1], threshold };
    renderTiers();
    toast("已复制上一阶梯奖励配置");
  });
  host.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => { state.tiers.splice(Number(b.dataset.remove),1); renderTiers(); });
  host.querySelectorAll("[data-tier]").forEach(box => {
    const i = Number(box.dataset.tier);
    box.querySelectorAll("input[data-field]").forEach(input => input.oninput = () => { state.tiers[i][input.dataset.field] = input.value; });
    box.querySelectorAll("input[data-prize-field]").forEach(input => input.onchange = () => { state.tiers[i][input.dataset.prizeField] = input.value; });
    box.querySelectorAll(`input[name="mode${i}"]`).forEach(input => input.onchange = () => { state.tiers[i].mode = input.value; renderTiers(); });
  });
}

function saveActivity() {
  document.querySelectorAll(".has-error").forEach(x => x.classList.remove("has-error"));
  let valid = true;
  const name = document.querySelector("#activityName").value.trim();
  const begin = document.querySelector("#begin").value.trim();
  const end = document.querySelector("#end").value.trim();
  const rule = document.querySelector("#ruleDescription").value.trim();
  const prizeValue = Number(document.querySelector("#prizeValue").value);
  const headerImage = document.querySelector("#headerImage").value.trim();
  const unmatchedBackgroundImage = document.querySelector("#unmatchedBackgroundImage").value.trim();
  const matchedBackgroundImage = document.querySelector("#matchedBackgroundImage").value.trim();
  const appHomeHeaderImage = document.querySelector("#appHomeHeaderImage").value.trim();
  const miniProgramHomeHeaderImage = document.querySelector("#miniProgramHomeHeaderImage").value.trim();
  const homePopupImage = document.querySelector("#homePopupImage").value.trim();
  const orderDetailBannerImage = document.querySelector("#orderDetailBannerImage").value.trim();
  const activitySubtitle = document.querySelector("#activitySubtitle").value.trim();
  const shareTitle = document.querySelector("#shareTitle").value.trim();
  const shareSubtitle = document.querySelector("#shareSubtitle").value.trim();
  const shareImage = document.querySelector("#shareImage").value.trim();
  const messagePushNodes = document.querySelector("#pushTeamSuccess").checked ? ["team_success"] : [];
  const matchDuration = Number(document.querySelector("#matchDuration").value);
  const rateDiff = Number(document.querySelector("#rateDiff").value);
  const minMileage = Number(document.querySelector("#minMileage").value);
  const status = Number(document.querySelector('input[name="status"]:checked').value);
  if (!name) { document.querySelector("#activityNameItem").classList.add("has-error"); valid = false; }
  if (!begin || !end || begin >= end) { document.querySelector("#timeItem").classList.add("has-error"); valid = false; }
  const overlappingActivity = status === 1 && begin && end && begin < end
    ? state.activities.find(activity => activity.status === 1
      && activity.code !== state.editing?.code
      && begin <= activity.end
      && end >= activity.begin)
    : null;
  if (overlappingActivity) {
    document.querySelector("#timeItem").classList.add("has-error");
    valid = false;
  }
  if (!rule) { document.querySelector("#ruleItem").classList.add("has-error"); valid = false; }
  if (!Number.isFinite(prizeValue) || prizeValue < 1 || prizeValue > 9999) { document.querySelector("#prizeValueItem").classList.add("has-error"); valid = false; }
  if (!headerImage) { document.querySelector("#headerImageItem").classList.add("has-error"); valid = false; }
  if (!unmatchedBackgroundImage) { document.querySelector("#unmatchedBackgroundImageItem").classList.add("has-error"); valid = false; }
  if (!matchedBackgroundImage) { document.querySelector("#matchedBackgroundImageItem").classList.add("has-error"); valid = false; }
  if (!appHomeHeaderImage) { document.querySelector("#appHomeHeaderImageItem").classList.add("has-error"); valid = false; }
  if (!miniProgramHomeHeaderImage) { document.querySelector("#miniProgramHomeHeaderImageItem").classList.add("has-error"); valid = false; }
  if (!homePopupImage) { document.querySelector("#homePopupImageItem").classList.add("has-error"); valid = false; }
  if (!orderDetailBannerImage) { document.querySelector("#orderDetailBannerImageItem").classList.add("has-error"); valid = false; }
  if (!activitySubtitle) { document.querySelector("#activitySubtitleItem").classList.add("has-error"); valid = false; }
  if (!shareTitle) { document.querySelector("#shareTitleItem").classList.add("has-error"); valid = false; }
  if (!Number.isInteger(matchDuration) || matchDuration < 1 || matchDuration > 60) { document.querySelector("#matchDurationItem").classList.add("has-error"); valid = false; }
  if (!Number.isInteger(rateDiff) || rateDiff < 0 || rateDiff > 100) { document.querySelector("#rateDiffItem").classList.add("has-error"); valid = false; }
  if (state.mileageEnabled && (!Number.isInteger(minMileage) || minMileage < 1 || minMileage > 9999)) { document.querySelector("#mileageItem").classList.add("has-error"); valid = false; }
  const thresholds = state.tiers.map(t => Number(t.threshold));
  if (thresholds.some((n,i) => !Number.isInteger(n) || n < 1 || (i && n <= thresholds[i-1]))) { toast("阶梯完单量必须为递增的正整数", true); valid = false; }
  if (state.tiers.some(t => t.mode === "unified" ? (!t.commonPrizeType || !t.commonName.trim() || !t.commonCode.trim()) : (!t.memberPrizeType || !t.memberName.trim() || !t.memberCode.trim() || !t.normalPrizeType || !t.normalName.trim() || !t.normalCode.trim()))) { toast("请完整填写各阶梯的奖品类型、奖励名称和奖励领取Code", true); valid = false; }
  if (overlappingActivity) { toast(`活动时间与有效活动“${overlappingActivity.name}”（${overlappingActivity.code}）存在交集`, true); }
  if (!valid) return;
  const frontStyleConfig = { prizeValue, headerImage, unmatchedBackgroundImage, matchedBackgroundImage, appHomeHeaderImage, miniProgramHomeHeaderImage, homePopupImage, orderDetailBannerImage, activitySubtitle, ruleDescription:rule, shareTitle, shareSubtitle, shareImage, messagePushNodes };
  if (state.editing) {
    Object.assign(state.editing, { name, begin, end, status, ...frontStyleConfig, modified:nowText(), modifier:"当前用户" });
  } else {
    state.activities.unshift({ code:`DUO-202609-${String(state.activities.length+3).padStart(3,"0")}`, name, begin, end, status, ...frontStyleConfig, modified:nowText(), modifier:"当前用户" });
  }
  toast("保存成功");
  setTimeout(() => navigate("list"), 550);
}

function renderData() {
  main.innerHTML = `
    <div class="breadcrumb"><a>真车主组队完单活动</a><i>›</i><span>数据报表</span></div>
    <div class="page-header"><div><h1>组队完单活动数据报表</h1><p>查询组队进度、计入订单和奖励发放结果</p></div></div>
    <section class="panel">
      <div class="query-grid"><div class="form-field"><label>活动ID：</label><input id="dCode" value="DUO-202609-001" placeholder="请输入"></div><div class="form-field"><label>组队ID：</label><input id="dTeam" placeholder="请输入"></div><div class="form-field"><label>memberId：</label><input id="dMember" placeholder="请输入"></div></div>
      <div class="query-actions"><button class="btn btn-primary" id="dataQuery">⌕ 查询</button><button class="btn btn-primary" id="dataReset">↻ 重置</button></div>
    </section>
    <section class="panel" style="padding:0">
      <div class="table-titlebar"><span class="table-title">组队活动数据</span><span style="color:#909399;font-size:12px">共 ${state.teams.length} 条</span></div>
      <div style="padding:16px">${teamTable(state.teams)}</div>
    </section>`;
  document.querySelector("#dataQuery").onclick = filterTeams;
  document.querySelector("#dataReset").onclick = () => { document.querySelector("#dCode").value = ""; document.querySelector("#dTeam").value = ""; document.querySelector("#dMember").value = ""; replaceTeamRows(state.teams); toast("筛选条件已重置"); };
  bindDataActions();
}

function teamTable(rows) { return `<div class="table-wrap"><table><thead><tr><th>#</th><th>组队ID</th><th>活动ID</th><th>组队方式</th><th>组队时间</th><th>A memberId / 完单</th><th>B memberId / 完单</th><th>团队总单量</th><th>操作</th></tr></thead><tbody id="teamRows">${teamRows(rows)}</tbody></table></div><div class="pagination"><span>共 ${rows.length} 条</span><span class="page-box active">1</span></div>`; }
function teamRows(rows) { return rows.length ? rows.map((x,i) => `<tr><td>${i+1}</td><td>${x.teamId}</td><td>${x.code}</td><td>${x.mode}</td><td>${x.formed}</td><td>${x.a} / <b>${x.ao}</b>单</td><td>${x.b} / <b>${x.bo}</b>单</td><td><b>${x.ao+x.bo}</b>单</td><td><button class="btn btn-text" data-team-detail="${x.teamId}">查看明细</button></td></tr>`).join("") : `<tr><td colspan="9" class="empty">暂无数据</td></tr>`; }
function rewardRecords() { return [
  {id:"reward-00182",team:"TEAM-09001286",tier:"5单",member:"10827361",identity:"会员",reward:"会员5单奖励",claimCode:"PRIZE-M-5",prizeCodes:["MEMBER-CARD-30D","BONUS-CARD-20"],time:"2026-09-12 14:25:08",status:"发放成功"},
  {id:"reward-00183",team:"TEAM-09001286",tier:"5单",member:"10839175",identity:"非会员",reward:"非会员5单奖励",claimCode:"PRIZE-N-5",prizeCodes:["BONUS-CARD-10"],time:"2026-09-12 14:25:09",status:"发放失败"},
  {id:"reward-00916",team:"TEAM-09001192",tier:"7单",member:"10762589",identity:"统一奖励",reward:"7单达标奖励",claimCode:"PRIZE-DUO-7",prizeCodes:["BONUS-CARD-50"],time:"2026-09-11 23:48:31",status:"发放成功"},
  {id:"reward-00917",team:"TEAM-09001192",tier:"7单",member:"10901822",identity:"统一奖励",reward:"7单达标奖励",claimCode:"PRIZE-DUO-7",prizeCodes:["BONUS-CARD-50"],time:"2026-09-11 23:48:31",status:"发放成功"},
  ]; }
function rewardTag(s) { const c = s === "发放成功" ? "tag-success" : s === "部分失败" ? "tag-warning" : s.includes("失败") ? "tag-danger" : "tag-info"; return `<span class="tag ${c}">${s}</span>`; }
function replaceTeamRows(rows) { const host = document.querySelector("#teamRows"); if (host) { host.innerHTML = teamRows(rows); bindDataActions(); } }
function filterTeams() { const code=document.querySelector("#dCode").value.trim(); const team=document.querySelector("#dTeam").value.trim(); const m=document.querySelector("#dMember").value.trim(); replaceTeamRows(state.teams.filter(x=>(!code||x.code.includes(code))&&(!team||x.teamId.includes(team))&&(!m||x.a.includes(m)||x.b.includes(m)))); }
function bindDataActions() {
  document.querySelectorAll("[data-team-detail]").forEach(b => b.onclick = () => showTeamDetail(b.dataset.teamDetail));
  document.querySelectorAll("[data-reissue]").forEach(b => b.onclick = () => confirmReissue(b.dataset.reissue));
}

function showTeamDetail(teamId) {
  const x = state.teams.find(t => t.teamId === teamId);
  const matchRateDescription = x.mode === "随机匹配" || x.mode === "司机匹配" ? `<div class="desc-label">A 接完率</div><div class="desc-value">${x.ar || "-"}</div><div class="desc-label">B 接完率</div><div class="desc-value">${x.br || "-"}</div>` : "";
  const rewards = rewardRecords().filter(r => r.team === teamId);
  const orders = [
    {no:"FC20260912002881",driver:x.a,time:"2026-09-12 10:21:18",mile:"8.4",passenger:"否",count:"是",reason:"-"},
    {no:"FC20260912003107",driver:x.b,time:"2026-09-12 11:03:42",mile:"12.7",passenger:"否",count:"是",reason:"-"},
    {no:"FC20260912003561",driver:x.a,time:"2026-09-12 12:17:03",mile:"3.2",passenger:"否",count:"否",reason:"接单公里数未达标"},
    {no:"FC20260912004119",driver:x.b,time:"2026-09-12 14:25:06",mile:"7.1",passenger:"是",count:"否",reason:"乘客包含组队用户"},
  ];
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><div class="modal-header"><span>组队明细</span><button class="modal-close">×</button></div><div class="modal-body">
    <div class="detail-block"><div class="detail-block-title">组队信息</div><div class="description"><div class="desc-label">组队ID</div><div class="desc-value">${x.teamId}</div><div class="desc-label">组队方式</div><div class="desc-value">${x.mode}</div><div class="desc-label">A memberId</div><div class="desc-value">${x.a}（${x.ao}单）</div><div class="desc-label">B memberId</div><div class="desc-value">${x.b}（${x.bo}单）</div><div class="desc-label">组队时间</div><div class="desc-value">${x.formed}</div><div class="desc-label">团队总单量</div><div class="desc-value">${x.ao+x.bo}单</div>${matchRateDescription}</div></div>
    <div class="detail-block"><div class="detail-block-title">订单明细（反查结果）</div><div class="table-wrap" style="border:0"><table><thead><tr><th>#</th><th>订单号</th><th>司机</th><th>接单时间</th><th>接单公里数</th><th>乘客含队员</th><th>是否计入</th><th>未计入原因</th></tr></thead><tbody>${orders.map((o,i)=>`<tr><td>${i+1}</td><td>${o.no}</td><td>${o.driver}</td><td>${o.time}</td><td>${o.mile}km</td><td>${o.passenger}</td><td>${o.count}</td><td>${o.reason}</td></tr>`).join("")}</tbody></table></div></div>
    <div class="detail-block"><div class="detail-block-title">奖励发放记录</div><div class="table-wrap" style="border:0"><table><thead><tr><th>#</th><th>阶梯</th><th>memberId</th><th>会员身份</th><th>实际奖励名称</th><th>奖励领取Code</th><th>奖品Code</th><th>发放时间</th><th>状态</th><th>操作</th></tr></thead><tbody>${rewards.length ? rewards.map((r,i)=>`<tr><td>${i+1}</td><td>${r.tier}</td><td>${r.member}</td><td>${r.identity}</td><td>${r.reward}</td><td>${r.claimCode}</td><td>${r.prizeCodes.join("、")}</td><td>${r.time}</td><td>${rewardTag(r.status)}</td><td>${r.status === "发放失败" ? `<button class="btn btn-text" data-reissue="${r.id}">补发</button>` : "-"}</td></tr>`).join("") : `<tr><td colspan="10" class="empty">暂无奖励发放记录</td></tr>`}</tbody></table></div></div>
  </div><div class="modal-footer"><button class="btn close-modal">关闭</button></div></div></div>`;
  modalRoot.querySelectorAll(".modal-close,.close-modal,.modal-backdrop").forEach(el => el.onclick = e => { if (el.classList.contains("modal-backdrop") && e.target !== el) return; modalRoot.innerHTML=""; });
  modalRoot.querySelectorAll("[data-reissue]").forEach(button => button.onclick = () => confirmReissue(button.dataset.reissue));
}

function showLogs(code) {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal medium"><div class="modal-header"><span>操作日志 · ${code}</span><button class="modal-close">×</button></div><div class="modal-body"><ul class="timeline"><li><time>2026-09-03 16:28:10</time>张运营修改活动配置，新增“7单阶梯”</li><li><time>2026-09-01 10:12:46</time>张运营启用活动</li><li><time>2026-08-30 18:05:22</time>李产品创建活动</li></ul></div><div class="modal-footer"><button class="btn close-modal">关闭</button></div></div></div>`;
  modalRoot.querySelectorAll(".modal-close,.close-modal,.modal-backdrop").forEach(el => el.onclick = e => { if(el.classList.contains("modal-backdrop")&&e.target!==el)return; modalRoot.innerHTML=""; });
}

function confirmReissue(rewardId) {
  const reward = rewardRecords().find(item => item.id === rewardId);
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal medium"><div class="modal-header"><span>确认补发</span><button class="modal-close">×</button></div><div class="modal-body"><p>确认使用该记录原先选择的奖励领取Code重新发放吗？</p><div class="readonly-rule"><b>奖励领取Code：</b>${reward?.claimCode || "-"}<br><b>奖品Code：</b>${reward?.prizeCodes.join("、") || "-"}<br><b>说明：</b>补发时不重新查询会员身份，也不切换奖励。</div></div><div class="modal-footer"><button class="btn close-modal">取消</button><button class="btn btn-primary solid" id="doReissue">确认补发</button></div></div></div>`;
  modalRoot.querySelectorAll(".modal-close,.close-modal").forEach(el => el.onclick=()=>modalRoot.innerHTML="");
  document.querySelector("#doReissue").onclick = () => { modalRoot.innerHTML=""; toast("补发任务已提交"); };
}

function toast(message, error=false) { const t=document.querySelector("#toast"); t.textContent=message; t.className=`toast show${error?" error":""}`; clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>t.className="toast",2200); }
function nowText() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`; }

render();
