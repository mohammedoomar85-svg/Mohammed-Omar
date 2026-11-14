"""Turn `npx expo export -p web` output (dist/) into a preview page with relative paths.

Usage: python3 scripts/make_preview.py dist <out_dir>
"""
import pathlib, re, shutil, sys

dist, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
if out.exists():
    shutil.rmtree(out)
shutil.copytree(dist, out)
html = (out / "index.html").read_text()
script = re.search(r'src="/(_expo/[^"]+\.js)"', html).group(1)
# Paths starting with "_" are reserved by the artifact host, so move the bundle.
shutil.move(str(out / "_expo"), str(out / "app"))
script = "app/" + script[len("_expo/"):]
js_path = out / script
js_path.write_text(js_path.read_text().replace('"/assets/', '"assets/'))
(out / "index.html").write_text(f"""<title>Fizz & Play</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
  :root {{ color-scheme: light; }}
  html, body {{ height: 100%; }}
  body {{ overflow: hidden; background: #FFFBF2; }}
  #root {{ display: flex; height: 100%; flex: 1; }}
</style>
<div id="root"></div>
<script src="{script}" defer></script>
""")
print(script)
