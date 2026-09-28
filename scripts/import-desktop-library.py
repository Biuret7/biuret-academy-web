"""Export only public curriculum records from the desktop Academy.

The source database is opened read-only. User progress, authentication records,
private keys and application source never enter the web build.
"""

import ast
import base64
import json
import math
import re
import sqlite3
import sys
import zlib
from pathlib import Path


SOURCE = Path(__file__).resolve().parents[2] / "Biuret_Academy"
OUTPUT = Path(__file__).resolve().parents[1] / "content" / "desktop-library.json"


def assignment(path, name):
    tree = ast.parse(path.read_text(encoding="utf-8"))
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(target, ast.Name) and target.id == name for target in node.targets
        ):
            return node.value
    raise ValueError(f"Missing public content: {name}")


def literal(node):
    """Decode source data literals without importing or executing source modules."""
    if isinstance(node, ast.Name):
        return node.id  # UI color constants only
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
        args = [literal(arg) for arg in node.args]
        if node.func.id == "_dec" and len(args) == 1:
            return zlib.decompress(base64.b64decode(args[0])).decode("utf-8")
        if node.func.id == "_evidence" and len(args) == 6:
            return dict(zip(("id", "icon", "title", "detail", "tag", "relevant"), args))
        if node.func.id == "_choice" and len(args) == 6:
            return dict(zip(("id", "title", "detail", "points", "explanation", "color"), args))
    if isinstance(node, ast.Dict):
        return {literal(k): literal(v) for k, v in zip(node.keys, node.values)}
    if isinstance(node, (ast.List, ast.Tuple)):
        return [literal(item) for item in node.elts]
    return ast.literal_eval(node)


EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def redact_examples(value):
    """Keep instructional meaning without shipping example addresses as contact data."""
    if isinstance(value, str):
        return EMAIL.sub("[training-address]", value)
    if isinstance(value, list):
        return [redact_examples(item) for item in value]
    if isinstance(value, dict):
        return {key: redact_examples(item) for key, item in value.items()}
    return value


def main():
    db = SOURCE / "academy.db"
    if not db.is_file():
        raise SystemExit(f"Desktop curriculum database missing: {db}")
    connection = sqlite3.connect(f"file:{db.as_posix()}?mode=ro", uri=True)
    categories = [
        {"id": f"desktop-{row[0]}", "title": row[1], "icon": row[2],
         "description": row[3], "order": row[4], "lessons": []}
        for row in connection.execute(
            "SELECT id,name,icon,description,order_num FROM categories ORDER BY order_num,id"
        )
    ]
    by_id = {int(item["id"].split("-")[-1]): item for item in categories}
    for row in connection.execute(
        "SELECT id,category_id,title,content,difficulty,order_num FROM topics "
        "ORDER BY category_id,order_num,id"
    ):
        by_id[row[1]]["lessons"].append({
            "id": f"desktop-topic-{row[0]}", "title": row[2],
            "content": row[3], "difficulty": row[4], "order": row[5],
        })
    tools = [dict(zip(("name", "category", "description", "usage", "example", "platform"), row))
             for row in connection.execute(
                 "SELECT name,category,description,usage,example,platform FROM tools ORDER BY id"
             )]
    connection.close()

    curriculum = SOURCE / "data" / "curriculum_v5.py"
    new_topics = literal(assignment(curriculum, "NEW_TOPICS"))
    new_categories = literal(assignment(curriculum, "NEW_CATEGORIES"))
    descriptions = ast.literal_eval(assignment(curriculum, "CATEGORY_DESCRIPTIONS"))
    enhancements = ast.literal_eval(assignment(curriculum, "EXISTING_TOPIC_ENHANCEMENTS"))
    for category in categories:
        category["description"] = descriptions.get(category["title"], category["description"])
        for lesson in category["lessons"]:
            extra = enhancements.get((category["title"], lesson["title"]))
            if extra and extra[:40] not in lesson["content"]:
                lesson["content"] += "\n\n" + extra
        additions = new_topics.get(category["title"], [])
        for index, (title, content, difficulty) in enumerate(additions, 1):
            if not any(lesson["title"] == title for lesson in category["lessons"]):
                category["lessons"].append({
                    "id": f"desktop-v5-{category['id']}-{index}", "title": title,
                    "content": content, "difficulty": difficulty,
                    "order": len(category["lessons"]) + 1,
                })
    for index, (title, icon, description, order, topics) in enumerate(new_categories, 1):
        categories.append({
            "id": f"desktop-v5-category-{index}", "title": title,
            "icon": icon, "description": description, "order": order,
            "lessons": [
                {"id": f"desktop-v5-{index}-{lesson_index}", "title": lesson_title,
                 "content": content, "difficulty": difficulty, "order": lesson_index}
                for lesson_index, (lesson_title, content, difficulty) in enumerate(topics, 1)
            ],
        })

    metadata_source = SOURCE / "data" / "learning_content.py"
    metadata_tree = ast.parse(metadata_source.read_text(encoding="utf-8"))
    source_refs = {}
    for node in metadata_tree.body:
        if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name):
            name = node.targets[0].id
            if name.startswith("_") and isinstance(node.value, ast.Dict):
                source_refs[name] = literal(node.value)
    profiles = literal(assignment(metadata_source, "CATEGORY_PROFILES"))
    for category in categories:
        profile = profiles[category["order"]]
        previous = None
        for lesson in category["lessons"]:
            title = lesson["title"]
            words = re.findall(r"[\w\u0600-\u06ff]+", lesson["content"] or "")
            lesson["metadata"] = {
                "objectives": [f"اشرح «{title}» بلغتك الخاصة دون الرجوع إلى النص.",
                               profile["skill"],
                               "ميّز بين المعلومة المؤكدة والافتراض، وحدد خطوة تحقق آمنة."],
                "prerequisites": [f"إتقان الدرس السابق: {previous}" if previous else
                                  ("لا توجد متطلبات مسبقة" if category["order"] == 1 else
                                   "معرفة أساسيات الأمن السيبراني ومبدأ الاستخدام المصرّح")],
                "estimatedMinutes": max(10, min(45, math.ceil(len(words) / 120) + 8)),
                "exercise": f"تمرين آمن — {title}: {profile['practice']}",
                "sources": [source_refs[ref] for ref in profile["sources"]],
            }
            previous = title

    main_file = SOURCE / "main.py"
    store_categories = literal(assignment(main_file, "_STORE_CATS"))
    roadmap_paths = literal(assignment(main_file, "_ROADMAP_PATHS"))
    main_tree = ast.parse(main_file.read_text(encoding="utf-8"))
    cert_node = next(node.value for node in ast.walk(main_tree)
                     if isinstance(node, ast.Assign) and any(
                         isinstance(target, ast.Name) and target.id == "CERTS"
                         for target in node.targets))
    certificates = literal(cert_node)
    quizzes = literal(assignment(main_file, "QUIZ_DATA"))
    challenges = literal(assignment(main_file, "CHALLENGE_DATA"))
    labs = literal(assignment(main_file, "LAB_DATA"))
    operations = literal(assignment(SOURCE / "cyber_operations.py", "OPERATIONS"))
    for lab in labs:
        artifact = SOURCE / "labs" / lab["artifact"]
        lab["sample"] = artifact.read_text(encoding="utf-8") if artifact.is_file() else ""

    result = {
        "source": "Biuret Academy desktop public curriculum; imported for unverified practice",
        "categories": categories,
        "tools": tools,
        "quizzes": quizzes,
        "challenges": challenges,
        "labs": labs,
        "operations": operations,
        "storeCategories": store_categories,
        "roadmapPaths": roadmap_paths,
        "certifications": [
            {"name": row[0], "provider": row[1], "difficulty": row[2],
             "description": row[4], "note": row[7]}
            for row in certificates
        ],
    }
    result = redact_examples(result)
    count = sum(len(category["lessons"]) for category in categories)
    if count != 99 or len(categories) != 18:
        raise SystemExit(f"Unexpected curriculum size: {len(categories)} courses, {count} lessons")
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Exported {len(categories)} courses, {count} lessons, {len(tools)} tools, "
          f"{len(quizzes)} quizzes, {len(challenges)} challenges, "
          f"{len(labs)} labs, {len(operations)} operations, "
          f"{len(roadmap_paths)} roadmaps, {len(certificates)} certifications")


if __name__ == "__main__":
    main()
