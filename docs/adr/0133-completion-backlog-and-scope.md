# ADR-0133：文件名补全的选取、试过记录与单独运行

- 状态：已采纳
- 日期：2026-11-01
- 相关：`docs/SOURCING.md`「既有未取得条目的文件名补全」、`src/peach/iv_completion.py`、ADR-0132

## 背景

ADR-0132 把「文件名补全」做成常规处理之后的第二趟，并把每趟限定在 30 部。实际运行后
暴露出三个问题：

1. `iv_pending_ids` 是全馆所有缺字段的行，按 id 升序取前 30。馆藏里低 id 的待补行远多于
   30，第二趟每次都从同一批开始；有成果的行没有试过记录，没有成果的行下次照旧重来。
   IV 这类高 id、且常规来源本来就全灭的行因此一直轮不到。
2. 第二趟用 `recheck_existing=True` 重跑 `process_library`，把每个字段都当成缺、也不复用
   磁盘上的新鲜快照；JavArchive 又追加在综合索引之后。本来只需要问一家的行，先白问了
   片商站与三家综合索引。
3. 第二趟只在全馆处理结束后才运行。全馆处理本身可能跑十几个小时，用户没有只补 IV 的
   入口；看到「补全没动」时既没有统计也停不下来。

## 决策

### 选取与排序

`_pending_ids` 不再按 id 升序返回，而是按补全价值排序：

- rank 0：番号已定、常规来源什么也没给、还缺必填标量（标题、出演者、厂牌、发行日期）。
- rank 1：还缺必填标量，但常规来源已经给了些东西。
- rank 2：没有番号，文件名读得出出演者或标题。
- rank 3：标量齐了，只缺封面。

只缺内容标签、封面也已够清晰的行不进第二趟。判据在 `library_processing._completion_need`，
与 `_iv_pending_row`、`pending_completion_ids` 共用。

### 试过记录

`state/iv-completion/attempts.json` 记录每一行最近一次试过的结果与当时的
`(番号, 文件名, 缺失字段)`。同一组条件在期限内不再问：

- `processed`：7 天（与「来源说没有」的记忆同一个有效期）。
- `failed`：1 天（来源冷却、超时）。
- `unidentified`：7 天（搜索没有唯一结果）。
- `unsupported`：30 天（韩国 MIB、国产／欧美等本来就不该问日本来源的行）。

文件名、番号或缺失字段一变就重新尝试；`retry=True` 忽略期限。写入使用原子替换与
`attempts.json.lock`，坏文件当成空的。记录上限 5,000 条、保留 30 天。

### 第二趟的成本

- `process_library` 用 `recheck_existing=False`，只补实际缺口，复用新鲜快照与「没有」记忆。
- 有码行把 `javarchive` 提到最前，并去掉 `makers`／`prestige`／`faleno`／`dahlia`／`mgstage`
  这几档：它们经 amane 桥，准备运行环境的成本远高于 IV 番号在片商官网的命中率。其他类型保持
  官方档 → `javarchive` → 综合索引。候选取舍仍按 `metadata_policy`，不随查询顺序变。
- 全馆处理末尾每趟上限 120 部、900 秒；单独运行默认 500 部、1800 秒，调用处可以覆盖。

### 单独运行

新增 `iv_completion.complete_pending()`：先由账本算出待补行（`pending_completion_ids`），
再调用同一个 `complete()`，不扫描、不读本地资料。入口：

- CLI：`peach process --complete-missing [--path-prefix PATH] [--limit N] [--retry]`。
- 网页 API：`POST /api/library-processing` 的 `{complete_missing: true, asset_ids?, path_prefix?, limit?, retry?}`；
  任务状态沿用 `library_processing_job`，`iv_completion` 统计随 `PUBLIC_FIELDS` 返回。界面入口
  依赖前端产物重建，不在本次交付；界面可直接调用这个 API。

`path_prefix` 按账本路径（Windows 写法）前缀过滤，大小写与分隔符不敏感；用来把范围收到
一个 IV 目录，不引入新的媒体库概念。

## 后果

- 全馆处理末尾的第二趟每次向未试过的行前进；单独运行可以在全馆处理之外补 IV。
- 只缺标签的行不再占第二趟名额；`state/iv-completion/` 多一份小 JSON，数据库结构不变。
- JavArchive 的查询顺序变了，但候选的结算顺序、自动落库条件与封面印证规则不变。
- 第二趟仍然不猜番号；没有唯一匹配的行保持原状，并记进试过记录。
- 单来源能补空的字段照旧自动落库；需要两家一致的字段仍留在复核队列。

## 验证

临时账本与模拟来源覆盖：排序与 tags-only 排除、试过记录的跳过／过期／`retry`、JavArchive
先于综合索引、有码行跳过 amane 官方档、`path_prefix` 的大小写与分隔符、单独运行的 CLI/API 入口与统计。
真实网络只做只读试跑，不写账本。
