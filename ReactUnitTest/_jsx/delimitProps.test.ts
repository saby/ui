import { delimitProps } from 'UICore/Jsx';

describe('delimitProps', () => {
    describe('удаляется className из clearProps', () => {
        test('только если есть и в props и в props.attrs', () => {
            const props = {
                someProp: 'someProp',
                attrs: {
                    className: 'className',
                },
                className: 'className',
                fontSize: 'fontSize',
            };
            const { clearProps } = delimitProps(props);

            expect(clearProps).toStrictEqual(
                expect.objectContaining({
                    someProp: 'someProp',
                    attrs: undefined,
                    fontSize: 'fontSize',
                })
            );
        });

        test('не удаляется className, если его НЕТ в props.attrs', () => {
            const props = {
                someProp: 'someProp',
                attrs: {
                    fontSize: 'fontSize',
                },
                className: 'className',
            };
            const { clearProps } = delimitProps(props);

            expect(clearProps).toStrictEqual(
                expect.objectContaining({
                    someProp: 'someProp',
                    attrs: undefined,
                    className: 'className',
                })
            );
        });
    });
});
