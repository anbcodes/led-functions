function $(){}function F(t,n){for(const e in n)t[e]=n[e];return t}function P(t){return t()}function M(){return Object.create(null)}function p(t){t.forEach(P)}function B(t){return typeof t=="function"}function ut(t,n){return t!=t?n==n:t!==n||t&&typeof t=="object"||typeof t=="function"}function H(t){return Object.keys(t).length===0}function I(t,...n){if(t==null)return $;const e=t.subscribe(...n);return e.unsubscribe?()=>e.unsubscribe():e}function lt(t,n,e){t.$$.on_destroy.push(I(n,e))}function st(t,n,e,i){if(t){const r=O(t,n,e,i);return t[0](r)}}function O(t,n,e,i){return t[1]&&i?F(e.ctx.slice(),t[1](i(n))):e.ctx}function ot(t,n,e,i){if(t[2]&&i){const r=t[2](i(e));if(n.dirty===void 0)return r;if(typeof r=="object"){const o=[],c=Math.max(n.dirty.length,r.length);for(let s=0;s<c;s+=1)o[s]=n.dirty[s]|r[s];return o}return n.dirty|r}return n.dirty}function at(t,n,e,i,r,o){if(r){const c=O(n,e,i,o);t.p(c,r)}}function ft(t){if(t.ctx.length>32){const n=[],e=t.ctx.length/32;for(let i=0;i<e;i++)n[i]=-1;return n}return-1}let v=!1;function G(){v=!0}function J(){v=!1}function K(t,n,e,i){for(;t<n;){const r=t+(n-t>>1);e(r)<=i?t=r+1:n=r}return t}function Q(t){if(t.hydrate_init)return;t.hydrate_init=!0;let n=t.childNodes;if(t.nodeName==="HEAD"){const u=[];for(let l=0;l<n.length;l++){const f=n[l];f.claim_order!==void 0&&u.push(f)}n=u}const e=new Int32Array(n.length+1),i=new Int32Array(n.length);e[0]=-1;let r=0;for(let u=0;u<n.length;u++){const l=n[u].claim_order,f=(r>0&&n[e[r]].claim_order<=l?r+1:K(1,r,y=>n[e[y]].claim_order,l))-1;i[u]=e[f]+1;const a=f+1;e[a]=u,r=Math.max(a,r)}const o=[],c=[];let s=n.length-1;for(let u=e[r]+1;u!=0;u=i[u-1]){for(o.push(n[u-1]);s>=u;s--)c.push(n[s]);s--}for(;s>=0;s--)c.push(n[s]);o.reverse(),c.sort((u,l)=>u.claim_order-l.claim_order);for(let u=0,l=0;u<c.length;u++){for(;l<o.length&&c[u].claim_order>=o[l].claim_order;)l++;const f=l<o.length?o[l]:null;t.insertBefore(c[u],f)}}function W(t,n){if(v){for(Q(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentNode!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;n!==t.actual_end_child?(n.claim_order!==void 0||n.parentNode!==t)&&t.insertBefore(n,t.actual_end_child):t.actual_end_child=n.nextSibling}else(n.parentNode!==t||n.nextSibling!==null)&&t.appendChild(n)}function dt(t,n,e){v&&!e?W(t,n):(n.parentNode!==t||n.nextSibling!=e)&&t.insertBefore(n,e||null)}function R(t){t.parentNode&&t.parentNode.removeChild(t)}function _t(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function U(t){return document.createElement(t)}function S(t){return document.createTextNode(t)}function ht(){return S(" ")}function mt(){return S("")}function pt(t,n,e,i){return t.addEventListener(n,e,i),()=>t.removeEventListener(n,e,i)}function yt(t,n,e){e==null?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function V(t){return Array.from(t.childNodes)}function X(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function T(t,n,e,i,r=!1){X(t);const o=(()=>{for(let c=t.claim_info.last_index;c<t.length;c++){const s=t[c];if(n(s)){const u=e(s);return u===void 0?t.splice(c,1):t[c]=u,r||(t.claim_info.last_index=c),s}}for(let c=t.claim_info.last_index-1;c>=0;c--){const s=t[c];if(n(s)){const u=e(s);return u===void 0?t.splice(c,1):t[c]=u,r?u===void 0&&t.claim_info.last_index--:t.claim_info.last_index=c,s}}return i()})();return o.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,o}function Y(t,n,e,i){return T(t,r=>r.nodeName===n,r=>{const o=[];for(let c=0;c<r.attributes.length;c++){const s=r.attributes[c];e[s.name]||o.push(s.name)}o.forEach(c=>r.removeAttribute(c))},()=>i(n))}function gt(t,n,e){return Y(t,n,e,U)}function Z(t,n){return T(t,e=>e.nodeType===3,e=>{const i=""+n;if(e.data.startsWith(i)){if(e.data.length!==i.length)return e.splitText(i.length)}else e.data=i},()=>S(n),!0)}function xt(t){return Z(t," ")}function bt(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function $t(t,n){t.value=n==null?"":n}function vt(t,n,e,i){e===null?t.style.removeProperty(n):t.style.setProperty(n,e,i?"important":"")}function Et(t,n,e){t.classList[e?"add":"remove"](n)}function tt(t,n,{bubbles:e=!1,cancelable:i=!1}={}){const r=document.createEvent("CustomEvent");return r.initCustomEvent(t,e,i,n),r}function wt(t,n){return new t(n)}let m;function h(t){m=t}function j(){if(!m)throw new Error("Function called outside component initialization");return m}function Nt(t){j().$$.on_mount.push(t)}function At(t){j().$$.after_update.push(t)}function St(){const t=j();return(n,e,{cancelable:i=!1}={})=>{const r=t.$$.callbacks[n];if(r){const o=tt(n,e,{cancelable:i});return r.slice().forEach(c=>{c.call(t,o)}),!o.defaultPrevented}return!0}}const _=[],L=[],x=[],w=[],D=Promise.resolve();let N=!1;function q(){N||(N=!0,D.then(z))}function jt(){return q(),D}function A(t){x.push(t)}function Ct(t){w.push(t)}const E=new Set;let g=0;function z(){const t=m;do{for(;g<_.length;){const n=_[g];g++,h(n),nt(n.$$)}for(h(null),_.length=0,g=0;L.length;)L.pop()();for(let n=0;n<x.length;n+=1){const e=x[n];E.has(e)||(E.add(e),e())}x.length=0}while(_.length);for(;w.length;)w.pop()();N=!1,E.clear(),h(t)}function nt(t){if(t.fragment!==null){t.update(),p(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(A)}}const b=new Set;let d;function kt(){d={r:0,c:[],p:d}}function Mt(){d.r||p(d.c),d=d.p}function et(t,n){t&&t.i&&(b.delete(t),t.i(n))}function Lt(t,n,e,i){if(t&&t.o){if(b.has(t))return;b.add(t),d.c.push(()=>{b.delete(t),i&&(e&&t.d(1),i())}),t.o(n)}else i&&i()}function Pt(t,n,e){const i=t.$$.props[n];i!==void 0&&(t.$$.bound[i]=e,e(t.$$.ctx[i]))}function Bt(t){t&&t.c()}function Ot(t,n){t&&t.l(n)}function it(t,n,e,i){const{fragment:r,after_update:o}=t.$$;r&&r.m(n,e),i||A(()=>{const c=t.$$.on_mount.map(P).filter(B);t.$$.on_destroy?t.$$.on_destroy.push(...c):p(c),t.$$.on_mount=[]}),o.forEach(A)}function rt(t,n){const e=t.$$;e.fragment!==null&&(p(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function ct(t,n){t.$$.dirty[0]===-1&&(_.push(t),q(),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function Tt(t,n,e,i,r,o,c,s=[-1]){const u=m;h(t);const l=t.$$={fragment:null,ctx:[],props:o,update:$,not_equal:r,bound:M(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(u?u.$$.context:[])),callbacks:M(),dirty:s,skip_bound:!1,root:n.target||u.$$.root};c&&c(l.root);let f=!1;if(l.ctx=e?e(t,n.props||{},(a,y,...C)=>{const k=C.length?C[0]:y;return l.ctx&&r(l.ctx[a],l.ctx[a]=k)&&(!l.skip_bound&&l.bound[a]&&l.bound[a](k),f&&ct(t,a)),y}):[],l.update(),f=!0,p(l.before_update),l.fragment=i?i(l.ctx):!1,n.target){if(n.hydrate){G();const a=V(n.target);l.fragment&&l.fragment.l(a),a.forEach(R)}else l.fragment&&l.fragment.c();n.intro&&et(t.$$.fragment),it(t,n.target,n.anchor,n.customElement),J(),z()}h(u)}class Dt{$destroy(){rt(this,1),this.$destroy=$}$on(n,e){if(!B(e))return $;const i=this.$$.callbacks[n]||(this.$$.callbacks[n]=[]);return i.push(e),()=>{const r=i.indexOf(e);r!==-1&&i.splice(r,1)}}$set(n){this.$$set&&!H(n)&&(this.$$.skip_bound=!0,this.$$set(n),this.$$.skip_bound=!1)}}export{jt as A,$ as B,st as C,at as D,ft as E,ot as F,W as G,lt as H,pt as I,St as J,_t as K,Et as L,$t as M,p as N,L as O,Pt as P,Ct as Q,Dt as S,ht as a,dt as b,xt as c,Mt as d,mt as e,et as f,kt as g,R as h,Tt as i,At as j,U as k,gt as l,V as m,yt as n,Nt as o,vt as p,S as q,Z as r,ut as s,Lt as t,bt as u,wt as v,Bt as w,Ot as x,it as y,rt as z};
