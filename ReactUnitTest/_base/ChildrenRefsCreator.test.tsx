import { Control } from 'UICore/Base';
import { CreateChildrenRef } from 'UICore/Executor';
import ChildrenRefsCreator from 'UICore/_base/Control/ChildrenRefsCreator';

class TestChildrenRefsCreator extends ChildrenRefsCreator {
    getChildrenRefs(): Map<string, CreateChildrenRef[]> {
        return this._childrenRefs;
    }
}

describe('ChildrenRefsCreator', () => {
    let creator: TestChildrenRefsCreator;
    const childName = 'childName';

    beforeEach(() => {
        creator = new TestChildrenRefsCreator({} as Control);
    });

    afterEach(() => {
        creator = undefined;
        jest.clearAllMocks();
    });

    test("вызов createRef добавляет в список ref'ов", () => {
        creator.createRef(childName);
        creator.createRef(childName);

        const childrenRefs = creator.getChildrenRefs();

        expect(childrenRefs.get(childName).length).toBe(2);
    });

    test('вызов setChildrenDisabled делает обход всех объектов в списке и вызывает disable', () => {
        const disableSpy = jest
            .spyOn(CreateChildrenRef.prototype, 'disable')
            .mockName('disableSpy');
        creator.createRef(childName);
        creator.createRef(childName);

        creator.setChildrenDisabled(childName, true);

        expect(disableSpy).toBeCalledTimes(2);
    });

    test("вызов clear очищает список ref'ов", () => {
        creator.createRef(childName);
        creator.createRef(childName);

        creator.clear();

        const childrenRefs = creator.getChildrenRefs();

        expect(Array.isArray(childrenRefs.get(childName))).toBe(true);
        childrenRefs.get(childName)?.forEach((createChildrenRef) => {
            expect(createChildrenRef.getDisabled()).toBeFalsy();
        });
    });
});
