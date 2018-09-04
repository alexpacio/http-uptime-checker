"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_windows_1 = require("node-windows");
let svc = new node_windows_1.Service({
    name: 'Http Uptime Checker',
    description: 'Checks if an HTTP service is up and fires an email alarm when down',
    script: 'C:\\http-uptime-checker\\dist\\index.js',
});
svc.on('install', function () {
    svc.start();
});
svc.on('alreadyinstalled', function () {
    svc.start();
});
svc.install();
