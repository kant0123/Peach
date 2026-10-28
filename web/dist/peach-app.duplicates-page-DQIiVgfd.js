(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "1fe2006d-e5ef-43ed-8f2c-f69f29a0cda7", e._sentryDebugIdIdentifier = "sentry-dbid-1fe2006d-e5ef-43ed-8f2c-f69f29a0cda7");
	} catch {}
})();
import { Button as e, CollectionSummary as t, DUPLICATES_KEY as n, EmptyState as r, FilterGlass as i, GlassPill as a, KEEP_LABELS as o, LOC as s, MEDIA_SOURCES_KEY as c, MEDIA_SOURCE_ICONS as l, Note as u, SourceLabel as d, SourceMark as f, TRASH_KEY as p, __toESM as m, batchOperate as h, bulkCloudPreferences as g, busyProps as _, cardClass as v, cloudLocations as y, confirmModal as b, distinctName as x, duplicateVictims as S, errorMessage as C, fetchDuplicates as w, fetchMediaSources as T, fmtDur as E, fmtSize as D, mixedCloudPreferences as O, queryClient as k, require_jsx_runtime as A, require_react as j, sharedNamePrefix as M, spriteGlyph as N, t as P, useMutation as F, useQuery as I, victimBytes as L } from "./peach-app.js";
// src/react/duplicates/duplicates-page.tsx
var R = /* @__PURE__ */ m(j(), 1), z = A(), B = N("play"), V = N("file-stack"), H = v({
	padding: "none",
	radius: "surface",
	className: "mb-6 overflow-hidden dark:bg-background-primary-default"
}), U = "rounded-sm px-1.5 py-px text-caption-1-regular leading-5", W = "rounded-sm px-2 py-0.5 text-caption-1-regular leading-5", G = "font-mono text-caption-1-regular leading-5 text-text-secondary", K = () => {
	k.invalidateQueries({
		queryKey: n,
		exact: !0
	}), k.invalidateQueries({
		queryKey: p,
		exact: !0
	});
};
function q(e) {
	return e.identical ? /* @__PURE__ */ (0, z.jsxs)("span", {
		className: `${W} text-(--keep)`,
		children: ["$", P("sha1 一致")]
	}) : /* @__PURE__ */ (0, z.jsx)("span", {
		className: `${W} text-text-secondary`,
		children: e.evidence === "same_code_short_copy" ? P("同番号短版本") : P("时长推断")
	});
}
function J({ file: e, prefix: t, openItem: n }) {
	let r = () => n(e.id), i = s[e.location] || e.location || e.drive;
	return /* @__PURE__ */ (0, z.jsxs)("div", {
		className: "duplicate-row items-center gap-3 border-t border-separator-border px-5 py-4 max-compact:p-4",
		children: [
			/* @__PURE__ */ (0, z.jsxs)("button", {
				type: "button",
				onClick: r,
				"aria-label": P("预览 {name}", { name: e.name }),
				className: "relative row-span-2 inline-grid aspect-16/10 w-full cursor-pointer place-items-center overflow-hidden rounded-2lg bg-background-tertiary-default text-text-secondary",
				children: [/* @__PURE__ */ (0, z.jsx)(B, {
					"aria-hidden": !0,
					className: "size-6"
				}), /* @__PURE__ */ (0, z.jsx)("img", {
					src: `/thumb?id=${e.id}&c=4`,
					alt: "",
					loading: "lazy",
					onError: (e) => e.currentTarget.remove(),
					className: "absolute inset-0 size-full object-contain"
				})]
			}),
			/* @__PURE__ */ (0, z.jsxs)("span", {
				className: "flex min-w-0 items-center gap-2 max-duplicate-narrow:col-start-2 max-duplicate-narrow:-col-end-1",
				children: [/* @__PURE__ */ (0, z.jsx)("button", {
					type: "button",
					onClick: r,
					title: e.name,
					"data-middle-truncate": !0,
					"data-middle-truncate-within": !0,
					className: "min-w-0 shrink cursor-pointer truncate text-left text-body-regular hover:text-text-secondary",
					children: x(e.name, t)
				}), e.is_largest || e.is_longest ? /* @__PURE__ */ (0, z.jsxs)("span", {
					className: "flex flex-none gap-1",
					children: [e.is_largest ? /* @__PURE__ */ (0, z.jsxs)("i", {
						className: `${U} not-italic bg-background-primary-hover text-text-secondary`,
						children: ["$", P("最大")]
					}) : null, e.is_longest ? /* @__PURE__ */ (0, z.jsxs)("i", {
						className: `${U} not-italic bg-(--keep)/22 text-(--keep)`,
						children: ["$", P("最长")]
					}) : null]
				}) : null]
			}),
			/* @__PURE__ */ (0, z.jsxs)("span", {
				className: `${G} flex min-w-0 items-center gap-1.5`,
				children: [/* @__PURE__ */ (0, z.jsx)(f, { mark: l[e.location] || "database" }), /* @__PURE__ */ (0, z.jsx)("span", {
					title: i,
					className: "min-w-0 truncate",
					children: i
				})]
			}),
			/* @__PURE__ */ (0, z.jsx)("span", {
				className: G,
				children: D(e.size || 0)
			}),
			/* @__PURE__ */ (0, z.jsx)("span", {
				className: G,
				children: E(e.duration)
			}),
			/* @__PURE__ */ (0, z.jsx)("span", {
				className: `${G} col-start-2 -col-end-1 min-w-0 pt-0.5 wrap-anywhere max-duplicate-narrow:col-span-full`,
				children: e.path ?? ""
			})
		]
	});
}
function Y({ openItem: l, toast: f, failure: p }) {
	let m = I({
		queryKey: n,
		queryFn: ({ signal: e }) => w(e)
	}), v = I({
		queryKey: c,
		queryFn: ({ signal: e }) => T(e)
	}), [x, E] = (0, R.useState)(""), k = F({
		mutationFn: (e) => h(e, "dispose"),
		onSuccess: (e, t) => {
			K(), f(P("已把 {count} 项移入回收站", { count: t.length }), { undo: async () => {
				try {
					await h(t, "restore");
				} catch (e) {
					p(P("撤销移入回收站"), e);
				} finally {
					K();
				}
			} });
		},
		onSettled: () => E("")
	}), A = m.data;
	if (!A) return /* @__PURE__ */ (0, z.jsx)("div", {
		className: "mx-auto w-full max-w-board",
		children: /* @__PURE__ */ (0, z.jsx)(u, {
			tone: "error",
			title: P("重复文件读取失败"),
			children: m.error ? C(m.error) : P("未取得重复文件列表，请刷新页面重试。")
		})
	});
	let j = A.groups ?? [], N = y(v.data), B = ({ groups: e, keep: t, key: n }) => {
		if (k.isPending) return;
		let r = S(e, t);
		r.length && b({
			title: P("移入回收站"),
			body: P("将把 {count} 个重复文件的馆藏记录移入回收站，每组保留{largest}。", {
				count: r.length,
				largest: o[t] ?? o.largest
			}) + P("文件共 {value}，记录可从回收站还原。", { value: D(L(e, r)) }),
			confirmLabel: P("移入回收站"),
			onConfirm: () => (E(n), k.mutateAsync(r))
		});
	}, U = (e) => _(x === e && k.isPending);
	return /* @__PURE__ */ (0, z.jsxs)("div", {
		className: "mx-auto w-full max-w-board pb-10.5",
		children: [
			/* @__PURE__ */ (0, z.jsx)(t, {
				label: P("重复内容"),
				figure: P("{value} 组", { value: Number(A.total || 0).toLocaleString() }),
				detail: P("{value} 个文件 · 可回收 {value2}", {
					value: Number(A.files || 0).toLocaleString(),
					value2: D(A.reclaimable)
				})
			}),
			j.length ? /* @__PURE__ */ (0, z.jsxs)(i, {
				title: P("批量保留"),
				children: [
					/* @__PURE__ */ (0, z.jsx)(a, {
						busy: x === "all:largest",
						onPress: () => B({
							groups: j,
							keep: "largest",
							key: "all:largest"
						}),
						children: P("全部保留最大")
					}),
					/* @__PURE__ */ (0, z.jsx)(a, {
						busy: x === "all:longest",
						onPress: () => B({
							groups: j,
							keep: "longest",
							key: "all:longest"
						}),
						children: P("全部保留最长")
					}),
					g(j, N).map((e) => /* @__PURE__ */ (0, z.jsx)(a, {
						busy: x === `all:${e}`,
						onPress: () => B({
							groups: j,
							keep: e,
							key: `all:${e}`
						}),
						children: /* @__PURE__ */ (0, z.jsx)(d, {
							source: e,
							label: P("全部优先 {location}", { location: s[e] || e })
						})
					}, e))
				]
			}) : null,
			k.isError ? /* @__PURE__ */ (0, z.jsx)("div", {
				className: "mb-5",
				children: /* @__PURE__ */ (0, z.jsx)(u, {
					tone: "error",
					title: P("移入回收站失败"),
					children: C(k.error)
				})
			}) : null,
			j.length ? j.map((t, n) => {
				let r = [t], i = M(t.files.map((e) => e.name)), a = (e) => `${n}:${e}`;
				return /* @__PURE__ */ (0, z.jsxs)("section", {
					"aria-label": t.code,
					className: H,
					children: [/* @__PURE__ */ (0, z.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3 bg-background-tertiary-default p-5 max-compact:p-4 dark:bg-background-secondary-default",
						children: [
							/* @__PURE__ */ (0, z.jsx)("b", {
								className: "text-title-2-medium text-text-primary",
								children: t.code
							}),
							/* @__PURE__ */ (0, z.jsx)("span", {
								className: "font-mono text-caption-1-regular leading-5 text-text-primary",
								children: P("{value} 个 · 可回收 {value2}", {
									value: Number(t.count || 0).toLocaleString(),
									value2: D(t.reclaimable)
								})
							}),
							q(t),
							t.cross_drive ? /* @__PURE__ */ (0, z.jsx)("span", {
								className: `${W} text-text-secondary`,
								children: P("跨盘 {value}", { value: t.drives.join(" ") })
							}) : null,
							/* @__PURE__ */ (0, z.jsxs)("span", {
								className: "ml-auto flex flex-wrap gap-2 max-compact:ml-0 max-compact:w-full",
								children: [
									/* @__PURE__ */ (0, z.jsx)(e, {
										variant: "secondary",
										size: "small",
										...U(a("largest")),
										onClick: () => B({
											groups: r,
											keep: "largest",
											key: a("largest")
										}),
										children: P("留最大")
									}),
									/* @__PURE__ */ (0, z.jsx)(e, {
										variant: "secondary",
										size: "small",
										...U(a("longest")),
										onClick: () => B({
											groups: r,
											keep: "longest",
											key: a("longest")
										}),
										children: P("留最长")
									}),
									O(t.files, N).map((t) => /* @__PURE__ */ (0, z.jsx)(e, {
										variant: "secondary",
										size: "small",
										...U(a(t)),
										onClick: () => B({
											groups: r,
											keep: t,
											key: a(t)
										}),
										children: /* @__PURE__ */ (0, z.jsx)(d, {
											source: t,
											label: P("留 {location}", { location: s[t] || t })
										})
									}, t)),
									/* @__PURE__ */ (0, z.jsx)(e, {
										variant: "danger",
										size: "small",
										...U(a("all")),
										onClick: () => B({
											groups: r,
											keep: "all",
											key: a("all")
										}),
										children: P("整组回收")
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, z.jsx)("div", { children: t.files.map((e) => /* @__PURE__ */ (0, z.jsx)(J, {
						file: e,
						prefix: i,
						openItem: l
					}, e.id)) })]
				}, `${t.code}-${n}`);
			}) : /* @__PURE__ */ (0, z.jsx)(r, {
				icon: V,
				title: P("没有找到重复文件"),
				children: P("所有来源之间没有检测到内容相同的文件。扫描新来源后，这里会自动更新。")
			}),
			j.length > 0 && A.total > j.length ? /* @__PURE__ */ (0, z.jsx)("p", {
				className: "text-center text-caption-1-regular text-text-secondary",
				children: P("显示可回收最多的前 {value} 组，共 {value2} 组；处理掉这些后，其余的会补上来。", {
					value: j.length.toLocaleString(),
					value2: Number(A.total).toLocaleString()
				})
			}) : null
		]
	});
}
export { Y as DuplicatesPage };

//# debugId=1fe2006d-e5ef-43ed-8f2c-f69f29a0cda7