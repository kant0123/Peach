(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "b337e59c-4db4-4262-bea4-7aee52e68d43", e._sentryDebugIdIdentifier = "sentry-dbid-b337e59c-4db4-4262-bea4-7aee52e68d43");
	} catch {}
})();
import { $fe21c36db05242bb$export$d7b12c4107be0d61 as e, ArtSlot as t, Button as n, ButtonLink as r, Chip as i, CloudDownloadDialog as a, DISCOVERY_SORTS as o, DOWNLOADS_KEY as s, DOWNLOADS_URL as c, E3 as l, EmptyFocusButton as u, EmptyState as d, FilterGlassRows as f, FilterIconButton as p, FilterPill as m, GlassPill as h, Help as g, Input as _, JAV_LAYOUTS as v, JAV_RECOMMENDATION_GRID as ee, JavHeader as y, LibraryShortcuts as te, M6 as b, Note as x, PHASES as S, Pagination as C, SEGMENT as w, SEGMENTED_TRACK as T, SegmentedRadioGroup as E, Segments as ne, SortKeys as re, SourceAvatar as ie, TaskProgress as ae, WANTS_KEY as oe, WantMagnets as D, Wt as se, __toESM as ce, addWant as le, apiGet as O, appSettingsStore as ue, avatarInner as k, busyProps as A, cachedMagnetStates as j, cardClass as M, cardRatio as de, coverUrl as fe, discoveryArtwork as pe, discoveryKey as me, discoveryScore as he, entityPath as ge, errorMessage as N, fetchDiscoveries as _e, fetchWants as ve, gridLayout as ye, invalidateWants as P, javContentSkeleton as be, javLayout as xe, javTagSkeleton as Se, pageWindow as F, peachHistory$1 as I, qE as L, recommendationScore as Ce, relayoutCovers as we, removeWants as R, require_jsx_runtime as z, require_react as B, resetWants as V, searchNote as H, shellNavigate as U, spriteGlyph as W, storeJavLayout as Te, t as G, textLang as Ee, useAction as K, useQuery as q, wantName as J, wireHorizontalScroller as De } from "./peach-app.js";
import { ErrorLine as Y } from "./peach-app.source-view-DmVrf8Cn.js";
import "./peach-app.source-list-UrpJH3ej.js";
// src/react/jav/discovery-faces.tsx
var X = /* @__PURE__ */ ce(B(), 1), Z = z();
function Oe({ item: e }) {
	let t = e.performer_refs?.length ? e.performer_refs : [...new Set(e.performers.split(/[,，、;/]/).filter(Boolean))].map((e) => ({ name: e })), n = t.slice(0, 5).map((t, n) => {
		let r = { "--media-avatar-index": n }, i = t.source_avatar && t.source_actor_id && !t.has_image ? { children: /* @__PURE__ */ (0, Z.jsx)(ie, {
			code: e.code,
			person: t
		}) } : { dangerouslySetInnerHTML: { __html: k(t.name, t, null) } };
		return t.id ? /* @__PURE__ */ (0, Z.jsx)("a", {
			"data-media-avatar": "",
			style: r,
			href: ge("performer", t.name, t.id),
			"aria-label": G("打开女优页：{name}", { name: t.name }),
			...i
		}, t.name) : /* @__PURE__ */ (0, Z.jsx)("span", {
			"data-media-avatar": "",
			style: r,
			title: t.name,
			...i
		}, t.name);
	});
	return t.length > 1 ? /* @__PURE__ */ (0, Z.jsx)("div", {
		"data-media-avatars": "",
		style: { "--media-avatar-count": Math.min(5, t.length) },
		children: n
	}) : n[0] || null;
}
// src/react/wants/want-list.tsx
var Q = {
	code: G("手动添加"),
	feed: G("订阅新作"),
	follow: G("关注")
}, ke = [
	["all", G("全部")],
	["available", G("有磁链")],
	["missing", G("没磁链")]
], Ae = (e) => [
	e.release_date,
	e.studio,
	e.performers,
	Q[e.origin]
].filter(Boolean).join(" · ");
function je({ want: e }) {
	return /* @__PURE__ */ (0, Z.jsxs)("span", {
		className: "relative inline-grid w-card-cover shrink-0 aspect-card-cover place-items-center overflow-hidden rounded-2lg bg-background-tertiary-default max-sm:w-24",
		children: [/* @__PURE__ */ (0, Z.jsx)("span", {
			className: "text-caption-1-regular text-text-secondary",
			children: G("无封面")
		}), e.cover ? /* @__PURE__ */ (0, Z.jsx)("img", {
			src: e.cover,
			alt: "",
			loading: "lazy",
			referrerPolicy: e.remote_cover ? "no-referrer" : void 0,
			onError: (e) => e.currentTarget.remove(),
			className: "absolute inset-0 size-full object-cover"
		}) : null]
	});
}
function Me({ want: e, readOnly: t, busy: i, onReset: a, onRemove: o, onCloudDownload: s, downloads: c, provider: l, toast: u }) {
	let [d, f] = (0, X.useState)(""), p = e.link || d || (e.code ? `https://javdb.com/search?q=${encodeURIComponent(e.code)}&f=all` : "");
	return /* @__PURE__ */ (0, Z.jsxs)("li", {
		"data-want-id": e.id,
		className: M({
			bordered: "soft",
			className: "flex flex-col gap-4 max-sm:p-4"
		}),
		children: [/* @__PURE__ */ (0, Z.jsxs)("div", {
			className: "flex min-w-0 items-start gap-4 max-sm:gap-3",
			children: [/* @__PURE__ */ (0, Z.jsx)(je, { want: e }), /* @__PURE__ */ (0, Z.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col gap-1",
				children: [
					/* @__PURE__ */ (0, Z.jsxs)("p", {
						className: "flex min-w-0 flex-wrap items-baseline gap-x-2",
						children: [/* @__PURE__ */ (0, Z.jsx)("b", {
							className: "min-w-0 text-headline-medium wrap-anywhere text-text-primary",
							children: J(e)
						}), e.code && e.title ? /* @__PURE__ */ (0, Z.jsx)("span", {
							className: "min-w-0 truncate text-body-2-regular text-text-secondary",
							children: e.title
						}) : null]
					}),
					Ae(e) ? /* @__PURE__ */ (0, Z.jsx)("p", {
						className: "text-body-2-regular text-text-secondary",
						children: Ae(e)
					}) : null,
					!e.code || e.phase === "unreleased" || e.phase === "acquired" ? /* @__PURE__ */ (0, Z.jsx)("p", {
						"data-want-note": "",
						className: "text-caption-1-regular text-text-secondary",
						children: H(e)
					}) : null,
					e.scrape_error ? /* @__PURE__ */ (0, Z.jsx)(Y, {
						text: e.scrape_error,
						prefix: G("资料未取得："),
						tone: "muted"
					}) : null,
					/* @__PURE__ */ (0, Z.jsxs)("div", {
						className: "mt-1 flex flex-wrap items-center gap-2",
						children: [
							p ? /* @__PURE__ */ (0, Z.jsx)(r, {
								"data-button-link": "",
								variant: "secondary",
								size: "small",
								trailingIcon: se,
								href: p,
								target: "_blank",
								rel: "noopener noreferrer",
								children: G("来源页")
							}) : null,
							/* @__PURE__ */ (0, Z.jsx)(n, {
								variant: "secondary",
								size: "small",
								leadingIcon: b,
								disabled: t,
								...A(i === `remove:${e.id}`),
								onClick: o,
								children: G("移除")
							}),
							e.phase === "given_up" ? /* @__PURE__ */ (0, Z.jsx)(n, {
								variant: "secondary",
								size: "small",
								disabled: t,
								...A(i === `reset:${e.id}`),
								onClick: a,
								children: G("重新查找")
							}) : null,
							e.phase === "searching" || e.phase === "given_up" ? /* @__PURE__ */ (0, Z.jsx)(n, {
								variant: "secondary",
								size: "small",
								onClick: s,
								children: G("查找资源")
							}) : null
						]
					})
				]
			})]
		}), e.code && (e.phase === "searching" || e.phase === "given_up") ? /* @__PURE__ */ (0, Z.jsx)(D, {
			want: e,
			readOnly: t,
			downloads: c,
			provider: l,
			toast: u,
			onSource: f
		}) : null]
	});
}
function Ne({ phase: t, label: r, rows: i, row: a }) {
	let [o, s] = (0, X.useState)(1), [c, l] = (0, X.useState)("all"), u = j(i), f = (e) => e.has_magnets ?? u.get(e.code || "") ?? !1, p = i.filter(f), m = t !== "searching" || c === "all" ? i : i.filter((e) => f(e) === (c === "available")), h = F(m.length, 20, o);
	return /* @__PURE__ */ (0, Z.jsxs)("section", {
		"aria-label": r,
		"data-want-phase": t,
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, Z.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, Z.jsxs)("h3", {
					className: "flex items-baseline gap-2 text-title-2-medium text-text-primary",
					children: [r, /* @__PURE__ */ (0, Z.jsx)("span", {
						className: "text-body-2-regular tabular-nums text-text-secondary",
						children: i.length.toLocaleString()
					})]
				}), t === "searching" ? /* @__PURE__ */ (0, Z.jsx)(E, {
					name: "want-magnet-filter",
					"aria-label": G("待找磁链筛选"),
					orientation: "horizontal",
					value: c,
					className: T,
					onChange: (e) => {
						l(e), s(1);
					},
					children: ke.map(([t, n]) => /* @__PURE__ */ (0, Z.jsxs)(e, {
						value: t,
						"aria-label": n,
						className: w,
						children: [n, /* @__PURE__ */ (0, Z.jsx)("span", {
							className: "text-caption-1-regular tabular-nums text-text-tertiary",
							children: (t === "all" ? i.length : t === "available" ? p.length : i.length - p.length).toLocaleString()
						})]
					}, t))
				}) : null]
			}),
			m.length ? null : /* @__PURE__ */ (0, Z.jsx)(d, {
				size: "compact",
				icon: L,
				title: G("暂无符合条件的作品"),
				actions: /* @__PURE__ */ (0, Z.jsx)(n, {
					size: "small",
					onClick: () => {
						l("all"), s(1);
					},
					children: G("查看全部")
				}),
				children: null
			}),
			/* @__PURE__ */ (0, Z.jsx)("ul", {
				className: "flex flex-col gap-4",
				children: m.slice(h.start, h.end).map(a)
			}),
			h.pages > 1 ? /* @__PURE__ */ (0, Z.jsxs)("div", {
				"data-want-pager": "",
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, Z.jsx)("span", {
					className: "text-body-2-regular tabular-nums text-text-secondary",
					children: G("{value}–{value2} / {value3} 条", {
						value: (h.start + 1).toLocaleString(),
						value2: h.end.toLocaleString(),
						value3: h.total.toLocaleString()
					})
				}), /* @__PURE__ */ (0, Z.jsx)(C, {
					label: G("{label}分页", { label: r }),
					page: h.page,
					pages: h.pages,
					onPage: s
				})]
			}) : null
		]
	});
}
function Pe({ readOnly: e, toast: t, query: r = "", clearQuery: i }) {
	let [o, l] = (0, X.useState)(""), [f, p] = (0, X.useState)(null), m = K(), h = q({
		queryKey: oe,
		queryFn: ({ signal: e }) => ve(e),
		staleTime: 3e4,
		refetchInterval: (e) => e.state.data?.scraping ? 3e3 : !1
	}), v = () => {
		let n = o.trim();
		n && !e && m.run("add", (e) => le({ code: n }, e), (e) => {
			t(e.created ? G("已加入想要：{value}", { value: J(e.want) }) : G("{value} 已经在想要里", { value: J(e.want) })), l(""), P();
		});
	}, ee = (e) => {
		e.key === "Enter" && !e.nativeEvent.isComposing && (e.preventDefault(), v());
	}, y = (e) => {
		m.run(`remove:${e.id}`, (t) => R([e.id], t), () => {
			t(G("已移除：{value}", { value: J(e) })), P();
		});
	}, te = (e) => {
		m.run(`reset:${e.id}`, (t) => V([e.id], t), () => {
			t(G("{value} 回到待找", { value: J(e) })), P();
		});
	}, b = h.data, C = (b?.items || []).filter((e) => !r || [
		e.code,
		e.title,
		e.performers
	].join(" ").toLocaleLowerCase().includes(r.toLocaleLowerCase())), w = q({
		queryKey: s,
		queryFn: ({ signal: e }) => O(`${c}?limit=100`, e),
		enabled: C.some((e) => e.code && (e.phase === "searching" || e.phase === "given_up"))
	}), T = w.data?.providers.filter((e) => e.configured) || [], E = T[0]?.key || "";
	return /* @__PURE__ */ (0, Z.jsxs)("div", {
		"aria-busy": h.isPending,
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, Z.jsxs)("div", {
				className: M({
					padding: "none",
					className: "flex flex-col gap-4 px-6 py-5 max-sm:px-4"
				}),
				children: [
					/* @__PURE__ */ (0, Z.jsx)("h3", {
						className: "text-title-2-medium text-text-primary",
						children: G("按番号添加")
					}),
					/* @__PURE__ */ (0, Z.jsxs)("div", {
						className: "flex flex-wrap items-end gap-2",
						children: [/* @__PURE__ */ (0, Z.jsx)("div", {
							className: "min-w-64 grow max-sm:min-w-0",
							children: /* @__PURE__ */ (0, Z.jsx)(_, {
								"aria-label": G("番号"),
								placeholder: G("输入番号，例如 SSIS-950"),
								value: o,
								isDisabled: e,
								onChange: l,
								onKeyDown: ee
							})
						}), /* @__PURE__ */ (0, Z.jsx)(n, {
							variant: "primary",
							disabled: e || !o.trim(),
							...A(m.busy === "add"),
							onClick: v,
							children: G("添加")
						})]
					}),
					m.error ? /* @__PURE__ */ (0, Z.jsx)(x, {
						tone: "error",
						title: G("这一次没有完成"),
						children: m.error
					}) : null
				]
			}),
			h.error ? /* @__PURE__ */ (0, Z.jsx)(x, {
				tone: "error",
				title: G("想要清单读取失败"),
				children: N(h.error)
			}) : null,
			h.isPending ? /* @__PURE__ */ (0, Z.jsx)("div", {
				role: "status",
				"aria-label": G("正在读取想要"),
				dangerouslySetInnerHTML: { __html: be("wants") }
			}) : null,
			b?.scraping ? /* @__PURE__ */ (0, Z.jsx)(g, {
				role: "status",
				children: G("正在给刚加入的番号取资料与封面。")
			}) : null,
			w.error ? /* @__PURE__ */ (0, Z.jsx)(x, {
				tone: "error",
				title: G("下载配置未取得"),
				children: N(w.error)
			}) : null,
			w.data && !T.length ? /* @__PURE__ */ (0, Z.jsxs)(x, {
				tone: "neutral",
				children: [G("尚未配置下载渠道。"), /* @__PURE__ */ (0, Z.jsx)("a", {
					href: "/settings/library?section=" + encodeURIComponent(G("下载渠道")),
					children: G("下载渠道设置")
				})]
			}) : null,
			w.data && !w.data.available ? /* @__PURE__ */ (0, Z.jsx)(x, {
				tone: "neutral",
				children: G("云下载只在允许修改数据库的设备上可用。")
			}) : null,
			b && !C.length ? /* @__PURE__ */ (0, Z.jsx)(d, {
				size: "compact",
				icon: L,
				title: G(r ? "没有符合条件的作品" : "还没有想要的作品"),
				actions: r && i ? /* @__PURE__ */ (0, Z.jsx)(n, {
					size: "small",
					onClick: i,
					children: G("清除搜索")
				}) : !r && !e ? /* @__PURE__ */ (0, Z.jsx)(u, {
					target: `input[aria-label="${G("番号")}"]`,
					children: G("添加作品")
				}) : void 0,
				children: G(r ? "试试其他番号、女优或标题。" : "输入番号，添加想看的作品。")
			}) : null,
			S.map(([n, r]) => {
				let i = C.filter((e) => e.phase === n);
				return i.length ? /* @__PURE__ */ (0, Z.jsx)(Ne, {
					phase: n,
					label: r,
					rows: i,
					row: (n) => /* @__PURE__ */ (0, Z.jsx)(Me, {
						want: n,
						readOnly: e,
						busy: m.busy,
						downloads: w.data,
						provider: E,
						toast: t,
						onReset: () => te(n),
						onRemove: () => y(n),
						onCloudDownload: () => p({
							code: n.code || "",
							title: n.title || "",
							origin: `wishlist:${n.id}`,
							cover: n.cover || "",
							performers: n.performers || "",
							release_date: n.release_date || "",
							studio: n.studio || ""
						})
					}, n.id)
				}, n) : null;
			}),
			/* @__PURE__ */ (0, Z.jsx)(a, {
				prefill: f,
				close: () => p(null),
				receipt: t,
				provider: E
			})
		]
	});
}
// src/react/jav/jav-page.tsx
var Fe = W("search"), Ie = W("x"), Le = W("refresh-cw");
function $(e) {
	let t = new URLSearchParams(location.search);
	for (let [n, r] of Object.entries(e)) r ? t.set(n, r) : t.delete(n);
	U(location.pathname + (t.size ? `?${t}` : ""), {
		replace: !0,
		state: I.navigation.location.state
	});
}
function Re({ tab: e, readOnly: t, navigate: n, receipt: r }) {
	let [i, o] = (0, X.useState)(null), [s, c] = (0, X.useState)(() => new URLSearchParams(location.search).get("q") || ""), l = (e) => {
		c(e), $({ q: e });
	};
	return /* @__PURE__ */ (0, Z.jsxs)("div", {
		className: "flex w-full flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, Z.jsx)(y, {
				tab: e,
				navigate: n,
				find: () => o({})
			}),
			/* @__PURE__ */ (0, Z.jsx)("form", {
				"aria-label": G(e === "discover" ? "筛选推荐" : "筛选想要"),
				onSubmit: (e) => {
					e.preventDefault();
				},
				children: /* @__PURE__ */ (0, Z.jsx)(_, {
					type: "search",
					"aria-label": G(e === "discover" ? "筛选推荐" : "筛选想要"),
					placeholder: G("筛选番号、女优或标题"),
					leadingIcon: Fe,
					value: s,
					onChange: l,
					enterKeyHint: "search"
				})
			}),
			e === "discover" ? /* @__PURE__ */ (0, Z.jsx)(ze, {
				readOnly: t,
				receipt: r,
				resource: o,
				query: s.trim(),
				navigate: n,
				clearText: () => l("")
			}) : /* @__PURE__ */ (0, Z.jsx)(Pe, {
				readOnly: t,
				toast: r,
				query: s.trim(),
				clearQuery: () => l("")
			}),
			/* @__PURE__ */ (0, Z.jsx)(a, {
				prefill: i,
				close: () => o(null),
				receipt: r
			})
		]
	});
}
function ze({ readOnly: e, receipt: a, resource: s, query: c, navigate: u, clearText: g }) {
	let _ = new URLSearchParams(location.search), [y, b] = (0, X.useState)(() => _.get("scope") === "library" ? "library" : "external"), [S, C] = (0, X.useState)(() => _.get("tag") || ""), [w, T] = (0, X.useState)(() => o.some(([e]) => e === _.get("sort")) ? _.get("sort") : "taste"), [E, ie] = (0, X.useState)(() => _.get("dir") === "asc"), oe = (e) => {
		b(e), $({ scope: e === "external" ? "" : e });
	}, D = (e) => {
		C(e), $({ tag: e });
	}, ce = (e) => {
		T(e), $({ sort: e === "taste" ? "" : e });
	}, O = (e) => {
		ie(e), $({ dir: e ? "asc" : "" });
	}, k = (0, X.useRef)(null);
	(0, X.useEffect)(() => {
		let e = [...k.current?.querySelectorAll("[data-catalog-scroll],[data-catalog-tags],[data-filter-row=\"bottom\"]") || []].map((e) => De(e, { drag: !0 }));
		return () => e.forEach((e) => e.destroy());
	}, []);
	let j = ue();
	(0, X.useSyncExternalStore)(j.subscribe, j.version, j.version);
	let M = xe(), ve = de(ye({
		active: !0,
		home: !1,
		portrait: !1
	})), F = (0, X.useRef)({}), I = (0, X.useRef)(!1), L = (0, X.useRef)(!1), R = E ? "asc" : "desc", z = q({
		queryKey: me(y, w, R),
		retry: !1,
		refetchOnWindowFocus: !1,
		queryFn: ({ signal: e }) => {
			let t = I.current, n = L.current;
			return I.current = !1, L.current = !1, _e(y, e, {
				sort: w,
				direction: R,
				jobId: t ? void 0 : F.current[y],
				refreshMetadata: t,
				cancelMetadata: n
			});
		},
		refetchInterval: (e) => e.state.data?.metadata_job?.status === "running" && Math.max(1e3, e.state.data.poll_after_ms || 3e3)
	}), B = z.data?.metadata_job;
	(0, X.useEffect)(() => {
		B?.job_id && (F.current[y] = B.job_id);
	}, [y, B?.job_id]);
	let V = K(), H = K(), U = (e) => {
		H.run(e, async () => (L.current = e === "stop", I.current = e !== "stop", z.refetch({
			cancelRefetch: !0,
			throwOnError: !0
		})), () => {});
	}, W = z.data?.items || [], J = [...new Set(W.flatMap((e) => e.tags || []))], Y = W.filter((e) => (!S || e.tags?.includes(S)) && (!c || [
		e.code,
		e.title,
		e.performers,
		e.studio,
		...e.tags || [],
		...(e.performer_refs || []).map((e) => e.name)
	].join(" ").toLocaleLowerCase().includes(c.toLocaleLowerCase()))), Q = z.isPending;
	return /* @__PURE__ */ (0, Z.jsxs)("section", {
		ref: k,
		"aria-label": G("为你推荐"),
		"aria-busy": Q,
		className: "flex min-w-0 flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, Z.jsx)(f, {
				label: G("发现筛选与排序"),
				topLabel: G("发现范围与标签"),
				attrs: {
					"data-filter-frame": "",
					"data-jav-filter": "",
					"data-catalog-frame": ""
				},
				busy: Q,
				topClassName: "gap-1.5 overflow-visible",
				bottomClassName: "min-h-12",
				top: /* @__PURE__ */ (0, Z.jsxs)("div", {
					"data-catalog-scroll": "",
					children: [/* @__PURE__ */ (0, Z.jsxs)("div", {
						"data-catalog-views": "",
						children: [[["external", G("库外发现")], ["library", G("馆藏探索")]].map(([e, t]) => /* @__PURE__ */ (0, Z.jsx)(m, {
							"data-entity-tag": e,
							"data-entity-press": "",
							pressed: y === e,
							onPress: () => {
								oe(e), D("");
							},
							children: t
						}, e)), /* @__PURE__ */ (0, Z.jsx)("span", {
							"data-entity-sep": "",
							"aria-hidden": "true"
						})]
					}), /* @__PURE__ */ (0, Z.jsx)("div", {
						"data-catalog-tags": "",
						dangerouslySetInnerHTML: Q ? { __html: Se() } : void 0,
						children: Q ? null : J.map((e) => /* @__PURE__ */ (0, Z.jsxs)(m, {
							"data-catalog-tag": e,
							"data-entity-press": "",
							pressed: S === e,
							onPress: () => D(S === e ? "" : e),
							children: [e, /* @__PURE__ */ (0, Z.jsx)("span", {
								"data-count-badge": "",
								children: W.filter((t) => t.tags?.includes(e)).length
							})]
						}, e))
					})]
				}),
				bottom: /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [
					/* @__PURE__ */ (0, Z.jsx)("span", {
						"data-catalog-readout": "",
						children: Q ? /* @__PURE__ */ (0, Z.jsx)("span", {
							"data-skeleton": "count",
							"aria-hidden": !0,
							className: "relative inline-block h-3.5 w-37.5 rounded-md align-middle skeleton-sheen"
						}) : G("{count} 部", { count: Y.length })
					}),
					/* @__PURE__ */ (0, Z.jsx)(te, { currentHref: () => location.pathname + location.search }),
					c || S ? /* @__PURE__ */ (0, Z.jsx)(h, {
						onPress: () => {
							D(""), g();
						},
						children: G("清除筛选")
					}) : null,
					/* @__PURE__ */ (0, Z.jsxs)("span", {
						"data-entity-sorts": "",
						children: [
							y === "external" ? /* @__PURE__ */ (0, Z.jsx)(p, {
								"data-entity-batch": "",
								"data-jav-metadata-update": "",
								label: B?.status === "running" ? G("停止读取") : G("更新资料"),
								disabled: Q,
								"data-skeleton-action": Q ? "" : void 0,
								busy: !!H.busy,
								icon: B?.status === "running" ? Ie : Le,
								onPress: () => U(B?.status === "running" ? "stop" : "update")
							}) : null,
							/* @__PURE__ */ (0, Z.jsx)(ne, {
								label: G("JAV 卡片版式"),
								value: M,
								options: v,
								onChange: Te
							}),
							/* @__PURE__ */ (0, Z.jsx)(re, {
								sorts: o.map(([e, t, n]) => ({
									key: e,
									label: t,
									ariaLabel: n,
									pressed: e === w,
									dir: R
								})),
								onSort: (e) => {
									e === w ? O(!E) : (ce(e), O(e === "code"));
								}
							})
						]
					})
				] })
			}),
			Q ? /* @__PURE__ */ (0, Z.jsx)("div", {
				role: "status",
				"aria-label": G("正在读取推荐"),
				dangerouslySetInnerHTML: { __html: be("discover", M) }
			}) : null,
			z.error ? /* @__PURE__ */ (0, Z.jsx)(x, {
				tone: "error",
				title: G("推荐未取得"),
				children: N(z.error)
			}) : null,
			y === "external" && B?.status === "running" ? /* @__PURE__ */ (0, Z.jsx)("div", {
				"data-jav-metadata": "",
				className: "min-w-0",
				children: /* @__PURE__ */ (0, Z.jsx)(ae, {
					embedded: !0,
					label: G("正在读取作品资料 · {completed} / {total} 部", {
						completed: B.completed,
						total: B.total
					}),
					value: B.completed,
					total: B.total
				})
			}) : null,
			B && B.status !== "running" && (B.status !== "complete" || B.failed > 0) ? /* @__PURE__ */ (0, Z.jsx)(x, {
				tone: "neutral",
				action: /* @__PURE__ */ (0, Z.jsx)(n, {
					variant: "secondary",
					...A(H.busy === "retry"),
					"aria-label": G("立即重试读取作品资料"),
					onClick: () => U("retry"),
					children: G("立即重试")
				}),
				children: B.message || G("作品资料 {completed} / {total} 部", {
					completed: B.completed,
					total: B.total
				})
			}) : null,
			H.error ? /* @__PURE__ */ (0, Z.jsx)(x, {
				tone: "error",
				children: H.error
			}) : null,
			!Q && !z.error && !Y.length ? /* @__PURE__ */ (0, Z.jsx)(d, {
				icon: l,
				title: G(c || S ? "没有符合条件的推荐" : "暂无匹配口味的作品"),
				actions: /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(r, {
					size: "small",
					href: "/taste",
					variant: "secondary",
					children: G("查看口味")
				}), c || S ? /* @__PURE__ */ (0, Z.jsx)(n, {
					variant: "primary",
					size: "small",
					onClick: () => {
						g(), C(""), $({
							q: "",
							tag: ""
						});
					},
					children: G("清除筛选")
				}) : y === "library" ? /* @__PURE__ */ (0, Z.jsx)(r, {
					variant: "primary",
					size: "small",
					href: "/",
					children: G("浏览馆藏")
				}) : /* @__PURE__ */ (0, Z.jsx)(n, {
					variant: "primary",
					size: "small",
					onClick: () => s({}),
					children: G("查找作品")
				})] }),
				children: G(c || S ? "清除筛选后查看其他作品。" : y === "library" ? "观看或标记作品后，可以探索少看的馆藏。" : "可以查找番号，或更新关注来源。")
			}) : null,
			V.error ? /* @__PURE__ */ (0, Z.jsx)(x, {
				tone: "error",
				children: V.error
			}) : null,
			/* @__PURE__ */ (0, Z.jsx)("div", {
				"data-media-grid": "",
				className: ee,
				style: { "--card-ratio": ve },
				children: Y.map((o) => {
					let c = o.performer_refs?.length ? o.performer_refs.map((e) => e.name).join("、") : o.performers, l = pe(o, M, j.value.javImage), d = Ce(o.taste_score ?? o.score), f = [
						d.label,
						G("口味 {value}", { value: he(o.taste_score ?? o.score) }),
						z.data?.ranking_method === "mmr" && o.ranking_score != null ? G("排序 {value}", { value: he(o.ranking_score) }) : "",
						o.source_score == null ? "" : G("来源评分 {value} / 5", { value: o.source_score.toFixed(1) }),
						...o.reasons || []
					].filter(Boolean).join(" · ");
					return /* @__PURE__ */ (0, Z.jsxs)("article", {
						"data-media-card": "",
						"data-jav-card": "",
						onClick: (e) => {
							e.target.closest("a,button,input") || u(o.asset_id ? `/assets/${o.asset_id}` : `/works/${encodeURIComponent(o.code)}`);
						},
						children: [
							/* @__PURE__ */ (0, Z.jsx)("a", {
								href: o.asset_id ? `/assets/${o.asset_id}` : `/works/${encodeURIComponent(o.code)}`,
								"aria-label": G("查看 {code} 详情", { code: o.code }),
								onClick: (e) => {
									e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0 || (e.preventDefault(), u(e.currentTarget.getAttribute("href")));
								},
								"data-media-pic": "",
								"data-jav-cover-box": "",
								className: "relative inline-grid place-items-center overflow-hidden rounded-2lg bg-background-tertiary-default",
								children: l ? /* @__PURE__ */ (0, Z.jsx)(t, {
									artwork: {
										kind: "cover",
										html: l
									},
									identity: pe(o, "small", j.value.javImage),
									relayout: (e) => we(e, M)
								}) : /* @__PURE__ */ (0, Z.jsx)("span", {
									"data-media-nopic": "",
									children: G("无封面")
								})
							}),
							/* @__PURE__ */ (0, Z.jsxs)("div", {
								"data-media-meta": "",
								children: [/* @__PURE__ */ (0, Z.jsx)(Oe, { item: o }), /* @__PURE__ */ (0, Z.jsxs)("div", {
									"data-media-text": "",
									children: [
										/* @__PURE__ */ (0, Z.jsxs)("h3", {
											"data-jav-title": "",
											"data-media-title": "",
											title: `${o.code} · ${o.title || G("标题未取得")}`,
											children: [
												/* @__PURE__ */ (0, Z.jsx)("b", { children: o.code }),
												" ",
												o.title ? /* @__PURE__ */ (0, Z.jsx)("span", {
													lang: Ee(o.title),
													children: o.title
												}) : G("标题未取得")
											]
										}),
										/* @__PURE__ */ (0, Z.jsxs)("div", {
											"data-media-byline": "",
											children: [
												o.performer_refs?.[0]?.id ? /* @__PURE__ */ (0, Z.jsxs)("a", {
													"data-media-who": "",
													href: ge("performer", o.performer_refs[0].name),
													title: c,
													children: [/* @__PURE__ */ (0, Z.jsx)("svg", {
														viewBox: "0 0 24 24",
														"aria-hidden": "true",
														children: /* @__PURE__ */ (0, Z.jsx)("use", { href: "#i-user-round" })
													}), /* @__PURE__ */ (0, Z.jsx)("span", { children: o.performer_refs[0].name })]
												}) : /* @__PURE__ */ (0, Z.jsxs)("span", {
													"data-media-who": "",
													title: c,
													children: [/* @__PURE__ */ (0, Z.jsx)("svg", {
														viewBox: "0 0 24 24",
														"aria-hidden": "true",
														children: /* @__PURE__ */ (0, Z.jsx)("use", { href: "#i-user-round" })
													}), /* @__PURE__ */ (0, Z.jsx)("span", { children: o.performer_refs?.[0]?.name || c })]
												}),
												(o.performer_refs?.length || 0) > 1 ? /* @__PURE__ */ (0, Z.jsx)("span", {
													"data-media-who-more": "",
													children: G("等 {count} 人", { count: o.performer_refs.length })
												}) : null,
												o.release_date ? /* @__PURE__ */ (0, Z.jsxs)("time", {
													"data-media-release": "",
													dateTime: o.release_date,
													children: [/* @__PURE__ */ (0, Z.jsx)("svg", {
														viewBox: "0 0 24 24",
														"aria-hidden": "true",
														children: /* @__PURE__ */ (0, Z.jsx)("use", { href: "#i-calendar" })
													}), o.release_date]
												}) : null
											]
										}),
										/* @__PURE__ */ (0, Z.jsxs)("div", {
											"data-jav-tags": "",
											"data-media-tags": "",
											children: [/* @__PURE__ */ (0, Z.jsx)("button", {
												"data-jav-taste-score": "",
												type: "button",
												title: f,
												"aria-label": G("推荐分 {score}，{label}", {
													score: d.score,
													label: d.label
												}),
												className: "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
												children: /* @__PURE__ */ (0, Z.jsx)(i, {
													color: d.color,
													children: d.label
												})
											}), (o.tags || []).slice(0, 4).map((e) => /* @__PURE__ */ (0, Z.jsx)("button", {
												type: "button",
												"data-media-tag": "",
												"aria-pressed": S === e,
												onClick: () => D(S === e ? "" : e),
												children: e
											}, e))]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, Z.jsxs)("div", {
								"data-jav-actions": "",
								className: "flex flex-wrap gap-2",
								children: [
									o.link ? /* @__PURE__ */ (0, Z.jsx)(r, {
										"data-button-link": "",
										variant: "secondary",
										trailingIcon: se,
										href: o.link,
										target: "_blank",
										rel: "noopener noreferrer",
										children: G("作品来源")
									}) : null,
									/* @__PURE__ */ (0, Z.jsx)(n, {
										variant: "ghost",
										disabled: e || o.wanted || !!o.asset_id,
										...A(V.busy === String(o.id)),
										onClick: () => {
											V.run(String(o.id), (e) => le({ code: o.code }, e), () => {
												a(G("已加入想要")), P(), z.refetch();
											});
										},
										children: o.asset_id ? G("已入库") : o.wanted ? G("已加入想要") : G("想要")
									}),
									/* @__PURE__ */ (0, Z.jsx)(n, {
										variant: "secondary",
										onClick: () => s({
											...o,
											cover: o.has_cover ? fe(o, !0) : o.cover_url,
											origin: `${o.asset_id ? "asset" : "feed"}:${o.id}`
										}),
										children: G("查找资源")
									})
								]
							})
						]
					}, o.id);
				})
			})
		]
	});
}
export { Re as JavPage };

//# debugId=b337e59c-4db4-4262-bea4-7aee52e68d43