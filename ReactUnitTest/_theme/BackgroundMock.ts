import { IBackground } from 'UI/Theme';

export const classNameMock = 'test-class';
export const propertiesMock = {
    logo: 'logo',
    picture: 'picture',
};
export const backgroundMock: IBackground = {
    background: '255,255,255',
    backgroundColor: '#ffffff',
    dominantColorRGB: '255,255,255',
    texture: 'path',
    image: {
        style: {
            type: 'original',
            value: 'default',
        },
        resource: {
            type: 'img/png',
            value: 'image.png',
            cropValue: '100',
            originalValue: '200',
        },
        name: 'test image',
        dominantColor: '#000000',
    },
    isLigthTheme: true,
};
