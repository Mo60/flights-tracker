if(!self.define){let s,e={};const l=(l,i)=>(l=new URL(l+".js",i).href,e[l]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=l,s.onload=e,document.head.appendChild(s)}else s=l,importScripts(l),e()})).then((()=>{let s=e[l];if(!s)throw new Error(`Module ${l} didn’t register its module`);return s})));self.define=(i,r)=>{const n=s||("document"in self?document.currentScript.src:"")||location.href;if(e[n])return;let u={};const a=s=>l(s,n),t={module:{uri:n},exports:u,require:a};e[n]=Promise.all(i.map((s=>t[s]||a(s)))).then((s=>(r(...s),u)))}}define(["./workbox-f3e6b16a"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"about.html",revision:"bea4a155ee3277fd504cb665ecba5949"},{url:"assets/_...all_-c44e0b26.js",revision:null},{url:"assets/_name_-d70b573f.js",revision:null},{url:"assets/404-c29e1c46.js",revision:null},{url:"assets/about-7ec9908c.js",revision:null},{url:"assets/app-bfa694d2.js",revision:null},{url:"assets/ar-0eb78e82.js",revision:null},{url:"assets/de-1d048ed8.js",revision:null},{url:"assets/en-58641bd2.js",revision:null},{url:"assets/es-695014b3.js",revision:null},{url:"assets/flightTracker-d5693636.js",revision:null},{url:"assets/fr-dac7f002.js",revision:null},{url:"assets/home-fcd3b536.js",revision:null},{url:"assets/id-96d44a7c.js",revision:null},{url:"assets/index-ae3ca2da.css",revision:null},{url:"assets/it-722f4f77.js",revision:null},{url:"assets/ja-357ab22b.js",revision:null},{url:"assets/ka-cc514cb9.js",revision:null},{url:"assets/ko-31fd6682.js",revision:null},{url:"assets/pl-b4d08f74.js",revision:null},{url:"assets/pt-BR-e5840fd8.js",revision:null},{url:"assets/README-fc1b35f9.js",revision:null},{url:"assets/ru-1f9df64c.js",revision:null},{url:"assets/tr-c2f43110.js",revision:null},{url:"assets/uk-9a65a31a.js",revision:null},{url:"assets/uz-629fed99.js",revision:null},{url:"assets/vi-6fb840cb.js",revision:null},{url:"assets/virtual_pwa-register-86e6933b.js",revision:null},{url:"assets/workbox-window.prod.es5-a7b12eab.js",revision:null},{url:"assets/zh-CN-78ecf232.js",revision:null},{url:"flighttracker.html",revision:"24d951174b2ed107f2fd1f128e1eae8f"},{url:"index.html",revision:"4e8ce858e6a539809f0a59cf71e2bc37"},{url:"readme.html",revision:"9e8248f98f3437d4481af57ab3668d94"},{url:"favicon.svg",revision:"2ad4d1d5a4069be6a176f47bbe412dbd"},{url:"safari-pinned-tab.svg",revision:"21a5632e21f7421e63e58f3a8a3e205e"},{url:"pwa-192x192.png",revision:"4adbc15463be1bc54fa9459901b3eb57"},{url:"pwa-512x512.png",revision:"d4ae6d1bf0dcece37e9605fc855b8203"},{url:"manifest.webmanifest",revision:"d25476b76ced1bde440eaab8b2f8a92b"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
