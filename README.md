# RogueByte POS — Point of Sale & Accurate Inventory Management System
### نظام نقاط البيع وإدارة المخزون المتكامل مع الفوترة الضريبية السحابية

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Brand: RogueByte](https://img.shields.io/badge/Brand-RogueByte-blue.svg)](https://roguebyte.online/)
[![Database: Firebase Firestore](https://img.shields.io/badge/Database-Firebase_Firestore-orange.svg)](https://firebase.google.com/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)

---

## 🌐 Language Navigation / تصفح اللغات
- [English Documentation](#-english-documentation)
- [التوثيق باللغة العربية](#-التوثيق-باللغة-العربية)

---

# 🇬🇧 English Documentation

**RogueByte POS** is an enterprise-grade, high-performance, and responsive cloud Point of Sale (POS) and inventory management platform designed specifically for retail, boutique, supermarket, and specialty businesses in the Sultanate of Oman and the Arab world.

Featuring offline-first resilience, real-time Google Firebase Firestore cloud synchronization, simplified tax invoices with custom company logos, and strict multi-tier role-based access control.

---

## ✨ Key Capabilities & Features

### 1. 💳 Complete Multi-Channel Payments
- **Cash Payments**: Fast denomination quick-buttons (0.500, 1.000, 5.000, 10.000, 20.000, 50.000 OMR, and exact amount) with automatic change due calculation.
- **Bank POS Cards**: Full support for Visa, MasterCard, and national debit cards with transaction auth references.
- **Split Payments**: Combine cash and card payments in a single transaction with live remaining balance calculation.
- **Credit / On-Account**: Record customer debt with customer name, phone number, and due date.
- **Mobile QR / Bank Transfer**: Quick transfer verification.

### 2. 👥 Strict Role-Based Access Control (RBAC)
- **Cashier (كاشير)**:
  - Dedicated, distraction-free point-of-sale sales terminal.
  - Restricted from administrative screens: cannot view financial ledgers, stock cost prices, branch settings, or system configuration.
  - Fast barcode scanning (camera + wireless USB scanner), item quantity adjustments, order hold & recall, and instant thermal receipt printing.
- **Accountant (محاسب)**:
  - **Period-Specific Sales Reports**: Filter, inspect, and export sales by **Today**, **Yesterday**, **This Week**, **This Month**, or **Custom Date Range (From Date -> To Date)**.
  - **Read-Only Branch & Staff Visibility**: Inspect branch details, contact numbers, addresses, and employee rosters without destructive modification risks.
  - **Financial Ledgers**: Comprehensive Profit & Loss (P&L) statements, 5% VAT collected ledger, cost of goods sold (COGS), and operational expense tracking.
  - **One-Click Printing & Export**: Official printable sales report and CSV/Excel ledger export.
- **Manager / System Admin (المدير / النظام)**:
  - Unrestricted, total control over all system modules.
  - Full product catalog & pricing control, stock adjustment vouchers, barcode tag printing.
  - Multi-branch administration, employee management with 4-digit PIN setup.
  - Tax invoicing settings, custom company logo uploads, paper width settings (80mm / 58mm / A4), and cloud database synchronization.

### 3. 📦 Accurate Inventory & Product Management with Photo Upload
- Real device photo uploads (JPEG, PNG, WebP) with instant visual previews.
- Real-time stock counts with automated low-stock warnings and out-of-stock lockouts.
- Automatic profit margin calculations based on cost price vs. selling price in OMR.
- Stock adjustment vouchers for new stock reception (+), damaged/expired write-offs (-), and inventory audit corrections.
- Built-in Code 128 barcode generator and printable shelf price labels.

### 4. 🧾 Tax Invoicing & Company Logo Customization
- Simplified tax invoices meeting consumer protection and tax authority standards.
- Custom company logo upload to replace or complement the default RogueByte branding.
- Dynamic e-invoicing QR code generated for digital receipt validation.
- Direct thermal printing formatted for 80mm standard, 58mm compact, or A4 paper.

### 5. ☁️ Google Firebase Firestore Real-Time Database
- Real-time synchronization across all branch terminals and cash registers.
- Offline-first resilience: cashiers can continue scanning and completing sales even if internet connectivity drops temporarily.
- Hardened Firestore security rules (`firestore.rules`) enforcing data integrity and preventing unauthorized writes.

### 6. 🇴🇲 Official Currency & Tax Configuration
- Default Currency: **Omani Rial (OMR / ر.ع.)** with official 3-decimal precision (e.g., `1.250 OMR`).
- Value-Added Tax (VAT): 5% standard rate in the Sultanate of Oman (customizable in Manager Settings).

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Audio Feedback**: HTML5 Web Audio API tactile synthesizers (zero external MP3 dependencies).
- **Backend / Database**: Google Firebase Firestore (Enterprise Cloud instance) + Local Storage / IndexedDB offline fallback.
- **Typography**: Google Fonts Cairo (Arabic) & Plus Jakarta Sans (English) & JetBrains Mono (Financial Tabular Figures).

---

## 🚀 Quick Start & Installation

```bash
# 1. Clone the repository
git clone https://github.com/RogueByteOfficial/RogueByte-POS.git
cd RogueByte-POS

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be running at `http://localhost:3000`.

---

# 🇸🇦 التوثيق باللغة العربية

**نظام RogueByte POS** هو نظام نقاط بيع سحابي متطور، فائق السرعة، ومصمم لتلبية احتياجات المتاجر ومنافذ التجزئة في سلطنة عُمان والوطن العربي مع دعم كامل لمعايير الفاتورة الضريبية المبسطة وإدارة المخزون وتعدد الفروع.

---

## 🌟 أبرز مميزات النظام

### 1. 💳 دعم شامل لجميع طرق الدفع
- **نقدي (Cash)**: مع فئات نقدية سريعة بالريال العماني وحساب تلقائي للمتبقي (الصرف).
- **بطاقات بنكية (POS Cards)**: دعم شبكة مدى، فيزا، وماستركارد عبر أجهزة الدفع المصرفية.
- **دفع مجزأ (Split Payment)**: تقسيم قيمة الفاتورة بين النقد والبطاقة مع احتساب المتبقي لحظياً.
- **آجل / على الحساب (Credit)**: تسجيل اسم العميل ورقم هاتفه وتاريخ استحقاق المبلغ.

### 2. 👥 فصل صارم للصلاحيات والأدوار (RBAC)
- **الكاشير (Cashier)**:
  - واجهة بيع مخصصة وسريعة تقتصر على مسح الباركود، وإتمام الدفع، وطباعة الفاتورة الحرارية.
  - محجوب عنه بالكامل شاشات المخزون، الحسابات، الأفرع، الموظفين، والإعدادات الإدارية.
- **المحاسب (Accountant)**:
  - **استخراج تقارير المبيعات**: حسب **اليوم**، **أمس**، **هذا الأسبوع**، **هذا الشهر**، أو **نطاق مخصص (من تاريخ / إلى تاريخ)**.
  - **رؤية الأفرع والموظفين**: استعراض بيانات الفروع والموظفين في وضع القراءة الآمن (دون إمكانية الحذف أو التعديل).
  - **التقارير المالية**: قائمة الأرباح والخسائر (P&L)، إجمالي ضريبة 5% المحصلة، وسجل المصروفات النثرية.
  - **طباعة وتصدير**: أمر طباعة فوري لتقرير المبيعات وتصدير إلى ملفات Excel / CSV.
- **المدير / النظام (Manager / System Admin)**:
  - تحكم كامل وغير مقيد بكافة خصائص النظام (الأسعار، المخزون، إضافة الأفرع، تعيين الموظفين ورموز الـ PIN، رفع شعار الفاتورة، ومزامنة السحابة).

### 3. 📦 إدارة المخزون مع رفع الصور والباركود
- رفع صور المنتجات مباشرة من الجهاز مع المعاينة الفورية.
- متابعة كميات المخزون بدقة وتنبيهات آلية للمخزون المنخفض.
- احتساب هوامش الربح التقديرية بناءً على سعر التكلفة وسعر البيع بالريال العماني.
- سندات حركة المخزون: توريد بضاعة (+)، تالف ومنتهي الصلاحية (-)، وتسوية الجرد الفعلي.
- توليد وطباعة ملصقات الباركود والأسعار للطابعات الحرارية.

### 4. 🧾 الفواتير الضريبية وشعار المنشأة المخصص
- فاتورة ضريبية مبسطة متوافقة مع اشتراطات حماية المستهلك والضريبة.
- إمكانية رفع شعار المنشأة ليظهر أعلى الفاتورة، أو استخدام شعار RogueByte الافتراضي.
- رمز QR Code إلكتروني ذكي للتحقق من الفاتورة.
- دعم مقاسات الورق الحراري (80mm القياسي، 58mm الصغير، A4).

### 5. ☁️ قاعدة بيانات Google Firebase Firestore السحابية
- مزامنة لحظية (Real-time) بين جميع أجهزة الكاشير والأفرع.
- استمرارية العمل دون إنترنت (Offline-First): يستمر الكاشير بالبيع وإصدار الفواتير حتى في حال انقطاع الشبكة، وتتم المزامنة تلقائياً عند عودة الاتصال.
- قواعد أمان محكمة (`firestore.rules`) لحماية البيانات والفواتير من التعديل غير المصرح به.

### 6. 🇴🇲 العملة الرسمية والضريبة
- العملة الافتراضية: **الريال العماني (OMR / ر.ع.)** بدقة 3 خانات عشرية (1.000).
- ضريبة القيمة المضافة: **5%** المعتمدة في سلطنة عُمان مع إمكانية التعديل.

---

## 👤 بيانات المطور وحقوق الملكية (Project Attribution & Provenance)

- **Original Project**: RogueByte POS
- **Original Developer**: Fares Sid Ahmed (Sido) [@RogueByteOfficial](https://github.com/RogueByteOfficial)
- **Brand**: RogueByte
- **Official Website**: [https://roguebyte.online/](https://roguebyte.online/)
- **GitHub Organization**: [https://github.com/RogueByteOfficial](https://github.com/RogueByteOfficial)
- **Official Repository**: [https://github.com/RogueByteOfficial/RogueByte-POS](https://github.com/RogueByteOfficial/RogueByte-POS)
- **Marketing Director**: Mouahdi Adel (مهدي عادل)

### 📬 Direct Communications & Inquiries / قنوات التواصل
- **General Contact**: contact@roguebyte.online
- **Support & Help / استفسارات**: help@roguebyte.online
- **Business & Partnerships**: business@roguebyte.online
- **Donations & Support**: [https://ko-fi.com/roguebyte](https://ko-fi.com/roguebyte)

---

## 📄 الترخيص (License)

هذا المشروع مرخص بموجب **رخصة MIT (MIT License)** — انظر ملف [LICENSE](LICENSE) لمزيد من التفاصيل.

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2026 RogueByte — Fares Sid Ahmed (Sido) @RogueByteOfficial
```
