# Artery Simulator

技术要点

- wrap every node in a element, which `display: contents`, so the wrapped element looks like no exist
- IntersectionObserver node position, register it, used to render a mirror element
- implement drag and drop on mirror element
- the real node could be rendered as really as possible

- Simulator render artery structure, but not interactive
- Simulator tell you the clicked node position
- Simulator zoom in?

## TODO

- mock init api state function，这样在 debug 模式下可以让用户操作页面，但不发请求？
- drop node, done
- toolbar, duplicate node recursively

## 组件渲染结果分析

- html 组件始终渲染，不用担心 dom 变更的问题
- react component 不确定
  - 直接渲染且未来不变
  - 始终 return null, 忽略不管
  - return dom list，暂时不管，return first
  - return dom first, then return null，忽略不管，最终的 mirror 也同样会消失
  - return null first, then return dom
  - return dom first, but changed dom after

## Block things

- 需要提供一个判断组件是否支持 children 的接口，以便让 simulator 为其渲染一个 placeholder
- simulator 需要把拖拽过程中的 artery 返回，用来在侧边栏展示，web-flow and ali 是这么做的，但是有没有更好的方式呢？
- shadow node 的 toolbar 可能的操作很多
  - duplicate
  - delete
  - parent path
  - A indicator
  - Loop indicator
  - condition rendering indicator
  - 需要支持 drop image/video/audio，和处理 repository 的 drop 是不是同一个事情？
    - 现在有耦合的地方就是如果 drop 的是图片，需要先将图片上传，然后在改 artery
    - 提供一个 ondrop file 的接口？好，先这样，后期如果有更多耦合的地方，再将 green zone 等的渲染放到外面
