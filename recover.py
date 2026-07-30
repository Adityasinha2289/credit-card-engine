import json
import re
import os

log_file = "/Users/aditya/.gemini/antigravity-ide/brain/01782ec9-12b5-4c26-a102-0b8ffe502350/.system_generated/logs/transcript_full.jsonl"
target_file = "/Users/aditya/Desktop/intern/kartik/credit-card-engine/src/features/finix/components/WalletV4Panel.tsx"

found_content = None

with open(log_file, "r") as f:
    for line in f:
        try:
            data = json.loads(line)
            if "tool_calls" in data:
                for call in data["tool_calls"]:
                    if call["function"]["name"] == "default_api:write_to_file":
                        args = call["function"]["arguments"]
                        if "TargetFile" in args and "WalletV4Panel.tsx" in args["TargetFile"]:
                            found_content = args.get("CodeContent")
        except:
            pass

if found_content:
    with open(target_file, "w") as f:
        f.write(found_content)
    print("Recovered WalletV4Panel.tsx!")
else:
    print("Could not find the original write in transcript.")
