from __future__ import annotations

import argparse
import json
import re
import tempfile
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET


MOJIBAKE_CHARS = {ord(ch) for ch in "鍩鍔涓惧叏鏅璁缁闅銆锛鈥€鎭鏃鍒浣"}
LIKELY_GOOD_CHARS = {ord(ch) for ch in "的一是在不有人和为与力量训练营养运动员宏量算法数据库研究报告周期恢复体重蛋白脂肪碳水热量风险目标减脂增肌常规重训轻训休息"}
GOOD_PUNCT = "，。；：（）《》、%"
XML_TEXT_SUFFIXES = ("}t", "}delText", "}instrText")
DECIMAL_ATTR_RE = re.compile(r'([A-Za-z0-9:_-]+)="(-?\d+\.\d+)"')
XML_DECL_RE = re.compile(r'^<\?xml[^>]*\?>')


def score_text(text: str) -> int:
    common = sum(1 for ch in text if ord(ch) in LIKELY_GOOD_CHARS)
    mojibake = sum(1 for ch in text if ord(ch) in MOJIBAKE_CHARS)
    replacement = text.count("?") + text.count("\ufffd")
    punct = sum(1 for ch in text if ch in GOOD_PUNCT)
    return (common * 4) + punct - (mojibake * 5) - (replacement * 3)


def looks_mojibake(text: str) -> bool:
    if not text or not any(ord(ch) > 127 for ch in text):
        return False
    marker_hits = sum(1 for ch in text if ord(ch) in MOJIBAKE_CHARS)
    weird_punct = any(token in text for token in ("锛", "銆", "鈥", "€"))
    return marker_hits >= 2 or weird_punct


def maybe_repair_text(text: str) -> tuple[str, bool]:
    if not looks_mojibake(text):
        return text, False

    best = text
    best_score = score_text(text)
    for encoding in ("gb18030", "gbk", "cp936"):
        try:
            candidate = text.encode(encoding, errors="strict").decode("utf-8", errors="strict")
        except Exception:
            continue
        candidate_score = score_text(candidate)
        if candidate_score > best_score:
            best = candidate
            best_score = candidate_score

    return best, best != text


def repair_xml(xml_path: Path) -> dict:
    raw_xml = xml_path.read_text(encoding="utf-8")
    raw_xml = XML_DECL_RE.sub('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', raw_xml, count=1)
    attr_changes = 0

    def replace_decimal_attr(match: re.Match[str]) -> str:
        nonlocal attr_changes
        attr_name = match.group(1)
        if attr_name == "version":
            return match.group(0)
        value = float(match.group(2))
        rounded = str(int(round(value)))
        if rounded != match.group(2):
            attr_changes += 1
        return f'{attr_name}="{rounded}"'

    normalized_xml = DECIMAL_ATTR_RE.sub(replace_decimal_attr, raw_xml)
    if attr_changes:
        xml_path.write_text(normalized_xml, encoding="utf-8")

    parser = ET.XMLParser(target=ET.TreeBuilder(insert_comments=True))
    tree = ET.parse(xml_path, parser=parser)
    root = tree.getroot()
    changed = 0
    samples = []

    for elem in root.iter():
        if not any(elem.tag.endswith(suffix) for suffix in XML_TEXT_SUFFIXES):
            continue
        if elem.text is None:
            continue
        fixed, did_change = maybe_repair_text(elem.text)
        if did_change:
            if len(samples) < 8:
                samples.append(
                    {
                        "before": elem.text[:80].encode("unicode_escape").decode(),
                        "after": fixed[:80].encode("unicode_escape").decode(),
                    }
                )
            elem.text = fixed
            changed += 1

    if changed:
        tree.write(xml_path, encoding="utf-8", xml_declaration=True)

    return {
        "file": xml_path.name,
        "attribute_changes": attr_changes,
        "changed_nodes": changed,
        "samples": samples,
    }


def build_docx(input_docx: Path, output_docx: Path, report_path: Path | None) -> dict:
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_root = Path(tmp_dir)
        with zipfile.ZipFile(input_docx, "r") as archive:
            archive.extractall(tmp_root)

        reports = []
        xml_files = []
        for pattern in ("word/*.xml", "docProps/*.xml", "customXml/*.xml"):
            xml_files.extend(tmp_root.glob(pattern))

        for xml_file in xml_files:
            reports.append(repair_xml(xml_file))

        if output_docx.exists():
            output_docx.unlink()

        with zipfile.ZipFile(output_docx, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for file_path in sorted(tmp_root.rglob("*")):
                if file_path.is_dir():
                    continue
                archive.write(file_path, file_path.relative_to(tmp_root).as_posix())

    summary = {
        "input": input_docx.name,
        "output": output_docx.name,
        "files_scanned": len(xml_files),
        "files_changed": sum(1 for item in reports if item["changed_nodes"] > 0 or item["attribute_changes"] > 0),
        "attribute_changes": sum(item["attribute_changes"] for item in reports),
        "nodes_changed": sum(item["changed_nodes"] for item in reports),
        "details": [item for item in reports if item["changed_nodes"] > 0 or item["attribute_changes"] > 0],
    }

    if report_path:
        report_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    return summary


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_docx")
    parser.add_argument("output_docx")
    parser.add_argument("--report", default=None)
    args = parser.parse_args()

    input_docx = Path(args.input_docx).resolve()
    output_docx = Path(args.output_docx).resolve()
    output_docx.parent.mkdir(parents=True, exist_ok=True)
    report_path = Path(args.report).resolve() if args.report else None

    summary = build_docx(input_docx, output_docx, report_path)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
