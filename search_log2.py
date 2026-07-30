import json

log_file = "/Users/aditya/.gemini/antigravity-ide/brain/01782ec9-12b5-4c26-a102-0b8ffe502350/.system_generated/logs/transcript_full.jsonl"
code_dump = "recovered_code.txt"

found_code = None

with open(log_file, "r") as f:
    for line in f:
        if "export function WalletV4Panel" in line:
            try:
                data = json.loads(line)
                if "tool_calls" in data:
                    for call in data["tool_calls"]:
                        func = call.get("function") or call # handle different formats
                        args = func.get("arguments", {})
                        # If it's write_to_file
                        if "CodeContent" in args and "export function WalletV4Panel" in args["CodeContent"]:
                            found_code = args["CodeContent"]
                        # If it's a command
                        if "CommandLine" in args and "export function WalletV4Panel" in args["CommandLine"]:
                            # Might be a cat EOF
                            found_code = args["CommandLine"]
            except Exception as e:
                pass

if found_code:
    with open(code_dump, "w") as f:
        f.write(found_code)
    print("Code dumped to recovered_code.txt")
else:
    print("Could not find the full code.")
