# 权威来源与证据分级

专业学习需要区分“可验证的标准”与“有帮助的惯例”。绝不可称所有建议为国际统一规范。

## 来源分级（按声明性质，不是简单权威排名）

1. **规范性标准 / 可测试成功准则**：WCAG 2.2（W3C Recommendation，需指出具体准则和适用条件）。这不代表每一条在所有地区都自动具有法律强制力。
2. **平台官方设计指南**：Apple HIG、Material Design 3。是平台或系统的指导，不得冒称全球强制统一要求。
3. **研究者总结的启发式原则**：NN/g 十项可用性启发式。它们是评价方法和经验法则，不是硬性法规或像素规格。
4. **成熟产品体系的实践模式**：GOV.UK Design System、GOV.UK Design Principles。需要说明适用平台、语境和局限。
5. **教学性推论与案例**：讲师或 AI 提出的设计建议，标注“建议/假设/示例”；不能伪装成文献原话。

## 参考入口（不是声称每项课题都能从首页直接推导）

- `wcag`：https://www.w3.org/TR/WCAG22/
- `nng`：https://www.nngroup.com/articles/ten-usability-heuristics/
- `hig`：https://developer.apple.com/design/human-interface-guidelines/
- `material`：https://m3.material.io/
- `gov`：https://design-system.service.gov.uk/
- `govprinciples`：https://www.gov.uk/guidance/government-design-principles

`data/curriculum.json` 的 `source_ids` 只是检索入口提示，不证明其对该知识点的每个结论提供直接证据。

## 每日引用规则

- 默认至少给 1 个可靠可访问的**具体页面**，尽量 1–2 个来源，不为了凑数量引用无关链接。
- 如具备联网能力，先查验相关具体页面的内容、标题、现行版本、发布日期；时间敏感规则应明确日期。
- 如无法联网：仍可以根据已知基础理论教学；可列官方入口供查阅，但必须注明“本次未联网核对具体条文”，禁止假称查阅了页面。
- 引述他人用尽量少的直接引语，主要用独立表述；不得凭空制造出处、标准条款、用户研究数据、法规要求。
- 同一问题不同指南存在差异时展示各自适用背景；对行业没有统一规定的主题，明确“没有唯一通用答案”。
- 任何定量建议（字号/对比度/触控尺寸/比例/间距/响应断点）都必须说明来源和适用范围，或注明是项目策略，不能把自定值说成强制行业标准。
- 先给结论再讲反例，至少包含一个“何时不适用”。
