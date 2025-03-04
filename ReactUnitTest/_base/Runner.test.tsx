import { Runner } from 'UICore/_base/Control/Runner';
import { assert } from 'chai';

describe('Runner', () => {
    let GLOBAL_VALUE;
    function changeValue() {
        ++GLOBAL_VALUE;
    }
    let runner;
    beforeEach(function () {
        GLOBAL_VALUE = 0;
        runner = new Runner(changeValue);
    });

    afterEach(() => {
        runner = null;
        GLOBAL_VALUE = null;
    });

    it('start', () => {
        const EXPECTED_VALUE = 1;
        runner.exec();
        runner.exec();
        assert.equal(GLOBAL_VALUE, EXPECTED_VALUE);
    });

    it('reset', () => {
        const EXPECTED_VALUE = 2;
        runner.exec();
        runner.reset();
        runner.exec();
        assert.equal(GLOBAL_VALUE, EXPECTED_VALUE);
    });
});
