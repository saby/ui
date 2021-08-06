define([
      'UICore/Events',
      'UI/Base',
      'UI/Utils',
      'UICommon/_events/EventUtils'],
   function(Events, UIBase, UIUtils, UIEventUtils) {
      'use strict';

      var WasabyEvents = Events.WasabyEvents;
      var isNodeJs = typeof document === 'undefined';

      var testIf = function(condition) {
         return condition ? it : it.skip;
      };

      var describeIf = function(condition) {
         return condition ? describe : describe.skip;
      };

      var isReact = requirejs.defined('react');

      describe('WasabyEvent', function() {
         // В DOMEnvironment есть механизм совместимости для некоторых touch-устройств,
         // которые не стреляют событие клика, а стреляют только touchstart и touchend.
         // Он в таком случае стреляет клик самостоятельно, чтобы его можно было обработать
         // единообразно с обычным кликом.
         // Проверяем, что этот механизм не сбоит, и что он не генерирует лишние клики, если
         // тач-устройство стреляет их само после touchstart и touchend
         testIf(isNodeJs && isReact)('does not produce extra clicks on touch devices', function(done) {
            var
               elem = { removeEventListener: function(){}, blur: function() {}, focus: function() {} },
               events = new WasabyEvents(elem),
               clickCount = 0,
               touchCount = 0,
               touchEmitInterval,
               touchEmit,
               checkAndClear;

            events._getDocument = function() {
               return {activeElement: elem};
            };
            // Включаем обработку тач-событий
            events._shouldUseClickByTap = function() {
               return true;
            };

            // При каждом клике увеличиваем счетчик на один
            var origHandleClick = events._handleClick;
            events._handleClick = function() {
               clickCount++;
               origHandleClick.apply(events, arguments);
            };

            // Проверяем, что число кликов совпадает с числом тачей
            checkAndClear = function() {
               try {
                  assert.strictEqual(clickCount, touchCount);
                  done();
               } catch (e) {
                  done(e);
               } finally {
                  events.destroy();
               }
            };

            // Производим touchstart -> touchend -> click 50 раз с интервалом
            // в 15мс. (так как в DOMEnvironment асинхронное ожидание клика).
            // После этого проверяем, что лишних кликов не произошло, их число
            // совпадает с числом тачей
            touchEmit = function() {
               if (touchCount >= 50) {
                  clearInterval(touchEmitInterval);
                  checkAndClear();
               }
               events._handleTouchstart({ target: elem });
               events._handleTouchend({ target: elem });
               events._handleClick({ target: elem });
               touchCount++;
            };
            touchEmitInterval = setInterval(touchEmit, 15);
         });

         describe("WasabyEvents events", function() {
            var handlers, events, windowObject, rootDOM;
            var addNativeOrigin = WasabyEvents.prototype.addNativeListener;
            var removeNativeOrigin = WasabyEvents.prototype.removeNativeListener;
            var initProcessingHandlersOrigin = WasabyEvents.prototype.initProcessingHandlers;
            beforeEach(function() {
               WasabyEvents.prototype.addNativeListener = function(element, handler) {
                  if(!element.events) {
                     element.events = [];
                  }
                  element.events.push(handler);
               };
               WasabyEvents.prototype.removeNativeListener = function(element, handler) {
                  if(!element.eventsRemoved) {
                     element.eventsRemoved = [];
                  }
                  element.eventsRemoved.push(handler);
               };
               WasabyEvents.prototype.initProcessingHandlers = function() {};
               rootDOM = {parentNode: {}};
               events = new WasabyEvents(rootDOM);
               events._getWindowObject = function() {
                  return windowObject;
               }
               handlers = events.showCapturedEventHandlers();
               windowObject = {};
            });
            afterEach(function() {
               WasabyEvents.prototype.addNativeListener = addNativeOrigin;
               WasabyEvents.prototype.removeNativeListener = removeNativeOrigin;
               WasabyEvents.prototype.initProcessingHandlers = initProcessingHandlersOrigin;
            });
            it('DE addHandler simple capture new', function() {
               var testHandler, eventName, processingHandler, isBodyEvent;
               testHandler = function() {  };
               eventName = 'testEvent';
               processingHandler = false;
               isBodyEvent = false;
               events.addHandler(eventName, isBodyEvent, testHandler, processingHandler);
               assert.deepStrictEqual(handlers["testEvent"][0],
                  {bodyEvent: false, processingHandler: false, count: 1, handler: testHandler});
            });
            it('DE addHandler simple capture existing', function() {
               var testHandler, eventName, processingHandler, isBodyEvent;
               testHandler = function() {  };
               eventName = 'testEvent';
               processingHandler = false;
               isBodyEvent = false;
               events.addHandler(eventName, isBodyEvent, testHandler, processingHandler);
               events.addHandler(eventName, isBodyEvent, testHandler, processingHandler);
               assert.deepStrictEqual(handlers["testEvent"][0],
                  {bodyEvent: false, processingHandler: false, count: 2, handler: testHandler});
            });
            it('DE addHandler processing', function() {
               var testHandler, eventName, processingHandler, isBodyEvent;
               testHandler = function() {  };
               eventName = 'testEvent';
               processingHandler = true;
               isBodyEvent = false;
               events.addHandler(eventName, isBodyEvent, testHandler, processingHandler);
               assert.deepStrictEqual(handlers["testEvent"][0],
                  {bodyEvent: false, processingHandler: true, handler: testHandler, count: 0});
            });
            it('DE removeHandler simple capture existing count 1', function() {
               var testHandler, eventName, processingHandler, isBodyEvent;
               testHandler = function() {  };
               eventName = 'testEvent';
               processingHandler = false;
               isBodyEvent = false;
               events.addHandler(eventName, isBodyEvent, testHandler, processingHandler);
               events.removeHandler(eventName, isBodyEvent, processingHandler);
               assert.deepStrictEqual(handlers["testEvent"],[]);
            });
            it('DE removeHandler simple capture existing count 2', function() {
               var testHandler, eventName, processingHandler, isBodyEvent;
               testHandler = function() {  };
               eventName = 'testEvent';
               processingHandler = false;
               isBodyEvent = false;
               events.addHandler(eventName, isBodyEvent, testHandler, processingHandler);
               events.addHandler(eventName, isBodyEvent, testHandler, processingHandler);
               events.removeHandler(eventName, isBodyEvent, processingHandler);
               assert.deepStrictEqual(handlers["testEvent"][0],
                  {bodyEvent: false, processingHandler: false, count: 1, handler: testHandler});
               assert.isUndefined(rootDOM.parentNode.eventsRemoved);
            });
            it('DE removeHandler processing capture existing', function() {
               var testHandler, eventName, processingHandler, isBodyEvent;
               testHandler = function() {  };
               eventName = 'testEvent';
               processingHandler = true;
               isBodyEvent = false;
               events.addHandler(eventName, isBodyEvent, testHandler, processingHandler);
               events.removeHandler(eventName, isBodyEvent, false);
               assert.deepStrictEqual(handlers["testEvent"][0],
                  {bodyEvent: false, processingHandler: true, handler: testHandler, count: 0});
               assert.isUndefined(rootDOM.parentNode.eventsRemoved);
            });
         });
         describeIf(!isNodeJs)('DOMEnvironment events error', function() {
            function click(el) {
               var el = el[0] ? el[0] : el;
               var ev = document.createEvent('MouseEvent');
               ev.initEvent(
                  'click',
                  true /* bubble */,
                  true /* cancelable */,
                  window, null,
                  0, 0, 0, 0, /* coordinates */
                  false, false, false, false, /* modifier keys */
                  0 /*left*/, null
               );
               el.dispatchEvent(ev);
            }

            var Logger = UIUtils.Logger;
            var errorMessage, errorStub;
            var loggerErrorMock = (msg, errorPoint, errorInfo) => {
               errorMessage = msg + ' ' + errorInfo;
            };
            beforeEach(function() {
               errorMessage = '';
               errorStub = sinon.stub(Logger, 'error').callsFake(loggerErrorMock);
            });
            afterEach(function() {
               errorMessage = '';
               errorStub.restore();
            });

            // из-за асинхронного _afterMount тест будет не стабильный надо придумать что-то по-лучше
            // it('DE Empty handler error', function(done) {
            //    require(['WSTests/unit/tmpl/DomEnviroment/WrongHandler'], function(Component) {
            //       var innerElement = document.createElement('div');
            //       document.body.appendChild(innerElement);
            //       var component = UIBase.Control.createControl(Component, {}, innerElement);
            //       component._afterMount = function() {
            //          new Promise(function(resolve) {
            //             click(document.getElementById('clickHandler'));
            //             var check = errorMessage.indexOf('Ошибка при вызове обработчика "on:click" из контрола WSTests/unit/tmpl/DomEnviroment/WrongHandler') > -1;
            //             assert.isTrue(check);
            //             resolve();
            //          }).then(function() {
            //             try {
            //                done();
            //             } catch (err) {
            //                done(err);
            //                throw(err);
            //             }
            //          });
            //       };
            //    });
            // });
         });
         describe('Event Utils', function() {
            var Logger = UIUtils.Logger;
            var EventUtils = UIEventUtils;
            var warnMessage, warnStub;
            var loggerWarnMock = (msg) => {
               warnMessage = msg ;
            };
            const fakeEvent = {
               bindValue: '',
               data: null,
               handler: () => { return; },
               isControl: true,
               viewController: null
            };
            let res = null;
            beforeEach(function() {
               warnMessage = '';
               warnStub = sinon.stub(Logger, 'warn').callsFake(loggerWarnMock);
               fakeEvent.data = null;
               fakeEvent.bindValue = '';
               res = null;
               warnMessage = '';
            });
            afterEach(function() {
               warnMessage = '';
               warnStub.restore();
               fakeEvent.data = null;
               fakeEvent.bindValue = '';
               res = null;
            });
            it('bind simple', () => {
               fakeEvent.data = {data: 0, anyProp: 0};
               fakeEvent.bindValue = 'data';
               res = EventUtils.checkBindValue(fakeEvent, fakeEvent.bindValue);
               assert.equal(warnMessage, '');
            });
            it('bind object', () => {
               fakeEvent.data = {data: {value: 0}, anyProp: 0};
               fakeEvent.bindValue = 'data.value';
               res = EventUtils.checkBindValue(fakeEvent, fakeEvent.bindValue);
               assert.equal(warnMessage, '');
            });
            it('bind array of object', () => {
               fakeEvent.data = {data: [{value: 0}, {value: 0}, {value: 0}], anyProp: 0};
               fakeEvent.bindValue = 'data.value';
               res = EventUtils.checkBindValue(fakeEvent, fakeEvent.bindValue);
               assert.equal(warnMessage, '');
            });
            it('bind array of object with sub props', () => {
               fakeEvent.data = {data: [{sub: {value: 0}, value: 0}], anyProp: 0};
               fakeEvent.bindValue = 'data.value';
               res = EventUtils.checkBindValue(fakeEvent, fakeEvent.bindValue);
               assert.equal(warnMessage, '');
            });
            it('bind array of object with sub props wrong', () => {
               fakeEvent.data = {data: [{sub: {value: 0}, value: 0}, {type: {value: 0}, value: 0}, {type: 0}], anyProp: 0};
               fakeEvent.bindValue = 'data.sub.value';
               res = EventUtils.checkBindValue(fakeEvent, fakeEvent.bindValue);
               assert.include(warnMessage, 'Bind на несуществующее поле');
            });
            it('bind array of object wrong', () => {
               fakeEvent.data = {data: [{type: 0}], anyProp: 0};
               fakeEvent.bindValue = 'data.value';
               res = EventUtils.checkBindValue(fakeEvent, fakeEvent.bindValue);
               assert.include(warnMessage, 'Bind на несуществующее поле');
            });
         });
      });
   });
