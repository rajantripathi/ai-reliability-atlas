"""Build the carousel and downloadable evidence package from the same manifest."""
from pathlib import Path
import json, zipfile
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from PIL import Image, ImageDraw, ImageFont
import fitz

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'outputs'; OUT.mkdir(exist_ok=True)
PDF=OUT/'ai-reliability-atlas-carousel.pdf'
data=json.loads((ROOT/'public/evidence/atlas.json').read_text())
fonts=Path('/System/Library/Fonts/Supplemental')
for name,file in [('AtlasSans','Arial.ttf'),('AtlasBold','Arial Bold.ttf'),('AtlasSerif','Georgia.ttf'),('AtlasItalic','Georgia Italic.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(fonts/file)))
PAPER='#f3f0e8'; INK='#233a32'; MUTED='#626c61'; LIME='#dbe8a4'; ORANGE='#b55230'
c=canvas.Canvas(str(PDF),pagesize=(720,900))
c.setTitle('AI Reliability Atlas - Rajan Tripathi'); c.setAuthor('Rajan Prasad Tripathi')
def text(s,x,y,size=18,font='AtlasSans',color=INK):
    c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,y,s)
def para(s,y,size=20,color=INK,width=610,font='AtlasSans'):
    p=Paragraph(s,ParagraphStyle('p',fontName=font,fontSize=size,leading=size*1.45,textColor=HexColor(color)))
    _,h=p.wrap(width,800);p.drawOn(c,55,y-h);return y-h
def page(n,label):
    c.setFillColor(HexColor(PAPER));c.rect(0,0,720,900,fill=1,stroke=0)
    text('A / R',55,845,22,'AtlasBold');text('AI RELIABILITY ATLAS',155,849,12,'AtlasBold')
    c.setStrokeColor(HexColor('#d1d5c5'));c.line(55,823,665,823)
    text(label.upper(),55,775,12,'AtlasBold',ORANGE)
    c.line(55,78,665,78);text('Rajan Tripathi, PhD',55,48,12);text(f'{n:02d} / 05',615,48,11)
def end(): c.showPage()
page(1,'An interactive field lab')
text('Where AI',55,677,66,'AtlasBold');text('breaks.',55,603,66,'AtlasBold')
text('What the evidence says.',55,521,38,'AtlasItalic')
para('Three experiments in knowledge, perception and authority.',449,24)
for i,(title,desc) in enumerate([('01 / KNOWLEDGE','Can the system find the answer?'),('02 / PERCEPTION','Can it search what is on the page?'),('03 / AUTHORITY','Does it have permission to proceed?')]):
    y=329-i*73;text(title,55,y,12,'AtlasBold',ORANGE);text(desc,55,y-28,20)
end()
page(2,'01 / Knowledge coverage')
para('You cannot retrieve<br/>what is not there.',712,40,font='AtlasSerif')
text('39%',55,494,73,'AtlasSerif');text('to',246,508,22);text('98%',332,494,73,'AtlasSerif')
text('Uzbek retrieval recall',55,451,18,'AtlasBold')
para('Same retriever. Targeted corpus additions.<br/>100 Uzbek questions in a 200-question bilingual comparison.',410,21)
para('Scope matters: missing sources were identified using evaluation-linked information. This measures repair on the same pilot, not generalisation to unseen questions.',283,17,MUTED)
para('Source: SOAS RAG Evaluation, table_baseline_vs_supplements.csv and the supplement v2 methodology report. The Atlas bundles both.',160,12,MUTED)
end()
page(3,'02 / Visual evidence')
para('A page has more to say<br/>than its filename.',712,40,font='AtlasSerif')
for i,(label,value) in enumerate(zip(['Metadata only','VLM summaries','Hybrid retrieval'],[r['recall5'] for r in data['vision']['rows']])):
    y=515-i*89;text(label,55,y,18);text(f'{value*100:.1f}%',570,y,20,'AtlasBold')
    c.setFillColor(HexColor('#dee2d4'));c.rect(55,y-33,610,16,fill=1,stroke=0)
    c.setFillColor(HexColor(INK));c.rect(55,y-33,610*value,16,fill=1,stroke=0)
para('Recall@5 on 339 questions / 100 DocVQA pages.<br/>The metadata baseline omits page text. No OCR baseline was measured, so this does not show VLM superiority to OCR.',245,17,MUTED)
para('Source: CaseLens-VLM / docs/results.md. Retrieval quality is not generated-answer accuracy.',136,12,MUTED)
end()
page(4,'03 / Human authority')
para('Pixels cannot prove<br/>permission.',712,43,font='AtlasSerif')
for i,(label,desc) in enumerate([('SHIP','No blocking issue established'),('REJECT','An explicit violation is observed'),('HUMAN REVIEW','Evidence is ambiguous'),('UNSUPPORTED','Required authority is absent')]):
    y=528-i*74;text(label,55,y,16,'AtlasBold',ORANGE);text(desc,55,y-29,18)
para('Recorded run: 16/19 agreement with provisional author labels; 5 of 24 cases did not complete. Eight images recur across briefs. No validated accuracy or safety claim.',199,16,MUTED)
para('Source: Visual Release Gate. Full run log and all disagreements are inspectable in the Atlas.',112,11,MUTED)
end()
page(5,'Open the evidence')
para('What would make this<br/>answer deserve<br/>our trust?',707,43,font='AtlasSerif')
para('Change a condition.<br/>Inspect a recorded disagreement.<br/>Run the policy sandbox.<br/>Download the decision trace.',471,23)
para('The sandbox evaluates supplied flags in real code. It does not detect attacks or verify permissions automatically.',281,17,MUTED)
text('Explore AI Reliability Atlas',55,167,24,'AtlasBold')
text('LinkedIn: Rajan Tripathi, PhD',55,128,15)
end();c.save()
# Render every final page for visual QA; Poppler is unavailable on this host.
doc=fitz.open(PDF)
for i,p in enumerate(doc):
    p.get_pixmap(matrix=fitz.Matrix(1,1)).save(str(OUT/f'carousel-{i+1}.png'))
assert len(doc)==5
# Small native raster monogram (not an edited image).
icon=Image.new('RGB',(128,128),INK);d=ImageDraw.Draw(icon)
font=ImageFont.truetype(str(fonts/'Arial Bold.ttf'),34);d.text((14,43),'A/R',fill=PAPER,font=font)
icon.save(ROOT/'public/favicon.png')
with zipfile.ZipFile(ROOT/'public/evidence/source-bundle.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted((ROOT/'public/evidence').iterdir()):
        if f.suffix!='.zip': z.write(f,f.name)
    z.write(ROOT/'public/ATTRIBUTION.md','ATTRIBUTION.md')
print(f'Built {PDF}; 5 rendered pages, favicon and source bundle.')
