/**
 * @jest-environment jsdom
 */
/* global assert, sinon */
define([
   'UICore/Focus',
   'UICore/Base',
   'Env/Env',
   'UICommon/_focus/ElementFinder',
   'UICommon/_focus/_ResetScrolling',
   'ReactUnitTest/Focus'
], function (
   Focus,
   Base,
   Env,
   ElementFinder,
   _ResetScrolling,
   FocusTestControls
) {
   'use strict';
   const constants = Env.constants;

   let sandbox;

   describe('Focus', function () {
      var div;
      var control;
      var globalCases = [];
      var currentCase;

      // создание тест-кейсов в цикле
      function createTests(testCases) {
         const getCaseFunction = function (_case) {
            return function (done) {
               _case.checkFn(done);
               if (!_case.async) {
                  done();
               }
            };
         };
         for (var i = 0; i < testCases.length; ++i) {
            it(
               testCases[i].name || `test localCases[${i}]`,
               getCaseFunction(testCases[i])
            );
         }
      }

      before(function () {
         sandbox = sinon.createSandbox();
         sandbox.stub(constants, 'compat').value(false);
         sandbox.stub(Base, 'purifyInstance');

         sandbox.stub(document, 'hasFocus').returns(true);
      });

      after(function () {
         sandbox.restore();
      });

      beforeEach(function (done) {
         currentCase = globalCases.shift();
         if (!currentCase) {
            done();
            return;
         }
         div = document.createElement('div');
         document.body.appendChild(div);
         var ctr = currentCase.control;
         if (ctr) {
            Base.Control.createControl(
               FocusTestControls.Root,
               {
                  content: ctr,
                  afterMountCallback: function (_self) {
                     control = _self;
                     control._mounted = true;
                     done();
                  },
                  testName: currentCase.name
               },
               div
            );
         } else {
            done();
         }
      });

      afterEach(function () {
         Focus.stopDOMFocusSystem();
         if (control) {
            Base.Control.destroyControl(control, div);
         }
         document.body.removeChild(div);
      });

      describe('activate', function () {
         var localCases = [
            {
               control: FocusTestControls.Simple,
               name: 'simple',
               checkFn: function () {
                  const container = document.getElementById('simple');
                  assert.ok(Focus.activate(container));
                  assert.strictEqual(document.activeElement, container);
               }
            },
            {
               control: FocusTestControls.MinusOneTabindex,
               name: 'tabindex="-1"',
               checkFn: function () {
                  assert.notOk(Focus.activate(div));
                  assert.strictEqual(document.activeElement, document.body);
               }
            },
            {
               control: FocusTestControls.DelegatedTabfocus,
               name: 'delegates tabfocus',
               checkFn: function () {
                  assert.ok(
                     Focus.activate(document.getElementById('start focus it'))
                  );
                  assert.strictEqual(
                     document.activeElement,
                     document.getElementById('delegated')
                  );
               }
            },
            {
               control: FocusTestControls.SvgWithNoFocus,
               name: 'focus SVG Element',
               checkFn: function () {
                  assert.ok(Focus.activate(div));
                  assert.strictEqual(document.activeElement, document.body);
               }
            },
            {
               control: FocusTestControls.AutofocusInside,
               name: 'has autofocus control inside',
               checkFn: function () {
                  assert.ok(Focus.activate(div));
                  assert.strictEqual(
                     document.activeElement,
                     control._children.autofocusChild._container
                  );
               }
            },
            {
               control: FocusTestControls.WithInputFakeMobile,
               name: 'focus textarea in mobile platform',
               checkFn: function () {
                  const container = document.getElementById('fakeMobileRoot');
                  assert.ok(Focus.activate(container));
                  assert.strictEqual(document.activeElement, container);
               }
            },
            {
               control: FocusTestControls.WithInputFakeMobile,
               name: 'focus input with type text in mobile fakeMobileRoot',
               checkFn: function () {
                  const container = document.getElementById('fakeMobileRoot');
                  assert.ok(Focus.activate(container));
                  assert.strictEqual(document.activeElement, container);
               }
            },
            {
               control: FocusTestControls.WithInputFakeMobile,
               name: 'focus textarea in mobile platform 2',
               checkFn: function () {
                  const container = document.getElementById('fakeMobileRoot');
                  assert.ok(Focus.activate(container));
                  assert.strictEqual(document.activeElement, container);
               }
            },
            {
               control: FocusTestControls.ContentEditableDiv,
               name: 'focus contentEditable div',
               checkFn: function () {
                  const container = document.getElementById('editableNormal');
                  assert.ok(Focus.activate(container));
                  assert.strictEqual(document.activeElement, container);
               }
            },
            {
               control: FocusTestControls.ContentEditableDivWithLink,
               name: 'focus contentEditable div with link',
               checkFn: function () {
                  var findElement = ElementFinder.getElementProps(
                     document.getElementById('editableWithLink')
                  );
                  assert.equal(findElement.delegateFocusToChildren, false);
               }
            }
         ];

         globalCases = globalCases.concat(localCases);
         createTests(localCases);
      });

      describe('Focus functions', function () {
         var localCases = [
            {
               name: 'Prevent focus on element without parentElement',
               checkFn: function () {
                  let focusPrevented = false;
                  let divElement = {
                     'ws-no-focus': true
                  };
                  let testTarget = {
                     parentNode: divElement,
                     parentElement: null,
                     getAttribute: function () {
                        return undefined;
                     }
                  };
                  Focus.preventFocus({
                     target: testTarget,
                     preventDefault: function () {
                        focusPrevented = true;
                     }
                  });
                  assert.isOk(focusPrevented);
               }
            }
         ];

         globalCases = globalCases.concat(localCases);
         createTests(localCases);
      });

      describe('Focus method', function () {
         var localCases = [
            {
               name: 'makeResetScrollFunction',
               checkFn: function () {
                  div.innerHTML =
                     '<div id="input" contenteditable="true"></div>';
                  var input = document.getElementById('input');
                  var scrolled = false;

                  var detection = Env.detection;
                  Env.detection = {
                     safari: true,
                     isMobileIOS: true,
                     isMobilePlatform: true
                  };

                  var collectScrollPositions =
                     _ResetScrolling.collectScrollPositions;
                  _ResetScrolling.collectScrollPositions = function () {
                     scrolled = true;
                     return function () {
                        /** */
                     };
                  };

                  try {
                     Focus.focus(input, {
                        enableScreenKeyboard: true
                     });
                  } finally {
                     Env.detection = detection;
                     _ResetScrolling.collectScrollPositions =
                        collectScrollPositions;
                  }
                  assert.notOk(scrolled);

                  // assert.strictEqual(document.activeElement, input);
               }
            },
            {
               name: 'no call HTMLElement.focus if focus() on element redefined',
               async: true,
               checkFn: function (done) {
                  assert.notOk(false);
                  div.innerHTML =
                     '<div id="input" contenteditable="true"></div>';
                  var input = document.getElementById('input');
                  var overridedFocusCalled = false;
                  input.focus = function () {
                     overridedFocusCalled = true;
                  };
                  var originFocus = HTMLElement.prototype.focus;
                  var nativeFocusCalled = false;
                  HTMLElement.prototype.focus = function () {
                     nativeFocusCalled = true;
                  };
                  try {
                     Focus.focus(input);
                     assert.notOk(nativeFocusCalled);
                     assert.ok(overridedFocusCalled);
                     done();
                  } catch (e) {
                     done(e);
                  } finally {
                     HTMLElement.prototype.focus = originFocus;
                  }
               }
            }
         ];

         globalCases = globalCases.concat(localCases);
         createTests(localCases);
      });
   });
});
