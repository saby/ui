import { Head } from 'Application/Page';
import { createMetaScriptsAndLinks } from 'UI/Head';
import * as Utils from 'UI/Utils';

describe('defaultTags', () => {
    const HeadAPI: Head = Head.getInstance();

    describe('createMetaScriptsAndLinks', () => {
        beforeEach(() => {
            jest.spyOn(Utils, 'getResourceUrl').mockImplementation((url: string) => {
                return url + '?version';
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('href у canonical link не портится ', () => {
            const params = {
                links: [{ rel: 'canonical', href: 'https://sbis.ru' }],
            };
            createMetaScriptsAndLinks(params);

            const data = HeadAPI.getData();
            expect(data[0][1]).toEqual(
                expect.objectContaining({ href: 'https://sbis.ru', rel: 'canonical' })
            );
        });
    });
});
