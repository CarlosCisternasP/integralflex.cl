# Regenera netlify/functions/kb.json (base de conocimiento del asistente IA) desde los manuales PDF y precios.
# Uso (desde la raíz del repo): python3 tools/build_kb.py   — requiere pdftotext y beautifulsoup4
import subprocess,json,re
from bs4 import BeautifulSoup as B
idx=B(open('index.html',encoding='utf-8'),'html.parser')
prods=[]
for c in idx.select('article'):
    links=[a['href'] for a in c.find_all('a',href=True)]
    page=[l for l in links if l.startswith('productos/')]
    if not page:continue
    slug=page[0].split('/')[1][:-5]
    name={'legalflex':'LegalFlex'}.get(slug) or c.find(['h3','h2']).get_text(strip=True)
    app=[l for l in links if l.startswith('http')]
    desc=' '.join(p.get_text(' ',strip=True) for p in c.find_all('p'))[:400]
    prods.append(dict(slug=slug,name=name,page='https://integralflex.cl/productos/%s.html'%slug,manual='https://integralflex.cl/assets/docs/manual-%s.pdf'%slug,app=app[0] if app else '',desc=desc))
chunks=[]
def add(prod,title,text):
    text=re.sub(r'[ \t]+',' ',text);text=re.sub(r'\n{2,}','\n',text).strip()
    paras=[p.strip() for p in text.split('\n') if len(p.strip())>2]
    cur=''
    for p in paras:
        if len(cur)+len(p)>1100 and cur:
            chunks.append(dict(p=prod,t=title,x=cur));cur=''
        cur+=p+'\n'
    if cur.strip():chunks.append(dict(p=prod,t=title,x=cur))
for pr in prods:
    t=subprocess.run(['pdftotext','-layout' if False else '-raw','assets/docs/manual-%s.pdf'%pr['slug'],'-'],capture_output=True,text=True).stdout
    t=re.sub(r'Manual de usuario · .*?\n','',t);t=re.sub(r'\n\d+ / \d+\n','\n',t);t=t.replace('\f','\n')
    # join wrapped lines
    t=re.sub(r'(?<![.:;!?])\n(?=[a-záéíóúñ(])',' ',t)
    add(pr['name'],'Manual de '+pr['name'],t)
# pricing + support
pl=idx.select_one('#planes')
add('Precios','Planes y precios de la suite',pl.get_text('\n',strip=True))
sv=B(open('productos/servicesdesk.html',encoding='utf-8'),'html.parser').select_one('main') or B(open('productos/servicesdesk.html',encoding='utf-8'),'html.parser').body
for x in sv.select('script,nav,footer,header'):x.decompose()
add('ServiceDesk (soporte remoto)','Servicio de soporte remoto ServiceDesk',sv.get_text('\n',strip=True))
json.dump(dict(products=prods,chunks=chunks),open('netlify/functions/kb.json','w',encoding='utf-8'),ensure_ascii=False)
print(len(prods),len(chunks),sum(len(c['x']) for c in chunks))
