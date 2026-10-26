<p align="center"><a href="https://mdislamair.github.io/linkpe/linkpe.html"><img alt="LinkPe" src="https://raw.githubusercontent.com/mdislamair/linkpe/main/img/logo.png" width="300vw"/></a></p>
<p align="center">
	<a href="https://github.com/mdislamair"><img alt="Developer" src="https://img.shields.io/badge/Developer-Md%20Islam-success.svg?style=flat-square"/></a>
	<a href="https://github.com/mdislamair/linkpe/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/mdislamair/linkpe.svg?style=flat-square"/></a>
	<a href="https://github.com/mdislamair/linkpe/commits"><img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/mdislamair/linkpe.svg?style=flat-square"/></a>
	<a href="https://github.com/mdislamair/linkpe/stargazers"><img alt="stars-shield" src="https://img.shields.io/github/stars/mdislamair/linkpe.svg?style=flat-square"/></a>
	<a href="https://github.com/mdislamair/linkpe/network/members"><img alt="forks-shield" src="https://img.shields.io/github/forks/mdislamair/linkpe.svg?style=flat-square"/></a>
	<a href="https://github.com/mdislamair/linkpe/issues"><img alt="issues-shield" src="https://img.shields.io/github/issues/mdislamair/linkpe.svg?style=flat-square"/></a>
</p>
<p align="center">
	<a href="https://mdislamair.github.io/linkpe/linkpe.html">View Demo</a>·
	<a href="https://github.com/mdislamair/linkpe/issues/new/choose">Report Bug</a>·
	<a href="https://github.com/mdislamair/linkpe/issues/new/choose">Request Feature</a>
</p>

## About

LinkPe is a free, serverless tool that turns your UPI ID into a clean, shareable payment link. Fill in your details, share the link, and your customer pays with a UPI app or by scanning a QR code. Nothing is stored anywhere.

> This is a fork of [LinkPe by Pt. Prashant Tripathi](https://github.com/PtPrashantTripathi/linkpe), redesigned and extended by [Md Islam](https://github.com/mdislamair). Released under the MIT license.

## 🚀 Screenshot

![LinkPe screens: create a link, share it, and pay](https://raw.githubusercontent.com/mdislamair/linkpe/main/img/screenshot.png)

## 🧐 What's new in this fork

- **Redesigned screens**: a cleaner create page, a result card with copy and share buttons, and a proper payment page.
- **Short links**: the generated link is shortened automatically, for example `https://is.gd/Ab3dEf`. If every shortener is unreachable, you still get a clean standard link.
- **Two ways to pay**: payers choose **UPI apps** (one tap, with GPay, PhonePe, Paytm and BHIM shortcuts) or **Scan QR** (with a Download QR button). Phones open on the apps tab, computers on the QR tab.
- **Safer and tidier**: UPI ID and amount are validated, names from the URL are shown as plain text, and links no longer carry `pn=null&cu=INR` clutter.
- Old links (`?pa=...&pn=...&am=...&cu=INR`) keep working.

## 🧰 Features

- **Use anywhere, in the browser**
- _100% Free_ 😍
- _Scan and Pay support_ 👉
- _No hidden charges_ 🚫
- _Set a fixed amount_ 💰
- _No data storage_ 🎉
- _Supports all UPI apps_ ✅
- _A free alternative to payment gateways that charge 2-5% per transaction_

## 🛠️ Run it locally

```bash
git clone https://github.com/mdislamair/linkpe.git
cd linkpe
npm install
npm start
```

Then open <http://localhost:8081/linkpe.html>.

Short links only work on a public (deployed) site, because the shorteners cannot reach `localhost`. Locally you get the standard link.

## 🌍 Deploy on GitHub Pages

1. Fork or push this repo to your GitHub account.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then pick `main` and `/ (root)`.
4. After a minute your tool is live at `https://<your-username>.github.io/linkpe/linkpe.html`.

## Usage

Use the create page, or build a link yourself:

```
https://mdislamair.github.io/linkpe/?pa={UPI ID}&pn={name}&am={amount}
```

| Parameter | Required | Example          |
| --------- | -------- | ---------------- |
| `pa`      | yes      | `name@ybl`       |
| `pn`      | no       | `Md%20Islam`     |
| `am`      | no       | `250` or `99.50` |

## 🍰 Contributing

Please contribute using [GitHub Flow](https://guides.github.com/introduction/flow). Create a branch, add commits, and [open a pull request](https://github.com/mdislamair/linkpe/compare).

Please read [`CONTRIBUTING`](CONTRIBUTING.md) for details on our [`CODE OF CONDUCT`](CODE_OF_CONDUCT.md), and the process for submitting pull requests.

## 💻 Built with

- Plain HTML, CSS and JavaScript
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) (only for the optional local server)
- [QRious](https://github.com/neocotic/qrious) for QR codes
- [is.gd](https://is.gd), [v.gd](https://v.gd) and [TinyURL](https://tinyurl.com) for short links

## Credits

- Original LinkPe by [Pt. Prashant Tripathi](https://github.com/PtPrashantTripathi) (MIT).
- This fork by [Md Islam](https://github.com/mdislamair).

## Questions and Feedback

[![](https://img.shields.io/badge/github-%23181717.svg?&style=for-the-badge&logo=github&logoColor=white)](https://github.com/mdislamair)
[![](https://img.shields.io/badge/X-%23000000.svg?&style=for-the-badge&logo=x&logoColor=white)](https://x.com/mdislamair)

<p align="center">
<hr>Developed with ❤️ in India 🇮🇳
</p>
