define([
   'UI/NodeCollector',
   'Env/Env'
], function(NodeCollector, Env) {
   'use strict';

   var goUpByControlTree = NodeCollector.goUpByControlTree;
   var tests = {
      'Null target': {
         target: null,
         checkFn: function(target, result) {
            assert.isTrue(result.length === 0, 'Check controls count');
         }
      },
      'New controls only (1 node)': {
         target: {
            _$controls: [{
               control: {
                  _options: { }
               }
            }]
         },
         checkFn: function(target, result) {
            assert.isTrue(result.length === 1, 'Check controls count');
            assert.isTrue(result[0] === target._$controls[0].control, 'Check first control');
         }
      },
      'New controls only (2 nodes)': {
         target: {
            _$controls: [{
               control: {
                  _options: {
                     _parent: {
                        _options: true
                     }
                  }
               },
               parent: {
                  control: {
                     _options: { }
                  }
               }
            }]
         },
         checkFn: function(target, result) {
            assert.isTrue(result.length === 2, 'Check controls count');
            assert.isTrue(result[0] === target._$controls[0].control, 'Check first control');
            assert.isTrue(result[1] === target._$controls[0].parent.control, 'Check second control');
         }
      },
      'New controls only 2 (2 nodes)': {
         target: {
            _$controls: [{
               control: {
                  _options: {
                     opener: {
                        _options: { },
                        _container:{ }
                     }
                  }
               }
            }]
         },
         beforeTest: function(target) {
            target._$controls[0].control._options.opener._container._$controls = [
               {
                  control: target._$controls[0].control._options.opener
               }
            ];
         },
         checkFn: function(target, result) {
            assert.isTrue(result.length === 2, 'Check controls count');
            assert.isTrue(result[0] === target._$controls[0].control, 'Check first control');
            assert.isTrue(result[1] === target._$controls[0].control._options.opener, 'Check second control');
         }
      },
      'Old controls only (1 node)': {
         target: {
            _$controls: false,
            wsControl: { }
         },
         checkFn: function(target, result) {
            assert.isTrue(result.length === 1, 'Check controls count');
            assert.isTrue(result[0] === target.wsControl, 'Check first control');
         }
      },
      'Old controls only (2 nodes)': {
         target: {
            _$controls: false,
            wsControl: {
               _options: {
                  parent: {
                     _options: { }
                  }
               }
            }
         },
         checkFn: function(target, result) {
            if (Env.constants.compat) {
               assert.isTrue(result.length === 2, 'Check controls count');
               assert.isTrue(result[0] === target.wsControl, 'Check first control');
               assert.isTrue(result[1] === target.wsControl._options.parent, 'Check second control');
            }
         }
      },
      'Mixed controls 1 (2 nodes)': {
         target: {
            _$controls: false,
            wsControl: {
               _options: {
                  parent: {
                     _options: true,
                     _template: true,
                     _container: {
                        _$controls: [{
                           control: {
                              _options: false
                           }
                        }]
                     }
                  }
               }
            }
         },
         checkFn: function(target, result) {
            assert.isTrue(result.length === 2);
            assert.isTrue(result[0] === target.wsControl, 'Check controls count');
            assert.isTrue(result[1] === target.wsControl._options.parent._container._$controls[0].control, 'Check first control');
         }
      },
      'Mixed controls 2 (2 nodes)': {
         target: {
            _$controls: [{
               control: {
                  _options: {
                     parent: {
                        _options: {}
                     }
                  }
               }
            }]
         },
         checkFn: function(target, result) {
            assert.isTrue(result.length === 2);
            assert.isTrue(result[0] === target._$controls[0].control, 'Check controls count');
            assert.isTrue(result[1] === target._$controls[0].control._options.parent, 'Check first control');
         }
      },
      'purified opener': {
         target: {
            _$controls: false,
            wsControl: {
               _options: {
                  opener: {
                     __purified: true
                  }
               }
            }
         },
         checkFn: function(target, result) {
            assert.isTrue(result.length === 1);
         }
      }
   };

   describe.skip('Test function goUpByControlTree()', function() {
      Object.keys(tests).forEach(function(testName) {
         var test = tests[testName];
         it(testName, function literalTest() {
            test.beforeTest && test.beforeTest(test.target);
            test.checkFn(test.target, goUpByControlTree(test.target));
         });
         it(testName + ' with jquery', function literalTest() {
            test.beforeTest && test.beforeTest(test.target);
            test.checkFn(test.target, goUpByControlTree({ 0: test.target, jquery: true }));
         });
         it(testName + ' with searching for the nearest component', function literalTest() {
            test.beforeTest && test.beforeTest(test.target);
            var newTarget = {
               parentNode: {
                  parentNode: {
                     parentNode: {
                        parentNode: test.target
                     }
                  }
               }
            };
            test.checkFn(test.target, goUpByControlTree(newTarget));
         });
      });
   });
});
