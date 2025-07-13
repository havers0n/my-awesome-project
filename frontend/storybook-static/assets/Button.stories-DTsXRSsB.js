import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{S as T,D as H}from"./star-CJXwZCqy.js";import"./index-D4lIrffr.js";const l=({children:m,size:U="md",variant:A="primary",startIcon:u,endIcon:p,onClick:F,className:G="",disabled:h=!1})=>{const J={sm:"px-4 py-3 text-sm",md:"px-5 py-3.5 text-sm"},K={primary:"bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",outline:"bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"};return e.jsxs("button",{className:`inline-flex items-center justify-center gap-2 rounded-lg transition ${G} ${J[U]} ${K[A]} ${h?"cursor-not-allowed opacity-50":""}`,onClick:F,disabled:h,children:[u&&e.jsx("span",{className:"flex items-center",children:u}),m,p&&e.jsx("span",{className:"flex items-center",children:p})]})};try{l.displayName="Button",l.__docgenInfo={description:"",displayName:"Button",props:{size:{defaultValue:{value:"md"},description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'}]}},variant:{defaultValue:{value:"primary"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"outline"'}]}},startIcon:{defaultValue:null,description:"",name:"startIcon",required:!1,type:{name:"ReactNode"}},endIcon:{defaultValue:null,description:"",name:"endIcon",required:!1,type:{name:"ReactNode"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"(e?: MouseEvent<HTMLButtonElement, MouseEvent>) => void"}},disabled:{defaultValue:{value:"false"},description:"",name:"disabled",required:!1,type:{name:"boolean"}},className:{defaultValue:{value:""},description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const Z={title:"UI/Button",component:l,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:"select",options:["primary","outline"]},size:{control:"select",options:["sm","md"]},disabled:{control:"boolean"}}},a={args:{variant:"primary",children:"Primary Button"}},r={args:{variant:"outline",children:"Outline Button"}},s={args:{size:"sm",children:"Small Button"}},t={args:{size:"md",children:"Medium Button"}},n={args:{disabled:!0,children:"Disabled Button"}},o={args:{startIcon:e.jsx(T,{className:"w-4 h-4"}),children:"With Start Icon"}},i={args:{endIcon:e.jsx(H,{className:"w-4 h-4"}),children:"With End Icon"}},c={args:{startIcon:e.jsx(T,{className:"w-4 h-4"}),endIcon:e.jsx(H,{className:"w-4 h-4"}),children:"Both Icons"}},d={args:{children:"Loading...",disabled:!0,startIcon:e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-white"})}};var g,y,b;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
}`,...(b=(y=a.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var v,f,I;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    variant: 'outline',
    children: 'Outline Button'
  }
}`,...(I=(f=r.parameters)==null?void 0:f.docs)==null?void 0:I.source}}};var x,S,w;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: 'Small Button'
  }
}`,...(w=(S=s.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var B,N,j;t.parameters={...t.parameters,docs:{...(B=t.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: 'Medium Button'
  }
}`,...(j=(N=t.parameters)==null?void 0:N.docs)==null?void 0:j.source}}};var W,_,E;n.parameters={...n.parameters,docs:{...(W=n.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: 'Disabled Button'
  }
}`,...(E=(_=n.parameters)==null?void 0:_.docs)==null?void 0:E.source}}};var z,D,k;o.parameters={...o.parameters,docs:{...(z=o.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    startIcon: <Star className="w-4 h-4" />,
    children: 'With Start Icon'
  }
}`,...(k=(D=o.parameters)==null?void 0:D.docs)==null?void 0:k.source}}};var q,M,V;i.parameters={...i.parameters,docs:{...(q=i.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    endIcon: <Download className="w-4 h-4" />,
    children: 'With End Icon'
  }
}`,...(V=(M=i.parameters)==null?void 0:M.docs)==null?void 0:V.source}}};var L,O,C;c.parameters={...c.parameters,docs:{...(L=c.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    startIcon: <Star className="w-4 h-4" />,
    endIcon: <Download className="w-4 h-4" />,
    children: 'Both Icons'
  }
}`,...(C=(O=c.parameters)==null?void 0:O.docs)==null?void 0:C.source}}};var P,$,R;d.parameters={...d.parameters,docs:{...(P=d.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    children: 'Loading...',
    disabled: true,
    startIcon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  }
}`,...(R=($=d.parameters)==null?void 0:$.docs)==null?void 0:R.source}}};const ee=["Primary","Outline","Small","Medium","Disabled","WithStartIcon","WithEndIcon","WithBothIcons","Loading"];export{n as Disabled,d as Loading,t as Medium,r as Outline,a as Primary,s as Small,c as WithBothIcons,i as WithEndIcon,o as WithStartIcon,ee as __namedExportsOrder,Z as default};
