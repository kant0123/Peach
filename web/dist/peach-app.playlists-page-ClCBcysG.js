(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "5dfc2810-d757-43c3-b1c6-e00cc933853e", e._sentryDebugIdIdentifier = "sentry-dbid-5dfc2810-d757-43c3-b1c6-e00cc933853e");
	} catch {}
})();
import { $2ec61d1d4f780267$export$a8a3e93435678ff9 as e, $542a13ca2fa5b484$export$5b6b19405a83ff9d as t, Button as n, EmptyFocusButton as r, EmptyState as i, Input as a, MENU_ITEM as o, MENU_ITEM_INTERACTIVE as s, MENU_POPOVER_SURFACE as c, MenuDialog as l, MixCard as u, ModalFrame as d, PLAYLISTS_KEY as f, RetryNote as p, __toESM as m, busyProps as h, confirmModal as g, createPlaylist as _, cx as v, deletePlaylist as y, errorMessage as b, fetchPlaylists as x, keepPlaylist as S, posterUrl as C, recreatePlaylist as w, refreshPlaylists as T, renamePlaylist as E, require_jsx_runtime as D, require_react as O, resumeAssetId as k, spriteGlyph as A, t as j, useMutation as M, useQuery as N } from "./peach-app.js";
// src/react/playlists/playlists-page.tsx
var P = /* @__PURE__ */ m(O(), 1), F = D(), I = A("ellipsis"), L = A("pencil"), R = A("trash"), z = A("playlist"), B = v(o, s, "text-body-2-medium"), V = j("播放列表名称不能为空"), H = (e) => async () => {
	try {
		await e();
	} finally {
		T();
	}
};
function U({ toast: e }) {
	let [t, r] = (0, P.useState)(""), [i, o] = (0, P.useState)(""), s = M({
		mutationFn: (e) => _(e),
		onSuccess: (t) => {
			r(""), o(""), T(), e(j("已新建播放列表"), { undo: H(() => y(t.playlist.id)) });
		},
		onError: (e) => o(b(e) || j("新建失败"))
	});
	return /* @__PURE__ */ (0, F.jsxs)("form", {
		"data-playlist-create": "",
		"aria-label": j("新建播放列表"),
		onSubmit: (e) => {
			e.preventDefault(), !s.isPending && (t.trim() ? s.mutate(t) : o(V));
		},
		className: "flex flex-wrap items-end gap-2",
		children: [/* @__PURE__ */ (0, F.jsx)("div", {
			className: "min-w-50 max-w-80 flex-1 basis-50 max-board-narrow:min-w-0 max-board-narrow:max-w-none",
			children: /* @__PURE__ */ (0, F.jsx)(a, {
				label: j("新播放列表"),
				placeholder: j("输入名称"),
				maxLength: 80,
				value: t,
				onChange: (e) => {
					r(e), o("");
				},
				validationBehavior: "aria",
				isInvalid: !!i,
				hint: i || void 0
			})
		}), /* @__PURE__ */ (0, F.jsx)(n, {
			type: "submit",
			...h(s.isPending),
			children: j("新建")
		})]
	});
}
function W({ target: t, close: r, toast: i }) {
	let [o, s] = (0, P.useState)(""), [c, l] = (0, P.useState)(""), u = (0, P.useRef)(null);
	(0, P.useEffect)(() => {
		if (!t) return;
		s(t.name), l("");
		let e = requestAnimationFrame(() => {
			u.current?.focus(), u.current?.select();
		});
		return () => cancelAnimationFrame(e);
	}, [t]);
	let f = M({
		mutationFn: ({ row: e, value: t }) => E(e.id, t),
		onSuccess: (e, { row: t }) => {
			r(), T(), i(j("已重命名播放列表"), { undo: H(() => E(t.id, t.name)) });
		},
		onError: (e) => l(b(e))
	});
	return /* @__PURE__ */ (0, F.jsx)(d, {
		isOpen: !!t,
		onOpenChange: (e) => {
			e || r();
		},
		width: "form",
		children: /* @__PURE__ */ (0, F.jsxs)("form", {
			"data-playlist-rename": "",
			onSubmit: (e) => {
				if (e.preventDefault(), !t || f.isPending) return;
				let n = o.trim();
				n ? f.mutate({
					row: t,
					value: n
				}) : l(V);
			},
			className: "flex min-h-0 flex-col",
			children: [/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "flex flex-col gap-4 p-5",
				children: [/* @__PURE__ */ (0, F.jsx)(e, {
					slot: "title",
					className: "text-title-2-semibold text-text-primary",
					children: j("编辑名称")
				}), /* @__PURE__ */ (0, F.jsx)(a, {
					ref: u,
					label: j("名称"),
					placeholder: j("输入名称"),
					maxLength: 80,
					value: o,
					onChange: (e) => {
						s(e), l("");
					},
					validationBehavior: "aria",
					isInvalid: !!c,
					hint: c || void 0
				})]
			}), /* @__PURE__ */ (0, F.jsxs)("div", {
				className: "flex justify-between gap-4 p-3",
				children: [/* @__PURE__ */ (0, F.jsx)(n, {
					variant: "secondary",
					onClick: r,
					children: j("取消")
				}), /* @__PURE__ */ (0, F.jsx)(n, {
					type: "submit",
					...h(f.isPending),
					children: j("保存名称")
				})]
			})]
		})
	});
}
function G({ name: e, onRename: n, onDelete: r }) {
	let i = (0, P.useRef)(null), [a, o] = (0, P.useState)(!1), s = (e) => {
		o(!1), e();
	};
	return /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsx)("button", {
		ref: i,
		type: "button",
		title: j("更多操作"),
		"aria-label": j("播放列表操作：{name}", { name: e }),
		"aria-haspopup": "dialog",
		"aria-expanded": a,
		"data-playlist-menu": "",
		onClick: () => o(!0),
		className: "flex size-7.5 flex-none cursor-pointer items-center justify-center rounded-2lg text-foreground-icon-secondary outline-none transition-colors hover:bg-background-primary-hover hover:text-foreground-icon-primary aria-expanded:bg-background-primary-hover aria-expanded:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring",
		children: /* @__PURE__ */ (0, F.jsx)(I, {
			"aria-hidden": !0,
			className: "size-4.5"
		})
	}), /* @__PURE__ */ (0, F.jsx)(t, {
		triggerRef: i,
		isOpen: a,
		onOpenChange: o,
		placement: "bottom end",
		offset: 4,
		className: c,
		children: /* @__PURE__ */ (0, F.jsxs)(l, {
			"aria-label": j("播放列表操作：{name}", { name: e }),
			className: "flex w-37.5 flex-col gap-0.5 outline-none",
			children: [/* @__PURE__ */ (0, F.jsxs)("button", {
				type: "button",
				className: B,
				onClick: () => s(n),
				children: [/* @__PURE__ */ (0, F.jsx)(L, {
					"aria-hidden": !0,
					className: "size-(--icon-inline) shrink-0"
				}), j("编辑名称")]
			}), /* @__PURE__ */ (0, F.jsxs)("button", {
				type: "button",
				className: B,
				onClick: () => s(r),
				children: [/* @__PURE__ */ (0, F.jsx)(R, {
					"aria-hidden": !0,
					className: "size-(--icon-inline) shrink-0"
				}), j("删除播放列表")]
			})]
		})
	})] });
}
function K({ openPlaylist: e, openEntity: t, canFlip: n, toast: a, revision: o }) {
	let s = N({
		queryKey: f,
		queryFn: ({ signal: e }) => x(e)
	}), [c, l] = (0, P.useState)(null), d = (0, P.useRef)(o);
	(0, P.useEffect)(() => {
		d.current !== o && (d.current = o, T());
	}, [o]);
	let m = s.data, h = m?.items ?? [], _ = (e) => {
		g({
			title: j("删除播放列表"),
			body: j("这个播放列表将被删除，视频文件保留。"),
			confirmLabel: j("删除播放列表"),
			danger: !0,
			onConfirm: async () => {
				let t = await S(e.id);
				await y(e.id), T(), a(j("已删除播放列表"), t ? { undo: H(() => w(t)) } : void 0);
			}
		});
	};
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "w-full pt-1 pb-10.5",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("header", {
				className: "mb-4 flex items-start justify-between gap-4.5 max-board-narrow:flex-col max-board-narrow:items-stretch",
				children: [/* @__PURE__ */ (0, F.jsxs)("div", { children: [/* @__PURE__ */ (0, F.jsx)("h2", {
					className: "mb-1 text-display-4-medium! text-text-primary",
					children: j("播放列表")
				}), /* @__PURE__ */ (0, F.jsx)("p", {
					className: "text-body-2-regular text-text-secondary",
					children: j("保存 Mix，按自己的顺序继续播放。")
				})] }), /* @__PURE__ */ (0, F.jsx)(U, { toast: a })]
			}),
			/* @__PURE__ */ (0, F.jsx)("div", {
				className: "mx-auto w-full max-w-board",
				children: m ? h.length ? /* @__PURE__ */ (0, F.jsx)("div", {
					"data-playlist-grid": "",
					className: "card-grid-cover gap-4.5",
					children: h.map((r) => {
						let i = k(r), a = r.name.trim() || j("未命名播放列表");
						return /* @__PURE__ */ (0, F.jsx)(u, {
							"data-playlist-card": String(r.id),
							name: a,
							caption: r.source_kind === "mix" ? j("由 Mix 保存") : j("手动播放列表"),
							count: r.item_count,
							poster: r.preview_asset_id ? C(r.preview_asset_id) : null,
							flipImages: async () => (r.preview_ids || []).map(C),
							canFlip: n,
							faces: r.faces || [],
							onOpenEntity: t,
							...i ? { onOpen: () => e(r.id, i) } : {},
							openLabel: j("打开播放列表 {name}", { name: a }),
							menu: /* @__PURE__ */ (0, F.jsx)(G, {
								name: a,
								onRename: () => l(r),
								onDelete: () => _(r)
							})
						}, r.id);
					})
				}) : /* @__PURE__ */ (0, F.jsx)(i, {
					icon: z,
					title: j("还没有播放列表"),
					actions: /* @__PURE__ */ (0, F.jsx)(r, {
						target: "[data-playlist-create] input",
						children: j("新建播放列表")
					}),
					children: j("保存 Mix 或新建列表后，会在这里按自己的顺序继续播放。")
				}) : s.isError ? /* @__PURE__ */ (0, F.jsx)(p, {
					message: b(s.error) || j("播放列表读取失败"),
					onRetry: () => void s.refetch()
				}) : null
			}),
			/* @__PURE__ */ (0, F.jsx)(W, {
				target: c,
				close: () => l(null),
				toast: a
			})
		]
	});
}
export { K as PlaylistsPage };

//# debugId=5dfc2810-d757-43c3-b1c6-e00cc933853e