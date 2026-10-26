"""Build src/assets/brand/logo.svg: outlined "YOURS," over the traced signature (SPEC 2.2).

Not part of the site build; run by hand when the signature or its placement changes.

1. Trace the handwritten signature (dark ink on a light background) into an SVG.
   Needs potrace (brew install potrace) and Node with sharp (installed with Astro); run from the repo root:
     node -e "const sharp=require('sharp');(async()=>{
       const bin=await sharp('signature.jpg').resize({width:1100}).greyscale().blur(0.5).threshold(215).png().toBuffer();
       const {data,info}=await sharp(bin).trim({threshold:10})
         .extend({top:4,bottom:4,left:4,right:4,background:'#fff'}).greyscale().raw().toBuffer({resolveWithObject:true});
       require('fs').writeFileSync('sig.pgm',Buffer.concat([Buffer.from('P5\\n'+info.width+' '+info.height+'\\n255\\n'),data]))})()"
     potrace sig.pgm -s -o signature.svg --turdsize 8 --alphamax 1.0 --opttolerance 0.5 --flat
     (threshold 215 suits ink around grey 160-190 on white paper; adjust for other scans)
2. Build the logo (needs: pip install fonttools brotli):
     python3 scripts/build-logo.py . signature.svg [sig_x] [yours_drop]
   sig_x      signature indent, in units where "YOURS," is 11 high (default 65)
   yours_drop move "YOURS," down without moving the signature (default 5)
"""
import math, re, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

repo, sig_file = sys.argv[1], sys.argv[2]
sig_x = float(sys.argv[3]) if len(sys.argv) > 3 else 65.0
drop = float(sys.argv[4]) if len(sys.argv) > 4 else 5.0
gap = 10.0

font = instancer.instantiateVariableFont(TTFont(f'{repo}/public/fonts/cormorant-garamond.woff2'), {'wght': 600})
upem = font['head'].unitsPerEm
cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font['hmtx']
size = 11.0; scale = size / upem; tracking = 0.32 * upem
baseline = round(font['OS/2'].sCapHeight * scale + 1.0 + drop, 2)

pen = SVGPathPen(gs); x = 0.0; text = 'YOURS,'
for i, ch in enumerate(text):
    g = cmap[ord(ch)]
    gs[g].draw(TransformPen(pen, (scale, 0, 0, -scale, x * scale, baseline)))
    x += hmtx[g][0] + (tracking if i < len(text) - 1 else 0)
yours_w = x * scale

def short(m):
    t = f'{round(float(m.group(0)), 2):.2f}'.rstrip('0').rstrip('.')
    return '0' if t in ('-0', '') else t
yours_d = re.sub(r'-?\d+\.\d+', short, pen.getCommands())

sig = open(sig_file).read()
vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', sig).group(1).split()]
g = re.search(r'<g transform="([^"]+)"[^>]*>(.*?)</g>', sig, re.S)
sig_h = 84.0; sig_s = sig_h / vb[3]; sig_y = size + gap
# Round up, never down, so the viewBox can't clip the signature's last stroke.
width = math.ceil(max(yours_w, sig_x + vb[2] * sig_s) * 10) / 10; height = sig_y + sig_h

open(f'{repo}/src/assets/brand/logo.svg', 'w').write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:g} {height:g}" aria-hidden="true" focusable="false">
<!-- "YOURS," is Cormorant Garamond 600 (SIL OFL) converted to outlines; "Yunya" is Yunya Hsu's handwritten signature traced with potrace. Colours: SPEC 2.1. -->
<path fill="#857467" d="{yours_d}"/>
<g fill="#4a453d" transform="translate({sig_x:g} {sig_y:g}) scale({sig_s:.6f})"><g transform="{g.group(1)}">{g.group(2).strip()}</g></g>
</svg>
''')
print(f'viewBox {width:g} x {height:g}, sig_x {sig_x:g}')
