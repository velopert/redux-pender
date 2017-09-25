function createServerPender() {
  return (function() {
    const promises = [];
      return {
        wait() {
          return Promise.all(promises);
        },
        register(p) {
          promises.push(p);
        }
      }
  })()
}

export default createServerPender;