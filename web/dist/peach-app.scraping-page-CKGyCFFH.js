(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "929a4a46-87c0-4da6-81e7-8509c09d31f9", e._sentryDebugIdIdentifier = "sentry-dbid-929a4a46-87c0-4da6-81e7-8509c09d31f9");
	} catch {}
})();
import { $fe21c36db05242bb$export$d7b12c4107be0d61 as e, AMANE_BRIDGE_CHECK_URL as t, AMANE_BRIDGE_KEY as n, AMANE_BRIDGE_REBUILD_URL as r, Button as i, COVER_JOB_KEY as a, CUSTOM_SOURCES_KEY as o, CUSTOM_SOURCES_URL as s, Checkbox as c, Disclosure as l, ErrorText as u, ExternalLink as d, Fact as f, FactList as p, FieldLabel as m, Footer as h, Help as g, Input as _, LinkButton as v, LoadingDots as y, Note as b, Rows as ee, SCRAPING_CHECK_URL as te, SCRAPING_COVER_URL as x, SCRAPING_KEY as S, SCRAPING_SETTINGS_URL as ne, SEGMENT as re, SEGMENTED_TRACK as ie, Section as C, SegmentedRadioGroup as ae, Select$1 as oe, SelectField as w, SelectItem as se, SettingsRow as ce, Stack as T, StatusLabel as E, __toESM as D, apiSend as O, busyProps as k, checkText as le, confirmModal as A, errorMessage as j, esc as M, fetchAmaneBridge as N, fetchCoverJob as P, fetchCustomSources as F, fetchSources as I, i2 as ue, queryClient as L, require_jsx_runtime as R, require_react as z, spinnerHtml as B, t as V, useAction as H, useBackgroundJob as U, useMutation as W, useQuery as G } from "./peach-app.js";
import { CodeBlock as de } from "./peach-app.code-block-fZBaj4Z_.js";
import { Page as K } from "./peach-app.page-QAncjzM1.js";
import { SiteMark as q } from "./peach-app.site-mark-D_VlIyJz.js";
import { ConnectionStatus as fe } from "./peach-app.connection-status-CmFoMQyr.js";
// src/react/scraping/custom-sources.tsx
var J = /* @__PURE__ */ D(z(), 1), Y = R(), pe = [
	["code", V("番号")],
	["title", V("标题")],
	["studio", V("厂牌")],
	["series", V("系列")],
	["release_date", V("发行日期")],
	["performers", V("演员（文本数组）")],
	["tags", V("标签（文本数组）")]
], me = [
	["censored", V("有码")],
	["amateur", V("素人")],
	["uncensored", V("无码")],
	["fc2", "FC2"],
	["kmib", V("韩国 MIB")],
	["other", V("其他")],
	["unsure", V("待核番号")],
	["unknown", V("未知")]
], he = () => ({
	name: "",
	endpoint: "",
	enabled: !1,
	fields: {
		code: "id",
		title: "title"
	},
	content_types: ["censored"]
});
function ge({ receipt: e }) {
	let [t, n] = (0, J.useState)(null), r = G({
		queryKey: o,
		queryFn: ({ signal: e }) => F(e)
	}), a = H(), c = (e) => L.setQueryData(o, e), l = !!(r.isPending || r.error || r.data?.items.length || a.error), d = /* @__PURE__ */ (0, Y.jsx)(i, {
		variant: "secondary",
		onClick: () => n(he()),
		children: V("添加来源")
	});
	return /* @__PURE__ */ (0, Y.jsxs)(C, {
		title: V("自定义元数据来源"),
		children: [
			l ? /* @__PURE__ */ (0, Y.jsxs)(T, { children: [
				r.isPending ? /* @__PURE__ */ (0, Y.jsx)("div", {
					"aria-busy": "true",
					"data-skeleton": "",
					"aria-label": V("读取自定义来源")
				}) : null,
				r.error ? /* @__PURE__ */ (0, Y.jsx)(u, { children: j(r.error) }) : null,
				r.data?.items.map((t) => /* @__PURE__ */ (0, Y.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, Y.jsx)("span", {
							className: "min-w-0 flex-1",
							children: t.name
						}),
						/* @__PURE__ */ (0, Y.jsx)(E, {
							tone: t.enabled ? "success" : "neutral",
							children: t.enabled ? V("已启用") : V("已停用")
						}),
						/* @__PURE__ */ (0, Y.jsx)(i, {
							variant: "secondary",
							onClick: () => n(t),
							children: V("编辑")
						}),
						/* @__PURE__ */ (0, Y.jsx)(i, {
							variant: "secondary",
							...k(a.busy === t.id),
							onClick: () => void a.run(t.id, (e) => O(s, {
								...t,
								enabled: !t.enabled
							}, "POST", e), (n) => {
								c(n), e(t.enabled ? V("已停用来源") : V("已启用来源"));
							}),
							children: t.enabled ? V("停用") : V("启用")
						}),
						/* @__PURE__ */ (0, Y.jsx)(i, {
							variant: "danger",
							onClick: () => A({
								title: V("删除自定义来源"),
								body: V("删除「{esc}」后，采集将不再查询这个来源。", { esc: M(t.name) }),
								confirmLabel: V("删除来源"),
								danger: !0,
								onConfirm: async () => {
									c(await O(s, {
										action: "delete",
										id: t.id
									})), n(null), e(V("已删除来源"));
								}
							}),
							children: V("删除")
						})
					]
				}, t.id)),
				a.error ? /* @__PURE__ */ (0, Y.jsx)(u, { children: a.error }) : null
			] }) : null,
			t ? null : l ? /* @__PURE__ */ (0, Y.jsx)(h, { children: d }) : /* @__PURE__ */ (0, Y.jsx)(T, { children: /* @__PURE__ */ (0, Y.jsx)("div", {
				className: "flex justify-end",
				children: d
			}) }),
			t ? /* @__PURE__ */ (0, Y.jsx)(_e, {
				initial: t,
				cancel: () => n(null),
				saved: (t) => {
					c(t), n(null), e(V("已保存来源"));
				}
			}, t.id || "new") : null
		]
	});
}
function _e({ initial: e, cancel: t, saved: n }) {
	let [r, a] = (0, J.useState)(e), [o, l] = (0, J.useState)(""), [d, f] = (0, J.useState)(""), p = (0, J.useRef)(0), v = H(), y = (e) => {
		p.current++, a((t) => ({
			...t,
			...e
		})), f("");
	};
	return /* @__PURE__ */ (0, Y.jsxs)("form", {
		"aria-label": V("元数据来源配置"),
		"aria-busy": v.busy === "preview",
		onSubmit: (e) => {
			e.preventDefault(), v.run("save", (e) => O(s, r, "POST", e), n);
		},
		children: [/* @__PURE__ */ (0, Y.jsxs)(T, { children: [
			/* @__PURE__ */ (0, Y.jsx)(_, {
				label: V("来源名称"),
				value: r.name,
				maxLength: 80,
				onChange: (e) => y({ name: e })
			}),
			/* @__PURE__ */ (0, Y.jsx)(_, {
				label: V("JSON 接口地址"),
				value: r.endpoint,
				maxLength: 2048,
				placeholder: "https://example.com/api/movies/{code}",
				onChange: (e) => y({ endpoint: e })
			}),
			/* @__PURE__ */ (0, Y.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, Y.jsx)(m, { children: V("来源连接方式") }), /* @__PURE__ */ (0, Y.jsx)(w, {
					id: "custom-source-network",
					label: V("来源连接方式"),
					epoch: 0,
					value: r.network || "direct",
					options: [["direct", V("直连")], ["peach_proxy", V("Peach 代理")]],
					onPick: (e) => y({ network: e })
				})]
			}),
			/* @__PURE__ */ (0, Y.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, Y.jsx)(m, { children: V("接口番号格式") }), /* @__PURE__ */ (0, Y.jsx)(w, {
					id: "custom-source-code-format",
					label: V("接口番号格式"),
					epoch: 0,
					value: r.code_format || "original",
					options: [
						["original", V("原样")],
						["lowercase", V("小写")],
						["compact", V("去掉连字符")],
						["underscore", V("连字符转下划线")]
					],
					onPick: (e) => y({ code_format: e })
				})]
			}),
			/* @__PURE__ */ (0, Y.jsx)(g, { children: V("填写公开 JSON 接口和响应字段路径，例如 data.title。番号字段用于核对作品身份。") }),
			pe.map(([e, t]) => /* @__PURE__ */ (0, Y.jsx)(_, {
				label: V("{label}字段路径", { label: t }),
				value: r.fields[e] || "",
				onChange: (t) => {
					let n = { ...r.fields };
					t ? n[e] = t : delete n[e], y({ fields: n });
				}
			}, e)),
			/* @__PURE__ */ (0, Y.jsx)("div", {
				className: "flex flex-wrap gap-3",
				role: "group",
				"aria-label": V("适用内容类型"),
				children: me.map(([e, t]) => /* @__PURE__ */ (0, Y.jsx)(c, {
					isSelected: r.content_types.includes(e),
					onChange: (t) => y({ content_types: t ? [...r.content_types, e] : r.content_types.filter((t) => t !== e) }),
					children: t
				}, e))
			}),
			/* @__PURE__ */ (0, Y.jsx)(c, {
				isSelected: r.enabled,
				onChange: (e) => y({ enabled: e }),
				children: V("启用来源")
			}),
			/* @__PURE__ */ (0, Y.jsx)(_, {
				label: V("试查番号（回车查询）"),
				value: o,
				onChange: (e) => {
					p.current++, l(e), f("");
				},
				onKeyDown: (e) => {
					if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
					e.preventDefault();
					let t = p.current;
					v.run("preview", (e) => O(s, {
						...r,
						code: o,
						action: "preview"
					}, "POST", e), (e) => {
						t === p.current && f(JSON.stringify(e.record, null, 2));
					}, (e) => {
						t === p.current && v.setError(j(e));
					});
				}
			}),
			v.busy === "preview" ? /* @__PURE__ */ (0, Y.jsxs)(g, {
				role: "status",
				children: [/* @__PURE__ */ (0, Y.jsx)("span", { dangerouslySetInnerHTML: { __html: B(V("正在试查来源")) } }), V("正在试查来源")]
			}) : null,
			d ? /* @__PURE__ */ (0, Y.jsx)(de, {
				code: d,
				language: "json",
				label: V("元数据接口返回")
			}) : null,
			v.error ? /* @__PURE__ */ (0, Y.jsx)(u, { children: v.error }) : null
		] }), /* @__PURE__ */ (0, Y.jsxs)(h, { children: [/* @__PURE__ */ (0, Y.jsx)(i, {
			variant: "secondary",
			type: "button",
			onClick: t,
			children: V("取消")
		}), /* @__PURE__ */ (0, Y.jsx)(i, {
			type: "submit",
			...k(v.busy === "save"),
			children: V("保存来源")
		})] })]
	});
}
// src/react/scraping/scraping-page.tsx
var X = [["peach", V("Peach 代理")], ["direct", V("直接连接")]];
function Z(e) {
	return X.some(([t]) => t === e) || !e ? [...X] : [...X, [e, e]];
}
function Q(e) {
	try {
		return new URL(e).host || e;
	} catch {
		return e;
	}
}
var $ = [["paste", V("粘贴 Cookie")], ["file", V("导入文件")]];
function ve() {
	return /* @__PURE__ */ (0, Y.jsx)(q, { source: "github" });
}
function ye({ source: t, toast: n }) {
	let [r, a] = (0, J.useState)(t.network), [o, s] = (0, J.useState)(""), [c, l] = (0, J.useState)(""), [f, p] = (0, J.useState)($[0][0]), [g, y] = (0, J.useState)(""), [x, w] = (0, J.useState)(""), D = (0, J.useRef)(null);
	function A() {
		s(""), l(""), y(""), w(""), D.current && (D.current.value = "");
	}
	let M = W({
		mutationFn: (e) => O(ne, {
			source: t.source,
			network: r,
			cookie: o,
			cookies_text: c,
			revoke: e
		}),
		onSuccess: (e, t) => {
			L.setQueryData(S, (t) => t && {
				...t,
				sources: t.sources.map((t) => t.source === e.saved.source ? e.saved : t)
			}), A(), n(V(t ? "Cookie 已撤销" : "来源设置已保存"));
		}
	}), N = W({ mutationFn: () => O(te, { source: t.source }) }), P = M.isPending || N.isPending, F = (e) => {
		e.preventDefault(), !P && (N.reset(), M.mutate(!1));
	}, I = () => {
		P || (N.reset(), M.mutate(!0));
	}, R = () => {
		P || (M.reset(), N.mutate());
	};
	async function z(e) {
		let t = e.currentTarget, n = t.files?.[0];
		if (l(""), w(""), !n) y("");
		else if (n.size > 262144) t.value = "", y(""), w(V("Cookie 文本超过 256 KiB"));
		else try {
			let e = await n.text();
			l(e), y(n.name);
		} catch {
			w(V("Cookie 文件未读取，请重新选择"));
		}
	}
	let B = x || (M.error ? j(M.error) : "") || (N.error ? j(N.error) : ""), H = N.data?.results ?? [], U = r === "peach" || t.accepts_cookie || t.browser || !!B || H.length > 0;
	return /* @__PURE__ */ (0, Y.jsxs)(C, {
		title: t.label,
		onSubmit: F,
		aside: /* @__PURE__ */ (0, Y.jsxs)("span", {
			className: "flex min-w-0 items-center gap-1",
			children: [/* @__PURE__ */ (0, Y.jsx)(q, { source: t.source }), t.login ? /* @__PURE__ */ (0, Y.jsx)(d, {
				href: t.login,
				children: Q(t.login)
			}) : null]
		}),
		children: [
			/* @__PURE__ */ (0, Y.jsx)(ee, { children: /* @__PURE__ */ (0, Y.jsx)(ce, {
				label: V("连接方式"),
				children: /* @__PURE__ */ (0, Y.jsx)(oe, {
					"aria-label": V("连接方式"),
					className: "w-44 min-w-0",
					selectedKey: r,
					onSelectionChange: (e) => {
						e !== null && a(String(e));
					},
					children: Z(r).map(([e, t]) => /* @__PURE__ */ (0, Y.jsx)(se, {
						id: e,
						children: t
					}, e))
				})
			}) }),
			t.cooldown_until && t.cooldown_until > Date.now() / 1e3 ? /* @__PURE__ */ (0, Y.jsx)(b, {
				tone: "warning",
				children: /* @__PURE__ */ (0, Y.jsxs)("span", {
					className: "inline-flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, Y.jsx)(E, {
						tone: "warning",
						children: V("冷却中")
					}), /* @__PURE__ */ (0, Y.jsxs)("span", { children: [
						V("可在"),
						" ",
						(/* @__PURE__ */ new Date(t.cooldown_until * 1e3)).toLocaleString("zh-CN"),
						" ",
						V("后重试。")
					] })]
				})
			}) : null,
			U ? /* @__PURE__ */ (0, Y.jsxs)(T, {
				divided: !0,
				children: [
					r === "peach" ? /* @__PURE__ */ (0, Y.jsx)("span", {
						className: "self-start",
						children: /* @__PURE__ */ (0, Y.jsx)(v, {
							href: "/settings/library#peachProxy",
							size: "small",
							trailingIcon: ue,
							children: V("配置 Peach 代理")
						})
					}) : null,
					t.browser ? /* @__PURE__ */ (0, Y.jsx)("p", {
						className: "text-body-2-regular text-text-secondary",
						children: V("人机验证由本机浏览器自动完成；需要点击时窗口会弹出。这台机器上不需要 Cookie。")
					}) : null,
					t.accepts_cookie && !t.browser ? /* @__PURE__ */ (0, Y.jsxs)(Y.Fragment, { children: [
						/* @__PURE__ */ (0, Y.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, Y.jsx)("span", {
								className: "self-start",
								children: /* @__PURE__ */ (0, Y.jsx)(E, {
									tone: t.cookie_saved ? "success" : "neutral",
									children: t.cookie_saved ? V("Cookie 已保存") : V("Cookie 未配置")
								})
							}), /* @__PURE__ */ (0, Y.jsx)("p", {
								className: "text-body-2-regular text-text-secondary",
								children: t.cookie_saved ? V("登录有效性待验证。") : V("需要登录时，任选一种方式提供 Cookie。")
							})]
						}),
						/* @__PURE__ */ (0, Y.jsx)(ae, {
							"aria-label": V("提供 Cookie 的方式（二选一）"),
							value: f,
							onChange: (e) => {
								p(e), A();
							},
							className: ie,
							children: $.map(([t, n]) => /* @__PURE__ */ (0, Y.jsx)(e, {
								value: t,
								className: re,
								children: n
							}, t))
						}),
						f === "paste" ? /* @__PURE__ */ (0, Y.jsx)(_, {
							type: "password",
							label: "Cookie",
							autoComplete: "off",
							value: o,
							onChange: s
						}) : /* @__PURE__ */ (0, Y.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, Y.jsx)(m, { children: V("Netscape Cookie 文件（.txt）") }),
								/* @__PURE__ */ (0, Y.jsxs)("div", {
									className: "flex flex-wrap items-center gap-3",
									children: [/* @__PURE__ */ (0, Y.jsx)(i, {
										variant: "secondary",
										onClick: () => D.current?.click(),
										children: V("选择文件")
									}), /* @__PURE__ */ (0, Y.jsx)("span", {
										className: "min-w-0 text-body-2-regular break-all text-text-secondary",
										children: g || V("未选择文件")
									})]
								}),
								/* @__PURE__ */ (0, Y.jsx)("input", {
									ref: D,
									type: "file",
									accept: ".txt",
									tabIndex: -1,
									"aria-hidden": !0,
									className: "hidden",
									onChange: (e) => {
										z(e);
									}
								})
							]
						})
					] }) : null,
					B ? /* @__PURE__ */ (0, Y.jsx)(u, { children: B }) : null,
					H.map((e) => /* @__PURE__ */ (0, Y.jsx)(b, {
						tone: e.ok ? "success" : "error",
						children: /* @__PURE__ */ (0, Y.jsxs)("span", {
							className: "flex flex-col items-start gap-1",
							children: [/* @__PURE__ */ (0, Y.jsx)(fe, {
								tone: e.ok ? "success" : "error",
								children: e.ok ? V("可访问") : V("连接失败")
							}), /* @__PURE__ */ (0, Y.jsx)("span", { children: le(e, t.label) })]
						})
					}, e.label))
				]
			}) : null,
			/* @__PURE__ */ (0, Y.jsxs)(h, { children: [
				t.accepts_cookie && t.cookie_saved ? /* @__PURE__ */ (0, Y.jsx)(i, {
					variant: "secondary",
					onClick: I,
					...k(P),
					children: V("撤销 Cookie")
				}) : null,
				/* @__PURE__ */ (0, Y.jsx)(i, {
					variant: "secondary",
					onClick: R,
					...k(P),
					children: V("检查连接")
				}),
				/* @__PURE__ */ (0, Y.jsx)(i, {
					type: "submit",
					...k(P),
					children: V("保存")
				})
			] })
		]
	});
}
function be({ toast: e }) {
	let [t, n] = (0, J.useState)(""), { running: r, outcome: o, start: s } = U({
		queryKey: a,
		queryFn: ({ signal: e }) => P(e),
		start: () => O(x, { code: t }),
		onFinish: (t) => {
			t.status === "complete" && e(t.result || V("封面采集完成"));
		}
	}), c = (e) => {
		e.preventDefault(), !(r || s.isPending || !t.trim()) && s.mutate();
	}, l = s.error ? j(s.error) : o?.status === "failed" ? o.error || V("采集未取得") : "";
	return /* @__PURE__ */ (0, Y.jsx)(C, {
		title: V("高清封面"),
		onSubmit: c,
		children: /* @__PURE__ */ (0, Y.jsxs)(T, { children: [
			/* @__PURE__ */ (0, Y.jsxs)("div", {
				className: "flex flex-wrap items-end gap-2",
				children: [/* @__PURE__ */ (0, Y.jsx)("div", {
					className: "min-w-0 flex-1",
					children: /* @__PURE__ */ (0, Y.jsx)(_, {
						"aria-label": V("馆藏番号"),
						isRequired: !0,
						isDisabled: r,
						value: t,
						onChange: n,
						placeholder: V("输入馆藏番号，如 ABW-232")
					})
				}), /* @__PURE__ */ (0, Y.jsx)(i, {
					type: "submit",
					disabled: !t.trim(),
					...k(r || s.isPending),
					children: V("抓取封面")
				})]
			}),
			r ? /* @__PURE__ */ (0, Y.jsx)(y, { label: V("正在抓取封面") }) : null,
			l ? /* @__PURE__ */ (0, Y.jsx)(b, {
				tone: "error",
				children: l
			}) : null,
			o?.status === "complete" ? /* @__PURE__ */ (0, Y.jsx)(b, {
				tone: "success",
				children: o.result || V("封面采集完成")
			}) : null
		] })
	});
}
function xe({ toast: e }) {
	let { query: a, running: o, outcome: s, start: c } = U({
		queryKey: n,
		queryFn: ({ signal: e }) => N(e),
		start: () => O(r, {}),
		jobOf: (e) => e.job,
		withJob: (e, t) => e && {
			...e,
			job: t
		},
		onFinish: (t) => {
			t.status === "complete" && e(t.result || V("amane 桥已重建"));
		}
	}), u = W({ mutationFn: () => O(t, {}) }), m = a.data;
	if (!m) return a.error ? /* @__PURE__ */ (0, Y.jsx)(C, {
		id: "amane",
		title: "amane",
		children: /* @__PURE__ */ (0, Y.jsx)(T, { children: /* @__PURE__ */ (0, Y.jsx)(b, {
			tone: "error",
			children: j(a.error)
		}) })
	}) : null;
	let _ = o || c.isPending || u.isPending, v = c.error ? j(c.error) : u.error ? j(u.error) : s?.status === "failed" ? s.error || V("重建未完成") : "";
	return /* @__PURE__ */ (0, Y.jsxs)(C, {
		id: "amane",
		title: "amane",
		aside: /* @__PURE__ */ (0, Y.jsx)(d, {
			href: m.repository,
			leadingIcon: ve,
			children: m.repository
		}),
		children: [
			/* @__PURE__ */ (0, Y.jsxs)(p, { children: [
				/* @__PURE__ */ (0, Y.jsx)(f, {
					term: V("已安装版本"),
					children: m.installed_version || V("未安装")
				}),
				/* @__PURE__ */ (0, Y.jsx)(f, {
					term: V("上游最新版本"),
					children: u.data?.latest ?? V("尚未检查")
				}),
				/* @__PURE__ */ (0, Y.jsx)(f, {
					term: V("运行环境"),
					children: m.installed ? V("已安装") : V("未安装")
				}),
				/* @__PURE__ */ (0, Y.jsx)(f, {
					term: V("内置站点"),
					children: V("{count} 个", { count: m.sites.length.toLocaleString() })
				})
			] }),
			/* @__PURE__ */ (0, Y.jsxs)(T, {
				divided: !0,
				children: [
					m.sites.length ? /* @__PURE__ */ (0, Y.jsx)(l, {
						summary: V("查看内置站点"),
						children: /* @__PURE__ */ (0, Y.jsx)("p", {
							className: "text-body-2-regular text-text-secondary",
							children: m.sites.map((e) => e.label).join("、")
						})
					}) : null,
					m.problem ? /* @__PURE__ */ (0, Y.jsx)(b, {
						tone: "error",
						children: m.problem
					}) : /* @__PURE__ */ (0, Y.jsxs)(g, { children: [
						"amane（",
						m.license,
						V("）提供这些内置站点的解析能力。首次需要时，Peach 会自动准备锁定的"),
						" ",
						m.version,
						" ",
						V("版本；安装包内已有可用环境时直接使用。 手动安装也使用此版本，不随上游自动升级。")
					] }),
					o ? /* @__PURE__ */ (0, Y.jsx)(y, { label: V("正在重建运行环境") }) : null,
					v ? /* @__PURE__ */ (0, Y.jsx)(b, {
						tone: "error",
						children: v
					}) : null,
					s?.status === "complete" ? /* @__PURE__ */ (0, Y.jsx)(b, {
						tone: "success",
						children: s.result || V("amane 桥已重建")
					}) : null
				]
			}),
			/* @__PURE__ */ (0, Y.jsxs)(h, { children: [/* @__PURE__ */ (0, Y.jsx)(i, {
				variant: "secondary",
				onClick: () => {
					_ || u.mutate();
				},
				...k(u.isPending),
				children: V("检查上游版本")
			}), /* @__PURE__ */ (0, Y.jsx)(i, {
				disabled: !!m.problem,
				onClick: () => {
					_ || c.mutate();
				},
				...k(o || c.isPending),
				children: m.installed ? V("重新安装") : V("安装")
			})] })
		]
	});
}
function Se({ toast: e }) {
	let t = G({
		queryKey: S,
		queryFn: ({ signal: e }) => I(e)
	}), n = t.data;
	return n ? /* @__PURE__ */ (0, Y.jsxs)(K, { children: [
		/* @__PURE__ */ (0, Y.jsx)("p", {
			className: "text-body-2-regular text-text-secondary",
			children: V("高清图片可能要经代理才能下载，先检查连接。")
		}),
		/* @__PURE__ */ (0, Y.jsx)(be, { toast: e }),
		/* @__PURE__ */ (0, Y.jsx)(ge, { receipt: e }),
		(n.sources || []).map((t) => /* @__PURE__ */ (0, Y.jsx)(ye, {
			source: t,
			toast: e
		}, t.source)),
		/* @__PURE__ */ (0, Y.jsx)(xe, { toast: e })
	] }) : /* @__PURE__ */ (0, Y.jsx)(K, { children: /* @__PURE__ */ (0, Y.jsx)(b, {
		tone: "error",
		title: V("采集来源读取失败"),
		children: t.error ? j(t.error) : V("读取采集来源失败")
	}) });
}
export { Se as ScrapingPage, Q as linkHost, Z as networkOptions };

//# debugId=929a4a46-87c0-4da6-81e7-8509c09d31f9