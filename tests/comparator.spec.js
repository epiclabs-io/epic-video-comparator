const evc = require('../src/index');
const screenfull = require('screenfull');

const config = {
    leftUrl: 'https://demo.unified-streaming.com/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    rightUrl: 'https://demo.unified-streaming.com/video/tears-of-steel/tears-of-steel.ism/.m3u8',
};
const video = document.createElement('video');


test('Comparator creation', () => {
    const evcInstance = new evc.Comparator(config, video);
    expect(evcInstance).toBeDefined();
    expect(evcInstance).toBeInstanceOf(evc.Comparator);
});
