# 💸🌙 FluxCash - Personal Finance Manager

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: On Hold](https://img.shields.io/badge/status-on%20hold-orange.svg)](#)

**FluxCash** is a modern, automated personal financial management application built with **Python** and **PySide6**. It is engineered to streamline asset tracking, optimize monthly budget distributions, and automate expense classification using local data processing, wrapped in a high-contrast dark/neon user interface.

> ⚠️ **Project Status: On Hold** – This repository is currently paused for architectural refactoring. The core authentication modules, manual ledger architecture, and string-parsing categorization logic are fully functional.

---

## 📸 Preview
*Insert a dark/neon screenshot of your FluxCash PySide6 interface or login screen here!*

---

## ⚡ Core Architecture & Engineering

### 🧠 Reverse Keyword Mapping (Automated Categorization)
Instead of forcing users to manually assign categories to every transaction, FluxCash implements a string-parsing algorithm that reads transaction descriptions (e.g., `UBER *TRIP` or `NETFLIX COM`) and automatically maps them to pre-defined financial categories (`Transport`, `Entertainment`). This significantly reduces user friction during ledger updates.

### 🔒 Secure Authentication Layer
The software features a fully implemented login system equipped with strict **email format validation** and credential verification, ensuring that personal financial ledgers remain isolated and secure on local deployments.

---

## ✨ Features

* **[x] Secure Authentication:** Login screen with robust email formatting checks and credential validation.
* **[x] Reverse Mapping Engine:** Automated transaction tagging using contextual keyword parsing.
* **[x] Manual Financial Ledger:** Full CRUD capabilities to track income, expenses, and current available balance.
* **[ ] Automated Investment Rules (Roadmap):** Calculation of remaining disposable income against strict monthly investment targets.
* **[ ] Shared Portfolio Logic (Roadmap):** Multi-user contribution tracking designed for joint portfolios or shared couples' investments, computing proportional capital injection.

---

## 🛠️ Technology Stack

* **Language:** Python 3.10+
* **GUI Framework:** PySide6 (Qt for Python)
* **Database / Backend Concept:** Modular architecture prepared for lightweight data persistence and relational user structures.

---

## 📧 Contact
Developed by **Pedro Campagnolo**. Check the repository documentation for setup instructions or structural breakdowns.

**FluxCash** - Automating financial flow with high-contrast precision. 💸
