import json
import re

log_path = r"C:\Users\RISHVANTH A\.gemini\antigravity-ide\brain\c43a8705-3d9e-485f-9089-e2148dfbbb6e\.system_generated\logs\transcript.jsonl"

file_lines = {}

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            entry = json.loads(line)
            if entry.get("type") == "TOOL_RESPONSE":
                content = entry.get("content", "")
                if "AuthModal.tsx" in content and "The following code has been modified" in content:
                    lines = content.splitlines()
                    for l in lines:
                        match = re.match(r"^(\d+): (.*)", l)
                        if match:
                            num = int(match.group(1))
                            text = match.group(2)
                            file_lines[num] = text
                        else:
                            # Might be empty line
                            match_empty = re.match(r"^(\d+):$", l)
                            if match_empty:
                                num = int(match_empty.group(1))
                                file_lines[num] = ""
        except Exception as e:
            pass

if not file_lines:
    print("No lines found!")
else:
    max_line = max(file_lines.keys())
    print(f"Recovered up to line {max_line}")
    out_lines = []
    for i in range(1, max_line + 1):
        out_lines.append(file_lines.get(i, ""))
    
    with open(r"d:\Roteen\Roteen\website\src\features\auth\components\AuthModal.tsx", "w", encoding="utf-8") as out:
        out.write("\n".join(out_lines) + "\n")
    print("File written successfully.")
