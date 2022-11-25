import{S as Kl,i as Hl,s as Wl,k as c,q as p,a as E,l as d,m as f,r as b,h as s,c as w,n as u,I as ut,b as D,G as l,J as H,K as N,u as pe,B as Kt,L as zl,M as fr,o as Gl,N as dr,O as Fl}from"../../chunks/index-18a3bc3c.js";const j={INVALID:0,SIN:1,ADD:2,SUB:3,MUL:4,DIV:5,POW:6,MOD:7,IF:8,EQ:9,GT:10,LT:11,AND:12,OR:13,VAL:14,VAR_T:15,VAR_I:16,END:17},Jl=j,Ql=t=>t.split("").map((r,e)=>r==="("?{type:"OPEN_PARAN",rawValue:r,index:e}:r===")"?{type:"CLOSE_PARAN",rawValue:r,index:e}:r===" "?{type:"WHITESPACE",rawValue:r,index:e}:r==="+"?{type:"OPERATOR",operator:"ADD",rawValue:r,index:e}:r==="-"?{type:"OPERATOR",operator:"SUB",rawValue:r,index:e}:r==="*"?{type:"OPERATOR",operator:"MUL",rawValue:r,index:e}:r==="/"?{type:"OPERATOR",operator:"DIV",rawValue:r,index:e}:r==="%"?{type:"OPERATOR",operator:"MOD",rawValue:r,index:e}:r==="^"?{type:"OPERATOR",operator:"POW",rawValue:r,index:e}:r===">"?{type:"OPERATOR",operator:"GT",rawValue:r,index:e}:r==="<"?{type:"OPERATOR",operator:"LT",rawValue:r,index:e}:r==="="?{type:"OPERATOR",operator:"EQ",rawValue:r,index:e}:r===","?{type:"OPERATOR",operator:"SEP",rawValue:r,index:e}:r==="&"?{type:"OPERATOR",operator:"AND",rawValue:r,index:e}:r==="|"?{type:"OPERATOR",operator:"OR",rawValue:r,index:e}:{type:"LITERAL",value:r,rawValue:r,index:e}),Ul=[["SEP"],["AND","OR"],["GT","LT","EQ"],["MOD"],["ADD","SUB"],["DIV","MUL"]];class wt extends Error{constructor(r,e){super(r),this.index=e}}const Mt=(t,r)=>{if(t.length===0)throw new wt("Expected an expression",r);for(let a=0;a<Ul.length;a++){const v=Ul[a];let m=0;for(let h=0;h<t.length;h++){const _=t[h];if(_.type==="OPEN_PARAN"&&(m+=1),_.type==="CLOSE_PARAN"&&(m-=1),_.type==="OPERATOR"&&m==0&&v.includes(_.operator))return{type:"operator",op:_.operator,a:Mt(t.slice(0,h),t[0].index+1),b:Mt(t.slice(h+1),_.index+1),index:_.index}}}let e="",o=-1;for(let a=0;a<t.length;a++){const v=t[a];if(v.type==="LITERAL"&&(e+=v.value,o===-1&&(o=v.index)),v.type==="OPEN_PARAN"){if(t.slice(-1)[0].type!=="CLOSE_PARAN")throw new wt("Unmatched opening parenthesis",v.index);if(e){const m=Mt(t.slice(a+1,-1),v.index),h=[],_=g=>{g.type==="operator"&&g.op==="SEP"?(_(g.a),_(g.b)):h.push(g)};return _(m),{type:"call",name:e,args:h,index:o}}else return Mt(t.slice(a+1,-1),v.index)}}const n=t.find(a=>a.type!=="LITERAL");if(n)throw new wt(`Unexpected token: ${n.rawValue}`,n.index);return e=t.map(a=>a.value).join(""),isNaN(parseInt(e,10))?{type:"variable",name:e,index:t[0].index}:{type:"value",val:parseInt(e,10),index:t[0].index}},Et=t=>{if(t.type==="call"){if(t.name==="if")return[...Et(t.args[0]),...Et(t.args[1]),...Et(t.args[2]),j.IF];if(t.name==="sin")return[...Et(t.args[0]),j.SIN];throw new wt(`Invalid function: ${t.name}`,t.index)}else if(t.type==="operator"){const r=Jl[t.op];if(r===void 0)throw new wt(`Invalid operator: ${t.op}`,t.index);return[...Et(t.a),...Et(t.b),r]}else{if(t.type==="value")return[j.VAL,t.val];if(t.type==="variable"){if(t.name==="i")return[j.VAR_I];if(t.name==="t")return[j.VAR_T];throw new wt(`Unknown variable: ${t.name}`,t.index)}else throw new Error("INVALID TYPE")}},Yl=t=>{try{const r=Ql(t),e=Mt(r.filter(n=>n.type!=="WHITESPACE"),0);return{compiled:Et(e)}}catch(r){if(r instanceof wt)return{error:`Error: ${r.message}
    ${t}
    ${" ".repeat(r.index)}^`,errorRaw:r};throw r}},Zl=(t,r,e)=>{var o=0,n=0,a=0,v,m,h,_,g;switch(v=Math.floor(t*6),m=t*6-v,h=e*(1-r),_=e*(1-m*r),g=e*(1-(1-m)*r),v%6){case 0:o=e,n=g,a=h;break;case 1:o=_,n=e,a=h;break;case 2:o=h,n=e,a=g;break;case 3:o=h,n=_,a=e;break;case 4:o=g,n=h,a=e;break;case 5:o=e,n=h,a=_;break}return{r:Math.round(o*255),g:Math.round(n*255),b:Math.round(a*255)}},Fr=100;let Ml=0;const Xl=[128,131,134,137,140,143,146,149,152,156,159,162,165,168,171,174,176,179,182,185,188,191,193,196,199,201,204,206,209,211,213,216,218,220,222,224,226,228,230,232,234,235,237,239,240,242,243,244,246,247,248,249,250,251,251,252,253,253,254,254,254,255,255,255,255,255,255,255,254,254,253,253,252,252,251,250,249,248,247,246,245,244,242,241,239,238,236,235,233,231,229,227,225,223,221,219,217,215,212,210,207,205,202,200,197,195,192,189,186,184,181,178,175,172,169,166,163,160,157,154,151,148,145,142,138,135,132,129,126,123,120,117,113,110,107,104,101,98,95,92,89,86,83,80,77,74,71,69,66,63,60,58,55,53,50,48,45,43,40,38,36,34,32,30,28,26,24,22,20,19,17,16,14,13,11,10,9,8,7,6,5,4,3,3,2,2,1,1,0,0,0,0,0,0,0,1,1,1,2,2,3,4,4,5,6,7,8,9,11,12,13,15,16,18,20,21,23,25,27,29,31,33,35,37,39,42,44,46,49,51,54,56,59,62,64,67,70,73,76,79,81,84,87,90,93,96,99,103,106,109,112,115,118,121,124],Jr=(t,r)=>{if(t.find(n=>Math.floor(n)!==n))throw new Error("Program contains non int");const e=[];let o=-1;for(let n=0;n<t.length;n++){switch(t[n]){case j.SIN:e[o]=Xl[e[o]%256];break;case j.ADD:if(o--,o<0)return 1;e[o]=e[o]+e[o+1];break;case j.SUB:if(o--,o<0)return 1;e[o]=e[o]-e[o+1];break;case j.MUL:if(o--,o<0)return 1;e[o]=e[o]*e[o+1];break;case j.DIV:if(o--,o<0)return 1;e[o]=Math.floor(e[o]/e[o+1]);break;case j.POW:if(o--,o<0)return 1;e[o]=Math.pow(e[o],e[o+1]);break;case j.MOD:if(o--,o<0)return 1;e[o]=e[o]%e[o+1];break;case j.IF:if(o-=2,o<0)return 1;e[o]=e[o]?e[o+1]:e[o+2];break;case j.EQ:if(o--,o<0)return 1;e[o]=+(e[o]==e[o+1]);break;case j.GT:if(o--,o<0)return 1;e[o]=+(e[o]>e[o+1]);break;case j.LT:if(o--,o<0)return 1;e[o]=+(e[o]<e[o+1]);break;case j.AND:if(o--,o<0)return 1;e[o]=e[o]&e[o+1];break;case j.OR:if(o--,o<0)return 1;e[o]=e[o]|e[o+1];break;case j.VAL:if(o++,o>=Fr)return 1;e[o]=t[n+1],n++;break;case j.VAR_T:if(o++,o>=Fr)return 1;e[o]=Ml;break;case j.VAR_I:if(o++,o>=Fr)return 1;e[o]=r;break;case j.END:return e[0]}for(;e[o]<0;)e[o]+=2**32;for(;e[o]>=2**32;)e[o]-=2**32}return e[0]},xl=238,$l=(t,r,e,o,n)=>{Ml++;const a=[...new Array(xl)].map(m=>({h:0,s:0,v:0}));for(let m=0;m<a.length;m++)a[m].h=Jr(e,m)%256,a[m].s=Jr(o,m)%256,a[m].v=Jr(n,m)%256;a.reverse();const v=t.width/a.length;t.height=v,r.clearRect(0,0,t.width,t.height);for(let m=0;m<a.length;m++){const h=Zl(a[m].h,a[m].s,a[m].v);r.fillStyle=`rgb(${h.r}, ${h.g}, ${h.b})`,r.fillRect(m*v,0,v,v)}return v};function Bl(t,r,e){const o=t.slice();return o[66]=r[e],o[68]=e,o}function eo(t){let r,e,o,n,a,v,m,h,_,g;return{c(){r=c("div"),e=c("label"),o=p("View user"),n=E(),a=c("input"),v=E(),m=c("div"),h=p(t[8]),this.h()},l(S){r=d(S,"DIV",{class:!0});var A=f(r);e=d(A,"LABEL",{for:!0});var I=f(e);o=b(I,"View user"),I.forEach(s),n=w(A),a=d(A,"INPUT",{name:!0,class:!0,placeholder:!0}),A.forEach(s),v=w(S),m=d(S,"DIV",{class:!0});var G=f(m);h=b(G,t[8]),G.forEach(s),this.h()},h(){u(e,"for","view-user"),u(a,"name","view-user"),u(a,"class","ml-4 border border-gray-800 border-solid rounded px-1"),u(a,"placeholder","username"),u(r,"class","mt-5"),u(m,"class","text-sm text-red-800")},m(S,A){D(S,r,A),l(r,e),l(e,o),l(r,n),l(r,a),H(a,t[3]),D(S,v,A),D(S,m,A),l(m,h),_||(g=N(a,"input",t[27]),_=!0)},p(S,A){A[0]&8&&a.value!==S[3]&&H(a,S[3]),A[0]&256&&pe(h,S[8])},d(S){S&&s(r),S&&s(v),S&&s(m),_=!1,g()}}}function to(t){let r,e,o;return{c(){r=c("div"),e=p("Key: "),o=p(t[7]),this.h()},l(n){r=d(n,"DIV",{class:!0});var a=f(r);e=b(a,"Key: "),o=b(a,t[7]),a.forEach(s),this.h()},h(){u(r,"class","mt-5")},m(n,a){D(n,r,a),l(r,e),l(r,o)},p(n,a){a[0]&128&&pe(o,n[7])},d(n){n&&s(r)}}}function ql(t){let r,e=t[66].name+"",o,n,a,v;function m(){return t[28](t[66])}return{c(){r=c("button"),o=p(e),this.h()},l(h){r=d(h,"BUTTON",{class:!0});var _=f(r);o=b(_,e),_.forEach(s),this.h()},h(){u(r,"class",n="border-gray-800 p-2 mx-2 border-solid border-b "+(t[66]===t[4]?"":"hover:bg-gray-200")+" active:bg-gray-300"),ut(r,"bg-gray-300",t[66]===t[4]),ut(r,"border-t",t[68]===0)},m(h,_){D(h,r,_),l(r,o),a||(v=N(r,"click",m),a=!0)},p(h,_){t=h,_[0]&1&&e!==(e=t[66].name+"")&&pe(o,e),_[0]&17&&n!==(n="border-gray-800 p-2 mx-2 border-solid border-b "+(t[66]===t[4]?"":"hover:bg-gray-200")+" active:bg-gray-300")&&u(r,"class",n),_[0]&17&&ut(r,"bg-gray-300",t[66]===t[4]),_[0]&17&&ut(r,"border-t",t[68]===0)},d(h){h&&s(r),a=!1,v()}}}function jl(t){let r,e,o,n,a,v,m,h,_,g,S,A,I,G,C,Q,V,Ae,$,ue,je,de=t[4].h.value+"",ee,be,O,X=t[4].h.error+"",Y,L,se,ve,ge,R,me,fe,F,ce,ae=t[4].s.value+"",Ve,Me,Ee,he=t[4].s.error+"",Ke,Je,W,we,Oe,M,He,Pe,Se,Le=t[4].v.error+"",ke,Qe,_e,Ye,z=t[4].v.value+"",We,Ne,tt;function rt(U,P){return U[10]?lo:ro}let Ie=rt(t),te=Ie(t);return{c(){r=c("div"),e=c("button"),o=p("Back"),n=E(),a=c("div"),v=c("button"),m=p("Clone"),h=E(),te.c(),_=E(),g=c("input"),A=E(),I=c("div"),G=c("div"),C=c("label"),Q=p("h = "),V=c("input"),$=E(),ue=c("pre"),je=p("    "),ee=p(de),be=E(),O=c("pre"),Y=p(X),L=E(),se=c("div"),ve=c("label"),ge=p("s = "),R=c("input"),fe=E(),F=c("pre"),ce=p("    "),Ve=p(ae),Me=E(),Ee=c("pre"),Ke=p(he),Je=E(),W=c("div"),we=c("label"),Oe=p("v = "),M=c("input"),Pe=E(),Se=c("pre"),ke=p(Le),Qe=E(),_e=c("pre"),Ye=p("    "),We=p(z),this.h()},l(U){r=d(U,"DIV",{class:!0});var P=f(r);e=d(P,"BUTTON",{class:!0});var lt=f(e);o=b(lt,"Back"),lt.forEach(s),n=w(P),a=d(P,"DIV",{class:!0});var ze=f(a);v=d(ze,"BUTTON",{class:!0});var Ge=f(v);m=b(Ge,"Clone"),Ge.forEach(s),h=w(ze),te.l(ze),ze.forEach(s),P.forEach(s),_=w(U),g=d(U,"INPUT",{type:!0,class:!0}),A=w(U),I=d(U,"DIV",{class:!0});var q=f(I);G=d(q,"DIV",{class:!0});var y=f(G);C=d(y,"LABEL",{for:!0});var k=f(C);Q=b(k,"h = "),k.forEach(s),V=d(y,"INPUT",{name:!0,class:!0,type:!0,autocomplete:!0,autocorrect:!0,autocapitalize:!0,spellcheck:!0}),y.forEach(s),$=w(q),ue=d(q,"PRE",{class:!0});var K=f(ue);je=b(K,"    "),ee=b(K,de),K.forEach(s),be=w(q),O=d(q,"PRE",{});var re=f(O);Y=b(re,X),re.forEach(s),L=w(q),se=d(q,"DIV",{class:!0});var B=f(se);ve=d(B,"LABEL",{for:!0});var le=f(ve);ge=b(le,"s = "),le.forEach(s),R=d(B,"INPUT",{name:!0,class:!0,type:!0,autocomplete:!0,autocorrect:!0,autocapitalize:!0,spellcheck:!0}),B.forEach(s),fe=w(q),F=d(q,"PRE",{class:!0});var oe=f(F);ce=b(oe,"    "),Ve=b(oe,ae),oe.forEach(s),Me=w(q),Ee=d(q,"PRE",{});var Te=f(Ee);Ke=b(Te,he),Te.forEach(s),Je=w(q),W=d(q,"DIV",{class:!0});var x=f(W);we=d(x,"LABEL",{for:!0});var kt=f(we);Oe=b(kt,"v = "),kt.forEach(s),M=d(x,"INPUT",{name:!0,class:!0,type:!0,autocomplete:!0,autocorrect:!0,autocapitalize:!0,spellcheck:!0}),x.forEach(s),Pe=w(q),Se=d(q,"PRE",{});var ot=f(Se);ke=b(ot,Le),ot.forEach(s),Qe=w(q),_e=d(q,"PRE",{class:!0});var ct=f(_e);Ye=b(ct,"    "),We=b(ct,z),ct.forEach(s),q.forEach(s),this.h()},h(){u(e,"class","text-base md:hidden rounded border-gray-800 border-solid border py-1 px-3 mb-4 hover:bg-gray-200 active:bg-gray-300"),u(v,"class","text-base rounded border-gray-800 border-solid border py-1 px-3 mb-4 hover:bg-gray-200 active:bg-gray-300 mx-2"),u(a,"class","flex md:flex-row-reverse"),u(r,"class","flex justify-between"),u(g,"type","text"),u(g,"class","focus:outline-none text-2xl w-full py-3"),g.disabled=S=!!t[3],u(C,"for","h"),u(V,"name","h"),u(V,"class","pl-4 font-mono focus:outline-none w-full"),u(V,"type","text"),u(V,"autocomplete","off"),u(V,"autocorrect","off"),u(V,"autocapitalize","off"),u(V,"spellcheck","false"),V.disabled=Ae=!!t[3],u(G,"class","flex whitespace-nowrap py-2"),u(ue,"class","h-0 invisible"),u(ve,"for","s"),u(R,"name","s"),u(R,"class","pl-4 font-mono focus:outline-none w-full"),u(R,"type","text"),u(R,"autocomplete","off"),u(R,"autocorrect","off"),u(R,"autocapitalize","off"),u(R,"spellcheck","false"),R.disabled=me=!!t[3],u(se,"class","flex whitespace-nowrap py-2"),u(F,"class","h-0 invisible"),u(we,"for","v"),u(M,"name","v"),u(M,"class","pl-4 font-mono focus:outline-none w-full"),u(M,"type","text"),u(M,"autocomplete","off"),u(M,"autocorrect","off"),u(M,"autocapitalize","off"),u(M,"spellcheck","false"),M.disabled=He=!!t[3],u(W,"class","flex whitespace-nowrap py-2"),u(_e,"class","h-0 invisible"),u(I,"class","pl-10")},m(U,P){D(U,r,P),l(r,e),l(e,o),l(r,n),l(r,a),l(a,v),l(v,m),l(a,h),te.m(a,null),D(U,_,P),D(U,g,P),H(g,t[4].name),D(U,A,P),D(U,I,P),l(I,G),l(G,C),l(C,Q),l(G,V),H(V,t[4].h.value),l(I,$),l(I,ue),l(ue,je),l(ue,ee),l(I,be),l(I,O),l(O,Y),l(I,L),l(I,se),l(se,ve),l(ve,ge),l(se,R),H(R,t[4].s.value),l(I,fe),l(I,F),l(F,ce),l(F,Ve),l(I,Me),l(I,Ee),l(Ee,Ke),l(I,Je),l(I,W),l(W,we),l(we,Oe),l(W,M),H(M,t[4].v.value),l(I,Pe),l(I,Se),l(Se,ke),l(I,Qe),l(I,_e),l(_e,Ye),l(_e,We),Ne||(tt=[N(e,"click",t[29]),N(v,"click",t[30]),N(g,"input",t[34]),N(g,"input",function(){dr(t[4].h.onChange)&&t[4].h.onChange.apply(this,arguments)}),N(V,"input",t[35]),N(V,"input",function(){dr(t[4].h.onChange)&&t[4].h.onChange.apply(this,arguments)}),N(R,"input",t[36]),N(R,"input",function(){dr(t[4].s.onChange)&&t[4].s.onChange.apply(this,arguments)}),N(M,"input",t[37]),N(M,"input",function(){dr(t[4].v.onChange)&&t[4].v.onChange.apply(this,arguments)})],Ne=!0)},p(U,P){t=U,Ie===(Ie=rt(t))&&te?te.p(t,P):(te.d(1),te=Ie(t),te&&(te.c(),te.m(a,null))),P[0]&8&&S!==(S=!!t[3])&&(g.disabled=S),P[0]&16&&g.value!==t[4].name&&H(g,t[4].name),P[0]&8&&Ae!==(Ae=!!t[3])&&(V.disabled=Ae),P[0]&16&&V.value!==t[4].h.value&&H(V,t[4].h.value),P[0]&16&&de!==(de=t[4].h.value+"")&&pe(ee,de),P[0]&16&&X!==(X=t[4].h.error+"")&&pe(Y,X),P[0]&8&&me!==(me=!!t[3])&&(R.disabled=me),P[0]&16&&R.value!==t[4].s.value&&H(R,t[4].s.value),P[0]&16&&ae!==(ae=t[4].s.value+"")&&pe(Ve,ae),P[0]&16&&he!==(he=t[4].s.error+"")&&pe(Ke,he),P[0]&8&&He!==(He=!!t[3])&&(M.disabled=He),P[0]&16&&M.value!==t[4].v.value&&H(M,t[4].v.value),P[0]&16&&Le!==(Le=t[4].v.error+"")&&pe(ke,Le),P[0]&16&&z!==(z=t[4].v.value+"")&&pe(We,z)},d(U){U&&s(r),te.d(),U&&s(_),U&&s(g),U&&s(A),U&&s(I),Ne=!1,fr(tt)}}}function ro(t){let r,e,o,n,a;return{c(){r=c("button"),e=p("Delete"),this.h()},l(v){r=d(v,"BUTTON",{class:!0});var m=f(r);e=b(m,"Delete"),m.forEach(s),this.h()},h(){u(r,"class","text-base rounded border-gray-800 border-solid border py-1 px-3 mb-4 hover:bg-gray-200 active:bg-gray-300 disabled:hover:bg-white disabled:border-gray-500 disabled:text-gray-500"),r.disabled=o=!!t[3]},m(v,m){D(v,r,m),l(r,e),n||(a=N(r,"click",t[33]),n=!0)},p(v,m){m[0]&8&&o!==(o=!!v[3])&&(r.disabled=o)},d(v){v&&s(r),n=!1,a()}}}function lo(t){let r,e,o,n,a,v,m;return{c(){r=c("button"),e=p("Confirm Delete"),o=E(),n=c("button"),a=p("Cancel Delete"),this.h()},l(h){r=d(h,"BUTTON",{class:!0});var _=f(r);e=b(_,"Confirm Delete"),_.forEach(s),o=w(h),n=d(h,"BUTTON",{class:!0});var g=f(n);a=b(g,"Cancel Delete"),g.forEach(s),this.h()},h(){u(r,"class","text-base rounded border-solid border py-1 px-3 mb-4 mx-2 hover:bg-gray-200 active:bg-gray-300"),u(n,"class","text-base rounded border-solid border py-1 px-3 mb-4 mx-2 hover:bg-gray-200 active:bg-gray-300")},m(h,_){D(h,r,_),l(r,e),D(h,o,_),D(h,n,_),l(n,a),v||(m=[N(r,"click",t[31]),N(n,"click",t[32])],v=!0)},p:Kt,d(h){h&&s(r),h&&s(o),h&&s(n),v=!1,fr(m)}}}function oo(t){let r,e,o;return{c(){r=c("input"),this.h()},l(n){r=d(n,"INPUT",{class:!0,name:!0,type:!0}),this.h()},h(){u(r,"class","ml-4 border border-gray-800 border-solid rounded px-1"),u(r,"name","p1"),u(r,"type","password")},m(n,a){D(n,r,a),H(r,t[1]),e||(o=N(r,"input",t[40]),e=!0)},p(n,a){a[0]&2&&r.value!==n[1]&&H(r,n[1])},d(n){n&&s(r),e=!1,o()}}}function so(t){let r,e,o;return{c(){r=c("input"),this.h()},l(n){r=d(n,"INPUT",{class:!0,name:!0,type:!0}),this.h()},h(){u(r,"class","ml-4 border border-gray-800 border-solid rounded px-1"),u(r,"name","p1"),u(r,"type","text")},m(n,a){D(n,r,a),H(r,t[1]),e||(o=N(r,"input",t[39]),e=!0)},p(n,a){a[0]&2&&r.value!==n[1]&&H(r,n[1])},d(n){n&&s(r),e=!1,o()}}}function ao(t){let r,e,o;return{c(){r=c("input"),this.h()},l(n){r=d(n,"INPUT",{class:!0,name:!0,type:!0}),this.h()},h(){u(r,"class","ml-4 border border-gray-800 border-solid rounded px-1"),u(r,"name","p2"),u(r,"type","password")},m(n,a){D(n,r,a),H(r,t[2]),e||(o=N(r,"input",t[42]),e=!0)},p(n,a){a[0]&4&&r.value!==n[2]&&H(r,n[2])},d(n){n&&s(r),e=!1,o()}}}function no(t){let r,e,o;return{c(){r=c("input"),this.h()},l(n){r=d(n,"INPUT",{class:!0,name:!0,type:!0}),this.h()},h(){u(r,"class","ml-4 border border-gray-800 border-solid rounded px-1"),u(r,"name","p2"),u(r,"type","text")},m(n,a){D(n,r,a),H(r,t[2]),e||(o=N(r,"input",t[41]),e=!0)},p(n,a){a[0]&4&&r.value!==n[2]&&H(r,n[2])},d(n){n&&s(r),e=!1,o()}}}function io(t){let r,e,o,n;return{c(){r=c("button"),e=p("Refresh Key"),this.h()},l(a){r=d(a,"BUTTON",{class:!0});var v=f(r);e=b(v,"Refresh Key"),v.forEach(s),this.h()},h(){u(r,"class","rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300")},m(a,v){D(a,r,v),l(r,e),o||(n=N(r,"click",t[46]),o=!0)},p:Kt,d(a){a&&s(r),o=!1,n()}}}function uo(t){let r,e,o,n,a,v,m,h,_,g,S;return{c(){r=c("div"),e=c("button"),o=p("Cancel"),n=E(),a=c("button"),v=p("Confirm"),m=E(),h=c("div"),_=p("Note: Refreshing your key logs you out of all devices"),this.h()},l(A){r=d(A,"DIV",{class:!0});var I=f(r);e=d(I,"BUTTON",{class:!0});var G=f(e);o=b(G,"Cancel"),G.forEach(s),n=w(I),a=d(I,"BUTTON",{class:!0});var C=f(a);v=b(C,"Confirm"),C.forEach(s),I.forEach(s),m=w(A),h=d(A,"DIV",{});var Q=f(h);_=b(Q,"Note: Refreshing your key logs you out of all devices"),Q.forEach(s),this.h()},h(){u(e,"class","rounded border-gray-800 border-solid border w-36 py-2 mr-4 hover:bg-gray-200 active:bg-gray-300"),u(a,"class","rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"),u(r,"class","flex")},m(A,I){D(A,r,I),l(r,e),l(e,o),l(r,n),l(r,a),l(a,v),D(A,m,I),D(A,h,I),l(h,_),g||(S=[N(e,"click",t[44]),N(a,"click",t[45])],g=!0)},p:Kt,d(A){A&&s(r),A&&s(m),A&&s(h),g=!1,fr(S)}}}function co(t){let r,e,o,n,a,v,m,h,_,g,S=t[11]?"Hide":"Show",A,I,G,C,Q,V,Ae,$,ue,je,de,ee,be,O,X,Y,L,se,ve,ge,R,me,fe,F,ce,ae,Ve,Me,Ee,he,Ke,Je,W,we,Oe,M,He,Pe,Se,Le,ke,Qe,_e,Ye,z,We,Ne,tt,rt,Ie,te,U,P,lt,ze,Ge,q,y,k,K,re,B,le,oe,Te,x,kt,ot,ct,hr,pr,Rt,br,vr,dt,mr,It,_r,yr,Ht,De,gr,Ze,Tt,Er,wr,kr,Xe,Dt,Ir,Tr,Dr,Ut,ft,Bt=t[5]?"Hide":"Show",Wt,zt,ht,At,Gt,ye,st,Vt,Ar,Vr,xe,Or,Ot,Ft,Pr,pt,Sr,Lr,qt,Nr,Jt,Ce,at,Pt,Cr,Rr,$e,Ur,St,Qt,Br,bt,qr,Yt,et,vt,jr,Mr,jt,Kr,Zt,mt,_t,Hr,Wr,Qr;function Yr(i,T){return i[11]?to:eo}let Xt=Yr(t),Re=Xt(t),Lt=t[0],ne=[];for(let i=0;i<Lt.length;i+=1)ne[i]=ql(Bl(t,Lt,i));let ie=t[4]&&jl(t);function Zr(i,T){return i[5]?so:oo}let xt=Zr(t),Ue=xt(t);function Xr(i,T){return i[5]?no:ao}let $t=Xr(t),Be=$t(t);function xr(i,T){return i[12]?uo:io}let er=xr(t),qe=er(t);return{c(){r=c("header"),e=c("h1"),o=p("LEDS"),n=E(),a=c("div"),v=c("div"),m=c("div"),h=p(t[6]),_=E(),g=c("button"),A=p(S),I=p(" key"),G=E(),Re.c(),C=E(),Q=c("div"),V=c("div");for(let i=0;i<ne.length;i+=1)ne[i].c();Ae=E(),$=c("button"),ue=p("Add equation"),de=E(),ee=c("div"),ie&&ie.c(),be=E(),O=c("div"),X=c("canvas"),Y=E(),L=c("div"),se=c("h1"),ve=p("Usage"),ge=E(),R=c("p"),me=p('Add sets of equations using the "Add Equation" button.'),fe=E(),F=c("p"),ce=p(`Each set of equations contains an "h" equation, an "s" equation, and a "v" equation. Each
		equation corresponds to each part of the `),ae=c("a"),Ve=p("HSV color"),Me=p(" of the LED."),Ee=E(),he=c("p"),Ke=p(`Each equation is run every frame for every LED on the led strip, which allows you to create a
		LED pattern by using the equations.`),Je=E(),W=c("p"),we=p("The equations look like normal math equations, for example, setting "),Oe=c("code"),M=p("h = i + t"),He=p(` and
		`),Pe=c("code"),Se=p("s = 255"),Le=p(`
		and `),ke=c("code"),Qe=p("v = 90"),_e=p(" will create a rainbow pattern across the led strip."),Ye=E(),z=c("p"),We=p(`All numbers are integers and the values sent to the LEDs are mod 256 of the result of the
		equations. You can access two variables: `),Ne=c("code"),tt=p("i"),rt=p(" and "),Ie=c("code"),te=p("t"),U=p(". "),P=c("code"),lt=p("i"),ze=p(` is
		the index of the LED and `),Ge=c("code"),q=p("t"),y=p(" is the current frame, which increments by 1 every frame."),k=E(),K=c("p"),re=p(`I attempted to have expressions evaluated according to the order of operations, but I don't
		think I got it quite working, so I recommend using parenthesis if something doesn't seem right.`),B=E(),le=c("p"),oe=p("There are two functions that you can use. The first one is "),Te=c("code"),x=p(`if([expr], [if not 0], [if 0])
		`),kt=p(", which should be self-explanatory. The other one is "),ot=c("code"),ct=p("sin([value])"),hr=p(`, which
		computes the sin of a value, but a full cycle is 0-255 instead of 0-2pi.`),pr=E(),Rt=c("p"),br=p(`The video is a live stream of my LED lights running whatever equations are written here. If too
		many people use this, it could get crazy. When you type in an equation, it is automatically sent
		to the LED strip.`),vr=E(),dt=c("p"),mr=p(`This was a random project that I wanted to try. I'll probably set a password on it at some
		point, but I thought I'd let the whole world try it out first. It probably has a lot of bugs and
		I'm not planning to fix them all. I also wrote a `),It=c("a"),_r=p("blog post"),yr=p(" explaining how everything works."),Ht=E(),De=c("div"),gr=p(`LEDs Password
	`),Ze=c("div"),Tt=c("label"),Er=p("Part 1"),wr=E(),Ue.c(),kr=E(),Xe=c("div"),Dt=c("label"),Ir=p("Part 2"),Tr=E(),Be.c(),Dr=E(),Ut=c("div"),ft=c("button"),Wt=p(Bt),zt=E(),ht=c("div"),At=c("div"),qe.c(),Gt=E(),ye=c("div"),st=c("div"),Vt=c("label"),Ar=p("Key"),Vr=E(),xe=c("input"),Or=E(),Ot=c("div"),Ft=p(t[14]),Pr=E(),pt=c("button"),Sr=p("Set Key"),Lr=E(),qt=c("div"),Nr=p("Note: Setting the key allows you to change accounts (remember to save your old key somewhere!)"),Jt=E(),Ce=c("div"),at=c("div"),Pt=c("label"),Cr=p("Username"),Rr=E(),$e=c("input"),Ur=E(),St=c("div"),Qt=p(t[16]),Br=E(),bt=c("button"),qr=p("Set Username"),Yt=E(),et=c("div"),vt=c("button"),jr=p("New Account"),Mr=E(),jt=c("div"),Kr=p("Note: Backup your current key first!"),Zt=E(),mt=c("div"),_t=c("button"),Hr=p("Reload Page"),this.h()},l(i){r=d(i,"HEADER",{class:!0});var T=f(r);e=d(T,"H1",{class:!0});var Z=f(e);o=b(Z,"LEDS"),Z.forEach(s),n=w(T),a=d(T,"DIV",{class:!0});var yt=f(a);v=d(yt,"DIV",{class:!0});var tr=f(v);m=d(tr,"DIV",{class:!0});var $r=f(m);h=b($r,t[6]),$r.forEach(s),_=w(tr),g=d(tr,"BUTTON",{class:!0});var zr=f(g);A=b(zr,S),I=b(zr," key"),zr.forEach(s),tr.forEach(s),G=w(yt),Re.l(yt),yt.forEach(s),T.forEach(s),C=w(i),Q=d(i,"DIV",{class:!0});var rr=f(Q);V=d(rr,"DIV",{class:!0});var lr=f(V);for(let Gr=0;Gr<ne.length;Gr+=1)ne[Gr].l(lr);Ae=w(lr),$=d(lr,"BUTTON",{class:!0});var el=f($);ue=b(el,"Add equation"),el.forEach(s),lr.forEach(s),de=w(rr),ee=d(rr,"DIV",{class:!0});var tl=f(ee);ie&&ie.l(tl),tl.forEach(s),rr.forEach(s),be=w(i),O=d(i,"DIV",{class:!0});var rl=f(O);X=d(rl,"CANVAS",{id:!0,class:!0,height:!0}),f(X).forEach(s),rl.forEach(s),Y=w(i),L=d(i,"DIV",{class:!0});var J=f(L);se=d(J,"H1",{});var ll=f(se);ve=b(ll,"Usage"),ll.forEach(s),ge=w(J),R=d(J,"P",{});var ol=f(R);me=b(ol,'Add sets of equations using the "Add Equation" button.'),ol.forEach(s),fe=w(J),F=d(J,"P",{});var or=f(F);ce=b(or,`Each set of equations contains an "h" equation, an "s" equation, and a "v" equation. Each
		equation corresponds to each part of the `),ae=d(or,"A",{href:!0});var sl=f(ae);Ve=b(sl,"HSV color"),sl.forEach(s),Me=b(or," of the LED."),or.forEach(s),Ee=w(J),he=d(J,"P",{});var al=f(he);Ke=b(al,`Each equation is run every frame for every LED on the led strip, which allows you to create a
		LED pattern by using the equations.`),al.forEach(s),Je=w(J),W=d(J,"P",{});var nt=f(W);we=b(nt,"The equations look like normal math equations, for example, setting "),Oe=d(nt,"CODE",{});var nl=f(Oe);M=b(nl,"h = i + t"),nl.forEach(s),He=b(nt,` and
		`),Pe=d(nt,"CODE",{});var il=f(Pe);Se=b(il,"s = 255"),il.forEach(s),Le=b(nt,`
		and `),ke=d(nt,"CODE",{});var ul=f(ke);Qe=b(ul,"v = 90"),ul.forEach(s),_e=b(nt," will create a rainbow pattern across the led strip."),nt.forEach(s),Ye=w(J),z=d(J,"P",{});var Fe=f(z);We=b(Fe,`All numbers are integers and the values sent to the LEDs are mod 256 of the result of the
		equations. You can access two variables: `),Ne=d(Fe,"CODE",{});var cl=f(Ne);tt=b(cl,"i"),cl.forEach(s),rt=b(Fe," and "),Ie=d(Fe,"CODE",{});var dl=f(Ie);te=b(dl,"t"),dl.forEach(s),U=b(Fe,". "),P=d(Fe,"CODE",{});var fl=f(P);lt=b(fl,"i"),fl.forEach(s),ze=b(Fe,` is
		the index of the LED and `),Ge=d(Fe,"CODE",{});var hl=f(Ge);q=b(hl,"t"),hl.forEach(s),y=b(Fe," is the current frame, which increments by 1 every frame."),Fe.forEach(s),k=w(J),K=d(J,"P",{});var pl=f(K);re=b(pl,`I attempted to have expressions evaluated according to the order of operations, but I don't
		think I got it quite working, so I recommend using parenthesis if something doesn't seem right.`),pl.forEach(s),B=w(J),le=d(J,"P",{});var Nt=f(le);oe=b(Nt,"There are two functions that you can use. The first one is "),Te=d(Nt,"CODE",{});var bl=f(Te);x=b(bl,`if([expr], [if not 0], [if 0])
		`),bl.forEach(s),kt=b(Nt,", which should be self-explanatory. The other one is "),ot=d(Nt,"CODE",{});var vl=f(ot);ct=b(vl,"sin([value])"),vl.forEach(s),hr=b(Nt,`, which
		computes the sin of a value, but a full cycle is 0-255 instead of 0-2pi.`),Nt.forEach(s),pr=w(J),Rt=d(J,"P",{});var ml=f(Rt);br=b(ml,`The video is a live stream of my LED lights running whatever equations are written here. If too
		many people use this, it could get crazy. When you type in an equation, it is automatically sent
		to the LED strip.`),ml.forEach(s),vr=w(J),dt=d(J,"P",{});var sr=f(dt);mr=b(sr,`This was a random project that I wanted to try. I'll probably set a password on it at some
		point, but I thought I'd let the whole world try it out first. It probably has a lot of bugs and
		I'm not planning to fix them all. I also wrote a `),It=d(sr,"A",{href:!0});var _l=f(It);_r=b(_l,"blog post"),_l.forEach(s),yr=b(sr," explaining how everything works."),sr.forEach(s),J.forEach(s),Ht=w(i),De=d(i,"DIV",{class:!0});var gt=f(De);gr=b(gt,`LEDs Password
	`),Ze=d(gt,"DIV",{class:!0});var ar=f(Ze);Tt=d(ar,"LABEL",{for:!0});var yl=f(Tt);Er=b(yl,"Part 1"),yl.forEach(s),wr=w(ar),Ue.l(ar),ar.forEach(s),kr=w(gt),Xe=d(gt,"DIV",{class:!0});var nr=f(Xe);Dt=d(nr,"LABEL",{for:!0});var gl=f(Dt);Ir=b(gl,"Part 2"),gl.forEach(s),Tr=w(nr),Be.l(nr),nr.forEach(s),Dr=w(gt),Ut=d(gt,"DIV",{});var El=f(Ut);ft=d(El,"BUTTON",{class:!0});var wl=f(ft);Wt=b(wl,Bt),wl.forEach(s),El.forEach(s),gt.forEach(s),zt=w(i),ht=d(i,"DIV",{class:!0});var kl=f(ht);At=d(kl,"DIV",{});var Il=f(At);qe.l(Il),Il.forEach(s),kl.forEach(s),Gt=w(i),ye=d(i,"DIV",{class:!0});var it=f(ye);st=d(it,"DIV",{class:!0});var ir=f(st);Vt=d(ir,"LABEL",{for:!0});var Tl=f(Vt);Ar=b(Tl,"Key"),Tl.forEach(s),Vr=w(ir),xe=d(ir,"INPUT",{class:!0,name:!0}),ir.forEach(s),Or=w(it),Ot=d(it,"DIV",{class:!0});var Dl=f(Ot);Ft=b(Dl,t[14]),Dl.forEach(s),Pr=w(it),pt=d(it,"BUTTON",{class:!0});var Al=f(pt);Sr=b(Al,"Set Key"),Al.forEach(s),Lr=w(it),qt=d(it,"DIV",{});var Vl=f(qt);Nr=b(Vl,"Note: Setting the key allows you to change accounts (remember to save your old key somewhere!)"),Vl.forEach(s),it.forEach(s),Jt=w(i),Ce=d(i,"DIV",{class:!0});var Ct=f(Ce);at=d(Ct,"DIV",{class:!0});var ur=f(at);Pt=d(ur,"LABEL",{for:!0});var Ol=f(Pt);Cr=b(Ol,"Username"),Ol.forEach(s),Rr=w(ur),$e=d(ur,"INPUT",{class:!0,name:!0}),ur.forEach(s),Ur=w(Ct),St=d(Ct,"DIV",{class:!0});var Pl=f(St);Qt=b(Pl,t[16]),Pl.forEach(s),Br=w(Ct),bt=d(Ct,"BUTTON",{class:!0});var Sl=f(bt);qr=b(Sl,"Set Username"),Sl.forEach(s),Ct.forEach(s),Yt=w(i),et=d(i,"DIV",{class:!0});var cr=f(et);vt=d(cr,"BUTTON",{class:!0});var Ll=f(vt);jr=b(Ll,"New Account"),Ll.forEach(s),Mr=w(cr),jt=d(cr,"DIV",{});var Nl=f(jt);Kr=b(Nl,"Note: Backup your current key first!"),Nl.forEach(s),cr.forEach(s),Zt=w(i),mt=d(i,"DIV",{class:!0});var Cl=f(mt);_t=d(Cl,"BUTTON",{class:!0});var Rl=f(_t);Hr=b(Rl,"Reload Page"),Rl.forEach(s),Cl.forEach(s),this.h()},h(){u(e,"class","text-5xl "),u(m,"class","mr-4 flex items-center"),u(g,"class","rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"),u(v,"class","flex"),u(a,"class","flex flex-col"),u(r,"class","pb-10 p-5 flex justify-between flex-col md:flex-row"),u($,"class","mt-14 rounded border-gray-800 border-solid border py-4 hover:bg-gray-200 active:bg-gray-300 disabled:hover:bg-white disabled:border-gray-500 disabled:text-gray-500"),$.disabled=je=!!t[3],u(V,"class","md:flex flex-col flex-shrink-0 text-2xl w-full md:w-[300px] md:border-r border-gray-800 border-solid pr-4"),ut(V,"hidden",t[4]),ut(V,"flex",!t[4]),u(ee,"class","pl-5 flex-grow"),u(Q,"class","p-4 font-sans flex"),u(X,"id","simulation"),u(X,"class","w-full"),u(X,"height","0"),u(O,"class","mt-16"),u(ae,"href","https://en.wikipedia.org/wiki/HSL_and_HSV"),u(It,"href","https://anb.codes/2022/led-equations"),u(L,"class","p-4 mt-16 prose"),u(Tt,"for","p1"),u(Ze,"class","m-3"),u(Dt,"for","p2"),u(Xe,"class","m-3"),u(ft,"class","text-1xl mt-20 rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"),u(De,"class","p-4 mt-16"),u(ht,"class","p-4 flex flex-col mt-10"),u(Vt,"for","key"),u(xe,"class","ml-4 border border-gray-800 border-solid rounded px-1"),u(xe,"name","key"),u(st,"class","flex"),u(Ot,"class","text-sm text-red-800"),u(pt,"class","rounded border-gray-800 border-solid border w-36 py-2 my-3 hover:bg-gray-200 active:bg-gray-300"),u(ye,"class","p-4 flex flex-col mt-10"),u(Pt,"for","username"),u($e,"class","ml-4 border border-gray-800 border-solid rounded px-1"),u($e,"name","username"),u(at,"class","flex"),u(St,"class","text-sm text-red-800"),u(bt,"class","rounded border-gray-800 border-solid border w-36 py-2 my-3 hover:bg-gray-200 active:bg-gray-300"),u(Ce,"class","p-4 flex flex-col mt-10"),u(vt,"class","rounded border-gray-800 border-solid border w-36 py-2 my-3 hover:bg-gray-200 active:bg-gray-300"),u(et,"class","p-4 flex flex-col mt-10"),u(_t,"class","text-1xl mt-20 rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"),u(mt,"class","p-4 flex flex-col")},m(i,T){D(i,r,T),l(r,e),l(e,o),l(r,n),l(r,a),l(a,v),l(v,m),l(m,h),l(v,_),l(v,g),l(g,A),l(g,I),l(a,G),Re.m(a,null),D(i,C,T),D(i,Q,T),l(Q,V);for(let Z=0;Z<ne.length;Z+=1)ne[Z].m(V,null);l(V,Ae),l(V,$),l($,ue),l(Q,de),l(Q,ee),ie&&ie.m(ee,null),D(i,be,T),D(i,O,T),l(O,X),t[38](X),D(i,Y,T),D(i,L,T),l(L,se),l(se,ve),l(L,ge),l(L,R),l(R,me),l(L,fe),l(L,F),l(F,ce),l(F,ae),l(ae,Ve),l(F,Me),l(L,Ee),l(L,he),l(he,Ke),l(L,Je),l(L,W),l(W,we),l(W,Oe),l(Oe,M),l(W,He),l(W,Pe),l(Pe,Se),l(W,Le),l(W,ke),l(ke,Qe),l(W,_e),l(L,Ye),l(L,z),l(z,We),l(z,Ne),l(Ne,tt),l(z,rt),l(z,Ie),l(Ie,te),l(z,U),l(z,P),l(P,lt),l(z,ze),l(z,Ge),l(Ge,q),l(z,y),l(L,k),l(L,K),l(K,re),l(L,B),l(L,le),l(le,oe),l(le,Te),l(Te,x),l(le,kt),l(le,ot),l(ot,ct),l(le,hr),l(L,pr),l(L,Rt),l(Rt,br),l(L,vr),l(L,dt),l(dt,mr),l(dt,It),l(It,_r),l(dt,yr),D(i,Ht,T),D(i,De,T),l(De,gr),l(De,Ze),l(Ze,Tt),l(Tt,Er),l(Ze,wr),Ue.m(Ze,null),l(De,kr),l(De,Xe),l(Xe,Dt),l(Dt,Ir),l(Xe,Tr),Be.m(Xe,null),l(De,Dr),l(De,Ut),l(Ut,ft),l(ft,Wt),D(i,zt,T),D(i,ht,T),l(ht,At),qe.m(At,null),D(i,Gt,T),D(i,ye,T),l(ye,st),l(st,Vt),l(Vt,Ar),l(st,Vr),l(st,xe),H(xe,t[13]),l(ye,Or),l(ye,Ot),l(Ot,Ft),l(ye,Pr),l(ye,pt),l(pt,Sr),l(ye,Lr),l(ye,qt),l(qt,Nr),D(i,Jt,T),D(i,Ce,T),l(Ce,at),l(at,Pt),l(Pt,Cr),l(at,Rr),l(at,$e),H($e,t[15]),l(Ce,Ur),l(Ce,St),l(St,Qt),l(Ce,Br),l(Ce,bt),l(bt,qr),D(i,Yt,T),D(i,et,T),l(et,vt),l(vt,jr),l(et,Mr),l(et,jt),l(jt,Kr),D(i,Zt,T),D(i,mt,T),l(mt,_t),l(_t,Hr),Wr||(Qr=[N(g,"click",t[26]),N($,"click",t[18]),N(ft,"click",t[43]),N(xe,"input",t[47]),N(pt,"click",t[48]),N($e,"input",t[49]),N(bt,"click",t[50]),N(vt,"click",t[51]),N(_t,"click",t[52])],Wr=!0)},p(i,T){if(T[0]&64&&pe(h,i[6]),T[0]&2048&&S!==(S=i[11]?"Hide":"Show")&&pe(A,S),Xt===(Xt=Yr(i))&&Re?Re.p(i,T):(Re.d(1),Re=Xt(i),Re&&(Re.c(),Re.m(a,null))),T[0]&131089){Lt=i[0];let Z;for(Z=0;Z<Lt.length;Z+=1){const yt=Bl(i,Lt,Z);ne[Z]?ne[Z].p(yt,T):(ne[Z]=ql(yt),ne[Z].c(),ne[Z].m(V,Ae))}for(;Z<ne.length;Z+=1)ne[Z].d(1);ne.length=Lt.length}T[0]&8&&je!==(je=!!i[3])&&($.disabled=je),T[0]&16&&ut(V,"hidden",i[4]),T[0]&16&&ut(V,"flex",!i[4]),i[4]?ie?ie.p(i,T):(ie=jl(i),ie.c(),ie.m(ee,null)):ie&&(ie.d(1),ie=null),xt===(xt=Zr(i))&&Ue?Ue.p(i,T):(Ue.d(1),Ue=xt(i),Ue&&(Ue.c(),Ue.m(Ze,null))),$t===($t=Xr(i))&&Be?Be.p(i,T):(Be.d(1),Be=$t(i),Be&&(Be.c(),Be.m(Xe,null))),T[0]&32&&Bt!==(Bt=i[5]?"Hide":"Show")&&pe(Wt,Bt),er===(er=xr(i))&&qe?qe.p(i,T):(qe.d(1),qe=er(i),qe&&(qe.c(),qe.m(At,null))),T[0]&8192&&xe.value!==i[13]&&H(xe,i[13]),T[0]&16384&&pe(Ft,i[14]),T[0]&32768&&$e.value!==i[15]&&H($e,i[15]),T[0]&65536&&pe(Qt,i[16])},i:Kt,o:Kt,d(i){i&&s(r),Re.d(),i&&s(C),i&&s(Q),zl(ne,i),ie&&ie.d(),i&&s(be),i&&s(O),t[38](null),i&&s(Y),i&&s(L),i&&s(Ht),i&&s(De),Ue.d(),Be.d(),i&&s(zt),i&&s(ht),qe.d(),i&&s(Gt),i&&s(ye),i&&s(Jt),i&&s(Ce),i&&s(Yt),i&&s(et),i&&s(Zt),i&&s(mt),Wr=!1,fr(Qr)}}}function fo(t,r,e){let o=[],n=[],a="",v="",m=!1,h="",_="",g="",S="",A=o[0],I=!1,G=!1,C,Q=!1;const V=async y=>{const K=await(await fetch(`https://leds.spry.workers.dev/data?username=${y}`)).json();if(K.error)return K.error;const re=JSON.parse(K.data);re.equations||(re.equations=[]),re.equations.forEach(B=>{B.h.onChange=Y(B.h,B),B.s.onChange=Y(B.s,B),B.v.onChange=Y(B.v,B),B.h.onChange(),B.s.onChange(),B.v.onChange()}),e(0,o=re.equations),y===h&&(n=re.equations,e(3,g="")),Q=!0},Ae=async()=>{const k=await(await fetch(`https://leds.spry.workers.dev/get-username?key=${_}`,{method:"GET"})).json();k.username?(e(6,h=k.username),localStorage.setItem("username",h)):e(6,h="Not logged in")};Gl(()=>{var k,K,re,B,le;C&&e(9,C.width=C.clientWidth,C),addEventListener("resize",()=>{C&&e(9,C.width=C.clientWidth,C)}),e(3,g=(k=new URLSearchParams(location.search).get("view"))!=null?k:""),window.addEventListener("popstate",()=>{var oe;e(3,g=(oe=new URLSearchParams(location.search).get("view"))!=null?oe:"")}),e(6,h=(K=localStorage.getItem("username"))!=null?K:""),e(7,_=(re=localStorage.getItem("key"))!=null?re:""),!h||!_?fetch("https://leds.spry.workers.dev/new-user",{method:"POST"}).then(oe=>oe.json()).then(oe=>{e(6,h=oe.username),localStorage.setItem("username",h),e(7,_=oe.key),localStorage.setItem("key",_)}).then(()=>V(h)):(Ae(),V(h)),e(1,a=(B=localStorage.getItem("password_p1"))!=null?B:"0"),e(2,v=(le=localStorage.getItem("password_p2"))!=null?le:"0"),G=!0,e(25,I=!0);const y=C.getContext("2d");if(!y)throw new Error("No canvas context!");setInterval(()=>{A&&C&&$l(C,y,A.h.compiledValue,A.s.compiledValue,A.v.compiledValue)},1e3/40)});const $=async(y,k=!1)=>{!h||!I||g&&!k||await fetch(`https://leds.spry.workers.dev/data?key=${_}&username=${h}`,{method:"PUT",body:JSON.stringify({equations:y}),headers:{"Content-Type":"application/json"}})};let ue;const je=y=>{!I||(ue&&clearTimeout(ue),ue=setTimeout(async()=>{if(!y){e(8,S=""),console.log("No user",y),history.pushState(null,"","/"),await V(h);return}const k=await V(y);k?e(8,S=k):e(8,S=""),history.pushState(null,"",`?view=${y}`)},500))};let de=!1,ee;const be=(y,k=!0)=>{if(!G||y.h.error||y.s.error||y.v.error||!+a||!+v)return;if(de){ee&&clearInterval(ee),ee=setInterval(()=>{de||(be(y,k),clearInterval(ee))},1);return}A=y;const K=new Uint32Array([+a,+v]),re=new Uint32Array(y.h.compiledValue),B=new Uint32Array(y.s.compiledValue),le=new Uint32Array(y.v.compiledValue),oe=new Uint32Array([+k]),Te=new Uint32Array([j.END,0]),x=new WebSocket("wss://home.anb.codes:13655");de=!0,x.addEventListener("open",()=>{console.log("Sending..."),x.send(K.buffer),x.send(oe.buffer),x.send(re.buffer),x.send(Te.buffer),x.send(B.buffer),x.send(Te.buffer),x.send(le.buffer),x.send(Te.buffer)}),x.addEventListener("close",()=>{de=!1,console.log("closed")})};let O,X;const Y=(y,k)=>()=>{if(!Q)return;const K=Yl(y.value);K.error?y.error=K.error:(y.error="",y.compiledValue=K.compiled),be(k),X&&clearTimeout(X),console.log("Attempt send",o),X=setTimeout(()=>$(o),500),e(0,o),e(4,O)},L=()=>{const y={h:{value:"",compiledValue:[],onChange:()=>{},error:""},s:{value:"",compiledValue:[],onChange:()=>{},error:""},v:{value:"",compiledValue:[],onChange:()=>{},error:""},name:"New Equation",open:!0};y.h.onChange=Y(y.h,y),y.s.onChange=Y(y.s,y),y.v.onChange=Y(y.v,y),y.h.onChange(),y.s.onChange(),y.v.onChange(),o.push(y),e(0,o),e(4,O),$(o)},se=y=>{e(0,o=o.filter(k=>k!==y))},ve=y=>{const k={h:{value:y.h.value,compiledValue:[],onChange:()=>{},error:""},s:{value:y.s.value,compiledValue:[],onChange:()=>{},error:""},v:{value:y.v.value,compiledValue:[],onChange:()=>{},error:""},name:y.name,open:!0};k.h.onChange=Y(k.h,k),k.s.onChange=Y(k.s,k),k.v.onChange=Y(k.v,k),k.h.onChange(),k.s.onChange(),k.v.onChange(),e(0,o=n),e(3,g=""),e(4,O=void 0),o.push(k),$(o),e(0,o),e(4,O)};let ge=!1,R=!1,me=!1,fe="",F="",ce="",ae="";const Ve=async()=>{if(fe.length!==25){e(14,F="Key must be 25 characters long");return}const k=await(await fetch(`https://leds.spry.workers.dev/get-username?key=${_}`,{method:"GET"})).json();k.username?(e(7,_=fe),e(6,h=k.username),V(h),e(14,F=""),e(13,fe=""),localStorage.setItem("key",_),localStorage.setItem("username",h)):e(14,F=k.error)},Me=async()=>{e(12,me=!1);const k=await(await fetch(`https://leds.spry.workers.dev/new-pass?key=${_}`,{method:"POST"})).json();k.key&&(e(7,_=k.key),localStorage.setItem("key",_))},Ee=async()=>{if(ce==="")return;const k=await(await fetch(`https://leds.spry.workers.dev/set-username?key=${_}&username=${ce}`,{method:"POST"})).json();k.success?(e(6,h=ce),e(16,ae=""),e(15,ce=""),localStorage.setItem("username",h)):e(16,ae=k.error)},he=()=>{localStorage.removeItem("username"),localStorage.removeItem("key"),location.reload()},Ke=()=>e(11,R=!R);function Je(){g=this.value,e(3,g)}const W=y=>{e(4,O=y),be(O)},we=()=>{e(4,O=void 0)},Oe=()=>O?ve(O):void 0,M=()=>{e(10,ge=!1),O&&se(O),e(4,O=void 0)},He=()=>e(10,ge=!1),Pe=()=>e(10,ge=!0);function Se(){O.name=this.value,e(4,O)}function Le(){O.h.value=this.value,e(4,O)}function ke(){O.s.value=this.value,e(4,O)}function Qe(){O.v.value=this.value,e(4,O)}function _e(y){Fl[y?"unshift":"push"](()=>{C=y,e(9,C)})}function Ye(){a=this.value,e(1,a)}function z(){a=this.value,e(1,a)}function We(){v=this.value,e(2,v)}function Ne(){v=this.value,e(2,v)}const tt=()=>e(5,m=!m),rt=()=>{e(12,me=!1)},Ie=()=>Me(),te=()=>e(12,me=!0);function U(){fe=this.value,e(13,fe)}const P=()=>Ve();function lt(){ce=this.value,e(15,ce)}const ze=()=>Ee(),Ge=()=>he(),q=()=>location.reload();return t.$$.update=()=>{t.$$.dirty[0]&33554434&&I&&localStorage.setItem("password_p1",a),t.$$.dirty[0]&33554436&&I&&localStorage.setItem("password_p2",v),t.$$.dirty[0]&33554440&&I&&je(g),t.$$.dirty[0]&17&&O&&(e(0,o),e(4,O))},[o,a,v,g,O,m,h,_,S,C,ge,R,me,fe,F,ce,ae,be,L,se,ve,Ve,Me,Ee,he,I,Ke,Je,W,we,Oe,M,He,Pe,Se,Le,ke,Qe,_e,Ye,z,We,Ne,tt,rt,Ie,te,U,P,lt,ze,Ge,q]}class po extends Kl{constructor(r){super(),Hl(this,r,fo,co,Wl,{},null,[-1,-1,-1])}}export{po as default};
