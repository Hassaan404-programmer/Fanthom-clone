import os
import sys
import json
import glob
from datetime import datetime

BRAIN_DIR = r"C:\Users\A.s\.gemini\antigravity-ide\brain"
REPO_ROOT = r"d:\Hassaan Bio\Projects\Fanthom-clone\Fanthom-clone"
AGENT_LOGS_DIR = os.path.join(REPO_ROOT, ".agent-logs")
AUTHOR_HANDLE = "Hassaan404-programmer"
PROJECT_NAME = "Fanthom-clone"
MODEL_NAME = "Gemini 3.6 Flash (High)"
TOOL_NAME = "Google Antigravity"

def process_session(session_dir):
    session_id = os.path.basename(session_dir)
    transcript_path = os.path.join(session_dir, ".system_generated", "logs", "transcript_full.jsonl")
    if not os.path.exists(transcript_path):
        transcript_path = os.path.join(session_dir, ".system_generated", "logs", "transcript.jsonl")
    if not os.path.exists(transcript_path):
        return

    belongs_to_project = False
    lines = []
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            line_str = line.strip()
            if not line_str:
                continue
            lines.append(line_str)
            if "Fanthom-clone" in line_str or "CAPTURE TEST" in line_str or "8x Assignment" in line_str:
                belongs_to_project = True

    if not belongs_to_project:
        return

    exchanges = []
    current_prompt = None
    current_response_chunks = []
    first_prompt_time = None
    last_prompt_time = None

    for line in lines:
        try:
            data = json.loads(line)
        except Exception:
            continue

        src = data.get("source")
        stype = data.get("type")
        created_at = data.get("created_at", "")

        if stype == "USER_INPUT" or (src == "USER_EXPLICIT" and stype == "USER_INPUT"):
            if current_prompt is not None:
                resp_text = "\n".join(current_response_chunks).strip()
                if not resp_text:
                    resp_text = "Completed requested actions and tool executions."
                exchanges.append((current_prompt, resp_text))
                current_response_chunks = []

            raw_prompt = data.get("content") or data.get("user_input") or ""
            current_prompt = {
                "text": raw_prompt.strip(),
                "timestamp": created_at or datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
                "model": MODEL_NAME
            }
            if not first_prompt_time:
                first_prompt_time = created_at
            last_prompt_time = created_at

        elif current_prompt is not None:
            content = data.get("content")
            if stype in ["PLANNER_RESPONSE", "MODEL_RESPONSE", "TEXT_RESPONSE"] or src == "MODEL":
                if content and isinstance(content, str):
                    clean_content = content.strip()
                    if clean_content and not clean_content.startswith("{") and "tool_calls" not in clean_content:
                        current_response_chunks.append(clean_content)

    if current_prompt is not None:
        resp_text = "\n".join(current_response_chunks).strip()
        if not resp_text:
            resp_text = "Completed requested actions and tool executions."
        exchanges.append((current_prompt, resp_text))

    if not exchanges:
        return

    first_time_str = first_prompt_time or datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        dt = datetime.strptime(first_time_str.split(".")[0].rstrip("Z"), "%Y-%m-%dT%H:%M:%S")
        date_str = dt.strftime("%Y-%m-%d")
        time_prefix = dt.strftime("%Y-%m-%d_%H-%M-%S")
    except Exception:
        date_str = datetime.utcnow().strftime("%Y-%m-%d")
        time_prefix = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")

    short_session_id = session_id[:8]
    filename = f"{time_prefix}_{session_id}.md"
    filepath = os.path.join(AGENT_LOGS_DIR, filename)

    os.makedirs(AGENT_LOGS_DIR, exist_ok=True)

    header = f"""---
session_id: {session_id}
date: {date_str}
author: {AUTHOR_HANDLE}
model: {MODEL_NAME}
tool: {TOOL_NAME}
project: {PROJECT_NAME}
total_exchanges: {len(exchanges)}
first_prompt_time: {first_prompt_time or ""}
last_prompt_time: {last_prompt_time or ""}
---

# Session Log - {date_str}

Session: `{short_session_id}` | Project: `{PROJECT_NAME}` | Author: `{AUTHOR_HANDLE}`

---
"""

    body_parts = []
    for idx, (p_info, r_text) in enumerate(exchanges, 1):
        p_entry = f"""[LOG_ENTRY type=PROMPT num={idx} session={short_session_id}]
timestamp: {p_info['timestamp']}
model: {p_info['model']}

{p_info['text']}
"""
        r_entry = f"""[LOG_ENTRY type=RESPONSE num={idx} session={short_session_id}]
timestamp: {p_info['timestamp']}
model: {p_info['model']}

{r_text}
"""
        body_parts.append(p_entry + "\n\n" + r_entry)

    full_md = header + "\n\n" + "\n\n".join(body_parts)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(full_md)
    print(f"Captured: {filepath}")

def main():
    session_dirs = glob.glob(os.path.join(BRAIN_DIR, "*"))
    for s_dir in session_dirs:
        if os.path.isdir(s_dir):
            process_session(s_dir)

if __name__ == "__main__":
    main()
