import csv
import io
import json
from lxml import etree


def _dict_to_xml(parent: etree._Element, data, tag: str = "item") -> None:
    if isinstance(data, dict):
        for key, value in data.items():
            safe_key = str(key).replace(" ", "_").replace("-", "_")
            child = etree.SubElement(parent, safe_key)
            _dict_to_xml(child, value, tag=safe_key)
    elif isinstance(data, list):
        for item in data:
            child = etree.SubElement(parent, tag)
            _dict_to_xml(child, item, tag="item")
    else:
        parent.text = str(data) if data is not None else ""


def _flatten(data, prefix="", sep=".") -> dict:
    """Recursively flatten a nested dict/list into dot-separated keys."""
    out = {}
    if isinstance(data, dict):
        for k, v in data.items():
            new_key = f"{prefix}{sep}{k}" if prefix else k
            out.update(_flatten(v, new_key, sep))
    elif isinstance(data, list):
        for i, v in enumerate(data):
            new_key = f"{prefix}{sep}{i}" if prefix else str(i)
            out.update(_flatten(v, new_key, sep))
    else:
        out[prefix] = data
    return out


def to_xml(data: dict) -> bytes:
    root_tag = "ITRData"
    if isinstance(data, dict) and len(data) == 1:
        root_tag = next(iter(data))
        data = data[root_tag]

    root = etree.Element(root_tag)
    _dict_to_xml(root, data)
    return etree.tostring(root, pretty_print=True, xml_declaration=True, encoding="UTF-8")


def to_csv(data) -> str:
    if isinstance(data, list):
        rows = [_flatten(item) for item in data]
    else:
        rows = [_flatten(data)]

    if not rows:
        return ""

    all_keys = list(dict.fromkeys(k for row in rows for k in row))
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=all_keys, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow({k: row.get(k, "") for k in all_keys})
    return buf.getvalue()


def to_pretty_json(data) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False)


def convert_json_to_format(data, target_format: str) -> bytes | str:
    if target_format == "xml":
        return to_xml(data)
    if target_format == "csv":
        return to_csv(data)
    if target_format == "json":
        return to_pretty_json(data)
    raise ValueError(f"Unknown format: {target_format}")
