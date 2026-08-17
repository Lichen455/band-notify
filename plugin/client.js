window.__ModuleLoader__.load({
	id: "band-notify",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		var react = require("react");

		// ---- 閰嶇疆璇诲啓锛堝悓涓€ HTTP 鎺ュ彛锛?---
		function loadConfig() {
			return fetch("/api/band-notify/config").then(function(r) { return r.json(); });
		}
		function saveConfig(patch) {
			return fetch("/api/band-notify/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }).then(function(r) { return r.json(); });
		}

		// 瀹樻柟鍗＄墖鏍峰紡锛圥luginCard.module.css / fields.module.css 涓婚鍙橀噺鐗堬級
		var CARD = {
			border: "1px solid var(--dsw-alias-border-l2)",
			background: "var(--dsw-alias-bg-layer-3)",
			borderRadius: "12px",
			listStyle: "none",
		};
		var CARD_OPEN = {
			background: "var(--dsw-alias-bg-layer-2)",
			borderColor: "var(--dsw-alias-label-dimmed)",
		};
		var HEADER = {
			appearance: "none", width: "100%", font: "inherit", color: "inherit", textAlign: "left",
			cursor: "pointer", background: "0 0", border: "0", borderRadius: "12px",
			alignItems: "center", gap: "12px", padding: "14px 16px", display: "flex",
		};
		var HEAD_TEXT = { flexDirection: "column", flex: 1, gap: "4px", minWidth: 0, display: "flex" };
		var NAME = { color: "var(--dsw-alias-label-primary)", fontSize: "15px", fontWeight: 600, lineHeight: 1.4 };
		var DESC = { color: "var(--dsw-alias-label-tertiary)", fontSize: "13px", lineHeight: 1.5 };
		var CHEVRON = { color: "var(--dsw-alias-label-tertiary)", flex: "none", transition: "transform .16s" };
		var BODY = { borderTop: "1px solid var(--dsw-alias-border-l2)", margin: "0 16px", paddingBottom: "8px" };
		var PENDING = {
			whiteSpace: "nowrap", background: "var(--dsw-alias-bg-module-platform)",
			color: "var(--dsw-alias-label-secondary)", borderRadius: "999px", flex: "none",
			padding: "1px 8px", fontSize: "11px", fontWeight: 500, lineHeight: "17px",
		};
		var FOOTER = {
			borderTop: "1px solid var(--dsw-alias-border-l2)",
			justifyContent: "flex-end", alignItems: "center", gap: "8px", padding: "12px 0 4px", display: "flex",
		};
		var BTN = { appearance: "none", font: "inherit", cursor: "pointer", border: "1px solid transparent", borderRadius: "8px", padding: "5px 14px", fontSize: "13px", lineHeight: 1.5 };
		var BTN_DISCARD = Object.assign({}, BTN, { borderColor: "var(--dsw-alias-border-l2)", color: "var(--dsw-alias-label-secondary)", background: "0 0" });
		var BTN_SAVE = Object.assign({}, BTN, { background: "var(--dsw-alias-label-primary)", color: "var(--dsw-alias-bg-layer-3)" });
		var BTN_DISABLED = { opacity: 0.4, cursor: "default" };
		var FIELD = { flexDirection: "column", gap: "6px", padding: "12px 0", display: "flex" };
		var FIELD_HEAD = { alignItems: "center", gap: "8px", display: "flex" };
		var FIELD_LABEL = { minWidth: 0, color: "var(--dsw-alias-label-primary)", flex: 1, fontSize: "13px", fontWeight: 500, lineHeight: 1.5 };
		var INPUT = {
			border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-3)",
			height: "34px", font: "inherit", color: "var(--dsw-alias-label-primary)",
			borderRadius: "8px", padding: "0 12px", fontSize: "13px", lineHeight: 1.5, boxSizing: "border-box",
		};
		var HINT = { color: "var(--dsw-alias-label-tertiary)", margin: 0, fontSize: "12px", lineHeight: 1.5 };
		var RESET = { font: "inherit", color: "var(--dsw-alias-label-secondary)", cursor: "pointer", background: "0 0", border: "none", padding: 0, fontSize: "12px", lineHeight: 1.5 };

		function apply(ctx) {
			var slots = ctx.get("slots");
			if (slots === undefined) return;

			// ---- 杈撳叆鏍忛搩閾?----
			slots.inject("conversation.input.left", function() {
				return slots.register(
					{ name: "conversation.input.left", id: "band-notify" },
					function() {
						var state = react.useState(null);
						var enabled = state[0], setEnabled = state[1];
						react.useEffect(function() {
							var alive = true;
							loadConfig().then(function(r) {
								if (alive && r && typeof r.enabled === "boolean") setEnabled(r.enabled);
							}).catch(function() {});
							return function() { alive = false; };
						}, []);
						var toggle = function() {
							if (enabled === null) return;
							var next = !enabled;
							setEnabled(next);
							saveConfig({ enabled: next }).catch(function() {});
						};
						var on = enabled === true;
						return react.createElement("button", {
							type: "button",
							onClick: toggle,
							disabled: enabled === null,
							title: on ? "瀹屾垚鎻愰啋锛氬紑锛堢偣鍑诲叧闂級" : "瀹屾垚鎻愰啋锛氬叧锛堢偣鍑诲紑鍚級",
							"aria-pressed": on,
							style: {
								display: "inline-flex", alignItems: "center", justifyContent: "center",
								width: "24px", height: "24px", borderRadius: "6px",
								border: "1px solid transparent", background: "transparent", cursor: "pointer",
								color: on ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-border-l1)",
								padding: 0,
							},
						}, react.createElement("svg", { viewBox: "0 0 24 24", width: 14, height: 14, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
							react.createElement("path", { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
							react.createElement("path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" })
						));
					}
				);
			});

			// ---- 鎻掍欢閰嶇疆椤靛崱鐗囷紙涓庡畼鏂瑰崱鐗囧悓娆炬牱寮忥級----
			slots.inject("settings.plugin.item", function() {
				return slots.register(
					{ name: "settings.plugin.item", id: "band-notify", order: 30 },
					function() {
						var DEFAULT_URL = "https://ntfy.sh/你的频道";
						var STOPS = [0, 0.5, 1, 2, 3, 5, 8, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240];
						function idxOf(v) {
							var i = STOPS.indexOf(v);
							if (i !== -1) return i;
							var best = 0, bestD = Infinity;
							for (var k = 0; k < STOPS.length; k++) {
								var d = Math.abs(STOPS[k] - v);
								if (d < bestD) { bestD = d; best = k; }
							}
							return best;
						}
						var openState = react.useState(false);
						var open = openState[0], setOpen = openState[1];

						// 褰撳墠宸蹭繚瀛橀厤缃?						var cur = react.useState(null);
						var current = cur[0], setCurrent = cur[1];
						// 鏆傚瓨鑽夌锛堝瓧娈电紪杈戜笉鐩存帴钀界洏锛岀偣淇濆瓨鎵嶅啓锛?						var dEnabled = react.useState(null);
						var draftEnabled = dEnabled[0], setDraftEnabled = dEnabled[1];
						var dMin = react.useState("");
						var draftMin = dMin[0], setDraftMin = dMin[1];
						var dUrl = react.useState("");
						var draftUrl = dUrl[0], setDraftUrl = dUrl[1];
						var dTpl = react.useState("");
						var draftTemplate = dTpl[0], setDraftTemplate = dTpl[1];
						var dAi = react.useState(false);
						var draftAi = dAi[0], setDraftAi = dAi[1];
						var dTtl = react.useState("");
						var draftTitle = dTtl[0], setDraftTitle = dTtl[1];
						var dFmt = react.useState("ntfy");
						var draftFormat = dFmt[0], setDraftFormat = dFmt[1];
						var dJt = react.useState("");
						var draftJsonTemplate = dJt[0], setDraftJsonTemplate = dJt[1];
						var fail = react.useState(false);
						var failed = fail[0], setFailed = fail[1];
						var savingState = react.useState(false);
						var saving = savingState[0], setSaving = savingState[1];

						react.useEffect(function() {
							var alive = true;
							loadConfig().then(function(r) {
								if (!alive || !r) return;
								var cfg = {
									enabled: typeof r.enabled === "boolean" ? r.enabled : true,
									minMinutes: typeof r.minMinutes === "number" && r.minMinutes >= 0 ? Math.floor(r.minMinutes) : 0,
									endpoint: typeof r.endpoint === "string" && r.endpoint ? r.endpoint : DEFAULT_URL,
									template: typeof r.template === "string" && r.template ? r.template : "绗?{turn} 杞璇濆凡瀹屾垚 ({time}) 路 鐢ㄦ椂 {minutes} 鍒嗛挓",
									titleTemplate: typeof r.titleTemplate === "string" && r.titleTemplate ? r.titleTemplate : "瀵硅瘽宸茬粨鏉?,
									format: r.format === "text" || r.format === "json" ? r.format : "ntfy",
									jsonTemplate: typeof r.jsonTemplate === "string" ? r.jsonTemplate : "",
									aiSummary: typeof r.aiSummary === "boolean" ? r.aiSummary : false,
								};
								setCurrent(cfg);
								setDraftEnabled(cfg.enabled);
								setDraftMin(String(cfg.minMinutes));
								setDraftUrl(cfg.endpoint);
								setDraftTemplate(cfg.template);
								setDraftTitle(cfg.titleTemplate);
								setDraftFormat(cfg.format);
								setDraftJsonTemplate(cfg.jsonTemplate);
								setDraftAi(cfg.aiSummary);
							}).catch(function() {});
							return function() { alive = false; };
						}, []);

						var ready = current !== null;
						var dirty = ready && (
							draftEnabled !== current.enabled ||
							parseFloat(draftMin) !== current.minMinutes ||
							draftUrl !== current.endpoint ||
							draftTemplate !== current.template ||
							draftTitle !== current.titleTemplate ||
							draftFormat !== current.format ||
							draftJsonTemplate !== current.jsonTemplate ||
							draftAi !== current.aiSummary
						);

						var save = function() {
							if (!dirty || saving) return;
							setSaving(true);
							setFailed(false);
							var n = parseFloat(draftMin);
							var next = {
								enabled: draftEnabled === true,
								minMinutes: isNaN(n) || n < 0 ? 0 : Math.floor(n),
								endpoint: /^https?:\/\//.test(draftUrl) ? draftUrl : current.endpoint,
								template: draftTemplate,
								titleTemplate: draftTitle,
								format: draftFormat === "text" || draftFormat === "json" ? draftFormat : "ntfy",
								jsonTemplate: draftJsonTemplate,
								aiSummary: draftAi === true,
							};
							saveConfig(next).then(function(r) {
								var ok = {
									enabled: typeof r.enabled === "boolean" ? r.enabled : next.enabled,
									minMinutes: typeof r.minMinutes === "number" ? r.minMinutes : next.minMinutes,
									endpoint: typeof r.endpoint === "string" && r.endpoint ? r.endpoint : next.endpoint,
									template: typeof r.template === "string" && r.template ? r.template : next.template,
									titleTemplate: typeof r.titleTemplate === "string" && r.titleTemplate ? r.titleTemplate : next.titleTemplate,
									format: r.format === "text" || r.format === "json" ? r.format : next.format,
									jsonTemplate: typeof r.jsonTemplate === "string" ? r.jsonTemplate : next.jsonTemplate,
									aiSummary: typeof r.aiSummary === "boolean" ? r.aiSummary : next.aiSummary,
								};
								setCurrent(ok);
								setDraftEnabled(ok.enabled);
								setDraftMin(String(ok.minMinutes));
								setDraftUrl(ok.endpoint);
								setDraftTemplate(ok.template);
								setDraftTitle(ok.titleTemplate);
								setDraftFormat(ok.format);
								setDraftJsonTemplate(ok.jsonTemplate);
								setDraftAi(ok.aiSummary);
								setSaving(false);
							}).catch(function() {
								setSaving(false);
								setFailed(true);
							});
						};
						var discard = function() {
							if (!ready) return;
							setDraftEnabled(current.enabled);
							setDraftMin(String(current.minMinutes));
							setDraftUrl(current.endpoint);
							setDraftTemplate(current.template);
							setDraftTitle(current.titleTemplate);
							setDraftFormat(current.format);
							setDraftJsonTemplate(current.jsonTemplate);
							setDraftAi(current.aiSummary);
							setFailed(false);
						};

						return react.createElement("li", {
							style: Object.assign({}, CARD, open ? CARD_OPEN : null, { transition: "border-color .16s, background .16s" }),
						},
							react.createElement("button", {
								type: "button",
								"aria-expanded": open,
								onClick: function() { setOpen(!open); },
								style: HEADER,
							},
								react.createElement("span", { style: HEAD_TEXT },
									react.createElement("span", { style: NAME }, "瀹屾垚鎻愰啋"),
									react.createElement("span", { style: DESC }, "瀵硅瘽缁撴潫鏃舵帹閫侀€氱煡锛屾敮鎸佸绉嶅彂閫佹牸寮忥紙band-notify锛?)
								),
								dirty ? react.createElement("span", { style: PENDING }, "鏈繚瀛?) : null,
								react.createElement("svg", {
									viewBox: "0 0 14 14", width: 14, height: 14, fill: "none", stroke: "currentColor",
									strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
									style: Object.assign({}, CHEVRON, { transform: open ? "rotate(180deg)" : "none" }),
								},
									react.createElement("polyline", { points: "3 5 7 9 11 5" })
								)
							),
							open ? react.createElement("div", { style: BODY },
								// 閫氱煡寮€鍏?								react.createElement("div", { style: FIELD },
									react.createElement("div", { style: FIELD_HEAD },
										react.createElement("span", { style: FIELD_LABEL }, "閫氱煡寮€鍏?)
									),
									react.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" } },
										react.createElement("input", {
											type: "checkbox",
											checked: draftEnabled === true,
											disabled: !ready,
											onChange: function(e) { setDraftEnabled(e.target.checked); },
											style: { accentColor: "var(--dsw-alias-brand-primary)", width: "16px", height: "16px" },
										}),
										react.createElement("span", { style: HINT }, "寮€鍚悗锛屾瘡杞璇濈粨鏉熸帹閫侀€氱煡")
									)
								),
								// 鎺ㄩ€佸湴鍧€
								react.createElement("div", { style: Object.assign({}, FIELD, { borderTop: "1px solid var(--dsw-alias-border-l2)" }) },
									react.createElement("div", { style: FIELD_HEAD },
										react.createElement("span", { style: FIELD_LABEL }, "鎺ㄩ€佸湴鍧€"),
										draftUrl !== (current ? current.endpoint : "") && ready ? react.createElement("button", { type: "button", style: RESET, onClick: function() { setDraftUrl(current.endpoint); } }, "閲嶇疆") : null
									),
									react.createElement("input", {
										type: "text", spellCheck: false,
										value: draftUrl,
										disabled: !ready,
										onChange: function(e) { setDraftUrl(e.target.value); },
										style: INPUT,
									}),
									react.createElement("p", { style: HINT }, "http/https 鍧囧彲锛沶tfy 鏍煎紡濡?https://ntfy.sh/棰戦亾鍚?)
								),
								// 闀夸换鍔￠€氱煡
								react.createElement("div", { style: Object.assign({}, FIELD, { borderTop: "1px solid var(--dsw-alias-border-l2)" }) },
									react.createElement("div", { style: FIELD_HEAD },
										react.createElement("span", { style: FIELD_LABEL }, "闀夸换鍔￠€氱煡锛堣秴杩?N 鍒嗛挓鎵嶆帹閫侊級"),
										draftMin !== String(current ? current.minMinutes : 0) && ready ? react.createElement("button", { type: "button", style: RESET, onClick: function() { setDraftMin(String(current.minMinutes)); } }, "閲嶇疆") : null
									),
									react.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: "8px", width: "100%" } },
										react.createElement("input", {
											type: "range", min: 0, max: STOPS.length - 1, step: 1,
											value: ready ? idxOf(isNaN(parseFloat(draftMin)) ? 0 : parseFloat(draftMin)) : 0,
											disabled: !ready,
											onChange: function(e) { setDraftMin(String(STOPS[parseInt(e.target.value, 10)])); },
											title: "妗ｄ綅锛? + STOPS.join(" / ") + " 鍒嗛挓",
											style: { flex: 1, accentColor: "var(--dsw-alias-brand-primary)", cursor: "pointer" },
										}),
										react.createElement("input", {
											type: "number", min: 0,
											value: draftMin,
											disabled: !ready,
											onChange: function(e) { setDraftMin(e.target.value); },
											style: Object.assign({}, INPUT, { width: "70px", flex: "none" }),
										}),
										react.createElement("span", { style: HINT }, "鍒嗛挓")
									),
									react.createElement("p", { style: HINT }, "瀵硅瘽鐢ㄦ椂瓒呰繃杩欎釜鍒嗛挓鏁版墠鎺ㄩ€侊紱0 = 姣忚疆閮介€氱煡锛涙敮鎸?0.5锛?0绉掞級")
								),
								// 娑堟伅鏍囬
								react.createElement("div", { style: Object.assign({}, FIELD, { borderTop: "1px solid var(--dsw-alias-border-l2)" }) },
									react.createElement("div", { style: FIELD_HEAD },
										react.createElement("span", { style: FIELD_LABEL }, "娑堟伅鏍囬"),
										draftTitle !== (current ? current.titleTemplate : "") && ready ? react.createElement("button", { type: "button", style: RESET, onClick: function() { setDraftTitle(current.titleTemplate); } }, "閲嶇疆") : null
									),
									react.createElement("input", {
										type: "text", spellCheck: false,
										value: draftTitle,
										disabled: !ready,
										onChange: function(e) { setDraftTitle(e.target.value); },
										style: INPUT,
									}),
									react.createElement("p", { style: HINT }, "閫氱煡鏍囬锛屽悓鏍锋敮鎸佸崰浣嶇锛堥粯璁わ細瀵硅瘽宸茬粨鏉燂級")
								),
								// 鍙戦€佹牸寮?								react.createElement("div", { style: Object.assign({}, FIELD, { borderTop: "1px solid var(--dsw-alias-border-l2)" }) },
									react.createElement("div", { style: FIELD_HEAD },
										react.createElement("span", { style: FIELD_LABEL }, "鍙戦€佹牸寮?),
										draftFormat !== (current ? current.format : "ntfy") && ready ? react.createElement("button", { type: "button", style: RESET, onClick: function() { setDraftFormat(current.format); } }, "閲嶇疆") : null
									),
									react.createElement("select", {
										value: draftFormat,
										disabled: !ready,
										onChange: function(e) { setDraftFormat(e.target.value); },
										style: Object.assign({}, INPUT, { width: "220px", cursor: "pointer" }),
									},
										react.createElement("option", { value: "ntfy" }, "ntfy锛堟爣棰?浼樺厛绾у弬鏁帮級"),
										react.createElement("option", { value: "text" }, "绾枃鏈?),
										react.createElement("option", { value: "json" }, "鑷畾涔?JSON")
									),
									react.createElement("p", { style: HINT }, "ntfy=棰戦亾鍦板潃鍔犲弬鏁帮紱绾枃鏈?鍙彂姝ｆ枃锛汮SON=鎸変俊灏佹ā鏉垮彂閫?)
								),
								// 淇″皝妯℃澘锛堜粎 JSON 妯″紡锛?								draftFormat === "json" ? react.createElement("div", { style: Object.assign({}, FIELD, { borderTop: "1px solid var(--dsw-alias-border-l2)" }) },
									react.createElement("div", { style: FIELD_HEAD },
										react.createElement("span", { style: FIELD_LABEL }, "淇″皝妯℃澘"),
										draftJsonTemplate !== (current ? current.jsonTemplate : "") && ready ? react.createElement("button", { type: "button", style: RESET, onClick: function() { setDraftJsonTemplate(current.jsonTemplate); } }, "閲嶇疆") : null
									),
									react.createElement("input", {
										type: "text", spellCheck: false,
										value: draftJsonTemplate,
										disabled: !ready,
										onChange: function(e) { setDraftJsonTemplate(e.target.value); },
										style: INPUT,
									}),
									react.createElement("p", { style: HINT }, "鍗犱綅绗?{title} {body} {priority}锛屽彲甯﹀紩鍙蜂篃鍙笉甯︺€備緥锛歿\"title\":\"{title}\",\"body\":\"{body}\"}锛圔ark 鐢級")
								) : null,
								// 娑堟伅妯℃澘
								react.createElement("div", { style: Object.assign({}, FIELD, { borderTop: "1px solid var(--dsw-alias-border-l2)" }) },
									react.createElement("div", { style: FIELD_HEAD },
										react.createElement("span", { style: FIELD_LABEL }, "娑堟伅妯℃澘"),
										draftTemplate !== (current ? current.template : "") && ready ? react.createElement("button", { type: "button", style: RESET, onClick: function() { setDraftTemplate(current.template); } }, "閲嶇疆") : null
									),
									react.createElement("input", {
										type: "text", spellCheck: false,
										value: draftTemplate,
										disabled: !ready,
										onChange: function(e) { setDraftTemplate(e.target.value); },
										style: INPUT,
									}),
									react.createElement("p", { style: HINT }, "鍗犱綅绗︼細{turn} 杞 路 {time} 鏃堕棿 路 {minutes} 鐢ㄦ椂 路 {preview} 鍥炲鎽樺綍 路 {ai} AI鎬荤粨")
								),
								// AI 鎬荤粨
								react.createElement("div", { style: Object.assign({}, FIELD, { borderTop: "1px solid var(--dsw-alias-border-l2)" }) },
									react.createElement("div", { style: FIELD_HEAD },
										react.createElement("span", { style: FIELD_LABEL }, "AI 鑷姩鎬荤粨"),
										draftAi !== (current ? current.aiSummary : false) && ready ? react.createElement("button", { type: "button", style: RESET, onClick: function() { setDraftAi(current.aiSummary); } }, "閲嶇疆") : null
									),
									react.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" } },
										react.createElement("input", {
											type: "checkbox",
											checked: draftAi === true,
											disabled: !ready,
											onChange: function(e) { setDraftAi(e.target.checked); },
											style: { accentColor: "var(--dsw-alias-brand-primary)", width: "16px", height: "16px" },
										}),
										react.createElement("span", { style: HINT }, "鐢ㄦā鍨嬫妸涓婁竴鏉″洖澶嶆€荤粨鎴愬嚑涓瓧锛堝け璐ヨ嚜鍔ㄥ洖閫€鎽樺綍锛?)
									)
								),
								react.createElement("div", { style: FOOTER },
									failed ? react.createElement("p", { style: { minWidth: 0, color: "var(--dsw-alias-label-error)", flex: 1, margin: 0, fontSize: "12px", lineHeight: 1.5 } }, "淇濆瓨澶辫触") : null,
									react.createElement("button", {
										type: "button",
										disabled: !dirty || saving,
										onClick: discard,
										style: Object.assign({}, BTN_DISCARD, (!dirty || saving) ? BTN_DISABLED : null),
									}, "鏀惧純"),
									react.createElement("button", {
										type: "button",
										disabled: !dirty || saving,
										onClick: save,
										style: Object.assign({}, BTN_SAVE, (!dirty || saving) ? BTN_DISABLED : null),
									}, saving ? "淇濆瓨涓€? : "淇濆瓨")
								)
							) : null
						);
					}
				);
			});

			// ---- 璁剧疆椤?General 鎶樺彔闈㈡澘锛堜繚鐣欙級----
			slots.inject("settings.general.item", function() {
				return slots.register(
					{ name: "settings.general.item", id: "band-notify-settings" },
					function() {
						var DEFAULT_URL = "https://ntfy.sh/你的频道";
						var STOPS = [0, 0.5, 1, 2, 3, 5, 8, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240];
						function idxOf(v) {
							var i = STOPS.indexOf(v);
							if (i !== -1) return i;
							var best = 0, bestD = Infinity;
							for (var k = 0; k < STOPS.length; k++) {
								var d = Math.abs(STOPS[k] - v);
								if (d < bestD) { bestD = d; best = k; }
							}
							return best;
						}
						var o = react.useState(false);
						var open = o[0], setOpen = o[1];
						var m = react.useState(null);
						var min = m[0], setMin = m[1];
						var t = react.useState("");
						var txt = t[0], setTxt = t[1];
						var u = react.useState("");
						var url = u[0], setUrl = u[1];
						var ud = react.useState("");
						var urlDraft = ud[0], setUrlDraft = ud[1];

						react.useEffect(function() {
							var alive = true;
							loadConfig().then(function(r) {
								if (!alive || !r) return;
								if (typeof r.minMinutes === "number") { setMin(r.minMinutes); setTxt(String(r.minMinutes)); }
								if (typeof r.endpoint === "string") { setUrl(r.endpoint); setUrlDraft(r.endpoint); }
							}).catch(function() {});
							return function() { alive = false; };
						}, []);

						var commitMin = function(n) { setMin(n); saveConfig({ minMinutes: n }).catch(function() {}); };
						var onSlide = function(e) {
							var v = STOPS[parseInt(e.target.value, 10)];
							setTxt(String(v)); commitMin(v);
						};
						var onType = function(e) {
							var s = e.target.value; setTxt(s);
							var n = parseFloat(s);
							if (!isNaN(n) && n >= 0) commitMin(Math.round(n * 10) / 10);
						};
						var onBlurMin = function() {
							var n = parseFloat(txt);
							if (isNaN(n) || n < 0) setTxt(String(min === null ? 0 : min));
						};
						var commitUrl = function(v) {
							if (/^https?:\/\//.test(v)) { setUrl(v); saveConfig({ endpoint: v }).catch(function() {}); }
							else { setUrlDraft(url); }
						};
						var secondary = { color: "var(--dsw-alias-label-secondary)", fontSize: "12px" };
						var inputStyle = {
							width: "100%", padding: "4px 8px", borderRadius: "6px",
							border: "1px solid var(--dsw-alias-border-l2)",
							background: "var(--dsw-alias-bg-layer-2)",
							color: "var(--dsw-alias-label-primary)", fontSize: "13px", boxSizing: "border-box",
						};
						var numStyle = {
							width: "52px", padding: "3px 6px", borderRadius: "6px",
							border: "1px solid var(--dsw-alias-border-l2)",
							background: "var(--dsw-alias-bg-layer-2)",
							color: "var(--dsw-alias-label-primary)", fontSize: "13px",
						};

						return react.createElement("div", { style: { padding: "6px 0" } },
							react.createElement("button", {
								type: "button",
								onClick: function() { setOpen(!open); },
								style: {
									display: "flex", alignItems: "center", gap: "6px", width: "100%", padding: "4px 0",
									background: "transparent", border: "none", color: "var(--dsw-alias-label-primary)",
									fontSize: "13px", cursor: "pointer", textAlign: "left",
								},
							},
								react.createElement("svg", { viewBox: "0 0 24 24", width: 14, height: 14, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { transform: open ? "rotate(90deg)" : "none", transition: "transform .15s ease" } },
									react.createElement("polyline", { points: "9 18 15 12 9 6" })
								),
								react.createElement("span", null, "瀹屾垚鎻愰啋璁剧疆")
							),
							open ? react.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "12px", padding: "10px 0 4px 20px" } },
								react.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
									react.createElement("span", { style: secondary }, "鎺ㄩ€佸湴鍧€锛坔ttp/https 鍧囧彲锛?),
									react.createElement("div", { style: { display: "flex", gap: "6px" } },
										react.createElement("input", {
											type: "text", spellCheck: false, value: urlDraft,
											onChange: function(e) { setUrlDraft(e.target.value); },
											onBlur: function() { commitUrl(urlDraft); },
											onKeyDown: function(e) { if (e.key === "Enter") e.target.blur(); },
											placeholder: "https://ntfy.sh/棰戦亾鍚?, style: inputStyle,
										}),
										react.createElement("button", {
											type: "button",
											onClick: function() { setUrlDraft(DEFAULT_URL); commitUrl(DEFAULT_URL); },
											style: { flexShrink: 0, padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-secondary)", fontSize: "12px", cursor: "pointer" },
										}, "榛樿")
									),
									react.createElement("span", { style: secondary }, "褰撳墠锛? + (url || "鍔犺浇涓€?))
								),
								react.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" } },
									react.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "2px" } },
										react.createElement("span", null, "闀夸换鍔￠€氱煡"),
										react.createElement("span", { style: secondary }, "瀵硅瘽瓒呰繃 " + (min === null ? 0 : min) + " 鍒嗛挓鎵嶆帹閫?路 0=姣忚疆閮介€氱煡")
									),
									react.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: "8px" } },
										react.createElement("input", {
											type: "range", min: 0, max: STOPS.length - 1, step: 1,
											value: min === null ? 0 : idxOf(min),
											onChange: onSlide, disabled: min === null,
											title: "妗ｄ綅锛? + STOPS.join(" / ") + " 鍒嗛挓",
											style: { width: "150px", accentColor: "var(--dsw-alias-brand-primary)", cursor: "pointer" },
										}),
										react.createElement("input", { type: "number", min: 0, value: txt, onChange: onType, onBlur: onBlurMin, disabled: min === null, style: numStyle }),
										react.createElement("span", { style: secondary }, "鍒嗛挓")
									)
								)
							) : null
						);
					}
				);
			});
		}

		exports.apply = apply;
		return module.exports;
	}
});
