import{j as r}from"./jsx-runtime-D_zvdyIk.js";const e=({variant:k="primary",size:yr="md",startIcon:f,endIcon:B,loading:s=!1,fullWidth:xr=!1,className:kr="",children:fr,disabled:Br,...br})=>{const jr="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",Lr={sm:"px-3 py-2 text-sm",md:"px-4 py-2.5 text-sm",lg:"px-5 py-3 text-base"},Sr={primary:"bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 shadow-sm",secondary:"bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",outline:"border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",ghost:"text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800",link:"text-brand-600 hover:text-brand-700 focus:ring-brand-500 underline-offset-4 hover:underline p-0 h-auto font-normal"},wr=xr?"w-full":"",b=k==="link",Nr=b?"inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed":jr,Wr=b?"":Lr[yr];return r.jsxs("button",{className:`${Nr} ${Wr} ${Sr[k]} ${wr} ${kr}`,disabled:Br||s,...br,children:[s&&r.jsxs("svg",{className:"animate-spin h-4 w-4",fill:"none",viewBox:"0 0 24 24",children:[r.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),r.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),!s&&f&&r.jsx("span",{className:"flex items-center",children:f}),fr,!s&&B&&r.jsx("span",{className:"flex items-center",children:B})]})},Cr={title:"Atoms/Button",component:e,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["primary","secondary","outline","ghost","link"]},size:{control:{type:"select"},options:["sm","md","lg"]},loading:{control:{type:"boolean"}},disabled:{control:{type:"boolean"}},fullWidth:{control:{type:"boolean"}}}},a={args:{variant:"primary",children:"Primary Button"}},n={args:{variant:"secondary",children:"Secondary Button"}},o={args:{variant:"outline",children:"Outline Button"}},t={args:{variant:"ghost",children:"Ghost Button"}},i={args:{variant:"link",children:"Link Button"}},c={args:{size:"sm",children:"Small"}},d={args:{size:"md",children:"Medium"}},l={args:{size:"lg",children:"Large"}},u={args:{loading:!0,children:"Loading..."}},m={args:{disabled:!0,children:"Disabled Button"}},p={args:{fullWidth:!0,children:"Full Width Button"},parameters:{layout:"padded"}},g={args:{startIcon:r.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:r.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 6v6m0 0v6m0-6h6m-6 0H6"})}),children:"Add Item"}},h={args:{endIcon:r.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:r.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5l7 7-7 7"})}),children:"Continue"}},v={args:{startIcon:r.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:r.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),endIcon:r.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:r.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5l7 7-7 7"})}),children:"Download"}},y={render:()=>r.jsx("div",{className:"space-y-4",children:r.jsxs("div",{className:"flex gap-2 flex-wrap items-center",children:[r.jsx(e,{variant:"primary",children:"Primary"}),r.jsx(e,{variant:"secondary",children:"Secondary"}),r.jsx(e,{variant:"outline",children:"Outline"}),r.jsx(e,{variant:"ghost",children:"Ghost"}),r.jsx(e,{variant:"link",children:"Link"})]})}),parameters:{layout:"padded"}},x={render:()=>r.jsx("div",{className:"space-y-4",children:r.jsxs("div",{className:"flex gap-2 items-center flex-wrap",children:[r.jsx(e,{size:"sm",children:"SM"}),r.jsx(e,{size:"md",children:"MD"}),r.jsx(e,{size:"lg",children:"LG"})]})}),parameters:{layout:"padded"}};var j,L,S;a.parameters={...a.parameters,docs:{...(j=a.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
}`,...(S=(L=a.parameters)==null?void 0:L.docs)==null?void 0:S.source}}};var w,N,W;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
}`,...(W=(N=n.parameters)==null?void 0:N.docs)==null?void 0:W.source}}};var z,C,M;o.parameters={...o.parameters,docs:{...(z=o.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    variant: 'outline',
    children: 'Outline Button'
  }
}`,...(M=(C=o.parameters)==null?void 0:C.docs)==null?void 0:M.source}}};var I,A,D;t.parameters={...t.parameters,docs:{...(I=t.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    children: 'Ghost Button'
  }
}`,...(D=(A=t.parameters)==null?void 0:A.docs)==null?void 0:D.source}}};var G,O,P;i.parameters={...i.parameters,docs:{...(G=i.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    variant: 'link',
    children: 'Link Button'
  }
}`,...(P=(O=i.parameters)==null?void 0:O.docs)==null?void 0:P.source}}};var V,$,E;c.parameters={...c.parameters,docs:{...(V=c.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: 'Small'
  }
}`,...(E=($=c.parameters)==null?void 0:$.docs)==null?void 0:E.source}}};var F,H,_;d.parameters={...d.parameters,docs:{...(F=d.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: 'Medium'
  }
}`,...(_=(H=d.parameters)==null?void 0:H.docs)==null?void 0:_.source}}};var R,T,q;l.parameters={...l.parameters,docs:{...(R=l.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: 'Large'
  }
}`,...(q=(T=l.parameters)==null?void 0:T.docs)==null?void 0:q.source}}};var J,K,Q;u.parameters={...u.parameters,docs:{...(J=u.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    loading: true,
    children: 'Loading...'
  }
}`,...(Q=(K=u.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var U,X,Y;m.parameters={...m.parameters,docs:{...(U=m.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: 'Disabled Button'
  }
}`,...(Y=(X=m.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,rr,er;p.parameters={...p.parameters,docs:{...(Z=p.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  args: {
    fullWidth: true,
    children: 'Full Width Button'
  },
  parameters: {
    layout: 'padded'
  }
}`,...(er=(rr=p.parameters)==null?void 0:rr.docs)==null?void 0:er.source}}};var sr,ar,nr;g.parameters={...g.parameters,docs:{...(sr=g.parameters)==null?void 0:sr.docs,source:{originalSource:`{
  args: {
    startIcon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">\r
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />\r
      </svg>,
    children: 'Add Item'
  }
}`,...(nr=(ar=g.parameters)==null?void 0:ar.docs)==null?void 0:nr.source}}};var or,tr,ir;h.parameters={...h.parameters,docs:{...(or=h.parameters)==null?void 0:or.docs,source:{originalSource:`{
  args: {
    endIcon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">\r
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />\r
      </svg>,
    children: 'Continue'
  }
}`,...(ir=(tr=h.parameters)==null?void 0:tr.docs)==null?void 0:ir.source}}};var cr,dr,lr;v.parameters={...v.parameters,docs:{...(cr=v.parameters)==null?void 0:cr.docs,source:{originalSource:`{
  args: {
    startIcon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">\r
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />\r
      </svg>,
    endIcon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">\r
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />\r
      </svg>,
    children: 'Download'
  }
}`,...(lr=(dr=v.parameters)==null?void 0:dr.docs)==null?void 0:lr.source}}};var ur,mr,pr;y.parameters={...y.parameters,docs:{...(ur=y.parameters)==null?void 0:ur.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">\r
      <div className="flex gap-2 flex-wrap items-center">\r
        <Button variant="primary">Primary</Button>\r
        <Button variant="secondary">Secondary</Button>\r
        <Button variant="outline">Outline</Button>\r
        <Button variant="ghost">Ghost</Button>\r
        <Button variant="link">Link</Button>\r
      </div>\r
    </div>,
  parameters: {
    layout: 'padded'
  }
}`,...(pr=(mr=y.parameters)==null?void 0:mr.docs)==null?void 0:pr.source}}};var gr,hr,vr;x.parameters={...x.parameters,docs:{...(gr=x.parameters)==null?void 0:gr.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">\r
      <div className="flex gap-2 items-center flex-wrap">\r
        <Button size="sm">SM</Button>\r
        <Button size="md">MD</Button>\r
        <Button size="lg">LG</Button>\r
      </div>\r
    </div>,
  parameters: {
    layout: 'padded'
  }
}`,...(vr=(hr=x.parameters)==null?void 0:hr.docs)==null?void 0:vr.source}}};const Mr=["Primary","Secondary","Outline","Ghost","Link","Small","Medium","Large","Loading","Disabled","FullWidth","WithStartIcon","WithEndIcon","WithBothIcons","AllVariants","AllSizes"];export{x as AllSizes,y as AllVariants,m as Disabled,p as FullWidth,t as Ghost,l as Large,i as Link,u as Loading,d as Medium,o as Outline,a as Primary,n as Secondary,c as Small,v as WithBothIcons,h as WithEndIcon,g as WithStartIcon,Mr as __namedExportsOrder,Cr as default};
