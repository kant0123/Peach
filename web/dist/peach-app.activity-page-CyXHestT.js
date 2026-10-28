(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "471e9e02-b7f4-44e2-a4a8-294857083d69", e._sentryDebugIdIdentifier = "sentry-dbid-471e9e02-b7f4-44e2-a4a8-294857083d69");
	} catch {}
})();
import { Button as e, Chip as t, Disclosure as n, DownloadsPanel as r, EmptyState as i, LinkButton as a, LoadingDots as o, Note as s, Progress as c, TASKS_KEY as l, TRIGGER_LABELS as u, __toESM as d, apiGet as f, apiSend as p, busyProps as m, cancelTask as h, cardClass as g, elapsedText as _, errorMessage as v, f1 as ee, fetchEarlier as te, fetchTasks as ne, foldByKind as re, foldRoutine as ie, followupDetail as y, followupTally as b, groupFollowups as ae, hasResultProblems as x, i2 as S, isActive as C, isRoutine as oe, latestOfKind as se, mergeFinished as w, momentText as T, pollInterval as ce, problemDestination as E, progressText as D, queryClient as O, require_jsx_runtime as k, require_react as A, statusLabel as j, summaryItems as M, t as N, taskIssues as P, uo as le, useMutation as F, useQuery as ue, useQueryClient as I } from "./peach-app.js";
import { CodeBlock as L } from "./peach-app.code-block-fZBaj4Z_.js";
import { Page as R } from "./peach-app.page-QAncjzM1.js";
import { ErrorDetails as z, ErrorExcerpt as B } from "./peach-app.error-excerpt-B_zKhKl7.js";
// src/react/activity/background-issues.tsx
var V = /* @__PURE__ */ d(A(), 1), H = k(), U = ["background-issues"];
function de() {
	let e = (0, V.useId)(), t = ue({
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
			children: N("需要处理")
		}), /* @__PURE__ */ (0, H.jsx)("ul", {
			className: "flex min-w-0 flex-col gap-3",
			children: t.map((e) => /* @__PURE__ */ (0, H.jsx)("li", { children: /* @__PURE__ */ (0, H.jsx)(W, { issue: e }) }, e.key))
		})]
	}) : null;
}
function W({ issue: t }) {
	let n = I(), r = F({
		mutationFn: () => p(t.retry, {}),
		onSuccess: () => {
			n.invalidateQueries({ queryKey: U });
		}
	}), i = t.since ? N("自 {momentText} 起", { momentText: T(t.since) }) : N("发现于 {momentText}", { momentText: T(t.noticed_at) });
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
				children: N("立即重试")
			}) : null]
		}),
		children: r.error ? `${i}\n${N("没有重试：{errorMessage}", { errorMessage: v(r.error) })}` : i
	});
}
// src/react/activity/activity-page.tsx
var G = 50, fe = /* @__PURE__ */ new Set(["upgrade-repairs"]), K = {
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
		children: n ? N("部分项目需处理") : r ? N("发现问题") : j(e.status)
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
							summary: N("技术详情"),
							contentClassName: "pb-2.5",
							children: /* @__PURE__ */ (0, H.jsx)(L, {
								code: JSON.stringify(e.result_summary, null, 2),
								language: "json",
								label: N("{task_label}技术详情", { task_label: e.task_label })
							})
						})
					}) : null
				]
			}, e.id);
		})
	});
}
function Y({ ids: t, cancelling: n }) {
	let r = F({
		mutationFn: () => Promise.all(t.map((e) => h(e))),
		onSettled: () => O.invalidateQueries({ queryKey: l })
	}), i = n || r.isPending || r.isSuccess;
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "flex flex-col items-start gap-2",
		children: [/* @__PURE__ */ (0, H.jsx)(e, {
			variant: "secondary",
			size: "small",
			...m(i),
			onClick: () => {
				i || r.mutate();
			},
			children: N(i ? "正在中止…" : "中止任务")
		}), r.error ? /* @__PURE__ */ (0, H.jsx)(s, {
			tone: "error",
			children: v(r.error)
		}) : null]
	});
}
function X({ run: e, meta: t, children: r, footer: i, followups: a, followupTotal: o = 0, badge: s, actions: c }) {
	let l = (e) => e.status === "running" ? 3 : e.status === "pending" ? 2 : +(e.status === "failed" || e.status === "interrupted"), u = a ? [...a].sort((e, t) => l(t) - l(e) || t.id - e.id).slice(0, G) : [], d = u.length, f = Math.max(a?.length || 0, o);
	return /* @__PURE__ */ (0, H.jsxs)("li", {
		id: `run-${e.id}`,
		"data-status": e.status,
		"data-task-key": e.task_key,
		"data-run-id": e.id,
		className: g({
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
					r,
					c
				]
			}),
			d ? /* @__PURE__ */ (0, H.jsx)("div", {
				className: "border-t border-separator-border px-5 py-2.5",
				children: /* @__PURE__ */ (0, H.jsxs)(n, {
					summary: N("任务明细 · {value} 项", { value: f.toLocaleString() }),
					contentClassName: "pb-2.5",
					defaultOpen: u.some((e) => C(e)),
					children: [d < f ? /* @__PURE__ */ (0, H.jsxs)("p", {
						className: "text-caption-1-regular text-text-secondary",
						children: [
							N("列出其中"),
							" ",
							d.toLocaleString(),
							" ",
							N("项，正在处理的排在前面")
						]
					}) : null, /* @__PURE__ */ (0, H.jsx)(J, { rows: u })]
				})
			}) : null,
			Object.keys(e.result_summary || {}).length ? /* @__PURE__ */ (0, H.jsx)("div", {
				className: "border-t border-separator-border px-5 py-2.5",
				children: /* @__PURE__ */ (0, H.jsx)(n, {
					summary: N("技术详情"),
					contentClassName: "pb-2.5",
					children: /* @__PURE__ */ (0, H.jsx)(L, {
						code: JSON.stringify(e.result_summary, null, 2),
						language: "json",
						label: N("{task_label}技术详情", { task_label: e.task_label })
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
function pe({ run: e, followups: t }) {
	let n = e.progress_total || 0, r = e.progress_current || 0, i = e.progress_label || N("正在进行"), a = _(e.elapsed_seconds), s = [u[e.trigger] || e.trigger, a && N("已跑 {elapsed}", { elapsed: a })].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, H.jsx)(X, {
		run: e,
		meta: s,
		followups: t,
		actions: /* @__PURE__ */ (0, H.jsx)(Y, {
			ids: [e.id],
			cancelling: !!e.cancelling
		}),
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
					N("{count} 项", { count: D(r, n) })
				]
			})]
		}) : /* @__PURE__ */ (0, H.jsx)(o, { label: i })
	});
}
function Z({ run: e, followups: r, runs: i, latest: o, followupTotal: s, followupFailed: c = 0 }) {
	let l = !!(i && i.length > 1 && s), d = l ? [N("共处理 {value} 项", { value: s.toLocaleString() }), c ? N("其中 {value} 项失败", { value: c.toLocaleString() }) : ""].filter(Boolean) : M(e.result_summary).filter((t) => t !== e.error), f = P(e), p = E(e, o), m = _(e.elapsed_seconds), h = i && i.length > 1 ? i[i.length - 1] : void 0, g = (h ? [
		u[e.trigger] || e.trigger,
		N("近 {count} 轮", { count: i.length }),
		`${T(h.finished_at)} – ${T(e.finished_at)}`
	] : [
		u[e.trigger] || e.trigger,
		T(e.finished_at),
		m && N("用时 {elapsed}", { elapsed: m })
	]).filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, H.jsxs)(X, {
		run: e,
		meta: g,
		footer: e.error,
		followups: r,
		followupTotal: s,
		badge: l && c ? /* @__PURE__ */ (0, H.jsx)(t, {
			color: "yellow",
			children: N("发现问题")
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
				summary: N("问题详情 · {length} 项", { length: f.length }),
				contentClassName: "pt-2",
				children: /* @__PURE__ */ (0, H.jsx)(z, {
					label: N("任务问题详情"),
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
				children: N("未取得本轮逐项详情，可到来源列表查看检查结果。")
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
function me({ runs: e, followups: n, counts: r }) {
	let i = e[0], a = e[e.length - 1], o = b(r, e), s = Math.max(o.total, n.length), l = o.total ? o.settled : n.filter((e) => !C(e)).length, d = o.total ? o.failed : n.filter((e) => e.status === "failed" || e.status === "interrupted").length, f = e.filter((e) => b(r, [e]).active > 0).map((e) => e.id), p = n.filter(C).every((e) => e.cancelling), m = [
		u[i.trigger] || i.trigger,
		e.length > 1 ? N("{length} 批", { length: e.length }) : "",
		N("{momentText} 开始", { momentText: T(a.started_at || a.finished_at) })
	].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, H.jsx)(X, {
		run: i,
		meta: m,
		followups: n,
		followupTotal: s,
		badge: /* @__PURE__ */ (0, H.jsx)(t, {
			color: "blue",
			children: N("进行中")
		}),
		actions: /* @__PURE__ */ (0, H.jsx)(Y, {
			ids: f,
			cancelling: f.length > 0 && p
		}),
		children: /* @__PURE__ */ (0, H.jsxs)("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ (0, H.jsx)(c, {
				label: N("{task_label}进度", { task_label: i.task_label }),
				value: l,
				max: s
			}), /* @__PURE__ */ (0, H.jsxs)("p", {
				className: "text-caption-1-regular text-text-secondary",
				children: [
					N("已处理"),
					" ",
					D(l, s),
					" ",
					N("项"),
					d ? N(" · 其中 {value} 项失败", { value: d.toLocaleString() }) : ""
				]
			})]
		})
	});
}
function Q({ title: e, children: t }) {
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
function $({ live: e = !1, children: t }) {
	return /* @__PURE__ */ (0, H.jsx)("ul", {
		"aria-live": e ? "polite" : void 0,
		className: "flex min-w-0 flex-col gap-3",
		children: t
	});
}
function he() {
	let t = ue({
		queryKey: l,
		queryFn: ({ signal: e }) => ne(e),
		refetchInterval: (e) => ce(e.state.data)
	}), n = t.data, a = n?.finished, [o, c] = (0, V.useState)([]), [u, d] = (0, V.useState)(!1), [f, p] = (0, V.useState)({}), [h, g] = (0, V.useState)(a);
	a !== h && (g(a), o.length && h && c(w(o, h)));
	let _ = F({
		mutationFn: ({ oldest: e }) => te(e),
		onSuccess: (e, { shown: t }) => {
			c((n) => w(n, t, e.finished || [])), d(!!e.finished_has_more), p((t) => ({
				...t,
				...e.followup_counts
			}));
		}
	}), y = t.error ? v(t.error) : "";
	if (!n) return /* @__PURE__ */ (0, H.jsx)(R, { children: /* @__PURE__ */ (0, H.jsx)(s, {
		tone: "error",
		children: y || N("读取任务中心失败")
	}) });
	let S = w(n.finished || [], o), T = n.working_parents || [], E = [
		...n.running || [],
		...n.skipped || [],
		...S,
		...T
	], D = ae(E), O = new Set(E.map((e) => e.id)), k = (e) => e.filter((e) => !(e.followup_key && e.parent_run_id != null && O.has(e.parent_run_id))), A = k(S), j = A[A.length - 1], M = !!j && (o.length ? u : !!n.finished_has_more), P = () => {
		!_.isPending && j && _.mutate({
			oldest: j,
			shown: S
		});
	}, I = {
		...f,
		...n.followup_counts
	}, L = (e) => e.flatMap((e) => D.get(e.id) || []), z = [...A, ...k(T)].filter((e) => b(I, [e]).active > 0 || D.get(e.id)?.some(C)).sort((e, t) => t.id - e.id), B = k(n.running || []), U = k(n.skipped || []), W = A.filter((e) => !z.includes(e) && !U.some((t) => t.id === e.id)), G = (e) => (D.get(e.id) || []).every((e) => e.status === "succeeded" && !x(e)) && b(I, [e]).failed === 0, K = ie(W, (e) => oe(e) && (G(e) || fe.has(e.task_key))), q = se(E), J = !B.length && !z.length && !U.length && !W.length;
	return /* @__PURE__ */ (0, H.jsxs)(R, { children: [
		y ? /* @__PURE__ */ (0, H.jsx)(s, {
			tone: "error",
			children: y
		}) : null,
		n.available === !1 ? /* @__PURE__ */ (0, H.jsx)(s, {
			tone: "warning",
			children: n.message || N("数据库尚未准备好任务记录表")
		}) : null,
		/* @__PURE__ */ (0, H.jsx)(de, {}),
		J ? /* @__PURE__ */ (0, H.jsx)(i, {
			icon: le,
			title: N("还没有任务记录"),
			children: N("扫描、追更检查、批量操作和命令行批处理跑起来之后，这里会显示它们的进度与结果。")
		}) : /* @__PURE__ */ (0, H.jsxs)(H.Fragment, { children: [
			/* @__PURE__ */ (0, H.jsx)(Q, {
				title: N("正在进行"),
				children: B.length || z.length ? /* @__PURE__ */ (0, H.jsxs)($, {
					live: !0,
					children: [B.map((e) => /* @__PURE__ */ (0, H.jsx)(pe, {
						run: e,
						followups: D.get(e.id)
					}, e.id)), re(z).map(({ run: e, runs: t }) => /* @__PURE__ */ (0, H.jsx)(me, {
						runs: t,
						followups: L(t),
						counts: I
					}, e.id))]
				}) : /* @__PURE__ */ (0, H.jsx)(s, {
					tone: "neutral",
					children: N("没有任务在跑。")
				})
			}),
			U.length ? /* @__PURE__ */ (0, H.jsx)(Q, {
				title: N("本次未执行"),
				children: /* @__PURE__ */ (0, H.jsx)($, { children: U.map((e) => /* @__PURE__ */ (0, H.jsx)(Z, {
					run: e,
					latest: q.has(e.id),
					followups: D.get(e.id)
				}, e.id)) })
			}) : null,
			W.length || M ? /* @__PURE__ */ (0, H.jsxs)(Q, {
				title: N("最近完成"),
				children: [
					W.length ? /* @__PURE__ */ (0, H.jsx)($, { children: K.map(({ run: e, runs: t }) => {
						let n = b(I, t);
						return /* @__PURE__ */ (0, H.jsx)(Z, {
							run: e,
							runs: t,
							latest: q.has(e.id),
							followups: L(t),
							followupTotal: n.total,
							followupFailed: n.failed
						}, e.id);
					}) }) : null,
					_.error ? /* @__PURE__ */ (0, H.jsx)(s, {
						tone: "error",
						children: v(_.error)
					}) : null,
					M ? /* @__PURE__ */ (0, H.jsx)(e, {
						variant: "secondary",
						size: "small",
						leadingIcon: ee,
						className: "self-start",
						...m(_.isPending),
						onClick: P,
						children: N("加载更早")
					}) : null
				]
			}) : null
		] }),
		/* @__PURE__ */ (0, H.jsx)(r, {})
	] });
}
export { he as ActivityPage };

//# debugId=471e9e02-b7f4-44e2-a4a8-294857083d69