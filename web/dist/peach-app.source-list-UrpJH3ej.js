(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "a9924fc5-eeec-48b1-b5d2-3485d8c3c5bc", e._sentryDebugIdIdentifier = "sentry-dbid-a9924fc5-eeec-48b1-b5d2-3485d8c3c5bc");
	} catch {}
})();
import { createPaginatedRowModel as e } from "./peach-app.createPaginatedRowModel-ClHnhG_T.js";
import { $76d00c5a4edb230a$export$76ccd210b9029917 as t, $76d00c5a4edb230a$export$816b5d811295e6bc as n, $76d00c5a4edb230a$export$b59bdbef9ce70de2 as r, $76d00c5a4edb230a$export$f6f0c3fe4ec306ea as i, $76d00c5a4edb230a$export$f850895b287ef28e as ee, $ea3928288112382f$export$439d29a4e110a164 as te, Button as a, Bx as ne, COLUMN_SORT as o, Checkbox as s, ChevronSortDown as c, CollapseChevron as re, CollapseRegion as l, DataTableFooter as u, DataTableFrame as ie, EmptyState as ae, FOLLOW_CHECK_KEY as d, LAYOUTS as oe, M6 as se, Note as f, SORT_DEFAULT_DIR as ce, SORT_OPTIONS as le, Select as ue, SelectItem as de, SelectionDock as fe, SortDirectionIcon as pe, Switch as me, Table as he, TableColumnControls as ge, TableColumnResizer as _e, TableSelectionHeader as ve, TaskProgress as ye, Un as be, __toESM as p, authorGroups as xe, authorName as Se, busyProps as m, cardClass as Ce, checkEvidenceGap as we, checkFailures as Te, checkReceipt as Ee, checkSummary as De, checkedText as Oe, clickedBlank as h, columnVisibilityFeature as ke, confirmModal as g, createColumnHelper as Ae, dZ as _, dropSources as je, du as Me, errorHeadline as Ne, errorMessage as v, fetchCheckJob as Pe, fetchPending as Fe, flexRender as Ie, isBroken as Le, l7 as y, mapLimit as Re, markItem as ze, pageWindow as Be, patchSource as Ve, reloadFollowManage as He, removeSource as Ue, require_jsx_runtime as b, require_react as x, rowPaginationFeature as S, rowSelectionFeature as We, rowSortingFeature as C, selectionState as Ge, setSourceEnabled as Ke, sortLabel as qe, startCheck as Je, t as w, tableFeatures as Ye, tableRows as Xe, toggleGroup as T, useBackgroundJob as Ze, useMutation as E, useTable as Qe, useTablePreferences as $e } from "./peach-app.js";
import { AuthorAvatar as et, ErrorLine as tt, SourceIcon as D, SourceLink as nt, StatusBadge as rt } from "./peach-app.source-view-DmVrf8Cn.js";
// src/react/follow-manage/source-list.tsx
var O = /* @__PURE__ */ p(x(), 1), k = b(), it = Ye({
	rowPaginationFeature: S,
	rowSelectionFeature: We,
	rowSortingFeature: C,
	columnVisibilityFeature: ke,
	paginatedRowModel: e()
}), A = (e) => (Number(e) || 0).toLocaleString(), at = Object.fromEntries(Object.entries(o).map(([e, t]) => [t, e])), j = 740;
function ot() {
	let [e, t] = (0, O.useState)(!1), n = (0, O.useRef)(null), r = (0, O.useCallback)((e) => {
		if (n.current?.disconnect(), !e) {
			n.current = null;
			return;
		}
		let r = new ResizeObserver(() => t(e.clientWidth < j));
		r.observe(e), n.current = r, t(e.clientWidth < j);
	}, []);
	return (0, O.useEffect)(() => () => n.current?.disconnect(), []), [r, e];
}
var st = {
	select: w("选择"),
	author: w("创作者"),
	source: w("来源"),
	provider: w("站点"),
	status: w("状态"),
	checked: w("上次检查"),
	actions: w("操作")
}, ct = Object.entries(st).map(([e, t]) => ({
	id: e,
	label: t,
	width: e === "select" ? 48 : e === "source" ? 320 : e === "author" ? 240 : e === "actions" ? 208 : 184,
	min: e === "select" ? 48 : e === "actions" ? 200 : e === "source" ? 320 : 112,
	max: e === "select" ? 48 : e === "source" ? 2e3 : 800,
	flex: e === "source",
	required: e === "select" || e === "source"
}));
function M({ source: e, selected: t, onToggle: n, handlers: r }) {
	return /* @__PURE__ */ (0, k.jsxs)("div", {
		"data-selected": t || void 0,
		"data-follow-source-row": "",
		className: "flex min-h-16 flex-wrap items-center gap-3 px-2 py-3 last:rounded-b-lg max-sm:gap-x-2",
		onClick: (e) => {
			h(e, e.currentTarget) && n(!t);
		},
		children: [
			/* @__PURE__ */ (0, k.jsx)(s, {
				isSelected: t,
				onChange: n,
				"aria-label": w("选择 {label}", { label: e.label })
			}),
			/* @__PURE__ */ (0, k.jsxs)("span", {
				className: "flex min-w-0 grow basis-0 items-center gap-1.5",
				children: [/* @__PURE__ */ (0, k.jsx)("span", {
					"data-follow-source-site": "",
					className: "flex shrink-0 items-center text-body-medium",
					children: /* @__PURE__ */ (0, k.jsx)(D, { provider: e.provider })
				}), /* @__PURE__ */ (0, k.jsx)(nt, { source: e })]
			}),
			/* @__PURE__ */ (0, k.jsx)(te, { children: e.provider_label }),
			/* @__PURE__ */ (0, k.jsx)(rt, { source: e }),
			e.last_error ? /* @__PURE__ */ (0, k.jsxs)("span", {
				"data-follow-source-error": "",
				className: "flex min-w-0 basis-full gap-3 max-sm:gap-x-2 sm:order-last",
				children: [/* @__PURE__ */ (0, k.jsx)("span", {
					"aria-hidden": !0,
					className: "w-4 shrink-0"
				}), /* @__PURE__ */ (0, k.jsxs)("span", {
					className: "flex min-w-0 grow gap-1.5",
					children: [/* @__PURE__ */ (0, k.jsx)("span", {
						"aria-hidden": !0,
						className: "w-(--icon-inline) shrink-0 text-body-medium"
					}), /* @__PURE__ */ (0, k.jsx)("span", {
						className: "min-w-0 grow",
						children: /* @__PURE__ */ (0, k.jsx)(tt, { text: e.last_error })
					})]
				})]
			}) : null,
			/* @__PURE__ */ (0, k.jsxs)("span", {
				"data-follow-source-controls": "",
				className: "flex w-max max-w-full flex-none flex-wrap items-center gap-1.5 max-sm:w-full",
				children: [
					/* @__PURE__ */ (0, k.jsx)("span", {
						className: "shrink-0 text-body-2-regular whitespace-nowrap text-text-secondary max-sm:mr-auto max-sm:text-caption-1-regular",
						children: Oe(e)
					}),
					/* @__PURE__ */ (0, k.jsx)(me, {
						"aria-label": w("启用 {label}", { label: e.label }),
						isSelected: e.enabled,
						isDisabled: r.readOnly,
						onChange: (t) => r.toggle(e, t)
					}),
					/* @__PURE__ */ (0, k.jsxs)("span", {
						className: "flex shrink-0 items-center gap-1",
						children: [/* @__PURE__ */ (0, k.jsx)(a, {
							variant: "secondary",
							size: "small",
							iconOnly: !0,
							leadingIcon: _,
							"aria-label": w("检查 {label} 的更新", { label: e.label }),
							disabled: !e.enabled || r.readOnly,
							...m(r.busy),
							onClick: () => r.check([e.id])
						}), /* @__PURE__ */ (0, k.jsx)(a, {
							variant: "secondary",
							size: "small",
							iconOnly: !0,
							leadingIcon: se,
							"aria-label": w("移除 {label}", { label: e.label }),
							disabled: r.readOnly,
							onClick: () => r.remove(e)
						})]
					})
				]
			})
		]
	});
}
function lt({ group: e, name: t, open: n, selected: r, handlers: i, onOpen: ee, onToggleGroup: ne, onToggle: o }) {
	let s = e.map((e) => e.id), c = e.filter((e) => e.enabled).map((e) => e.id), u = e.filter(Le).length, ie = [...new Set(e.map((e) => e.provider_label || e.provider))].join("、"), ae = `follow-author-${e[0].id}`, d = Ge(r, s);
	return /* @__PURE__ */ (0, k.jsxs)("section", {
		"aria-label": w("{name} 的关注来源", { name: t }),
		className: Ce({
			variant: "raised",
			padding: "none",
			className: "flex flex-col overflow-hidden p-2"
		}),
		children: [/* @__PURE__ */ (0, k.jsxs)("div", {
			"data-follow-author-header": !0,
			"data-open": n || void 0,
			className: "flex flex-wrap items-center gap-3 px-2 py-2.5",
			children: [
				/* @__PURE__ */ (0, k.jsx)(et, {
					group: e,
					name: t
				}),
				/* @__PURE__ */ (0, k.jsxs)("span", {
					className: "flex min-w-0 grow basis-0 flex-col gap-1",
					children: [/* @__PURE__ */ (0, k.jsx)("b", {
						className: "min-w-0 text-body-medium wrap-anywhere text-text-primary",
						children: t
					}), /* @__PURE__ */ (0, k.jsxs)("span", {
						"data-follow-author-sites": "",
						className: "flex min-w-0 flex-wrap items-center gap-1 text-body-2-regular",
						title: ie,
						children: [
							e.map((e) => /* @__PURE__ */ (0, k.jsx)(D, { provider: e.provider }, e.id)),
							/* @__PURE__ */ (0, k.jsx)(te, { children: w("来源：{providers}", { providers: ie }) }),
							u ? /* @__PURE__ */ (0, k.jsx)("span", {
								className: "ml-1 shrink-0 text-text-error-primary",
								children: w("{bad} 个失败", { bad: u })
							}) : null
						]
					})]
				}),
				/* @__PURE__ */ (0, k.jsxs)("span", {
					"data-follow-author-controls": "",
					className: "flex flex-none items-center gap-2 max-sm:w-full max-sm:justify-end",
					children: [/* @__PURE__ */ (0, k.jsx)(a, {
						variant: "secondary",
						size: "small",
						iconOnly: !0,
						leadingIcon: _,
						"aria-label": w("检查 {name} 的全部来源", { name: t }),
						disabled: !c.length || i.readOnly,
						...m(i.busy),
						onClick: () => i.check(c)
					}), /* @__PURE__ */ (0, k.jsxs)("span", {
						className: "flex flex-none items-center gap-2",
						children: [/* @__PURE__ */ (0, k.jsx)(a, {
							variant: "secondary",
							size: "small",
							leadingIcon: y,
							"aria-pressed": d.all ? "true" : d.some ? "mixed" : "false",
							"aria-label": d.all ? w("取消全选 {name} 的来源", { name: t }) : w("全选 {name} 的来源", { name: t }),
							onClick: () => ne(!d.all),
							children: d.all ? w("取消全选") : w("全选")
						}), /* @__PURE__ */ (0, k.jsx)(a, {
							variant: "secondary",
							size: "small",
							"aria-expanded": n,
							"aria-controls": ae,
							leadingIcon: re,
							"aria-label": w("{value} {name} 的来源", {
								value: w(n ? "收起" : "展开"),
								name: t
							}),
							onClick: () => ee(!n),
							children: w(n ? "收起" : "展开")
						})]
					})]
				})
			]
		}), /* @__PURE__ */ (0, k.jsx)(l, {
			id: ae,
			open: n,
			"data-source-divider": !0,
			children: e.map((e) => /* @__PURE__ */ (0, k.jsx)(M, {
				source: e,
				handlers: i,
				selected: r.has(e.id),
				onToggle: (t) => o(e.id, t)
			}, e.id))
		})]
	});
}
function ut(e) {
	let { data: l, sort: p, dir: h, page: ke, layout: Le, pageSize: y, selected: b, readOnly: x, onSort: S, onPage: We, onLayout: C, onPageSize: Ye, onSelected: j, toast: M, openFollow: ut, onAdd: dt } = e, N = l.sources, P = (0, O.useMemo)(() => l.author_aliases || [], [l.author_aliases]), F = l.counts || {}, [ft, pt] = (0, O.useState)(/* @__PURE__ */ new Set()), [mt, ht] = ot(), [gt, I] = (0, O.useState)(""), L = (0, O.useMemo)(() => xe(N, p, h, P), [
		N,
		p,
		h,
		P
	]), _t = (0, O.useMemo)(() => Xe(L, p, h, P), [
		L,
		p,
		h,
		P
	]), { job: R, running: z, outcome: B, start: vt } = Ze({
		queryKey: d,
		queryFn: ({ signal: e }) => Pe(e),
		start: (e) => Je(e),
		onError: (e) => I(v(e)),
		onFinish: (e) => {
			He(), M(e.status === "failed" ? e.error || w("检查失败") : Ee(e));
		}
	}), V = (e) => {
		z || vt.isPending || (I(""), vt.mutate(e));
	}, yt = (e, t) => j(T(b, [e], t)), bt = (e, t) => j(T(b, e, t)), xt = E({
		mutationFn: (e) => Ue(e),
		onSuccess: (e, t) => {
			je([t]), j(T(b, [t], !1)), M(w("已取消关注来源"));
		},
		onError: (e) => I(v(e))
	}), St = E({
		mutationFn: (e) => Ke(e.id, e.enabled),
		onSuccess: (e, t) => {
			Ve(t.id, { enabled: t.enabled }), I("");
		},
		onError: (e) => I(v(e))
	}), Ct = (e) => void g({
		title: w("取消关注来源"),
		body: w("将移除这个来源及已抓取的条目，媒体文件保留。"),
		confirmLabel: w("取消关注来源"),
		danger: !0,
		onConfirm: () => xt.mutateAsync(e.id)
	}), H = E({
		mutationFn: async (e) => {
			let t = await Re(e.ids, 4, async (t) => {
				e.action === "remove" ? await Ue(t) : await Ke(t, e.action === "enabled");
			});
			return {
				...e,
				done: e.ids.filter((e, n) => t[n]?.ok),
				results: t
			};
		},
		onSuccess: (e) => {
			if (e.action === "remove") je(e.done);
			else for (let t of e.done) Ve(t, { enabled: e.action === "enabled" });
			j(T(b, e.done, !1));
			let t = e.results.filter((e) => !e.ok);
			if (t.length) {
				I(w("{count}/{count2} 个来源未更新：{value}", {
					count: t.length,
					count2: e.ids.length,
					value: v(t[0]?.error)
				}));
				return;
			}
			I("");
			let n = e.action === "remove" ? w("删除") : e.action === "enabled" ? w("启用") : w("暂停");
			M(w("已{word} {count} 个关注来源", {
				word: n,
				count: e.done.length
			}));
		},
		onError: (e) => I(v(e))
	}), U = E({
		mutationFn: async (e) => {
			let t = ((await Fe()).groups || []).flatMap((e) => [
				e.primary,
				...e.variants,
				...e.duplicates
			]).filter((e) => e.status === "new").map((e) => e.id);
			return {
				ids: t,
				failed: (await Re(t, 6, (t) => ze(t, e))).filter((e) => !e.ok)
			};
		},
		onSuccess: (e) => {
			He(), e.failed.length ? I(w("批量更新 {count}/{count2} 项未完成", {
				count: e.failed.length,
				count2: e.ids.length
			})) : (I(""), M(w("已批量标记 {count} 项", { count: e.ids.length })));
		},
		onError: (e) => I(v(e))
	}), wt = (e, t) => St.mutate({
		id: e.id,
		enabled: t
	}), W = (0, O.useRef)({
		check: V,
		toggle: wt,
		remove: Ct,
		busy: !1,
		readOnly: x
	});
	W.current = {
		check: V,
		toggle: wt,
		remove: Ct,
		busy: z || vt.isPending,
		readOnly: x
	};
	let G = W.current, Tt = (0, O.useMemo)(() => {
		let e = Ae(), t = (e) => () => st[e] || e;
		return e.columns([
			e.display({
				id: "select",
				header: (e) => /* @__PURE__ */ (0, k.jsx)(ve, {
					table: e.table,
					label: w("全选本页来源"),
					page: !0
				}),
				cell: (e) => /* @__PURE__ */ (0, k.jsx)(s, {
					slot: null,
					isSelected: e.row.getIsSelected(),
					onChange: (t) => e.row.toggleSelected(t),
					"aria-label": w("选择 {label}", { label: e.row.original.source.label })
				})
			}),
			e.accessor((e) => e.author, {
				id: "author",
				header: t("author"),
				cell: (e) => /* @__PURE__ */ (0, k.jsxs)("span", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, k.jsx)(et, {
						group: e.row.original.group,
						name: e.row.original.author
					}), /* @__PURE__ */ (0, k.jsx)("span", {
						className: "min-w-0 break-words",
						children: e.row.original.author
					})]
				})
			}),
			e.accessor((e) => e.source.label, {
				id: "source",
				header: t("source"),
				cell: (e) => /* @__PURE__ */ (0, k.jsxs)("span", {
					className: "flex min-w-0 flex-col gap-0.5",
					children: [/* @__PURE__ */ (0, k.jsx)(nt, { source: e.row.original.source }), e.row.original.source.last_error ? /* @__PURE__ */ (0, k.jsx)(tt, { text: e.row.original.source.last_error }) : null]
				})
			}),
			e.accessor((e) => e.source.provider_label, {
				id: "provider",
				header: t("provider"),
				cell: (e) => /* @__PURE__ */ (0, k.jsxs)("span", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, k.jsx)(D, { provider: e.row.original.source.provider }), e.row.original.source.provider_label]
				})
			}),
			e.display({
				id: "status",
				header: t("status"),
				cell: (e) => /* @__PURE__ */ (0, k.jsx)(rt, { source: e.row.original.source })
			}),
			e.accessor((e) => e.source.last_checked_at || "", {
				id: "checked",
				header: t("checked"),
				cell: (e) => Oe(e.row.original.source)
			}),
			e.display({
				id: "actions",
				header: t("actions"),
				cell: (e) => /* @__PURE__ */ (0, k.jsxs)("span", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, k.jsx)(me, {
							"aria-label": w("启用 {label}", { label: e.row.original.source.label }),
							isSelected: e.row.original.source.enabled,
							isDisabled: G.readOnly,
							onChange: (t) => W.current.toggle(e.row.original.source, t)
						}),
						/* @__PURE__ */ (0, k.jsx)(a, {
							variant: "secondary",
							size: "small",
							iconOnly: !0,
							leadingIcon: _,
							"aria-label": w("检查 {label} 的更新", { label: e.row.original.source.label }),
							disabled: !e.row.original.source.enabled || G.readOnly,
							...m(G.busy),
							onClick: () => W.current.check([e.row.original.source.id])
						}),
						/* @__PURE__ */ (0, k.jsx)(a, {
							variant: "secondary",
							size: "small",
							iconOnly: !0,
							leadingIcon: se,
							"aria-label": w("移除 {label}", { label: e.row.original.source.label }),
							disabled: G.readOnly,
							onClick: () => W.current.remove(e.row.original.source)
						})
					]
				})
			})
		]);
	}, [G]), K = (0, O.useMemo)(() => {
		let e = at[p];
		return e ? [{
			id: e,
			desc: h === "desc"
		}] : [];
	}, [p, h]), Et = (0, O.useMemo)(() => Object.fromEntries([...b].map((e) => [String(e), !0])), [b]), q = Le === "table", J = $e("follow-sources", ct), Y = Be(q ? _t.length : L.length, y, ke), X = Qe({
		features: it,
		data: _t,
		columns: Tt,
		getRowId: (e) => String(e.source.id),
		state: {
			sorting: K,
			rowSelection: Et,
			pagination: {
				pageIndex: Y.page - 1,
				pageSize: y
			},
			columnVisibility: J.visibility
		},
		onColumnVisibilityChange: J.change,
		manualSorting: !0,
		enableRowSelection: !0,
		onSortingChange: (e) => {
			let t = (typeof e == "function" ? e(K) : e)[0];
			if (!t) return;
			let n = o[t.id];
			n && S(n, t.desc ? "desc" : "asc");
		},
		onRowSelectionChange: (e) => {
			let t = typeof e == "function" ? e(Et) : e;
			j(new Set(Object.entries(t).filter(([, e]) => e).map(([e]) => Number(e))));
		},
		onPaginationChange: (e) => {
			let t = {
				pageIndex: Y.page - 1,
				pageSize: y
			}, n = typeof e == "function" ? e(t) : e;
			n.pageSize === y ? n.pageIndex !== t.pageIndex && We(n.pageIndex + 1) : Ye(n.pageSize);
		}
	}), Dt = X.getRowModel().rows, Ot = q ? Dt.map((e) => e.original.source.id) : L.slice(Y.start, Y.end).flatMap((e) => e.map((e) => e.id)), kt = Ge(b, Ot), Z = [...b], Q = Te(B), At = N.filter((e) => e.enabled && (e.last_status === "error" || e.last_status === "unauthorized")).map((e) => e.id), jt = we(B), $ = L.length > 0 && ft.size >= L.length;
	return N.length ? /* @__PURE__ */ (0, k.jsxs)("div", {
		className: Ce({
			padding: "none",
			className: "flex flex-col gap-4 px-6 py-5 max-sm:px-4"
		}),
		children: [
			/* @__PURE__ */ (0, k.jsxs)("div", {
				ref: mt,
				"data-follow-toolbar": "",
				"data-responsive-toolbar": "",
				children: [/* @__PURE__ */ (0, k.jsxs)("span", {
					"data-follow-toolbar-heading": "",
					"data-toolbar-heading": "",
					children: [/* @__PURE__ */ (0, k.jsx)("h3", {
						className: "text-title-2-medium text-text-primary",
						children: w("关注列表")
					}), /* @__PURE__ */ (0, k.jsx)("span", {
						className: "text-body-2-regular text-text-secondary",
						children: w("{value} 个来源{value2}", {
							value: N.length.toLocaleString(),
							value2: F.new ? w(" · {value} 条未看", { value: A(F.new) }) : ""
						})
					})]
				}), /* @__PURE__ */ (0, k.jsxs)("div", {
					"data-follow-toolbar-actions": "",
					"data-toolbar-actions": "",
					children: [
						At.length ? /* @__PURE__ */ (0, k.jsx)(a, {
							variant: "secondary",
							disabled: x,
							...m(G.busy),
							onClick: () => V(At),
							children: w("检查失败项")
						}) : null,
						/* @__PURE__ */ (0, k.jsx)(a, {
							variant: "primary",
							leadingIcon: _,
							disabled: x,
							"aria-label": w("检查全部"),
							iconOnly: ht,
							...m(G.busy),
							onClick: () => V([]),
							children: w("检查全部")
						}),
						/* @__PURE__ */ (0, k.jsxs)("span", {
							"data-follow-toolbar-controls": "",
							className: "contents",
							children: [
								/* @__PURE__ */ (0, k.jsxs)("span", {
									"data-button-group": !0,
									role: "group",
									"aria-label": w("关注列表版式"),
									children: [/* @__PURE__ */ (0, k.jsx)(a, {
										variant: "ghost",
										iconOnly: !0,
										leadingIcon: be,
										"aria-label": oe[0][1],
										"aria-pressed": !q,
										onClick: () => C("default")
									}), /* @__PURE__ */ (0, k.jsx)(a, {
										variant: "ghost",
										iconOnly: !0,
										leadingIcon: Me,
										"aria-label": oe[1][1],
										"aria-pressed": q,
										onClick: () => C("table")
									})]
								}),
								q ? /* @__PURE__ */ (0, k.jsx)(ge, {
									preferences: J,
									label: w("关注来源")
								}) : null,
								/* @__PURE__ */ (0, k.jsxs)("span", {
									className: "flex flex-none items-center gap-2",
									children: [/* @__PURE__ */ (0, k.jsx)(ue, {
										"aria-label": w("关注列表排序"),
										prefix: w("排序"),
										selectedKey: p,
										onSelectionChange: (e) => {
											if (e === null) return;
											let t = String(e);
											S(t, ce[t]);
										},
										children: le.map(([e, t]) => /* @__PURE__ */ (0, k.jsx)(de, {
											id: e,
											children: t
										}, e))
									}), /* @__PURE__ */ (0, k.jsx)(a, {
										variant: "secondary",
										iconOnly: !0,
										leadingIcon: pe,
										"data-icon-state": h === "asc" ? "a" : "b",
										"aria-label": qe(p, h),
										onClick: () => S(p, h === "asc" ? "desc" : "asc")
									})]
								}),
								q ? null : /* @__PURE__ */ (0, k.jsx)(a, {
									variant: "secondary",
									iconOnly: ht,
									leadingIcon: re,
									"aria-expanded": !$,
									"aria-label": w($ ? "全部展开" : "全部收起"),
									onClick: () => pt($ ? /* @__PURE__ */ new Set() : new Set(L.map((e) => String(e[0].author_key || e[0].id)))),
									children: w($ ? "全部展开" : "全部收起")
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, k.jsxs)("div", {
				"aria-live": "polite",
				className: "flex flex-col gap-3 empty:hidden",
				children: [
					z ? /* @__PURE__ */ (0, k.jsx)(ye, {
						embedded: !0,
						label: R?.message || (R?.total ? w("{value}：已完成 {value2}/{total} 个来源", {
							value: R.older ? w("抓取历史") : w("检查更新"),
							value2: R.checked || 0,
							total: R.total
						}) : w("正在准备检查任务")),
						value: R?.checked,
						total: R?.total
					}) : null,
					gt ? /* @__PURE__ */ (0, k.jsx)(f, {
						tone: "error",
						title: w("操作未完成"),
						children: gt
					}) : null,
					!z && B?.results?.length ? /* @__PURE__ */ (0, k.jsx)(f, {
						tone: "neutral",
						title: w("检查结果"),
						children: De(B)
					}) : null,
					Q.length ? /* @__PURE__ */ (0, k.jsx)(f, {
						tone: "error",
						title: w("{count} 个来源检查失败", { count: Q.length }),
						extra: /* @__PURE__ */ (0, k.jsx)("ul", {
							className: "flex flex-col gap-0.5 text-body-2-regular",
							children: Q.map((e, t) => /* @__PURE__ */ (0, k.jsx)("li", { children: w("{name}：{reason}", {
								name: `${e.provider_label || e.provider || ""} ${e.author || e.label || e.ref || ""}`,
								reason: Ne(e.error || "") || w("未说明原因")
							}) }, `${e.provider || ""}-${e.ref || t}`))
						}),
						children: w("这些来源这一轮没有取到更新。")
					}) : null,
					jt ? /* @__PURE__ */ (0, k.jsx)(f, {
						tone: "warning",
						children: w("条目已保存，但这次未保存来源的原始响应：{evidence}", { evidence: jt })
					}) : null
				]
			}),
			/* @__PURE__ */ (0, k.jsxs)(fe, {
				label: w("关注来源批量操作"),
				visible: Z.length > 0,
				count: w("已选 {count} 个来源", { count: Z.length }),
				children: [
					/* @__PURE__ */ (0, k.jsx)(a, {
						variant: "secondary",
						size: "small",
						disabled: x,
						...m(G.busy),
						onClick: () => V(Z),
						children: w("检查所选")
					}),
					/* @__PURE__ */ (0, k.jsx)(a, {
						variant: "secondary",
						size: "small",
						disabled: x,
						...m(H.isPending),
						onClick: () => H.mutate({
							ids: Z,
							action: "enabled"
						}),
						children: w("启用")
					}),
					/* @__PURE__ */ (0, k.jsx)(a, {
						variant: "secondary",
						size: "small",
						disabled: x,
						...m(H.isPending),
						onClick: () => H.mutate({
							ids: Z,
							action: "paused"
						}),
						children: w("暂停")
					}),
					/* @__PURE__ */ (0, k.jsx)(a, {
						variant: "danger",
						size: "small",
						disabled: x,
						...m(H.isPending),
						onClick: () => void g({
							title: w("删除 {count} 个关注来源", { count: Z.length }),
							body: w("将移除所选关注来源及其已抓取条目，媒体文件保留。"),
							confirmLabel: w("删除所选来源"),
							danger: !0,
							onConfirm: () => H.mutateAsync({
								ids: Z,
								action: "remove"
							})
						}),
						children: w("删除")
					}),
					/* @__PURE__ */ (0, k.jsx)(a, {
						variant: "ghost",
						size: "small",
						onClick: () => j(/* @__PURE__ */ new Set()),
						children: w("取消选择")
					})
				]
			}),
			q ? /* @__PURE__ */ (0, k.jsx)(ie, {
				follow: !0,
				preferences: J,
				onRowClick: (e) => yt(Number(e), !b.has(Number(e))),
				children: /* @__PURE__ */ (0, k.jsxs)(he, {
					"aria-label": w("关注来源"),
					size: "sm",
					sortDescriptor: K[0] ? {
						column: K[0].id,
						direction: K[0].desc ? "descending" : "ascending"
					} : void 0,
					onSortChange: (e) => X.setSorting([{
						id: String(e.column),
						desc: e.direction === "descending"
					}]),
					children: [/* @__PURE__ */ (0, k.jsxs)(ee, { children: [X.getHeaderGroups()[0].headers.map((e) => {
						let t = e.column.id in o, r = Ie(e.column.columnDef.header, e.getContext());
						return /* @__PURE__ */ (0, k.jsx)(n, {
							id: e.id,
							allowsSorting: t,
							isRowHeader: e.column.id === "source",
							...J.columnProps(e.id),
							children: ({ sortDirection: n }) => /* @__PURE__ */ (0, k.jsxs)(k.Fragment, { children: [e.id === "select" ? r : t ? /* @__PURE__ */ (0, k.jsxs)("span", {
								className: "flex items-center gap-0.5",
								children: [r, /* @__PURE__ */ (0, k.jsx)("span", {
									"data-sort-indicator": !0,
									"data-direction": n || void 0,
									children: /* @__PURE__ */ (0, k.jsx)(c, {})
								})]
							}) : /* @__PURE__ */ (0, k.jsx)(te, { children: r }), /* @__PURE__ */ (0, k.jsx)(_e, {
								preferences: J,
								id: e.id
							})] })
						}, e.id);
					}), /* @__PURE__ */ (0, k.jsx)(n, {
						id: "remaining-space",
						"aria-label": w("行空白区域"),
						"data-table-space": "",
						width: J.spaceWidth,
						minWidth: 0
					})] }), /* @__PURE__ */ (0, k.jsx)(t, {
						renderEmptyState: () => w("这一页没有来源"),
						children: Dt.map((e) => /* @__PURE__ */ (0, k.jsxs)(r, {
							id: e.id,
							"data-follow-selected": e.getIsSelected() || void 0,
							children: [e.getVisibleCells().map((e) => /* @__PURE__ */ (0, k.jsx)(i, { children: Ie(e.column.columnDef.cell, e.getContext()) }, e.id)), /* @__PURE__ */ (0, k.jsx)(i, { "data-table-space": "" })]
						}, e.id))
					})]
				})
			}) : /* @__PURE__ */ (0, k.jsxs)(k.Fragment, { children: [/* @__PURE__ */ (0, k.jsx)(s, {
				isSelected: kt.all,
				isIndeterminate: kt.some,
				onChange: (e) => bt(Ot, e),
				"aria-label": w("全选本页来源"),
				children: w("全选本页")
			}), /* @__PURE__ */ (0, k.jsx)("div", {
				className: "flex flex-col gap-3",
				children: L.slice(Y.start, Y.end).map((e) => {
					let t = String(e[0].author_key || e[0].id);
					return /* @__PURE__ */ (0, k.jsx)(lt, {
						group: e,
						name: Se(e, P),
						handlers: G,
						selected: b,
						open: !ft.has(t),
						onOpen: (e) => {
							let n = new Set(ft);
							e ? n.delete(t) : n.add(t), pt(n);
						},
						onToggleGroup: (t) => bt(e.map((e) => e.id), t),
						onToggle: yt
					}, t);
				})
			})] }),
			/* @__PURE__ */ (0, k.jsx)(u, {
				label: w("关注列表"),
				total: Y.total,
				pagination: {
					pageIndex: Y.page - 1,
					pageSize: y
				},
				unit: w(q ? "个来源" : "位创作者"),
				pageUnit: w(q ? "条" : "位"),
				onChange: (e) => {
					e.pageSize === y ? X.setPageIndex(e.pageIndex) : X.setPageSize(e.pageSize);
				}
			}),
			F.new ? /* @__PURE__ */ (0, k.jsxs)("div", {
				className: "-mx-6 -mb-5 flex flex-wrap items-center gap-2 border-t border-separator-border rounded-b-2xl bg-card-footer px-6 py-4 max-sm:-mx-4 max-sm:px-4",
				children: [
					/* @__PURE__ */ (0, k.jsx)("span", {
						className: "mr-auto text-body-2-regular text-text-secondary",
						children: w("未看 {value} · 已看 {value2} · 已保存 {value3} · 已忽略 {value4}", {
							value: A(F.new),
							value2: A(F.seen),
							value3: A(F.saved),
							value4: A(F.ignored)
						})
					}),
					/* @__PURE__ */ (0, k.jsx)(a, {
						variant: "secondary",
						size: "small",
						onClick: ut,
						children: w("去看更新")
					}),
					/* @__PURE__ */ (0, k.jsx)(a, {
						variant: "secondary",
						size: "small",
						disabled: x,
						...m(U.isPending),
						onClick: () => void g({
							title: w("标记已看"),
							body: w("将把当前未看作品标记为已看。"),
							confirmLabel: w("标记已看"),
							onConfirm: () => U.mutateAsync("seen")
						}),
						children: w("全部标记已看")
					}),
					/* @__PURE__ */ (0, k.jsx)(a, {
						variant: "secondary",
						size: "small",
						disabled: x,
						...m(U.isPending),
						onClick: () => void g({
							title: w("标记已忽略"),
							body: w("将把当前未看作品标记为已忽略。"),
							confirmLabel: w("标记已忽略"),
							onConfirm: () => U.mutateAsync("ignored")
						}),
						children: w("全部忽略")
					})
				]
			}) : null
		]
	}) : /* @__PURE__ */ (0, k.jsx)(ae, {
		icon: ne,
		title: w("还没有关注来源"),
		actions: /* @__PURE__ */ (0, k.jsx)(a, {
			variant: "primary",
			size: "small",
			onClick: dt,
			children: w("添加关注")
		}),
		children: w("关注来源及其检查状态会显示在这里。")
	});
}
export { ut as SourceList };

//# debugId=a9924fc5-eeec-48b1-b5d2-3485d8c3c5bc