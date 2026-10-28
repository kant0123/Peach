(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "c9858c91-f47e-4fbd-aa92-60ae6886153d", e._sentryDebugIdIdentifier = "sentry-dbid-c9858c91-f47e-4fbd-aa92-60ae6886153d");
	} catch {}
})();
import { ApiError as e, Button as t, ButtonLink as n, Chip as r, DIAGNOSTICS_KEY as i, Disclosure as a, EmptyState as o, Fact as s, FactList as c, Fieldset as l, FieldsetTitle as u, Input as d, LOC as f, LinkButton as p, LoadingDots as m, Note as h, Progress as g, Section as _, SettingsCard as v, SettingsSectionLabel as y, Stack as b, __toESM as x, apiGet as ee, apiSend as S, busyProps as C, configurationSection as w, cx as T, diagnosticHeaders as E, diagnosticsSkeleton as D, errorMessage as O, fetchDiagnostics as te, fmtDur as k, fmtSize as A, queryClient as j, require_jsx_runtime as M, require_react as ne, settingsPath as re, t as N, tl as P, useAction as F, useQuery as I } from "./peach-app.js";
import { ErrorExcerpt as L } from "./peach-app.error-excerpt-B_zKhKl7.js";
import { DataTable as R } from "./peach-app.data-table-Jvx9PY19.js";
import { SiteMark as z } from "./peach-app.site-mark-D_VlIyJz.js";
// src/react/diagnostics/health-list.tsx
var B = /* @__PURE__ */ x(ne(), 1), V = M(), H = (e) => e.title || e.name || e.code || N("作品 #{id}", { id: e.id }), U = (e) => [[
	N("作品"),
	N("番号"),
	N("文件名"),
	N("媒体库"),
	N("路径"),
	N("时长（秒）"),
	N("大小（字节）")
], ...e.map((e) => [
	H(e),
	e.code ?? "",
	e.name,
	f[e.location] || e.location,
	e.path,
	e.duration ?? "",
	e.size ?? ""
])].map((e) => e.map((e) => String(e ?? "").replace(/[\t\r\n]+/g, " ")).join("	")).join("\n");
function W({ group: e, openItem: n, receipt: r }) {
	let i = F(), [s, c] = (0, B.useState)([]), l = (e) => void i.run("copy", () => navigator.clipboard.writeText(U(e)), () => r(N("已复制清单"))), u = [
		{
			id: "title",
			label: N("作品"),
			value: H,
			render: (e) => /* @__PURE__ */ (0, V.jsxs)("span", {
				className: "flex min-w-0 flex-col gap-1",
				children: [/* @__PURE__ */ (0, V.jsx)(p, {
					variant: "primary",
					className: "justify-start whitespace-normal text-left",
					onClick: () => n(e.id),
					children: H(e)
				}), e.name && e.name !== H(e) ? /* @__PURE__ */ (0, V.jsx)("span", {
					"data-middle-truncate": !0,
					title: e.name,
					className: "block min-w-0 text-caption-1-regular text-text-secondary",
					children: e.name
				}) : null]
			})
		},
		{
			id: "code",
			label: N("番号"),
			width: 144,
			value: (e) => e.code || "",
			render: (e) => /* @__PURE__ */ (0, V.jsx)("span", {
				className: "whitespace-nowrap",
				children: e.code || N("未识别")
			})
		},
		{
			id: "location",
			label: N("媒体库"),
			width: 128,
			value: (e) => f[e.location] || e.location,
			render: (e) => f[e.location] || e.location || N("未取得")
		},
		{
			id: "path",
			label: N("文件路径"),
			width: 320,
			min: 180,
			value: (e) => e.path,
			render: (e) => /* @__PURE__ */ (0, V.jsx)("span", {
				"data-middle-truncate": !0,
				title: e.path,
				className: "block min-w-0 w-full text-body-2-regular text-text-secondary",
				children: e.path || N("未取得")
			})
		},
		{
			id: "duration",
			label: N("时长"),
			width: 112,
			value: (e) => e.duration ?? 0,
			render: (e) => e.duration && e.duration > 0 ? k(e.duration) : N("未取得")
		},
		{
			id: "size",
			label: N("大小"),
			width: 112,
			value: (e) => e.size ?? 0,
			render: (e) => e.size === null ? N("未取得") : A(e.size)
		}
	];
	return /* @__PURE__ */ (0, V.jsx)(a, {
		summary: `${e.label} · ${e.count === null ? N("未取得") : N("{value} 项", { value: e.count.toLocaleString() })}`,
		children: e.count === null ? /* @__PURE__ */ (0, V.jsx)(h, {
			tone: "neutral",
			children: N("清单未取得，请重新检查。")
		}) : e.items.length ? /* @__PURE__ */ (0, V.jsxs)(b, { children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [e.truncated ? /* @__PURE__ */ (0, V.jsx)("span", {
					className: "text-body-2-regular text-text-secondary",
					children: N("已载入 {loaded} / {total} 项", {
						loaded: e.items.length.toLocaleString(),
						total: e.count.toLocaleString()
					})
				}) : null, /* @__PURE__ */ (0, V.jsx)(t, {
					size: "small",
					variant: "secondary",
					...C(i.busy === "copy"),
					onClick: () => l(e.items),
					children: N("复制当前清单")
				})]
			}),
			i.error ? /* @__PURE__ */ (0, V.jsx)(h, {
				tone: "error",
				children: i.error
			}) : null,
			/* @__PURE__ */ (0, V.jsx)(R, {
				label: e.label,
				title: N("作品清单"),
				unit: N("部作品"),
				panel: !1,
				items: e.items,
				columns: u,
				rowId: (e) => String(e.id),
				rowLabel: H,
				selected: s,
				onSelected: c,
				actions: (e) => /* @__PURE__ */ (0, V.jsx)(t, {
					size: "small",
					variant: "secondary",
					...C(i.busy === "copy"),
					onClick: () => l(e),
					children: N("复制所选")
				})
			})
		] }) : /* @__PURE__ */ (0, V.jsx)(o, {
			icon: P,
			title: N("清单为空"),
			size: "compact",
			children: N("没有需要处理的作品。")
		})
	});
}
// src/react/diagnostics/scraping-export.tsx
var G = "/api/diagnostics/exports", K = ["diagnostic-export"];
function q({ kind: r, codes: i = "" }) {
	let a = F(), o = I({
		queryKey: K,
		queryFn: ({ signal: e }) => ee(G, e),
		refetchInterval: (e) => ["running", "cancelling"].includes(e.state.data?.status || "") ? 1e3 : !1
	}), s = o.data, c = s?.kind === r, l = s?.status === "running" || s?.status === "cancelling", u = N(r === "support" ? "下载诊断报告" : "导出刮削记录"), d = (e) => {
		j.setQueryData(K, e);
	}, f = () => void a.run("start", async (t) => {
		let n = await fetch(G, {
			method: "POST",
			signal: t,
			credentials: "same-origin",
			headers: {
				...await E(),
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				kind: r,
				codes: i
			})
		}), a = await n.json().catch(() => null);
		if (!n.ok) throw new e(a?.detail || a?.error || N("诊断导出未启动"), n.status, a);
		if (!a || !a.job_id) throw Error(N("导出任务状态未取得"));
		return a;
	}, d), p = () => void a.run("cancel", (e) => S(`${G}/${s.job_id}/cancel`, {}, "POST", e), d);
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, V.jsx)(t, {
						type: "button",
						variant: "secondary",
						disabled: l,
						...C(a.busy === "start"),
						onClick: f,
						children: u
					}),
					c && l ? /* @__PURE__ */ (0, V.jsx)(t, {
						type: "button",
						variant: "secondary",
						disabled: s.status === "cancelling",
						...C(a.busy === "cancel"),
						onClick: p,
						children: N("取消导出")
					}) : null,
					c && s.status === "complete" && s.download_url ? /* @__PURE__ */ (0, V.jsx)(n, {
						variant: "secondary",
						href: s.download_url,
						children: N("下载已生成的文件")
					}) : null
				]
			}),
			c && l ? s.total && s.total > 0 ? /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "flex flex-col gap-2",
				role: "status",
				children: [/* @__PURE__ */ (0, V.jsxs)("span", {
					className: "text-body-2-regular",
					children: [
						s.stage,
						" · ",
						s.done || 0,
						" / ",
						s.total,
						" ",
						N("项")
					]
				}), /* @__PURE__ */ (0, V.jsx)(g, {
					label: N("导出进度"),
					value: s.done || 0,
					max: s.total
				})]
			}) : /* @__PURE__ */ (0, V.jsx)(m, { label: `${s.stage || N("准备导出")}${s.rows ? N(" · {rows} 条候选", { rows: s.rows }) : ""}${s.files ? N(" · {files} 个文件", { files: s.files }) : ""}` }) : null,
			c && s.status === "complete" ? /* @__PURE__ */ (0, V.jsxs)("p", {
				role: "status",
				className: "text-body-2-regular text-text-secondary",
				children: [
					N("导出已完成 ·"),
					" ",
					((s.bytes || 0) / 1024 / 1024).toFixed(2),
					" MiB"
				]
			}) : null,
			c && s.status === "cancelled" ? /* @__PURE__ */ (0, V.jsx)(h, {
				tone: "neutral",
				children: N("导出已取消")
			}) : null,
			o.isError ? /* @__PURE__ */ (0, V.jsx)(h, {
				tone: "error",
				action: /* @__PURE__ */ (0, V.jsx)(t, {
					type: "button",
					variant: "secondary",
					...C(o.isFetching),
					onClick: () => {
						o.refetch();
					},
					children: N("重新读取")
				}),
				children: N("导出进度未取得")
			}) : null,
			a.error || c && s.status === "failed" ? /* @__PURE__ */ (0, V.jsx)(h, {
				tone: "error",
				children: a.error || s?.error
			}) : null
		]
	});
}
function J() {
	let [e, t] = (0, B.useState)("");
	return /* @__PURE__ */ (0, V.jsx)(l, {
		layout: "stack",
		labelledBy: "scraping-export-title",
		footer: /* @__PURE__ */ (0, V.jsx)(q, {
			kind: "scraping",
			codes: e
		}),
		children: /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "flex min-w-0 flex-col gap-4",
			"aria-label": N("导出刮削记录"),
			children: [
				/* @__PURE__ */ (0, V.jsx)(u, {
					id: "scraping-export-title",
					children: N("刮削记录")
				}),
				/* @__PURE__ */ (0, V.jsx)("p", {
					className: "text-body-2-regular text-text-secondary",
					children: N("导出作品资料、来源取值及演员、厂牌和系列归属，供排查刮削错误。")
				}),
				/* @__PURE__ */ (0, V.jsx)(d, {
					label: N("问题番号（可选）"),
					name: "scraping-codes",
					value: e,
					onChange: t,
					autoComplete: "off",
					spellCheck: "false",
					maxLength: 1300,
					placeholder: N("例如 ABF-087、SYKH-145…"),
					hint: N("多个番号用逗号分隔，最多 20 个；留空导出近期作品。")
				})
			]
		})
	});
}
// src/react/diagnostics/diagnostics-page.tsx
var Y = {
	ok: N("正常"),
	warning: N("需检查"),
	failed: N("需处理"),
	unknown: N("未取得"),
	disabled: N("未配置"),
	stale: N("待复查"),
	unchecked: N("尚无记录")
}, ie = { "/tasks": N("查看任务") }, ae = [
	[N("媒体库与挂载"), ["media_mounts", "data_root"]],
	[N("数据库与迁移"), ["database", "schema"]],
	[N("工具"), ["ffmpeg"]],
	[N("配置与访问"), [
		"configured",
		"security",
		"port",
		"version"
	]],
	[N("后台任务"), ["tasks"]]
], X = (e) => new Date(e).toLocaleString();
function Z({ status: e }) {
	return /* @__PURE__ */ (0, V.jsx)(r, {
		variant: "caption",
		"data-diagnostic-status": e,
		color: e === "failed" ? "rose" : e === "ok" ? "lime" : e === "warning" || e === "stale" ? "yellow" : "neutral",
		children: Y[e] ?? N("未取得")
	});
}
function Q() {
	return /* @__PURE__ */ (0, V.jsx)(q, { kind: "support" });
}
function $({ name: e, check: t, compact: r = !1 }) {
	let i = t.target === "/settings/library" && (e === "security" || e === "port") ? re(N("网络与访问")) : t.target, a = r ? "h4" : "h3";
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		"data-diagnostic-check": e,
		className: T("flex flex-col gap-4 border-b border-separator-border pr-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between", r ? "py-3" : "py-5"),
		children: [/* @__PURE__ */ (0, V.jsxs)("div", {
			className: T("flex min-w-0 flex-1 flex-col", r ? "gap-1" : "gap-2"),
			children: [
				/* @__PURE__ */ (0, V.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, V.jsx)(a, {
						className: T("text-text-primary", r ? "text-body-2-medium" : "text-body-medium"),
						children: t.label
					}), /* @__PURE__ */ (0, V.jsx)(Z, { status: t.status })]
				}),
				/* @__PURE__ */ (0, V.jsx)("p", {
					"data-check-reason": !0,
					className: T("text-body-2-regular break-words", r ? "text-text-secondary" : "text-text-primary"),
					children: t.reason
				}),
				t.action ? /* @__PURE__ */ (0, V.jsx)("p", {
					className: "text-body-2-regular text-text-secondary",
					children: N("处理建议：{action}", { action: t.action })
				}) : null
			]
		}), i ? /* @__PURE__ */ (0, V.jsx)("div", {
			className: "shrink-0 self-end sm:self-auto",
			children: /* @__PURE__ */ (0, V.jsx)(n, {
				size: "small",
				variant: "secondary",
				href: i,
				children: i.startsWith("/settings/") ? N("打开{configurationSection}", { configurationSection: w(i) }) : ie[i] ?? N("打开相关页面")
			})
		}) : null]
	});
}
function oe(e) {
	let r = I({
		queryKey: i,
		queryFn: ({ signal: e }) => te(e),
		staleTime: 1e4
	}), o = F(), [l, u] = (0, B.useState)(""), d = () => void o.run("refresh", async () => {
		let e = await r.refetch();
		if (e.error) throw e.error;
		return e.data;
	}, () => u(""), (e) => u(O(e))), f = r.data;
	if (!f && r.isPending) return /* @__PURE__ */ (0, V.jsx)("div", {
		role: "status",
		"aria-label": N("正在读取系统诊断"),
		dangerouslySetInnerHTML: { __html: D() }
	});
	if (!f) return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "ui-configpage",
		children: [
			/* @__PURE__ */ (0, V.jsx)(Q, {}),
			/* @__PURE__ */ (0, V.jsx)(h, {
				tone: "error",
				title: N("诊断读取失败"),
				action: /* @__PURE__ */ (0, V.jsx)(t, {
					variant: "secondary",
					onClick: d,
					...C(o.busy === "refresh"),
					children: N("重新检查")
				}),
				children: r.error ? O(r.error) : N("诊断报告未取得。")
			}),
			/* @__PURE__ */ (0, V.jsx)(J, {})
		]
	});
	let p = Object.entries(f.checks).filter(([, e]) => [
		"warning",
		"failed",
		"unknown"
	].includes(e.status)), m = Object.entries(f.checks).filter(([, e]) => ![
		"warning",
		"failed",
		"unknown"
	].includes(e.status));
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "flex flex-wrap justify-end gap-2",
				children: [/* @__PURE__ */ (0, V.jsx)(Q, {}), /* @__PURE__ */ (0, V.jsx)(t, {
					variant: "secondary",
					onClick: d,
					...C(o.busy === "refresh"),
					children: N("重新检查")
				})]
			}),
			l ? /* @__PURE__ */ (0, V.jsx)(h, {
				tone: "error",
				children: l
			}) : null,
			p.length ? /* @__PURE__ */ (0, V.jsx)(_, {
				title: N("需要关注 · {length} 项", { length: p.length }),
				children: p.map(([e, t]) => /* @__PURE__ */ (0, V.jsx)($, {
					name: e,
					check: t
				}, e))
			}) : null,
			/* @__PURE__ */ (0, V.jsx)(_, {
				title: N("库健康"),
				children: /* @__PURE__ */ (0, V.jsxs)(b, { children: [f.library.issue_at ? /* @__PURE__ */ (0, V.jsx)("p", {
					className: "text-body-2-regular text-text-secondary",
					children: N("处理记录 · {time}", { time: X(f.library.issue_at) })
				}) : null, Object.entries(f.library.groups).map(([t, n]) => /* @__PURE__ */ (0, V.jsx)(W, {
					group: n,
					...e
				}, t))] })
			}),
			m.length ? /* @__PURE__ */ (0, V.jsx)("section", {
				"aria-label": N("系统检查"),
				children: /* @__PURE__ */ (0, V.jsx)(a, {
					summary: N("其他检查 · {count} 项", { count: m.length }),
					contentClassName: "gap-5",
					children: ae.map(([e, t]) => {
						let n = m.filter(([e]) => t.some((t) => t === e));
						return n.length ? /* @__PURE__ */ (0, V.jsxs)("section", {
							"aria-label": e,
							"data-diagnostic-group": "",
							className: "flex min-w-0 flex-col gap-2",
							children: [/* @__PURE__ */ (0, V.jsxs)("h3", {
								className: "flex items-center gap-2 px-3 text-body-medium text-text-primary",
								children: [e, /* @__PURE__ */ (0, V.jsx)("span", {
									className: "text-caption-1-regular text-text-secondary",
									children: N("{count} 项", { count: n.length })
								})]
							}), /* @__PURE__ */ (0, V.jsx)(v, { children: n.map(([e, t]) => /* @__PURE__ */ (0, V.jsx)($, {
								name: e,
								check: t,
								compact: !0
							}, e)) })]
						}, e) : null;
					})
				})
			}) : null,
			/* @__PURE__ */ (0, V.jsx)(J, {}),
			/* @__PURE__ */ (0, V.jsxs)("section", {
				"aria-label": N("来源会话"),
				className: "flex min-w-0 flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, V.jsx)(y, { children: N("来源会话") }),
					f.sources.map((e) => /* @__PURE__ */ (0, V.jsx)("article", {
						"data-diagnostic-source": e.source,
						children: /* @__PURE__ */ (0, V.jsx)(v, { children: /* @__PURE__ */ (0, V.jsxs)(b, { children: [
							/* @__PURE__ */ (0, V.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, V.jsxs)("h3", {
									className: "flex min-w-0 items-center gap-2 text-body-medium text-text-primary",
									children: [/* @__PURE__ */ (0, V.jsx)(z, { source: e.source }), e.label]
								}), /* @__PURE__ */ (0, V.jsx)(Z, { status: e.status })]
							}),
							/* @__PURE__ */ (0, V.jsx)(L, {
								text: e.reason,
								className: "text-body-regular text-text-primary"
							}),
							/* @__PURE__ */ (0, V.jsxs)(c, { children: [
								/* @__PURE__ */ (0, V.jsx)(s, {
									term: N("上次解析成功"),
									children: e.last_success_at ? X(e.last_success_at) : N("尚无成功记录")
								}),
								e.last_check_at ? /* @__PURE__ */ (0, V.jsxs)(s, {
									term: N("上次检查"),
									children: [X(e.last_check_at), e.elapsed_s !== void 0 && e.elapsed_s !== null ? N(" · {value} 秒", { value: e.elapsed_s.toFixed(2) }) : ""]
								}) : null,
								/* @__PURE__ */ (0, V.jsx)(s, {
									term: N("暂停访问至"),
									children: e.cooldown_until ? X(e.cooldown_until) : N("未暂停")
								})
							] })
						] }) })
					}, e.source)),
					/* @__PURE__ */ (0, V.jsx)("div", { children: /* @__PURE__ */ (0, V.jsx)(n, {
						size: "small",
						variant: "secondary",
						href: "/sources",
						children: N("打开来源和凭证")
					}) })
				]
			})
		]
	});
}
export { oe as DiagnosticsPage };

//# debugId=c9858c91-f47e-4fbd-aa92-60ae6886153d