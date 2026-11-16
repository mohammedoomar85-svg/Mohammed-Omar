// textPath(fontFile, text) -> {subs:[{d,bbox}], width}; font units, y down, baseline y=0
const fs=require('fs');
module.exports=async function(fontFile,text){
  const hb=await require('harfbuzzjs');
  const blob=hb.createBlob(fs.readFileSync(fontFile));const face=hb.createFace(blob,0);const font=hb.createFont(face);
  const buf=hb.createBuffer();buf.addText(text);buf.guessSegmentProperties();hb.shape(font,buf);
  const out=buf.json();let x=0;const subs=[];
  for(const g of out){const p=font.glyphToPath(g.g);const ox=x+g.dx,oy=g.dy;x+=g.ax;if(!p)continue;
    for(const sp of p.split(/(?=M)/)){let bb=[1e9,1e9,-1e9,-1e9];
      const d=sp.replace(/([MLQCZ])([^MLQCZ]*)/g,(m,c,args)=>{const n=args.trim()?args.trim().split(/[ ,]+/).map(Number):[];const r=[];
        for(let i=0;i<n.length;i+=2){const X=n[i]+ox,Y=-(n[i+1]+oy);bb=[Math.min(bb[0],X),Math.min(bb[1],Y),Math.max(bb[2],X),Math.max(bb[3],Y)];r.push(X.toFixed(1),Y.toFixed(1));}
        return c+r.join(' ');});
      subs.push({d,bbox:bb,glyph:g.g});}}
  buf.destroy();font.destroy();face.destroy();blob.destroy();
  return {subs,width:x};
};
