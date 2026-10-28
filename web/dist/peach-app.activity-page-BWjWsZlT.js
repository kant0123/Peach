(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "435d50d3-9dd3-4dc1-948e-37c7fc712a30", e._sentryDebugIdIdentifier = "sentry-dbid-435d50d3-9dd3-4dc1-948e-37c7fc712a30");
	} catch {}
})();
import { Button as e, Chip as t, Disclosure as n, DownloadsPanel as r, EmptyState as i, LinkButton as a, LoadingDots as o, Note as s, Progress as c, TASKS_KEY as l, TRIGGER_LABELS as u, __toESM as d, apiGet as f, apiSend as p, busyProps as m, cardClass as h, elapsedText as g, errorMessage as _, f1 as ee, fetchEarlier as v, fetchTasks as te, foldByKind as ne, foldRoutine as re, followupDetail as y, followupTally as b, groupFollowups as ie, hasResultProblems as x, i2 as S, isActive as C, isRoutine as ae, latestOfKind as oe, mergeFinished as w, momentText as T, pollInterval as se, problemDestination as E, progressText as D, require_jsx_runtime as O, require_react as k, statusLabel as A, summaryItems as j, t as M, taskIssues as N, uo as ce, useMutation as P, useQuery as F, useQueryClient as I } from "./peach-app.js";
import { CodeBlock as L } from "./peach-app.code-block-fZBaj4Z_.js";
import { Page as R } from "./peach-app.page-QAncjzM1.js";
import { ErrorDetails as z, ErrorExcerpt as B } from "./peach-app.error-excerpt-B_zKhKl7.js";
// src/react/activity/background-issues.tsx
var V = /* @__PURE__ */ d(k(), 1), H = O(), U = ["background-issues"];
function le() {
	let e = (0, V.useId)(), t = F({
		queryKey: U,
		queryFn: ({ signal: e }) => f("/api/background-issues", e),
		refetchInterval: 3e4
	}).data?.issues || [];
	return t.length ? /* @__PURE__ */ (0, H.jsxs)("section", {
		"aria-labelledby": e,
		className: "flex min-w-0 flex-col gap-3",
		children: [/* @__PURE__ */ (0, H.jsx)("h3", {
			id: e,
			className: "text-title-2-medium text-text-primary",
			children: M("需要处理")
		}), /* @__PURE__ */ (0, H.jsx)("ul", {
			className: "flex min-w-0 flex-col gap-3",
			children: t.map((e) => /* @__PURE__ */ (0, H.jsx)("li", { children: /* @__PURE__ */ (0, H.jsx)(W, { issue: e }) }, e.key))
		})]
	}) : null;
}
function W({ issue: t }) {
	let n = I(), r = P({
		mutationFn: () => p(t.retry, {}),
		onSuccess: () => {
			n.invalidateQueries({ queryKey: U });
		}
	}), i = t.since ? M("自 {momentText} 起", { momentText: T(t.since) }) : M("发现于 {momentText}", { momentText: T(t.noticed_at) });
	return /* @__PURE__ */ (0, H.jsx)(s, {
		tone: "error",
		title: t.title,
		action: /* @__PURE__ */ (0, H.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, H.jsx)(a, {
				href: t.href,
				size: "small",
				trailingIcon: S,
				children: t.link_label
			}), t.retry ? /* @__PURE__ */ (0, H.jsx)(e, {
				variant: "secondary",
				size: "small",
				disabled: !t.retry_available,
				...m(r.isPending),
				onClick: () => r.mutate(),
				children: M("立即重试")
			}) : null]
		}),
		children: r.error ? `${i}\n${M("没有重试：{errorMessage}", { errorMessage: _(r.error) })}` : i
	});
}
// src/react/activity/activity-page.tsx
var G = 50, ue = /* @__PURE__ */ new Set(["upgrade-repairs"]), K = {
	succeeded: "lime",
	failed: "rose",
	cancelled: "neutral",
	interrupted: "yellow",
	running: "blue",
	pending: "neutral"
};
function q({ run: e }) {
	let n = e.status === "failed" && e.task_key === "library-processing" && e.result_summary?.outcome === "partial", r = n || e.status === "succeeded" && x(e);
	return /* @__PURE__ */ (0, H.jsx)(t, {
		color: r ? "yellow" : K[e.status] ?? "neutral",
		children: n ? M("部分项目需处理") : r ? M("发现问题") : A(e.status)
	});
}
function J({ rows: e }) {
	return /* @__PURE__ */ (0, H.jsx)("ul", {
		className: "flex min-w-0 flex-col",
		children: e.map((e) => {
			let t = y(e);
			return /* @__PURE__ */ (0, H.jsxs)("li", {
				"data-status": e.status,
				"data-followup-key": e.followup_key,
				className: "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 border-t border-separator-border px-5 py-2.5",
				children: [
					/* @__PURE__ */ (0, H.jsx)("span", {
						className: "min-w-0 break-words text-caption-1-regular text-text-primary",
						children: e.task_label
					}),
					/* @__PURE__ */ (0, H.jsx)(q, { run: e }),
					t ? /* @__PURE__ */ (0, H.jsx)("span", {
						className: "min-w-0 break-words text-caption-1-regular text-text-secondary",
						children: t
					}) : null,
					Object.keys(e.result_summary || {}).length ? /* @__PURE__ */ (0, H.jsx)("div", {
						className: "w-full min-w-0",
						children: /* @__PURE__ */ (0, H.jsx)(n, {
							summary: M("技术详情"),
							contentClassName: "pb-2.5",
							children: /* @__PURE__ */ (0, H.jsx)(L, {
								code: JSON.stringify(e.result_summary, null, 2),
								language: "json",
								label: M("{task_label}技术详情", { task_label: e.task_label })
							})
						})
					}) : null
				]
			}, e.id);
		})
	});
}
function Y({ run: e, meta: t, children: r, footer: i, followups: a, followupTotal: o = 0, badge: s }) {
	let c = (e) => e.status === "running" ? 3 : e.status === "pending" ? 2 : +(e.status === "failed" || e.status === "interrupted"), l = a ? [...a].sort((e, t) => c(t) - c(e) || t.id - e.id).slice(0, G) : [], u = l.length, d = Math.max(a?.length || 0, o);
	return /* @__PURE__ */ (0, H.jsxs)("li", {
		id: `run-${e.id}`,
		"data-status": e.status,
		"data-task-key": e.task_key,
		"data-run-id": e.id,
		className: h({
			padding: "none",
			bordered: "line",
			className: e.status === "failed" ? "flex flex-col border-border-error-default" : "flex flex-col"
		}),
		children: [
			/* @__PURE__ */ (0, H.jsxs)("div", {
				className: "flex flex-col gap-2 px-5 py-4",
				children: [
					/* @__PURE__ */ (0, H.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, H.jsx)("strong", {
							className: "min-w-0 break-words text-title-3-medium text-text-primary",
							children: e.task_label
						}), s ?? /* @__PURE__ */ (0, H.jsx)(q, { run: e })]
					}),
					/* @__PURE__ */ (0, H.jsx)("p", {
						className: "text-caption-1-regular text-text-secondary",
						children: t
					}),
					r
				]
			}),
			u ? /* @__PURE__ */ (0, H.jsx)("div", {
				className: "border-t border-separator-border px-5 py-2.5",
				children: /* @__PURE__ */ (0, H.jsxs)(n, {
					summary: M("任务明细 · {value} 项", { value: d.toLocaleString() }),
					contentClassName: "pb-2.5",
					defaultOpen: l.some((e) => C(e)),
					children: [u < d ? /* @__PURE__ */ (0, H.jsxs)("p", {
						className: "text-caption-1-regular text-text-secondary",
						children: [
							M("列出其中"),
							" ",
							u.toLocaleString(),
							" ",
							M("项，正在处理的排在前面")
						]
					}) : null, /* @__PURE__ */ (0, H.jsx)(J, { rows: l })]
				})
			}) : null,
			Object.keys(e.result_summary || {}).length ? /* @__PURE__ */ (0, H.jsx)("div", {
				className: "border-t border-separator-border px-5 py-2.5",
				children: /* @__PURE__ */ (0, H.jsx)(n, {
					summary: M("技术详情"),
					contentClassName: "pb-2.5",
					children: /* @__PURE__ */ (0, H.jsx)(L, {
						code: JSON.stringify(e.result_summary, null, 2),
						language: "json",
						label: M("{task_label}技术详情", { task_label: e.task_label })
					})
				})
			}) : null,
			i ? /* @__PURE__ */ (0, H.jsx)("div", {
				className: "flex min-h-14 flex-col justify-center rounded-b-2xl border-t border-separator-border bg-card-footer px-5 py-3",
				children: /* @__PURE__ */ (0, H.jsx)(B, {
					text: i,
					className: "text-caption-1-regular text-text-secondary"
				})
			}) : null
		]
	});
}
function de({ run: e, followups: t }) {
	let n = e.progress_total || 0, r = e.progress_current || 0, i = e.progress_label || M("正在进行"), a = g(e.elapsed_seconds), s = [u[e.trigger] || e.trigger, a && M("已跑 {elapsed}", { elapsed: a })].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, H.jsx)(Y, {
		run: e,
		meta: s,
		followups: t,
		children: n > 0 ? /* @__PURE__ */ (0, H.jsxs)("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ (0, H.jsx)(c, {
				label: i,
				value: Math.min(r, n),
				max: n
			}), /* @__PURE__ */ (0, H.jsxs)("p", {
				className: "text-caption-1-regular text-text-secondary wrap-anywhere",
				children: [
					i,
					" · ",
					M("{count} 项", { count: D(r, n) })
				]
			})]
		}) : /* @__PURE__ */ (0, H.jsx)(o, { label: i })
	});
}
function X({ run: e, followups: r, runs: i, latest: o, followupTotal: s, followupFailed: c = 0 }) {
	let l = !!(i && i.length > 1 && s), d = l ? [M("共处理 {value} 项", { value: s.toLocaleString() }), c ? M("其中 {value} 项失败", { value: c.toLocaleString() }) : ""].filter(Boolean) : j(e.result_summary).filter((t) => t !== e.error), f = N(e), p = E(e, o), m = g(e.elapsed_seconds), h = i && i.length > 1 ? i[i.length - 1] : void 0, _ = (h ? [
		u[e.trigger] || e.trigger,
		M("近 {count} 轮", { count: i.length }),
		`${T(h.finished_at)} – ${T(e.finished_at)}`
	] : [
		u[e.trigger] || e.trigger,
		T(e.finished_at),
		m && M("用时 {elapsed}", { elapsed: m })
	]).filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, H.jsxs)(Y, {
		run: e,
		meta: _,
		footer: e.error,
		followups: r,
		followupTotal: s,
		badge: l && c ? /* @__PURE__ */ (0, H.jsx)(t, {
			color: "yellow",
			children: M("发现问题")
		}) : void 0,
		children: [
			d.length === 1 ? /* @__PURE__ */ (0, H.jsx)("p", {
				className: "text-caption-1-regular text-text-secondary wrap-anywhere",
				children: d[0]
			}) : d.length ? /* @__PURE__ */ (0, H.jsx)("ul", {
				className: "flex list-disc flex-col gap-1 pl-5 text-caption-1-regular text-text-secondary wrap-anywhere",
				children: d.map((e, t) => /* @__PURE__ */ (0, H.jsx)("li", { children: e }, t))
			}) : null,
			f.length ? /* @__PURE__ */ (0, H.jsx)(n, {
				summary: M("问题详情 · {length} 项", { length: f.length }),
				contentClassName: "pt-2",
				children: /* @__PURE__ */ (0, H.jsx)(z, {
					label: M("任务问题详情"),
					children: /* @__PURE__ */ (0, H.jsx)("ul", {
						className: "flex min-w-0 flex-col gap-3",
						"data-task-issues": "",
						children: f.map((e, t) => /* @__PURE__ */ (0, H.jsxs)("li", {
							className: "flex min-w-0 flex-col gap-1 text-body-2-regular wrap-anywhere",
							children: [/* @__PURE__ */ (0, H.jsx)("p", {
								className: "text-body-regular text-text-primary",
								children: [
									e.label,
									e.provider,
									e.kind
								].filter(Boolean).join(" · ")
							}), /* @__PURE__ */ (0, H.jsx)(B, {
								text: e.error,
								className: "text-text-primary"
							})]
						}, `${e.source}-${t}`))
					})
				})
			}) : x(e) && ["follow-check", "feed-check"].includes(e.task_key) ? /* @__PURE__ */ (0, H.jsx)("p", {
				className: "text-body-2-regular text-text-secondary",
				children: M("未取得本轮逐项详情，可到来源列表查看检查结果。")
			}) : null,
			p ? /* @__PURE__ */ (0, H.jsx)(a, {
				href: p.href,
				size: "small",
				trailingIcon: S,
				className: "self-start",
				children: p.label
			}) : null
		]
	});
}
function fe({ runs: e, followups: n, counts: r }) {
	let i = e[0], a = e[e.length - 1], o = b(r, e), s = Math.max(o.total, n.length), l = o.total ? o.settled : n.filter((e) => !C(e)).length, d = o.total ? o.failed : n.filter((e) => e.status === "failed" || e.status === "interrupted").length, f = [
		u[i.trigger] || i.trigger,
		e.length > 1 ? M("{length} 批", { length: e.length }) : "",
		M("{momentText} 开始", { momentText: T(a.started_at || a.finished_at) })
	].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, H.jsx)(Y, {
		run: i,
		meta: f,
		followups: n,
		followupTotal: s,
		badge: /* @__PURE__ */ (0, H.jsx)(t, {
			color: "blue",
			children: M("进行中")
		}),
		children: /* @__PURE__ */ (0, H.jsxs)("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ (0, H.jsx)(c, {
				label: M("{task_label}进度", { task_label: i.task_label }),
				value: l,
				max: s
			}), /* @__PURE__ */ (0, H.jsxs)("p", {
				className: "text-caption-1-regular text-text-secondary",
				children: [
					M("已处理"),
					" ",
					D(l, s),
					" ",
					M("项"),
					d ? M(" · 其中 {value} 项失败", { value: d.toLocaleString() }) : ""
				]
			})]
		})
	});
}
function Z({ title: e, children: t }) {
	let n = (0, V.useId)();
	return /* @__PURE__ */ (0, H.jsxs)("section", {
		"aria-labelledby": n,
		className: "flex min-w-0 flex-col gap-3",
		children: [/* @__PURE__ */ (0, H.jsx)("h3", {
			id: n,
			className: "text-title-2-medium text-text-primary",
			children: e
		}), t]
	});
}
function Q({ live: e = !1, children: t }) {
	return /* @__PURE__ */ (0, H.jsx)("ul", {
		"aria-live": e ? "polite" : void 0,
		className: "flex min-w-0 flex-col gap-3",
		children: t
	});
}
function $() {
	let t = F({
		queryKey: l,
		queryFn: ({ signal: e }) => te(e),
		refetchInterval: (e) => se(e.state.data)
	}), n = t.data, a = n?.finished, [o, c] = (0, V.useState)([]), [u, d] = (0, V.useState)(!1), [f, p] = (0, V.useState)({}), [h, g] = (0, V.useState)(a);
	a !== h && (g(a), o.length && h && c(w(o, h)));
	let y = P({
		mutationFn: ({ oldest: e }) => v(e),
		onSuccess: (e, { shown: t }) => {
			c((n) => w(n, t, e.finished || [])), d(!!e.finished_has_more), p((t) => ({
				...t,
				...e.followup_counts
			}));
		}
	}), S = t.error ? _(t.error) : "";
	if (!n) return /* @__PURE__ */ (0, H.jsx)(R, { children: /* @__PURE__ */ (0, H.jsx)(s, {
		tone: "error",
		children: S || M("读取任务中心失败")
	}) });
	let T = w(n.finished || [], o), E = n.working_parents || [], D = [
		...n.running || [],
		...n.skipped || [],
		...T,
		...E
	], O = ie(D), k = new Set(D.map((e) => e.id)), A = (e) => e.filter((e) => !(e.followup_key && e.parent_run_id != null && k.has(e.parent_run_id))), j = A(T), N = j[j.length - 1], I = !!N && (o.length ? u : !!n.finished_has_more), L = () => {
		!y.isPending && N && y.mutate({
			oldest: N,
			shown: T
		});
	}, z = {
		...f,
		...n.followup_counts
	}, B = (e) => e.flatMap((e) => O.get(e.id) || []), U = [...j, ...A(E)].filter((e) => b(z, [e]).active > 0 || O.get(e.id)?.some(C)).sort((e, t) => t.id - e.id), W = A(n.running || []), G = A(n.skipped || []), K = j.filter((e) => !U.includes(e) && !G.some((t) => t.id === e.id)), q = (e) => (O.get(e.id) || []).every((e) => e.status === "succeeded" && !x(e)) && b(z, [e]).failed === 0, J = re(K, (e) => ae(e) && (q(e) || ue.has(e.task_key))), Y = oe(D), $ = !W.length && !U.length && !G.length && !K.length;
	return /* @__PURE__ */ (0, H.jsxs)(R, { children: [
		S ? /* @__PURE__ */ (0, H.jsx)(s, {
			tone: "error",
			children: S
		}) : null,
		n.available === !1 ? /* @__PURE__ */ (0, H.jsx)(s, {
			tone: "warning",
			children: n.message || M("数据库尚未准备好任务记录表")
		}) : null,
		/* @__PURE__ */ (0, H.jsx)(le, {}),
		$ ? /* @__PURE__ */ (0, H.jsx)(i, {
			icon: ce,
			title: M("还没有任务记录"),
			children: M("扫描、追更检查、批量操作和命令行批处理跑起来之后，这里会显示它们的进度与结果。")
		}) : /* @__PURE__ */ (0, H.jsxs)(H.Fragment, { children: [
			/* @__PURE__ */ (0, H.jsx)(Z, {
				title: M("正在进行"),
				children: W.length || U.length ? /* @__PURE__ */ (0, H.jsxs)(Q, {
					live: !0,
					children: [W.map((e) => /* @__PURE__ */ (0, H.jsx)(de, {
						run: e,
						followups: O.get(e.id)
					}, e.id)), ne(U).map(({ run: e, runs: t }) => /* @__PURE__ */ (0, H.jsx)(fe, {
						runs: t,
						followups: B(t),
						counts: z
					}, e.id))]
				}) : /* @__PURE__ */ (0, H.jsx)(s, {
					tone: "neutral",
					children: M("没有任务在跑。")
				})
			}),
			G.length ? /* @__PURE__ */ (0, H.jsx)(Z, {
				title: M("本次未执行"),
				children: /* @__PURE__ */ (0, H.jsx)(Q, { children: G.map((e) => /* @__PURE__ */ (0, H.jsx)(X, {
					run: e,
					latest: Y.has(e.id),
					followups: O.get(e.id)
				}, e.id)) })
			}) : null,
			K.length || I ? /* @__PURE__ */ (0, H.jsxs)(Z, {
				title: M("最近完成"),
				children: [
					K.length ? /* @__PURE__ */ (0, H.jsx)(Q, { children: J.map(({ run: e, runs: t }) => {
						let n = b(z, t);
						return /* @__PURE__ */ (0, H.jsx)(X, {
							run: e,
							runs: t,
							latest: Y.has(e.id),
							followups: B(t),
							followupTotal: n.total,
							followupFailed: n.failed
						}, e.id);
					}) }) : null,
					y.error ? /* @__PURE__ */ (0, H.jsx)(s, {
						tone: "error",
						children: _(y.error)
					}) : null,
					I ? /* @__PURE__ */ (0, H.jsx)(e, {
						variant: "secondary",
						size: "small",
						leadingIcon: ee,
						className: "self-start",
						...m(y.isPending),
						onClick: L,
						children: M("加载更早")
					}) : null
				]
			}) : null
		] }),
		/* @__PURE__ */ (0, H.jsx)(r, {})
	] });
}
export { $ as ActivityPage };

//# debugId=435d50d3-9dd3-4dc1-948e-37c7fc712a30