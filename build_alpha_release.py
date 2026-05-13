#!/usr/bin/env python3
"""
Build the static alpha-release package.

Usage:
    python build_alpha_release.py
    python build_alpha_release.py --zip
"""

from __future__ import annotations

import os
import shutil
import sys
import zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
DST = os.path.join(ROOT, "alpha-release")

REQUIRED = [
    "index.html",
    "app_state.js",
    "daily_flow_engine.js",
    "app_ui.css",
    "单日计划_轻量模式.html",
    "模块一_用户档案.html",
    "模块二_碳水预算引擎.html",
    "模块三_每周训练安排.html",
    "模块四_单日仪表盘.html",
    "模块五_长期计划.html",
    "补剂时序生成器.html",
    "supplement_rule_engine.js",
    "supplement_rules.json",
    "macro_rule_engine.js",
    "macro_algorithm_rules.json",
]

# Release note: homepage and module4 now share daily_flow_engine.js for a unified event source, while keeping the existing UI layout.

FORBIDDEN_EXTS = {".docx", ".py", ".md", ".env"}
FORBIDDEN_FILES = {"__codex_storage_tools.html", "macro_docx_repair_report.json"}
FORBIDDEN_DIRS = {"docx_extracts", "macro_docx_render", "__pycache__"}


def gen_readme() -> str:
    return """力量举全景数字教练 - Alpha 试用包
推荐使用方式

1. 直接打开 index.html
2. 在首页选择三种模式之一：
   - 轻量单日计划
   - 周计划模式
   - 长期周期计划（实验功能）

主流程说明
- 轻量单日计划：直接进入“单日计划_轻量模式.html”，填写今天训练、作息和补剂清单后，跳转今日作战图
- 周计划模式：先设置档案与本周训练，再生成营养预算，最后查看今日作战图
- 长期周期计划：仅用于 4 周 block 草稿，不自动覆盖当前周执行计划

本地运行

    cd alpha-release
    python -m http.server 8000
    打开 http://localhost:8000/index.html

说明

- 所有数据保存在当前浏览器 localStorage
- 不会上传到服务器
- 本工具仅用于训练营养规划参考，不构成医疗诊断或治疗建议
- 当前版本不启用赛前极限脱水协议
"""


def gen_feedback() -> str:
    return """力量举全景数字教练 - Alpha 反馈模板

测试日期：             浏览器：
设备：

1. 三种使用方式是否清晰？
2. 轻量单日计划是否能独立使用？
3. 周计划模式是否仍然顺畅？
4. 补剂页是否不再承担单日训练录入？
5. 今日作战图里的训练来源是否容易理解？
6. 次日入睡时间显示是否正确？
7. 还有哪些地方仍显得复杂或重复？
"""


def scan_forbidden(path: str) -> list[str]:
    bad: list[str] = []
    for dirpath, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in FORBIDDEN_DIRS]
        rel_dir = os.path.relpath(dirpath, path)
        for filename in files:
            ext = os.path.splitext(filename)[1].lower()
            rel_file = os.path.join(rel_dir, filename) if rel_dir != "." else filename
            if ext in FORBIDDEN_EXTS or filename in FORBIDDEN_FILES:
                bad.append(rel_file)
    return bad


def build_zip() -> str:
    zip_path = os.path.join(ROOT, "alpha-release.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for dirpath, _, files in os.walk(DST):
            for filename in files:
                full_path = os.path.join(dirpath, filename)
                archive.write(full_path, os.path.relpath(full_path, ROOT))
    return zip_path


def main() -> None:
    print("=" * 60)
    print("Build Alpha Release")
    print("=" * 60)

    missing = [name for name in REQUIRED if not os.path.exists(os.path.join(ROOT, name))]
    if missing:
        print("Missing required files:")
        for item in missing:
            print(" -", item)
        sys.exit(1)

    if os.path.exists(DST):
        shutil.rmtree(DST)
    os.makedirs(DST, exist_ok=True)

    print("\nCopy runtime files:")
    for name in REQUIRED:
        shutil.copy2(os.path.join(ROOT, name), os.path.join(DST, name))
        print(" -", name)

    daily_flow_path = os.path.join(DST, "daily_flow_engine.js")
    if not os.path.exists(daily_flow_path):
        shutil.copy2(os.path.join(ROOT, "daily_flow_engine.js"), daily_flow_path)
        print(" -", "daily_flow_engine.js", "(recovered)")

    with open(os.path.join(DST, "README_试用说明.txt"), "w", encoding="utf-8") as file:
        file.write(gen_readme())
    with open(os.path.join(DST, "反馈模板.txt"), "w", encoding="utf-8") as file:
        file.write(gen_feedback())

    bad = scan_forbidden(DST)
    if bad:
        print("\nForbidden files found:")
        for item in bad:
            print(" -", item)
        sys.exit(1)

    if "--zip" in sys.argv:
        zip_path = build_zip()
        print("\nZip written:", zip_path)

    file_count = sum(len(files) for _, _, files in os.walk(DST))
    total_size = sum(
        os.path.getsize(os.path.join(dirpath, filename))
        for dirpath, _, files in os.walk(DST)
        for filename in files
    )

    print("\nDone")
    print("Files:", file_count)
    print("Size:", f"{total_size // 1024} KB")
    print("Output:", DST)


if __name__ == "__main__":
    main()
