(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "f5749a66-6f17-4b8f-b8cd-e8353049b618", e._sentryDebugIdIdentifier = "sentry-dbid-f5749a66-6f17-4b8f-b8cd-e8353049b618");
	} catch {}
})();
import { $b4f18e3395fe64d7$export$3d96ec278d3efce4 as e, $b4f18e3395fe64d7$export$3e41faf802a29e71 as t, $b4f18e3395fe64d7$export$b2539bed5023c21c as n, $ea3928288112382f$export$439d29a4e110a164 as r, $fe21c36db05242bb$export$a98f0dcb43a68a25 as i, $fe21c36db05242bb$export$d7b12c4107be0d61 as a, Button as o, ButtonLink as s, Checkbox as c, CheckboxGlyph as l, Chip as u, CollapseChevron as d, CollapseRegion as f, DEFAULT_CATEGORY as p, ENTITY_REVIEW_KINDS as m, Ea as h, EmptyState as ee, ExternalLink as g, FIELDSET_FOOT as _, FilterGlassRows as v, Gg as y, InputBase as b, LinkButton as x, Note as te, REVIEW_CATEGORIES as S, REVIEW_DECISION_LABELS as ne, REVIEW_KEY as C, REVIEW_LABELS as w, REVIEW_QUEUES as T, REVIEW_QUEUE_LABELS as E, Select as D, SelectItem as O, SelectionActions as k, SelectionDock as A, TextField as j, Wt as M, __toESM as N, avatarInner as P, busyProps as F, canApprove as re, cardClass as I, commonReviewSources as L, currentReviewRow as ie, cx as R, decisionPayload as ae, decisionReceipt as oe, defaultChoice as se, errorMessage as ce, fetchReview as le, filterReviewRows as ue, groupReviewRows as de, isReviewCategory as fe, l7 as pe, m7 as me, mirrorText as he, paginationRange as z, pendingGenres as ge, recordGenre as _e, reloadReview as ve, require_jsx_runtime as ye, require_react as be, reviewGroupingOptions as xe, reviewQueueData as Se, reviewQueueOf as Ce, reviewWindow as we, rowEvidence as Te, rowFieldName as B, rowSubject as Ee, rowTags as De, rowTitle as Oe, selectReviewRange as ke, settleReviewRows as Ae, spinnerHtml as V, submitDecision as je, t as H, useMutation as Me, useOverlayScrollbar as U, useQuery as Ne, useViewGlide as Pe } from "./peach-app.js";
import { Page as Fe } from "./peach-app.page-QAncjzM1.js";
import { LEGACY_AVATAR_IMG as Ie } from "./peach-app.legacy-avatar-NSITxLRS.js";
import { PillAriaTabList as Le } from "./peach-app.pill-aria-tab-list-BMY1ZEv1.js";
// src/react/review/bulk-toolbar.tsx
var W = /* @__PURE__ */ N(be(), 1), G = ye();
function Re(e) {
	let { groupOptions: t, groupBy: n, onGroupBy: r, groups: i, filter: a, onFilter: s, pageKeys: c, selected: l, onSelected: u, selectedRows: d, metadata: f, approvable: p, busy: m, feedback: h, onUnifySource: ee, onRun: g, queueView: _ = "pending", queueCounts: y, onQueueChange: b, locked: x, fields: te, fieldFilter: S, onFieldFilter: ne } = e, C = c.filter((e) => l.has(e)), w = C.length > 0 && C.length === c.length, k = L(d), j = f && d.some((e) => (e.candidates?.length || 0) > 1), M = k.length ? H("统一选择来源") : H("所选项目无共同来源"), N = (0, W.useRef)(null), P = (0, W.useRef)(null), F = (0, W.useRef)(null), [re, I] = (0, W.useState)(!1), ie = Pe(N, P, "[data-entity-state][aria-pressed=\"true\"]", _);
	return (0, W.useLayoutEffect)(() => {
		let e = P.current, t = F.current, n = e?.parentElement, r = e?.closest("[data-review-filter]");
		if (!e || !t || !n || !r) return;
		let i = () => I(t.offsetHeight > 0 && Math.abs(n.getBoundingClientRect().top - t.getBoundingClientRect().top) < 1), a = new ResizeObserver(i);
		for (let n of [
			r,
			e,
			t
		]) a.observe(n);
		return i(), () => a.disconnect();
	}, []), /* @__PURE__ */ (0, G.jsxs)(G.Fragment, { children: [/* @__PURE__ */ (0, G.jsx)(v, {
		label: H("复核筛选"),
		topLabel: H("处理状态"),
		attrs: { "data-review-filter": "" },
		className: "mb-0 flex-row flex-wrap",
		topClassName: "max-w-full flex-none",
		bottomClassName: c.length ? "min-h-12 max-w-full flex-none flex-wrap" : "hidden",
		bottomRef: F,
		panes: /* @__PURE__ */ (0, G.jsx)("span", {
			ref: N,
			"data-view-glide": "",
			"aria-hidden": "true"
		}),
		top: /* @__PURE__ */ (0, G.jsxs)("div", {
			ref: P,
			role: "group",
			"aria-label": H("复核状态"),
			"data-entity-states": "",
			onPointerLeave: ie.leave,
			children: [T.map((e) => /* @__PURE__ */ (0, G.jsxs)("button", {
				type: "button",
				"data-entity-state": e,
				"data-entity-press": "",
				disabled: m,
				"aria-pressed": _ === e,
				onPointerEnter: ie.hover,
				onClick: () => {
					e !== _ && b(e);
				},
				children: [
					/* @__PURE__ */ (0, G.jsx)("span", {
						"data-copy-key": `review.queue.${e}`,
						children: E[e]
					}),
					" ",
					/* @__PURE__ */ (0, G.jsx)("span", {
						className: "ms-1.5 tabular-nums text-caption-1-medium text-text-secondary",
						children: y ? y[e].toLocaleString() : "…"
					})
				]
			}, e)), /* @__PURE__ */ (0, G.jsx)("span", {
				"data-entity-sep": "",
				"aria-hidden": "true",
				className: re ? void 0 : "invisible"
			})]
		}),
		bottom: c.length ? /* @__PURE__ */ (0, G.jsxs)(G.Fragment, { children: [
			f && te.length ? /* @__PURE__ */ (0, G.jsxs)(D, {
				"aria-label": H("筛选资料字段"),
				size: "sm",
				prefix: /* @__PURE__ */ (0, G.jsx)("span", {
					"data-copy-key": "review.filter.field",
					className: "pointer-events-auto",
					children: H("字段")
				}),
				selectedKey: S || "*",
				isDisabled: m,
				onSelectionChange: (e) => {
					e !== null && ne(String(e) === "*" ? "" : String(e));
				},
				children: [/* @__PURE__ */ (0, G.jsx)(O, {
					id: "*",
					children: H("全部")
				}), te.map((e) => /* @__PURE__ */ (0, G.jsx)(O, {
					id: e.key,
					children: `${e.title} · ${e.rows.length}`
				}, e.key))]
			}) : null,
			/* @__PURE__ */ (0, G.jsx)(D, {
				"aria-label": H("筛选分组方式"),
				size: "sm",
				selectedKey: n,
				onSelectionChange: (e) => {
					e !== null && r(String(e));
				},
				children: t.map(([e, t]) => /* @__PURE__ */ (0, G.jsx)(O, {
					id: e,
					children: t
				}, e))
			}),
			i.length > 1 ? /* @__PURE__ */ (0, G.jsxs)(D, {
				"aria-label": H(n === "field" ? "筛选字段分类" : "筛选当前分类"),
				size: "sm",
				prefix: H("分类"),
				selectedKey: a || "*",
				onSelectionChange: (e) => {
					e !== null && s(String(e) === "*" ? "" : String(e));
				},
				children: [/* @__PURE__ */ (0, G.jsx)(O, {
					id: "*",
					children: H("全部")
				}), i.map((e) => /* @__PURE__ */ (0, G.jsx)(O, {
					id: e.key,
					children: `${e.title} · ${e.rows.length}`
				}, e.key))]
			}) : null,
			x ? null : /* @__PURE__ */ (0, G.jsx)(o, {
				variant: "secondary",
				size: "small",
				leadingIcon: pe,
				"aria-pressed": w,
				disabled: m,
				onClick: () => {
					let e = new Set(l);
					for (let t of c) w ? e.delete(t) : e.add(t);
					u(e);
				},
				children: H(w ? "清空当前选择" : a ? "全选当前分类" : "全选本页")
			})
		] }) : null
	}), /* @__PURE__ */ (0, G.jsxs)(A, {
		label: H("复核所选项目"),
		visible: !x && l.size > 0,
		count: H("已选 {size} 项", { size: l.size }),
		children: [
			j && _ !== "ignored" ? /* @__PURE__ */ (0, G.jsxs)(D, {
				"aria-label": H("统一选择来源"),
				size: "sm",
				selectedKey: "",
				isDisabled: m || !k.length,
				onSelectionChange: (e) => {
					e !== null && e !== "" && ee(String(e));
				},
				children: [/* @__PURE__ */ (0, G.jsx)(O, {
					id: "",
					children: M
				}), k.map((e) => /* @__PURE__ */ (0, G.jsx)(O, {
					id: e,
					children: e
				}, e))]
			}) : null,
			_ === "ignored" ? null : /* @__PURE__ */ (0, G.jsx)(o, {
				variant: "ghost",
				size: "small",
				disabled: m || !l.size,
				onClick: () => g("rejected"),
				children: H("忽略所选")
			}),
			_ === "pending" ? /* @__PURE__ */ (0, G.jsx)(o, {
				variant: "secondary",
				size: "small",
				disabled: m || !l.size,
				onClick: () => g("skipped"),
				children: H("稍后处理所选")
			}) : /* @__PURE__ */ (0, G.jsx)(o, {
				variant: _ === "ignored" ? "primary" : "secondary",
				size: "small",
				disabled: m || !l.size,
				onClick: () => g("restore"),
				children: H("恢复所选")
			}),
			_ === "ignored" ? null : /* @__PURE__ */ (0, G.jsx)(o, {
				variant: "primary",
				size: "small",
				disabled: m || !l.size || !p,
				onClick: () => g("approved"),
				children: H("通过所选")
			}),
			/* @__PURE__ */ (0, G.jsx)(o, {
				variant: "ghost",
				size: "small",
				disabled: m,
				onClick: () => u(/* @__PURE__ */ new Set()),
				children: H("取消选择")
			}),
			h ? /* @__PURE__ */ (0, G.jsx)("p", {
				role: "status",
				className: "w-full text-body-2-regular text-text-secondary",
				children: h
			}) : null
		]
	})] });
}
// src/react/boardui/components/base/radio/radio.tsx
var ze = {
	sm: {
		dot: "size-3.5",
		inner: "size-[5px]",
		selected: "bg-gradient-to-b from-accent-500 to-accent-600 shadow-[inset_0px_0px_0px_0.875px_var(--color-accent-500),inset_0px_1.75px_0px_0px_rgba(255,255,255,0.25)]",
		border: "border-[0.875px]",
		gap: "gap-2",
		label: "text-body-2-medium"
	},
	md: {
		dot: "size-4",
		inner: "size-1.5",
		selected: "bg-gradient-to-b from-accent-500 to-accent-600 shadow-[inset_0px_0px_0px_1px_var(--color-accent-500),inset_0px_2px_0px_0px_rgba(255,255,255,0.25)]",
		border: "border",
		gap: "gap-2",
		label: "text-body-medium"
	}
};
function K({ selected: e = !1, size: t = "sm", focusVisible: n = !1, className: r }) {
	let i = ze[t];
	return /* @__PURE__ */ (0, G.jsxs)("span", {
		"aria-hidden": !0,
		className: R("relative flex shrink-0 items-center justify-center rounded-full", i.dot, n && "ring-2 ring-border-focus-ring ring-offset-2", r),
		children: [
			/* @__PURE__ */ (0, G.jsx)("span", { className: R("absolute inset-0 rounded-full border-border-checkbox-default bg-background-primary-default shadow-xs", "transition-opacity duration-200 ease", i.border, e && "opacity-0") }),
			/* @__PURE__ */ (0, G.jsx)("span", { className: R("absolute inset-0 rounded-full", "transition-opacity duration-200 ease", i.selected, !e && "opacity-0") }),
			/* @__PURE__ */ (0, G.jsx)("span", { className: R("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-control-indicator-background", "transition-[scale,opacity] duration-200 ease", i.inner, e ? "scale-100 opacity-100" : "scale-0 opacity-0") })
		]
	});
}
function Be({ className: e, children: t, ref: n, ...r }) {
	return /* @__PURE__ */ (0, G.jsx)(i, {
		ref: n,
		...r,
		className: (t) => R("flex flex-col gap-2", typeof e == "function" ? e(t) : e),
		children: t
	});
}
// src/react/boardui/components/base/radio/radio-card.tsx
function q({ className: e, title: t, description: n, ref: r, ...i }) {
	return /* @__PURE__ */ (0, G.jsx)(a, {
		ref: r,
		...i,
		className: (t) => R("group flex w-full items-center justify-between gap-3 rounded-2lg border border-border-button-default py-3 pe-5 ps-4 select-none", "transition-colors duration-150 ease", t.isHovered && !t.isDisabled ? "bg-background-primary-hover" : "bg-background-primary-default", t.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer", typeof e == "function" ? e(t) : e),
		children: (e) => /* @__PURE__ */ (0, G.jsxs)(G.Fragment, { children: [/* @__PURE__ */ (0, G.jsxs)("span", {
			className: "flex min-w-0 flex-col gap-0.5",
			children: [/* @__PURE__ */ (0, G.jsx)("span", {
				className: "truncate text-body-medium text-text-primary",
				children: t
			}), n != null && /* @__PURE__ */ (0, G.jsx)("span", {
				className: "truncate text-body-regular text-text-secondary",
				children: n
			})]
		}), /* @__PURE__ */ (0, G.jsx)("span", {
			className: "flex shrink-0 items-center py-1",
			children: /* @__PURE__ */ (0, G.jsx)(K, {
				size: "md",
				selected: e.isSelected,
				focusVisible: e.isFocusVisible
			})
		})] })
	});
}
// node_modules/diff/libesm/diff/base.js
var J = class {
	diff(e, t, n = {}) {
		let r;
		typeof n == "function" ? (r = n, n = {}) : "callback" in n && (r = n.callback);
		let i = this.castInput(e, n), a = this.castInput(t, n), o = this.removeEmpty(this.tokenize(i, n)), s = this.removeEmpty(this.tokenize(a, n));
		return this.diffWithOptionsObj(o, s, n, r);
	}
	diffWithOptionsObj(e, t, n, r) {
		let i = (e) => {
			if (e = this.postProcess(e, n), r) setTimeout(function() {
				r(e);
			}, 0);
			else return e;
		}, a = t.length, o = e.length, s = 1, c = a + o;
		n.maxEditLength != null && (c = Math.min(c, n.maxEditLength));
		let l = n.timeout ?? Infinity, u = Date.now() + l, d = [{
			oldPos: -1,
			lastComponent: void 0
		}], f = this.extractCommon(d[0], t, e, 0, n);
		if (d[0].oldPos + 1 >= o && f + 1 >= a) return i(this.buildValues(d[0].lastComponent, t, e));
		let p = -Infinity, m = Infinity, h = () => {
			for (let r = Math.max(p, -s); r <= Math.min(m, s); r += 2) {
				let s, c = d[r - 1], l = d[r + 1];
				c && (d[r - 1] = void 0);
				let u = !1;
				if (l) {
					let e = l.oldPos - r;
					u = l && 0 <= e && e < a;
				}
				let h = c && c.oldPos + 1 < o;
				if (!u && !h) d[r] = void 0;
				else {
					if (s = !h || u && c.oldPos < l.oldPos ? this.addToPath(l, !0, !1, 0, n) : this.addToPath(c, !1, !0, 1, n), f = this.extractCommon(s, t, e, r, n), s.oldPos + 1 >= o && f + 1 >= a) return i(this.buildValues(s.lastComponent, t, e)) || !0;
					d[r] = s, s.oldPos + 1 >= o && (m = Math.min(m, r - 1)), f + 1 >= a && (p = Math.max(p, r + 1));
				}
			}
			s++;
		};
		if (r) (function e() {
			setTimeout(function() {
				if (s > c || Date.now() > u) return r(void 0);
				h() || e();
			}, 0);
		})();
		else for (; s <= c && Date.now() <= u;) {
			let e = h();
			if (e) return e;
		}
	}
	addToPath(e, t, n, r, i) {
		let a = e.lastComponent;
		return a && !i.oneChangePerToken && a.added === t && a.removed === n ? {
			oldPos: e.oldPos + r,
			lastComponent: {
				count: a.count + 1,
				added: t,
				removed: n,
				previousComponent: a.previousComponent
			}
		} : {
			oldPos: e.oldPos + r,
			lastComponent: {
				count: 1,
				added: t,
				removed: n,
				previousComponent: a
			}
		};
	}
	extractCommon(e, t, n, r, i) {
		let a = t.length, o = n.length, s = e.oldPos, c = s - r, l = 0;
		for (; c + 1 < a && s + 1 < o && this.equals(n[s + 1], t[c + 1], i);) c++, s++, l++, i.oneChangePerToken && (e.lastComponent = {
			count: 1,
			previousComponent: e.lastComponent,
			added: !1,
			removed: !1
		});
		return l && !i.oneChangePerToken && (e.lastComponent = {
			count: l,
			previousComponent: e.lastComponent,
			added: !1,
			removed: !1
		}), e.oldPos = s, c;
	}
	equals(e, t, n) {
		return n.comparator ? n.comparator(e, t) : e === t || !!n.ignoreCase && e.toLowerCase() === t.toLowerCase();
	}
	removeEmpty(e) {
		let t = [];
		for (let n = 0; n < e.length; n++) e[n] && t.push(e[n]);
		return t;
	}
	castInput(e, t) {
		return e;
	}
	tokenize(e, t) {
		return Array.from(e);
	}
	join(e) {
		return e.join("");
	}
	postProcess(e, t) {
		return e;
	}
	get useLongestToken() {
		return !1;
	}
	buildValues(e, t, n) {
		let r = [], i;
		for (; e;) r.push(e), i = e.previousComponent, delete e.previousComponent, e = i;
		r.reverse();
		let a = r.length, o = 0, s = 0, c = 0;
		for (; o < a; o++) {
			let e = r[o];
			if (e.removed) e.value = this.join(n.slice(c, c + e.count)), c += e.count;
			else {
				if (!e.added && this.useLongestToken) {
					let r = t.slice(s, s + e.count);
					r = r.map(function(e, t) {
						let r = n[c + t];
						return r.length > e.length ? r : e;
					}), e.value = this.join(r);
				} else e.value = this.join(t.slice(s, s + e.count));
				s += e.count, e.added || (c += e.count);
			}
		}
		return r;
	}
}, Ve = new class extends J {}();
function He(e, t, n) {
	return Ve.diff(e, t, n);
}
// node_modules/diff/libesm/util/string.js
function Ue(e, t) {
	let n = 0;
	for (; n < e.length && n < t.length; n++) if (e[n] != t[n]) return e.slice(0, n);
	return e.slice(0, n);
}
function We(e, t) {
	let n;
	if (!e || !t || e[e.length - 1] != t[t.length - 1]) return "";
	for (n = 0; n < e.length && n < t.length; n++) if (e[e.length - (n + 1)] != t[t.length - (n + 1)]) return e.slice(-n);
	return e.slice(-n);
}
function Ge(e, t, n) {
	if (e.slice(0, t.length) != t) throw Error(`string ${JSON.stringify(e)} doesn't start with prefix ${JSON.stringify(t)}; this is a bug`);
	return n + e.slice(t.length);
}
function Y(e, t, n) {
	if (!t) return e + n;
	if (e.slice(-t.length) != t) throw Error(`string ${JSON.stringify(e)} doesn't end with suffix ${JSON.stringify(t)}; this is a bug`);
	return e.slice(0, -t.length) + n;
}
function X(e, t) {
	return Ge(e, t, "");
}
function Z(e, t) {
	return Y(e, t, "");
}
function Ke(e, t) {
	return t.slice(0, qe(e, t));
}
function qe(e, t) {
	let n = 0;
	e.length > t.length && (n = e.length - t.length);
	let r = t.length;
	e.length < t.length && (r = e.length);
	let i = Array(r), a = 0;
	i[0] = 0;
	for (let e = 1; e < r; e++) {
		for (t[e] == t[a] ? i[e] = i[a] : i[e] = a; a > 0 && t[e] != t[a];) a = i[a];
		t[e] == t[a] && a++;
	}
	a = 0;
	for (let r = n; r < e.length; r++) {
		for (; a > 0 && e[r] != t[a];) a = i[a];
		e[r] == t[a] && a++;
	}
	return a;
}
function Je(e, t) {
	let n = [];
	for (let r of Array.from(t.segment(e))) {
		let e = r.segment;
		n.length && /\s/.test(n[n.length - 1]) && /\s/.test(e) ? n[n.length - 1] += e : n.push(e);
	}
	return n;
}
function Ye(e, t) {
	if (t) return $(e, t)[1];
	let n;
	for (n = e.length - 1; n >= 0 && e[n].match(/\s/); n--);
	return e.substring(n + 1);
}
function Q(e, t) {
	if (t) return $(e, t)[0];
	let n = e.match(/^\s*/);
	return n ? n[0] : "";
}
function $(e, t) {
	if (!t) return [Q(e), Ye(e)];
	if (t.resolvedOptions().granularity != "word") throw Error("The segmenter passed must have a granularity of \"word\"");
	let n = Je(e, t), r = n[0], i = n[n.length - 1];
	return [/\s/.test(r) ? r : "", /\s/.test(i) ? i : ""];
}
// node_modules/diff/libesm/diff/word.js
var Xe = "a-zA-Z0-9_\\u{AD}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}", Ze = RegExp(`[${Xe}]+|\\s+|[^${Xe}]`, "ug");
new class extends J {
	equals(e, t, n) {
		return n.ignoreCase && (e = e.toLowerCase(), t = t.toLowerCase()), e.trim() === t.trim();
	}
	tokenize(e, t = {}) {
		let n;
		if (t.intlSegmenter) {
			let r = t.intlSegmenter;
			if (r.resolvedOptions().granularity != "word") throw Error("The segmenter passed must have a granularity of \"word\"");
			n = Je(e, r);
		} else n = e.match(Ze) || [];
		let r = [], i = null;
		return n.forEach((e) => {
			/\s/.test(e) ? i == null ? r.push(e) : r.push(r.pop() + e) : i != null && /\s/.test(i) ? r[r.length - 1] == i ? r.push(r.pop() + e) : r.push(i + e) : r.push(e), i = e;
		}), r;
	}
	join(e) {
		return e.map((e, t) => t == 0 ? e : e.replace(/^\s+/, "")).join("");
	}
	postProcess(e, t) {
		if (!e || t.oneChangePerToken) return e;
		let n = null, r = null, i = null;
		return e.forEach((e) => {
			e.added ? r = e : e.removed ? i = e : ((r || i) && Qe(n, i, r, e, t.intlSegmenter), n = e, r = null, i = null);
		}), (r || i) && Qe(n, i, r, null, t.intlSegmenter), e;
	}
}();
function Qe(e, t, n, r, i) {
	if (t && n) {
		let [a, o] = $(t.value, i), [s, c] = $(n.value, i);
		if (e) {
			let r = Ue(a, s);
			e.value = Y(e.value, s, r), t.value = X(t.value, r), n.value = X(n.value, r);
		}
		if (r) {
			let e = We(o, c);
			r.value = Ge(r.value, c, e), t.value = Z(t.value, e), n.value = Z(n.value, e);
		}
	} else if (n) {
		if (e) {
			let e = Q(n.value, i);
			n.value = n.value.substring(e.length);
		}
		if (r) {
			let e = Q(r.value, i);
			r.value = r.value.substring(e.length);
		}
	} else if (e && r) {
		let n = Q(r.value, i), [a, o] = $(t.value, i), s = Ue(n, a);
		t.value = X(t.value, s);
		let c = We(X(n, s), o);
		t.value = Z(t.value, c), r.value = Ge(r.value, n, c), e.value = Y(e.value, n, n.slice(0, n.length - c.length));
	} else if (r) {
		let e = Q(r.value, i), n = Ke(Ye(t.value, i), e);
		t.value = Z(t.value, n);
	} else if (e) {
		let n = Ke(Ye(e.value, i), Q(t.value, i));
		t.value = X(t.value, n);
	}
}
new class extends J {
	tokenize(e) {
		let t = RegExp(`(\\r?\\n)|[${Xe}]+|[^\\S\\n\\r]+|[^${Xe}]`, "ug");
		return e.match(t) || [];
	}
}(), new class extends J {
	constructor() {
		super(...arguments), this.tokenize = $e;
	}
	equals(e, t, n) {
		return n.ignoreWhitespace ? (n.newlineIsToken && e.includes("\n") || (e = e.trim()), n.newlineIsToken && t.includes("\n") || (t = t.trim())) : n.ignoreNewlineAtEof && !n.newlineIsToken && (e.endsWith("\n") && (e = e.slice(0, -1)), t.endsWith("\n") && (t = t.slice(0, -1))), super.equals(e, t, n);
	}
}();
function $e(e, t) {
	t.stripTrailingCr && (e = e.replace(/\r\n/g, "\n"));
	let n = [], r = e.split(/(\n|\r\n)/);
	r[r.length - 1] || r.pop();
	for (let e = 0; e < r.length; e++) {
		let i = r[e];
		e % 2 && !t.newlineIsToken ? n[n.length - 1] += i : n.push(i);
	}
	return n;
}
// node_modules/diff/libesm/diff/sentence.js
function et(e) {
	return e == "." || e == "!" || e == "?";
}
new class extends J {
	tokenize(e) {
		let t = [], n = 0;
		for (let r = 0; r < e.length; r++) {
			if (r == e.length - 1) {
				t.push(e.slice(n));
				break;
			}
			if (et(e[r]) && e[r + 1].match(/\s/)) {
				for (t.push(e.slice(n, r + 1)), r = n = r + 1; e[r + 1]?.match(/\s/);) r++;
				t.push(e.slice(n, r + 1)), n = r + 1;
			}
		}
		return t;
	}
}(), new class extends J {
	tokenize(e) {
		return e.split(/([{}:;,]|\s+)/);
	}
}(), new class extends J {
	constructor() {
		super(...arguments), this.tokenize = $e;
	}
	get useLongestToken() {
		return !0;
	}
	castInput(e, t) {
		let { undefinedReplacement: n, stringifyReplacer: r = (e, t) => t === void 0 ? n : t } = t;
		return typeof e == "string" ? e : JSON.stringify(tt(e, null, null, r), null, "  ");
	}
	equals(e, t, n) {
		return super.equals(e.replace(/,([\r\n])/g, "$1"), t.replace(/,([\r\n])/g, "$1"), n);
	}
}();
function tt(e, t, n, r, i) {
	t ||= [], n ||= [], r && (e = r(i === void 0 ? "" : i, e));
	let a = 0;
	for (; a < t.length; a += 1) if (t[a] === e) return n[a];
	let o;
	if (Object.prototype.toString.call(e) === "[object Array]") {
		for (t.push(e), o = Array(e.length), n.push(o), a = 0; a < e.length; a += 1) o[a] = tt(e[a], t, n, r, String(a));
		return t.pop(), n.pop(), o;
	}
	if (e && e.toJSON && (e = e.toJSON()), typeof e == "object" && e) {
		t.push(e), o = {}, n.push(o);
		let i = [], s;
		for (s in e)
 /* istanbul ignore else */
		Object.prototype.hasOwnProperty.call(e, s) && i.push(s);
		for (i.sort(), a = 0; a < i.length; a += 1) s = i[a], o[s] = tt(e[s], t, n, r, s);
		t.pop(), n.pop();
	} else o = e;
	return o;
}
new class extends J {
	tokenize(e) {
		return e.slice();
	}
	join(e) {
		return e;
	}
	removeEmpty(e) {
		return e;
	}
}();
// src/react/review/comparison-text.tsx
function nt({ value: e, reference: t }) {
	let n = (0, W.useMemo)(() => t ? He(t, e).filter((e) => !e.removed) : [{
		value: e,
		added: !1
	}], [e, t]);
	return /* @__PURE__ */ (0, G.jsx)(G.Fragment, { children: n.map((e, t) => e.added ? /* @__PURE__ */ (0, G.jsx)("mark", {
		"data-review-difference": "",
		className: "rounded-sm bg-status-yellow-background text-status-yellow-text",
		children: e.value
	}, t) : /* @__PURE__ */ (0, G.jsx)("span", { children: e.value }, t)) });
}
// src/react/review/candidate-form.tsx
var rt = {
	title: H("标题"),
	original_title: H("原标题"),
	runtime: H("来源时长"),
	director: H("导演"),
	label: "Label",
	poster_url: H("海报"),
	cover_url: H("封面"),
	screenshot_urls: H("截图"),
	trailer_url: H("预告片")
}, it = "reviewgenretags";
function at({ tags: e }) {
	return e.length ? /* @__PURE__ */ (0, G.jsx)("datalist", {
		id: it,
		children: e.map((e) => /* @__PURE__ */ (0, G.jsx)("option", { value: e }, e))
	}) : null;
}
function ot({ candidate: e, row: t }) {
	let [n, r] = (0, W.useState)(!1), i = (0, W.useId)(), a = Object.entries(e.catalog_evidence || {}).filter(([, e]) => e && e.display_value);
	return a.length ? /* @__PURE__ */ (0, G.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, G.jsxs)(o, {
			variant: "secondary",
			size: "small",
			leadingIcon: d,
			"aria-expanded": n,
			"aria-controls": i,
			"aria-label": H("{value} {value2} 的来源依据", {
				value: H(n ? "收起" : "展开"),
				value2: e.source || H("该来源")
			}),
			onClick: () => r(!n),
			children: [/* @__PURE__ */ (0, G.jsx)("span", {
				"data-copy-key": "review.card.source_evidence",
				children: H("来源依据")
			}), ` · ${a.length}`]
		}), /* @__PURE__ */ (0, G.jsx)(f, {
			id: i,
			open: n,
			children: /* @__PURE__ */ (0, G.jsx)("dl", {
				className: "flex min-w-0 flex-col gap-2 px-3 pt-2 pb-1",
				children: a.map(([n, r]) => /* @__PURE__ */ (0, G.jsxs)("div", {
					className: "flex min-w-0 flex-wrap gap-x-2",
					children: [
						/* @__PURE__ */ (0, G.jsx)("dt", {
							className: "text-caption-1-regular text-text-tertiary",
							children: rt[n] || n
						}),
						/* @__PURE__ */ (0, G.jsx)("dd", {
							className: "min-w-0 text-body-2-regular break-words text-text-primary",
							children: /* @__PURE__ */ (0, G.jsx)(nt, {
								value: r.display_value || "",
								reference: n === t.field && t.current_value ? t.current_value : t.candidates?.find((t) => t.candidate_key !== e.candidate_key && t.catalog_evidence?.[n]?.display_value)?.catalog_evidence?.[n]?.display_value
							})
						}),
						(r.warnings || []).map((e) => /* @__PURE__ */ (0, G.jsx)("small", {
							className: "w-full text-caption-1-regular text-status-yellow-text",
							children: e
						}, e))
					]
				}, n))
			})
		})]
	}) : null;
}
function st(e) {
	let t = e.content_id || e.provider_id;
	return `${e.source || H("未标注来源")}${e.official ? H(" · 官方优先") : ""}${t ? ` · ID ${t}` : ""}`;
}
function ct({ candidate: e, reference: t }) {
	return /* @__PURE__ */ (0, G.jsxs)("span", {
		className: "flex min-w-0 flex-col gap-2 whitespace-normal wrap-anywhere",
		children: [/* @__PURE__ */ (0, G.jsx)("span", {
			className: "text-body-regular text-text-primary",
			children: /* @__PURE__ */ (0, G.jsx)(nt, {
				value: e.display_value || "",
				reference: t
			})
		}), (e.warnings || []).map((e) => /* @__PURE__ */ (0, G.jsx)("span", {
			className: "text-body-2-regular text-status-yellow-text",
			children: e
		}, e))]
	});
}
function lt({ row: e, fieldName: t, value: n, onChange: r, locked: i }) {
	let a = e.candidates || [];
	return a.length ? a.length === 1 ? /* @__PURE__ */ (0, G.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-2",
		children: [/* @__PURE__ */ (0, G.jsxs)("div", {
			className: "flex min-w-0 flex-col gap-2 rounded-2lg bg-background-primary-default px-4 py-3",
			children: [/* @__PURE__ */ (0, G.jsx)("p", {
				className: "text-body-medium text-text-primary",
				children: st(a[0])
			}), /* @__PURE__ */ (0, G.jsx)(ct, {
				candidate: a[0],
				reference: e.current_value || void 0
			})]
		}), /* @__PURE__ */ (0, G.jsx)(ot, {
			candidate: a[0],
			row: e
		})]
	}) : /* @__PURE__ */ (0, G.jsx)(Be, {
		"aria-label": H("{value}的来源", { value: t || H("资料") }),
		value: n,
		isDisabled: i,
		onChange: r,
		children: /* @__PURE__ */ (0, G.jsx)("div", {
			className: "flex min-w-0 flex-col gap-3",
			children: a.map((t) => /* @__PURE__ */ (0, G.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-1",
				children: [/* @__PURE__ */ (0, G.jsx)(q, {
					value: t.candidate_key,
					className: "relative items-start",
					title: /* @__PURE__ */ (0, G.jsx)("span", {
						title: st(t),
						children: st(t)
					}),
					description: /* @__PURE__ */ (0, G.jsx)(ct, {
						candidate: t,
						reference: e.current_value || a.find((e) => e.candidate_key !== t.candidate_key)?.display_value
					})
				}), /* @__PURE__ */ (0, G.jsx)(ot, {
					candidate: t,
					row: e
				})]
			}, t.candidate_key))
		})
	}) : null;
}
function ut({ genre: e, tags: t, locked: n, toast: r }) {
	let [i, a] = (0, W.useState)(""), [s, c] = (0, W.useState)(""), l = Me({
		mutationFn: (t) => _e(e, t),
		onSuccess: async (t, n) => {
			t.ok ? (r(n ? H("已把「{genre}」收录为标签「{tag}」", {
				genre: e,
				tag: n
			}) : H("已把「{genre}」判为非内容标签", { genre: e })), await ve()) : c(t.error || H("服务端拒绝了这次收录"));
		},
		onError: (e) => c(ce(e))
	}), u = () => {
		let e = i.trim();
		e ? (c(""), l.mutate(e)) : c(H("先给它一个中文标签"));
	};
	return /* @__PURE__ */ (0, G.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, G.jsx)("b", {
				lang: "ja",
				className: "text-body-medium text-text-primary",
				children: e
			}),
			/* @__PURE__ */ (0, G.jsx)(j, {
				"aria-label": H("「{genre}」收录成的中文标签", { genre: e }),
				value: i,
				onChange: a,
				maxLength: 40,
				isDisabled: n || l.isPending,
				className: "min-w-40 flex-1",
				children: /* @__PURE__ */ (0, G.jsx)(b, {
					size: "small",
					list: t.length ? it : void 0,
					autoComplete: "off",
					placeholder: H("中文标签"),
					onKeyDown: (e) => {
						e.key !== "Enter" || e.nativeEvent.isComposing || (e.preventDefault(), u());
					}
				})
			}),
			/* @__PURE__ */ (0, G.jsx)(o, {
				variant: "secondary",
				size: "small",
				disabled: n || l.isPending,
				onClick: u,
				children: H("收录")
			}),
			/* @__PURE__ */ (0, G.jsx)(o, {
				variant: "secondary",
				size: "small",
				disabled: n || l.isPending,
				onClick: () => {
					c(""), l.mutate("");
				},
				children: H("不是内容")
			}),
			s ? /* @__PURE__ */ (0, G.jsx)("p", {
				role: "status",
				className: "w-full text-body-2-regular text-text-error-primary",
				children: s
			}) : null
		]
	});
}
function dt({ row: e, tags: t, locked: n, toast: r }) {
	let i = ge(e);
	return i.length ? /* @__PURE__ */ (0, G.jsxs)("div", {
		role: "group",
		"aria-label": H("未收录 genre"),
		className: "flex flex-col gap-2 border-t border-separator-border pt-4",
		children: [/* @__PURE__ */ (0, G.jsx)("h5", {
			className: "text-body-2-medium text-text-secondary",
			children: H("未收录 genre · {length}", { length: i.length })
		}), /* @__PURE__ */ (0, G.jsx)("div", {
			role: "list",
			className: "flex flex-col",
			children: i.map((e, i) => /* @__PURE__ */ (0, G.jsx)("div", {
				role: "listitem",
				className: `py-3 first:pt-0 last:pb-0 ${i ? "border-t border-separator-border" : ""}`,
				children: /* @__PURE__ */ (0, G.jsx)(ut, {
					genre: e,
					tags: t,
					locked: n,
					toast: r
				})
			}, e))
		})]
	}) : null;
}
// src/react/review/review-evidence.tsx
var ft = (e = "") => /^https?:\/\//i.test(e) ? e : "", pt = (e = "") => ft(e) || (e.startsWith("/") && !e.startsWith("//") ? e : "");
function mt({ url: e }) {
	let t = pt(e || "");
	return /* @__PURE__ */ (0, G.jsx)(ht, { source: t }, t);
}
function ht({ source: e }) {
	let [t, n] = (0, W.useState)("idle");
	return (0, W.useEffect)(() => {
		if (t !== "loading") return;
		let e = setTimeout(() => n("failed"), 3e4);
		return () => clearTimeout(e);
	}, [t]), /* @__PURE__ */ (0, G.jsxs)("div", {
		className: "relative flex h-review-image items-center justify-center overflow-hidden rounded-surface bg-background-secondary-default",
		children: [t === "loading" ? /* @__PURE__ */ (0, G.jsxs)("span", {
			role: "status",
			className: "absolute flex items-center gap-2 text-body-2-regular text-text-secondary",
			children: [/* @__PURE__ */ (0, G.jsx)("span", { dangerouslySetInnerHTML: { __html: V(H("正在加载图片")) } }), H("正在加载图片")]
		}) : null, e && (t === "loading" || t === "ready") ? /* @__PURE__ */ (0, G.jsx)("img", {
			src: e,
			alt: H("来源提供的备选图片"),
			referrerPolicy: "no-referrer",
			decoding: "async",
			className: `size-full object-contain ${t === "loading" ? "invisible" : ""}`,
			onLoad: () => n("ready"),
			onError: () => n("failed")
		}) : e ? /* @__PURE__ */ (0, G.jsxs)("div", {
			className: "flex flex-col items-center gap-2",
			children: [t === "failed" ? /* @__PURE__ */ (0, G.jsx)("span", {
				className: "text-body-2-regular text-text-secondary",
				children: H("未取得来源图片")
			}) : null, /* @__PURE__ */ (0, G.jsx)(o, {
				variant: "secondary",
				size: "small",
				"aria-label": t === "failed" ? H("立即重试加载来源图片") : void 0,
				onClick: () => n("loading"),
				children: H(t === "failed" ? "立即重试" : "查看来源图片")
			})]
		}) : /* @__PURE__ */ (0, G.jsx)("span", {
			className: "text-body-2-regular text-text-secondary",
			children: H("未取得来源图片")
		})]
	});
}
function gt({ asset: e, openItem: t }) {
	let n = e.name || "";
	return /* @__PURE__ */ (0, G.jsxs)("div", {
		className: "flex min-w-0 items-center gap-3",
		children: [/* @__PURE__ */ (0, G.jsxs)("button", {
			type: "button",
			onClick: () => t(e.id),
			className: "flex aspect-card-cover w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2lg bg-background-tertiary-default outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
			children: [e.preview_url ? /* @__PURE__ */ (0, G.jsx)("img", {
				src: e.preview_url,
				alt: "",
				loading: "lazy",
				className: "size-full object-cover"
			}) : /* @__PURE__ */ (0, G.jsx)("span", {
				className: "text-caption-1-regular text-text-secondary",
				children: H("无封面")
			}), /* @__PURE__ */ (0, G.jsx)(r, { children: H("打开原视频 {name}", { name: n }) })]
		}), /* @__PURE__ */ (0, G.jsxs)("div", {
			className: "flex min-w-0 flex-col items-start gap-1",
			children: [/* @__PURE__ */ (0, G.jsx)("b", {
				title: n,
				className: "w-full truncate text-body-medium text-text-primary",
				children: e.code || n || H("原视频")
			}), /* @__PURE__ */ (0, G.jsx)(o, {
				variant: "secondary",
				size: "small",
				leadingIcon: y,
				onClick: () => t(e.id),
				children: H("打开原视频")
			})]
		})]
	});
}
function _t({ kind: e, name: t, works: n, avatar: r, openEntity: i }) {
	return /* @__PURE__ */ (0, G.jsxs)("div", {
		className: "flex min-w-0 items-center gap-3",
		children: [/* @__PURE__ */ (0, G.jsx)("button", {
			type: "button",
			"aria-label": H("打开创作者页：{name}", { name: t }),
			onClick: () => i(e, t),
			className: `relative inline-grid size-11 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-background-secondary-default text-caption-1-medium text-text-secondary outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring ${Ie}`,
			dangerouslySetInnerHTML: { __html: r }
		}), /* @__PURE__ */ (0, G.jsxs)("div", {
			className: "flex min-w-0 flex-col items-start",
			children: [/* @__PURE__ */ (0, G.jsx)("button", {
				type: "button",
				onClick: () => i(e, t),
				className: "max-w-full cursor-pointer truncate text-body-medium text-text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-border-focus-ring",
				children: t
			}), n ? /* @__PURE__ */ (0, G.jsx)("small", {
				className: "tabular-nums text-body-2-regular text-text-secondary",
				children: H("{value} 部作品", { value: n.toLocaleString() })
			}) : null]
		})]
	});
}
function vt({ row: e, openItem: t, openEntity: n, onReveal: r, revealing: i, note: a }) {
	let c = ft(e.profile_url || ""), l = (e.preview_assets || []).slice(0, 6), u = Math.max(0, Number(e.video_count || e.videos || 0));
	return /* @__PURE__ */ (0, G.jsxs)("section", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, G.jsx)("h5", {
				className: "text-body-medium text-text-primary",
				children: H("待确认人物：{value}", { value: e.babepedia_name || H("未标注") })
			}),
			/* @__PURE__ */ (0, G.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [c ? /* @__PURE__ */ (0, G.jsx)(s, {
					variant: "secondary",
					size: "small",
					trailingIcon: M,
					href: c,
					target: "_blank",
					rel: "noopener noreferrer",
					children: H("来源资料")
				}) : null, /* @__PURE__ */ (0, G.jsx)(o, {
					variant: "secondary",
					size: "small",
					onClick: () => n("creator", e.creator || ""),
					children: H("查看全部 {value} 部作品", { value: u.toLocaleString() })
				})]
			}),
			/* @__PURE__ */ (0, G.jsx)(mt, { url: e.preview_url }),
			/* @__PURE__ */ (0, G.jsx)("p", {
				className: "text-body-2-regular text-text-secondary",
				children: H("通过后记录身份判断。")
			}),
			l.length ? /* @__PURE__ */ (0, G.jsxs)(G.Fragment, { children: [/* @__PURE__ */ (0, G.jsx)("h5", {
				className: "text-body-medium text-text-primary",
				children: H("本地作品样本")
			}), /* @__PURE__ */ (0, G.jsx)("ul", {
				className: "flex flex-col gap-1",
				children: l.map((e) => /* @__PURE__ */ (0, G.jsxs)("li", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, G.jsx)(o, {
						variant: "ghost",
						size: "small",
						className: "min-w-0",
						onClick: () => t(e.id),
						children: /* @__PURE__ */ (0, G.jsx)("span", {
							title: e.name,
							className: "block max-w-full truncate",
							children: e.name
						})
					}), /* @__PURE__ */ (0, G.jsx)(o, {
						variant: "ghost",
						size: "small",
						"aria-label": H("打开 {name} 的文件位置", { name: e.name ?? "" }),
						...F(i === e.id),
						onClick: () => r(e.id),
						children: H("文件位置")
					})]
				}, e.id))
			})] }) : /* @__PURE__ */ (0, G.jsx)("p", {
				className: "text-body-2-regular text-text-secondary",
				children: H("暂无本地作品样本，打开全部作品核对。")
			}),
			a ? /* @__PURE__ */ (0, G.jsx)("p", {
				role: "status",
				className: "text-body-2-regular text-text-error-primary",
				children: a
			}) : null
		]
	});
}
function yt({ assets: e, picked: t, onPicked: n, locked: i }) {
	let [a, o] = (0, W.useState)(null), s = new Set(t), c = (t, r) => {
		if (i) return;
		let c = new Set(s);
		if (r && a !== null) {
			let [n, r] = [Math.min(a, t), Math.max(a, t)];
			for (let t = n; t <= r; t++) c.add(e[t].id);
		} else {
			let n = e[t].id;
			c.has(n) ? c.delete(n) : c.add(n);
		}
		o(t), n(e.filter((e) => c.has(e.id)).map((e) => e.id));
	};
	return /* @__PURE__ */ (0, G.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, G.jsx)(k, {
			prefix: /* @__PURE__ */ (0, G.jsx)("span", {
				className: "tabular-nums text-body-2-regular text-text-secondary",
				children: H("已选 {size} / {length}", {
					size: s.size,
					length: e.length
				})
			}),
			actions: [{
				label: H("全选"),
				disabled: i,
				onPress: () => n(e.map((e) => e.id))
			}, {
				label: H("清空"),
				disabled: i,
				onPress: () => n([])
			}]
		}), /* @__PURE__ */ (0, G.jsx)("div", {
			className: "review-asset-grid gap-1.5",
			children: e.map((e, t) => {
				let n = s.has(e.id);
				return /* @__PURE__ */ (0, G.jsxs)("button", {
					type: "button",
					"aria-pressed": n,
					title: e.name,
					onClick: (e) => c(t, e.shiftKey),
					className: `relative aspect-card-cover cursor-pointer overflow-hidden rounded-surface bg-background-tertiary-default outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-border-focus-ring ${n ? "opacity-100 ring-2 ring-border-button-active ring-inset" : "opacity-50"}`,
					children: [
						/* @__PURE__ */ (0, G.jsx)("img", {
							src: `/poster?id=${e.id}&c=4`,
							alt: "",
							loading: "lazy",
							className: "size-full object-cover"
						}),
						/* @__PURE__ */ (0, G.jsx)("span", {
							className: "absolute top-1 right-1",
							children: /* @__PURE__ */ (0, G.jsx)(l, {
								size: "sm",
								state: {
									isSelected: n,
									isIndeterminate: !1,
									isFocusVisible: !1,
									isDisabled: i,
									isHovered: !1
								}
							})
						}),
						/* @__PURE__ */ (0, G.jsx)(r, { children: `${H(n ? "已选" : "未选")} ${e.name || e.id}` })
					]
				}, e.id);
			})
		})]
	});
}
// src/react/review/review-card.tsx
var bt = I({
	variant: "filled",
	padding: "none",
	bordered: "soft",
	className: "flex flex-col overflow-hidden"
}), xt = "flex min-h-6 min-w-0 items-center", St = 2, Ct = (e) => e === "western_identity" ? "h-review-card-tall" : "h-review-card";
function wt(e) {
	let { category: t, row: n, choice: r, onChoice: i, selected: a, onSelect: s, locked: l, busy: d, problem: f, genreTags: p, onDecide: g, handlers: v, queueView: y = "pending" } = e, b = (0, W.useRef)(!1), te = U(), S = t === "metadata_fields", C = m[t] || "", w = String(n.creator || "").trim(), T = !!C && !!w, E = Oe(t, n), D = B(t, n), O = Ee(t, n), k = Te(n), A = De(n), j = re(t, n), M = n.comparison_assets || [], N = n.preview_assets || [], I = ne[n.decision || ""], L = M.length > 1 ? /* @__PURE__ */ (0, G.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [M.slice(0, St).map((e) => /* @__PURE__ */ (0, G.jsx)(gt, {
			asset: e,
			openItem: v.openItem
		}, e.id)), M.length > St ? /* @__PURE__ */ (0, G.jsx)("p", {
			className: "text-body-2-regular text-text-secondary",
			children: H("另有 {value} 部对照作品", { value: (M.length - St).toLocaleString() })
		}) : null]
	}) : T ? /* @__PURE__ */ (0, G.jsx)(_t, {
		kind: C,
		name: w,
		works: Number(n.video_count || n.videos || 0),
		openEntity: v.openEntity,
		avatar: P(w, n.entity_id ? {
			id: n.entity_id,
			has_image: !!n.has_image,
			image_version: n.image_version,
			avatar_focus: n.avatar_focus
		} : null, null, C)
	}) : n.asset_id ? /* @__PURE__ */ (0, G.jsx)(gt, {
		openItem: v.openItem,
		asset: {
			id: n.asset_id,
			name: n.asset_name,
			code: n.code,
			preview_url: n.asset_preview_url
		}
	}) : null, ie = S ? /* @__PURE__ */ (0, G.jsx)(lt, {
		row: n,
		fieldName: D,
		value: r.candidateKey,
		onChange: (e) => i({
			...r,
			candidateKey: e
		}),
		locked: l
	}) : t === "creator_tags" ? N.length ? /* @__PURE__ */ (0, G.jsx)(yt, {
		assets: N,
		picked: r.assets,
		locked: l,
		onPicked: (e) => i({
			...r,
			assets: e
		})
	}) : /* @__PURE__ */ (0, G.jsx)(ee, {
		size: "compact",
		icon: h,
		title: H("这批作品尚未抽帧"),
		children: H("{value} 条作品还没有可用预览；批准后仍会按所选资料写入标签。", { value: n.video_count || "" })
	}) : t === "fc2_similarity" ? null : t === "western_identity" ? /* @__PURE__ */ (0, G.jsx)(vt, {
		row: n,
		openItem: v.openItem,
		openEntity: v.openEntity,
		onReveal: v.onReveal,
		revealing: v.revealing,
		note: v.revealNote
	}) : /* @__PURE__ */ (0, G.jsx)(mt, { url: n.preview_url }), ae = T ? L : D ? /* @__PURE__ */ (0, G.jsxs)("h4", {
		className: R(xt, "flex-wrap gap-2"),
		children: [/* @__PURE__ */ (0, G.jsx)("span", {
			title: D,
			className: "flex max-w-full min-w-0 overflow-hidden rounded-md",
			children: /* @__PURE__ */ (0, G.jsx)(u, {
				variant: "caption",
				color: "neutral",
				children: D
			})
		}), /* @__PURE__ */ (0, G.jsx)("span", {
			title: O,
			className: "min-w-0 truncate text-body-medium text-text-primary",
			children: O
		})]
	}) : /* @__PURE__ */ (0, G.jsx)("h4", {
		className: xt,
		children: /* @__PURE__ */ (0, G.jsx)("span", {
			title: E,
			className: "min-w-0 truncate text-body-medium text-text-primary",
			children: E
		})
	});
	return /* @__PURE__ */ (0, G.jsxs)("section", {
		"aria-label": E,
		"data-review-key": n.item_key,
		className: R(bt, Ct(t)),
		children: [
			/* @__PURE__ */ (0, G.jsxs)("header", {
				className: "flex min-w-0 shrink-0 items-center gap-2 border-b border-separator-border px-5 py-4",
				children: [
					l ? null : /* @__PURE__ */ (0, G.jsx)("span", {
						className: R(xt, "shrink-0"),
						onPointerDownCapture: (e) => {
							b.current = e.shiftKey;
						},
						onKeyDownCapture: (e) => {
							b.current = e.shiftKey;
						},
						children: /* @__PURE__ */ (0, G.jsx)(c, {
							isSelected: a,
							"aria-label": H("选择 {title}", { title: E }),
							onChange: (e) => s(b.current, e)
						})
					}),
					/* @__PURE__ */ (0, G.jsx)("div", {
						className: "min-w-0 flex-1",
						children: ae
					}),
					I ? /* @__PURE__ */ (0, G.jsx)(u, {
						variant: "caption",
						color: "neutral",
						children: I
					}) : null
				]
			}),
			/* @__PURE__ */ (0, G.jsx)("div", {
				className: "relative mx-5 flex min-w-0 min-h-0 flex-1 flex-col",
				children: /* @__PURE__ */ (0, G.jsxs)("div", {
					ref: te,
					className: "flex min-w-0 min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4",
					children: [
						n.source_name ? /* @__PURE__ */ (0, G.jsx)("p", {
							className: "text-body-2-regular text-text-secondary",
							children: H("来源写法：{source_name}", { source_name: n.source_name })
						}) : null,
						!T && (n.board || n.assets) ? /* @__PURE__ */ (0, G.jsx)("p", {
							className: "text-body-2-regular text-text-secondary",
							children: H("对照文件：{value}", { value: Number(n.video_count || n.assets || 0).toLocaleString() })
						}) : null,
						!T && L ? L : null,
						S && (k || n.current_value !== void 0) ? /* @__PURE__ */ (0, G.jsxs)("div", {
							role: "region",
							"aria-label": H("当前信息"),
							className: "flex min-w-0 flex-col gap-1 border-b border-separator-border pb-4",
							children: [
								/* @__PURE__ */ (0, G.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, G.jsx)("h5", {
										"data-copy-key": "review.card.current_value",
										className: "text-caption-1-medium text-text-secondary",
										children: H("当前值")
									}), n.current_owner?.startsWith("user:") || n.current_owner?.startsWith("review:") ? /* @__PURE__ */ (0, G.jsx)(u, {
										variant: "caption",
										color: "neutral",
										children: H("人工确认")
									}) : null]
								}),
								/* @__PURE__ */ (0, G.jsx)("p", {
									className: "text-body-2-regular text-text-primary wrap-anywhere",
									children: n.current_value === void 0 ? k : n.current_value ? /* @__PURE__ */ (0, G.jsx)(nt, {
										value: n.current_value,
										reference: (n.candidates?.find((e) => e.candidate_key === r.candidateKey) || n.candidates?.[0])?.display_value
									}) : H("尚无资料")
								}),
								n.videos === void 0 ? null : /* @__PURE__ */ (0, G.jsx)("p", {
									className: "text-caption-1-regular text-text-secondary",
									children: H("{value} 个{value2}", {
										value: Number(n.videos).toLocaleString(),
										value2: n.asset_path ? H("匹配文件") : H("同番号文件")
									})
								})
							]
						}) : null,
						A.length || t === "creator_tags" ? /* @__PURE__ */ (0, G.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: A.length ? A.map((e) => /* @__PURE__ */ (0, G.jsx)(u, {
								variant: "caption",
								color: "soft",
								children: e
							}, e)) : /* @__PURE__ */ (0, G.jsx)("small", {
								className: "text-body-2-regular text-text-secondary",
								children: H("暂无待确认标签")
							})
						}) : null,
						S ? /* @__PURE__ */ (0, G.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, G.jsxs)("h5", {
								className: "text-caption-1-medium text-text-secondary",
								children: [/* @__PURE__ */ (0, G.jsx)("span", {
									"data-copy-key": "review.card.candidate_sources",
									children: H("候选来源")
								}), ` · ${n.candidates?.length || 0}`]
							}), n.current_value || (n.candidates?.length || 0) > 1 ? /* @__PURE__ */ (0, G.jsx)("span", {
								"data-copy-key": n.current_value ? "review.card.compare_current" : "review.card.compare_sources",
								className: "text-caption-1-regular text-text-tertiary",
								children: n.current_value ? H("与当前值比较") : H("来源间差异")
							}) : null]
						}) : null,
						ie,
						/* @__PURE__ */ (0, G.jsx)(dt, {
							row: n,
							tags: p,
							locked: l,
							toast: v.toast
						}),
						!S && k ? /* @__PURE__ */ (0, G.jsx)("p", {
							className: "text-body-2-regular text-text-secondary wrap-anywhere",
							children: k
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, G.jsxs)("footer", {
				className: R(_.stack, "shrink-0"),
				children: [
					y === "ignored" ? null : /* @__PURE__ */ (0, G.jsx)(x, {
						variant: "secondary",
						size: "small",
						className: "me-auto",
						disabled: l,
						...F(d),
						onClick: () => g("rejected"),
						children: H("忽略")
					}),
					y === "pending" ? /* @__PURE__ */ (0, G.jsx)(o, {
						variant: "secondary",
						size: "small",
						disabled: l,
						...F(d),
						onClick: () => g("skipped"),
						children: H("稍后处理")
					}) : /* @__PURE__ */ (0, G.jsx)(o, {
						variant: y === "ignored" ? "primary" : "secondary",
						size: "small",
						disabled: l,
						...F(d),
						onClick: () => g("restore"),
						children: H("恢复待处理")
					}),
					y === "ignored" ? null : /* @__PURE__ */ (0, G.jsx)(o, {
						variant: "primary",
						size: "small",
						disabled: l || !j,
						...F(d),
						title: j ? void 0 : H("没有可采用的资料，可先保留或忽略"),
						onClick: () => g("approved"),
						children: H(j ? "通过" : "不可通过")
					}),
					f ? /* @__PURE__ */ (0, G.jsx)("p", {
						role: "status",
						className: "w-full text-body-2-regular text-text-error-primary",
						children: f
					}) : null
				]
			})
		]
	});
}
// src/react/review/review-page.tsx
var Tt = "flex cursor-pointer items-center justify-between gap-2";
function Et({ page: e, pages: t, onPage: n }) {
	return t <= 1 ? null : /* @__PURE__ */ (0, G.jsxs)("nav", {
		"aria-label": H("复核分页"),
		"data-pagination-layout": "",
		className: "inline-grid w-full min-w-0 items-center gap-2",
		children: [
			/* @__PURE__ */ (0, G.jsx)(o, {
				variant: "secondary",
				size: "small",
				disabled: e <= 1,
				onClick: () => n(e - 1),
				children: H("上一页")
			}),
			/* @__PURE__ */ (0, G.jsx)("ul", {
				className: "flex min-w-0 flex-wrap items-center justify-center gap-1",
				children: z(e, t).map((t, r) => /* @__PURE__ */ (0, G.jsx)("li", { children: t === "…" ? /* @__PURE__ */ (0, G.jsx)("span", {
					"aria-hidden": !0,
					className: "px-1 text-body-2-regular text-text-tertiary",
					children: "…"
				}) : /* @__PURE__ */ (0, G.jsx)(o, {
					variant: t === e ? "secondary" : "ghost",
					size: "small",
					"aria-label": H("第 {item} 页", { item: t }),
					"aria-current": t === e ? "page" : void 0,
					onClick: () => n(Number(t)),
					children: t
				}) }, t === "…" ? `dots-${r}` : t))
			}),
			/* @__PURE__ */ (0, G.jsx)(o, {
				variant: "secondary",
				size: "small",
				disabled: e >= t,
				onClick: () => n(e + 1),
				children: H("下一页")
			})
		]
	});
}
function Dt(r) {
	let [i, a] = (0, W.useState)(() => matchMedia("(max-width:900px)").matches);
	(0, W.useEffect)(() => {
		let e = matchMedia("(max-width:900px)"), t = () => a(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let { route: s, openItem: c, openEntity: l, revealSource: u, toast: d, readOnly: f, readOnlyMessage: m, writerUrl: h } = r, [_, v] = (0, W.useState)(fe(r.category) ? r.category : p), [y, b] = (0, W.useState)(() => Ce(r.queue)), [x, ne] = (0, W.useState)("candidates"), [D, O] = (0, W.useState)(""), [k, A] = (0, W.useState)(""), [j, M] = (0, W.useState)(1), [N, P] = (0, W.useState)(/* @__PURE__ */ new Set()), [F, I] = (0, W.useState)(/* @__PURE__ */ new Map()), [L, R] = (0, W.useState)(/* @__PURE__ */ new Map()), [pe, z] = (0, W.useState)(""), ge = (0, W.useRef)(null), [_e, ve] = (0, W.useState)(0), [ye, be] = (0, W.useState)(""), Te = (0, W.useRef)(!0);
	(0, W.useEffect)(() => () => {
		Te.current = !1;
	}, []);
	let B = Ne({
		queryKey: C,
		queryFn: ({ signal: e }) => le(e)
	}), Ee = B.data || {
		sections: {},
		counts: {},
		queues: {
			later: {
				sections: {},
				counts: {}
			},
			ignored: {
				sections: {},
				counts: {}
			}
		}
	}, De = Se(Ee, y), Oe = B.data ? Object.fromEntries(T.map((e) => [e, S.reduce((t, n) => t + Number(Se(Ee, e).counts[n] || 0), 0)])) : void 0, V = De.sections[_] || [], U = _ === "metadata_fields", Pe = f;
	(0, W.useEffect)(() => {
		let e = new Set(V.map((e) => e.item_key));
		P((t) => {
			let n = [...t].filter((t) => e.has(t));
			return n.length === t.size ? t : new Set(n);
		}), I((t) => {
			let n = [...t].filter(([t]) => e.has(t));
			return n.length === t.size ? t : new Map(n);
		}), R((t) => {
			let n = [...t].filter(([t]) => e.has(t));
			return n.length === t.size ? t : new Map(n);
		});
	}, [V]);
	let Ie = (0, W.useMemo)(() => U ? de(V, "field") : [], [V, U]), ze = Ie.some((e) => e.key === k) ? k : "", K = (0, W.useMemo)(() => U ? ue(V, "field", ze) : V, [
		V,
		U,
		ze
	]), Be = (0, W.useMemo)(() => xe(K, U), [K, U]), q = Be.some(([e]) => e === x) ? x : "candidates", J = (0, W.useMemo)(() => de(K, q), [K, q]), Ve = J.some((e) => e.key === D) ? D : "", He = (0, W.useMemo)(() => we(ue(K, q, Ve), j), [
		K,
		q,
		Ve,
		j
	]), Ue = He.rows.map((e) => e.item_key), We = new Set(Ue), Ge = J.map((e) => ({
		...e,
		rows: e.rows.filter((e) => We.has(e.item_key))
	})).filter((e) => e.rows.length), Y = (e) => F.get(e.item_key) || se(e), X = (0, W.useMemo)(() => V.filter((e) => N.has(e.item_key)), [V, N]), Z = (e) => {
		let t = new Set(e);
		P((e) => new Set([...e].filter((e) => !t.has(e)))), I((e) => new Map([...e].filter(([e]) => !t.has(e)))), R((e) => new Map([...e].filter(([e]) => !t.has(e))));
	}, Ke = (e, t) => R((n) => new Map(n).set(e, t)), qe = () => {
		ne("candidates"), O(""), A(""), M(1), P(/* @__PURE__ */ new Set()), I(/* @__PURE__ */ new Map()), R(/* @__PURE__ */ new Map()), z(""), ge.current = null;
	}, Je = (e) => {
		v(e), qe(), s({
			category: e === "metadata_fields" ? "" : e,
			queue: y === "pending" ? "" : y
		});
	}, Ye = (e) => {
		b(e), qe(), s({
			category: _ === "metadata_fields" ? "" : _,
			queue: e === "pending" ? "" : e
		});
	}, Q = Me({
		mutationFn: ({ row: e, status: t, category: n }) => je(ae(n, ie(n, e), t, Y(e))),
		onSuccess: (e, { row: t, status: n, category: r }) => {
			e.ok ? (Ae(r, [t.item_key], n), Z([t.item_key]), d(oe(n))) : Ke(t.item_key, e.error || H("服务端拒绝了这次判定"));
		},
		onError: (e, { row: t }) => Ke(t.item_key, ce(e))
	}), $ = Me({
		mutationFn: async ({ status: e, category: t, rows: n }) => {
			let r = [], i = [];
			for (let [a, o] of n.entries()) {
				if (!Te.current) break;
				z(H("正在处理 {at} / {count}", {
					at: a,
					count: n.length
				}));
				try {
					let n = await je(ae(t, ie(t, o), e, Y(o)));
					if (!n.ok) throw Error(n.error || H("服务端未采用该项"));
					r.push(o.item_key);
				} catch (e) {
					i.push([o.item_key, ce(e)]);
				}
			}
			return {
				status: e,
				category: t,
				done: r,
				failures: i
			};
		},
		onSuccess: ({ status: e, category: t, done: n, failures: r }) => {
			Ae(t, n, e), Z(n), r.forEach(([e, t]) => Ke(e, t)), z("");
			let i = {
				approved: H("通过"),
				rejected: H("忽略"),
				skipped: H("移至稍后处理"),
				restore: H("恢复待处理")
			}[e];
			d(H("已{action} {length} 项", {
				action: i,
				length: n.length
			}) + (r.length ? H("，{length} 项未完成", { length: r.length }) : ""));
		},
		onError: (e) => {
			z(ce(e));
		}
	}), Xe = (e) => {
		!$.isPending && X.length && (e === "approved" && U && X.some((e) => !Y(e).candidateKey) ? z(H("请先为所选资料选择要采用的来源。")) : (z(""), $.mutate({
			status: e,
			category: _,
			rows: X
		})));
	}, Ze = (e) => {
		I((t) => {
			let n = new Map(t);
			for (let t of X) {
				let r = t.candidates?.find((t) => t.source === e);
				r && n.set(t.item_key, {
					...Y(t),
					candidateKey: r.candidate_key
				});
			}
			return n;
		}), z(H("已选择 {source}，点击通过所选采用。", { source: e }));
	}, Qe = async (e) => {
		if (_e) return;
		ve(e), be("");
		let t = await u(e);
		Te.current && (ve(0), be(t));
	}, $e = he(Ee.mirror, m), et = Ee.genre_tags || [], tt = {
		openItem: c,
		openEntity: l,
		onReveal: Qe,
		revealing: _e,
		revealNote: ye,
		toast: d
	};
	return /* @__PURE__ */ (0, G.jsx)(Fe, { children: /* @__PURE__ */ (0, G.jsxs)("div", {
		className: "flex flex-col gap-5 pb-10",
		children: [
			Pe ? /* @__PURE__ */ (0, G.jsx)(te, {
				tone: "warning",
				title: H("本机只能浏览"),
				extra: h ? /* @__PURE__ */ (0, G.jsx)("p", {
					className: "text-body-2-regular",
					children: /* @__PURE__ */ (0, G.jsx)(g, {
						href: h,
						children: H("前往写入端复核")
					})
				}) : void 0,
				children: $e
			}) : null,
			/* @__PURE__ */ (0, G.jsx)(at, { tags: et }),
			/* @__PURE__ */ (0, G.jsxs)(n, {
				orientation: i ? "horizontal" : "vertical",
				selectedKey: _,
				onSelectionChange: (e) => {
					let t = String(e);
					fe(t) && Je(t);
				},
				className: "flex flex-col gap-5 review-split:flex-row review-split:items-start review-split:gap-6",
				children: [/* @__PURE__ */ (0, G.jsxs)("div", {
					"data-section-nav": !0,
					className: "w-full min-w-0 review-split:sticky review-split:top-topbar review-split:w-review-tabs review-split:shrink-0",
					children: [/* @__PURE__ */ (0, G.jsx)("h2", {
						id: "reviewcategories",
						children: H("复核分类")
					}), /* @__PURE__ */ (0, G.jsx)(Le, {
						scrollable: i,
						"aria-labelledby": "reviewcategories",
						"data-section-items": !0,
						className: "flex review-split:flex-col review-split:items-stretch",
						children: S.map((e) => {
							let n = Number(De.counts[e] || 0);
							return /* @__PURE__ */ (0, G.jsxs)(t, {
								id: e,
								className: Tt,
								isDisabled: Q.isPending || $.isPending,
								"data-pill-selected": _ === e ? "" : void 0,
								"data-pill-variant": "gray",
								children: [w[e], n ? /* @__PURE__ */ (0, G.jsx)("span", {
									className: "tabular-nums text-caption-1-medium text-text-secondary",
									children: n.toLocaleString()
								}) : null]
							}, e);
						})
					})]
				}), /* @__PURE__ */ (0, G.jsxs)(e, {
					id: _,
					className: "flex min-w-0 flex-1 flex-col gap-5",
					children: [
						/* @__PURE__ */ (0, G.jsx)(Re, {
							queueView: y,
							queueCounts: Oe,
							onQueueChange: Ye,
							locked: Pe,
							fields: Ie,
							fieldFilter: ze,
							onFieldFilter: (e) => {
								A(e), O(""), M(1);
							},
							groupOptions: Be,
							groupBy: q,
							onGroupBy: (e) => {
								ne(e), O(""), M(1);
							},
							groups: J,
							filter: Ve,
							onFilter: (e) => {
								O(e), M(1);
							},
							pageKeys: Ue,
							selected: N,
							onSelected: P,
							selectedRows: X,
							metadata: U,
							approvable: X.every((e) => re(_, e)),
							busy: $.isPending || Q.isPending,
							feedback: pe,
							onUnifySource: Ze,
							onRun: Xe
						}),
						He.rows.length ? Ge.map((e) => /* @__PURE__ */ (0, G.jsxs)("section", {
							className: "flex flex-col gap-3",
							children: [Ge.length > 1 || q !== "candidates" ? /* @__PURE__ */ (0, G.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, G.jsx)("h3", {
									className: "text-body-medium text-text-primary",
									children: `${e.title} · ${e.rows.length}`
								}), Pe ? null : /* @__PURE__ */ (0, G.jsx)(o, {
									variant: "ghost",
									size: "small",
									onClick: () => {
										let t = e.rows.map((e) => e.item_key), n = t.every((e) => N.has(e)), r = new Set(N);
										for (let e of t) n ? r.delete(e) : r.add(e);
										P(r);
									},
									children: e.rows.every((e) => N.has(e.item_key)) ? H("清空本组") : H("全选本组")
								})]
							}) : null, /* @__PURE__ */ (0, G.jsx)("div", {
								className: "review-grid gap-5",
								children: e.rows.map((e) => /* @__PURE__ */ (0, G.jsx)(wt, {
									category: _,
									row: e,
									queueView: y,
									choice: Y(e),
									onChoice: (t) => I((n) => new Map(n).set(e.item_key, t)),
									selected: N.has(e.item_key),
									onSelect: (t, n) => P((r) => {
										let i = new Set(r);
										return ge.current = ke(i, Ue, ge.current, e.item_key, t, n), i;
									}),
									locked: Pe,
									busy: $.isPending || Q.isPending && Q.variables?.row.item_key === e.item_key,
									problem: L.get(e.item_key) || "",
									genreTags: et,
									onDecide: (t) => {
										Q.isPending || $.isPending || (R((t) => new Map([...t].filter(([t]) => t !== e.item_key))), Q.mutate({
											row: e,
											status: t,
											category: _
										}));
									},
									handlers: tt
								}, e.item_key))
							})]
						}, e.key)) : B.isError && !B.data ? /* @__PURE__ */ (0, G.jsx)(te, {
							tone: "error",
							title: H("复核队列读取失败"),
							action: /* @__PURE__ */ (0, G.jsx)(o, {
								variant: "secondary",
								size: "small",
								disabled: B.isFetching,
								onClick: () => void B.refetch(),
								children: H("立即重试")
							}),
							children: ce(B.error)
						}) : /* @__PURE__ */ (0, G.jsx)(ee, {
							icon: me,
							title: H("此分类没有{value}项目", { value: E[y] }),
							actions: S.some((e) => e !== _ && Number(De.counts[e] || 0) > 0) ? /* @__PURE__ */ (0, G.jsx)(o, {
								size: "small",
								onClick: () => {
									let e = S.find((e) => e !== _ && Number(De.counts[e] || 0) > 0);
									e && Je(e);
								},
								children: H("查看其他分类")
							}) : void 0,
							children: y === "pending" ? H("可切换分类查看其他待确认资料。") : H("{value}的资料会保留在这里，可恢复到待处理。", { value: E[y] })
						}),
						/* @__PURE__ */ (0, G.jsx)(Et, {
							page: He.page,
							pages: He.pages,
							onPage: M
						})
					]
				})]
			})
		]
	}) });
}
export { Dt as ReviewPage };

//# debugId=f5749a66-6f17-4b8f-b8cd-e8353049b618