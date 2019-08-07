module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'entry',
                corejs: 3,
                debug: true,
                targets:{
                    chrome: "58",
                    ie: 11
                }
            }
        ]
    ]
};