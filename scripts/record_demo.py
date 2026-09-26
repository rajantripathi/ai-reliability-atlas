"""Capture a 40-second walkthrough from actual browser interactions."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
import io

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'outputs'; OUT.mkdir(exist_ok=True)
frames=[]
with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    context=browser.new_context(viewport={'width':1280,'height':900},reduced_motion='reduce')
    page=context.new_page()
    page.goto('http://localhost:3000/',wait_until='networkidle')
    def frame(label,seconds):
        # A caption is part of the recording only, not a simulated application result.
        page.evaluate('''label=>{let el=document.getElementById('demo-caption');if(!el){el=document.createElement('div');el.id='demo-caption';el.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:99999;background:#233a32;color:#f3f0e8;padding:12px 24px;border-radius:4px;font:14px Arial;max-width:90vw;text-align:center;box-shadow:0 5px 20px #0002';document.body.appendChild(el)}el.textContent=label}''',label)
        page.wait_for_timeout(350)
        raw=page.screenshot()
        frames.append((Image.open(io.BytesIO(raw)).convert('RGB'),seconds*1000))
    frame('AI Reliability Atlas · Three experiments. Inspectable evidence.',4)
    panel=page.locator('#experiment-panel')
    page.evaluate("document.getElementById('experiment-panel').scrollIntoView()")
    frame('01 / Knowledge · Historical baseline: 39% Uzbek recall',4)
    page.get_by_role('button',name='Supplement v2',exact=True).click()
    page.evaluate("document.getElementById('experiment-panel').scrollIntoView()")
    frame('Targeted corpus repair: 98% on the same evaluation set',4)
    page.get_by_role('button',name='02 / PERCEPTION').click()
    page.get_by_role('button',name='Hybrid retrieval',exact=True).click()
    page.evaluate("document.getElementById('experiment-panel').scrollIntoView()")
    frame('02 / Perception · Compare evidence layers; no OCR baseline measured',5)
    page.get_by_role('button',name='03 / AUTHORITY').click()
    page.get_by_role('button',name='Confirm client approval',exact=True).click()
    page.locator('.gate-view').scroll_into_view_if_needed()
    frame('03 / Authority · Recorded output: approval cannot be inferred from pixels',5)
    page.get_by_role('button',name='Sit comfortably',exact=True).click()
    page.locator('.gate-view').scroll_into_view_if_needed()
    frame('Disagreements stay visible. Author labels remain provisional.',4)
    page.get_by_role('checkbox',name='Required approval is on file').uncheck()
    page.locator('.sandbox-grid').scroll_into_view_if_needed()
    frame('Policy sandbox · Supplied approval flag removed → UNSUPPORTED',5)
    page.get_by_role('button',name='Inspect source evidence').click()
    frame('Source snapshots, hashes, records and limitations are inspectable',5)
    page.keyboard.press('Escape')
    page.evaluate("document.getElementById('about').scrollIntoView()")
    frame('Rajan Tripathi, PhD · Applied AI engineering and research',4)
    context.close();browser.close()
images=[i.quantize(colors=128) for i,_ in frames]
images[0].save(OUT/'atlas-walkthrough.gif',save_all=True,append_images=images[1:],duration=[ms for _,ms in frames],loop=0,optimize=True)
print('Saved 40-second atlas-walkthrough.gif from real interface states.')
