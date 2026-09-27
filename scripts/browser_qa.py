"""Exercise the actual app in fresh headless Chrome and capture launch media."""
from pathlib import Path
import json
import os
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'outputs'
BASE_URL=os.environ.get('ATLAS_BASE_URL','http://localhost:5173').rstrip('/')
OUT.mkdir(exist_ok=True)

def run():
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        context=browser.new_context(viewport={'width':1440,'height':1000},device_scale_factor=1,reduced_motion='reduce')
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda error: errors.append(str(error)))
        page.goto(BASE_URL+'/',wait_until='networkidle')
        page.get_by_role('heading',level=1).wait_for()
        assert page.title()=='AI Reliability Atlas — Rajan Tripathi'
        page.screenshot(path=str(OUT/'atlas-desktop.png'),full_page=True)
        page.screenshot(path=str(OUT/'atlas-hero.png'))
        panel=page.locator('#experiment-panel')
        page.get_by_role('button',name='Supplement v2',exact=True).click()
        assert '98%' in panel.inner_text()
        assert 'Targeted additions' in panel.inner_text()
        # The demo must compute new rankings and export the actual input corpus.
        lab=page.locator('.retrieval-lab')
        assert 'Travel expense deadline' in lab.locator('.retrieval-comparison article').nth(1).locator('.rank-heading').first.inner_text()
        page.get_by_label('Your search query').fill('annual leave')
        assert 'Annual leave' in lab.locator('.rank-heading').first.inner_text()
        page.get_by_label('Your search query').fill('xyzzzz')
        assert lab.get_by_text('No matching terms.',exact=False).count()==2
        page.get_by_role('button',name='Reset example query',exact=True).click()
        with page.expect_download() as retrieval_dl:
            page.get_by_role('button',name='Download query, corpus & scoring trace').click()
        retrieval_dl.value.save_as(str(OUT/'example-retrieval-trace.json'))
        trace=json.loads((OUT/'example-retrieval-trace.json').read_text())
        assert len(trace['corpora']['baseline'])==3
        assert len(trace['corpora']['repaired'])==4
        assert trace['repaired'][0]['id']=='expense-deadline'
        lab.screenshot(path=str(OUT/'retrieval-lab.png'))
        panel.screenshot(path=str(OUT/'experiment-knowledge.png'))
        page.get_by_role('button',name='Inspect source evidence').click()
        page.get_by_role('dialog').wait_for(state='visible')
        assert 'soas-recall.csv' in page.get_by_role('dialog').inner_text()
        assert 'not validated measures of answer quality' in page.get_by_role('dialog').inner_text()
        assert page.get_by_role('link',name='Read the Atlas code').get_attribute('href')=='https://github.com/rajantripathi/ai-reliability-atlas'
        page.keyboard.press('Escape')
        assert not page.get_by_role('dialog').is_visible()
        page.get_by_role('button',name='02 / PERCEPTION').click()
        page.get_by_role('button',name='Hybrid retrieval',exact=True).click()
        assert '70.8%' in panel.inner_text()
        panel.screenshot(path=str(OUT/'experiment-perception.png'))
        page.get_by_role('button',name='03 / AUTHORITY').click()
        assert 'Ship' in panel.inner_text()
        page.get_by_role('button',name='Confirm client approval',exact=True).click()
        assert 'Unsupported' in page.locator('.verdict-pair').inner_text()
        page.get_by_role('button',name='Sit comfortably',exact=True).click()
        assert 'Disagreement preserved' in panel.inner_text()
        panel.screenshot(path=str(OUT/'experiment-authority.png'))
        page.get_by_text('Open the complete 24-case ledger',exact=True).click()
        page.locator('.filter-controls select').select_option('disagreements')
        assert page.locator('tbody tr').count()==3
        page.locator('.filter-controls select').select_option('incomplete')
        assert page.locator('tbody tr').count()==5
        page.get_by_role('checkbox',name='Required approval is on file').uncheck()
        assert page.locator('.decision-word').inner_text()=='Unsupported'
        page.get_by_role('checkbox',name='A clear violation is observed').check()
        assert page.locator('.decision-word').inner_text()=='Reject'
        with page.expect_download() as dl:
            page.get_by_role('button',name='Download decision trace').click()
        download=dl.value
        download.save_as(str(OUT/'example-policy-trace.json'))
        result=json.loads((OUT/'example-policy-trace.json').read_text())
        assert result['verdict']=='reject'
        assert len([r for r in result['trace'] if r['triggered']])==2
        page.get_by_role('button',name='Reset conditions').click()
        assert page.locator('.decision-word').inner_text()=='Ship'
        page.get_by_role('checkbox',name='Untrusted instruction is flagged').check()
        assert page.locator('.decision-word').inner_text()=='Human review'
        page.locator('#sandbox').screenshot(path=str(OUT/'sandbox.png'))
        page.get_by_role('button',name='For research & teaching').click()
        assert 'independent annotation' in page.locator('.audience-copy').inner_text()
        # Downloadable proof must be reachable, not decorative controls.
        for url in ['/evidence/atlas.json','/evidence/source-bundle.zip','/evidence/reproduce.md','/evidence/reading-notes.md','/ATTRIBUTION.md','/og.png','/favicon.png']:
            response=context.request.get(BASE_URL+url)
            assert response.status==200,(url,response.status)
        for w in [390,768,1440]:
            page.set_viewport_size({'width':w,'height':900})
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'overflow at {w}'
            page.get_by_role('button',name='01 / KNOWLEDGE').click()
            page.evaluate('window.scrollTo(0,0)')
            page.screenshot(path=str(OUT/f'atlas-{w}.png'),full_page=True)
        assert not errors,errors
        # Verify keyboard focus and dialog focus containment.
        page.goto(BASE_URL+'/',wait_until='networkidle')
        page.keyboard.press('Tab')
        assert page.locator('.skip-link').evaluate('(el)=>el===document.activeElement')
        page.get_by_role('button',name='Inspect source evidence').click()
        assert page.get_by_role('dialog').evaluate('(el)=>el.contains(document.activeElement)')
        page.keyboard.press('Escape')
        assert page.get_by_role('button',name='Inspect source evidence').evaluate('(el)=>el===document.activeElement')
        (OUT/'browser-qa.json').write_text(json.dumps({'status':'passed','widths':[390,768,1440],'consoleErrors':errors,'checks':['corpus toggles','retrieval toggles','recorded decisions','24-case filters','priority rules','downloaded trace','reset','source dialog','download links','keyboard focus','no horizontal overflow']},indent=2))
        context.close()
        browser.close()
        print('Browser interaction checks passed. Captures saved in outputs/.')

if __name__=='__main__': run()
