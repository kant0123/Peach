(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "02e93971-37c4-46b7-8974-353993d1e87a", e._sentryDebugIdIdentifier = "sentry-dbid-02e93971-37c4-46b7-8974-353993d1e87a");
	} catch {}
})();
import { createPaginatedRowModel as e } from "./peach-app.createPaginatedRowModel-ClHnhG_T.js";
import { createSortedRowModel as t, useTableSelection as n } from "./peach-app.use-table-selection-BSdXI_Nc.js";
import { $76d00c5a4edb230a$export$76ccd210b9029917 as r, $76d00c5a4edb230a$export$816b5d811295e6bc as i, $76d00c5a4edb230a$export$b59bdbef9ce70de2 as a, $76d00c5a4edb230a$export$f6f0c3fe4ec306ea as o, $76d00c5a4edb230a$export$f850895b287ef28e as s, Button as c, Checkbox as l, ChevronSortDown as u, DataTableFooter as d, DataTableFrame as f, DataTableSort as p, SelectionDock as m, Table as h, TableColumnControls as g, TableColumnResizer as _, TableSelectionHeader as v, __toESM as y, cardClass as b, columnVisibilityFeature as x, createColumnHelper as S, flexRender as C, require_jsx_runtime as w, require_react as T, rowPaginationFeature as E, rowSelectionFeature as D, rowSortingFeature as O, t as k, tableFeatures as A, useTable as j, useTablePreferences as M } from "./peach-app.js";
// src/react/components/data-table.tsx
var N = /* @__PURE__ */ y(T(), 1), P = w(), F = A({
	rowSortingFeature: O,
	rowSelectionFeature: D,
	rowPaginationFeature: E,
	columnVisibilityFeature: x,
	sortedRowModel: t(),
	paginatedRowModel: e()
});
function I({ label: e, items: t, columns: y, rowId: x, rowLabel: w, selected: T, onSelected: E, actions: D, title: O = e, titleId: A, description: I, footerActions: L, panel: R = !0, unit: z = k("条记录") }) {
	let [B, V] = (0, N.useState)([]), H = (0, N.useMemo)(() => [{
		id: "select",
		label: k("选择"),
		width: 48,
		min: 48,
		max: 48,
		required: !0
	}, ...y.map((e, t) => ({
		...e,
		width: e.width ?? (t === 0 ? 320 : 160),
		min: e.min ?? (t === 0 ? 320 : 96),
		flex: e.flex ?? t === 0,
		required: t === 0
	}))], [y]), U = M(`data:${e}`, H), [W, G] = (0, N.useState)({
		pageIndex: 0,
		pageSize: 20
	}), K = n(() => E([])), q = Math.max(1, Math.ceil(t.length / W.pageSize)), J = Math.min(W.pageIndex, q - 1), Y = Object.fromEntries(T.map((e) => [e, !0])), X = (0, N.useMemo)(() => {
		let t = S();
		return t.columns([t.display({
			id: "select",
			header: ({ table: t }) => /* @__PURE__ */ (0, P.jsx)(v, {
				table: t,
				label: k("全选{label}", { label: e })
			}),
			cell: ({ row: e }) => /* @__PURE__ */ (0, P.jsx)(l, {
				slot: null,
				"aria-label": k("选择 {value}", { value: w(e.original) }),
				isSelected: e.getIsSelected(),
				onChange: (t) => e.toggleSelected(t)
			})
		}), ...y.map((e) => t.accessor((t) => e.value?.(t) ?? "", {
			id: e.id,
			header: e.label,
			enableSorting: !!e.value,
			sortFn: (t, n) => {
				let r = e.value(t.original), i = e.value(n.original);
				return typeof r == "number" && typeof i == "number" ? r - i : String(r).localeCompare(String(i), "zh-CN", { numeric: !0 });
			},
			cell: ({ row: t }) => e.render(t.original)
		}))]);
	}, [
		y,
		e,
		w
	]), Z = j({
		features: F,
		data: t,
		columns: X,
		getRowId: x,
		state: {
			sorting: B,
			rowSelection: Y,
			pagination: {
				...W,
				pageIndex: J
			},
			columnVisibility: U.visibility
		},
		onColumnVisibilityChange: U.change,
		onSortingChange: (e) => {
			V(e), G((e) => ({
				...e,
				pageIndex: 0
			}));
		},
		onPaginationChange: G,
		enableRowSelection: !0,
		onRowSelectionChange: (e) => {
			let n = typeof e == "function" ? e(Y) : e;
			Object.values(n).some(Boolean) && K(), E(t.filter((e) => n[x(e)]).map(x));
		}
	}), Q = Z.getSelectedRowModel().rows.map((e) => e.original);
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		"data-data-table-panel": R || void 0,
		className: R ? b({
			padding: "none",
			bordered: "line",
			className: "flex flex-col gap-4 px-6 py-5 max-sm:px-4"
		}) : "flex min-w-0 flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, P.jsxs)("div", {
				"data-responsive-toolbar": "",
				role: "toolbar",
				"aria-label": k("{label}工具栏", { label: e }),
				children: [/* @__PURE__ */ (0, P.jsxs)("div", {
					"data-toolbar-heading": "",
					children: [/* @__PURE__ */ (0, P.jsx)("h3", {
						id: A,
						className: "text-title-2-medium text-text-primary",
						children: O
					}), /* @__PURE__ */ (0, P.jsx)("span", {
						className: "text-body-2-regular tabular-nums text-text-secondary",
						children: `${t.length.toLocaleString()} ${z}`
					})]
				}), /* @__PURE__ */ (0, P.jsxs)("div", {
					"data-toolbar-actions": "",
					children: [/* @__PURE__ */ (0, P.jsx)(g, {
						preferences: U,
						label: e
					}), /* @__PURE__ */ (0, P.jsx)(p, {
						label: e,
						options: y.filter((e) => e.value).map((e) => ({
							id: e.id,
							label: e.label
						})),
						sorting: B,
						onChange: (e) => {
							V(e), G((e) => ({
								...e,
								pageIndex: 0
							}));
						}
					})]
				})]
			}),
			I ? /* @__PURE__ */ (0, P.jsx)("p", {
				className: "text-body-2-regular text-text-secondary",
				children: I
			}) : null,
			/* @__PURE__ */ (0, P.jsxs)(m, {
				label: k("{label}批量操作", { label: e }),
				visible: Q.length > 0,
				count: k("已选 {value} {unit}", {
					value: Q.length.toLocaleString(),
					unit: z
				}),
				children: [D(Q, () => E([])), /* @__PURE__ */ (0, P.jsx)(c, {
					variant: "ghost",
					size: "small",
					onClick: () => E([]),
					children: k("取消选择")
				})]
			}),
			/* @__PURE__ */ (0, P.jsx)(f, {
				follow: !0,
				preferences: U,
				onRowClick: (e) => Z.getRow(e)?.toggleSelected(),
				children: /* @__PURE__ */ (0, P.jsxs)(h, {
					"aria-label": e,
					size: "sm",
					sortDescriptor: B[0] ? {
						column: B[0].id,
						direction: B[0].desc ? "descending" : "ascending"
					} : void 0,
					onSortChange: (e) => Z.getColumn(String(e.column))?.toggleSorting(e.direction === "descending"),
					children: [/* @__PURE__ */ (0, P.jsxs)(s, { children: [Z.getHeaderGroups()[0].headers.map((e) => /* @__PURE__ */ (0, P.jsx)(i, {
						id: e.id,
						isRowHeader: e.id === y[0].id,
						allowsSorting: e.column.getCanSort(),
						...U.columnProps(e.id),
						children: ({ sortDirection: t }) => /* @__PURE__ */ (0, P.jsxs)(P.Fragment, { children: [/* @__PURE__ */ (0, P.jsxs)("span", {
							className: "flex items-center gap-0.5",
							children: [C(e.column.columnDef.header, e.getContext()), e.column.getCanSort() ? /* @__PURE__ */ (0, P.jsx)("span", {
								"data-sort-indicator": !0,
								"data-direction": t || void 0,
								children: /* @__PURE__ */ (0, P.jsx)(u, {})
							}) : null]
						}), /* @__PURE__ */ (0, P.jsx)(_, {
							preferences: U,
							id: e.id
						})] })
					}, e.id)), /* @__PURE__ */ (0, P.jsx)(i, {
						id: "remaining-space",
						"aria-label": k("行空白区域"),
						"data-table-space": "",
						width: U.spaceWidth,
						minWidth: 0
					})] }), /* @__PURE__ */ (0, P.jsx)(r, {
						renderEmptyState: () => k("没有记录"),
						children: Z.getRowModel().rows.map((e) => /* @__PURE__ */ (0, P.jsxs)(a, {
							id: e.id,
							"data-board-selected": e.getIsSelected() || void 0,
							children: [e.getVisibleCells().map((e) => /* @__PURE__ */ (0, P.jsx)(o, { children: C(e.column.columnDef.cell, e.getContext()) }, e.id)), /* @__PURE__ */ (0, P.jsx)(o, { "data-table-space": "" })]
						}, e.id))
					})]
				})
			}),
			/* @__PURE__ */ (0, P.jsx)(d, {
				label: e,
				total: t.length,
				pagination: {
					...W,
					pageIndex: J
				},
				onChange: G,
				unit: z
			}),
			L ? /* @__PURE__ */ (0, P.jsx)("div", {
				className: "flex flex-wrap items-center justify-end gap-2 border-t border-separator-border pt-4",
				children: L
			}) : null
		]
	});
}
export { I as DataTable };

//# debugId=02e93971-37c4-46b7-8974-353993d1e87a