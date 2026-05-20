Case photos are grouped by service category.

Folder map:

```text
cases/
├── surface-treatment/        表面處理：電鍍、鍍鉻、噴砂、研磨、拋光、噴塗、橡膠包覆
├── precision-machining/      精密機加工：CNC、銑削、車削、刨削、磨削
├── mechanical-engineering/   機械工程：電力、給排水、空壓系統施工
├── valve-repair/             閥件維修：氣閥、水閥、液壓閥買賣與維修
├── import-export/            進出口貿易：機械設備代購、關務與物流
└── technology-transfer/      技術轉讓：製程顧問、設備改造、人員訓練
```

Recommended naming:

```text
001-before.jpg
002-after.jpg
003-detail.jpg
```

Before publishing customer project photos, remove confidential details such as customer logos, drawing numbers, serial numbers and private factory areas.

To show a real photo on the homepage, update `assets/css/styles.css`, for example:

```css
.case-surface .case-image {
  background-image: url("../img/cases/surface-treatment/001-after.jpg");
  background-size: cover;
  background-position: center;
}
```
