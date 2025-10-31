import requests
import re
import subprocess

headers = {
    "User-Agent": "AptvPlayer/1.4.16"
}

sub_url = "https://tv.iill.top/m3u/Gather"
resp = requests.get(sub_url, timeout=10)
lines = resp.text.strip().splitlines()

targets = ["CCTV 1", "CCTV 2"]
channels = []
for i in range(len(lines)):
    if lines[i].startswith("#EXTINF"):
        name = re.search(r',(.+)$', lines[i]).group(1)
        if any(t in name for t in targets):
            url = lines[i+1] if i+1 < len(lines) else None
            if url and url.startswith("http"):
                channels.append((name, url))

with open("real_urls.txt", "w") as f:
    f.write("# 提取结果（频道名 + CDN 播放地址）\n\n")

for name, entry_url in channels:
    try:
        cmd = [
            "ffprobe",
            "-v", "debug",
            "-headers", "User-Agent: AptvPlayer/1.4.16\r\n",
            "-i", entry_url
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=15)
        output = result.stdout
        match = re.search(r"Opening '([^']+\.m3u8[^']*)'", output)
        if match:
            real_url = match.group(1)
            result_text = f"# {name}\n{real_url}\n\n"
        else:
            result_text = f"# {name}\n[未提取到 CDN m3u8 地址]\n\n"
    except Exception as e:
        result_text = f"# {name}\n[错误: {str(e)}]\n\n"

    with open("real_urls.txt", "a") as f:
        f.write(result_text)
