export const moduleLinks = {
    'aaa/aaa': [],
    'css!aaa/bbb': [],
    'css!aaat/bbbt': [],
    'tmpl!aaa/ccc': [],
    'css!aaa/ddd': [],
    'css!aaat/dddt': [],
    'ccc/aaa': ['ccc/ccc', 'css'],
    'ccc/ccc': ['ddd/aaa'],
    'js/tmplDep': ['tmpl!tmplDep'],
    css: [],
    'ccc/bbb': [],
    'xxx/aaa': [],
    'tmpl!xxx/aaa': [],
    'ModuleWithLocalization/test': ['i18n!ModuleWithLocalization'],
    'ExternalModuleWithLocalization/test': ['i18n!ExternalModuleWithLocalization'],
    'Module/Name': ['External/Module', 'wml!External/Module'],
    'wml!External/Module': ['css!aaa/ddd'],
    'Recursive/Name': ['External/Recursive', 'wml!External/Recursive'],
    'wml!External/Recursive': ['css!Recursive/ddd'],
    'Feature/Name': ['FeatureModule/Feature'],
    'FeatureModule/Feature': ['FeatureDep/Feature'],
    'FeatureParentModule/Feature': ['FeatureParentDep/Feature'],
};

export const moduleNodes = {
    'css!aaa/ddd': { path: 'resources/aaa/ddd.min.css' },
    'xxx/aaa': { path: 'resources/xxx/aaa.min.js' },
    'tmpl!xxx/aaa': { path: 'resources/xxx/aaa.min.tmpl' },
};

export const bundlesRoute = {
    'aaa/aaa': 'resources/bdl/aaa.package.min.js',
    'css!aaa/bbb': 'resources/bdl/aaa.package.min.css',
    'css!aaat/bbbt': 'resources/bdl/aaat.package.min.css',
    'tmpl!aaa/ccc': 'resources/bdl/bbb.package.min.js',
    'vvv/aaa': 'resources/bdl/ccc.package.min.js',
    'vvv/bbb': 'resources/bdl/ccc.package.min.js',
    'ccc/aaa': 'resources/bdl/ddd.package.min.js',
    'ccc/ccc': 'resources/bdl/eee.package.min.js',
    'js/tmplDep': 'resources/jstmplbdl/tmpldep.package.min.js',
    css: 'resources/bdl/ggg.package.min.js',
    'ddd/aaa': 'resources/bdl/hhh.package.min.js',
    'xxx/aaa': 'resources/bdl/jjj.package.min.js',
    'tmpl!ppp/ppp': 'resources/bdl/tmplpckd.package.min.js',
    'css!Recursive/ddd': 'resources/bdl/Recursive.package.min.js',
    'Recursive/Name': 'resources/Recursive/Name.package.min.js',
    'External/Recursive': 'resources/External/Recursive.package.min.js',
};

export const optionalBundles = {
    'aaa/aaa': 'resources/bdl/optional-bundle-aaa.package.min.js',
    'vvv/aaa': 'resources/bdl/optional-bundle-ccc.package.min.js',
    'vvv/bbb': 'resources/bdl/optional-bundle-ccc.package.min.js',
};

export const features = {
    'FeatureModule/Feature': 'FeatureParentModule/Feature',
};
