function LoginCtrl ($scope, Config) {
  // your code here
  var foo = (a) => a + 1

  var bar = foo(3)

  console.log('bar:', bar)

}

module.exports = ['$scope', 'Config', LoginCtrl]
