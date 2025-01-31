function createElement(type, props, ...children) {
  return typeof type === "function" ? {
    type: type.name,
    props: {
      ...props,
      children: type({
        ...props,
        children
      })
    }
  } : {
    type,
    props: {
      ...props,
      children
    }
  };
}
function Fragment({
  children
}) {
  return children;
}
const React = {
  createElement,
  Fragment
};
export default React;