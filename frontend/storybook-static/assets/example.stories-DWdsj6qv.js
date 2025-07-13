import{j as s}from"./jsx-runtime-D_zvdyIk.js";const x=({text:u="Hello Storybook!"})=>s.jsxs("div",{className:"p-4 bg-blue-100 rounded-lg border border-blue-300",children:[s.jsx("h2",{className:"text-xl font-bold text-blue-800 mb-2",children:"Example Component"}),s.jsx("p",{className:"text-blue-600",children:u})]}),h={title:"Example/ExampleComponent",component:x,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{text:{control:"text"}}},e={args:{text:"Hello Storybook!"}},t={args:{text:"This is a custom message"}},o={args:{text:"This is a very long text to demonstrate how the component handles longer content. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}};var r,a,n;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    text: 'Hello Storybook!'
  }
}`,...(n=(a=e.parameters)==null?void 0:a.docs)==null?void 0:n.source}}};var c,m,l;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    text: 'This is a custom message'
  }
}`,...(l=(m=t.parameters)==null?void 0:m.docs)==null?void 0:l.source}}};var p,i,d;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    text: 'This is a very long text to demonstrate how the component handles longer content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  }
}`,...(d=(i=o.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};const b=["Default","CustomText","LongText"];export{t as CustomText,e as Default,o as LongText,b as __namedExportsOrder,h as default};
