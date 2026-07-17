;(function () {
  function applyRootSizing() {
    var urlParams = new URLSearchParams(window.location.search);
    var scale = urlParams.get('scale');
    var width = urlParams.get('width');
    var height = urlParams.get('height');
    var rootElement = document.getElementById('root');
    if (!rootElement) return;
    if (scale) {
      var scaleValue = parseFloat(scale);
      if (!Number.isNaN(scaleValue) && scaleValue > 0) {
        rootElement.style.transform = 'scale(' + scaleValue + ')';
        rootElement.style.transformOrigin = 'top left';
      }
    }
    if (width) {
      var widthValue = parseInt(width, 10);
      if (!Number.isNaN(widthValue) && widthValue > 0) rootElement.style.width = widthValue + 'px';
    }
    if (height) {
      var heightValue = parseInt(height, 10);
      if (!Number.isNaN(heightValue) && heightValue > 0) rootElement.style.height = heightValue + 'px';
    }
  }
  function renderComponent(Component, props) {
    var rootElement = document.getElementById('root');
    if (!rootElement || !window.React || !window.ReactDOM) return;
    var finalProps = props || { container: rootElement, config: {}, data: {}, events: {} };
    if (typeof window.ReactDOM.createRoot === 'function') {
      window.ReactDOM.createRoot(rootElement).render(window.React.createElement(Component, finalProps));
      return;
    }
    if (typeof window.ReactDOM.render === 'function') {
      window.ReactDOM.render(window.React.createElement(Component, finalProps), rootElement);
    }
  }
  applyRootSizing();
  window.__AXHUB_DEFINE_COMPONENT__ = function (Component) {
    window.UserComponent = Component;
    return Component;
  };
  window.HtmlTemplateBootstrap = {
    renderComponent: renderComponent,
    React: window.React,
    ReactDOM: window.ReactDOM,
  };
})();