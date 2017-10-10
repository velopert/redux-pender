import pathToRegexp from 'path-to-regexp';
import queryString from 'query-string';

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

class Fetcher {
  routes = []

  constructor(routes) {
    this.routes = routes;
  }
  
  enroute(path) {
    const { routes } = this;

    for(let route of routes) {
      const params = matchPattern(path, route.path);
      if(params) {
        return {route, params };
      }
    }

    return null;
  }

  process(url) {
    const sp = url.split('?');
    const path = sp[0];
    const query = queryString.parse(sp.slice(1, sp.length).join(''));

    const match = this.enroute(path);
    if(!match) return null;

    return match.route.resolve(match.params, query);
  }
}

export default Fetcher;
