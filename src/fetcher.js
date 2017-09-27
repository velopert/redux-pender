import pathToRegexp from 'path-to-regexp';

const fetcher = (function() {

  let _config = [];

  function matchPattern(path, pattern) {
    const keys = [];
    const re = pathToRegexp(pattern, keys);
  
    const match = re.exec(path);
    if(!match) return null;
    
    const [ fullPath, ...paramsArray ] = match;
    
    const params = {};
  
    paramsArray.forEach((param, i) => {
      if(param) {
        params[keys[i].name] = param;
      }
    });
  
    return params;
  }

  function enroute(path) {
    for (let route of _config) {
      const params = matchPattern(path, route.path);
      if(params) {
        return { route, params };
      }
    }
  }

  return {
    init(config) {
      _config = config;
    },
    process(path, query) {
      const match = enroute(path);
      if(!match) return;
  
      return match.route.resolve(match.params, query);
    }
  };
})();

export default fetcher;
