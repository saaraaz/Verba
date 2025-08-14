import os
import ast
import json
from typing import Dict

# Path to goldenverba/components
BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "goldenverba", "components")

output: Dict[str, Dict[str, str]] = {
    "component.name": {},
    "component.description": {},
    "config.label": {},
    "config.description": {},
    "config.values": {},
}

JUNK_VALUES = {
    ".", ",", " ", "", "\n", "\n\n", "​", "，", "、", "．", "。"
}

def extract_string(node: ast.AST) -> str:
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    elif isinstance(node, ast.JoinedStr):
        parts = []
        for value in node.values:
            if isinstance(value, ast.Str):
                parts.append(value.s)
            elif isinstance(value, ast.Constant) and isinstance(value.value, str):
                parts.append(value.value)
            elif isinstance(value, ast.FormattedValue):
                parts.append("{{dynamic}}")
            else:
                parts.append("{{unknown}}")
        return "".join(parts)
    elif isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
        return extract_string(node.left) + extract_string(node.right)
    elif isinstance(node, (ast.Attribute, ast.Name)):
        return "{{dynamic}}"
    return "{{unknown}}"

class ComponentVisitor(ast.NodeVisitor):
    def __init__(self):
        self.current_class = None

    def visit_ClassDef(self, node: ast.ClassDef):
        self.current_class = node.name
        self.generic_visit(node)
        self.current_class = None

    def visit_Assign(self, node: ast.Assign):
        if not self.current_class:
            return
        for target in node.targets:
            if isinstance(target, ast.Attribute):
                if target.attr == "name":
                    output["component.name"][self.current_class] = extract_string(node.value)
                elif target.attr == "description":
                    output["component.description"][self.current_class] = extract_string(node.value)
                elif target.attr == "config" and isinstance(node.value, ast.Dict):
                    for key_node, value_node in zip(node.value.keys, node.value.values):
                        self.extract_config_entry(key_node, value_node)
            elif isinstance(target, ast.Subscript):
                self.extract_config_entry(target.slice, node.value)

    def visit_Expr(self, node: ast.Expr):
        if isinstance(node.value, ast.Call):
            call = node.value
            if (
                isinstance(call.func, ast.Attribute)
                and call.func.attr == "update"
                and isinstance(call.func.value, ast.Attribute)
                and call.func.value.attr == "config"
            ):
                if call.args and isinstance(call.args[0], ast.Dict):
                    for key_node, value_node in zip(call.args[0].keys, call.args[0].values):
                        self.extract_config_entry(key_node, value_node)

    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Name) and node.func.id == "InputConfig":
            parent = getattr(node, "parent", None)
            if isinstance(parent, ast.Assign):
                for target in parent.targets:
                    if (
                        isinstance(target, ast.Subscript)
                        and isinstance(target.value, ast.Attribute)
                        and target.value.attr == "config"
                        and isinstance(target.slice, ast.Constant)
                    ):
                        config_key = target.slice.value
                        full_key = f"{self.current_class}.{config_key}"
                        output["config.label"][full_key] = config_key
                        kwarg_dict = {kw.arg: kw.value for kw in node.keywords if kw.arg}
                        self.add_description(full_key, kwarg_dict)
                        self.add_values(full_key, kwarg_dict)
            else:
                print(f"[WARN] InputConfig() without Assign parent in class {self.current_class} (likely inline or dynamic)")

    def extract_config_entry(self, key_node: ast.AST, value_node: ast.AST):
        if isinstance(key_node, ast.Index):
            key_node = key_node.value
        if not isinstance(key_node, ast.Constant) or not isinstance(key_node.value, str):
            return
        config_key = key_node.value
        full_key = f"{self.current_class}.{config_key}"
        output["config.label"][full_key] = config_key
        if isinstance(value_node, ast.Call) and getattr(value_node.func, "id", "") == "InputConfig":
            kwarg_dict = {kw.arg: kw.value for kw in value_node.keywords if kw.arg}
            self.add_description(full_key, kwarg_dict)
            self.add_values(full_key, kwarg_dict)

    def add_description(self, full_key: str, kwarg_dict: dict):
        if "description" in kwarg_dict:
            desc = extract_string(kwarg_dict["description"])
            if desc:
                if full_key not in output["config.description"]:
                    output["config.description"][full_key] = desc
                elif desc != output["config.description"][full_key]:
                    alt_key = f"{full_key} [ALT]"
                    output["config.description"][alt_key] = desc

    def add_values(self, full_key: str, kwarg_dict: dict):
        if "values" in kwarg_dict and isinstance(kwarg_dict["values"], ast.List):
            for elt in kwarg_dict["values"].elts:
                val = extract_string(elt)
                if val and val not in JUNK_VALUES:
                    output["config.values"][f"{full_key}.{val}"] = val

def attach_parents(tree: ast.AST):
    for node in ast.walk(tree):
        for child in ast.iter_child_nodes(node):
            child.parent = node

def process_file(filepath: str):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"[READ ERROR] {filepath}: {e}")
        return
    try:
        tree = ast.parse(content)
        attach_parents(tree)
        visitor = ComponentVisitor()
        visitor.visit(tree)
    except Exception as e:
        print(f"[PARSE ERROR] {filepath}: {e}")

def walk_directory(base_dir: str):
    for root, _, files in os.walk(base_dir):
        for file in files:
            if file.endswith(".py") and not file.startswith("__"):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    walk_directory(BASE_DIR)
    with open("extracted_translation_keys.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print("✅ Extraction complete. Output saved to extracted_translation_keys.json")