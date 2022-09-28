# React SSR Examples

## Branches

`with-render-to-string`

API 요청이나 React.Lazy, React.Suspense를 사용하지 않는 정적 페이지를 SSR 하는데에 적합한 방식

`[WIP] with-render-to-stream`

Suspensed API 요청이나 React.Lazy, React.Suspense를 사용하는 페이지를 SSR 하는데에 적합한 방식

구현 및 동작은 확인하였으나 Hydration Fail 이 발생하는 원인을 확인하기가 어렵다.

## Hou To Run ?

```
$ git clone https://github.com/HamSungJun/react-ssr-examples.git
$ cd react-ssr-examples
$ npm install
$ npm run start:server
& localhost:5173
```
