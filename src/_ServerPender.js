function ServerPender() {
  this.promises = [];
}

ServerPender.prototype = {
  wait() {
    return Promise.all(this.promises);
  },
  register(p) {
    this.promises.push(p);
  }
}

export default ServerPender;