(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "81ff8cd0-9e71-4cb2-a6b2-7ae4473452e9", e._sentryDebugIdIdentifier = "sentry-dbid-81ff8cd0-9e71-4cb2-a6b2-7ae4473452e9");
	} catch {}
})();
import { Button as e, Chip as t, DIRECTORY_TEMPLATE_ERROR as n, DUPLICATES_KEY as r, Fieldset as i, FieldsetTitle as a, IDLE_REPAIR as o, IconButton as s, Input as c, JUNK_KEY as l, LINKS_KEY as u, LINK_CHECK_KEY as d, LINK_KINDS as f, LINK_PRUNE_KEY as p, LOC as m, LibraryProcessingCard as h, MEDIA_REPAIR_KEY as g, MEDIA_REPAIR_URL as _, MEDIA_SOURCES_KEY as v, MEDIA_SOURCE_ICONS as y, Note as b, ORGANIZE_KEY as x, ORPHAN_RECORDS_KEY as S, Progress as C, QUALITY_GOALS_KEY as w, REPAIR_CARD_TEXT as T, REPAIR_LIBRARIES_KEY as E, RESOURCE_APPLY_KEY as D, RESOURCE_SCAN_KEY as O, RESULT_PANEL as ee, RESULT_SECTION as k, REVIEW_COUNTS_KEY as A, SOURCE_LABELS as j, Select as te, SelectItem as ne, SourceMark as M, StatusLabel as N, TRASH_KEY as re, TaskProgress as P, Wt as F, __toESM as ie, apiSend as ae, applyConfirmText as I, applyLeftovers as L, applyPlanText as R, applyText as oe, attachOrphan as se, baseName as z, busyProps as B, candidateText as ce, checkLine as le, confirmModal as V, entityFaceImg as ue, entityPath as de, errorMessage as H, esc as fe, fetchDuplicates as pe, fetchJunkSummary as me, fetchLinkCheck as U, fetchLinkPrune as he, fetchLinkStats as W, fetchMediaRepair as ge, fetchMediaSources as _e, fetchOrganize as ve, fetchOrganizeExample as ye, fetchOrphanRecords as be, fetchQualityGoals as xe, fetchRepairLibraries as Se, fetchResourceApply as Ce, fetchResourceScan as we, fetchReviewCounts as Te, fetchTrashSummary as Ee, firstGrapheme as De, fmtSize as Oe, hasChanges as ke, hasResourceRoots as Ae, junkBreakdown as je, localizeServer as Me, missingToolText as Ne, organizeOutcome as Pe, pickOrganizeFolder as Fe, planSummary as Ie, previewOrganize as Le, pruneText as Re, purgeCount as ze, purgeOrphan as Be, queryClient as G, recordsText as Ve, rememberTemplates as He, require_jsx_runtime as Ue, require_react as We, reviewSummary as Ge, scanLine as Ke, sourceMeta as qe, spriteGlyph as K, startLinkCheck as Je, startLinkPrune as Ye, startOrganize as Xe, startResourceApply as Ze, startResourceScan as Qe, statusLine as $e, t as q, useAction as et, useBackgroundJob as J, useMutation as tt, useQuery as Y, withOrganizeJob as nt } from "./peach-app.js";
import { Page as rt } from "./peach-app.page-QAncjzM1.js";
import { ErrorExcerpt as it } from "./peach-app.error-excerpt-B_zKhKl7.js";
import { PLAIN_STAT_STRIP as at, PlainStat as X, plainStatClass as ot } from "./peach-app.stat-card-DsNmy_0F.js";
import { DataTable as st } from "./peach-app.data-table-Jvx9PY19.js";
import { SiteMark as ct } from "./peach-app.site-mark-D_VlIyJz.js";
import { LEGACY_AVATAR_IMG as lt } from "./peach-app.legacy-avatar-NSITxLRS.js";
import { FolderSearchIcon as ut } from "./peach-app.folder-rows-Cf9AO4n-.js";
import { ConnectionStatus as dt } from "./peach-app.connection-status-CmFoMQyr.js";
// src/react/media-repair/media-repair-card.tsx
var Z = /* @__PURE__ */ ie(We(), 1), Q = Ue(), ft = (e) => y[e] || e, pt = (e) => G.setQueryData(g, e);
function mt({ toast: t = () => {} }) {
	let n = J({
		queryKey: g,
		queryFn: ({ signal: e }) => ge(e),
		start: (e) => ae(_, {
			library: e,
			restart: !0
		}),
		onFinish: (e) => {
			e.status === "complete" && !e.failed && !e.missing_tool && t(e.repaired ? q("已修复 {value} 部视频", { value: e.repaired.toLocaleString() }) : q("已检查媒体库，没有需要修复的视频"));
		}
	}), r = Y({
		queryKey: E,
		queryFn: ({ signal: e }) => Se(e)
	}), [s, c] = (0, Z.useState)(""), l = et(), u = n.job ?? o, d = r.data ?? [], f = u.status === "running", p = d.find((e) => e.id === (f ? u.library : s)) ?? d.find((e) => e.id === u.library) ?? d[0], m = () => {
		p && V({
			title: q("修复媒体库「{name}」", { name: p.name }),
			body: q("缺时间戳表的片子另存一份修好的头，原文件不动；缺索引的片子重建后替换原文件，") + q("坏原件改名成同目录的隐藏文件（.文件名.peach-original）留着。") + (p.metered ? q("这个库在计费来源上，每修一部都要把片子完整拉一遍。") : ""),
			confirmLabel: q("修复媒体库"),
			onConfirm: async () => {
				await n.start.mutateAsync(p.id);
			}
		});
	}, h = () => void l.run("stop", (e) => ae(_, { stop: !0 }, "POST", e), pt), v = n.outcome, y = $e(f ? u : v ?? o), x = l.error || v?.error || (n.query.error ? q("读不到媒体修复的状态") : "");
	return /* @__PURE__ */ (0, Q.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, Q.jsx)(i, {
			layout: "split",
			label: q("媒体修复"),
			footer: /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)(te, {
				"aria-label": q("媒体库"),
				prefix: q("媒体库"),
				className: "w-48",
				selectedKey: p?.id ?? null,
				isDisabled: f || !d.length,
				onSelectionChange: (e) => {
					e !== null && c(String(e));
				},
				children: d.map((e) => /* @__PURE__ */ (0, Q.jsxs)(ne, {
					id: e.id,
					textValue: e.name,
					children: [/* @__PURE__ */ (0, Q.jsx)(M, { mark: ft(e.icon) }), e.name]
				}, e.id))
			}), f ? /* @__PURE__ */ (0, Q.jsx)(e, {
				onClick: h,
				...B(l.busy === "stop"),
				children: q("停止")
			}) : /* @__PURE__ */ (0, Q.jsx)(e, {
				onClick: m,
				disabled: !p,
				children: q("开始修复")
			})] }),
			children: /* @__PURE__ */ (0, Q.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, Q.jsx)(a, { children: q("媒体修复") }),
					/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "text-body-2-regular text-text-secondary",
						children: T
					}),
					f && u.total ? /* @__PURE__ */ (0, Q.jsx)(C, {
						label: q("修复进度"),
						value: u.checked,
						max: u.total
					}) : null,
					y ? /* @__PURE__ */ (0, Q.jsx)("p", {
						role: "status",
						className: "text-caption-1-regular text-text-secondary",
						children: y
					}) : null
				]
			})
		}), /* @__PURE__ */ (0, Q.jsxs)("div", {
			"aria-live": "polite",
			className: "flex flex-col gap-4 empty:hidden",
			children: [v?.status === "complete" && v.missing_tool ? /* @__PURE__ */ (0, Q.jsx)(b, {
				tone: "warning",
				title: q("缺少 untrunc"),
				action: /* @__PURE__ */ (0, Q.jsx)(e, {
					variant: "ghost",
					size: "small",
					onClick: n.dismiss,
					children: q("关闭提示")
				}),
				children: Ne(v)
			}) : null, x ? /* @__PURE__ */ (0, Q.jsx)(b, {
				tone: "error",
				children: x
			}) : null]
		})]
	});
}
// src/react/data-cleanup/link-check-icon.tsx
function ht({ className: e }) {
	return /* @__PURE__ */ (0, Q.jsxs)("svg", {
		"aria-hidden": !0,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		className: e,
		"data-link-check-icon": "",
		children: [
			/* @__PURE__ */ (0, Q.jsx)("path", { d: "m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" }),
			/* @__PURE__ */ (0, Q.jsx)("path", { d: "m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" }),
			/* @__PURE__ */ (0, Q.jsxs)("g", {
				"data-link-check-rays": "",
				children: [
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M8 2v3" }),
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M2 8h3" }),
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M16 19v3" }),
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M19 16h3" })
				]
			})
		]
	});
}
// src/react/data-cleanup/link-manager.tsx
var gt = K("rotate-cw"), _t = q("站点返回 404 或 410，确认这个地址不存在。"), vt = q("站点拒绝程序访问或一次临时故障都会落在这里。链接保留，可勾选后单独重试。"), yt = q("删除前会逐条重验一次；此操作不可撤销。"), bt = q("暂时无法读取进度，正在重新连接…"), xt = (e) => Number(e || 0).toLocaleString();
function St({ label: e, value: t, note: n }) {
	return /* @__PURE__ */ (0, Q.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-0.5",
		children: [
			/* @__PURE__ */ (0, Q.jsx)("span", {
				className: "text-caption-1-regular leading-5 text-text-secondary",
				children: e
			}),
			/* @__PURE__ */ (0, Q.jsx)("b", {
				className: "text-title-2-semibold font-bold leading-5 tabular-nums text-text-primary",
				children: t
			}),
			n ? /* @__PURE__ */ (0, Q.jsx)("small", {
				className: "text-caption-1-regular leading-5 text-text-secondary",
				children: n
			}) : null
		]
	});
}
function Ct({ title: e, items: t, hint: n, picked: r, onPick: i, children: a, footer: o, confirmed: s = !1 }) {
	if (!t.length) return null;
	let c = [
		{
			id: "entity",
			label: q("Peach 资料"),
			width: 180,
			min: 128,
			value: (e) => e.entity,
			render: (e) => /* @__PURE__ */ (0, Q.jsxs)("a", {
				className: "flex min-w-24 items-center gap-2 text-text-secondary hover:text-text-primary hover:underline",
				href: e.entity_id && e.entity_kind ? de(e.entity_kind, e.entity, e.entity_id) : void 0,
				"data-link-identity": "",
				children: [/* @__PURE__ */ (0, Q.jsx)("span", {
					"data-link-avatar": "",
					className: `relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-quaternary-default text-caption-1-medium text-text-primary ${lt}`,
					"aria-hidden": !0,
					dangerouslySetInnerHTML: { __html: `<span>${fe(De(e.entity))}</span>` + ue({
						kind: e.entity_kind,
						id: e.entity_id,
						hasImage: e.face?.has_image,
						version: e.face?.image_version,
						focus: e.face?.avatar_focus,
						thumb: !0,
						mark: e.entity_kind === "studio" || e.entity_kind === "agency" ? e.id : null
					}) }
				}), /* @__PURE__ */ (0, Q.jsx)("span", {
					className: "min-w-0 wrap-anywhere",
					children: e.entity
				})]
			})
		},
		{
			id: "kind",
			label: q("类型"),
			width: 128,
			value: (e) => f[e.link_kind] || e.link_kind,
			render: (e) => f[e.link_kind] || e.link_kind
		},
		{
			id: "label",
			label: q("链接名称"),
			min: 128,
			value: (e) => e.label || "",
			render: (e) => /* @__PURE__ */ (0, Q.jsx)("span", {
				className: "flex min-w-24 items-center gap-2",
				"data-link-name": "",
				children: /* @__PURE__ */ (0, Q.jsx)("span", {
					className: "min-w-0 wrap-anywhere",
					children: e.label || new URL(e.url).hostname
				})
			})
		},
		{
			id: "note",
			label: q("结果"),
			width: 320,
			min: 192,
			value: (e) => e.note,
			render: (e) => /* @__PURE__ */ (0, Q.jsx)("div", {
				className: "min-w-0 w-full",
				"data-link-result": s ? "gone" : "unclear",
				children: /^(?:HTTP\s+)?[1-5]\d{2}$/.test(e.note.trim()) ? /* @__PURE__ */ (0, Q.jsx)(N, {
					tone: s || /^(?:HTTP\s+)?5\d{2}$/.test(e.note.trim()) ? "error" : "warning",
					"data-link-code": "",
					children: e.note.trim()
				}) : /* @__PURE__ */ (0, Q.jsxs)("div", {
					className: "flex flex-col items-start gap-1",
					children: [/* @__PURE__ */ (0, Q.jsx)(N, {
						tone: s ? "error" : "warning",
						children: q(s ? "地址已失效" : "未取得结论")
					}), /* @__PURE__ */ (0, Q.jsx)(it, {
						text: e.note,
						className: "tabular-nums text-text-secondary"
					})]
				})
			})
		},
		{
			id: "url",
			label: q("地址"),
			width: 360,
			min: 180,
			value: (e) => e.url,
			render: (e) => /* @__PURE__ */ (0, Q.jsxs)("a", {
				href: e.url,
				target: "_blank",
				rel: "noopener noreferrer",
				title: e.url,
				"data-link-address": "",
				className: "flex min-w-0 items-center gap-1 text-text-secondary hover:text-text-primary",
				children: [
					/* @__PURE__ */ (0, Q.jsx)(ct, { linkId: e.id }),
					/* @__PURE__ */ (0, Q.jsx)("span", {
						"data-middle-truncate": !0,
						className: "min-w-0 truncate",
						children: e.url
					}),
					/* @__PURE__ */ (0, Q.jsx)(F, {
						"aria-hidden": !0,
						className: "size-(--icon-inline) shrink-0"
					})
				]
			})
		}
	];
	return /* @__PURE__ */ (0, Q.jsx)("div", {
		className: k,
		"data-link-results": s ? "gone" : "unclear",
		children: /* @__PURE__ */ (0, Q.jsx)(st, {
			label: e,
			items: t,
			columns: c,
			rowId: (e) => String(e.id),
			description: n,
			unit: q("条链接"),
			panel: !1,
			footerActions: o,
			rowLabel: (e) => q("{entity} 的{url}", {
				entity: e.entity,
				url: e.label || e.url
			}),
			selected: r.map(String),
			onSelected: (e) => i(e.map(Number)),
			actions: () => a
		})
	});
}
function wt() {
	let n = Y({
		queryKey: u,
		queryFn: ({ signal: e }) => W(e)
	}), [r, o] = (0, Z.useState)([]), [s, c] = (0, Z.useState)([]), l = J({
		queryKey: p,
		queryFn: ({ signal: e }) => he(e),
		start: Ye,
		onFinish: () => {
			G.invalidateQueries({
				queryKey: u,
				exact: !0
			}), G.invalidateQueries({
				queryKey: d,
				exact: !0
			});
		}
	}), m = J({
		queryKey: d,
		queryFn: ({ signal: e }) => U(e),
		start: Je,
		onStarted: () => {
			l.dismiss(), o([]), c([]);
		}
	}), h = m.job, g = h?.check_id ?? "";
	(0, Z.useEffect)(() => {
		o([]), c([]);
	}, [g]);
	let _ = m.running || m.start.isPending, v = l.running || l.start.isPending, y = h?.status === "complete", x = h?.gone ?? [], S = h?.unclear ?? [], C = y ? S : [], w = x.filter((e) => s.includes(e.id)).map((e) => e.id), T = C.filter((e) => r.includes(e.id)).map((e) => e.id), E = n.data, D = (E?.top_hosts ?? []).slice(0, 3), O = (e) => {
		_ || e && !e.length || m.start.mutate(e ? {
			retry: e,
			checkId: g
		} : {});
	}, A = (e) => {
		!v && x.length && V({
			title: q("删除失效链接"),
			body: q("将删除 {count} 条失效链接。删除前会再次检查，删除后无法恢复。", { count: e?.length ?? x.length }),
			confirmLabel: q("删除失效链接"),
			danger: !0,
			onConfirm: () => l.start.mutateAsync({
				checkId: g,
				ids: e
			})
		});
	}, j = l.outcome, te = m.start.error ?? l.start.error, ne = null, M = null;
	if (j?.status === "failed") M = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: q("链接清理未完成"),
		children: j.error || q("请查看任务记录，核对已处理的链接。")
	});
	else if (j && !x.length && !S.length) M = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "success",
		title: q("完成"),
		children: Re(j)
	});
	else if (te) M = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: q("检查失败"),
		children: H(te)
	});
	else if (m.query.isError && h) M = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "neutral",
		title: q("任务状态"),
		children: bt
	});
	else if (h?.status === "failed") M = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: q("检查失败"),
		children: h.error || q("检查失败")
	});
	else if (h && h.status !== "idle") {
		ne = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [h.status === "running" ? /* @__PURE__ */ (0, Q.jsx)(P, {
			embedded: !0,
			label: le(h),
			value: Math.min(h.checked || 0, h.total || 0),
			total: h.total
		}) : null, v ? /* @__PURE__ */ (0, Q.jsx)(P, {
			embedded: !0,
			label: l.job?.message || q("正在重验并删除失效链接"),
			value: Math.min(l.job?.checked || 0, l.job?.total || 0),
			total: l.job?.total
		}) : null] });
		let t = q("立即重试所选（{length}）", { length: T.length });
		M = y || x.length || S.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
			className: ee,
			children: [
				j?.status === "complete" ? /* @__PURE__ */ (0, Q.jsx)(b, {
					tone: "success",
					title: q("完成"),
					children: Re(j)
				}) : null,
				/* @__PURE__ */ (0, Q.jsx)(Ct, {
					title: q("地址已失效"),
					items: x,
					hint: _t,
					picked: s,
					onPick: c,
					confirmed: !0,
					footer: y && x.length ? /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "mr-auto min-w-0 text-caption-1-regular text-text-secondary",
						children: yt
					}), /* @__PURE__ */ (0, Q.jsx)(e, {
						variant: "danger",
						...B(v),
						onClick: () => A(),
						children: q("删除 {length} 条失效链接", { length: x.length })
					})] }) : null,
					children: /* @__PURE__ */ (0, Q.jsx)(e, {
						variant: "danger",
						size: "small",
						disabled: !y || !w.length,
						...B(v),
						onClick: () => A(w),
						children: q("删除所选（{count}）", { count: w.length })
					})
				}),
				/* @__PURE__ */ (0, Q.jsx)(Ct, {
					title: q("本次未访问成功"),
					items: S,
					hint: vt,
					picked: r,
					onPick: o,
					footer: C.length ? /* @__PURE__ */ (0, Q.jsx)(e, {
						variant: "primary",
						leadingIcon: gt,
						...B(_),
						onClick: () => O(C.map((e) => e.id)),
						children: q("立即重试全部（{length}）", { length: C.length })
					}) : null,
					children: C.length ? /* @__PURE__ */ (0, Q.jsx)(Q.Fragment, { children: /* @__PURE__ */ (0, Q.jsx)(e, {
						variant: "secondary",
						leadingIcon: gt,
						disabled: !T.length,
						...B(_),
						onClick: () => O(T),
						children: t
					}) }) : null
				}),
				y && !x.length && !S.length ? /* @__PURE__ */ (0, Q.jsxs)("p", {
					className: `${k} text-body-regular text-notification-success-foreground`,
					children: ["$", q("全部链接均可访问。")]
				}) : null
			]
		}) : null;
	}
	return /* @__PURE__ */ (0, Q.jsxs)("section", {
		id: "link-manager",
		"aria-labelledby": "link-manager-title",
		className: "flex scroll-mt-20 flex-col gap-4",
		children: [/* @__PURE__ */ (0, Q.jsxs)(i, {
			layout: "stack",
			labelledBy: "link-manager-title",
			footer: /* @__PURE__ */ (0, Q.jsx)(e, {
				"data-link-check": "",
				leadingIcon: ht,
				...B(_),
				onClick: () => O(),
				children: q(_ ? "检查中" : y ? "重新检查" : "检查死链")
			}),
			children: [
				/* @__PURE__ */ (0, Q.jsx)(a, {
					id: "link-manager-title",
					gap: "small",
					children: q("链接管理")
				}),
				n.isError ? /* @__PURE__ */ (0, Q.jsx)(b, {
					tone: "error",
					title: q("链接统计读取失败"),
					children: H(n.error)
				}) : E ? /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsxs)("div", {
					className: "link-stat-grid mt-4 gap-x-8 gap-y-3",
					children: [/* @__PURE__ */ (0, Q.jsx)(St, {
						label: q("链接总数"),
						value: xt(E.total),
						note: q("分布在 {value} 个女优、厂牌与系列", { value: xt(E.entities) })
					}), Object.entries(E.by_kind ?? {}).map(([e, t]) => /* @__PURE__ */ (0, Q.jsx)(St, {
						label: f[e] || e,
						value: xt(t)
					}, e))]
				}), D.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
					className: "mt-4 flex min-w-0 flex-col gap-0.5",
					children: [/* @__PURE__ */ (0, Q.jsx)("span", {
						className: "text-caption-1-regular text-text-secondary",
						children: q("主要站点")
					}), /* @__PURE__ */ (0, Q.jsx)("div", {
						className: "flex min-w-0 flex-wrap gap-x-5 gap-y-2",
						children: D.map(([e, n]) => /* @__PURE__ */ (0, Q.jsxs)("span", {
							"data-top-host": "",
							className: "inline-flex min-w-0 max-w-full items-center gap-1.5",
							children: [/* @__PURE__ */ (0, Q.jsxs)("a", {
								href: `https://${e}`,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "inline-flex min-w-0 items-center gap-1.5 text-body-2-medium text-text-primary",
								children: [
									/* @__PURE__ */ (0, Q.jsx)(ct, { linkId: E.top_host_link_ids?.[e] }),
									/* @__PURE__ */ (0, Q.jsx)("span", {
										className: "min-w-0 wrap-anywhere",
										children: e
									}),
									/* @__PURE__ */ (0, Q.jsx)(F, {
										"aria-hidden": !0,
										className: "size-(--icon-inline) shrink-0"
									})
								]
							}), /* @__PURE__ */ (0, Q.jsx)(t, {
								variant: "caption",
								color: "neutral",
								children: /* @__PURE__ */ (0, Q.jsx)("span", {
									className: "tabular-nums",
									children: xt(n)
								})
							})]
						}, e))
					})]
				}) : null] }) : null,
				/* @__PURE__ */ (0, Q.jsx)("div", {
					"aria-live": "polite",
					className: "mt-4 flex flex-col gap-3 empty:hidden",
					children: ne
				})
			]
		}), /* @__PURE__ */ (0, Q.jsx)("div", {
			"aria-live": "polite",
			className: "empty:hidden",
			children: M
		})]
	});
}
// src/react/data-cleanup/organize-card.tsx
var Tt = (e, t) => q("将整理「{name}」{value}，清理特殊符号与乱码，并按已填模板改名或移动。目标已存在的行会整行跳过。", {
	name: e,
	value: t ? q("的「{path}」及其子目录", { path: t }) : q("上的文件名与目录")
}) + q("这一批可以从「回滚上一批」整批退回。"), Et = q("将把上一批整理动过的文件退回整理前的名字与位置，数据库路径跟着退回。") + q("退回后这一批不再出现在这里。"), Dt = 8;
function Ot({ plan: e }) {
	return /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)("ol", {
		className: "mt-2 flex min-w-0 flex-col gap-1",
		children: e.rows.slice(0, Dt).map((e) => /* @__PURE__ */ (0, Q.jsxs)("li", {
			className: "flex min-w-0 items-center gap-2 text-caption-1-regular text-text-secondary",
			children: [
				/* @__PURE__ */ (0, Q.jsx)("span", {
					"data-middle-truncate": !0,
					title: e.current_path,
					className: "min-w-0 truncate",
					children: z(e.current_path)
				}),
				/* @__PURE__ */ (0, Q.jsx)("span", {
					"aria-hidden": !0,
					children: "→"
				}),
				/* @__PURE__ */ (0, Q.jsx)("span", {
					"data-middle-truncate": !0,
					title: e.target_path,
					className: "min-w-0 truncate text-text-primary",
					children: z(e.target_path)
				})
			]
		}, e.current_path))
	}), e.truncated || e.rows.length > Dt ? /* @__PURE__ */ (0, Q.jsx)("p", {
		className: "text-caption-1-regular text-text-secondary",
		children: q("只列出前 8 行，完整计划在计划 CSV 里。")
	}) : null] });
}
function kt({ toast: t, failure: r }) {
	let o = Y({
		queryKey: x,
		queryFn: ({ signal: e }) => ve(e)
	}), l = o.data, u = l?.locations ?? [], [d, f] = (0, Z.useState)(""), p = u.some((e) => e.location === d) ? d : u[0]?.location ?? "", h = l?.templates?.[p], [g, _] = (0, Z.useState)(null), v = g?.location === p ? g : {
		location: p,
		file: h?.file ?? "",
		dir: h?.dir ?? ""
	}, S = (e) => {
		_({
			...v,
			...e
		}), I.reset();
	}, [C, w] = (0, Z.useState)({
		location: "",
		path: ""
	}), T = C.location === p ? C.path : "", E = (0, Z.useRef)({
		location: p,
		path: T
	});
	E.current = {
		location: p,
		path: T
	};
	let [D, O] = (0, Z.useState)(null), ee = (0, Z.useRef)(null), k = (0, Z.useRef)(null), A = (0, Z.useRef)(null), j = Y({
		queryKey: [
			"organize-example",
			v.file,
			v.dir
		],
		queryFn: ({ signal: e }) => ye(v.file, v.dir, e),
		enabled: !!l
	}), [N, re] = (0, Z.useState)("file"), F = (0, Z.useRef)(!1), ie = (0, Z.useRef)(null);
	(0, Z.useLayoutEffect)(() => {
		let e = ie.current;
		if (!e) return;
		ie.current = null;
		let t = (e.field === "file" ? ee : k).current;
		t?.focus(), t?.setSelectionRange(e.caret, e.caret);
	});
	let ae = () => ({
		location: p,
		path: T.trim(),
		file_template: v.file.trim(),
		dir_template: v.dir.trim()
	}), I = tt({
		mutationFn: Le,
		onError: (e) => {
			let t = /整理路径/.test(H(e)) ? "path" : n.test(H(e)) ? "dir" : "file";
			O(t), (t === "path" ? A : t === "dir" ? k : ee).current?.focus();
		}
	}), L = tt({
		mutationFn: ({ initial: e }) => Fe(e),
		onSuccess: (e, t) => {
			e.path && t.location === E.current.location && t.path === E.current.path && (w({
				location: t.location,
				path: e.path
			}), O(null), I.reset(), A.current?.focus());
		}
	}), R = J({
		queryKey: x,
		queryFn: ({ signal: e }) => ve(e),
		start: Xe,
		jobOf: (e) => e,
		withJob: nt,
		onStarted: () => I.reset(),
		onFinish: (e) => {
			if (G.invalidateQueries({
				queryKey: x,
				exact: !0
			}), e.status !== "complete") return;
			let { text: n, failed: i } = Pe(e);
			i ? r(q("整理文件"), Error(q("{failed} 行未能处理", { failed: i }))) : t(n.replace(/。$/, ""));
		}
	}), oe = R.running || R.start.isPending, se = JSON.stringify(I.variables) === JSON.stringify(ae()), z = se ? I.data : void 0, ce = Number(z?.counts?.change || 0), le = m[p] || p, ue = (e) => {
		S(e), O(null), I.reset();
	}, de = (e) => {
		let t = (N === "file" ? ee : k).current, n = v[N], r = F.current ? t?.selectionStart ?? n.length : n.length, i = F.current ? t?.selectionEnd ?? r : r, a = `{${e}}`;
		ie.current = {
			field: N,
			caret: r + a.length
		}, ue({ [N]: n.slice(0, r) + a + n.slice(i) });
	}, fe = () => {
		I.isPending || oe || !p || (R.dismiss(), R.start.reset(), O(null), I.mutate(ae()));
	}, pe = () => {
		let e = I.variables;
		e && z && ce && V({
			title: q("整理文件"),
			body: Tt(le, e.path),
			confirmLabel: q("整理文件"),
			onConfirm: async () => {
				await R.start.mutateAsync({
					kind: "apply",
					request: e
				}), He({
					...l?.templates ?? {},
					[e.location]: {
						file: e.file_template,
						dir: e.dir_template
					}
				});
			}
		});
	}, me = () => void V({
		title: q("回滚上一批整理"),
		body: Et,
		confirmLabel: q("回滚整理"),
		onConfirm: () => R.start.mutateAsync({ kind: "rollback" })
	}), U = null, he = !!ce && !oe && !R.outcome, W = R.job, ge = R.outcome;
	if (W?.status === "running") {
		let e = W.message || W.stage || q("正在整理文件");
		U = /* @__PURE__ */ (0, Q.jsx)(P, {
			embedded: !0,
			label: e,
			value: Math.min(W.checked || 0, W.total || 0),
			total: W.total
		});
	} else if (ge?.status === "failed") U = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: q("文件整理未完成"),
		children: ge.error || q("请查看任务记录，核对已处理的文件。")
	});
	else if (ge) {
		let { text: e, failed: t } = Pe(ge);
		U = /* @__PURE__ */ (0, Q.jsx)(b, {
			tone: t ? "warning" : "success",
			title: q(t ? "部分完成" : "整理结果"),
			children: e
		});
	} else R.start.isError ? U = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: q("整理失败"),
		children: H(R.start.error)
	}) : I.isPending ? U = /* @__PURE__ */ (0, Q.jsx)(P, {
		embedded: !0,
		label: q("正在核对整理计划")
	}) : I.isError && se ? U = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: q("整理预览失败"),
		children: H(I.error)
	}) : z && (U = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "neutral",
		title: q("预览结果"),
		children: Ie(z)
	}), ce ? /* @__PURE__ */ (0, Q.jsx)(Ot, { plan: z }) : null] }));
	return /* @__PURE__ */ (0, Q.jsxs)(i, {
		layout: "stack",
		id: "organize",
		labelledBy: "cleanup-organize-title",
		attributes: { "data-cleanup-organize": "" },
		footer: /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [
			l?.last_batch ? /* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "secondary",
				...B(oe),
				onClick: me,
				children: q("回滚上一批")
			}) : null,
			/* @__PURE__ */ (0, Q.jsx)(e, {
				variant: he ? "secondary" : "primary",
				disabled: !u.length || oe,
				...B(I.isPending),
				onClick: fe,
				children: q("预览")
			}),
			he ? /* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "primary",
				onClick: pe,
				children: q("执行整理")
			}) : null
		] }),
		children: [
			/* @__PURE__ */ (0, Q.jsx)(a, {
				id: "cleanup-organize-title",
				gap: "medium",
				children: q("整理")
			}),
			/* @__PURE__ */ (0, Q.jsx)("p", {
				className: "text-body-regular text-text-secondary",
				children: q("清理文件名中的特殊符号与乱码，也可按模板改名并归入目录。先预览，确认后执行；执行过的一批可以整批退回。")
			}),
			o.isError ? /* @__PURE__ */ (0, Q.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, Q.jsx)(b, {
					tone: "error",
					title: q("整理配置读取失败"),
					children: H(o.error)
				})
			}) : null,
			/* @__PURE__ */ (0, Q.jsxs)("div", {
				className: "mt-3 flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, Q.jsxs)("div", {
						"data-organize-scope": !0,
						className: "flex min-w-0 flex-wrap items-start gap-2",
						children: [u.length ? /* @__PURE__ */ (0, Q.jsx)(te, {
							"aria-label": q("整理哪个来源"),
							prefix: q("来源"),
							className: "w-fit min-w-25",
							selectedKey: p || null,
							onSelectionChange: (e) => {
								e !== null && (f(String(e)), w({
									location: String(e),
									path: ""
								}), O(null), I.reset(), L.reset(), F.current = !1);
							},
							children: u.map((e) => /* @__PURE__ */ (0, Q.jsxs)(ne, {
								id: e.location,
								textValue: m[e.location] || e.location,
								children: [/* @__PURE__ */ (0, Q.jsx)(M, { mark: y[e.location] || "database" }), m[e.location] || e.location]
							}, e.location))
						}) : null, /* @__PURE__ */ (0, Q.jsxs)("div", {
							className: "flex min-w-0 basis-64 flex-1 items-start gap-2",
							children: [/* @__PURE__ */ (0, Q.jsx)(c, {
								"aria-label": q("整理路径"),
								className: "min-w-0 flex-1",
								placeholder: q("留空整理整个来源"),
								name: "organize-path",
								autoComplete: "off",
								spellCheck: "false",
								value: T,
								ref: A,
								isInvalid: D === "path",
								onChange: (e) => {
									w({
										location: p,
										path: e
									}), O(null), I.reset(), L.reset();
								}
							}), /* @__PURE__ */ (0, Q.jsx)(s, {
								icon: ut,
								"aria-label": q("选择整理路径"),
								...B(L.isPending),
								onClick: () => L.mutate({
									initial: T || u.find((e) => e.location === p)?.roots[0] || "",
									location: p,
									path: T
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "text-caption-1-regular text-text-secondary",
						children: q("指定路径时包含子目录，目录模板以该路径为起点。模板均留空时只清理文件名。")
					}),
					L.isError ? /* @__PURE__ */ (0, Q.jsxs)(b, {
						tone: "error",
						title: q("目录选择失败"),
						children: [H(L.error), q("；也可直接输入路径。")]
					}) : null,
					/* @__PURE__ */ (0, Q.jsx)(c, {
						label: q("文件名模板"),
						placeholder: "{code}[ {title}]",
						value: v.file,
						ref: ee,
						spellCheck: "false",
						isInvalid: D === "file",
						onFocus: () => {
							re("file"), F.current = !0;
						},
						onChange: (e) => ue({ file: e })
					}),
					/* @__PURE__ */ (0, Q.jsx)(c, {
						label: q("目录模板"),
						placeholder: q("留空表示原地改名"),
						value: v.dir,
						ref: k,
						spellCheck: "false",
						isInvalid: D === "dir",
						onFocus: () => {
							re("dir"), F.current = !0;
						},
						onChange: (e) => ue({ dir: e })
					}),
					l?.presets?.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
						className: "flex flex-col gap-2",
						role: "group",
						"aria-label": q("套用模板"),
						children: [/* @__PURE__ */ (0, Q.jsx)("p", {
							className: "text-caption-1-medium text-text-secondary",
							children: q("套用模板")
						}), /* @__PURE__ */ (0, Q.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: l.presets.map((t) => /* @__PURE__ */ (0, Q.jsx)(e, {
								variant: "secondary",
								size: "small",
								title: t.example || Me(t.label),
								className: "max-w-full [&>span]:min-w-0 [&>span]:shrink",
								onClick: () => {
									ue({
										file: t.file,
										dir: t.dir
									}), F.current = !1;
								},
								children: /* @__PURE__ */ (0, Q.jsx)("span", {
									className: "truncate",
									children: Me(t.label)
								})
							}, t.label))
						})]
					}) : null,
					/* @__PURE__ */ (0, Q.jsxs)("p", {
						"aria-live": "polite",
						"aria-busy": j.isFetching,
						"data-organize-example": "",
						className: "text-caption-1-regular text-text-secondary",
						children: [q("路径示例："), /* @__PURE__ */ (0, Q.jsx)("code", {
							className: "wrap-anywhere",
							children: j.data?.example || j.data?.error || (j.isError ? H(j.error) : q("正在预览…"))
						})]
					}),
					l?.placeholders?.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
						className: "flex flex-col gap-2",
						role: "group",
						"aria-label": q("插入参数"),
						children: [/* @__PURE__ */ (0, Q.jsxs)("p", {
							className: "text-caption-1-regular text-text-secondary",
							"aria-live": "polite",
							children: [
								/* @__PURE__ */ (0, Q.jsx)("strong", {
									className: "text-caption-1-semibold text-text-primary",
									children: q("插入参数")
								}),
								q("（到"),
								q(N === "file" ? "文件名模板" : "目录模板"),
								"）"
							]
						}), /* @__PURE__ */ (0, Q.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: l.placeholders.map((t) => /* @__PURE__ */ (0, Q.jsx)(e, {
								variant: "ghost",
								size: "small",
								"aria-label": `${t.label} {${t.key}}`,
								onClick: () => de(t.key),
								children: /* @__PURE__ */ (0, Q.jsxs)("span", {
									className: "inline-flex flex-wrap items-center gap-x-1.5",
									children: [/* @__PURE__ */ (0, Q.jsx)("code", { children: `{${t.key}}` }), /* @__PURE__ */ (0, Q.jsx)("span", {
										className: "text-text-secondary",
										children: t.label
									})]
								})
							}, t.key))
						})]
					}) : null,
					/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "text-caption-1-regular leading-4.5 text-text-secondary",
						children: q("点击参数插入光标处，选中文字可替换。方括号里的内容在字段为空时整段省略。")
					})
				]
			}),
			/* @__PURE__ */ (0, Q.jsx)("div", {
				"aria-live": "polite",
				className: "mt-3 flex flex-col gap-2 empty:hidden",
				children: U
			})
		]
	});
}
// src/react/data-cleanup/orphan-records-card.tsx
var At = K("play"), jt = () => G.invalidateQueries({
	queryKey: S,
	exact: !0
});
function Mt({ item: t, toast: n }) {
	let [r, i] = (0, Z.useState)(t.candidates[0]?.id ?? null), a = tt({
		mutationFn: () => se(t.id, Number(r)),
		onSuccess: () => {
			let e = t.candidates.find((e) => e.id === r);
			n(q("已将「{name}」的个人记录转移到「{value}」", {
				name: t.name,
				value: e?.name ?? q("所选文件")
			})), jt();
		},
		onError: (e) => n(H(e))
	}), o = tt({
		mutationFn: () => Be(t.id),
		onSuccess: (e) => {
			n(e.blocked.length ? q("「{name}」的文件已恢复，记录未删除；下次扫描后恢复为在库状态", { name: t.name }) : q("已删除「{name}」的作品记录及个人记录", { name: t.name })), jt();
		}
	}), s = () => {
		V({
			title: q("删除记录"),
			body: q("将删除「{name}」的作品记录{value}。此操作不可撤销。", {
				name: t.name,
				value: Ve(t.records) ? q("及其个人记录（{records}）", { records: Ve(t.records) }) : ""
			}),
			confirmLabel: q("删除记录"),
			danger: !0,
			onConfirm: () => o.mutateAsync()
		});
	}, c = a.isPending || o.isPending;
	return /* @__PURE__ */ (0, Q.jsxs)("span", {
		className: "flex min-w-0 flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "danger",
				size: "small",
				...B(c),
				onClick: s,
				children: q("删除记录")
			}),
			t.candidates.length ? /* @__PURE__ */ (0, Q.jsx)(te, {
				"aria-label": q("选择接收 {name} 个人记录的文件", { name: t.name }),
				prefix: q("接收"),
				className: "w-52",
				selectedKey: r,
				onSelectionChange: (e) => {
					e !== null && i(Number(e));
				},
				children: t.candidates.map((e) => /* @__PURE__ */ (0, Q.jsx)(ne, {
					id: e.id,
					textValue: ce(e),
					children: ce(e)
				}, e.id))
			}) : null,
			t.candidates.length ? /* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "primary",
				size: "small",
				disabled: r === null,
				...B(c),
				onClick: () => a.mutate(),
				children: q("转移记录")
			}) : null
		]
	});
}
function Nt({ item: e }) {
	return /* @__PURE__ */ (0, Q.jsxs)("span", {
		className: "flex min-w-0 items-center gap-3",
		children: [/* @__PURE__ */ (0, Q.jsxs)("span", {
			className: "relative inline-grid aspect-16/10 w-24 flex-none place-items-center max-cleanup-tight:hidden overflow-hidden rounded-lg border border-separator-border bg-background-tertiary-default text-text-tertiary",
			children: [/* @__PURE__ */ (0, Q.jsx)(At, {
				"aria-hidden": !0,
				className: "size-5"
			}), e.has_thumb ? /* @__PURE__ */ (0, Q.jsx)("img", {
				src: `/thumb?id=${e.id}&c=4`,
				alt: "",
				loading: "lazy",
				onError: (e) => e.currentTarget.remove(),
				className: "absolute inset-0 size-full object-contain"
			}) : null]
		}), /* @__PURE__ */ (0, Q.jsxs)("span", {
			className: "flex min-w-0 flex-1 flex-col gap-0.5",
			children: [/* @__PURE__ */ (0, Q.jsx)("span", {
				title: e.name,
				className: "truncate text-body-regular text-text-primary",
				children: e.name
			}), /* @__PURE__ */ (0, Q.jsx)("small", {
				className: "truncate text-caption-1-regular text-text-secondary",
				children: [e.code, m[e.location] || e.location].filter(Boolean).join(" · ")
			})]
		})]
	});
}
function Pt({ toast: t }) {
	let [n, r] = (0, Z.useState)([]), o = Y({
		queryKey: S,
		queryFn: ({ signal: e }) => be(e)
	}), s = o.data?.items ?? [], c = tt({
		mutationFn: (e) => Be(e),
		onSuccess: (e) => {
			t(q("已删除 {purged} 条作品记录及其个人记录{value}", {
				purged: e.purged,
				value: e.blocked.length ? q("；{blocked} 条文件已恢复，记录未删除", { blocked: e.blocked.length }) : ""
			})), r([]), jt();
		}
	}), l = (e) => void V({
		title: q("删除所选记录"),
		body: q("将删除以下 {length} 条作品记录及其全部个人记录。此操作不可撤销。", { length: e.length }),
		items: e.map((e) => e.name),
		confirmLabel: q("删除所选记录"),
		danger: !0,
		onConfirm: () => c.mutateAsync(e.map((e) => e.id))
	}), u = [
		{
			id: "item",
			label: q("作品"),
			width: 480,
			min: 320,
			value: (e) => e.name,
			render: (e) => /* @__PURE__ */ (0, Q.jsx)(Nt, { item: e })
		},
		{
			id: "records",
			label: q("个人记录"),
			width: 176,
			min: 144,
			value: (e) => Ve(e.records),
			render: (e) => /* @__PURE__ */ (0, Q.jsx)("span", {
				className: "block min-w-0 whitespace-normal wrap-anywhere",
				children: Ve(e.records) || q("无")
			})
		},
		{
			id: "target",
			label: q("操作"),
			width: s.some((e) => e.candidates.length) ? 360 : 128,
			min: 128,
			value: (e) => e.candidates.length,
			render: (e) => /* @__PURE__ */ (0, Q.jsx)(Mt, {
				item: e,
				toast: t
			})
		}
	];
	return !o.isError && !s.length ? null : /* @__PURE__ */ (0, Q.jsx)("section", {
		id: "orphan-records",
		"aria-labelledby": "orphan-records-title",
		className: "flex scroll-mt-20 flex-col gap-4",
		children: o.isError ? /* @__PURE__ */ (0, Q.jsxs)(i, {
			layout: "stack",
			labelledBy: "orphan-records-title",
			children: [/* @__PURE__ */ (0, Q.jsx)(a, {
				id: "orphan-records-title",
				children: q("文件已丢失的记录")
			}), /* @__PURE__ */ (0, Q.jsx)(b, {
				tone: "error",
				title: q("读取文件已丢失的记录失败"),
				children: H(o.error)
			})]
		}) : /* @__PURE__ */ (0, Q.jsx)(st, {
			label: q("文件已消失的作品"),
			items: s,
			columns: u,
			title: q("文件已丢失的记录"),
			titleId: "orphan-records-title",
			unit: q("条作品"),
			description: q("这些作品的源文件已删除，喜欢、稍后看、播放列表与观看历史仍保留。选择替代文件后，这些记录会转移到该文件，旧作品记录随之删除。"),
			rowId: (e) => String(e.id),
			rowLabel: (e) => e.name,
			selected: n,
			onSelected: r,
			actions: (t) => /* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "danger",
				size: "small",
				disabled: !t.length,
				...B(c.isPending),
				onClick: () => l(t),
				children: q("删除所选记录（{length}）", { length: t.length })
			})
		})
	});
}
// src/react/data-cleanup/resource-sync-card.tsx
var Ft = K("git-compare"), It = K("rotate-cw"), Lt = q("暂时无法读取进度，正在重新连接…"), Rt = q("清理失效条目"), zt = "inline-grid w-full grid-flow-col auto-cols-fr gap-4 max-plain-stat-pair:grid-flow-row max-plain-stat-pair:grid-cols-2 max-plain-stat-single:grid-cols-1", $ = (e) => Number(e || 0).toLocaleString();
function Bt({ scan: e, partial: t = !1 }) {
	let n = e.cache ?? {
		files: 0,
		bytes: 0
	};
	return /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)("div", {
		className: zt,
		children: (e.sources ?? []).map((e) => /* @__PURE__ */ (0, Q.jsxs)("article", {
			className: ot(),
			children: [/* @__PURE__ */ (0, Q.jsx)(X, {
				label: j[e.location] || q("媒体来源"),
				mark: /* @__PURE__ */ (0, Q.jsx)(M, { mark: y[e.location] ?? "database" }),
				aside: /* @__PURE__ */ (0, Q.jsx)(dt, {
					online: e.online,
					children: e.online ? q("可访问") : q("离线")
				}),
				figure: e.online ? q("{count} 项", { count: $(e.missing) }) : "—",
				meta: e.online ? qe(e) : q("{sourceMeta} · 本次已跳过", { sourceMeta: qe(e) }),
				wrapMeta: !0
			}), e.online && e.unreadable > 0 ? /* @__PURE__ */ (0, Q.jsx)("span", {
				className: "self-start",
				children: /* @__PURE__ */ (0, Q.jsxs)(N, {
					tone: "warning",
					children: [
						$(e.unreadable),
						" ",
						q("个目录未读取")
					]
				})
			}) : null]
		}, e.location))
	}), !t && /* @__PURE__ */ (0, Q.jsxs)("div", {
		className: zt,
		children: [
			/* @__PURE__ */ (0, Q.jsx)("article", {
				className: ot(),
				children: /* @__PURE__ */ (0, Q.jsx)(X, {
					label: q("待永久删除"),
					figure: q("{value} 项", { value: $(ze(e)) }),
					meta: q("文件已不在盘上，含回收站")
				})
			}),
			/* @__PURE__ */ (0, Q.jsx)("article", {
				className: ot(),
				children: /* @__PURE__ */ (0, Q.jsx)(X, {
					label: q("将标为已消失"),
					figure: q("{value} 项", { value: $(e.vanish) }),
					meta: q("带个人记录，记录留着")
				})
			}),
			/* @__PURE__ */ (0, Q.jsx)("article", {
				className: ot(),
				children: /* @__PURE__ */ (0, Q.jsx)(X, {
					label: q("空文件夹"),
					figure: q("{value} 个", { value: $(e.empty) }),
					meta: q("保留来源根目录")
				})
			}),
			/* @__PURE__ */ (0, Q.jsx)("article", {
				className: ot(),
				children: /* @__PURE__ */ (0, Q.jsx)(X, {
					label: q("可清理的缓存"),
					figure: q("{value} 个", { value: $(n.files) }),
					meta: n.files ? Oe(n.bytes) : ""
				})
			})
		]
	})] });
}
function Vt({ toast: t }) {
	let n = J({
		queryKey: D,
		queryFn: ({ signal: e }) => Ce(e),
		start: Ze,
		onFinish: (e) => {
			if (G.invalidateQueries({
				queryKey: re,
				exact: !0
			}), G.invalidateQueries({
				queryKey: O,
				exact: !0
			}), e.status !== "complete") return;
			let { done: n, left: r } = L(e);
			r ? t(q("已完成 {value} 项，{value2} 项没有处理", {
				value: $(n),
				value2: $(r)
			}), { warning: !0 }) : t(q("已清理失效条目"));
		}
	}), r = J({
		queryKey: O,
		queryFn: ({ signal: e }) => we(e),
		start: Qe,
		onStarted: () => n.dismiss()
	}), o = r.job, s = r.running || r.start.isPending, c = n.running || n.start.isPending, l = o?.status === "complete" || o?.status === "failed", u = q(s ? "扫描中" : l ? "重新扫描" : "检查文件"), d = (e) => void V({
		title: Rt,
		body: I(e),
		confirmLabel: Rt,
		danger: !0,
		onConfirm: () => n.start.mutateAsync(e.scan_id || "")
	}), f = n.outcome, p = (e) => {
		let t = L(e).left > 0;
		return /* @__PURE__ */ (0, Q.jsx)(b, {
			tone: t ? "warning" : "success",
			title: q(t ? "部分完成" : "清理结果"),
			children: oe(e, Oe)
		});
	}, m = null, h = null;
	if (f?.status === "failed") h = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: q("资源清理未完成"),
		children: f.error || q("请查看任务记录，核对已处理的文件。")
	});
	else if (f) h = p(f);
	else if (n.running) m = /* @__PURE__ */ (0, Q.jsx)(P, {
		embedded: !0,
		label: n.job?.message || q("正在复核并清理失效条目")
	});
	else if (r.start.isError) h = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: q("扫描失败"),
		children: H(r.start.error)
	});
	else if (r.query.isError && o) h = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "neutral",
		title: q("任务状态"),
		children: Lt
	});
	else if (o?.status === "running") {
		let e = Ke(o);
		m = /* @__PURE__ */ (0, Q.jsx)(P, {
			embedded: !0,
			label: e,
			value: o.completed_sources,
			total: o.total_sources
		}), o.sources?.length && (h = /* @__PURE__ */ (0, Q.jsx)(Bt, {
			scan: o,
			partial: !0
		}));
	} else if (o?.status === "failed") h = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [o.sources?.length ? /* @__PURE__ */ (0, Q.jsx)(Bt, {
		scan: o,
		partial: !0
	}) : null, /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: q("扫描失败"),
		children: o.error || q("后台扫描失败")
	})] });
	else if (o?.status === "complete" && o.applied) h = n.job?.status === "complete" ? p(n.job) : /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "neutral",
		title: q("清理结果"),
		children: q("这次检查的结果已经清理，重新扫描可再核对。")
	});
	else if (o?.status === "complete") {
		let t = ke(o);
		h = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)(Bt, { scan: o }), t ? /* @__PURE__ */ (0, Q.jsx)(b, {
			tone: "neutral",
			title: q("清理内容"),
			action: /* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "danger",
				...B(c),
				onClick: () => d(o),
				children: c ? q("正在复核并清理…") : Rt
			}),
			children: R(o)
		}) : /* @__PURE__ */ (0, Q.jsx)("p", {
			className: "mr-auto text-body-regular text-notification-success-foreground",
			children: q("已检查可访问的来源，没有待清理的记录、空文件夹或缓存。")
		})] });
	}
	return n.start.isError && !f && (h = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [h, /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: q("清理失败"),
		children: H(n.start.error)
	})] })), /* @__PURE__ */ (0, Q.jsxs)("section", {
		id: "resource-sync",
		"aria-labelledby": "resource-sync-title",
		className: "flex scroll-mt-20 flex-col gap-4",
		children: [/* @__PURE__ */ (0, Q.jsxs)(i, {
			layout: "split",
			labelledBy: "resource-sync-title",
			footer: /* @__PURE__ */ (0, Q.jsx)(e, {
				"data-resource-scan": !0,
				leadingIcon: l && !s ? It : Ft,
				...B(s),
				onClick: () => {
					s || r.start.mutate();
				},
				children: u
			}),
			children: [
				/* @__PURE__ */ (0, Q.jsx)(a, {
					id: "resource-sync-title",
					gap: "small",
					children: q("资源同步")
				}),
				/* @__PURE__ */ (0, Q.jsx)("p", {
					className: "max-w-190 text-body-2-regular leading-5 text-text-secondary",
					children: q("按馆藏记录逐条查找本地磁盘与网盘上的文件，列出文件已不存在的记录、空文件夹，以及不再被引用的缓存。")
				}),
				/* @__PURE__ */ (0, Q.jsx)("div", {
					"aria-live": "polite",
					className: "mt-4 empty:hidden",
					children: m
				})
			]
		}), /* @__PURE__ */ (0, Q.jsx)("div", {
			"aria-live": "polite",
			className: "flex flex-col gap-4 empty:hidden",
			children: h
		})]
	});
}
// src/react/data-cleanup/data-cleanup-page.tsx
function Ht(e, t) {
	return e.data === void 0 ? { figure: e.isError ? q("读取失败") : "—" } : t(e.data);
}
function Ut({ section: e, label: t, icon: n, value: r, open: i }) {
	return /* @__PURE__ */ (0, Q.jsx)("button", {
		type: "button",
		className: ot({ interactive: !0 }),
		"data-cleanup-go": e,
		onClick: () => i(e),
		children: /* @__PURE__ */ (0, Q.jsx)(X, {
			label: t,
			icon: n,
			figure: r.figure,
			meta: r.meta
		})
	});
}
var Wt = K("square-check-big"), Gt = K("sparkles"), Kt = K("file-stack"), qt = K("file-archive"), Jt = K("trash"), Yt = [
	A,
	w,
	r
], Xt = () => {
	for (let e of Yt) G.invalidateQueries({
		queryKey: e,
		exact: !0
	});
};
function Zt({ toast: e, failure: t, open: n }) {
	let i = Y({
		queryKey: A,
		queryFn: ({ signal: e }) => Te(e)
	}), a = Y({
		queryKey: w,
		queryFn: ({ signal: e }) => xe(e)
	}), o = Y({
		queryKey: r,
		queryFn: ({ signal: e }) => pe(e)
	}), s = Y({
		queryKey: l,
		queryFn: ({ signal: e }) => me(e)
	}), c = Y({
		queryKey: re,
		queryFn: ({ signal: e }) => Ee(e)
	}), u = Y({
		queryKey: v,
		queryFn: ({ signal: e }) => _e(e)
	}), d = (t) => e(t);
	return /* @__PURE__ */ (0, Q.jsxs)(rt, { children: [
		/* @__PURE__ */ (0, Q.jsxs)("div", {
			className: at,
			children: [
				/* @__PURE__ */ (0, Q.jsx)(Ut, {
					section: "review",
					label: q("人工复核"),
					icon: Wt,
					open: n,
					value: Ht(i, Ge)
				}),
				/* @__PURE__ */ (0, Q.jsx)(Ut, {
					section: "quality",
					label: q("高清版"),
					icon: Gt,
					open: n,
					value: Ht(a, (e) => ({ figure: q("{value} 个待升级", { value: Number(e.total || 0).toLocaleString() }) }))
				}),
				/* @__PURE__ */ (0, Q.jsx)(Ut, {
					section: "duplicates",
					label: q("重复文件"),
					icon: Kt,
					open: n,
					value: Ht(o, (e) => Number(e.total || 0) ? {
						figure: q("{value} 组 · {value2} 个文件", {
							value: Number(e.total).toLocaleString(),
							value2: Number(e.files || 0).toLocaleString()
						}),
						meta: q("可回收 {value}", { value: Oe(e.reclaimable || 0) })
					} : { figure: q("没有重复内容") })
				}),
				/* @__PURE__ */ (0, Q.jsx)(Ut, {
					section: "ads",
					label: q("垃圾文件"),
					icon: qt,
					open: n,
					value: Ht(s, (e) => ({
						figure: q("{value} 个待判断", { value: Number(e.pending_total || 0).toLocaleString() }),
						meta: je(e)
					}))
				}),
				/* @__PURE__ */ (0, Q.jsx)(Ut, {
					section: "trash",
					label: q("回收站"),
					icon: Jt,
					open: n,
					value: Ht(c, (e) => ({
						figure: q("{value} 项在回收站", { value: Number(e.total || 0).toLocaleString() }),
						meta: e.total ? q("占用 {value}", { value: Oe(e.bytes || 0) }) : ""
					}))
				})
			]
		}),
		/* @__PURE__ */ (0, Q.jsxs)("div", {
			className: "flex flex-col gap-4 max-cleanup-tight:gap-3",
			children: [
				/* @__PURE__ */ (0, Q.jsx)("div", {
					id: "libraryProcessing",
					className: "scroll-mt-20",
					children: /* @__PURE__ */ (0, Q.jsx)(h, {
						toast: d,
						monitor: !0,
						onComplete: Xt
					})
				}),
				/* @__PURE__ */ (0, Q.jsx)("div", {
					id: "mediaRepair",
					children: /* @__PURE__ */ (0, Q.jsx)(mt, { toast: d })
				}),
				/* @__PURE__ */ (0, Q.jsx)(kt, {
					toast: d,
					failure: t
				})
			]
		}),
		/* @__PURE__ */ (0, Q.jsx)(wt, {}),
		/* @__PURE__ */ (0, Q.jsx)(Pt, { toast: d }),
		Ae(u.data) ? /* @__PURE__ */ (0, Q.jsx)(Vt, { toast: e }) : null
	] });
}
export { Zt as DataCleanupPage };

//# debugId=81ff8cd0-9e71-4cb2-a6b2-7ae4473452e9