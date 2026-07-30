import json

log_file = "/Users/aditya/.gemini/antigravity-ide/brain/01782ec9-12b5-4c26-a102-0b8ffe502350/.system_generated/logs/transcript_full.jsonl"

with open(log_file, "r") as f:
    for line in f:
        if "export function WalletV4Panel" in line:
            print("FOUND A LINE WITH WalletV4Panel!")
            data = json.loads(line)
            if "tool_calls" in data:
                for call in data["tool_calls"]:
                    if "WalletV4Panel" in str(call):
                        print(f"Tool call: {call['function']['name']}")
                        # dump the first 1000 chars of args to see what it is
                        print(str(call['function']['arguments'])[:1000])
